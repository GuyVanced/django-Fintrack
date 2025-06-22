# fintrack_app/views/receiptView.py

import os, uuid
from datetime import datetime

from django.core.files.storage import default_storage
from django.core.files.base    import ContentFile

from rest_framework.views      import APIView
from rest_framework.parsers    import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response   import Response
from rest_framework            import status

from rest_framework.generics   import GenericAPIView
from fintrack_app.services.ocr.ocr_client import parse_receipt
from fintrack_app.serializers.receiptSR import ReceiptImageUploadSerializer
from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models.transaction import Transaction
from fintrack_app.models.account import Account
from fintrack_app.models.category import UserCategory

class ReceiptOCRAPIView(GenericAPIView):
    """
    Step 1: accept image → run OCR → return parsed data + receiptUrl
    """
    parser_classes   = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    serializer_class = ReceiptImageUploadSerializer

    def post(self, request):
        # 1) Validate upload
        ser = ReceiptImageUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        image_file = ser.validated_data['image']

        # 2) Save under media/images with unique name
        ext = os.path.splitext(image_file.name)[1]
        unique_name = f"{request.user.id}_{uuid.uuid4().hex}{ext}"
        save_path = os.path.join("images", unique_name)
        default_storage.save(save_path, ContentFile(image_file.read()))
        receipt_path = default_storage.url(save_path)

        # 3) OCR parse
        mime = image_file.content_type
        image_file.seek(0)
        ocr = parse_receipt(image_file.read(), mime)

        # 4) Return OCR payload + url, but DO NOT create Transaction yet
        return Response({
            "merchant" :     ocr.get("merchant"),
            "date":          ocr.get("date"),
            "total":         ocr.get("total"),
            "category":      ocr.get("category"),
            "completeness":  ocr.get("completeness"),
            "receiptPath":   receipt_path,
            "description":   ocr.get("description")
        }, status=status.HTTP_200_OK)


class TransactionCreateAPIView(APIView):
    """
    Step 2: receive confirmed form data → actually create the Transaction
    """
    parser_classes   = [JSONParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        raw  = request.data

        # 1) Ensure they sent an account_id
        if "account_id" not in raw:
            return Response(
                {"detail": "Missing required field: account_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2) Lookup that account & confirm it belongs to them
        try:
            account = Account.objects.get(id=raw['account_id'], user=user)
        except Account.DoesNotExist:
            return Response(
                {"detail": "Account not found or not yours."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 3) Parse their date into a datetime
        try:
            tx_date = datetime.strptime(raw['date'], "%Y-%m-%d")
        except (KeyError, ValueError):
            return Response(
                {"detail": "Invalid or missing date; expected YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4) Build the serializer payload
        #    We only ever create expenses from receipts:
        tx_type = Transaction.TransactionType.EXPENSE

        payload = {
            "account":          account.id,
            "transaction_type": tx_type,
            "category":         raw.get("category", ""),
            "amount":           raw.get("total"),
            "description":      raw.get("description", ""),
            "date":             tx_date,
            "receiptPath":      raw.get("receiptPath", ""),
        }

        # 5) Validate + save via our existing TransactionSerializer
        ser = TransactionSerializer(data=payload, context={"request": request})
        ser.is_valid(raise_exception=True)
        tx = ser.save()

        # 6) Return simple primitives only
        return Response({
            "id":          tx.id,
            "account_id":  tx.account.id,
            "transaction_type": tx.transaction_type,
            "category":    tx.category.name,
            "amount":      str(tx.amount),
            "description": tx.description,
            "date":        tx.date.isoformat(),
            "receiptPath": tx.receiptPath,
        }, status=status.HTTP_201_CREATED)
    

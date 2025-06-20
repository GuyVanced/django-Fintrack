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
from fintrack_app.models.category import Category

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
            "description":   ocr.get("description"),
            "date":          ocr.get("date"),
            "total":         ocr.get("total"),
            "category":      ocr.get("category"),
            "completeness":  ocr.get("completeness"),
            "receiptPath":    receipt_path,
        }, status=status.HTTP_200_OK)


class TransactionCreateAPIView(APIView):
    """
    Step 2: receive confirmed form data → actually create the Transaction
    """
    parser_classes   = [JSONParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        raw = request.data

        # ← ADD THIS BLOCK to catch a missing account_id
        if "account_id" not in raw:
            return Response(
                {"detail": "Missing required field: account_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # lookup account
        try:
            account = Account.objects.get(id=raw['account_id'], user=user)
        except Account.DoesNotExist:
            return Response(
                {"detail": "Account not found or not yours."},
                status=status.HTTP_404_NOT_FOUND
            )

        # lookup or create category
        # category, _ = Category.objects.get_or_create(
        #     user=user, category=raw['category']
        # )
        category = raw['category']
        # parse date into a datetime
        tx_date = datetime.strptime(raw['date'], "%Y-%m-%d")

        payload = {
            "user":        request.user.id,         
            "account":     raw["account_id"], 
            "transaction_type" : "Ex",    
            "category":    category,              
            "amount":      raw["total"],             
            "description": raw.get("description", ""),
            "date":        raw["date"],              
            "receiptPath":  raw["receiptPath"],
            
        }
        ser  = TransactionSerializer(data=payload, context={"request": request})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        tx= ser.save()
        # create the transaction
        # tx = Transaction.objects.create(
        #     user        = user,
        #     account     = account,
        #     category    = category_id,
        #     amount      = data['total'],
        #     description = data['description'],
        #     date        = tx_date,
        #     receiptUrl  = data['receiptUrl']
        # )

        return Response({
            "id":          tx.id,
            "description":    tx.description,
            "date":        tx.date.isoformat(),
            "amount":      str(tx.amount),
            "category":    tx.category,
            "receiptPath":  tx.receiptPath,
        }, status=status.HTTP_201_CREATED)
    

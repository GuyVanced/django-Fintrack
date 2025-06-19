import os
import uuid
from datetime import datetime

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from fintrack_app.services.ocr.ocr_client import parse_receipt
from fintrack_app.serializers.receipt import (
    ReceiptImageUploadSerializer,
    ReceiptSerializer
)
from fintrack_app.models.transaction import Transaction
from fintrack_app.models.account import Account
from fintrack_app.models.category import Category

class OCRReceiptAndCreateTransaction(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # 1) Validate image upload
        img_ser = ReceiptImageUploadSerializer(data=request.data)
        img_ser.is_valid(raise_exception=True)
        image_file = img_ser.validated_data['image']

        # 2) Save file under MEDIA_ROOT/images with a unique name
        ext = os.path.splitext(image_file.name)[1]
        unique_name = f"{user.id}_{uuid.uuid4().hex}{ext}"
        save_path = os.path.join("images", unique_name)
        default_storage.save(save_path, ContentFile(image_file.read()))
        receipt_url = default_storage.url(save_path)

        # 3) Run OCR
        mime = image_file.content_type
        image_file.seek(0)  # reset read pointer
        ocr_data = parse_receipt(image_file.read(), mime)

        # 4) Validate OCR output
        rec_ser = ReceiptSerializer(data=ocr_data)
        rec_ser.is_valid(raise_exception=True)
        data = rec_ser.validated_data

        # 5) Determine or override date
        date_str = data.get('date')
        if date_str:
            tx_date = datetime.strptime(date_str, "%Y-%m-%d")
        else:
            return Response(
                {"detail": "No date found in OCR output; please supply 'date' field."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 6) Lookup Account (must come in request data)
        acct_id = request.data.get('account_id')
        if not acct_id:
            return Response({"detail": "Missing 'account_id' in request."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            account = Account.objects.get(id=acct_id, user=user)
        except Account.DoesNotExist:
            return Response({"detail": "Account not found or not yours."},
                            status=status.HTTP_404_NOT_FOUND)

        # 7) Lookup Category (exact one, guaranteed valid by OCR + serializer)
        category_name = data['category']
        try:
            category = Category.objects.get(user=user, category__iexact=category_name)
        except Category.DoesNotExist:
            return Response(
                {"detail": f"Category '{category_name}' not found for this user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 8) Create the Transaction
        tx = Transaction.objects.create(
            user=user,
            account=account,
            category=category,
            amount=data['total'],
            description=data.get('merchant') or "",
            date=tx_date,
            receiptUrl=receipt_url
            # transaction_type defaults to EXPENSE
        )

        # 9) Return the serialized transaction
        return Response({
            "id": tx.id,
            "merchant": tx.description,
            "date": tx.date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "amount": str(tx.amount),
            "category": tx.category.category,
            "completeness": data['completeness'],
            "receiptUrl": receipt_url
        }, status=status.HTTP_201_CREATED)

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from ..services.ocr.client import parse_receipt
from ..serializers.reciept import ReceiptSerializer

class ReceiptUploadAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        image = request.FILES.get("image")
        if not image:
            return Response({"error":"No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data = parse_receipt(image.read(), image.content_type)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({"error": "OCR failed: "+str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = ReceiptSerializer(data=data)
        if not serializer.is_valid():
            return Response({"error":"Invalid OCR format","details":serializer.errors},
                            status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

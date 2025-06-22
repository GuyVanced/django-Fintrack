# fintrack_app/views/master_category.py

from rest_framework import generics, status
from rest_framework.response import Response
from fintrack_app.models.master_category import MasterCategory
from fintrack_app.serializers.master_category import MasterCategorySerializer

class MasterCategoryListCreateView(generics.ListCreateAPIView):
    """
    List and create MasterCategory instances.
    
    GET /api/master-categories/?transaction_type=Ex
    GET /api/master-categories/?transaction_type=In
    GET /api/master-categories/ (returns all)
    
    POST /api/master-categories/ (create new master category)
    """
    queryset = MasterCategory.objects.all()
    serializer_class = MasterCategorySerializer

    def get_queryset(self):
        """
        Filter queryset by transaction_type query parameter if provided.
        Valid values: 'In' (Income) or 'Ex' (Expense)
        """
        qs = super().get_queryset()
        tx_type = self.request.query_params.get('transaction_type')

        # Validate and filter by transaction type
        if tx_type:
            valid_types = [choice[0] for choice in MasterCategory.TransactionType.choices]
            if tx_type not in valid_types:
                # Return empty queryset for invalid transaction type
                return MasterCategory.objects.none()
            
            qs = qs.filter(transaction_type=tx_type)

        return qs.order_by('transaction_type', 'name')

    def list(self, request, *args, **kwargs):
        """
        Override list method to provide better response format
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add metadata to response
        response_data = {
            'count': queryset.count(),
            'transaction_type_filter': request.query_params.get('transaction_type'),
            'results': serializer.data
        }
        
        return Response(response_data)

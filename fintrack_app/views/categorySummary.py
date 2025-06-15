# # # from rest_framework.views import APIView
# # # from django.utils.dateparse import parse_datetime
# # # from fintrack_app.models import Transaction
# # # from rest_framework.response import Response
# # # from django.db.models import Sum

# # # class CategorySummaryView(APIView):
# # #     def get(self,request):
# # #         user=request.user
# # #         category=request.query_params.get('category')
# # #         transaction_type=request.query_params.get('transaction_type')
# # #         start_date=request.query_params.get('start_date')
# # #         end_date=request.query_params.get('end_date')


# # #         filters={'user':user}
# # #         if category:
# # #             filters['category']=category
# # #         if transaction_type:
# # #             filters['transaction_type']=transaction_type
# # #         if start_date:
# # #             filters['date__gte']=parse_datetime(start_date)
# # #         if end_date:
# # #             filters['date_lte']=parse_datetime(end_date)

# # # # '\' helps to go to next line
# # #         data=Transaction.objects.filter(**filters)\
# # #             .values('category')\
# # #                 .annotate(total=Sum('amount'))    

# # #         return Response(data)    


# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from django.utils.dateparse import parse_datetime
# # from datetime import datetime
# # from django.db.models import Sum
# # from fintrack_app.models import Transaction, CategoryTotal

# # class CombinedCategorySummaryView(APIView):
# #     def get(self, request):
# #         user = request.user
# #         category = request.query_params.get('category')
# #         transaction_type = request.query_params.get('transaction_type')
        
# #         start_date = request.query_params.get('start_date')
# #         end_date = request.query_params.get('end_date')

# #         # If date filtering is present, calculate dynamically from Transaction model
# #         if start_date or end_date:
# #             filters = {'user': user}
# #             if category:
# #                 filters['category'] = category
# #             if transaction_type:
# #                 filters['transaction_type'] = transaction_type
# #             if start_date:
# #                 start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
# #                 filters['date__date__gte'] = start_datetime.date()
# #             if end_date:
# #                 end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
# #                 filters['date__date__lte'] = end_datetime.date()

# #             data = (
# #                 Transaction.objects.filter(**filters)
# #                 .values('category')
# #                 .annotate(total=Sum('amount'))
# #             )
# #             return Response({"source": "transaction", "data": data})

# #         # If no date filtering, fetch from CategoryTotal model
# #         filters = {'user': user}
# #         if category:
# #             filters['category'] = category
# #         if transaction_type:
# #             filters['transaction_type'] = transaction_type

# #         totals = CategoryTotal.objects.filter(**filters).values('category', 'total_amount')
# #         return Response({"source": "category_total", "data": list(totals)})


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from django.utils.dateparse import parse_datetime
# from datetime import datetime
# from django.db.models import Sum
# from fintrack_app.models import Transaction, CategoryTotal
# class CombinedCategorySummaryView(APIView):
#     def get(self, request):
#         # Add debug prints
#         # print("Request params:", request.query_params)
#         # print("User:", request.user.id)
#         user=request.user
        
        

#         # user = request.user
#         category = request.query_params.get('category')
#         transaction_type = request.query_params.get('transaction_type')
#         start_date = request.query_params.get('start_date')
#         end_date = request.query_params.get('end_date')

#         # Debug the parsed parameters
#         print("Parsed params:", {
#             'category': category,
#             'transaction_type': transaction_type,
#             'start_date': start_date,
#             'end_date': end_date
#         })

#         if start_date or end_date:
#             # filters={}
#             # filters = {'user': user}
#             if category:
#                 filters['category'] = category
#             if transaction_type:
#                 filters['transaction_type'] = transaction_type
#             if start_date:
#                 start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
#                 filters['date__date__gte'] = start_datetime.date()
#             if end_date:
#                 end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
#                 filters['date__date__lte'] = end_datetime.date()

#             # Debug the filters and query
#             # print("Applied filters:", filters)
#             data = (
#                 Transaction.objects.filter(**filters)
#                 .values('category')
#                 .annotate(total=Sum('amount'))
#             )
#             # print("SQL Query:", data.query)
#             # print("Result count:", data.count())
            
#             return Response({"source": "transaction", "data": data})
        
#         # If no date filtering, fetch from CategoryTotal model
        
#         filters = {'user': user}
        
#         if category:
#             filters['category'] = category
#         if transaction_type:
#             filters['transaction_type'] = transaction_type

#         totals = CategoryTotal.objects.filter(**filters).values('category', 'total_amount')
#         return Response({"source": "category_total", "data": list(totals)})

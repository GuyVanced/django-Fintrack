from django.urls import path,include
# from .views import UserView, AccountListView,AccountRetrieveUpdateDestroyView
from .views import  AccountListCreateView,AccountRetrieveUpdateDestroyView,TransactionListCreateView,TransactionRetrieveUpdateDestroyView,BudgetListCreateView,BudgetRetrieveUpdateDestroyView,CombinedCategorySummaryView

urlpatterns = [
    path('dj-rest-auth/',include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/',include('dj_rest_auth.registration.urls')),
    # path('users/',UserView.as_view(),name='user'),
    path('accounts/',AccountListCreateView.as_view(),name='allaccounts'),
    path('accounts/<int:id>/',AccountRetrieveUpdateDestroyView.as_view(),name='account-detail'),
    path('transactions/',TransactionListCreateView.as_view(),name='alltransactions'),
    path('transactions/<int:id>/',TransactionRetrieveUpdateDestroyView.as_view(),name='transaction-detail'),
    path('transactions/category-summary/',CombinedCategorySummaryView.as_view(),name='category-summary'),
    path('budgets/',BudgetListCreateView.as_view(),name='allbudgets'),
    path('budgets/<int:id>/',BudgetRetrieveUpdateDestroyView.as_view(),name='budget-detail'),


    ]
from django.test import TestCase
from fintrack_app.models import Transaction, Account, MasterCategory, UserCategory
from fintrack_app.serializers.transaction import TransactionSerializer
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class TransactionAmountValidationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.account = Account.objects.create(user=self.user, name='Test Account', balance=1000)
        self.master_category = MasterCategory.objects.create(name='Test Category', transaction_type=Transaction.TransactionType.EXPENSE)
        self.user_category = UserCategory.objects.create(user=self.user, master_category=self.master_category, total_amount=0)

    def test_negative_transaction_amount_not_allowed(self):
        data = {
            'transaction_type': Transaction.TransactionType.EXPENSE,
            'account': self.account.id,
            'category': self.master_category.name,
            'amount': -50.00,
            'description': 'Negative amount test',
            'date': datetime.now(),
            'receiptPath': '',
            'isRecurring': False,
            'recurringInterval': '',
            'nextRecurringDate': None,
            'lastProcessedDate': None,
        }
        serializer = TransactionSerializer(data=data, context={'request': self._get_request_with_user(self.user)})
        self.assertFalse(serializer.is_valid())
        self.assertIn('amount', serializer.errors)
        self.assertEqual(serializer.errors['amount'][0], 'Amount cannot be negative.')

    def _get_request_with_user(self, user):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/api/transactions/')
        request.user = user
        return request
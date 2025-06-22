# fintrack_app/migrations/0002_seed_master_categories.py

from django.db import migrations

def seed_master_categories(apps, schema_editor):
    MasterCategory = apps.get_model('fintrack_app', 'MasterCategory')
    # split the names by transaction type
    income_names = ['Salary', 'Investments', 'Freelance', 'Others']
    expense_names = [
        'Food', 'Housing', 'Groceries', 'Electronics',
        'Transportation', 'Dining', 'Healthcare', 'Shopping',
        'Entertainment', 'Utilities', 'Other'
    ]

    # create or update each row
    for name in income_names:
        MasterCategory.objects.update_or_create(
            transaction_type='In',
            name=name
        )
    for name in expense_names:
        MasterCategory.objects.update_or_create(
            transaction_type='Ex',
            name=name
        )

class Migration(migrations.Migration):

    dependencies = [
        ('fintrack_app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_master_categories),
    ]

# FinTrack API Documentation

## Overview

FinTrack is a personal finance tracking application built with Django and Django REST Framework. The application enables users to manage financial accounts, track income and expenses, set and monitor budgets, categorize transactions, generate monthly financial insights, and process receipt images via OCR.

## Base URL

All API endpoints are relative to: `/api/`

## Authentication

The API uses token-based authentication provided by `dj-rest-auth`.

### Authentication Endpoints

#### Register New User
- **URL**: `/dj-rest-auth/registration/`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password1": "securePassword123",
    "password2": "securePassword123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "key": "auth_token_string"
  }
  ```

#### Login
- **URL**: `/dj-rest-auth/login/`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securePassword123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "key": "auth_token_string"
  }
  ```

#### Logout
- **URL**: `/dj-rest-auth/logout/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**: None
- **Success Response**: `200 OK`
  ```json
  {
    "detail": "Successfully logged out."
  }
  ```

## Accounts

### Account Model Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| user | ForeignKey | Reference to User |
| account_type | String | Type of account (BA=Bank, CC=Credit Card, etc.) |
| name | String | Name of the account |
| account_number | String | Account number (optional) |
| institution | String | Financial institution name (optional) |
| balance | Decimal | Current balance |
| updated_at | DateTime | Last update timestamp |
| created_at | DateTime | Creation timestamp |

### List All Accounts
- **URL**: `/accounts/`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "user": 1,
      "account_type": "BA",
      "name": "Checking Account",
      "account_number": "XXX-XXX-1234",
      "institution": "Bank of Example",
      "balance": "5000.00",
      "updated_at": "2023-06-20T18:25:43.511Z",
      "created_at": "2023-06-01T10:15:30.000Z"
    }
  ]
  ```

### Create Account
- **URL**: `/accounts/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "account_type": "BA",
    "name": "Savings Account",
    "account_number": "XXX-XXX-5678",
    "institution": "Bank of Example",
    "balance": "10000.00"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 3,
    "user": 1,
    "account_type": "BA",
    "name": "Savings Account",
    "account_number": "XXX-XXX-5678",
    "institution": "Bank of Example",
    "balance": "10000.00",
    "updated_at": "2023-06-21T09:00:00.000Z",
    "created_at": "2023-06-21T09:00:00.000Z"
  }
  ```

### Get Account Details
- **URL**: `/accounts/{id}/`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (account ID)
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "account_type": "BA",
    "name": "Checking Account",
    "account_number": "XXX-XXX-1234",
    "institution": "Bank of Example",
    "balance": "5000.00",
    "updated_at": "2023-06-20T18:25:43.511Z",
    "created_at": "2023-06-01T10:15:30.000Z"
  }
  ```

### Update Account
- **URL**: `/accounts/{id}/`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (account ID)
- **Request Body**:
  ```json
  {
    "account_type": "BA",
    "name": "Primary Checking",
    "account_number": "XXX-XXX-1234",
    "institution": "Bank of Example",
    "balance": "5250.00"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "account_type": "BA",
    "name": "Primary Checking",
    "account_number": "XXX-XXX-1234",
    "institution": "Bank of Example",
    "balance": "5250.00",
    "updated_at": "2023-06-21T09:05:43.511Z",
    "created_at": "2023-06-01T10:15:30.000Z"
  }
  ```

### Partial Update Account
- **URL**: `/accounts/{id}/`
- **Method**: `PATCH`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (account ID)
- **Request Body**:
  ```json
  {
    "name": "Primary Checking"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "account_type": "BA",
    "name": "Primary Checking",
    "account_number": "XXX-XXX-1234",
    "institution": "Bank of Example",
    "balance": "5000.00",
    "updated_at": "2023-06-21T09:05:43.511Z",
    "created_at": "2023-06-01T10:15:30.000Z"
  }
  ```

### Delete Account
- **URL**: `/accounts/{id}/`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (account ID)
- **Success Response**: `204 No Content`

## Transactions

### Transaction Model Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| user | ForeignKey | Reference to User |
| transaction_type | String | Type of transaction (IN=Income, EX=Expense) |
| account | ForeignKey | Reference to Account |
| category | ForeignKey | Reference to MasterCategory |
| amount | Decimal | Transaction amount |
| description | String | Transaction description |
| date | DateTime | Transaction date and time |
| receiptPath | String | Path to receipt image (if any) |
| isRecurring | Boolean | Whether the transaction recurs |
| recurringInterval | String | Interval for recurring transactions |
| nextRecurringDate | DateTime | Next date for recurring transaction |
| lastProcessedDate | DateTime | Last processing date for recurring transaction |
| createdAt | DateTime | Creation timestamp |

### List All Transactions
- **URL**: `/transactions/`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "user": 1,
      "transaction_type": "EX",
      "account": 1,
      "category": 5,
      "amount": "120.50",
      "description": "Weekly grocery shopping",
      "date": "2023-06-15T14:30:00Z",
      "receiptPath": "",
      "isRecurring": false,
      "recurringInterval": "",
      "nextRecurringDate": null,
      "lastProcessedDate": null,
      "createdAt": "2023-06-15T14:35:00Z"
    }
  ]
  ```

### Create Transaction
- **URL**: `/transactions/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "transaction_type": "EX",
    "account": 1,
    "category": 6,
    "amount": "55.99",
    "description": "Dinner at restaurant",
    "date": "2023-06-20T19:30:00Z",
    "isRecurring": false
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 3,
    "user": 1,
    "transaction_type": "EX",
    "account": 1,
    "category": 6,
    "amount": "55.99",
    "description": "Dinner at restaurant",
    "date": "2023-06-20T19:30:00Z",
    "receiptPath": "",
    "isRecurring": false,
    "recurringInterval": "",
    "nextRecurringDate": null,
    "lastProcessedDate": null,
    "createdAt": "2023-06-21T09:10:00Z"
  }
  ```

### Get Transaction Details
- **URL**: `/transactions/{id}/`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (transaction ID)
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "transaction_type": "EX",
    "account": 1,
    "category": 5,
    "amount": "120.50",
    "description": "Weekly grocery shopping",
    "date": "2023-06-15T14:30:00Z",
    "receiptPath": "",
    "isRecurring": false,
    "recurringInterval": "",
    "nextRecurringDate": null,
    "lastProcessedDate": null,
    "createdAt": "2023-06-15T14:35:00Z"
  }
  ```

### Update Transaction
- **URL**: `/transactions/{id}/`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (transaction ID)
- **Request Body**:
  ```json
  {
    "transaction_type": "EX",
    "account": 1,
    "category": 5,
    "amount": "125.75",
    "description": "Updated weekly grocery shopping",
    "date": "2023-06-15T14:30:00Z",
    "isRecurring": false
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "transaction_type": "EX",
    "account": 1,
    "category": 5,
    "amount": "125.75",
    "description": "Updated weekly grocery shopping",
    "date": "2023-06-15T14:30:00Z",
    "receiptPath": "",
    "isRecurring": false,
    "recurringInterval": "",
    "nextRecurringDate": null,
    "lastProcessedDate": null,
    "createdAt": "2023-06-15T14:35:00Z"
  }
  ```

### Partial Update Transaction
- **URL**: `/transactions/{id}/`
- **Method**: `PATCH`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (transaction ID)
- **Request Body**:
  ```json
  {
    "amount": "125.75",
    "description": "Updated weekly grocery shopping"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "transaction_type": "EX",
    "account": 1,
    "category": 5,
    "amount": "125.75",
    "description": "Updated weekly grocery shopping",
    "date": "2023-06-15T14:30:00Z",
    "receiptPath": "",
    "isRecurring": false,
    "recurringInterval": "",
    "nextRecurringDate": null,
    "lastProcessedDate": null,
    "createdAt": "2023-06-15T14:35:00Z"
  }
  ```

### Delete Transaction
- **URL**: `/transactions/{id}/`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (transaction ID)
- **Success Response**: `204 No Content`

## Budgets

### Budget Model Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| user | ForeignKey | Reference to User |
| category | ForeignKey | Reference to UserCategory |
| budget_amount | Decimal | Budget amount |
| is_exceed | Boolean | Whether budget is exceeded |
| createdAt | DateTime | Creation timestamp |
| last_reset | DateTime | Last reset timestamp |

### List All Budgets
- **URL**: `/budgets/`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "user": 1,
      "category": 5,
      "budget_amount": "500.00",
      "is_exceed": false,
      "createdAt": "2023-06-01T10:30:00Z",
      "last_reset": "2023-06-01T00:00:00Z"
    }
  ]
  ```

### Create Budget
- **URL**: `/budgets/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "category": 7,
    "budget_amount": "200.00"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 3,
    "user": 1,
    "category": 7,
    "budget_amount": "200.00",
    "is_exceed": false,
    "createdAt": "2023-06-21T09:15:00Z",
    "last_reset": "2023-06-21T00:00:00Z"
  }
  ```

### Get Budget Details
- **URL**: `/budgets/{id}/`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (budget ID)
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "category": 5,
    "budget_amount": "500.00",
    "is_exceed": false,
    "createdAt": "2023-06-01T10:30:00Z",
    "last_reset": "2023-06-01T00:00:00Z"
  }
  ```

### Update Budget
- **URL**: `/budgets/{id}/`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (budget ID)
- **Request Body**:
  ```json
  {
    "category": 5,
    "budget_amount": "550.00"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "category": 5,
    "budget_amount": "550.00",
    "is_exceed": false,
    "createdAt": "2023-06-01T10:30:00Z",
    "last_reset": "2023-06-01T00:00:00Z"
  }
  ```

### Partial Update Budget
- **URL**: `/budgets/{id}/`
- **Method**: `PATCH`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (budget ID)
- **Request Body**:
  ```json
  {
    "budget_amount": "550.00"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "category": 5,
    "budget_amount": "550.00",
    "is_exceed": false,
    "createdAt": "2023-06-01T10:30:00Z",
    "last_reset": "2023-06-01T00:00:00Z"
  }
  ```

### Delete Budget
- **URL**: `/budgets/{id}/`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (budget ID)
- **Success Response**: `204 No Content`

## Categories

### MasterCategory Model Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| transaction_type | String | Type of transaction (IN=Income, EX=Expense) |
| name | String | Category name (e.g., GROCERIES, SALARY) |

### UserCategory Model Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| user | ForeignKey | Reference to User |
| master_category | ForeignKey | Reference to MasterCategory |
| total_amount | Decimal | Total amount in this category |

### List User Categories
- **URL**: `/category/`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**: `transaction_type=[string]` (optional - filter by transaction type)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "user": 1,
      "master_category": 5,
      "total_amount": "250.75",
      "master_category_details": {
        "id": 5,
        "transaction_type": "EX",
        "name": "GROCERIES"
      }
    }
  ]
  ```

### Create User Category
- **URL**: `/category/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "master_category": 7
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 3,
    "user": 1,
    "master_category": 7,
    "total_amount": "0.00",
    "master_category_details": {
      "id": 7,
      "transaction_type": "EX",
      "name": "ENTERTAINMENT"
    }
  }
  ```

### Get User Category Details
- **URL**: `/category/{id}/`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (category ID)
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "master_category": 5,
    "total_amount": "250.75",
    "master_category_details": {
      "id": 5,
      "transaction_type": "EX",
      "name": "GROCERIES"
    }
  }
  ```

### Update User Category
- **URL**: `/category/{id}/`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (category ID)
- **Request Body**:
  ```json
  {
    "master_category": 8
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "user": 1,
    "master_category": 8,
    "total_amount": "0.00",
    "master_category_details": {
      "id": 8,
      "transaction_type": "EX",
      "name": "UTILITIES"
    }
  }
  ```

### Delete User Category
- **URL**: `/category/{id}/`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[integer]` (category ID)
- **Success Response**: `204 No Content`

### List Master Categories
- **URL**: `/master-categories/`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "transaction_type": "IN",
      "name": "SALARY"
    },
    {
      "id": 5,
      "transaction_type": "EX",
      "name": "GROCERIES"
    }
  ]
  ```

## AI Features

### Monthly Insights Model Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| user | ForeignKey | Reference to User |
| period_start | Date | Start of period for insights |
| period_end | Date | End of period for insights |
| prompt_payload | JSON | Prompt data for LLM |
| llm_response | Text | Response from LLM |
| created_at | DateTime | Creation timestamp |

### Generate Monthly Insights
- **URL**: `/ai/insights/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "start_date": "2023-05-01",
    "end_date": "2023-05-31"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "user": 1,
    "period_start": "2023-05-01",
    "period_end": "2023-05-31",
    "llm_response": "Based on your May 2023 transactions:\n\n1. Your highest expense category was Groceries at $450.75\n2. You spent 15% more on dining compared to April\n3. Your savings rate was 20% of your income\n4. Recommendation: Consider reducing entertainment expenses which were $120 over budget",
    "created_at": "2023-06-21T09:20:00Z"
  }
  ```

### Process Receipt via OCR
- **URL**: `/ai/receipt/process`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**: `multipart/form-data` with image file
- **Success Response**: `200 OK`
  ```json
  {
    "merchant": "GROCERY MART",
    "date": "2023-06-20",
    "total_amount": "78.45",
    "items": [
      {"name": "Milk", "price": "4.99"},
      {"name": "Bread", "price": "3.49"},
      {"name": "Eggs", "price": "5.99"},
      {"name": "Vegetables", "price": "12.75"}
    ],
    "receipt_id": "OCR-2023-06-21-001",
    "category_suggestion": "GROCERIES"
  }
  ```

### Create Transaction from Receipt
- **URL**: `/ai/receipt/create`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "merchant": "GROCERY MART",
    "date": "2023-06-20",
    "total_amount": "78.45",
    "receipt_id": "OCR-2023-06-21-001",
    "account": 1,
    "category": 5
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 4,
    "user": 1,
    "transaction_type": "EX",
    "account": 1,
    "category": 5,
    "amount": "78.45",
    "description": "GROCERY MART",
    "date": "2023-06-20T00:00:00Z",
    "receiptPath": "receipts/OCR-2023-06-21-001.jpg",
    "isRecurring": false,
    "recurringInterval": "",
    "nextRecurringDate": null,
    "lastProcessedDate": null,
    "createdAt": "2023-06-21T09:25:00Z"
  }
  ```

## Error Responses

### Common Error Codes
| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Not authorized to access the resource |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "detail": "Error message"
}
```

or

```json
{
  "field_name": [
    "Error message"
  ]
}
```

## Pagination

For endpoints that return lists, the API supports pagination.

### Pagination Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| page | Integer | Page number |
| page_size | Integer | Number of items per page |

### Pagination Response Format
```json
{
  "count": 100,
  "next": "http://example.com/api/resource/?page=3",
  "previous": "http://example.com/api/resource/?page=1",
  "results": [
    // items
  ]
}
```

## Filtering

Many list endpoints support filtering.

### Common Filter Parameters
| Endpoint | Parameter | Example |
|----------|-----------|---------|
| `/transactions/` | `date__gte` | `/api/transactions/?date__gte=2023-06-01` |
| `/transactions/` | `date__lte` | `/api/transactions/?date__lte=2023-06-30` |
| `/transactions/` | `transaction_type` | `/api/transactions/?transaction_type=EX` |
| `/category/` | `transaction_type` | `/api/category/?transaction_type=EX` |

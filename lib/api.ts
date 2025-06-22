const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Enhanced types based on the new API documentation
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  key: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

// Account types from the API
export type AccountType = "BA" | "SV" | "CC" | "IN" | "LO" | "AS" | "CR";

export interface Account {
  id: number;
  account_type: AccountType;
  name: string;
  account_number?: string;
  institution?: string;
  balance: string;
  updated_at: string;
  created_at: string;
}

export interface CreateAccountData {
  account_type: AccountType;
  name: string;
  account_number?: string;
  institution?: string;
  balance: number;
}

// Enhanced transaction types
export type TransactionType = "In" | "Ex";

export interface Transaction {
  id: number;
  transaction_type: TransactionType;
  account: number;
  category: number;
  amount: string;
  description: string;
  date: string;
  receiptPath: string;
  isRecurring: boolean;
  recurringInterval: string;
  nextRecurringDate?: string;
  lastProcessedDate?: string;
  createdAt: string;
}

export interface CreateTransactionData {
  transaction_type: TransactionType;
  account: number;
  category: string;
  amount: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: string;
}

// Enhanced category system
export interface MasterCategory {
  id: number;
  transaction_type: TransactionType;
  name: string;
}

export interface UserCategory {
  id: number;
  master_category: MasterCategory;
  total_amount: string;
}

export interface CreateUserCategoryData {
  master_category_id: number;
}

// Budget interface
export interface Budget {
  id: number;
  budget_amount: string;
  is_exceed: boolean;
  category: number;
  createdAt?: string;
  last_reset?: string;
}

export interface CreateBudgetData {
  master_category: number;
  budget_amount: string;
}

// AI Features
export interface InsightRequest {
  year: string;
  month: string;
}

export interface InsightResponse {
  period_start: string;
  period_end: string;
  llm_response: string;
  created_at: string;
}

export interface ReceiptProcessResponse {
  merchant: string;
  date: string;
  total: number;
  category: string;
  completeness: number;
  receiptPath: string;
  description: string;
}

export interface CreateTransactionFromReceiptData {
  description: string;
  transaction_type: TransactionType;
  account_id: number;
  date: string;
  total: number;
  category: string;
  receiptPath: string;
}

// Pagination interface
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filter interfaces matching PDF API documentation
export interface TransactionFilters {
  date__gte?: string; // Greater than or equal date filter
  date__lte?: string; // Less than or equal date filter
  transaction_type?: TransactionType; // Filter by income/expense
  account?: number; // Filter by account ID
  category?: number; // Filter by category ID
  page?: number; // Pagination
  page_size?: number; // Items per page
  search?: string; // Search in description
  amount__gte?: number; // Minimum amount
  amount__lte?: number; // Maximum amount
  isRecurring?: boolean; // Filter recurring transactions
}

export interface CategoryFilters {
  transaction_type?: TransactionType; // Filter by income/expense categories
  page?: number;
  page_size?: number;
  search?: string; // Search category names
}

export interface AccountFilters {
  account_type?: AccountType;
  page?: number;
  page_size?: number;
  search?: string; // Search account names
  institution?: string; // Filter by institution
}

export interface BudgetFilters {
  category?: number; // Filter by category
  is_exceed?: boolean; // Filter exceeded budgets
  page?: number;
  page_size?: number;
}

export interface InsightFilters {
  year: number;
  month: number;
}

// API Client Class
class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = null;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Token ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        let errorMessage = "An unknown error occurred. Please try again.";
        try {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object' && errorData !== null) {
            const messages = Object.entries(errorData).map(([key, value]) => {
              const fieldName = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
              const errorMessages = Array.isArray(value) ? value.join(' ') : String(value);
              return `${fieldName}: ${errorMessages}`;
            });
            if (messages.length > 0) {
              errorMessage = messages.join('; ');
            }
          }
        } catch (e) {
            // Ignore parsing error, use default message
        }
        
        throw new Error(errorMessage);
      }

      // Handle cases where the response is empty (e.g., 204 No Content)
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/dj-rest-auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.setToken(response.key);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/dj-rest-auth/registration/",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    this.setToken(response.key);
    return response;
  }

  async logout(): Promise<void> {
    await this.request("/dj-rest-auth/logout/", {
      method: "POST",
    });
    this.clearToken();
  }

  // Accounts with enhanced filtering
  async getAccounts(
    filters?: AccountFilters,
  ): Promise<PaginatedResponse<Account> | Account[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    const endpoint = `/accounts/${queryString ? `?${queryString}` : ""}`;
    return this.request<PaginatedResponse<Account> | Account[]>(endpoint);
  }

  async getAccount(id: number): Promise<Account> {
    try {
      return this.request<Account>(`/accounts/${id}/`);
    } catch (error) {
      console.error(`Failed to get account ${id}:`, error);
      throw error;
    }
  }

  async createAccount(data: CreateAccountData): Promise<Account> {
    return this.request<Account>("/accounts/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAccount(
    id: number,
    data: Partial<CreateAccountData>,
  ): Promise<Account> {
    return this.request<Account>(`/accounts/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async partialUpdateAccount(
    id: number,
    data: Partial<CreateAccountData>,
  ): Promise<Account> {
    return this.request<Account>(`/accounts/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: number): Promise<void> {
    return this.request(`/accounts/${id}/`, {
      method: "DELETE",
    });
  }

  // Transactions with filtering
  async getTransactions(
    filters?: TransactionFilters,
  ): Promise<PaginatedResponse<Transaction> | Transaction[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    const endpoint = `/transactions/${queryString ? `?${queryString}` : ""}`;
    return this.request<PaginatedResponse<Transaction> | Transaction[]>(
      endpoint,
    );
  }

  async getTransaction(id: number): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}/`);
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    return this.request<Transaction>("/transactions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(
    id: number,
    data: Partial<CreateTransactionData>,
  ): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async partialUpdateTransaction(
    id: number,
    data: Partial<CreateTransactionData>,
  ): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: number): Promise<void> {
    return this.request(`/transactions/${id}/`, {
      method: "DELETE",
    });
  }

  // Categories with filtering
  async getUserCategories(
    filters?: CategoryFilters,
  ): Promise<PaginatedResponse<UserCategory> | UserCategory[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    const endpoint = `/category/${queryString ? `?${queryString}` : ""}`;
    return this.request<PaginatedResponse<UserCategory> | UserCategory[]>(
      endpoint,
    );
  }

  async getUserCategory(id: number): Promise<UserCategory> {
    return this.request<UserCategory>(`/category/${id}/`);
  }

  async createUserCategory(
    data: CreateUserCategoryData,
  ): Promise<UserCategory> {
    return this.request<UserCategory>("/category/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUserCategory(
    id: number,
    data: Partial<CreateUserCategoryData>,
  ): Promise<UserCategory> {
    return this.request<UserCategory>(`/category/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUserCategory(id: number): Promise<void> {
    return this.request(`/category/${id}/`, {
      method: "DELETE",
    });
  }

  // Master Categories with filtering
  async getMasterCategories(
    transactionType?: TransactionType,
  ): Promise<PaginatedResponse<MasterCategory>> {
    const queryString = transactionType
      ? this.buildQueryString({ transaction_type: transactionType })
      : "";
    const endpoint = `/master-categories/${queryString ? `?${queryString}` : ""}`;
    return this.request<PaginatedResponse<MasterCategory>>(endpoint);
  }

  // Get master category by ID
  async getMasterCategory(id: number): Promise<MasterCategory> {
    return this.request<MasterCategory>(`/master-categories/${id}/`);
  }

  // Budgets with filtering
  async getBudgets(
    filters?: BudgetFilters,
  ): Promise<PaginatedResponse<Budget> | Budget[]> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    const endpoint = `/budgets/${queryString ? `?${queryString}` : ""}`;
    return this.request<PaginatedResponse<Budget> | Budget[]>(endpoint);
  }

  async getBudget(id: number): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}/`);
  }

  async createBudget(data: CreateBudgetData): Promise<Budget> {
    return this.request<Budget>("/budgets/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBudget(
    id: number,
    data: Partial<CreateBudgetData>,
  ): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async partialUpdateBudget(
    id: number,
    data: Partial<CreateBudgetData>,
  ): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(id: number): Promise<void> {
    return this.request(`/budgets/${id}/`, {
      method: "DELETE",
    });
  }

  // AI Insights
  async generateInsights(data: InsightRequest): Promise<InsightResponse> {
    return this.request<InsightResponse>("/ai/insights/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get financial statistics/summary
  async getFinancialSummary(filters?: {
    start_date?: string;
    end_date?: string;
    account?: number;
  }): Promise<{
    total_income: number;
    total_expenses: number;
    net_income: number;
    account_balances: Record<string, number>;
    category_breakdown: Record<string, number>;
  }> {
    const queryString = filters ? this.buildQueryString(filters) : "";
    const endpoint = `/financial-summary/${queryString ? `?${queryString}` : ""}`;
    return this.request(endpoint);
  }

  // Get spending trends
  async getSpendingTrends(filters?: {
    period?: "monthly" | "weekly" | "daily";
    start_date?: string;
    end_date?: string;
  }): Promise<
    Array<{
      period: string;
      income: number;
      expenses: number;
      net: number;
    }>
  > {
    const queryString = filters ? this.buildQueryString(filters) : "";
    const endpoint = `/spending-trends/${queryString ? `?${queryString}` : ""}`;
    return this.request(endpoint);
  }

  // Receipt Processing
  async processReceipt(imageFile: File): Promise<ReceiptProcessResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const url = `${this.baseURL}/api/ai/receipt/process`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers["Authorization"] = `Token ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to process receipt");
    }
  }

  async createTransactionFromReceipt(
    data: CreateTransactionFromReceiptData,
  ): Promise<Transaction> {
    return this.request<Transaction>("/ai/receipt/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient();

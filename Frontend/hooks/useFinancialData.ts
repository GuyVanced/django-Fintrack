"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  AccountFilters,
  TransactionFilters,
  CategoryFilters,
  BudgetFilters,
  Account,
  Transaction,
  UserCategory,
  Budget,
  MasterCategory,
  TransactionType,
  CreateAccountData,
  CreateTransactionData,
  CreateBudgetData,
} from "@/lib/api";

// Query Keys
export const QUERY_KEYS = {
  accounts: (filters?: AccountFilters) => ["accounts", filters],
  account: (id: number) => ["accounts", id],
  transactions: (filters?: TransactionFilters) => ["transactions", filters],
  transaction: (id: number) => ["transactions", id],
  userCategories: (filters?: CategoryFilters) => ["userCategories", filters],
  masterCategories: (type?: TransactionType) => ["masterCategories", type],
  budgets: (filters?: BudgetFilters) => ["budgets", filters],
  budget: (id: number) => ["budgets", id],
  financialSummary: (filters?: any) => ["financialSummary", filters],
  spendingTrends: (filters?: any) => ["spendingTrends", filters],
  insights: ["insights"],
} as const;

// Accounts Hooks
export function useAccounts(filters?: AccountFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.accounts(filters),
    queryFn: () => apiClient.getAccounts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.account(id),
    queryFn: () => apiClient.getAccount(id),
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountData) => apiClient.createAccount(data),
    onSuccess: () => {
      // Invalidate accounts queries
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateAccountData>;
    }) => apiClient.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

// Transactions Hooks
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(filters),
    queryFn: () => apiClient.getTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.transaction(id),
    queryFn: () => apiClient.getTransaction(id),
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      apiClient.createTransaction(data),
    onSuccess: async () => {
      // First, refetch categories and accounts and wait for them to complete
      // to ensure lookup data is fresh before the transaction list renders.
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["userCategories"] }),
        queryClient.refetchQueries({ queryKey: ["accounts"] }),
      ]);

      // Now, refetch the main transaction list and other dependent data.
      queryClient.refetchQueries({ queryKey: ["transactions"] });
      queryClient.refetchQueries({ queryKey: ["budgets"] });
      queryClient.refetchQueries({ queryKey: ["financialSummary"] });
      queryClient.refetchQueries({ queryKey: ["spendingTrends"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateTransactionData>;
    }) => apiClient.updateTransaction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["userCategories"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["userCategories"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

// Categories Hooks
export function useUserCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.userCategories(filters),
    queryFn: () => apiClient.getUserCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

export function useMasterCategories(transactionType?: TransactionType) {
  return useQuery({
    queryKey: QUERY_KEYS.masterCategories(transactionType),
    queryFn: () => apiClient.getMasterCategories(transactionType),
    enabled: !!transactionType,
    staleTime: 30 * 60 * 1000, // 30 minutes - master categories don't change often
    retry: 1,
  });
}

export function useCreateUserCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { master_category_id: number }) =>
      apiClient.createUserCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCategories"] });
    },
  });
}

export function useDeleteUserCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteUserCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCategories"] });
    },
  });
}

// Budgets Hooks
export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.budgets(filters),
    queryFn: () => apiClient.getBudgets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.budget(id),
    queryFn: () => apiClient.getBudget(id),
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetData) => apiClient.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateBudgetData>;
    }) => apiClient.updateBudget(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

// Financial Summary and Analytics
export function useFinancialSummary(filters?: {
  start_date?: string;
  end_date?: string;
  account?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.financialSummary(filters),
    queryFn: () => apiClient.getFinancialSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useSpendingTrends(filters?: {
  period?: "monthly" | "weekly" | "daily";
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.spendingTrends(filters),
    queryFn: () => apiClient.getSpendingTrends(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// AI Insights
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { year: string; month: string }) =>
      apiClient.generateInsights(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insights });
    },
  });
}

export function useDeleteInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteInsight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insights });
    },
  });
}

// Receipt Processing
export function useProcessReceipt() {
  return useMutation({
    mutationFn: (file: File) => apiClient.processReceipt(file),
  });
}

export function useCreateTransactionFromReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createTransactionFromReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["userCategories"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useInsights() {
  return useQuery({
    queryKey: QUERY_KEYS.insights,
    queryFn: () => apiClient.getInsights(),
  });
}

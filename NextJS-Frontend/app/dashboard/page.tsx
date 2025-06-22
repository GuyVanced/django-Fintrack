"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Filter,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  useAccounts,
  useTransactions,
  useBudgets,
  useUserCategories,
  useMasterCategories,
  useFinancialSummary,
} from "@/hooks/useFinancialData";
import type { TransactionType } from "@/lib/api";

// Force dynamic rendering to prevent build-time pre-rendering issues
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [showBalances, setShowBalances] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("");

  // Get current month for filtering
  const currentDate = new Date();
  const currentMonthStart = format(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    "yyyy-MM-dd",
  );
  const currentMonthEnd = format(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    "yyyy-MM-dd",
  );

  // Enhanced data fetching with comprehensive filters
  const transactionFilters = useMemo(
    () => ({
      date__gte: dateFilter || currentMonthStart,
      date__lte: currentMonthEnd,
      page_size: 50, // Get more recent transactions
    }),
    [dateFilter, currentMonthStart, currentMonthEnd],
  );

  const {
    data: accountsResponse,
    isLoading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useAccounts({ page_size: 100 });

  const {
    data: transactionsResponse,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions(transactionFilters);

  const {
    data: budgetsResponse,
    isLoading: budgetsLoading,
    error: budgetsError,
    refetch: refetchBudgets,
  } = useBudgets({ page_size: 50 });

  const {
    data: userCategoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useUserCategories({ page_size: 100 });

  const { data: masterCategories, isLoading: masterCategoriesLoading } =
    useMasterCategories();

  const {
    data: financialSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useFinancialSummary({
    start_date: currentMonthStart,
    end_date: currentMonthEnd,
  });

  // Handle response data (could be paginated or direct array) - wrapped in useMemo to fix dependency warnings
  const transactions = useMemo(() => {
    return Array.isArray(transactionsResponse)
      ? transactionsResponse
      : transactionsResponse?.results || [];
  }, [transactionsResponse]);

  const accounts = useMemo(() => {
    return Array.isArray(accountsResponse)
      ? accountsResponse
      : accountsResponse?.results || [];
  }, [accountsResponse]);

  const budgets = Array.isArray(budgetsResponse)
    ? budgetsResponse
    : budgetsResponse?.results || [];

  const userCategories = Array.isArray(userCategoriesResponse)
    ? userCategoriesResponse
    : userCategoriesResponse?.results || [];

  // Error states
  const hasErrors =
    accountsError || transactionsError || budgetsError || categoriesError;

  // Loading states
  const isInitialLoading =
    accountsLoading || transactionsLoading || budgetsLoading;

  // Calculate totals with better data handling
  const totalBalance = useMemo(() => {
    return (
      accounts?.reduce((sum, account) => {
        const balance = parseFloat(account.balance) || 0;
        return sum + balance;
      }, 0) || 0
    );
  }, [accounts]);

  const recentTransactions = useMemo(
    () => transactions?.slice(0, 5) || [],
    [transactions],
  );

  const { monthlyIncome, monthlyExpenses } = useMemo(() => {
    const income =
      transactions
        ?.filter((t) => t.transaction_type === "In")
        ?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;

    const expenses =
      transactions
        ?.filter((t) => t.transaction_type === "Ex")
        ?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;

    return { monthlyIncome: income, monthlyExpenses: expenses };
  }, [transactions]);

  const activeBudgets = budgets?.length || 0;
  const exceededBudgets =
    budgets?.filter((budget) => budget.is_exceed)?.length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getAccountTypeName = (type: string) => {
    const types: Record<string, string> = {
      BA: "Bank Account",
      SV: "Savings",
      CC: "Credit Card",
      IN: "Investment",
      LO: "Loan",
      AS: "Asset",
      CR: "Cryptocurrency",
    };
    return types[type] || type;
  };

  const getCategoryName = (categoryId: number) => {
    const userCategory = userCategories?.find((cat) => cat.id === categoryId);
    if (userCategory?.master_category?.name) {
      return userCategory.master_category.name;
    }

    // Fallback to master categories
    const masterCategory = masterCategories?.find(
      (cat) => cat.id === categoryId,
    );
    return masterCategory?.name || "Unknown";
  };

  const handleRefreshData = async () => {
    try {
      await Promise.all([
        refetchAccounts(),
        refetchTransactions(),
        refetchBudgets(),
      ]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s your financial overview.
              </p>
              {hasErrors && (
                <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Some data failed to load</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshData}
                    className="h-auto p-1 text-destructive hover:text-destructive"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="text-muted-foreground"
              >
                {showBalances ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                {showBalances ? "Hide" : "Show"} Balances
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={isInitialLoading}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-2",
                    isInitialLoading && "animate-spin",
                  )}
                />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Balance */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-emerald opacity-10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {showBalances ? formatCurrency(totalBalance) : "••••••"}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Across {accounts?.length || 0} accounts
                </p>
              </CardContent>
            </Card>

            {/* Monthly Income */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Income
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-success">
                    {showBalances ? formatCurrency(monthlyIncome) : "••••••"}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            {/* Monthly Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Expenses
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-destructive">
                    {showBalances ? formatCurrency(monthlyExpenses) : "••••••"}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            {/* Active Budgets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Budgets
                </CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {budgetsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{activeBudgets}</div>
                    {exceededBudgets > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive">
                          {exceededBudgets} exceeded
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Budget categories
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button size="sm" className="h-9">
                Add Transaction
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                Create Budget
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                Add Account
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                View Insights
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              transaction.transaction_type === "IN"
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive",
                            )}
                          >
                            {transaction.transaction_type === "IN" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatDate(transaction.date)}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryName(transaction.category)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-medium text-sm",
                              transaction.transaction_type === "IN"
                                ? "text-success"
                                : "text-destructive",
                            )}
                          >
                            {transaction.transaction_type === "IN" ? "+" : "-"}
                            {showBalances
                              ? formatCurrency(parseFloat(transaction.amount))
                              : "••••"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowUpRight className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions yet</p>
                    <Button size="sm" className="mt-2">
                      Add your first transaction
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Accounts Overview</CardTitle>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : accounts && accounts.length > 0 ? (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {account.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {getAccountTypeName(account.account_type)}
                              </Badge>
                              {account.institution && (
                                <Badge variant="outline" className="text-xs">
                                  {account.institution}
                                </Badge>
                              )}
                              {account.account_number && (
                                <span className="text-xs text-muted-foreground">
                                  ••{account.account_number.slice(-4)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {showBalances
                              ? formatCurrency(parseFloat(account.balance) || 0)
                              : "••••••"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(account.updated_at), "MMM dd")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No accounts yet</p>
                    <Button size="sm" className="mt-2">
                      Add your first account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

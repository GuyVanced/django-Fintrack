"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

// Force dynamic rendering to prevent SSR issues with React Query
export const dynamic = "force-dynamic";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBudgets, useCreateBudget, useDeleteBudget, useUserCategories, useMasterCategories, useCreateUserCategory } from "@/hooks/useFinancialData";
import type { TransactionType } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    budget_amount: "",
  });
  const { toast } = useToast();

  // Check for modal parameter in URL and open dialog if present
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam === 'create') {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const { data: budgetsResponse, isLoading: budgetsLoading } = useBudgets();
  const { data: userCategoriesResponse, isLoading: categoriesLoading } = useUserCategories();
  const { data: masterCategoriesResponse, isLoading: masterCategoriesLoading } = useMasterCategories("Ex");
  const createBudgetMutation = useCreateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const createUserCategoryMutation = useCreateUserCategory();

  const budgets = Array.isArray(budgetsResponse) 
    ? budgetsResponse 
    : budgetsResponse?.results || [];

  const userCategories = Array.isArray(userCategoriesResponse) 
    ? userCategoriesResponse 
    : userCategoriesResponse?.results || [];

  const masterCategories = Array.isArray(masterCategoriesResponse)
    ? masterCategoriesResponse
    : masterCategoriesResponse?.results || [];

  // Map master categories to user categories (if any)
  const categoryOptions = masterCategories.map((masterCat) => {
    const userCat = userCategories.find(uc => uc.master_category.id === masterCat.id);
    return {
      master: masterCat,
      user: userCat,
      isNew: !userCat
    };
  });

  // Filter out categories that already have budgets
  const availableCategoryOptions = categoryOptions.filter(opt => {
    if (opt.user) {
      return !budgets.some(budget => budget.category === opt.user.id);
    } else {
      // If user category doesn't exist, it's available
      return true;
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.budget_amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedMasterCategoryId = parseInt(formData.category);
    const selectedOption = categoryOptions.find(opt => opt.master.id === selectedMasterCategoryId);
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Selected category not found.",
        variant: "destructive",
      });
      return;
    }

    let userCategoryId: number | undefined;
    try {
      if (selectedOption.isNew) {
        // Create user category first
        const newUserCategory = await createUserCategoryMutation.mutateAsync({
          master_category_id: selectedMasterCategoryId,
        });
        userCategoryId = newUserCategory.id;
      } else {
        userCategoryId = selectedOption.user!.id;
      }

      await createBudgetMutation.mutateAsync({
        master_category: selectedMasterCategoryId,
        budget_amount: formData.budget_amount,
      });

      toast({
        title: "Success",
        description: "Budget created successfully!",
      });

      setFormData({ category: "", budget_amount: "" });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    try {
      await deleteBudgetMutation.mutateAsync(budgetId);
      toast({
        title: "Success",
        description: "Budget deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(parseFloat(amount));
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    return type === "In" ? "Income" : "Expense";
  };

  const getCategoryName = (categoryId: number) => {
    const userCategory = userCategories?.find((cat) => cat.id === categoryId);
    return userCategory?.master_category?.name || "Unknown";
  };

  const getCategoryType = (categoryId: number) => {
    const userCategory = userCategories?.find((cat) => cat.id === categoryId);
    return userCategory?.master_category?.transaction_type || "Ex";
  };

  // Calculate budget usage percentage
  const getBudgetUsagePercentage = (budget: any) => {
    const userCategory = userCategories?.find((cat) => cat.id === budget.category);
    if (!userCategory || !budget.budget_amount) {
      return 0;
    }
    
    const totalAmount = parseFloat(userCategory.total_amount);
    const budgetAmount = parseFloat(budget.budget_amount);
    
    if (budgetAmount === 0) {
      return 0;
    }
    
    const percentage = (totalAmount / budgetAmount) * 100;
    return percentage; // Remove the cap to show actual percentage
  };

  // Get the total amount spent for a budget
  const getBudgetTotalSpent = (budget: any) => {
    const userCategory = userCategories?.find((cat) => cat.id === budget.category);
    return userCategory ? parseFloat(userCategory.total_amount) : 0;
  };

  // Get progress bar color based on usage percentage
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) {
      return "bg-destructive"; // Red for exceeded
    } else if (percentage >= 80) {
      return "bg-orange-500"; // Orange for high usage
    } else if (percentage >= 60) {
      return "bg-yellow-500"; // Yellow for medium usage
    } else {
      return "bg-green-500"; // Green for low usage
    }
  };

  // Custom Progress component with dynamic color
  const BudgetProgress = ({ value, className }: { value: number; className?: string }) => {
    const colorClass = getProgressBarColor(value);
    const displayWidth = Math.min(value, 100); // Cap visual bar at 100% but allow percentage to show actual value
    const isExceeded = value > 100;
    
    return (
      <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
        <div
          className={cn("h-full transition-all", colorClass)}
          style={{ width: `${displayWidth}%` }}
        />
        {isExceeded && (
          <div className="absolute inset-0 flex items-center justify-end pr-1">
            <div className="w-1 h-1 bg-white rounded-full opacity-80" />
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
              <p className="text-muted-foreground">
                Set and track your spending limits by category.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    {masterCategoriesLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading categories...
                      </div>
                    ) : masterCategoriesResponse === undefined ? (
                      <div className="text-destructive text-sm">
                        Failed to load categories. Please try again.
                      </div>
                    ) : (
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                        disabled={availableCategoryOptions.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={availableCategoryOptions.length === 0 ? "No available categories" : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategoryOptions.map((opt) => (
                            <SelectItem key={opt.master.id} value={opt.master.id.toString()}>
                              {opt.master.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {userCategories.length === 0 && !masterCategoriesLoading && masterCategoriesResponse !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        You have not added any categories yet. Please add an expense category first.
                      </p>
                    )}
                    {availableCategoryOptions.length === 0 && userCategories.length > 0 && !masterCategoriesLoading && masterCategoriesResponse !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        All categories already have budgets or no categories available.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_amount">Budget Amount *</Label>
                    <Input
                      id="budget_amount"
                      type="number"
                      step="0.01"
                      value={formData.budget_amount}
                      onChange={(e) => handleInputChange("budget_amount", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setFormData({ category: "", budget_amount: "" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBudgetMutation.isPending || !formData.category || !formData.budget_amount}
                    >
                      {createBudgetMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Budget
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Budgets List */}
          {budgetsLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading budgets...</p>
              </CardContent>
            </Card>
          ) : budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <Card key={budget.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {getCategoryName(budget.category)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        disabled={deleteBudgetMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Budget Amount:</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(budget.budget_amount)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant={
                          getCategoryType(budget.category) === "In" 
                            ? "default" 
                            : "secondary"
                        }>
                          {getTransactionTypeLabel(getCategoryType(budget.category))}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <div className="flex items-center gap-2">
                          {budget.is_exceed ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <Badge variant="destructive">Exceeded</Badge>
                            </>
                          ) : (
                            <Badge variant="default">On Track</Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress bar for budget usage */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Usage</span>
                          <div className="flex items-center gap-1">
                            {getBudgetUsagePercentage(budget) > 100 && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                            <span className={cn(
                              "font-medium",
                              getBudgetUsagePercentage(budget) > 100 
                                ? "text-destructive" 
                                : "text-muted-foreground"
                            )}>
                              {getBudgetUsagePercentage(budget).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <BudgetProgress value={getBudgetUsagePercentage(budget)} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Spent: {formatCurrency(getBudgetTotalSpent(budget).toString())}</span>
                          <span>
                            {budget.is_exceed 
                              ? `Exceeded by: ${formatCurrency((getBudgetTotalSpent(budget) - parseFloat(budget.budget_amount)).toString())}`
                              : `Remaining: ${formatCurrency((parseFloat(budget.budget_amount) - getBudgetTotalSpent(budget)).toString())}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  No Budgets Yet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Target className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-lg font-semibold mb-2">
                  Start budgeting your expenses
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create budgets for your spending categories to track and control your expenses.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

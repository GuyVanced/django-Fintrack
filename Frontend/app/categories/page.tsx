"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserCategories, useCreateUserCategory, useDeleteUserCategory, useMasterCategories } from "@/hooks/useFinancialData";
import type { TransactionType } from "@/lib/api";

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | "">("");
  const [formData, setFormData] = useState({
    master_category_id: "",
  });
  const { toast } = useToast();

  const { data: userCategoriesResponse, isLoading: userCategoriesLoading, error: userCategoriesError } = useUserCategories();
  const { data: masterCategoriesResponse, isLoading: masterCategoriesLoading, error: masterCategoriesError } = useMasterCategories();
  const createUserCategoryMutation = useCreateUserCategory();
  const deleteUserCategoryMutation = useDeleteUserCategory();

  const userCategories = Array.isArray(userCategoriesResponse) 
    ? userCategoriesResponse 
    : userCategoriesResponse?.results || [];

  const masterCategories = Array.isArray(masterCategoriesResponse) 
    ? masterCategoriesResponse 
    : [];

  // Filter master categories by selected transaction type
  const filteredMasterCategories = selectedTransactionType 
    ? masterCategories.filter(cat => cat.transaction_type === selectedTransactionType)
    : masterCategories;

  // Filter out master categories that are already used by the user
  const availableMasterCategories = filteredMasterCategories.filter(masterCat => 
    !userCategories.some(userCat => userCat.master_category.id === masterCat.id)
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.master_category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    // console.log("Submitting category with data:", formData);

    try {
      const result = await createUserCategoryMutation.mutateAsync({
        master_category_id: parseInt(formData.master_category_id),
      });

      // console.log("Category creation result:", result);

      toast({
        title: "Success",
        description: "Category added successfully!",
      });

      // Reset form and close dialog
      setFormData({
        master_category_id: "",
      });
      setSelectedTransactionType("");
      setIsDialogOpen(false);
    } catch (error) {
      // console.error("Category creation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteUserCategoryMutation.mutateAsync(categoryId);
      toast({
        title: "Success",
        description: "Category removed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    return type === "In" ? "Income" : "Expense";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Debug Info */}
          {/* <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700">
              <p>User Categories Loading: {userCategoriesLoading ? "Yes" : "No"}</p>
              <p>User Categories Count: {userCategories.length}</p>
              <p>Master Categories Loading: {masterCategoriesLoading ? "Yes" : "No"}</p>
              <p>Master Categories Count: {masterCategories.length}</p>
              <p>User Categories Error: {userCategoriesError ? "Yes" : "No"}</p>
              <p>Master Categories Error: {masterCategoriesError ? "Yes" : "No"}</p>
              <p>Selected Transaction Type: {selectedTransactionType || "None"}</p>
              <p>Filtered Master Categories: {filteredMasterCategories.length}</p>
              <p>Available Master Categories: {availableMasterCategories.length}</p>
              {userCategoriesError && <p>User Categories Error: {JSON.stringify(userCategoriesError)}</p>}
              {masterCategoriesError && <p>Master Categories Error: {JSON.stringify(masterCategoriesError)}</p>}
              <div className="mt-2">
                <p className="font-semibold">User Categories:</p>
                <ul className="ml-4">
                  {userCategories.map(cat => (
                    <li key={cat.id}>
                      {cat.master_category.name} (ID: {cat.master_category.id}, Type: {cat.master_category.transaction_type})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Available Master Categories:</p>
                <ul className="ml-4">
                  {availableMasterCategories.map(cat => (
                    <li key={cat.id}>
                      {cat.name} (ID: {cat.id}, Type: {cat.transaction_type})
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card> */}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categories</h1>
              <p className="text-muted-foreground">
                Organize your transactions with custom categories.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction_type">Transaction Type (Optional)</Label>
                    <Select
                      value={selectedTransactionType}
                      onValueChange={(value) => setSelectedTransactionType(value as TransactionType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All categories (or filter by type)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">Income</SelectItem>
                        <SelectItem value="EX">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="master_category_id">Category *</Label>
                    <Select
                      value={formData.master_category_id}
                      onValueChange={(value) => handleInputChange("master_category_id", value)}
                      disabled={availableMasterCategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          availableMasterCategories.length === 0 
                            ? "No available categories" 
                            : "Select category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMasterCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name} ({getTransactionTypeLabel(category.transaction_type)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableMasterCategories.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        All categories are already added.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTransactionType("");
                        setFormData({ master_category_id: "" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createUserCategoryMutation.isPending || !formData.master_category_id}
                    >
                      {createUserCategoryMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Add Category
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Categories List */}
          {userCategoriesLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading categories...</p>
              </CardContent>
            </Card>
          ) : userCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {category.master_category.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteUserCategoryMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant={
                          category.master_category.transaction_type === "In" 
                            ? "default" 
                            : "secondary"
                        }>
                          {getTransactionTypeLabel(category.master_category.transaction_type)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount:</span>
                        <span className="text-sm font-bold">
                          {formatCurrency(category.total_amount)}
                        </span>
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
                  <Tag className="h-5 w-5" />
                  No Categories Yet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Tag className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-lg font-semibold mb-2">
                  Start organizing your transactions
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add categories to better organize and track your income and expenses.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

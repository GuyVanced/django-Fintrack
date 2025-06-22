"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown, Plus, Loader2, ArrowUpRight, ArrowDownRight, Trash2, Receipt } from "lucide-react";
import { useState, useEffect } from "react";
import { useTransactions, useCreateTransaction, useAccounts, useUserCategories, useMasterCategories, useCreateUserCategory, useDeleteTransaction } from "@/hooks/useFinancialData";
import type { TransactionType, CreateTransactionData } from "@/lib/api";
import Image from "next/image";

export default function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | "">("");
  const [formData, setFormData] = useState({
    transaction_type: "" as TransactionType,
    account: "",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringInterval: "",
  });
  const { toast } = useToast();

  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions();
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts();
  const { data: userCategoriesResponse, isLoading: categoriesLoading } = useUserCategories();
  const { data: masterCategoriesResponse, isLoading: masterCategoriesLoading } = useMasterCategories(selectedTransactionType as TransactionType);
  const createTransactionMutation = useCreateTransaction();
  const createUserCategoryMutation = useCreateUserCategory();
  const deleteTransactionMutation = useDeleteTransaction();

  const transactions = Array.isArray(transactionsResponse) 
    ? transactionsResponse 
    : transactionsResponse?.results || [];

  const accounts = Array.isArray(accountsResponse) 
    ? accountsResponse 
    : accountsResponse?.results || [];

  const userCategories = Array.isArray(userCategoriesResponse) 
    ? userCategoriesResponse 
    : userCategoriesResponse?.results || [];

  const masterCategories = masterCategoriesResponse?.results || [];

  // Filter user categories by selected transaction type
  const filteredUserCategories = selectedTransactionType && Array.isArray(userCategories)
    ? userCategories.filter(cat => cat?.master_category?.transaction_type === selectedTransactionType)
    : [];

  // Get master categories that are not yet user categories
  const availableMasterCategories = Array.isArray(masterCategories) 
    ? masterCategories.filter(masterCat => 
        !userCategories.some(userCat => userCat?.master_category?.id === masterCat?.id)
      )
    : [];

  // Reset category when transaction type changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: ""
    }));
  }, [selectedTransactionType]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transaction_type || !formData.account || !formData.category || !formData.amount || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryId = parseInt(formData.category);
      const isMasterCategory = availableMasterCategories.some(mc => mc.id === categoryId);
      let categoryName: string | undefined;

      if (isMasterCategory) {
        categoryName = availableMasterCategories.find(mc => mc.id === categoryId)?.name;
      } else {
        categoryName = userCategories.find(uc => uc.id === categoryId)?.master_category.name;
      }

      if (!categoryName) {
        toast({ title: "Error", description: "Selected category not found.", variant: "destructive" });
        return;
      }

      const transactionPayload: CreateTransactionData = {
        transaction_type: formData.transaction_type,
        account: parseInt(formData.account),
        category: categoryName,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        isRecurring: formData.isRecurring,
        recurringInterval: formData.recurringInterval || undefined,
      };

      console.log("Creating transaction with payload:", transactionPayload);
      await createTransactionMutation.mutateAsync(transactionPayload);

      toast({
        title: "Success",
        description: "Transaction created successfully!",
      });

      // Reset form and close dialog
      setFormData({
        transaction_type: "" as TransactionType,
        account: "",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurringInterval: "",
      });
      setSelectedTransactionType("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create transaction. Please try again.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryName = (category: number | string) => {
    // Try to match by id (number or string)
    let userCategory = userCategories?.find((cat) => cat.id === Number(category));
    // If not found, try to match by name (for transactions created from receipts)
    if (!userCategory && typeof category === 'string') {
      userCategory = userCategories?.find((cat) => cat.master_category.name === category);
    }
    return userCategory?.master_category?.name || (typeof category === 'string' ? category : 'Unknown');
  };

  const getAccountName = (accountId: number) => {
    const account = accounts?.find((acc) => acc.id === accountId);
    return account?.name || "Unknown";
  };

  console.log("User categories:", userCategories);

  // Transaction delete handler
  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      await deleteTransactionMutation.mutateAsync(transactionId);
      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [receiptResult, setReceiptResult] = useState<any>(null);

  // Handle image upload and preview
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  // Clear image and preview when modal closes
  useEffect(() => {
    if (!isReceiptDialogOpen) {
      setReceiptImage(null);
      setReceiptPreview(null);
    }
  }, [isReceiptDialogOpen]);

  const handleProcessReceipt = async () => {
    if (!receiptImage) return;
    setIsProcessingReceipt(true);
    setReceiptResult(null);
    try {
      const formData = new FormData();
      formData.append('image', receiptImage);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://127.0.0.1:8000/api/ai/receipt/process', {
        method: 'POST',
        headers: token ? { 'Authorization': `Token ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to process receipt');
      const data = await response.json();
      // Remove merchant field if present
      const { merchant, ...rest } = data;
      setReceiptResult(rest);
      setIsReceiptDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process receipt',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const [isReceiptConfirmOpen, setIsReceiptConfirmOpen] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    description: "",
    transaction_type: "Ex" as TransactionType,
    account_id: "",
    date: "",
    total: "",
    category: "",
    receiptPath: "",
  });
  useEffect(() => {
    if (receiptResult) {
      // Find the user category id that matches the OCR category name
      const matchedCategory = userCategories.find(
        cat => cat.master_category.transaction_type === 'Ex' && cat.master_category.name === receiptResult.category
      );
      setReceiptForm({
        description: receiptResult.description || "",
        transaction_type: "Ex",
        account_id: "",
        date: receiptResult.date || "",
        total: receiptResult.total?.toString() || "",
        category: matchedCategory ? matchedCategory.id.toString() : "",
        receiptPath: receiptResult.receiptPath || "",
      });
      setIsReceiptConfirmOpen(true);
    }
  }, [receiptResult, userCategories]);

  const handleReceiptFormChange = (field: string, value: string) => {
    setReceiptForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.account_id || !receiptForm.category || !receiptForm.total || !receiptForm.date || !receiptForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        description: receiptForm.description,
        transaction_type: "Ex",
        account_id: parseInt(receiptForm.account_id),
        date: receiptForm.date,
        total: parseFloat(receiptForm.total),
        category: userCategories.find(cat => cat.id.toString() === receiptForm.category)?.master_category.name || "",
        receiptPath: receiptForm.receiptPath,
      };
      console.log('Receipt create payload:', payload);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://127.0.0.1:8000/api/ai/receipt/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create transaction from receipt');
      toast({ title: 'Success', description: 'Transaction created from receipt!' });
      setIsReceiptConfirmOpen(false);
      setReceiptResult(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create transaction from receipt',
        variant: 'destructive',
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Transactions
              </h1>
              <p className="text-muted-foreground">
                Track your income and expenses across all accounts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                    onClick={() => setIsReceiptDialogOpen(true)}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Add from receipt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full">
                  <DialogHeader>
                    <DialogTitle>Upload Receipt</DialogTitle>
                    <DialogDescription>
                      Upload an image of your receipt to process it automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center gap-4 py-4">
                    {!receiptPreview ? (
                      <label
                        htmlFor="receipt-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition relative"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <Plus className="h-12 w-12 text-blue-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <span className="z-10 text-blue-700 font-medium">Click to upload or drag image here</span>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReceiptChange}
                        />
                      </label>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-blue-50 rounded-lg overflow-hidden relative">
                        <img
                          src={receiptPreview}
                          alt="Receipt Preview"
                          className="object-contain max-h-48 w-auto mx-auto"
                        />
                      </div>
                    )}
                  </div>
                  {receiptPreview && (
                    <div className="flex gap-2 w-full mt-4">
                      <Button className="flex-1" size="lg" onClick={handleProcessReceipt} disabled={isProcessingReceipt}>
                        {isProcessingReceipt ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Process Receipt
                      </Button>
                      <Button
                        className="flex-1"
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          setReceiptImage(null);
                          setReceiptPreview(null);
                        }}
                        disabled={isProcessingReceipt}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                      Add a new income or expense. Select an existing category or create a new one on the fly.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction_type">Transaction Type *</Label>
                        <Select
                          value={formData.transaction_type}
                          onValueChange={(value) => {
                            handleInputChange("transaction_type", value);
                            setSelectedTransactionType(value as TransactionType);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In">Income</SelectItem>
                            <SelectItem value="Ex">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="e.g., Grocery shopping"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account">Account *</Label>
                        <Select
                          value={formData.account}
                          onValueChange={(value) => handleInputChange("account", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category?.toString() || ""}
                          onValueChange={(value) => {
                            console.log("Category selected:", value);
                            handleInputChange("category", value);
                          }}
                          disabled={!selectedTransactionType || masterCategoriesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              masterCategoriesLoading
                                ? "Loading categories..."
                                : !selectedTransactionType 
                                ? "Select transaction type first" 
                                : (filteredUserCategories.length === 0 && availableMasterCategories.length === 0)
                                  ? "No categories available" 
                                  : "Select category"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {masterCategoriesLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              <>
                                {/* Existing user categories */}
                                {filteredUserCategories.length > 0 && (
                                  <>
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                      Your Categories
                                    </div>
                                    {filteredUserCategories.map((category) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.master_category.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                
                                {/* Available master categories */}
                                {availableMasterCategories.length > 0 && (
                                  <>
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                      New Categories
                                    </div>
                                    {availableMasterCategories.map((category) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        {!masterCategoriesLoading && selectedTransactionType && filteredUserCategories.length === 0 && availableMasterCategories.length === 0 && (
                          <p className="text-sm text-muted-foreground pt-1">
                            No categories found for this type.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createTransactionMutation.isPending || createUserCategoryMutation.isPending}
                      >
                        {(createTransactionMutation.isPending || createUserCategoryMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Create Transaction
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Transactions List */}
          {transactionsLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading transactions...</p>
              </CardContent>
            </Card>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === "In"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.transaction_type === "In" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDate(transaction.date)}</span>
                            <span>•</span>
                            <span>{getAccountName(transaction.account)}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(transaction.category)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p
                          className={`font-bold ${
                            transaction.transaction_type === "In"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.transaction_type === "In" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          disabled={deleteTransactionMutation.isPending}
                          aria-label="Delete transaction"
                        >
                          {deleteTransactionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
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
                  <ArrowUpDown className="h-5 w-5" />
                  No Transactions Yet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <ArrowUpDown className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-lg font-semibold mb-2">
                  Start tracking your finances
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add your first transaction to begin monitoring your income and expenses.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Transaction
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Show receipt result as JSON if available */}
          {receiptResult && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Receipt OCR Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(receiptResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Receipt Confirm Modal */}
          <Dialog open={isReceiptConfirmOpen} onOpenChange={setIsReceiptConfirmOpen}>
            <DialogContent className="sm:max-w-[500px] w-full">
              <DialogHeader>
                <DialogTitle>Confirm Transaction from Receipt</DialogTitle>
                <DialogDescription>
                  Review and edit the details below, then confirm to add the transaction.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleConfirmReceipt} className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  {receiptForm.receiptPath && (
                    <div className="w-24 h-24 relative cursor-pointer" title="Click to view full image" onClick={() => window.open(receiptForm.receiptPath, '_blank')}> 
                      <img src={receiptForm.receiptPath} alt="Receipt" className="object-contain w-full h-full rounded border" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction_type">Transaction Type</Label>
                    <Input id="transaction_type" value="Expense" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={receiptForm.date} onChange={e => handleReceiptFormChange('date', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total *</Label>
                    <Input id="total" type="number" value={receiptForm.total} onChange={e => handleReceiptFormChange('total', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={receiptForm.category} onValueChange={value => handleReceiptFormChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {userCategories.filter(cat => cat.master_category.transaction_type === 'Ex').map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.master_category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account">Account *</Label>
                    <Select value={receiptForm.account_id} onValueChange={value => handleReceiptFormChange('account_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input id="description" value={receiptForm.description} onChange={e => handleReceiptFormChange('description', e.target.value)} required />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="w-full">Confirm</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

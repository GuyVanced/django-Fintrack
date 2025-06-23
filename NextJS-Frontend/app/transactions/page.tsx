"use client";

export const dynamic = "force-dynamic";

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
  const { data: masterCategoriesResponse, isLoading: masterCategoriesLoading, error: masterCategoriesError } = useMasterCategories(selectedTransactionType as TransactionType);
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

  const masterCategories = Array.isArray(masterCategoriesResponse)
    ? masterCategoriesResponse
    : masterCategoriesResponse?.results || [];

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
      const categoryObj = masterCategories.find(mc => mc.id === categoryId);
      const categoryName = categoryObj?.name;

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
      // Store the local preview URL for later use in the confirm modal
      setReceiptResult({ ...rest, _localPreview: receiptPreview });
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

  // For receipt modal: always fetch master categories for 'Ex' (Expense)
  const { data: receiptMasterCategoriesResponse, isLoading: receiptMasterCategoriesLoading, error: receiptMasterCategoriesError } = useMasterCategories('Ex');
  const receiptMasterCategories = Array.isArray(receiptMasterCategoriesResponse)
    ? receiptMasterCategoriesResponse
    : receiptMasterCategoriesResponse?.results || [];

  useEffect(() => {
    if (receiptResult) {
      // Use receiptMasterCategories for matching
      const matchedMasterCategory = receiptMasterCategories.find(
        cat => cat.transaction_type === 'Ex' && cat.name === receiptResult.category
      );
      setReceiptForm(prev => {
        if (
          prev.description === (receiptResult.description || "") &&
          prev.date === (receiptResult.date || "") &&
          prev.total === (receiptResult.total?.toString() || "") &&
          prev.category === (matchedMasterCategory ? matchedMasterCategory.id.toString() : "") &&
          prev.receiptPath === (receiptResult.receiptPath || "")
        ) {
          return prev; // No change, avoid infinite loop
        }
        return {
          description: receiptResult.description || "",
          transaction_type: "Ex",
          account_id: "",
          date: receiptResult.date || "",
          total: receiptResult.total?.toString() || "",
          category: matchedMasterCategory ? matchedMasterCategory.id.toString() : "",
          receiptPath: receiptResult.receiptPath || "",
        };
      });
      setIsReceiptConfirmOpen(true);
    }
    // Only depend on receiptResult!
    // eslint-disable-next-line
  }, [receiptResult]);

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
      const categoryId = parseInt(receiptForm.category);
      const categoryObj = receiptMasterCategories.find(mc => mc.id === categoryId);
      const categoryName = categoryObj?.name || "";
      const payload = {
        description: receiptForm.description,
        transaction_type: "Ex",
        account_id: parseInt(receiptForm.account_id),
        date: receiptForm.date,
        total: parseFloat(receiptForm.total),
        category: categoryName,
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

  // Debug log for master categories
  console.log('masterCategoriesResponse:', masterCategoriesResponse);
  if (masterCategoriesError) {
    console.error('Error fetching master categories:', masterCategoriesError);
  }

  // Helper to get full backend URL for media files
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const getImageUrl = (path: string) => path?.startsWith("http") ? path : `${backendUrl}${path}`;

  // In the confirm modal, use the local preview if backend path is not available
  const imageUrl = receiptForm.receiptPath
    ? getImageUrl(receiptForm.receiptPath)
    : receiptResult?._localPreview || null;

  const [isToday, setIsToday] = useState(false);

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
                        <Image
                          src={receiptPreview}
                          alt="Receipt Preview"
                          fill
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
                            handleInputChange("category", value);
                          }}
                          disabled={!selectedTransactionType || masterCategoriesLoading || !!masterCategoriesError}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              masterCategoriesLoading
                                ? "Loading categories..."
                                : masterCategoriesError
                                ? "Error loading categories"
                                : !selectedTransactionType 
                                ? "Select transaction type first" 
                                : masterCategories.length === 0
                                  ? "No categories available" 
                                  : "Select category"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {masterCategoriesLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : masterCategoriesError ? (
                              <div className="text-red-500 p-4">Error loading categories</div>
                            ) : (
                              masterCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {!masterCategoriesLoading && selectedTransactionType && masterCategories.length === 0 && !masterCategoriesError && (
                          <p className="text-sm text-muted-foreground pt-1">
                            No categories found for this type.
                          </p>
                        )}
                        {masterCategoriesError && (
                          <p className="text-sm text-red-500 pt-1">
                            Error loading categories: {masterCategoriesError.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          disabled={isToday}
                        />
                      </div>
                      <div className="flex justify-center items-center h-full">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isToday}
                            onChange={e => {
                              setIsToday(e.target.checked);
                              if (e.target.checked) {
                                const today = new Date().toISOString().split('T')[0];
                                handleInputChange("date", today);
                              }
                            }}
                          />
                          <span>Today</span>
                        </label>
                      </div>
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
                  {imageUrl && (
                    <div className="w-24 h-24 relative cursor-pointer" title="Click to view full image" onClick={() => window.open(imageUrl, '_blank')}> 
                      <Image
                        src={imageUrl}
                        alt="Receipt"
                        fill
                        className="object-contain w-full h-full rounded border"
                      />
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
                    <Select
                      value={receiptForm.category}
                      onValueChange={value => handleReceiptFormChange('category', value)}
                      disabled={receiptMasterCategoriesLoading || !!receiptMasterCategoriesError}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          receiptMasterCategoriesLoading
                            ? "Loading categories..."
                            : receiptMasterCategoriesError
                            ? "Error loading categories"
                            : (receiptMasterCategories.length === 0)
                              ? "No categories available"
                              : "Select category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {receiptMasterCategoriesLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : receiptMasterCategoriesError ? (
                          <div className="text-red-500 p-4">Error loading categories</div>
                        ) : (
                          receiptMasterCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {!receiptMasterCategoriesLoading && receiptMasterCategories.length === 0 && !receiptMasterCategoriesError && (
                      <p className="text-sm text-muted-foreground pt-1">
                        No categories found for this type.
                      </p>
                    )}
                    {receiptMasterCategoriesError && (
                      <p className="text-sm text-red-500 pt-1">
                        Error loading categories: {receiptMasterCategoriesError.message}
                      </p>
                    )}
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

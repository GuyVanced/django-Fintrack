"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAccounts, useCreateAccount } from "@/hooks/useFinancialData";
import type { AccountType } from "@/lib/api";

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "BA", label: "Bank Account" },
  { value: "SV", label: "Savings" },
  { value: "CC", label: "Credit Card" },
  { value: "IN", label: "Investment" },
  { value: "LO", label: "Loan" },
  { value: "AS", label: "Asset" },
  { value: "CR", label: "Cryptocurrency" },
];

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_type: "" as AccountType,
    name: "",
    account_number: "",
    institution: "",
    balance: "",
  });
  const { toast } = useToast();

  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts();
  const createAccountMutation = useCreateAccount();

  const accounts = Array.isArray(accountsResponse) 
    ? accountsResponse 
    : accountsResponse?.results || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_type || !formData.name || !formData.balance) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAccountMutation.mutateAsync({
        account_type: formData.account_type,
        name: formData.name,
        account_number: formData.account_number || undefined,
        institution: formData.institution || undefined,
        balance: parseFloat(formData.balance),
      });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      // Reset form and close dialog
      setFormData({
        account_type: "" as AccountType,
        name: "",
        account_number: "",
        institution: "",
        balance: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
              <p className="text-muted-foreground">
                Manage your bank accounts and digital wallets.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type *</Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(value) => handleInputChange("account_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Chase Checking"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => handleInputChange("institution", e.target.value)}
                      placeholder="e.g., Chase Bank"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => handleInputChange("account_number", e.target.value)}
                      placeholder="e.g., ****1234"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balance">Initial Balance *</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => handleInputChange("balance", e.target.value)}
                      placeholder="0.00"
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
                      disabled={createAccountMutation.isPending}
                    >
                      {createAccountMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Account
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Accounts List */}
          {accountsLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading accounts...</p>
              </CardContent>
            </Card>
          ) : accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {account.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm font-medium">
                          {accountTypes.find(t => t.value === account.account_type)?.label}
                        </span>
                      </div>
                      {account.institution && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Institution:</span>
                          <span className="text-sm font-medium">{account.institution}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Balance:</span>
                        <span className="text-sm font-bold">
                          {formatCurrency(account.balance)}
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
                  <Wallet className="h-5 w-5" />
                  No Accounts Yet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Wallet className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-lg font-semibold mb-2">
                  Get started with your first account
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add your bank accounts, credit cards, and other financial accounts to start tracking your finances.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

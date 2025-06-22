"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  Sparkles,
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

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                AI Insights
              </h1>
              <p className="text-muted-foreground">
                Get personalized financial insights powered by AI.
              </p>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>

          {/* Placeholder Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Financial Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-lg font-semibold mb-2">
                AI Insights coming soon!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                This page will provide AI-powered financial insights and
                recommendations based on your spending patterns and financial
                goals.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Monthly financial analysis</p>
                <p>✓ Spending pattern insights</p>
                <p>✓ Personalized recommendations</p>
                <p>✓ Trend analysis and predictions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

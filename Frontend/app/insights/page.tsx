"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";

export default function InsightsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : "http://127.0.0.1:8000") + "/api/ai/insights/";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
        body: JSON.stringify({ year, month }),
      });
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          data = { detail: "An unexpected error occurred. Please try again later." };
        } else {
          data = { detail: text };
        }
      }
      if (!response.ok) {
        if (data.detail && data.detail.startsWith("No transactions found")) {
          setErrorMsg("No Transaction Found");
        } else {
          setErrorMsg(data.detail || "Failed to generate insights.");
        }
      } else {
        setErrorMsg("");
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to generate insights.");
    } finally {
      setIsLoading(false);
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
                AI Insights
              </h1>
              <p className="text-muted-foreground">
                Get personalized financial insights powered by AI.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Generate Insights</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="flex gap-4">
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        min={2000}
                        max={2100}
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <Input
                        id="month"
                        type="number"
                        min={1}
                        max={12}
                        value={month}
                        onChange={e => setMonth(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  {errorMsg && (
                    <div className="text-red-500 text-sm text-center pt-2">{errorMsg}</div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Insights"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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

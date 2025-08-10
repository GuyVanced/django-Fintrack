"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

// Force dynamic rendering to prevent SSR issues with React Query
export const dynamic = "force-dynamic";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Sparkles,
  Loader2,
  FileText,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { useGenerateInsights, useInsights, useDeleteInsight } from "@/hooks/useFinancialData";
import { format } from "date-fns";
import type { MonthlyInsight } from "@/lib/api";

const InsightRenderer = ({ content }: { content: string }) => {
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ol" | "ul" | null; items: React.ReactNode[] } = {
    type: null,
    items: [],
  };

  const flushList = () => {
    if (currentList.items.length > 0) {
      const ListTag = currentList.type === "ol" ? "ol" : "ul";
      const listClassName =
        currentList.type === "ol"
          ? "list-decimal space-y-2 pl-5"
          : "list-disc space-y-2 pl-5";

      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={listClassName}
        >
          {currentList.items}
        </ListTag>,
      );
    }
    currentList = { type: null, items: [] };
  };

  // Treat the first non-empty line as the main title
  const allLines = content.split("\n");
  const firstNonEmptyLineIndex = allLines.findIndex((line) => line.trim() !== "");

  if (firstNonEmptyLineIndex !== -1) {
    elements.push(
      <h2 key="main-title" className="text-xl font-bold mb-4">
        {allLines[firstNonEmptyLineIndex].trim()}
      </h2>,
    );
  }

  const contentLines =
    firstNonEmptyLineIndex === -1
      ? []
      : allLines.slice(firstNonEmptyLineIndex + 1);

  contentLines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushList();
      return;
    }

    // Main Heading Rule (e.g., "1. Title" or "**Title**", no bolding inside a numbered heading)
    const isMainNumberedHeading = /^\s*(\*?\s*\d+\.)\s(?!.*\*\*)/.test(
      trimmedLine,
    );
    const isBoldHeading =
      trimmedLine.startsWith("**") && trimmedLine.endsWith("**");

    if (isMainNumberedHeading || isBoldHeading) {
      flushList();
      elements.push(
        <h3 key={index} className="font-semibold text-base mt-6 mb-2">
          {isBoldHeading
            ? trimmedLine.substring(2, trimmedLine.length - 2)
            : trimmedLine.replace(/^\s*\*?/, "").trim()}
        </h3>,
      );
      return;
    }

    // Ordered List Item Rule (e.g., "1. **Investigate...**" or "1. Simple item")
    const isOrderedListItem = /^\s*\d+\.\s/.test(trimmedLine);
    if (isOrderedListItem) {
      if (currentList.type !== "ol") {
        flushList();
        currentList.type = "ol";
      }
      const itemContent = trimmedLine.replace(/^\s*\d+\.\s/, "");
      const parts = itemContent.split("**");
      currentList.items.push(
        <li key={index}>
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
          )}
        </li>,
      );
      return;
    }

    // Unordered List Item Rule (e.g., "* My item")
    const isUnorderedListItem = /^\s*\*\s/.test(trimmedLine);
    if (isUnorderedListItem) {
      if (currentList.type !== "ul") {
        flushList();
        currentList.type = "ul";
      }
      const itemContent = trimmedLine.replace(/^\s*\*\s/, "");
      const parts = itemContent.split("**");
      currentList.items.push(
        <li key={index}>
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
          )}
        </li>,
      );
      return;
    }

    // Default: Paragraph
    flushList();
    const parts = trimmedLine.split("**");
    elements.push(
      <p key={index} className="text-sm">
        {parts.map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
        )}
      </p>,
    );
  });

  flushList();

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground space-y-2">
      {elements}
    </div>
  );
};

export default function InsightsPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [viewingInsight, setViewingInsight] = useState<MonthlyInsight | null>(
    null,
  );

  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();
  const generateInsightsMutation = useGenerateInsights();
  const deleteInsightMutation = useDeleteInsight();
  const {
    data: insights,
    isLoading: insightsLoading,
    error: insightsError,
  } = useInsights();

  const sortedInsights = useMemo(() => {
    if (!insights) return [];
    return [...insights].sort(
      (a, b) =>
        new Date(b.period_start).getTime() -
        new Date(a.period_start).getTime(),
    );
  }, [insights]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const alreadyExists = sortedInsights.some((insight) => {
      const insightDate = new Date(insight.period_start);
      // Adjust for timezone differences by comparing UTC dates
      return (
        insightDate.getUTCFullYear() === year &&
        insightDate.getUTCMonth() + 1 === month
      );
    });

    if (alreadyExists) {
      setErrorMsg("Insights for this period have already been generated.");
      return;
    }

    generateInsightsMutation.mutate(
      { year: year.toString(), month: month.toString() },
      {
        onSuccess: () => {
          toast({
            title: "Insights Queued!",
            description:
              "Your financial insights are being generated. This may take a moment.",
          });
          setIsGenerateDialogOpen(false);
        },
        onError: (error: any) => {
          const detail = error.message || "An unexpected error occurred.";
          if (
            typeof detail === "string" &&
            detail.includes("No transactions found")
          ) {
            setErrorMsg("No transactions during the period");
          } else {
            setErrorMsg(detail);
          }
        },
      },
    );
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
            <Dialog
              open={isGenerateDialogOpen}
              onOpenChange={(isOpen) => {
                setIsGenerateDialogOpen(isOpen);
                if (!isOpen) setErrorMsg("");
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Generate New Insights</DialogTitle>
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
                        onChange={(e) => setYear(Number(e.target.value))}
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
                        onChange={(e) => setMonth(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  {errorMsg && (
                    <div className="text-red-500 text-sm text-center pt-2">
                      {errorMsg}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generateInsightsMutation.isPending}
                  >
                    {generateInsightsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {generateInsightsMutation.isPending
                      ? "Generating..."
                      : "Generate Insights"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Insights List */}
          {insightsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Loading financial insights...
              </p>
            </div>
          ) : insightsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive">
                  Failed to load insights
                </h3>
                <p className="text-muted-foreground mt-2">
                  There was a problem fetching your data. Please try again
                  later.
                </p>
              </CardContent>
            </Card>
          ) : sortedInsights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedInsights.map((insight) => (
                <Card
                  key={insight.id}
                  className="hover:shadow-lg transition-shadow group relative"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>
                        {format(new Date(insight.period_start), "MMMM yyyy")} {" "}
                        Insights
                      </span>
                      <button
                        className="absolute top-2 right-2 bg-transparent border-none text-muted-foreground hover:text-red-600 focus:outline-none"
                        title="Delete Insight"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this insight?')) {
                            deleteInsightMutation.mutate(insight.id, {
                              onSuccess: () => {
                                toast({ title: 'Deleted', description: 'Insight deleted.' });
                              },
                              onError: (error: any) => {
                                toast({ title: 'Error', description: error?.message || 'Failed to delete insight', variant: 'destructive' });
                              },
                            });
                          }
                        }}
                        disabled={deleteInsightMutation.isPending}
                      >
                        {deleteInsightMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generated on{" "}
                      {format(new Date(insight.created_at), "MMM dd, yyyy")}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => setViewingInsight(insight)}
                    >
                      View Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-20">
                <TrendingUp className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">
                  No insights generated yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Click the button above to generate your first AI-powered
                  financial report.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* View Insight Modal */}
        <Dialog
          open={!!viewingInsight}
          onOpenChange={(isOpen) => !isOpen && setViewingInsight(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {viewingInsight
                  ? `${format(new Date(viewingInsight.period_start), "MMMM yyyy")} Insights`
                  : "Financial Report"}
              </DialogTitle>
              <DialogDescription>
                An AI-generated summary of your financial activity for the
                selected period.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
              {viewingInsight && (
                <InsightRenderer content={viewingInsight.llm_response} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

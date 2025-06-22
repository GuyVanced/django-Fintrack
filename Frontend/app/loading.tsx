import { Loader2, Wallet } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-emerald rounded-lg flex items-center justify-center">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">FinTrack</span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Loading your financial data...</p>
      </div>
    </div>
  );
}

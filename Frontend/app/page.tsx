import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  BarChart3,
  Target,
  Shield,
  Smartphone,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Multi-Account Management",
    description:
      "Manage all your bank accounts and digital wallets in one place with real-time balance tracking.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Get detailed insights into your spending patterns with interactive charts and reports.",
  },
  {
    icon: Target,
    title: "Budget Planning",
    description:
      "Set budgets for different categories and track your progress with intelligent alerts.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Bank-level security with end-to-end encryption to keep your financial data safe.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description:
      "Responsive design that works perfectly on all devices, anywhere you go.",
  },
  {
    icon: TrendingUp,
    title: "AI Insights",
    description:
      "Get personalized financial advice and monthly insights powered by AI.",
  },
];

const benefits = [
  "Track expenses across multiple accounts",
  "Set and monitor budgets in real-time",
  "Get AI-powered financial insights",
  "Secure data with bank-level encryption",
  "Export data for tax preparation",
  "Mobile-responsive interface",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-50/30 to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-emerald rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">FinTrack</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </a>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Take Control of Your
            <span className="text-primary block mt-2">Financial Future</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            FinTrack is your comprehensive financial management platform. Track
            expenses, manage budgets, and get AI-powered insights to make
            smarter financial decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-3"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Smart Finance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your finances effectively in one
            beautiful, intuitive platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose FinTrack?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who have transformed their financial
                lives with FinTrack's comprehensive suite of tools and insights.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-emerald rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <BarChart3 className="h-24 w-24 mx-auto mb-4 opacity-90" />
                  <p className="text-lg font-medium">
                    Financial Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your journey to financial freedom today. Create your account
            and begin tracking your finances.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-emerald rounded flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">FinTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FinTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

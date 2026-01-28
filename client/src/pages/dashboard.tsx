import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Expense, InsertExpense, insertExpenseSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, TrendingUp, TrendingDown, DollarSign, Sparkles, CreditCard, CalendarClock, Send, Loader2, LogOut } from "lucide-react";

// Charts & Animation
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user, logoutMutation } = useAuth();
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false); // State for Add Transaction modal
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // --- 1. FETCH REAL DATA ---
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // --- 2. SETUP ADD EXPENSE FORM ---
  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date(),
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const res = await apiRequest("POST", "/api/expenses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      form.reset();
      setIsAddOpen(false); // Close modal on success
    },
  });

  // --- 3. CALCULATE REAL STATS ---
  // In this simple app, we treat all 'expenses' as negative. 
  // You can add an 'income' type to the DB later if you want.
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = 5000 - totalExpenses; // Hardcoded "Budget" for now, or you can add a budget field to User

  // Prepare Chart Data from Real DB
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Sum up expenses for this specific day
    const dayAmount = expenses
      .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      date: format(date, 'MMM dd'),
      amount: dayAmount
    };
  });

  // Mock AI handler (kept for UI purposes)
  const handleAskGemini = () => {
    if (!question.trim()) return;
    setIsThinking(true);
    setAnswer(null);
    setTimeout(() => {
      setIsThinking(false);
      setAnswer(`Based on your data, you spent $${totalExpenses} recently. Try cutting down on high-value items.`);
    }, 2000);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground mt-1">Overview of your financial health.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => logoutMutation.mutate()}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
          <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5" onClick={() => setIsAskOpen(true)}>
            <Sparkles className="w-4 h-4 text-primary" />
            Ask Gemini
          </Button>

          {/* ADD TRANSACTION DIALOG */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Input placeholder="Groceries, Rent..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createExpenseMutation.isPending}>
                    {createExpenseMutation.isPending ? "Saving..." : "Save Expense"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-primary/10 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* STATS CARDS */}
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div whileHover={{ y: -4 }}>
              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">${totalBalance.toFixed(2)}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -4 }}>
              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-destructive">-${totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -4 }}>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 relative overflow-hidden h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-primary">Gemini Insight</CardTitle>
                  <Sparkles className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium leading-relaxed">
                    "Your spending is stable. Great job staying on track!"
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CHARTS */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4 border-primary/10">
              <CardHeader>
                <CardTitle>Spending Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* RECENT TRANSACTIONS */}
            <Card className="col-span-3 border-primary/10">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>You made {expenses.length} transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {expenses.length === 0 ? <p className="text-muted-foreground text-sm">No expenses yet.</p> : 
                    expenses.slice(0, 5).map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{txn.title}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(txn.date), 'MMM dd')}</p>
                        </div>
                      </div>
                      <div className="font-mono text-sm font-medium text-foreground">
                        -${txn.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ASK GEMINI DIALOG (UI Only) */}
      <Dialog open={isAskOpen} onOpenChange={setIsAskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ask Gemini</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea placeholder="How is my budget?" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <AnimatePresence>
              {answer && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 p-3 rounded-lg text-sm">{answer}</motion.div>}
            </AnimatePresence>
          </div>
          <DialogFooter>
            <Button onClick={handleAskGemini} disabled={isThinking}>{isThinking ? "Thinking..." : "Ask"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
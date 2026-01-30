import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Expense, InsertExpense, insertExpenseSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter"; 

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingDown, DollarSign, Sparkles, CreditCard, Loader2, LogOut, RefreshCw, Info, Heart } from "lucide-react"; 

// Charts
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // --- FETCH ---
  const { data: rawExpenses = [], isLoading, refetch } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/expenses");
      return res.json();
    },
  });

  useEffect(() => { refetch(); }, [refetch]);

  const expenses = useMemo(() => {
    return [...rawExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [rawExpenses]);

  // --- FORM ---
  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: { title: "", amount: 0, date: new Date() },
  });

  // --- SUBMIT ---
  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const formattedData = { ...data, date: data.date ? new Date(data.date).toISOString() : new Date().toISOString() };
      const res = await apiRequest("POST", "/api/expenses", formattedData);
      const text = await res.text();
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) throw new Error("Session expired.");
      try { return JSON.parse(text); } catch (err) { return text; }
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData(["/api/expenses"], (oldData: Expense[] | undefined) => {
        const currentList = oldData || [];
        if (typeof newTransaction === 'object' && newTransaction !== null) return [newTransaction, ...currentList];
        return currentList;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      form.reset({ title: "", amount: 0, date: new Date() });
      setIsAddOpen(false);
    },
    onError: (error) => { alert(`Error: ${error.message}`); }
  });

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = 5000 - totalExpenses; 
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAmount = expenses.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr).reduce((acc, curr) => acc + curr.amount, 0);
    return { date: format(date, 'MMM dd'), amount: dayAmount };
  });

  // --- REAL AI HANDLER (DEBUG MODE) ---
  const handleAskGemini = async () => {
    if (!question.trim()) return;
    setIsThinking(true);
    setAnswer(null);

    try {
      // 1. Send question
      const res = await apiRequest("POST", "/api/chat", { message: question });
      
      // 2. Parse response safely
      const data = await res.json();

      // 3. Check for server errors
      if (!res.ok) {
        throw new Error(data.message || "Server Error");
      }

      setAnswer(data.message);
    } catch (err: any) {
      // 4. SHOW THE REAL ERROR
      console.error("Gemini Error:", err);
      setAnswer(`Error: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="min-h-screen flex flex-col p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground mt-1">Overview of your financial health.</p>
        </div>
        <div className="flex gap-3">
          
          <Link href="/about">
            <Button variant="outline" className="gap-2">
              <Info className="h-4 w-4" />
              About Us
            </Button>
          </Link>

          <Button variant="outline" size="icon" onClick={() => refetch()} title="Force Refresh"><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => logoutMutation.mutate()}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          <Button variant="outline" className="gap-2" onClick={() => setIsAskOpen(true)}><Sparkles className="w-4 h-4 text-primary" /> Ask Gemini</Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Transaction</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Groceries..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full" disabled={createExpenseMutation.isPending}>Save Expense</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Remaining Budget</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Expenses</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">-${totalExpenses.toFixed(2)}</div></CardContent></Card>
              <Card className="bg-primary/5"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-primary">Gemini Insight</CardTitle><Sparkles className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-sm font-medium">"Your spending is stable. Great job!"</div></CardContent></Card>
            </div>
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="col-span-4"><CardHeader><CardTitle>Spending Trends</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} /><Tooltip /><Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={0.1} fill="hsl(var(--primary))" /></AreaChart></ResponsiveContainer></CardContent></Card>
              <Card className="col-span-3"><CardHeader><CardTitle>Recent Transactions</CardTitle><CardDescription>You made {expenses.length} transactions.</CardDescription></CardHeader><CardContent><div className="space-y-6">{expenses.slice(0, 5).map((txn) => (<div key={txn.id} className="flex items-center justify-between"><div className="flex items-center gap-4"><CreditCard className="w-4 h-4 text-primary" /><div><p className="text-sm font-medium">{txn.title}</p><p className="text-xs text-muted-foreground">{format(new Date(txn.date), 'MMM dd')}</p></div></div><div className="text-sm font-medium">-${txn.amount.toFixed(2)}</div></div>))}</div></CardContent></Card>
            </div>
          </TabsContent>
          <TabsContent value="history"><Card><CardHeader><CardTitle>Full Transaction History</CardTitle></CardHeader><CardContent><div className="space-y-4">{expenses.map((txn) => (<div key={txn.id} className="flex items-center justify-between border-b pb-2"><div><p className="font-medium">{txn.title}</p><p className="text-xs text-muted-foreground">{format(new Date(txn.date), 'yyyy-MM-dd HH:mm')}</p></div><span className="text-red-500 font-bold">-${txn.amount}</span></div>))}</div></CardContent></Card></TabsContent>
        </Tabs>
      </div>

      {/* ASK GEMINI DIALOG */}
      <Dialog open={isAskOpen} onOpenChange={setIsAskOpen}><DialogContent><DialogHeader><DialogTitle>Ask Gemini</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><Textarea placeholder="How is my budget? Am I spending too much?" value={question} onChange={(e) => setQuestion(e.target.value)} /><AnimatePresence>{answer && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 p-3 rounded-lg text-sm text-red-600 font-semibold border border-red-200">{answer}</motion.div>}</AnimatePresence></div><DialogFooter><Button onClick={handleAskGemini} disabled={isThinking}>{isThinking ? "Thinking..." : "Ask"}</Button></DialogFooter></DialogContent></Dialog>
    
      {/* FOOTER */}
      <footer className="border-t pt-6 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span>&copy; 2026 Expense Tracker. Built with</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
          
        </div>
        <p className="text-xs opacity-70">
          Developed by:- Rabbi Rasspreet Kaur, Hariom Singh & Priyanshu Sharma
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
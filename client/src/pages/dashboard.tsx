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
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

const Dashboard = () => {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  
  // --- STATES ---
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- FETCH DATA ---
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

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = 5000 - totalExpenses; 

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAmount = expenses.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr).reduce((acc, curr) => acc + curr.amount, 0);
    return { date: format(date, 'MMM dd'), amount: dayAmount };
  });

  // --- ADD EXPENSE FORM ---
  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: { title: "", amount: 0, date: new Date() },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const formattedData = { ...data, date: data.date ? new Date(data.date).toISOString() : new Date().toISOString() };
      const res = await apiRequest("POST", "/api/expenses", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      form.reset({ title: "", amount: 0, date: new Date() });
      setIsAddOpen(false);
    },
  });

  // --- NEW GEMINI HANDLER ---
  const handleAskGemini = async () => {
    if (!question.trim()) return;
    setIsThinking(true);
    setAnswer(null);
    setErrorMsg(null);

    try {
      const res = await apiRequest("POST", "/api/chat", { message: question });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unknown Server Error");
      }
      setAnswer(data.message);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsThinking(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="min-h-screen flex flex-col p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER & BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground mt-1">Overview of your financial health.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/about"><Button variant="outline" className="gap-2"><Info className="h-4 w-4" /> About Us</Button></Link>
          <Button variant="outline" onClick={() => logoutMutation.mutate()}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          
          {/* THE NEW ASK GEMINI BUTTON */}
          <Button variant="outline" className="gap-2 border-primary/50" onClick={() => setIsAskOpen(true)}>
            <Sparkles className="w-4 h-4 text-primary" /> Ask Gemini
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Transaction</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Groceries..." {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl></FormItem>)} />
                  <Button type="submit" className="w-full">Save Expense</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Remaining Budget</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Expenses</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">-${totalExpenses.toFixed(2)}</div></CardContent></Card>
        <Card className="bg-primary/5"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-primary">Gemini Insight</CardTitle><Sparkles className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-sm font-medium">"Your spending is stable. Great job!"</div></CardContent></Card>
      </div>

      {/* CHARTS & LISTS */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4"><CardHeader><CardTitle>Spending Trends</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={0.1} fill="hsl(var(--primary))" /></AreaChart></ResponsiveContainer></CardContent></Card>
            <Card className="col-span-3"><CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader><CardContent><div className="space-y-6">{expenses.slice(0, 5).map((txn) => (<div key={txn.id} className="flex items-center justify-between"><div className="flex items-center gap-4"><CreditCard className="w-4 h-4 text-primary" /><div><p className="text-sm font-medium">{txn.title}</p></div></div><div className="text-sm font-medium">-${txn.amount}</div></div>))}</div></CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="history"><Card><CardContent className="pt-6">{expenses.map((txn) => (<div key={txn.id} className="flex justify-between border-b py-2"><p>{txn.title}</p><p>-${txn.amount}</p></div>))}</CardContent></Card></TabsContent>
      </Tabs>

      {/* --- THE NEW GEMINI DIALOG --- */}
      <Dialog open={isAskOpen} onOpenChange={setIsAskOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ask Gemini AI</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Ask about your budget..." 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
            />
            
            {/* Answer Box */}
            {answer && (
              <div className="bg-green-50 p-3 rounded border border-green-200 text-green-800 text-sm">
                <strong>Gemini:</strong> {answer}
              </div>
            )}

            {/* Error Box */}
            {errorMsg && (
              <div className="bg-red-50 p-3 rounded border border-red-200 text-red-800 text-sm">
                <strong>Error:</strong> {errorMsg}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleAskGemini} disabled={isThinking}>
              {isThinking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isThinking ? "Thinking..." : "Ask Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <footer className="border-t pt-6 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Expense Tracker. Built with <Heart className="inline w-3 h-3 text-red-500" /> for GDG Project.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
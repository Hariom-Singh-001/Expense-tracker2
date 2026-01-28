import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // If the user is already logged in, kick them to the dashboard immediately
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE: The Login Form */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <AuthForm 
                  mode="login" 
                  onSubmit={(data) => loginMutation.mutate(data)} 
                  isPending={loginMutation.isPending}
                />
              </TabsContent>

              <TabsContent value="register">
                <AuthForm 
                  mode="register" 
                  onSubmit={(data) => registerMutation.mutate(data)}
                  isPending={registerMutation.isPending} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT SIDE: The Hero Image/Text */}
      <div className="hidden md:flex flex-col justify-center p-8 bg-zinc-900 text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Expense Tracker</h1>
          <p className="text-lg text-zinc-400">
            Track your expenses, visualize your spending habits, and take control of your financial future.
          </p>
        </div>
      </div>
    </div>
  );
}

// This is a helper component to avoid repeating the form code twice
function AuthForm({ mode, onSubmit, isPending }: { mode: "login" | "register", onSubmit: (data: any) => void, isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {mode === "login" ? "Login" : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
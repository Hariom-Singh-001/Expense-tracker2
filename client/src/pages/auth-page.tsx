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

// --- FIREBASE IMPORTS ---
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; 

export default function AuthPage() {
  const { user } = useAuth(); // Removed mutations as we are using custom fetch for Google
  const { loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // --- UPDATED GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = async () => {
    try {
      // 1. Open the Google Sign-in popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Retrieve the ID Token from the Firebase User
      const token = await result.user.getIdToken(); 
      
      // 3. Send the token to your Express backend
      const response = await fetch("/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // 4. Success! Redirect to dashboard
        // Using window.location.href ensures the auth state is fully refreshed
        window.location.href = "/"; 
      } else {
        const errorMsg = await response.text();
        console.error("Backend login failed:", errorMsg);
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
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

              <TabsContent value="login" className="space-y-4">
                <AuthForm 
                  mode="login" 
                  onSubmit={(data) => loginMutation.mutate(data)} 
                  isPending={loginMutation.isPending}
                />
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full" 
                  onClick={handleGoogleLogin}
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    className="w-4 h-4 mr-2" 
                    alt="Google" 
                  />
                  Login with Google
                </Button>
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
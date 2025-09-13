import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, ArrowLeft, User, Lock } from "lucide-react";

const loginSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required").min(3, "Patient ID must be at least 3 characters"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

const PatientLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      patientId: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo credentials check
      if (values.patientId === "demo" && values.password === "password") {
        toast({
          title: "Login Successful",
          description: "Welcome to your healthcare dashboard",
        });
        navigate("/patient/dashboard");
      } else {
        toast({
          title: "Login Failed", 
          description: "Invalid credentials. Try demo/password for demo access.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-soft via-background to-primary-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Login Card */}
        <Card className="healthcare-card p-8 fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-secondary" />
            </div>
            <h1 className="healthcare-heading mb-2">Patient Portal</h1>
            <p className="text-muted-foreground">
              Sign in to access your recovery journey
            </p>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your patient ID"
                          className="pl-10"
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Demo: Use "demo" / "password" to login
            </p>
            <p className="text-sm text-muted-foreground">
              Need help? Contact your healthcare provider
            </p>
            <Link to="/hospital/login" className="text-sm text-primary hover:underline">
              Hospital Staff? Login here →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;
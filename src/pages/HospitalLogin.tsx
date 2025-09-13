import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Shield, ArrowLeft, User, Lock } from "lucide-react";

const HospitalLogin = () => {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (staffId && password) {
      toast({
        title: "Login Successful",
        description: "Welcome to the hospital dashboard",
      });
      navigate("/hospital/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft flex items-center justify-center p-4">
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
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="healthcare-heading mb-2">Hospital Portal</h1>
            <p className="text-muted-foreground">
              Access patient analytics and readmission insights
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="staffId" className="text-sm font-medium">
                Hospital Staff ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="staffId"
                  type="text"
                  placeholder="Enter your staff ID"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Secure healthcare staff access
            </p>
            <Link to="/patient/login" className="text-sm text-secondary hover:underline">
              Patient? Login here →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HospitalLogin;
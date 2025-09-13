import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-16 w-16 text-primary mr-4" />
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2">
                HealthCare<span className="text-primary">+</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Hospital Readmission Prediction System
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reducing readmission rates through predictive analytics and comprehensive patient care management
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Patient Portal */}
          <Card className="healthcare-card p-8 text-center slide-up hover:scale-105 transition-all duration-300">
            <div className="mb-6">
              <Activity className="h-20 w-20 text-secondary mx-auto mb-4" />
              <h2 className="healthcare-heading mb-2">Patient Portal</h2>
              <p className="text-muted-foreground mb-6">
                Access your recovery journey, medications, and post-discharge care plan
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Track medications and schedules</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Upload discharge summaries</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Complete health checkups</span>
                </div>
              </div>
              <Link to="/patient/login" className="w-full block">
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  size="lg"
                >
                  Patient Login
                </Button>
              </Link>
            </div>
          </Card>

          {/* Hospital Portal */}
          <Card className="healthcare-card p-8 text-center slide-up hover:scale-105 transition-all duration-300 delay-100">
            <div className="mb-6">
              <Shield className="h-20 w-20 text-primary mx-auto mb-4" />
              <h2 className="healthcare-heading mb-2">Hospital Portal</h2>
              <p className="text-muted-foreground mb-6">
                Monitor patient risks, analytics, and readmission predictions
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Readmission risk analytics</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Patient monitoring dashboard</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Predictive insights</span>
                </div>
              </div>
              <Link to="/hospital/login" className="w-full block">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Hospital Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center fade-in">
          <p className="text-sm text-muted-foreground">
            © 2024 HealthCare+ System. Empowering better patient outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
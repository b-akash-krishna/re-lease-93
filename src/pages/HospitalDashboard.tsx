import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  LogOut, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity,
  Eye
} from "lucide-react";
import { HospitalSummaryCards } from "@/components/HospitalSummaryCards";
import { PatientRiskTable } from "@/components/PatientRiskTable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

const HospitalDashboard = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute requiredRole="hospital_staff">
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20">
      {/* Header */}
      <header className="healthcare-card border-b-0 rounded-none p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Hospital Dashboard
              </h1>
              <p className="text-muted-foreground">Patient readmission analytics and insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-8">
        {/* Summary Cards */}
        <HospitalSummaryCards />

        {/* Patient Risk Management */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="healthcare-heading">Patient Risk Management</h2>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <PatientRiskTable />
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <h2 className="healthcare-heading">Analytics & Insights</h2>
          <AnalyticsCharts />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default HospitalDashboard;
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  LogOut, 
  User, 
  Pill, 
  Calendar, 
  ClipboardCheck,
  Upload,
  MessageCircle,
  Clock,
  Apple,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { PatientDetails } from "@/components/PatientDetails";
import { MedicationTab } from "@/components/MedicationTab";
import { PostDischargeTab } from "@/components/PostDischargeTab";
import { CheckupTab } from "@/components/CheckupTab";
import { PredictionTab } from "@/components/PredictionTab";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

const PatientDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("details");
  const { signOut, profile } = useAuth();

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['details', 'medications', 'plan', 'checkup', 'prediction'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle custom events for tab switching
  useEffect(() => {
    const handleSwitchToCheckup = () => {
      setActiveTab('checkup');
      setSearchParams({ tab: 'checkup' });
    };

    window.addEventListener('switchToCheckup', handleSwitchToCheckup);
    return () => window.removeEventListener('switchToCheckup', handleSwitchToCheckup);
  }, [setSearchParams]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };
  
  // Mock patient data
  const patient = {
    name: profile?.display_name || "Patient",
    age: 45,
    gender: "Male",
    patientId: profile?.patient_id || profile?.id || "PT001234",
    diagnosis: "Pneumonia",
    dischargeDate: "2024-01-10",
    nextCheckup: "2024-01-17"
  };

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20">
        {/* Header */}
        <header className="healthcare-card border-b-0 rounded-none p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Hi {patient.name}, 
                </h1>
                <p className="text-muted-foreground">here's your recovery journey</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto p-4 pb-20">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="healthcare-card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recovery Progress</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={75} className="w-20 h-2" />
                    <span className="text-lg font-semibold text-success">75%</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="healthcare-card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Medications</p>
                  <p className="text-lg font-semibold text-foreground">3 of 4 taken</p>
                </div>
              </div>
            </Card>
            
            <Card className="healthcare-card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-full">
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Checkup</p>
                  <p className="text-lg font-semibold text-foreground">In 2 days</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsContent value="details">
              <PatientDetails patient={patient} />
            </TabsContent>
            
            <TabsContent value="medications">
              <MedicationTab />
            </TabsContent>
            
            <TabsContent value="plan">
              <PostDischargeTab patient={patient} />
            </TabsContent>
            
            <TabsContent value="checkup">
              <CheckupTab patient={patient} />
            </TabsContent>
            
            <TabsContent value="prediction">
              <PredictionTab patient={patient} onPredictionResult={(result) => console.log(result)} />
            </TabsContent>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
              <div className="container mx-auto">
                <TabsList className="grid w-full grid-cols-5 h-16 bg-transparent">
                  <TabsTrigger 
                    value="details" 
                    className="flex flex-col items-center space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs">Details</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="medications"
                    className="flex flex-col items-center space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Pill className="h-5 w-5" />
                    <span className="text-xs">Medications</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="plan"
                    className="flex flex-col items-center space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Post-Discharge</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="checkup"
                    className="flex flex-col items-center space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <ClipboardCheck className="h-5 w-5" />
                    <span className="text-xs">Checkup</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="prediction"
                    className="flex flex-col items-center space-y-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-xs">Prediction</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PatientDashboard;
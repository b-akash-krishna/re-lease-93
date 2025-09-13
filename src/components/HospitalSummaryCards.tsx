import { Card } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export const HospitalSummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Discharged Patients</p>
            <p className="text-3xl font-bold text-foreground">120</p>
          </div>
          <Users className="h-8 w-8 text-primary" />
        </div>
      </Card>
      
      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Predicted Readmissions</p>
            <p className="text-3xl font-bold text-destructive">25</p>
            <p className="text-sm text-muted-foreground">(21%)</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
      </Card>
      
      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Low Risk Patients</p>
            <p className="text-3xl font-bold text-success">85</p>
          </div>
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
      </Card>
      
      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">High Risk Patients</p>
            <p className="text-3xl font-bold text-warning">35</p>
          </div>
          <Clock className="h-8 w-8 text-warning" />
        </div>
      </Card>
    </div>
  );
};
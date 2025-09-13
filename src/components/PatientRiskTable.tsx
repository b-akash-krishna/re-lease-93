import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const PatientRiskTable = () => {
  const patients = [
    { id: "PT001", name: "John Smith", diagnosis: "Pneumonia", risk: "High", score: 85, nextFollowup: "2024-01-15" },
    { id: "PT002", name: "Sarah Johnson", diagnosis: "Heart Failure", risk: "Medium", score: 60, nextFollowup: "2024-01-18" },
    { id: "PT003", name: "Mike Davis", diagnosis: "Diabetes", risk: "Low", score: 25, nextFollowup: "2024-01-20" }
  ];

  return (
    <Card className="healthcare-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 font-semibold">Patient ID</th>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Diagnosis</th>
              <th className="text-left p-4 font-semibold">Risk Level</th>
              <th className="text-left p-4 font-semibold">Risk Score</th>
              <th className="text-left p-4 font-semibold">Next Follow-up</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t border-border">
                <td className="p-4">{patient.id}</td>
                <td className="p-4 font-medium">{patient.name}</td>
                <td className="p-4">{patient.diagnosis}</td>
                <td className="p-4">
                  <Badge className={`status-${patient.risk.toLowerCase()}`}>
                    {patient.risk}
                  </Badge>
                </td>
                <td className="p-4">{patient.score}%</td>
                <td className="p-4">{patient.nextFollowup}</td>
                <td className="p-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
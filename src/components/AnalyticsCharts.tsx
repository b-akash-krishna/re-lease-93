import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="healthcare-card p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Low Risk</span>
              <span>70%</span>
            </div>
            <Progress value={70} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Medium Risk</span>
              <span>20%</span>
            </div>
            <Progress value={20} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>High Risk</span>
              <span>10%</span>
            </div>
            <Progress value={10} className="h-3" />
          </div>
        </div>
      </Card>

      <Card className="healthcare-card p-6">
        <h3 className="text-lg font-semibold mb-4">Readmission Factors</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Medication Non-adherence</span>
              <span>40%</span>
            </div>
            <Progress value={40} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Symptom Persistence</span>
              <span>30%</span>
            </div>
            <Progress value={30} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Lifestyle Factors</span>
              <span>20%</span>
            </div>
            <Progress value={20} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Chronic Conditions</span>
              <span>10%</span>
            </div>
            <Progress value={10} className="h-3" />
          </div>
        </div>
      </Card>
    </div>
  );
};
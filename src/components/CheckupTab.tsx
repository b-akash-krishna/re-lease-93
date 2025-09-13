import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Thermometer,
  Activity,
  Stethoscope
} from "lucide-react";

interface Patient {
  name: string;
  age: number;
  gender: string;
  patientId: string;
  diagnosis: string;
  dischargeDate: string;
  nextCheckup: string;
}

interface CheckupTabProps {
  patient: Patient;
}

export const CheckupTab = ({ patient }: CheckupTabProps) => {
  const [checkupSchedule] = useState([
    { 
      day: "Day 1", 
      date: "2024-01-11", 
      status: "completed", 
      result: "Good progress, continue medication" 
    },
    { 
      day: "Day 7", 
      date: "2024-01-17", 
      status: "due", 
      result: null 
    },
    { 
      day: "Day 14", 
      date: "2024-01-24", 
      status: "scheduled", 
      result: null 
    }
  ]);

  const [currentCheckup, setCurrentCheckup] = useState({
    fever: null as boolean | null,
    shortness_of_breath: null as boolean | null,
    chest_pain: null as boolean | null,
    cough: null as boolean | null,
    fatigue: null as boolean | null,
    appetite: null as boolean | null,
    sleep_quality: null as boolean | null,
    medication_adherence: null as boolean | null,
    allergic_reaction: null as boolean | null
  });

  const { toast } = useToast();

  const questions = [
    {
      key: "fever" as keyof typeof currentCheckup,
      question: "Do you still have a fever (temperature above 38°C/100.4°F)?",
      icon: Thermometer,
      type: "symptom"
    },
    {
      key: "shortness_of_breath" as keyof typeof currentCheckup,
      question: "Are you experiencing shortness of breath or difficulty breathing?",
      icon: Activity,
      type: "symptom"
    },
    {
      key: "chest_pain" as keyof typeof currentCheckup,
      question: "Do you have chest pain or tightness?",
      icon: Stethoscope,
      type: "symptom"
    },
    {
      key: "cough" as keyof typeof currentCheckup,
      question: "Are you still coughing frequently or producing phlegm?",
      icon: Activity,
      type: "symptom"
    },
    {
      key: "fatigue" as keyof typeof currentCheckup,
      question: "Do you feel unusually tired or weak?",
      icon: Activity,
      type: "symptom"
    },
    {
      key: "appetite" as keyof typeof currentCheckup,
      question: "Has your appetite returned to normal?",
      icon: Activity,
      type: "recovery"
    },
    {
      key: "sleep_quality" as keyof typeof currentCheckup,
      question: "Are you sleeping well without breathing difficulties?",
      icon: Activity,
      type: "recovery"
    },
    {
      key: "medication_adherence" as keyof typeof currentCheckup,
      question: "Are you taking all medications as prescribed?",
      icon: CheckCircle,
      type: "adherence"
    },
    {
      key: "allergic_reaction" as keyof typeof currentCheckup,
      question: "Have you experienced any allergic reactions to your medications?",
      icon: AlertCircle,
      type: "safety"
    }
  ];

  const handleAnswer = (questionKey: keyof typeof currentCheckup, answer: boolean) => {
    setCurrentCheckup(prev => ({ ...prev, [questionKey]: answer }));
  };

  const submitCheckup = () => {
    const answeredQuestions = Object.values(currentCheckup).filter(answer => answer !== null);
    
    if (answeredQuestions.length < questions.length) {
      toast({
        title: "Incomplete Checkup",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }

    // Calculate risk based on answers
    const negativeSymptoms = [
      currentCheckup.fever,
      currentCheckup.shortness_of_breath,
      currentCheckup.chest_pain,
      currentCheckup.cough,
      currentCheckup.fatigue,
      currentCheckup.allergic_reaction
    ].filter(Boolean).length;

    const positiveRecovery = [
      currentCheckup.appetite,
      currentCheckup.sleep_quality,
      currentCheckup.medication_adherence
    ].filter(Boolean).length;

    let riskLevel = "low";
    let message = "✅ You're recovering well! Continue your current treatment plan.";

    if (negativeSymptoms >= 3 || currentCheckup.allergic_reaction) {
      riskLevel = "high";
      message = "⚠️ Please consult your doctor immediately. Some symptoms need attention.";
    } else if (negativeSymptoms >= 1 || positiveRecovery < 2) {
      riskLevel = "medium";
      message = "⚠️ Your recovery is progressing, but please monitor symptoms closely.";
    }

    toast({
      title: "Checkup Submitted",
      description: message,
      variant: riskLevel === "high" ? "destructive" : "default",
    });

    // Reset form
    setCurrentCheckup({
      fever: null,
      shortness_of_breath: null,
      chest_pain: null,
      cough: null,
      fatigue: null,
      appetite: null,
      sleep_quality: null,
      medication_adherence: null,
      allergic_reaction: null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "due": return "text-warning";
      case "scheduled": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "due": return AlertCircle;
      case "scheduled": return Clock;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Checkup Schedule */}
      <Card className="healthcare-card p-6">
        <h3 className="healthcare-heading mb-4">Checkup Schedule</h3>
        
        <div className="space-y-4">
          {checkupSchedule.map((checkup, index) => {
            const StatusIcon = getStatusIcon(checkup.status);
            
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center space-x-4">
                  <StatusIcon className={`h-6 w-6 ${getStatusColor(checkup.status)}`} />
                  <div>
                    <h4 className="font-semibold">{checkup.day} Post-Discharge</h4>
                    <p className="text-sm text-muted-foreground">{checkup.date}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={checkup.status === "completed" ? "default" : "outline"}
                    className={
                      checkup.status === "completed" ? "bg-success/10 text-success" :
                      checkup.status === "due" ? "bg-warning/10 text-warning" :
                      "bg-muted/10 text-muted-foreground"
                    }
                  >
                    {checkup.status.charAt(0).toUpperCase() + checkup.status.slice(1)}
                  </Badge>
                  {checkup.result && (
                    <p className="text-sm text-muted-foreground mt-1">{checkup.result}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Current Checkup Form */}
      <Card className="healthcare-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h3 className="healthcare-heading">Day 7 Health Checkup</h3>
            <p className="text-muted-foreground">
              Please answer the following questions about your current health status
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.key} className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-start space-x-3 mb-4">
                <q.icon className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <p className="font-medium mb-2">{q.question}</p>
                  <div className="flex space-x-3">
                    <Button
                      variant={currentCheckup[q.key] === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswer(q.key, false)}
                      className={currentCheckup[q.key] === false ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
                    >
                      No
                    </Button>
                    <Button
                      variant={currentCheckup[q.key] === true ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleAnswer(q.key, true)}
                    >
                      Yes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button 
            onClick={submitCheckup} 
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            Submit Checkup Results
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Your responses will be securely shared with your healthcare team
          </p>
        </div>
      </Card>
    </div>
  );
};
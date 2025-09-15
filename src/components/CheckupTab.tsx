import { useState, useEffect, useCallback } from "react";
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
  Stethoscope,
  Loader2,
  Bell,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

// --- TYPE DEFINITIONS ---
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

type CheckupQuestions = {
  fever: boolean | null;
  shortness_of_breath: boolean | null;
  chest_pain: boolean | null;
  cough: boolean | null;
  fatigue: boolean | null;
  appetite: boolean | null;
  sleep_quality: boolean | null;
  medication_adherence: boolean | null;
  allergic_reaction: boolean | null;
};

// --- INITIAL STATE & CONSTANTS ---
const QUESTIONS = [
  {
    key: "fever" as keyof CheckupQuestions,
    question: "Do you still have a fever (temperature above 38°C/100.4°F)?",
    icon: Thermometer,
    type: "symptom"
  },
  {
    key: "shortness_of_breath" as keyof CheckupQuestions,
    question: "Are you experiencing shortness of breath or difficulty breathing?",
    icon: Activity,
    type: "symptom"
  },
  {
    key: "chest_pain" as keyof CheckupQuestions,
    question: "Do you have chest pain or tightness?",
    icon: Stethoscope,
    type: "symptom"
  },
  {
    key: "cough" as keyof CheckupQuestions,
    question: "Are you still coughing frequently or producing phlegm?",
    icon: Activity,
    type: "symptom"
  },
  {
    key: "fatigue" as keyof CheckupQuestions,
    question: "Do you feel unusually tired or weak?",
    icon: Activity,
    type: "symptom"
  },
  {
    key: "appetite" as keyof CheckupQuestions,
    question: "Has your appetite returned to normal?",
    icon: Activity,
    type: "recovery"
  },
  {
    key: "sleep_quality" as keyof CheckupQuestions,
    question: "Are you sleeping well without breathing difficulties?",
    icon: Activity,
    type: "recovery"
  },
  {
    key: "medication_adherence" as keyof CheckupQuestions,
    question: "Are you taking all medications as prescribed?",
    icon: CheckCircle,
    type: "adherence"
  },
  {
    key: "allergic_reaction" as keyof CheckupQuestions,
    question: "Have you experienced any allergic reactions to your medications?",
    icon: AlertCircle,
    type: "safety"
  }
];

// --- MAIN COMPONENT ---
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

  const [currentCheckup, setCurrentCheckup] = useState<CheckupQuestions>({
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const handleAnswer = (questionKey: keyof CheckupQuestions, answer: boolean) => {
    setCurrentCheckup(prev => ({ ...prev, [questionKey]: answer }));
  };

  const submitCheckup = async () => {
    if (!profile) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit your checkup.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Check if all questions have been answered
      const answeredQuestions = Object.values(currentCheckup).filter(answer => answer !== null);
      if (answeredQuestions.length < QUESTIONS.length) {
        toast({
          title: "Incomplete Checkup",
          description: "Please answer all questions before submitting.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Step 2: Get the patient's ID and emergency contact email
      console.log("Fetching patient details for profile ID:", profile.id);
      
      const { data: patientData, error: patientError } = await supabase
        .from('patient_details')
        .select('id, emergency_contact_email, first_name, last_name')
        .eq('profile_id', profile.id)
        .single();
      
      console.log("Patient data response:", { patientData, patientError });
      
      if (patientError) {
        if (patientError.code === 'PGRST116') {
          // No patient details found
          throw new Error("Please complete your patient details first before submitting a checkup.");
        }
        throw new Error(`Database error: ${patientError.message}`);
      }
      
      if (!patientData) {
        throw new Error("Patient details not found. Please complete your profile first.");
      }
      
      const patientId = patientData.id;
      const emergencyEmail = patientData.emergency_contact_email;
      const patientName = `${patientData.first_name} ${patientData.last_name}`;
      
      console.log("Found patient:", { patientId, emergencyEmail, patientName });
      
      // Step 3: Insert the checkup responses into the checkup_responses table
      const checkupPayload = {
        patient_id: patientId,
        checkup_date: new Date().toISOString(),
        responses: currentCheckup,
        risk_score: 0, // Will be updated below
        prediction_result: null, // Placeholder for future ML integration
        triggered_alert: false, // Will be updated below
      };
      
      console.log("Inserting checkup payload:", checkupPayload);
      
      const { data: checkupData, error: insertError } = await supabase
        .from('checkup_responses')
        .insert(checkupPayload)
        .select('*')
        .single();
        
      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to save checkup: ${insertError.message}`);
      }
      
      console.log("Checkup inserted successfully:", checkupData);
      
      // Step 4: Calculate risk based on answers and update the database
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
      let triggeredAlert = false;
      
      if (negativeSymptoms >= 3 || currentCheckup.allergic_reaction) {
        riskLevel = "high";
        message = "⚠️ Please consult your doctor immediately. Some symptoms need attention.";
        triggeredAlert = true;
      } else if (negativeSymptoms >= 1 || positiveRecovery < 2) {
        riskLevel = "medium";
        message = "⚠️ Your recovery is progressing, but please monitor symptoms closely.";
      }
      
      // Step 5: Update the database with the risk score and triggered alert status
      const { error: updateError } = await supabase
        .from('checkup_responses')
        .update({ 
          risk_score: negativeSymptoms, 
          triggered_alert: triggeredAlert 
        })
        .eq('id', checkupData.id);
        
      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(`Failed to update risk assessment: ${updateError.message}`);
      }
      
      // Step 6: Log alert information (placeholder for actual alert system)
      if (triggeredAlert && emergencyEmail) {
        console.log(`ALERT: Patient ${patientName} (ID: ${patientId}) has a high risk score.`);
        console.log(`Emergency contact email: ${emergencyEmail}`);
        // TODO: Implement actual email notification system
      }
      
      // Step 7: Show a success toast
      toast({
        title: "Checkup Submitted",
        description: message,
        variant: riskLevel === "high" ? "destructive" : "default",
      });
      
      // Step 8: Reset form
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
      
    } catch (error: any) {
      console.error("Failed to submit checkup:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "due": return "text-yellow-600";
      case "scheduled": return "text-gray-500";
      default: return "text-gray-500";
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
                      checkup.status === "completed" ? "bg-green-100 text-green-800 border-green-300" :
                      checkup.status === "due" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                      "bg-gray-100 text-gray-600 border-gray-300"
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
          {QUESTIONS.map((q, index) => (
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
                      className={currentCheckup[q.key] === false ? "bg-green-600 hover:bg-green-700 text-white" : ""}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Checkup Results"
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Your responses will be securely shared with your healthcare team
          </p>
        </div>
      </Card>
    </div>
  );
};
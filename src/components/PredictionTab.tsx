import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// --- TYPE DEFINITIONS ---\r\n
interface Patient {
  name: string;
  age: number;
  gender: string;
  patientId: string;
  diagnosis: string;
  dischargeDate: string;
  nextCheckup: string;
}

interface PredictionTabProps {
  patient: Patient;
  onPredictionResult: (result: string) => void;
}

type CheckupQuestions = {
  fever: boolean;
  shortness_of_breath: boolean;
  chest_pain: boolean;
  cough: boolean;
  fatigue: boolean;
  appetite: boolean;
  sleep_quality: boolean;
  medication_adherence: boolean;
  allergic_reaction: boolean;
};

// --- MAIN COMPONENT ---
export const PredictionTab = ({ patient, onPredictionResult }: PredictionTabProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [latestCheckup, setLatestCheckup] = useState<CheckupQuestions | null>(null);

  // Fetch patient details and latest checkup data on component load
  const fetchData = useCallback(async () => {
    if (!profile?.id) {
      toast({ title: "Error", description: "Profile not found. Please log in again.", variant: "destructive" });
      return;
    }

    try {
      // Fetch Patient Details from Supabase
      const { data: detailsData, error: detailsError } = await supabase
        .from('patient_details')
        .select('*')
        .eq('profile_id', profile.id) // FIX: Changed 'user_id' to 'profile_id' to match your schema
        .single();

      if (detailsError) throw detailsError;
      setPatientDetails(detailsData);
      
      // Fetch the most recent checkup response from Supabase
      const { data: checkupData, error: checkupError } = await supabase
        .from('checkup_responses')
        .select('responses')
        .eq('patient_id', detailsData.id)
        .order('created_at', { ascending: false }) // Assuming a 'created_at' column
        .limit(1)
        .single();
      
      if (checkupError) {
        if (checkupError.code === 'PGRST116') { // No rows found
          setLatestCheckup(null);
        } else {
          throw checkupError;
        }
      }
      setLatestCheckup(checkupData?.responses || null);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ title: "Error", description: "Could not load patient data for prediction.", variant: "destructive" });
    }
  }, [profile, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGetPrediction = async () => {
    setIsLoading(true);
    setPrediction(null);
    
    if (!patientDetails || !latestCheckup) {
      toast({
        title: "Prediction Error",
        description: "Please ensure your details and a recent checkup are submitted.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Prepare data for the model
      // This is a placeholder; you must match the exact features your model expects.
      const features = {
        age: patientDetails.age,
        gender: patientDetails.gender,
        diagnosis: patientDetails.diagnosis,
        // Include checkup responses as features
        checkup_fever: latestCheckup.fever,
        checkup_shortness_of_breath: latestCheckup.shortness_of_breath,
        checkup_chest_pain: latestCheckup.chest_pain,
        checkup_cough: latestCheckup.cough,
        checkup_fatigue: latestCheckup.fatigue,
        checkup_allergic_reaction: latestCheckup.allergic_reaction,
        // You'll need to transform these into numerical format for the model
      };
      
      // 2. Call the Python backend API
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPrediction(data.prediction);
      onPredictionResult(data.prediction);

      toast({
        title: "Prediction Complete",
        description: `Predicted Readmission: ${data.prediction}`,
        variant: data.prediction === 'Yes' ? 'destructive' : 'default',
      });
      
    } catch (error: any) {
      console.error("Failed to get prediction:", error);
      toast({
        title: "Prediction Failed",
        description: `Could not get a prediction. Is the backend server running? ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToCheckup = () => {
    navigate('/patient-dashboard?tab=checkup');
  };

  return (
    <div className="space-y-6 fade-in">
      <Card className="healthcare-card p-6 text-center">
        <h3 className="healthcare-heading">Readmission Prediction</h3>
        <p className="text-muted-foreground mt-2">
          Use the power of AI to predict the likelihood of readmission within 30 days.
        </p>
        <Button 
          onClick={handleGetPrediction} 
          disabled={isLoading || !patientDetails || !latestCheckup}
          className="mt-6 w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Prediction...
            </>
          ) : (
            "Get Prediction"
          )}
        </Button>
        {!patientDetails && (
          <p className="text-sm text-red-500 mt-2">
            Please fill out the Patient Details tab first.
          </p>
        )}
        {!latestCheckup && (
          <p className="text-sm text-yellow-500 mt-2">
            A recent checkup is required for a more accurate prediction.
          </p>
        )}
      </Card>

      {prediction && (
        <Card className={`healthcare-card p-6 ${prediction === 'Yes' ? 'border-red-500' : 'border-green-500'}`}>
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${prediction === 'Yes' ? 'bg-red-100' : 'bg-green-100'}`}>
              <span className={`font-bold text-lg ${prediction === 'Yes' ? 'text-red-500' : 'text-green-500'}`}>
                {prediction}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Predicted Readmission: {prediction}</h4>
              {prediction === 'Yes' ? (
                <p className="text-red-500 mt-1">
                  Based on your data, there is a likelihood of readmission. We recommend you complete your checkups.
                </p>
              ) : (
                <p className="text-green-500 mt-1">
                  The model predicts you are not at high risk for readmission.
                </p>
              )}
            </div>
          </div>
          {prediction === 'Yes' && (
            <Button 
              onClick={handleGoToCheckup} 
              className="mt-4 w-full md:w-auto bg-red-600 hover:bg-red-700"
            >
              Start Your Checkup Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};
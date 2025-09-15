import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { HospitalDataForm } from "./HospitalDataForm"; // You'll need to create this component

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

interface PredictionTabProps {
  patient: Patient;
  onPredictionResult: (result: string) => void;
}

interface HospitalData {
  age: number;
  length_of_stay: number;
  num_lab_procedures: number;
  num_other_procedures: number;
  num_medications: number;
  outpatient_visits: number;
  previous_inpatient_stays: number;
  emergency_visits: number;
  diabetes_medication: string;
  glucose_test: string;
  a1c_test: string;
}

interface PredictionResponse {
  prediction: string;
  confidence: string;
  risk_factors: {
    age: number;
    length_of_stay: number;
    previous_hospitalizations: number;
    emergency_visits: number;
    diabetes_medication: boolean;
    total_procedures: number;
  };
  model_available: boolean;
  timestamp: string;
}

// --- MAIN COMPONENT ---
export const PredictionTab = ({ patient, onPredictionResult }: PredictionTabProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [hospitalData, setHospitalData] = useState<HospitalData | null>(null);
  const [showDataForm, setShowDataForm] = useState(true);

  // Check if we have saved hospital data
  useEffect(() => {
    loadSavedHospitalData();
  }, [profile]);

  const loadSavedHospitalData = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('hospital_data') // You'll need to create this table
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (!error && data) {
        setHospitalData(data);
        setShowDataForm(false);
      }
    } catch (error) {
      console.log("No saved hospital data found - showing form");
    }
  };

  const saveHospitalData = async (data: HospitalData) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to save hospital data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('hospital_data')
        .upsert({
          profile_id: profile.id,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setHospitalData(data);
      setShowDataForm(false);
      
      toast({
        title: "Data Saved",
        description: "Hospital data has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Failed to save hospital data:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Could not save hospital data.",
        variant: "destructive",
      });
    }
  };

  const handleGetPrediction = async () => {
    if (!hospitalData) {
      toast({
        title: "Missing Data",
        description: "Please provide hospital data first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPrediction(null);

    try {
      // Call the Python backend API with the correct feature format
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hospitalData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data: PredictionResponse = await response.json();
      setPrediction(data);
      onPredictionResult(data.prediction);

      // Save prediction to database
      await savePredictionResult(data);

      toast({
        title: "Prediction Complete",
        description: `Predicted Readmission: ${data.prediction}`,
        variant: data.prediction === 'Yes' ? 'destructive' : 'default',
      });
      
    } catch (error: any) {
      console.error("Failed to get prediction:", error);
      toast({
        title: "Prediction Failed",
        description: error.message.includes('fetch') 
          ? "Could not connect to prediction server. Please ensure the backend is running on http://localhost:5000"
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePredictionResult = async (predictionData: PredictionResponse) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('prediction_results')
        .insert({
          profile_id: profile.id,
          prediction: predictionData.prediction,
          confidence: predictionData.confidence,
          risk_factors: predictionData.risk_factors,
          model_available: predictionData.model_available,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error("Could not save prediction result:", error);
      // Don't show error to user as this is not critical
    }
  };

  const handleEditData = () => {
    setShowDataForm(true);
    setPrediction(null);
  };

  if (showDataForm) {
    return (
      <div className="space-y-6 fade-in">
        <HospitalDataForm 
          onDataSubmit={saveHospitalData}
          initialData={hospitalData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Hospital Data Summary */}
      <Card className="healthcare-card p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Hospital Data Summary</h3>
            <p className="text-muted-foreground">Data used for readmission prediction</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleEditData}>
            Edit Data
          </Button>
        </div>
        
        {hospitalData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{hospitalData.age} years</p>
            </div>
            <div>
              <p className="text-muted-foreground">Length of Stay</p>
              <p className="font-medium">{hospitalData.length_of_stay} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Procedures</p>
              <p className="font-medium">{hospitalData.num_lab_procedures + hospitalData.num_other_procedures}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Medications</p>
              <p className="font-medium">{hospitalData.num_medications}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Previous Stays</p>
              <p className="font-medium">{hospitalData.previous_inpatient_stays}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ER Visits</p>
              <p className="font-medium">{hospitalData.emergency_visits}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Diabetes Meds</p>
              <p className="font-medium">{hospitalData.diabetes_medication === 'yes' ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">A1C Result</p>
              <p className="font-medium capitalize">{hospitalData.a1c_test}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Prediction Section */}
      <Card className="healthcare-card p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">30-Day Readmission Prediction</h3>
        <p className="text-muted-foreground mb-6">
          AI-powered prediction based on your hospital administrative data
        </p>
        
        <Button 
          onClick={handleGetPrediction} 
          disabled={isLoading || !hospitalData}
          className="px-8 py-3"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Data...
            </>
          ) : (
            "Get Readmission Prediction"
          )}
        </Button>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card className={`healthcare-card p-6 border-2 ${
          prediction.prediction === 'Yes' 
            ? 'border-red-200 bg-red-50' 
            : 'border-green-200 bg-green-50'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${
              prediction.prediction === 'Yes' 
                ? 'bg-red-100' 
                : 'bg-green-100'
            }`}>
              {prediction.prediction === 'Yes' ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-xl font-semibold">
                  Readmission Risk: {prediction.prediction}
                </h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  prediction.prediction === 'Yes'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {prediction.prediction === 'Yes' ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
              
              <p className={`mb-4 ${
                prediction.prediction === 'Yes' ? 'text-red-700' : 'text-green-700'
              }`}>
                {prediction.prediction === 'Yes' 
                  ? "The model indicates a higher likelihood of readmission within 30 days. Please follow up with your healthcare team and adhere to your discharge plan."
                  : "The model indicates a lower likelihood of readmission. Continue following your discharge instructions and attend scheduled appointments."
                }
              </p>
              
              <div className="text-sm text-muted-foreground mb-4">
                <p>{prediction.confidence}</p>
                <p>Generated: {new Date(prediction.timestamp).toLocaleString()}</p>
              </div>

              {/* Risk Factors Breakdown */}
              <div className="border-t pt-4">
                <h5 className="font-medium mb-3">Key Risk Factors Analyzed:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-medium">{prediction.risk_factors.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Length of Stay:</span>
                    <span className="font-medium">{prediction.risk_factors.length_of_stay} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Stays:</span>
                    <span className="font-medium">{prediction.risk_factors.previous_hospitalizations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ER Visits:</span>
                    <span className="font-medium">{prediction.risk_factors.emergency_visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Procedures:</span>
                    <span className="font-medium">{prediction.risk_factors.total_procedures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diabetes Meds:</span>
                    <span className="font-medium">{prediction.risk_factors.diabetes_medication ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="border-t pt-4 mt-4">
                <h5 className="font-medium mb-2">Recommendations:</h5>
                {prediction.prediction === 'Yes' ? (
                  <ul className="text-sm space-y-1 text-red-700">
                    <li>• Schedule immediate follow-up with your primary care physician</li>
                    <li>• Ensure strict adherence to all medications</li>
                    <li>• Monitor symptoms closely and seek help if they worsen</li>
                    <li>• Complete all recommended lab work and tests</li>
                    <li>• Consider additional support services or home health care</li>
                  </ul>
                ) : (
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Continue following your discharge instructions</li>
                    <li>• Attend all scheduled follow-up appointments</li>
                    <li>• Take medications as prescribed</li>
                    <li>• Maintain healthy lifestyle habits</li>
                    <li>• Contact your doctor if new symptoms develop</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Model Status */}
      {prediction && (
        <Card className="healthcare-card p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Model Status: {prediction.model_available ? '✅ AI Model Active' : '⚠️ Using Rule-based Fallback'}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGetPrediction}
              disabled={isLoading}
            >
              Refresh Prediction
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  MessageCircle,
  Pill,
  Clock,
  CheckCircle,
  FileText,
  Bot,
  X,
  File as FileIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeminiService } from "@/integrations/gemini";
import { Database } from "@/integrations/supabase/types";

// Configure pdfjs-dist worker. Make sure 'pdf.worker.min.js' is in your public folder.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// --- TYPE DEFINITIONS ---
type MedicationRow = Database["public"]["Tables"]["medications"]["Row"];
type MedicationInsert = Database["public"]["Tables"]["medications"]["Insert"];
type PatientDetailsRow = Database["public"]["Tables"]["patient_details"]["Row"];

export interface Medication {
  id: string; // This will now be the UUID from the database
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string[];
  taken: boolean[];
  purpose: string;
}

interface ChatMessage {
  id: number;
  type: "bot" | "user";
  message: string;
  isLoading?: boolean;
}

// --- INITIAL STATE & CONSTANTS ---
const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    type: "bot",
    message:
      "Hello! I'm your AI medication assistant powered by Gemini. I can help you understand your medications, answer questions about side effects, interactions, and provide personalized guidance. How can I help you today?",
  },
];

// --- PDF PROCESSING LOGIC (unchanged) ---
const extractTextFromPDF = async (file: File): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        console.log("FileReader loaded, starting PDF parsing...");
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log("PDF document loaded successfully. Number of pages:", pdf.numPages);
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
          fullText += pageText + '\n';
        }
        console.log("Finished extracting text from PDF. Extracted text length:", fullText.length);
        resolve(fullText);
      } catch (error) {
        console.error("Error in PDF parsing process:", error);
        reject(new Error('Could not parse PDF text. The file might be corrupted or image-based.'));
      }
    };
    reader.onerror = () => {
      console.error("FileReader failed to read the file.");
      reject(new Error('Failed to read the file.'));
    };
    reader.readAsArrayBuffer(file);
  });
};

const parseMedicationsFromText = (text: string): Omit<MedicationInsert, 'patient_id'>[] => {
    const cleanText = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
    const medications: Omit<MedicationInsert, 'patient_id'>[] = [];

    const medicationPatterns = [
        /(?<name>[A-Z][a-zA-Z\s\-()]+?)\s+(?<dosage>\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?|puffs?|tablets?))\s*[-–]?\s*(?<freq>.*?)(?=\s*[A-Z][a-zA-Z\s\-()]+?\s+\d+|$)/gi
    ];

    for (const pattern of medicationPatterns) {
        let match;
        while ((match = pattern.exec(cleanText)) !== null) {
            const { name, dosage, freq } = match.groups || {};
            
            if (!name || !dosage || name.length < 3) continue;

            const frequencyText = freq?.trim() || 'As prescribed';
            let purpose = 'As prescribed by doctor';
            const purposeMatch = frequencyText.match(/(for|to treat)\s+([a-zA-Z\s,]+)/i);
            if (purposeMatch) {
                purpose = purposeMatch[0];
            }

            let frequency = '';
            let timing: string[] = [];
            const lowerFreq = frequencyText.toLowerCase();

            if (lowerFreq.includes('once daily') || lowerFreq.includes('qd')) {
                timing = ['Take once in the Morning'];
                frequency = 'Once daily';
            } else if (lowerFreq.includes('twice daily') || lowerFreq.includes('bid')) {
                timing = ['Take morning dose', 'Take evening dose'];
                frequency = 'Twice daily';
            } else if (lowerFreq.includes('three times daily') || lowerFreq.includes('tid')) {
                timing = ['Take morning dose', 'Take noon dose', 'Take evening dose'];
                frequency = 'Three times daily';
            } else if (lowerFreq.includes('four times daily') || lowerFreq.includes('qid')) {
                timing = ['Take morning dose', 'Take noon dose', 'Take evening dose', 'Take night dose'];
                frequency = 'Four times daily';
            } else if (lowerFreq.includes('at bedtime') || lowerFreq.includes('hs')) {
                timing = ['Take at bedtime'];
                frequency = 'At bedtime';
            } else if (lowerFreq.includes('as needed') || lowerFreq.includes('prn')) {
                timing = ['Take as needed for symptoms'];
                frequency = 'As needed';
            } else if (lowerFreq.match(/every\s+(\d+)\s+hours/)) {
                const hours = parseInt(lowerFreq.match(/every\s+(\d+)\s+hours/)?.[1] || '0');
                if (hours > 0) {
                    const numTimes = 24 / hours;
                    timing = Array.from({ length: numTimes }, (_, i) => `Take dose at hour ${(i * hours) % 24}`);
                    frequency = `Every ${hours} hours`;
                }
            } else {
                 const generalTimes = frequencyText.match(/(Morning|Evening|Night|Afternoon|Noon|Bedtime)/gi);
                 if (generalTimes) {
                     timing = [...new Set(generalTimes)].map(t => `Take ${t} dose`);
                     frequency = frequencyText;
                 }
            }

            if (timing.length === 0) {
              timing = ['As prescribed'];
              frequency = frequencyText;
            }

            medications.push({
                name: name.trim(),
                dosage: dosage.trim(),
                frequency: frequency || 'As prescribed',
                timing,
                taken: new Array(timing.length).fill(false),
                purpose,
            });
        }
    }
    
    // Filtering duplicates. Note: This assumes `name` and `dosage` are unique identifiers.
    const uniqueMedications = medications.filter((med, index, self) =>
        index === self.findIndex(m =>
            m.name.toLowerCase() === med.name.toLowerCase() &&
            m.dosage.toLowerCase() === med.dosage.toLowerCase()
        )
    );
    
    return uniqueMedications;
};

// --- HELPER & CHILD COMPONENTS (mostly unchanged) ---
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const FileUploadCard: React.FC<{
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  uploadedFile: File | null;
  isProcessing: boolean;
}> = ({ onFileChange, onRemoveFile, uploadedFile, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
      <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Discharge Summary</h3>
      <p className="text-gray-600 mb-4">
        Automatically extract medication information from your hospital discharge summary (PDF only).
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileChange}
        className="hidden"
      />
      {!uploadedFile && (
        <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="h-4 w-4 mr-2" />
          Choose PDF File
        </Button>
      )}
      {uploadedFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-left">
              <FileIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-gray-900 truncate max-w-[200px]">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemoveFile} disabled={isProcessing} className="h-8 w-8 hover:bg-red-100">
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-left">
            {isProcessing ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing medications...</span>
              </div>
            ) : (
              <span className="text-green-600 font-medium">✅ Medications updated.</span>
            )}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2">PDF format only. Max 10MB.</p>
    </Card>
  );
};

const MedicationCard: React.FC<{
  med: Medication;
  onToggle: (medId: string, timeIndex: number) => void;
  isSaving?: boolean;
}> = ({ med, onToggle, isSaving }) => (
  <Card className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-blue-50 rounded-full"><Pill className="h-6 w-6 text-blue-600" /></div>
      <div>
        <h4 className="font-semibold text-xl text-gray-900">{med.name}</h4>
        <p className="text-sm text-gray-600 mt-1">{med.purpose}</p>
      </div>
    </div>

    <div className="mt-6 space-y-4">
      <div>
        <h5 className="text-sm font-semibold text-gray-800 mb-2">Dosage</h5>
        <p className="text-gray-600">{med.dosage}</p>
      </div>
      <div>
        <h5 className="text-sm font-semibold text-gray-800 mb-2">Instructions</h5>
        <p className="text-gray-600 mb-3">
          You should take this <strong className="text-blue-600">{med.frequency}</strong>.
        </p>
        <ul className="space-y-2">
          {med.timing.map((time, index) => (
            <li key={index} className="flex items-center justify-between p-3 rounded-md bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                {med.taken[index] ? 
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" /> : 
                  <Clock className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                }
                <span className={`text-sm ${med.taken[index] ? "text-gray-500 line-through" : "text-gray-800"}`}>
                  {time}
                </span>
              </div>
              <Button 
                onClick={() => onToggle(med.id, index)} 
                variant={med.taken[index] ? "outline" : "default"}
                size="sm"
                className={med.taken[index] ? "text-gray-700" : "bg-blue-600 hover:bg-blue-700"}
                disabled={isSaving}
              >
                {med.taken[index] ? 'Undo' : 'Mark as Taken'}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
);

const MedicationList: React.FC<{
  medications: Medication[];
  onToggleMedication: (medId: string, timeIndex: number) => void;
  isLoading: boolean;
  isSaving: boolean;
}> = ({ medications, onToggleMedication, isLoading, isSaving }) => {
  if (isLoading) {
    return (
        <Card className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 shadow-sm text-center">
          <Loader2 className="h-10 w-10 text-gray-400 mx-auto animate-spin" />
          <h4 className="font-semibold text-gray-800 mt-4">Loading Medications...</h4>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Your Medications</h3>
      {medications.length > 0 ? (
        medications.map((med) => (
          <MedicationCard key={med.id} med={med} onToggle={onToggleMedication} isSaving={isSaving} />
        ))
      ) : (
        <Card className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 shadow-sm text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-800">No Medications Found</h4>
          <p className="text-gray-500 mt-2">
            Your medication list is empty. Upload a discharge summary to get started.
          </p>
        </Card>
      )}
    </div>
  );
}

const Chatbot: React.FC<{
  medications: Medication[];
}> = ({ medications }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiService = GEMINI_API_KEY ? new GeminiService(GEMINI_API_KEY) : null;

  const getFallbackResponse = useCallback((message: string): string => {
    const lowerMessage = message.toLowerCase();
    for (const med of medications) {
      if (lowerMessage.includes(med.name.toLowerCase())) {
        return `Regarding ${med.name}: The prescribed dosage is ${med.dosage}, to be taken ${med.frequency.toLowerCase()}. It's primarily for ${med.purpose.toLowerCase()}. Always follow your doctor's advice.`;
      }
    }
    if (lowerMessage.includes("side effect")) {
      return "Common side effects are often mild. However, if you experience severe reactions like difficulty breathing, a severe rash, or swelling, please contact your doctor or emergency services immediately.";
    } else if (lowerMessage.includes("when") || lowerMessage.includes("time")) {
      return "You can see the specific timings for each medication listed above. Sticking to this schedule is important for the best results.";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I can still help with basic medication questions!";
    } else {
      const medNames = medications.map(med => med.name).join(', ');
      return `I can provide basic information about your medications: ${medNames}.`;
    }
  }, [medications]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = { 
      id: Date.now(), 
      type: "user", 
      message: newMessage 
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const loadingMessage: ChatMessage = {
      id: Date.now() + 1,
      type: "bot",
      message: "Thinking...",
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);
    
    const currentMessage = newMessage;
    setNewMessage("");

    try {
      let botResponse: string;
      if (geminiService) {
        botResponse = await geminiService.generateResponse(currentMessage, medications);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        botResponse = getFallbackResponse(currentMessage);
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, message: botResponse, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { 
                ...msg, 
                message: `I'm having trouble connecting to the AI service right now. ${errorMessage}. Here's what I can tell you: ${getFallbackResponse(currentMessage)}`,
                isLoading: false 
              }
            : msg
        )
      );
    }

    setTimeout(() => {
      chatContainerRef.current?.scrollTo({ 
        top: chatContainerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }, 100);
  };
  
  return (
    <Card className="healthcare-card p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Bot className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">
          Medication Assistant
          {geminiService && <Badge variant="secondary" className="ml-2 text-xs">Powered by Gemini</Badge>}
        </h3>
      </div>
      
      {geminiService === null ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Gemini AI is not configured.</h4>
          </div>
          <p className="text-sm text-yellow-700">
            Please add your Gemini API key to the .env file to enable AI assistance.
          </p>
        </div>
      ) : null}
      
      <div ref={chatContainerRef} className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            {msg.type === 'bot' && (
              <div className="p-2 bg-gray-100 rounded-full h-8 w-8 flex-shrink-0">
                {msg.isLoading ? (
                  <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
            )}
            <div className={`max-w-xs p-3 rounded-lg ${msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask about your medications..."
          className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || messages.some(msg => msg.isLoading)}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

// --- MAIN COMPONENT ---
export const MedicationTab = () => {
    const { toast } = useToast();
    const [medications, setMedications] = useState<MedicationRow[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { profile } = useAuth();
    
    // Fetch patient ID and medications on component mount
    const fetchMedications = useCallback(async () => {
      if (!profile?.id) {
          setIsLoading(false);
          return;
      }
      try {
          setIsLoading(true);
          // 1. Fetch the patient's ID from patient_details table using their profile_id
          const { data: patientData, error: patientError } = await supabase
              .from('patient_details')
              .select('id')
              .eq('profile_id', profile.id)
              .single();

          if (patientError) {
              // This is an expected error if the patient profile hasn't been completed yet
              if (patientError.code === 'PGRST116') {
                  setMedications([]);
                  return;
              }
              throw patientError;
          }

          if (!patientData) {
              setMedications([]);
              return;
          }

          // 2. Use the patient ID to fetch medications
          const { data, error, status } = await supabase
              .from('medications')
              .select('*')
              .eq('patient_id', patientData.id);

          if (error && status !== 406) {
              throw error;
          }
          
          setMedications(data || []);
      } catch (error) {
          console.error("Failed to fetch medications:", error);
          toast({
              title: "Error",
              description: "Could not load medications. Please try again later.",
              variant: "destructive",
          });
      } finally {
          setIsLoading(false);
      }
    }, [profile?.id, toast]);

    useEffect(() => {
        fetchMedications();
    }, [fetchMedications]);
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
        toast({ title: "Invalid File Type", description: "Please upload a valid PDF file.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "File Too Large", description: "Please upload a file smaller than 10MB.", variant: "destructive" });
        return;
      }
      
      setUploadedFile(file);
      setIsProcessing(true);
      
      try {
        const text = await extractTextFromPDF(file);
        const parsedMedications = parseMedicationsFromText(text);

        if (!profile?.id) {
          toast({ title: "Error", description: "Profile not found. Please log in again.", variant: "destructive" });
          return;
        }

        const { data: patientData, error: patientError } = await supabase
            .from('patient_details')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

        if (patientError) throw patientError;
        if (!patientData) {
            toast({ title: "Error", description: "Patient details not found.", variant: "destructive" });
            return;
        }
        
        if (parsedMedications.length > 0) {
          // Clear existing medications before inserting new ones
          await supabase.from('medications').delete().eq('patient_id', patientData.id);
          
          const insertPayload = parsedMedications.map(med => ({
            ...med,
            patient_id: patientData.id,
          }));
          
          const { data, error } = await supabase
              .from('medications')
              .insert(insertPayload)
              .select();
              
          if (error) throw error;
          
          setMedications(data as MedicationRow[]);
          toast({
            title: "Success!",
            description: `Extracted ${parsedMedications.length} medications from your summary.`,
          });
        } else {
          setMedications([]);
          toast({
            title: "No Medications Found",
            description: "Could not automatically detect medications. Please check the PDF.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("PDF processing failed:", error);
        toast({ title: "Processing Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    };

    const removeFile = async () => {
      if (!profile?.id) return;
      setIsProcessing(true);
      try {
        const { data: patientData, error: patientError } = await supabase
            .from('patient_details')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

        if (patientError) throw patientError;
        if (!patientData) throw new Error("Patient details not found.");

        const { error } = await supabase.from('medications').delete().eq('patient_id', patientData.id);
        if (error) throw error;

        setUploadedFile(null);
        setMedications([]);
        toast({ title: "Medications Cleared", description: "All medications have been removed from your profile." });
      } catch (error) {
        console.error("Failed to remove medications:", error);
        toast({ title: "Error", description: "Could not remove medications. Please try again.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    };

    const toggleMedication = async (medId: string, timeIndex: number) => {
        if (!profile?.id) return;
        setIsSaving(true);
        try {
            const currentMedication = medications.find(m => m.id === medId);
            if (!currentMedication) return;

            const updatedTaken = currentMedication.taken.map((t, i) => (i === timeIndex ? !t : t));
            
            const { error } = await supabase
              .from('medications')
              .update({ taken: updatedTaken as boolean[] })
              .eq('id', medId);
              
            if (error) throw error;
            
            setMedications(prev => prev.map(med =>
                med.id === medId ? { ...med, taken: updatedTaken as boolean[] } : med
            ));
            
            toast({ title: "Status Updated", description: "Your medication log has been updated." });
        } catch (error) {
            console.error("Failed to update medication status:", error);
            toast({ title: "Error", description: "Could not update medication status.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
      <div className="space-y-8 fade-in">
        <FileUploadCard
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          uploadedFile={uploadedFile}
          isProcessing={isProcessing}
        />
        <MedicationList
          medications={medications}
          onToggleMedication={toggleMedication}
          isLoading={isLoading}
          isSaving={isSaving}
        />
        <Chatbot medications={medications} />
      </div>
    );
  };
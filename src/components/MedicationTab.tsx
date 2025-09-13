import { useState } from "react";
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
  Bot
} from "lucide-react";

export const MedicationTab = () => {
  const [medications] = useState([
    {
      id: 1,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      timing: ["8:00 AM", "2:00 PM", "8:00 PM"],
      taken: [true, true, false],
      purpose: "Antibiotic for pneumonia treatment"
    },
    {
      id: 2,
      name: "Paracetamol",
      dosage: "650mg",
      frequency: "Every 6 hours as needed",
      timing: ["6:00 AM", "12:00 PM", "6:00 PM", "12:00 AM"],
      taken: [true, false, false, false],
      purpose: "Pain relief and fever reduction"
    },
    {
      id: 3,
      name: "Inhaler (Salbutamol)",
      dosage: "2 puffs",
      frequency: "4 times daily",
      timing: ["Morning", "Afternoon", "Evening", "Night"],
      taken: [true, true, false, false],
      purpose: "Bronchodilator for breathing support"
    }
  ]);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "Hello! I'm here to help you understand your medications. Feel free to ask me about any of your prescribed medicines."
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const handleUploadSummary = () => {
    toast({
      title: "Upload Started",
      description: "Processing your discharge summary...",
    });
  };

  const toggleMedication = (medId: number, timeIndex: number) => {
    toast({
      title: "Medication Marked",
      description: "Don't forget to take your medicine as prescribed",
    });
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: chatMessages.length + 1,
      type: "user" as const,
      message: newMessage
    };
    
    setChatMessages([...chatMessages, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        type: "bot" as const,
        message: getBotResponse(newMessage)
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
    
    setNewMessage("");
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("paracetamol")) {
      return "Paracetamol helps reduce fever and mild pain. It's generally safe when taken as prescribed. Take it with food to avoid stomach upset.";
    } else if (lowerMessage.includes("amoxicillin")) {
      return "Amoxicillin is an antibiotic that fights bacterial infections like pneumonia. Take it at regular intervals and complete the full course even if you feel better.";
    } else if (lowerMessage.includes("inhaler") || lowerMessage.includes("salbutamol")) {
      return "Your inhaler helps open your airways and makes breathing easier. Shake it well before use and breathe in slowly and deeply.";
    } else if (lowerMessage.includes("side effect")) {
      return "Common side effects are usually mild. Contact your doctor if you experience severe reactions like difficulty breathing, severe rash, or persistent nausea.";
    } else {
      return "I can help you with information about your medications - Amoxicillin, Paracetamol, and your Inhaler. What would you like to know?";
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Upload Discharge Summary */}
      <Card className="healthcare-card p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Discharge Summary</h3>
          <p className="text-muted-foreground mb-4">
            Upload your hospital discharge summary to automatically extract medication information
          </p>
          <Button onClick={handleUploadSummary} className="bg-primary hover:bg-primary/90">
            <Upload className="h-4 w-4 mr-2" />
            Choose File to Upload
          </Button>
        </div>
      </Card>

      {/* Medication List */}
      <div className="space-y-4">
        <h3 className="healthcare-heading">Your Medications</h3>
        
        {medications.map((med) => (
          <Card key={med.id} className="healthcare-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{med.name}</h4>
                  <p className="text-muted-foreground">{med.purpose}</p>
                </div>
              </div>
              <Badge variant="outline">{med.frequency}</Badge>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Dosage: {med.dosage}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {med.timing.map((time, index) => (
                  <button
                    key={index}
                    onClick={() => toggleMedication(med.id, index)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      med.taken[index] 
                        ? "bg-success/10 border-success/20 text-success" 
                        : "bg-muted border-border hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {med.taken[index] ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{time}</span>
                    </div>
                    <p className="text-xs mt-1">
                      {med.taken[index] ? "Taken" : "Pending"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Medication Chatbot */}
      <Card className="healthcare-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Medication Assistant</h3>
        </div>
        
        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
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
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
          />
          <Button onClick={sendChatMessage} size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
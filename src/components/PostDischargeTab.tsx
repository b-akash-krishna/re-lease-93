import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Apple, 
  X, 
  CheckCircle, 
  Heart, 
  MessageCircle,
  Bot,
  Utensils,
  Activity
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

interface PostDischargeTabProps {
  patient: Patient;
}

export const PostDischargeTab = ({ patient }: PostDischargeTabProps) => {
  const [dailySchedule] = useState([
    { time: "8:00 AM", task: "Amoxicillin 500mg", type: "medication", completed: true },
    { time: "9:00 AM", task: "Healthy breakfast + morning walk", type: "lifestyle", completed: true },
    { time: "2:00 PM", task: "Amoxicillin 500mg", type: "medication", completed: false },
    { time: "3:00 PM", task: "Light lunch, avoid spicy food", type: "diet", completed: false },
    { time: "6:00 PM", task: "Evening inhaler dose", type: "medication", completed: false },
    { time: "8:00 PM", task: "Amoxicillin 500mg + rest", type: "medication", completed: false }
  ]);

  const [dietPlan] = useState({
    recommended: [
      "Fresh fruits (apples, bananas, oranges)",
      "Lean proteins (chicken breast, fish)",
      "Whole grains (brown rice, oats)",
      "Plenty of water (8-10 glasses daily)",
      "Vegetable soups and broths",
      "Green leafy vegetables"
    ],
    avoid: [
      "Spicy and heavily seasoned food",
      "Fried and processed foods",
      "Dairy products (temporarily)",
      "Alcoholic beverages",
      "Caffeinated drinks in excess",
      "Very hot or very cold foods"
    ]
  });

  const [lifestyleTips] = useState([
    {
      icon: Activity,
      title: "Gentle Exercise",
      description: "Walk for 10-15 minutes twice daily to improve circulation",
      color: "text-secondary"
    },
    {
      icon: Heart,
      title: "Rest & Recovery",
      description: "Get 7-8 hours of sleep and take afternoon rest if needed",
      color: "text-primary"
    },
    {
      icon: Utensils,
      title: "Proper Nutrition",
      description: "Eat small, frequent meals to support healing",
      color: "text-accent"
    }
  ]);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: `Hi ${patient.name}! I'm here to help with your post-discharge care plan. Ask me about diet, lifestyle, or recovery tips specific to ${patient.diagnosis.toLowerCase()}.`
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");

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
        message: getBotResponse(newMessage, patient.diagnosis)
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
    
    setNewMessage("");
  };

  const getBotResponse = (message: string, diagnosis: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("food") || lowerMessage.includes("eat")) {
      return "For pneumonia recovery, focus on easy-to-digest foods like soups, fruits, and lean proteins. Avoid spicy foods and dairy temporarily as they may increase mucus production.";
    } else if (lowerMessage.includes("exercise") || lowerMessage.includes("walk")) {
      return "Start with gentle walks for 10-15 minutes twice daily. Gradually increase as you feel stronger. Avoid strenuous activities until fully recovered.";
    } else if (lowerMessage.includes("sleep") || lowerMessage.includes("rest")) {
      return "Good rest is crucial for recovery. Sleep with your head slightly elevated to ease breathing. Take daytime naps if needed.";
    } else if (lowerMessage.includes("when") || lowerMessage.includes("normal")) {
      return "Full recovery from pneumonia typically takes 1-3 weeks. Follow your medication schedule and attend all checkups for the best outcome.";
    } else {
      return "I can help with questions about diet, exercise, rest, and recovery tips for pneumonia. What specific aspect would you like to know more about?";
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Daily Schedule */}
      <Card className="healthcare-card p-6">
        <h3 className="healthcare-heading mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {dailySchedule.map((item, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                item.completed 
                  ? "bg-success/5 border-success/20" 
                  : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex items-center space-x-2">
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{item.time}</span>
              </div>
              
              <div className="flex-1">
                <p className={item.completed ? "line-through text-muted-foreground" : ""}>
                  {item.task}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className={
                  item.type === "medication" ? "border-primary/20 text-primary" :
                  item.type === "diet" ? "border-secondary/20 text-secondary" :
                  "border-accent/20 text-accent"
                }
              >
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Diet Plan */}
      <Card className="healthcare-card p-6">
        <h3 className="healthcare-heading mb-4">Diet Plan</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommended Foods */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <h4 className="font-semibold text-success">Recommended Foods</h4>
            </div>
            <div className="space-y-2">
              {dietPlan.recommended.map((food, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Apple className="h-4 w-4 text-success" />
                  <span className="text-sm">{food}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Foods to Avoid */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <X className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-destructive">Avoid These Foods</h4>
            </div>
            <div className="space-y-2">
              {dietPlan.avoid.map((food, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{food}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Lifestyle Tips */}
      <Card className="healthcare-card p-6">
        <h3 className="healthcare-heading mb-4">Lifestyle Changes</h3>
        
        <div className="grid gap-4">
          {lifestyleTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
              <div className={`p-2 rounded-full bg-white/80 ${tip.color}`}>
                <tip.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{tip.title}</h4>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Care Assistant Chatbot */}
      <Card className="healthcare-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Care Assistant</h3>
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
            placeholder="Ask about diet, exercise, or recovery..."
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
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Clock,
  Apple,
  X,
  CheckCircle,
  Heart,
  MessageCircle,
  Bot,
  Utensils,
  Activity,
  Send,
  Loader2,
  AlertCircle,
  Calendar,
  Stethoscope
} from "lucide-react";
import { GeminiService } from "@/integrations/gemini";
import { Medication } from "@/components/MedicationTab";

interface Patient {
  name: string;
  age: number;
  gender: string;
  patientId: string;
  diagnosis: string;
  dischargeDate: string;
  nextCheckup: string;
  medications?: Medication[];
}

interface ScheduleItem {
  id: string;
  time: string;
  task: string;
  type: 'medication' | 'lifestyle' | 'diet' | 'appointment';
  completed: boolean;
  metadata?: {
    medicationId?: string;
    dosage?: string;
    instructions?: string;
  };
}

interface DietPlan {
  recommended: string[];
  avoid: string[];
  specialInstructions?: string[];
}

interface LifestyleTip {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface PostDischargeTabProps {
  patient: Patient;
  medications?: Medication[];
  onScheduleUpdate?: (scheduleId: string, completed: boolean) => void;
}

const INITIAL_CHAT_MESSAGES = (patientName: string, diagnosis: string): ChatMessage[] => [
  {
    id: 'welcome-1',
    type: 'bot',
    message: `Hello ${patientName}! I'm your AI care assistant powered by Gemini. I can help you with questions about your recovery from ${diagnosis.toLowerCase()}, medications, diet plans, lifestyle changes, and follow-up care. How can I assist you today?`,
    timestamp: new Date()
  },
];

export const PostDischargeTab = ({
  patient,
  medications = [],
  onScheduleUpdate
}: PostDischargeTabProps) => {
  const { toast } = useToast();
  const [dietPlan, setDietPlan] = useState<DietPlan>({ recommended: [], avoid: [] });
  const [lifestyleTips, setLifestyleTips] = useState<LifestyleTip[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(true);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiService = GEMINI_API_KEY ? new GeminiService(GEMINI_API_KEY) : null;

  useEffect(() => {
    setChatMessages(INITIAL_CHAT_MESSAGES(patient.name, patient.diagnosis));
  }, [patient.name, patient.diagnosis]);

  const generateDynamicContent = useCallback(async () => {
    if (!geminiService) {
      setDietPlan(getFallbackDietPlan(patient.diagnosis));
      setLifestyleTips(getFallbackLifestyleTips(patient.diagnosis));
      setIsGeneratingContent(false);
      return;
    }

    setIsGeneratingContent(true);

    try {
      const dietPrompt = `Create a comprehensive diet plan for a ${patient.age}-year-old ${patient.gender.toLowerCase()} patient recovering from ${patient.diagnosis}. Consider their current medications: ${medications.map(m => m.name).join(', ')}.
Return a JSON object with this exact structure:
{
  "recommended": ["food item 1", "food item 2", ...],
  "avoid": ["food item 1", "food item 2", ...],
  "specialInstructions": ["instruction 1", "instruction 2", ...]
}
Include 5-8 items in each array and 3-5 special instructions. Make recommendations specific to the diagnosis and age group.`;

      const lifestylePrompt = `Provide personalized recovery lifestyle tips for a ${patient.age}-year-old ${patient.gender.toLowerCase()} patient recovering from ${patient.diagnosis}.
Return a JSON array of exactly 5 objects with this structure:
[
  {
    "id": "unique-id",
    "title": "Tip Title",
    "description": "Detailed description of the tip",
    "priority": "high|medium|low"
  }
]
Make tips specific to the diagnosis, age, and recovery phase. Focus on practical, actionable advice.`;

      const [dietResponse, lifestyleResponse] = await Promise.all([
        geminiService.generateJSONResponse(dietPrompt),
        geminiService.generateJSONResponse(lifestylePrompt)
      ]);

      setDietPlan(dietResponse);
      const tipsWithIcons = lifestyleResponse.map((tip: any, index: number) => ({
        ...tip,
        icon: getIconForTip(tip.title, index),
        color: getColorForPriority(tip.priority)
      }));
      setLifestyleTips(tipsWithIcons);

    } catch (error) {
      console.error("Failed to generate content with Gemini:", error);
      toast({
        title: "Content Generation",
        description: "Using standard recommendations. AI personalization temporarily unavailable.",
        variant: "default",
      });
      
      setDietPlan(getFallbackDietPlan(patient.diagnosis));
      setLifestyleTips(getFallbackLifestyleTips(patient.diagnosis));
    } finally {
      setIsGeneratingContent(false);
    }
  }, [patient, medications, geminiService, toast]);

  useEffect(() => {
    if (!hasGeneratedContent) {
      generateDynamicContent();
      setHasGeneratedContent(true);
    }
  }, [generateDynamicContent, hasGeneratedContent]);

  const getFallbackResponse = useCallback((message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return `For ${patient.diagnosis.toLowerCase()}, focus on a balanced diet as shown in your personalized plan above. Stay hydrated and avoid processed foods. If you have specific dietary concerns, please consult your healthcare provider.`;
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('activity')) {
      return `Start with gentle activities as recommended in your lifestyle tips. Begin slowly and gradually increase intensity as you feel stronger. Always listen to your body and consult your doctor before starting new exercises.`;
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('symptom')) {
      return `Some discomfort during recovery from ${patient.diagnosis.toLowerCase()} is normal. However, if you experience severe or worsening symptoms, contact your healthcare provider immediately. Keep track of your symptoms and medications.`;
    } else if (lowerMessage.includes('medication')) {
      const medNames = medications.map(med => med.name).join(', ');
      return `Your current medications are: ${medNames}. Take them as prescribed and never skip doses. If you have concerns about side effects or interactions, consult your healthcare provider.`;
    } else if (lowerMessage.includes('recovery') || lowerMessage.includes('when')) {
      return `Recovery time varies for each person with ${patient.diagnosis.toLowerCase()}. Follow your treatment plan, attend follow-up appointments, and be patient with the healing process. Your next checkup is scheduled for ${patient.nextCheckup}.`;
    } else {
      return `I can help with questions about your recovery from ${patient.diagnosis.toLowerCase()}, diet, exercise, medications, and follow-up care. What specific aspect would you like to know more about?`;
    }
  }, [patient, medications]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    
    const loadingMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      message: "Thinking...",
      timestamp: new Date(),
      isLoading: true
    };
    setChatMessages(prev => [...prev, loadingMessage]);
    
    const currentMessage = newMessage;
    setNewMessage("");
    setIsLoading(true);

    try {
      let botResponse: string;
      
      if (geminiService) {
        const contextualPrompt = `Patient Context:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Diagnosis: ${patient.diagnosis}
- Discharge Date: ${patient.dischargeDate}
- Next Checkup: ${patient.nextCheckup}
- Current Medications: ${medications.map(m => `${m.name} (${m.dosage}) - ${m.frequency}`).join(', ')}

Patient Question: ${currentMessage}

As a caring medical assistant, provide helpful, personalized advice while always recommending consulting healthcare providers for serious concerns. Keep responses concise but informative.`;

        botResponse = await geminiService.generateTextResponse(contextualPrompt, `You are a caring medical assistant. Provide helpful, personalized advice.`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        botResponse = getFallbackResponse(currentMessage);
      }

      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, message: botResponse, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setChatMessages(prev => 
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
    } finally {
      setIsLoading(false);
      
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({ 
          top: chatContainerRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <Card className="healthcare-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Recovery Overview</h3>
          </div>
          <Badge variant="outline" className="border-blue-300 text-blue-700">
            {patient.diagnosis}
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">Discharged: {patient.dischargeDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">Next Visit: {patient.nextCheckup}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">Medications: {medications.length}</span>
          </div>
        </div>
      </Card>

      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="healthcare-heading">Personalized Diet Plan</h3>
          {isGeneratingContent && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating personalized plan...</span>
            </div>
          )}
          {geminiService && (
            <Badge variant="secondary" className="text-xs">AI Personalized</Badge>
          )}
        </div>
        
        {isGeneratingContent ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Creating your personalized diet plan...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-700">Recommended Foods</h4>
              </div>
              <div className="space-y-2">
                {dietPlan.recommended.map((food, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <Apple className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{food}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <X className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-700">Foods to Avoid</h4>
              </div>
              <div className="space-y-2">
                {dietPlan.avoid.map((food, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {dietPlan.specialInstructions && dietPlan.specialInstructions.length > 0 && !isGeneratingContent && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h5 className="font-semibold text-blue-800 mb-2">Special Instructions:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              {dietPlan.specialInstructions.map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="healthcare-heading">Recovery Guidelines</h3>
          {geminiService && (
            <Badge variant="secondary" className="text-xs">AI Personalized</Badge>
          )}
        </div>
        
        {isGeneratingContent ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Creating your personalized lifestyle tips...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {lifestyleTips
              .sort((a, b) => {
                const priority = { high: 3, medium: 2, low: 1 };
                return priority[b.priority] - priority[a.priority];
              })
              .map((tip) => (
              <div key={tip.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                <div className={`p-2 rounded-full bg-white/80 ${tip.color}`}>
                  <tip.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{tip.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={
                        tip.priority === 'high' ? 'border-red-200 text-red-700' :
                        tip.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                        'border-green-200 text-green-700'
                      }
                    >
                      {tip.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="healthcare-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">AI Care Assistant</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {geminiService ? 'Powered by Gemini' : 'Basic Mode'}
          </Badge>
        </div>

        {!geminiService && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Gemini AI not configured</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Add your Gemini API key to enable AI-powered assistance.
            </p>
          </div>
        )}
        
        <div ref={chatContainerRef} className="space-y-4 mb-4 max-h-80 overflow-y-auto border rounded-lg p-4 bg-muted/20">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'bot' && (
                <div className="p-2 bg-gray-100 rounded-full h-8 w-8 flex-shrink-0 mr-2">
                  {msg.isLoading ? (
                    <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-border text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask about your recovery, diet, medications..."
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Try asking: "What should I eat today?", "Is it normal to feel tired?", "When can I exercise?", or "Tell me about my medications"
        </div>
      </Card>
    </div>
  );
};

function getFallbackDietPlan(diagnosis: string): DietPlan {
  const commonRecommended = [
    "Plenty of water (8-10 glasses daily)",
    "Fresh fruits and vegetables",
    "Whole grains and fiber-rich foods",
    "Lean proteins (fish, chicken, legumes)"
  ];
  const commonAvoid = [
    "Processed and packaged foods",
    "Excessive alcohol consumption",
    "High-sugar snacks and drinks"
  ];

  const diagnosisSpecific: { [key: string]: DietPlan } = {
    'pneumonia': {
      recommended: [
        ...commonRecommended,
        "Warm soups and broths",
        "Honey and ginger tea",
        "Foods rich in vitamin C (citrus, berries)",
        "Protein-rich foods for recovery"
      ],
      avoid: [
        ...commonAvoid,
        "Dairy products (may increase mucus)",
        "Spicy and irritating foods",
        "Cold foods and drinks"
      ],
      specialInstructions: [
        "Eat smaller, frequent meals",
        "Stay well-hydrated to help thin mucus",
        "Avoid very hot or very cold foods"
      ]
    },
    'heart failure': {
      recommended: [
        ...commonRecommended,
        "Low-sodium alternatives",
        "Fish rich in omega-3 fatty acids",
        "Leafy green vegetables",
        "Berries and antioxidant-rich foods"
      ],
      avoid: [
        ...commonAvoid,
        "High-sodium foods and snacks",
        "Canned foods with added salt",
        "Fast food and restaurant meals"
      ],
      specialInstructions: [
        "Monitor sodium intake (<2000mg/day)",
        "Limit fluid intake as recommended by doctor",
        "Weigh yourself daily at the same time"
      ]
    },
    'diabetes': {
      recommended: [
        ...commonRecommended,
        "High-fiber foods",
        "Non-starchy vegetables",
        "Nuts and seeds",
        "Fish and poultry"
      ],
      avoid: [
        ...commonAvoid,
        "Sugary drinks and snacks",
        "White bread and refined grains",
        "Fried foods",
        "High-sugar fruits in excess"
      ],
      specialInstructions: [
        "Monitor carbohydrate intake",
        "Eat at consistent times",
        "Check blood sugar as directed"
      ]
    },
    'diarrhoea': {
      recommended: [
        "BRAT diet: Bananas, Rice, Applesauce, Toast",
        "Clear broths and soups",
        "Electrolyte-rich drinks (e.g., coconut water)",
        "Boiled potatoes and carrots"
      ],
      avoid: [
        "Spicy foods and excessive fiber",
        "Fatty and greasy foods",
        "Dairy products",
        "Caffeine and alcohol"
      ],
      specialInstructions: [
        "Rehydrate frequently with small sips",
        "Avoid eating large meals",
        "Introduce foods slowly as symptoms improve"
      ]
    }
  };

  return diagnosisSpecific[diagnosis.toLowerCase()] || {
    recommended: commonRecommended,
    avoid: commonAvoid,
    specialInstructions: ["Follow your doctor's dietary recommendations", "Maintain a balanced diet", "Stay hydrated"]
  };
}

function getFallbackLifestyleTips(diagnosis: string): LifestyleTip[] {
  const common: LifestyleTip[] = [
    {
      id: 'rest',
      icon: Heart,
      title: 'Adequate Rest',
      description: 'Get 7-8 hours of quality sleep and take rest breaks when needed during recovery',
      color: 'text-red-600',
      priority: 'high'
    },
    {
      id: 'activity',
      icon: Activity,
      title: 'Gradual Physical Activity',
      description: 'Slowly increase your activity level as you feel stronger, starting with short walks',
      color: 'text-blue-600',
      priority: 'medium'
    },
    {
      id: 'nutrition',
      icon: Utensils,
      title: 'Proper Nutrition',
      description: 'Follow your personalized diet plan and stay hydrated throughout the day',
      color: 'text-green-600',
      priority: 'high'
    },
    {
      id: 'medication',
      icon: Clock,
      title: 'Medication Adherence',
      description: 'Take all medications as prescribed and never skip doses without consulting your doctor',
      color: 'text-purple-600',
      priority: 'high'
    },
    {
      id: 'monitoring',
      icon: Stethoscope,
      title: 'Monitor Symptoms',
      description: 'Keep track of your symptoms and report any concerning changes to your healthcare provider',
      color: 'text-orange-600',
      priority: 'medium'
    }
  ];

  const diagnosisSpecific: { [key: string]: LifestyleTip[] } = {
    'pneumonia': [
      {
        id: 'breathing',
        icon: Activity,
        title: 'Breathing Exercises',
        description: 'Practice deep breathing exercises to help clear lungs and strengthen respiratory muscles.',
        color: 'text-accent',
        priority: 'high'
      },
      {
        id: 'position',
        icon: Heart,
        title: 'Sleep Position',
        description: 'Sleep with head slightly elevated to ease breathing and reduce chest congestion.',
        color: 'text-primary',
        priority: 'medium'
      }
    ],
    'diarrhoea': [
      {
        id: 'hydration',
        icon: Utensils,
        title: 'Stay Hydrated',
        description: 'Drink small amounts of water and electrolyte solutions frequently to prevent dehydration.',
        color: 'text-accent',
        priority: 'high'
      },
      {
        id: 'hygiene',
        icon: Heart,
        title: 'Practice Good Hygiene',
        description: 'Wash hands frequently to prevent the spread of infection, especially after using the restroom.',
        color: 'text-primary',
        priority: 'medium'
      }
    ]
  };

  const specific = diagnosisSpecific[diagnosis.toLowerCase()] || [];
  
  const combinedTips = [...common, ...specific];
  const uniqueTips = Array.from(new Set(combinedTips.map(tip => tip.id))).map(id => combinedTips.find(tip => tip.id === id)!);
  
  return uniqueTips;
}

function getIconForTip(title: string, index: number) {
  const iconMap: { [key: string]: any } = {
    'rest': Heart,
    'sleep': Heart,
    'activity': Activity,
    'exercise': Activity,
    'nutrition': Utensils,
    'diet': Utensils,
    'food': Utensils,
    'medication': Clock,
    'monitor': Stethoscope,
    'symptom': Stethoscope
  };

  const lowerTitle = title.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerTitle.includes(key)) {
      return icon;
    }
  }

  const defaultIcons = [Heart, Activity, Utensils, Clock, Stethoscope];
  return defaultIcons[index % defaultIcons.length];
}

function getColorForPriority(priority: string): string {
  const colorMap: { [key: string]: string } = {
    'high': 'text-red-600',
    'medium': 'text-yellow-600',
    'low': 'text-green-600'
  };
  return colorMap[priority.toLowerCase()] || 'text-blue-600';
}
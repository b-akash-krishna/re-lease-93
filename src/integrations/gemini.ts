import { Medication } from "@/components/MedicationTab";

// --- GEMINI AI INTEGRATION ---
export class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, medications: Medication[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const medicationContext = medications.map(med =>
      `${med.name} (${med.dosage}) - ${med.frequency} - Purpose: ${med.purpose}`
    ).join('\n');

    const systemPrompt = `You are a helpful medical assistant specializing in medication guidance.

Current patient medications:
${medicationContext}

Guidelines:
- Provide accurate, helpful information about medications
- Always recommend consulting healthcare providers for serious concerns
- Be empathetic and supportive
- If asked about medications not in the patient's list, provide general information but emphasize consulting their doctor
- For side effects, drug interactions, or dosage questions, provide helpful guidance but stress the importance of professional medical advice
- Keep responses concise but informative
- Never provide specific medical diagnoses

User question: ${prompt}`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response generated');
      }

      return generatedText.trim();
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }
}
import { Medication } from "@/components/MedicationTab";

// --- GEMINI AI INTEGRATION ---
export class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generates a text-based response from the Gemini API.
   * @param userPrompt The user's specific question or request.
   * @param systemContext An optional system context to provide to the model.
   * @param medications An optional list of patient medications for context.
   * @returns A promise that resolves to the generated text response.
   */
  async generateTextResponse(
    userPrompt: string,
    systemContext?: string,
    medications?: Medication[]
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const medicationContext = medications && medications.length > 0
      ? `\n\nPatient Medications:\n${medications.map(med =>
          `${med.name} (${med.dosage}) - ${med.frequency}`
        ).join('\n')}`
      : '';

    const finalPrompt = `${systemContext || ''}${medicationContext}\n\nUser Question: ${userPrompt}`;

    const contents = [{ parts: [{ text: finalPrompt }] }];

    return this.callApi(contents);
  }

  /**
   * Generates a response from the Gemini API and attempts to parse it as JSON.
   * @param jsonPrompt The prompt specifically crafted to get a JSON response.
   * @returns A promise that resolves to the parsed JSON object.
   */
  async generateJSONResponse(jsonPrompt: string): Promise<any> {
    const contents = [{ parts: [{ text: jsonPrompt }] }];

    try {
      const textResponse = await this.callApi(contents);
      // Clean the response to ensure it's valid JSON
      const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
      const cleanedResponse = jsonMatch ? jsonMatch[1] : textResponse;

      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Failed to parse JSON response from Gemini:', error);
      throw new Error('Invalid JSON response from AI service.');
    }
  }

  private async callApi(contents: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
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
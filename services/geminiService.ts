
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    return apiKey;
};


export const getFinancialInsights = async (financialSummary: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        You are a helpful and concise financial assistant.
        Analyze the following user's financial summary and provide one single, actionable insight or observation.
        Keep the tone encouraging and straightforward. The user is on an aggressive wealth-building plan.
        Do not use markdown. Respond in a single sentence.

        User's Data:
        ${financialSummary}

        Example Insight: "Your savings rate is strong this month, keep up the momentum by allocating a portion to your highest interest debt."
        
        Your insight:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating financial insight:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        return "Could not get insight. Please ensure your Gemini API key is configured correctly.";
    }
    return "An unexpected error occurred while generating your financial insight.";
  }
};

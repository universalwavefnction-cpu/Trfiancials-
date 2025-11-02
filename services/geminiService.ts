import { GoogleGenAI } from "@google/genai";
import { FinancialData, AssetCategory } from '../types';

const getApiKey = (): string => {
    // Priority 1: Environment variable (for deployed/build environments)
    const envApiKey = process.env.API_KEY;
    if (envApiKey) {
        return envApiKey;
    }

    // Priority 2: Local storage (for user-provided key in the browser)
    try {
        const storedApiKey = window.localStorage.getItem('geminiApiKey');
        if (storedApiKey) {
            // The useLocalStorage hook JSON.stringifies the value, so we parse it.
            const parsedKey = JSON.parse(storedApiKey);
            if (typeof parsedKey === 'string' && parsedKey.trim() !== '') {
                return parsedKey;
            }
        }
    } catch (error) {
        console.error("Could not retrieve API key from local storage", error);
    }
    
    // If no key is found
    throw new Error("API key not found. Please go to the Settings page to configure your Gemini API key.");
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
    if (error instanceof Error) {
        return error.message;
    }
    return "An unexpected error occurred while generating your financial insight.";
  }
};

export const getFinancialRundown = async (financialData: FinancialData, months: number): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // Calculate inputs for the prompt
    const totalLiquidAssets = financialData.assets
      .filter(a => a.category === AssetCategory.Savings || a.category === AssetCategory.EmergencyFund)
      .reduce((sum, a) => sum + a.currentValue, 0);

    const incomeByMonth: Record<string, number> = {};
    financialData.income.forEach(i => {
      const month = i.date.substring(0, 7);
      incomeByMonth[month] = (incomeByMonth[month] || 0) + i.amount;
    });

    const recentMonths = Object.keys(incomeByMonth).sort().slice(-3);
    const avgMonthlyIncome = recentMonths.length > 0
      ? recentMonths.reduce((sum, month) => sum + incomeByMonth[month], 0) / recentMonths.length
      : 0;
    
    const recurringExpensesList = financialData.recurringExpenses.map(e => `* ${e.description}: €${e.amount.toFixed(2)}`).join('\n');
    const debtsList = financialData.debts.map(d => `* ${d.name}: €${d.minimumPayment.toFixed(2)}/month`).join('\n');

    const prompt = `
        You are a financial analyst AI. Your task is to provide a financial rundown and forecast for a user based on their provided data. The user wants to know how long their money will last based on current trends.

        **User's Financial Data:**

        *   **Total Liquid Assets (Savings, Emergency Fund):** €${totalLiquidAssets.toFixed(2)}
        *   **Average Monthly Income (last ${recentMonths.length} months):** €${avgMonthlyIncome.toFixed(2)}
        *   **Recurring Monthly Expenses:**
            ${recurringExpensesList || 'None'}
        *   **Debts (with monthly minimum payments):**
            ${debtsList || 'None'}

        **Your Task:**

        1.  **Calculate Total Monthly Outgoings:** Sum up all recurring expenses and minimum debt payments.
        2.  **Calculate Monthly Net Cash Flow:** Subtract total monthly outgoings from the average monthly income.
        3.  **Project Finances:** Based on the monthly net cash flow, project the user's financial situation for the next ${months} months.
            *   If the net cash flow is negative, calculate how many months it will take to deplete the total liquid assets. This is the user's "financial runway."
            *   If the net cash flow is positive, state that their assets are growing and a rundown isn't applicable in the same way, but still provide a projection of their asset growth.
        4.  **Provide a Summary:** Present your analysis in a clear, easy-to-read format.

        **Output Format (use markdown-like headers with #, ##, and bullets with *):**

        # Financial Rundown for the Next ${months} Months

        ## 1. Current Financial Snapshot
        *   **Liquid Assets:** €...
        *   **Average Monthly Income:** €...
        *   **Total Monthly Outgoings:** €... (Explain what this includes)
        *   **Monthly Net Cash Flow:** €...

        ## 2. Forecast & Runway
        (Provide a paragraph explaining the projection. If cash flow is negative, clearly state the calculated runway in months. If positive, describe the projected growth.)

        ## 3. Key Takeaways & Recommendations
        (Provide 2-3 bullet points with actionable advice or observations based on the forecast. For example, "Your current spending leads to a deficit of €X per month. To extend your runway, consider reducing expenses in the 'Personal' category.")

        ---
        Do not include any introductory or concluding pleasantries. Stick strictly to the format above.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error generating financial rundown:", error);
    if (error instanceof Error) {
        return error.message;
    }
    return "An unexpected error occurred while generating your financial rundown.";
  }
};
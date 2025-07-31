import { GoogleGenAI, Type } from "@google/genai";
import { Condition, DoctorVisitPrep } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const conditionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name of the potential medical condition."
      },
      matchingSymptoms: {
        type: Type.INTEGER,
        description: "A count of the user-described symptoms that match this condition."
      },
      severity: {
        type: Type.STRING,
        description: "An estimated severity level for the condition, such as 'Mild', 'Moderate', or 'Severe'."
      }
    },
    required: ["name", "matchingSymptoms", "severity"]
  }
};

const doctorPrepSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "A list of questions the user should ask their doctor related to their potential conditions.",
      items: { type: Type.STRING }
    },
    preparation: {
      type: Type.ARRAY,
      description: "A list of things the user should prepare or bring to their doctor's appointment (e.g., symptom timeline, current medications).",
      items: { type: Type.STRING }
    },
    expectations: {
      type: Type.ARRAY,
      description: "A list of things the user might expect during the doctor's visit (e.g., physical exam, questions from the doctor).",
      items: { type: Type.STRING }
    }
  },
  required: ["questions", "preparation", "expectations"]
};


export const getPotentialConditions = async (symptoms: string): Promise<Condition[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following symptoms and return a list of 3 potential conditions: "${symptoms}"`,
      config: {
        systemInstruction: "You are a helpful medical assistant AI. Analyze the user's symptoms and provide a list of potential conditions. Do not provide medical advice, but suggest potential conditions based on the described symptoms. For each condition, provide a name, a count of matching symptoms from the user's description, and a severity level (Mild, Moderate, Severe). Your response must strictly adhere to the provided JSON schema.",
        responseMimeType: "application/json",
        responseSchema: conditionSchema,
      },
    });

    const jsonText = response.text.trim();
    const conditions = JSON.parse(jsonText);
    return conditions as Condition[];
  } catch (error) {
    console.error("Error fetching conditions from Gemini API:", error);
    // In a real app, you'd want more robust error handling
    throw new Error("Failed to analyze symptoms. Please try again.");
  }
};

export const getConditionDetails = async (conditionName: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a brief, easy-to-understand description of ${conditionName}. Focus on common symptoms, causes, and when to see a doctor. This is not medical advice. Keep it concise and clear for a general audience.`,
            config: {
                systemInstruction: "You are a helpful medical information assistant. Provide clear, concise information about medical conditions. Do not give medical advice or a diagnosis.",
            },
        });
        return response.text;
    } catch (error) {
        console.error(`Error fetching details for ${conditionName}:`, error);
        throw new Error(`Failed to get details for ${conditionName}.`);
    }
};

export const getGeneralAdvice = async (conditions: Condition[]): Promise<string> => {
    const conditionNames = conditions.map(c => `${c.name} (${c.severity})`).join(', ');
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following potential conditions: ${conditionNames}, provide a summary of general advice. This advice should not be a diagnosis. It should be safe, non-prescriptive, and strongly recommend consulting a healthcare professional. Focus on general well-being tips like rest and hydration, and explain why seeing a doctor is important for these conditions.`,
            config: {
                systemInstruction: "You are a helpful medical information assistant. Provide safe, general advice and always emphasize that the user should see a real doctor. Do not provide a diagnosis or medical treatment instructions.",
            },
        });
        return response.text;
    } catch (error) {
        console.error(`Error fetching general advice:`, error);
        throw new Error(`Failed to get general advice.`);
    }
};

export const getDoctorVisitPrep = async (conditions: Condition[]): Promise<DoctorVisitPrep> => {
    const conditionNames = conditions.map(c => c.name).join(', ');
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following potential conditions: ${conditionNames}, generate a guide to help a patient prepare for their doctor's visit. Structure the response into three sections: questions to ask the doctor, information to prepare beforehand, and what to expect during the visit.`,
            config: {
                systemInstruction: "You are a helpful medical assistant AI. You provide practical, non-diagnostic guidance to help patients have productive conversations with their healthcare providers. Your response must be in JSON format and adhere to the provided schema.",
                responseMimeType: "application/json",
                responseSchema: doctorPrepSchema,
            },
        });
        const jsonText = response.text.trim();
        const prepData = JSON.parse(jsonText);
        return prepData as DoctorVisitPrep;
    } catch (error) {
        console.error(`Error fetching doctor visit prep guide:`, error);
        throw new Error(`Failed to generate preparation guide.`);
    }
};

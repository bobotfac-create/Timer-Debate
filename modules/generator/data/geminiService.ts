import { GoogleGenAI } from "@google/genai";

export const generateMotionFromAI = async (topic: string, type: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como un equipo de adjudicación experto de torneos de debate universitarios (formato BP/WSDC). 
    
    Genera una moción de debate equilibrada, profunda y debatible basada en los siguientes parámetros:
    - Temática General: "${topic}"
    - Tipo de Moción: "${type}"
    
    Reglas:
    1. La moción debe estar en Español.
    2. Debe ser una oración completa empezando típicamente por "EC...", "ECCQ...", "ECL...", etc.
    3. No añadidas explicaciones, solo la moción.
    4. Si es una moción de actor, especifica claramente el actor.
    5. Asegúrate de que haya carga de la prueba para ambos lados.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    if (response.text) {
        return response.text.trim();
    }
    throw new Error("La IA no generó texto en la respuesta.");
};
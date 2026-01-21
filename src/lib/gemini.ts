import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface PaintingAnalysis {
    description: string;
    keywords: string[];
    mood: string;
    colors: string[];
    technique: string;
}

export async function analyzePainting(imageBase64: string): Promise<PaintingAnalysis | null> {
    if (!genAI) {
        console.warn('Gemini API key not configured. Skipping AI analysis.');
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analisa esta aguarela como um crítico de arte especializado em watercolor português.

Responde APENAS em formato JSON válido com esta estrutura exata:
{
  "description": "Descrição artística da obra em 2-3 frases, focando na técnica, composição e emoção transmitida",
  "keywords": ["palavra1", "palavra2", "palavra3", "palavra4", "palavra5"],
  "mood": "Uma palavra que descreve a atmosfera (ex: sereno, dramático, contemplativo, vibrante)",
  "colors": ["cor1", "cor2", "cor3"],
  "technique": "Descrição breve da técnica utilizada"
}

As keywords devem ser em português e relevantes para categorização (ex: paisagem, marinha, flores, urbano, natureza, luz, sombra, etc).
As cores devem ser nomes simples em português (ex: azul, ocre, verde-esmeralda).`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Could not extract JSON from Gemini response:', text);
            return null;
        }

        const analysis = JSON.parse(jsonMatch[0]) as PaintingAnalysis;
        return analysis;
    } catch (error) {
        console.error('Error analyzing painting with Gemini:', error);
        return null;
    }
}

export function isGeminiConfigured(): boolean {
    return !!API_KEY;
}

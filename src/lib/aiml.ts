// AI/ML API integration for painting analysis
// Uses Qwen3-VL model for vision analysis

const AIML_API_URL = 'https://api.aimlapi.com/chat/completions';
const AIML_MODEL = 'alibaba/qwen3-vl-flash';

export interface PaintingAnalysis {
    description: string;
    keywords: string[];
    mood: string;
    colors: string[];
}

/**
 * Analyzes a painting image using AI/ML API with Qwen3-VL vision model
 */
export async function analyzePainting(imageUrl: string): Promise<PaintingAnalysis | null> {
    const apiKey = process.env.NEXT_PUBLIC_AIML_API_KEY;

    if (!apiKey) {
        console.warn('AI/ML API key not configured');
        return null;
    }

    try {
        const response = await fetch(AIML_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: AIML_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analisa esta pintura de aguarela como um especialista em arte. Responde APENAS em formato JSON válido, sem markdown, sem explicações extras:

{
  "description": "Descrição poética de 2-3 frases sobre a pintura, focando na técnica de aguarela, atmosfera e emoção transmitida",
  "keywords": ["5 a 8 palavras-chave em português que descrevam a obra"],
  "mood": "Uma palavra que capture a emoção principal (ex: sereno, vibrante, melancólico, luminoso)",
  "colors": ["lista das 3-5 cores dominantes em português"]
}`
                        },
                        {
                            type: 'image_url',
                            image_url: { url: imageUrl }
                        }
                    ]
                }],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            console.error('AI/ML API error:', response.status, await response.text());
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error('No content in AI response');
            return null;
        }

        // Parse the JSON response
        // Clean up potential markdown formatting
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const analysis = JSON.parse(cleanContent) as PaintingAnalysis;

        console.log('Painting analysis complete:', analysis);
        return analysis;

    } catch (error) {
        console.error('Error analyzing painting:', error);
        return null;
    }
}

/**
 * Check if the AI/ML API is configured
 */
export function isAIConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_AIML_API_KEY;
}

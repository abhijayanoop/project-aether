import { getGeminiModel } from '../config/gemini';
import logger from '../config/logger';

export class AiService {
  private async generateCompletion(prompt: string, temperature: number = 0.7) {
    try {
      const model = getGeminiModel();

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
        },
      });

      const response = await result.response;
      const text = response.text();

      const usage = response.usageMetadata;

      logger.info('Gemini completion generated', {
        promptTokens: usage?.promptTokenCount || 0,
        completionTokens: usage?.candidatesTokenCount || 0,
        totalTokens: usage?.totalTokenCount || 0,
      });

      return {
        content: text,
        usage: {
          prompt_tokens: usage?.promptTokenCount || 0,
          completion_tokens: usage?.candidatesTokenCount || 0,
          total_tokens: usage?.totalTokenCount || 0,
        },
      };
    } catch (error: any) {
      logger.error('Gemini generation failed:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Parse JSON response safely with better error handling
   */
  private parseJSONResponse<T>(content: string | null): T {
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Log the raw response for debugging
    logger.info('Raw AI response:', content.slice(0, 200));

    try {
      // Remove markdown code blocks
      let cleaned = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Sometimes Gemini adds extra text before/after JSON
      // Try to extract JSON object/array
      const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      return JSON.parse(cleaned);
    } catch (error) {
      logger.error('Failed to parse AI response');
      logger.error('Full response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  async generateFlashcards(
    content: string,
    count: number = 10
  ): Promise<Array<{ question: string; answer: string }>> {
    const prompt = `You are an expert educator creating study flashcards.

Your flashcards should:
- Test understanding, not just memorization
- Be clear and concise
- Cover important concepts
- Use simple language

Generate exactly ${count} flashcards from this content:

${content}

Return ONLY valid JSON in this exact format (no markdown, no explanations):
{
  "flashcards": [
    {
      "question": "Question text here",
      "answer": "Answer text here"
    }
  ]
}

Keep questions under 20 words and answers under 50 words.`;

    const result = await this.generateCompletion(prompt, 0.3);

    const parsed = this.parseJSONResponse<{
      flashcards: Array<{ question: string; answer: string }>;
    }>(result.content);

    return parsed.flashcards;
  }

  async generateQuiz(
    content: string,
    count: number = 5
  ): Promise<
    Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>
  > {
    const prompt = `You are an expert educator creating multiple choice quizzes.

Your questions should:
- Test comprehension and application
- Have 4 plausible options
- Have only one correct answer
- Include clear explanations

Generate exactly ${count} multiple choice questions from this content:

${content}

Return ONLY valid JSON in this exact format (no markdown, no explanations):
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

The correctAnswer is the index (0-3) of the correct option.`;

    const result = await this.generateCompletion(prompt, 0.4);

    const parsed = this.parseJSONResponse<{
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
    }>(result.content);

    return parsed.questions;
  }

  async generateSummary(
    content: string,
    type: 'short' | 'detailed' = 'short'
  ): Promise<string> {
    const maxLength = type === 'short' ? '100 words' : '300 words';

    const prompt = `You are an expert at summarizing educational content clearly and concisely.

Summarize the following content in ${maxLength}:

${content}

Focus on:
- Main ideas and key concepts
- Important facts and conclusions
- Logical flow

Provide a well-structured summary.`;

    const result = await this.generateCompletion(prompt, 0.5);

    return result.content || '';
  }

  async extractKeyConcepts(content: string): Promise<string[]> {
    const prompt = `You are an expert at identifying key concepts and terms in educational content.

Extract 5-10 key concepts from this content:

${content}

Return ONLY valid JSON in this exact format (no markdown, no explanations):
{
  "concepts": ["Concept 1", "Concept 2", "Concept 3"]
}

List only the most important terms, theories, or ideas.`;

    const result = await this.generateCompletion(prompt, 0.3);

    const parsed = this.parseJSONResponse<{ concepts: string[] }>(
      result.content
    );

    return parsed.concepts;
  }
}

export const aiService = new AiService();

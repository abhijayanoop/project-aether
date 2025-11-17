import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './environment';
import logger from './logger';

const genAi = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getGeminiModel = () => {
  return genAi.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
};

export const testGeminiConnection = async () => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(
      'Hello! Welcome to Gemini model.'
    );
    const response = await result.response;
    const text = response.text;

    logger.info('✅ Gemini connected successfully');
    logger.info('Test response:', text);
    return true;
  } catch (error) {
    logger.error('Gemini connection failed', error);
    return false;
  }
};

export default genAi;

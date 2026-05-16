import OpenAI from 'openai';

let miniMaxClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  return getMiniMaxClient();
}

export function getMiniMaxClient(): OpenAI {
  if (!miniMaxClient) {
    if (!process.env.MINIMAX_API_KEY) {
      throw new Error('FATAL: MINIMAX_API_KEY environment variable is not set');
    }
    miniMaxClient = new OpenAI({
      apiKey: process.env.MINIMAX_API_KEY,
      baseURL: 'https://token-plan-cn.xiaomimimo.com/v1',
    });
  }
  return miniMaxClient;
}

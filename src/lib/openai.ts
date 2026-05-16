import OpenAI from 'openai';

let openAIClient: OpenAI | null = null;
let miniMaxClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openAIClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('FATAL: OPENAI_API_KEY environment variable is not set');
    }
    openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openAIClient;
}

export function getMiniMaxClient(): OpenAI {
  if (!miniMaxClient) {
    if (!process.env.MINIMAX_API_KEY) {
      throw new Error('FATAL: MINIMAX_API_KEY environment variable is not set');
    }
    miniMaxClient = new OpenAI({
      apiKey: process.env.MINIMAX_API_KEY,
      baseURL: 'https://api.minimaxi.com/v1',
    });
  }
  return miniMaxClient;
}

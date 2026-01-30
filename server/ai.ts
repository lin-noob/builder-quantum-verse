
export interface AIModel {
  generateText(prompt: string): Promise<string>;
}

export class MockAI implements AIModel {
  async generateText(prompt: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[Mock AI Response] I received your prompt: "${prompt}". This is a simulated response.`;
  }
}

export const aiModel = new MockAI();

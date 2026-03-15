import Anthropic from '@anthropic-ai/sdk';

// Only initialize if API key is available
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

const SYSTEM_PROMPT = `You are an expert portfolio analyst assistant helping a retail investor understand and optimize their investment portfolio. You have access to their complete portfolio data and analysis.

## Your Capabilities:
- Analyze portfolio composition and risk
- Explain investment concepts in simple terms
- Provide data-driven insights with specific numbers from the portfolio
- Suggest improvements with appropriate disclaimers

## Response Guidelines:
1. Always cite specific portfolio data when making claims
2. Use Indian number formatting (lakhs, crores) for INR amounts
3. Be concise but thorough — aim for 2-4 paragraphs
4. If you don't have data to answer, say so clearly
5. Never provide specific buy/sell recommendations for individual securities
6. Include appropriate disclaimers for any investment-related suggestions
7. When discussing sectors, reference both portfolio weight and benchmark weight
8. Use bullet points for listing holdings or metrics

## Disclaimer:
Always end investment-related responses with: "Disclaimer: This is for informational purposes only and not financial advice. Please consult a SEBI-registered advisor before making investment decisions."`;

interface MessageHistory {
  role: string;
  content: string;
}

interface AIResponse {
  message: string;
  citations: { type: string; label: string; value: string | number }[];
  suggestedFollowUps: string[];
}

export async function getAIResponse(
  userQuery: string,
  portfolioContext: string,
  conversationHistory: MessageHistory[]
): Promise<AIResponse> {
  // If no API key configured, return a helpful fallback
  if (!anthropic) {
    return {
      message: generateFallbackResponse(userQuery, portfolioContext),
      citations: [],
      suggestedFollowUps: [
        'What is my portfolio health score?',
        'Show me my sector allocation',
        'Which holdings are the largest?',
      ],
    };
  }

  try {
    const contextMessage = portfolioContext
      ? `\n\n## Current Portfolio Data:\n${portfolioContext}`
      : '\n\nNote: No portfolio data is currently loaded. Ask the user to upload their portfolio first.';

    const recentHistory = conversationHistory.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextMessage,
      messages: [
        ...recentHistory.filter(m => m.role === 'user' || m.role === 'assistant'),
        { role: 'user', content: userQuery },
      ],
    });

    const messageContent = response.content[0];
    const message = messageContent.type === 'text' ? messageContent.text : '';

    // Extract suggested follow-ups based on query type
    const followUps = generateFollowUps(userQuery, portfolioContext);

    return {
      message,
      citations: [],
      suggestedFollowUps: followUps,
    };
  } catch (error: unknown) {
    // Never log full error objects — may contain API keys or sensitive data
    const errMsg = error instanceof Error ? error.message : 'Unknown AI service error';
    console.error('AI service error:', errMsg);
    return {
      message: generateFallbackResponse(userQuery, portfolioContext),
      citations: [],
      suggestedFollowUps: [
        'What is my portfolio health score?',
        'Show me my sector allocation',
        'Which holdings are the largest?',
      ],
    };
  }
}

function generateFallbackResponse(query: string, portfolioContext: string): string {
  if (!portfolioContext) {
    return 'I don\'t have any portfolio data loaded yet. Please upload your portfolio first using the Upload feature, then come back to chat about it!';
  }

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('health') || lowerQuery.includes('how') && lowerQuery.includes('portfolio')) {
    return `Based on your portfolio data, I can see your holdings. To get a detailed health score, check the Health Score section of the dashboard. It analyzes diversification, sector balance, geographic exposure, and cost efficiency.\n\nFor a quick overview, here's what I can see from your portfolio:\n${portfolioContext}\n\nDisclaimer: This is for informational purposes only and not financial advice.`;
  }

  if (lowerQuery.includes('sector') || lowerQuery.includes('concentration')) {
    return `Here's your portfolio overview for sector analysis:\n${portfolioContext}\n\nCheck the Sector Analysis page on the dashboard for detailed sector breakdown with benchmark comparisons.\n\nDisclaimer: This is for informational purposes only and not financial advice.`;
  }

  return `Here's what I know about your portfolio:\n${portfolioContext}\n\nI can help you understand your portfolio composition, risk, and potential improvements. Try asking specific questions like "Am I overexposed to banking?" or "What's my largest holding?"\n\nNote: For the full AI-powered analysis, please configure your Anthropic API key.\n\nDisclaimer: This is for informational purposes only and not financial advice.`;
}

function generateFollowUps(query: string, context: string): string[] {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('sector') || lowerQuery.includes('allocation')) {
    return [
      'Which sectors am I missing?',
      'How does my allocation compare to Nifty 50?',
      'Should I rebalance my sectors?',
    ];
  }

  if (lowerQuery.includes('risk') || lowerQuery.includes('concentrate')) {
    return [
      'What is my biggest risk factor?',
      'How can I reduce concentration risk?',
      'Show me my portfolio diversification score',
    ];
  }

  if (lowerQuery.includes('expense') || lowerQuery.includes('cost')) {
    return [
      'Which fund has the highest expense ratio?',
      'How much am I paying in annual fees?',
      'Are there cheaper alternatives?',
    ];
  }

  return [
    'How is my portfolio diversified?',
    'What are my biggest risk factors?',
    'Show me my top holdings',
  ];
}

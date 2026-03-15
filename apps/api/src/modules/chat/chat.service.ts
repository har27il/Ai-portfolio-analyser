import { db } from '../../db/index.js';
import { conversations, messages, portfolios, holdings } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { getAIResponse } from './ai.service.js';

export const chatService = {
  async listConversations(userId: string) {
    return db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));
  },

  async createConversation(userId: string, portfolioId?: string) {
    // If portfolioId provided, verify user owns it
    if (portfolioId) {
      const [portfolio] = await db.select({ id: portfolios.id })
        .from(portfolios)
        .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)));
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }
    }

    const [conversation] = await db.insert(conversations).values({
      userId,
      portfolioId,
    }).returning();
    return conversation;
  },

  async getMessages(conversationId: string, userId: string) {
    // Verify user owns conversation
    const [conversation] = await db.select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
    if (!conversation) return [];

    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  },

  async sendMessage(conversationId: string, userId: string, content: string) {
    // Verify user owns conversation
    const [conversation] = await db.select().from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Save user message
    const [userMessage] = await db.insert(messages).values({
      conversationId,
      role: 'user',
      content,
    }).returning();

    // Get portfolio context if linked
    let portfolioContext = '';
    if (conversation.portfolioId) {
      const [portfolio] = await db.select().from(portfolios)
        .where(eq(portfolios.id, conversation.portfolioId));
      const holdingsList = await db.select().from(holdings)
        .where(eq(holdings.portfolioId, conversation.portfolioId));

      if (portfolio && holdingsList.length > 0) {
        const totalValue = holdingsList.reduce((sum, h) =>
          sum + parseFloat(h.quantity as string) * parseFloat(h.avgCost as string), 0);

        // Sanitize portfolio data before injecting into prompt
        const sanitizedName = String(portfolio.name).slice(0, 100).replace(/[<>{}]/g, '');
        const sanitizedCurrency = String(portfolio.currency).slice(0, 3);

        portfolioContext = `
Portfolio: ${sanitizedName} (${sanitizedCurrency})
Total Invested Value: ${totalValue.toLocaleString('en-IN')}
Holdings (${holdingsList.length}):
${holdingsList.map(h => {
  const symbol = String(h.symbol).slice(0, 50).replace(/[<>{}]/g, '');
  const name = String(h.name).slice(0, 100).replace(/[<>{}]/g, '');
  const value = parseFloat(h.quantity as string) * parseFloat(h.avgCost as string);
  const weight = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';
  return `- ${symbol} (${name}): ${parseFloat(h.quantity as string)} units = ${weight}%`;
}).join('\n')}
`;
      }
    }

    // Get conversation history (limit to last 10 messages)
    const history = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const recentHistory = history.slice(-10);

    // Get AI response
    const aiResponse = await getAIResponse(content, portfolioContext, recentHistory);

    // Save assistant message
    const [assistantMessage] = await db.insert(messages).values({
      conversationId,
      role: 'assistant',
      content: aiResponse.message,
      metadata: {
        citations: aiResponse.citations,
        suggestedFollowUps: aiResponse.suggestedFollowUps,
      },
    }).returning();

    return {
      userMessage,
      assistantMessage,
    };
  },

  async deleteConversation(conversationId: string, userId: string) {
    // Only delete if user owns it
    await db.delete(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
  },
};

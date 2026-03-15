import { db } from '../../db/index.js';
import { conversations, messages, portfolios, holdings } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getAIResponse } from './ai.service.js';

export const chatService = {
  async listConversations(userId?: string) {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  },

  async createConversation(portfolioId?: string) {
    const [conversation] = await db.insert(conversations).values({
      portfolioId,
    }).returning();
    return conversation;
  },

  async getMessages(conversationId: string) {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  },

  async sendMessage(conversationId: string, content: string) {
    // Save user message
    const [userMessage] = await db.insert(messages).values({
      conversationId,
      role: 'user',
      content,
    }).returning();

    // Get conversation context
    const [conversation] = await db.select().from(conversations)
      .where(eq(conversations.id, conversationId));

    // Get portfolio context if linked
    let portfolioContext = '';
    if (conversation?.portfolioId) {
      const [portfolio] = await db.select().from(portfolios)
        .where(eq(portfolios.id, conversation.portfolioId));
      const holdingsList = await db.select().from(holdings)
        .where(eq(holdings.portfolioId, conversation.portfolioId));

      if (portfolio && holdingsList.length > 0) {
        const totalValue = holdingsList.reduce((sum, h) =>
          sum + parseFloat(h.quantity as string) * parseFloat(h.avgCost as string), 0);

        portfolioContext = `
Portfolio: ${portfolio.name} (${portfolio.currency})
Total Invested Value: ${totalValue.toLocaleString('en-IN')}
Holdings (${holdingsList.length}):
${holdingsList.map(h => {
  const value = parseFloat(h.quantity as string) * parseFloat(h.avgCost as string);
  const weight = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';
  return `- ${h.symbol} (${h.name}): ${parseFloat(h.quantity as string)} units @ ₹${parseFloat(h.avgCost as string)} = ₹${value.toLocaleString('en-IN')} (${weight}%)`;
}).join('\n')}
`;
      }
    }

    // Get conversation history
    const history = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Get AI response
    const aiResponse = await getAIResponse(content, portfolioContext, history);

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

  async deleteConversation(conversationId: string) {
    await db.delete(conversations).where(eq(conversations.id, conversationId));
  },
};

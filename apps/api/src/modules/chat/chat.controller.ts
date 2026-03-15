import type { FastifyRequest, FastifyReply } from 'fastify';
import { chatService } from './chat.service.js';

export const chatController = {
  async listConversations(request: FastifyRequest, reply: FastifyReply) {
    const conversations = await chatService.listConversations();
    return { conversations };
  },

  async createConversation(request: FastifyRequest, reply: FastifyReply) {
    const { portfolioId } = request.body as { portfolioId?: string };
    const conversation = await chatService.createConversation(portfolioId);
    reply.code(201);
    return conversation;
  },

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const messages = await chatService.getMessages(id);
    return { messages };
  },

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { content } = request.body as { content: string };

    if (!content || !content.trim()) {
      reply.code(400);
      return { error: 'Message content is required' };
    }

    const result = await chatService.sendMessage(id, content);
    return result;
  },

  async deleteConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await chatService.deleteConversation(id);
    reply.code(204);
  },
};

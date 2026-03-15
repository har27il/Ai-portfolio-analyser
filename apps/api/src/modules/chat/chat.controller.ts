import type { FastifyRequest, FastifyReply } from 'fastify';
import { chatService } from './chat.service.js';
import { validate, uuidParam, createConversationSchema, sendMessageSchema } from '../../common/validation.js';

function getUserId(request: FastifyRequest): string {
  return (request.user as any)?.sub || '';
}

export const chatController = {
  async listConversations(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request);
    const conversations = await chatService.listConversations(userId);
    return { conversations };
  },

  async createConversation(request: FastifyRequest, reply: FastifyReply) {
    const result = validate(createConversationSchema, request.body || {});
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }

    const userId = getUserId(request);
    const conversation = await chatService.createConversation(userId, result.data.portfolioId);
    reply.code(201);
    return conversation;
  },

  async getMessages(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    if (!uuidParam.safeParse(id).success) {
      reply.code(400);
      return { error: 'Invalid conversation ID' };
    }

    const userId = getUserId(request);
    const messages = await chatService.getMessages(id, userId);
    return { messages };
  },

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    if (!uuidParam.safeParse(id).success) {
      reply.code(400);
      return { error: 'Invalid conversation ID' };
    }

    const result = validate(sendMessageSchema, request.body);
    if (!result.success) {
      reply.code(400);
      return { error: 'Validation failed', details: result.error };
    }

    const userId = getUserId(request);
    const response = await chatService.sendMessage(id, userId, result.data.content);
    return response;
  },

  async deleteConversation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    if (!uuidParam.safeParse(id).success) {
      reply.code(400);
      return { error: 'Invalid conversation ID' };
    }

    const userId = getUserId(request);
    await chatService.deleteConversation(id, userId);
    reply.code(204);
  },
};

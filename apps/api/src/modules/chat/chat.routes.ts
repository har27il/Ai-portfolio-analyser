import type { FastifyInstance } from 'fastify';
import { chatController } from './chat.controller.js';

export async function chatRoutes(app: FastifyInstance) {
  app.get('/', chatController.listConversations);
  app.post('/', chatController.createConversation);
  app.get('/:id/messages', chatController.getMessages);
  app.post('/:id/messages', chatController.sendMessage);
  app.delete('/:id', chatController.deleteConversation);
}

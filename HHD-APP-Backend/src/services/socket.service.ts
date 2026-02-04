import { getIO } from '../config/socket';
import { logger } from '../utils/logger';

export class SocketService {
  /**
   * Emit order update to specific order room
   */
  static emitOrderUpdate(orderId: string, data: any): void {
    const io = getIO();
    io.to(`order:${orderId}`).emit('order:updated', data);
    logger.debug(`Order update emitted for order: ${orderId}`);
  }

  /**
   * Emit notification to user
   */
  static emitUserNotification(userId: string, data: any): void {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', data);
    logger.debug(`Notification sent to user: ${userId}`);
  }

  /**
   * Emit new order received
   */
  static emitNewOrder(userId: string, orderData: any): void {
    const io = getIO();
    io.to(`user:${userId}`).emit('order:received', orderData);
    logger.debug(`New order notification sent to user: ${userId}`);
  }
}

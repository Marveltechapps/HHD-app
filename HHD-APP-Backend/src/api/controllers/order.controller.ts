import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import Order from '../../models/Order.model';
import CompletedOrder from '../../models/CompletedOrder.model';
import Item from '../../models/Item.model';
import { AuthRequest } from '../../middleware/auth';
import { ORDER_STATUS } from '../../utils/constants';
import { SocketService } from '../../services/socket.service';
import { getIO } from '../../config/socket';
import mongoose from 'mongoose';

/**
 * @desc    Get all orders for user
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user?.id;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:orderId
 * @access  Private
 */
export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    // Try to find order - first try with userId, then without userId
    // This allows users to access orders even if not directly assigned to them
    let order = await Order.findOne({ orderId, userId });
    
    // If order not found with userId, try without userId filter
    // This allows scanning any order by orderId
    if (!order) {
      order = await Order.findOne({ orderId });
    }

    // Get items for this order (items are not user-specific)
    const items = await Item.find({ orderId });

    // If order doesn't exist but items do, still return items
    // This allows users to scan orders and see items even if order record doesn't exist
    if (!order && items.length === 0) {
      throw new ErrorResponse(`Order not found with id of ${orderId}`, 404);
    }

    res.status(200).json({
      success: true,
      data: {
        order: order || null, // Return null if order doesn't exist but items do
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId, zone, itemCount, targetTime, items } = req.body;

    // Check if order already exists
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      throw new ErrorResponse(`Order ${orderId} already exists`, 400);
    }

    const order = await Order.create({
      orderId,
      userId,
      zone,
      itemCount,
      targetTime,
      status: ORDER_STATUS.RECEIVED,
      startedAt: new Date(),
    });

    // Create items if provided
    if (items && Array.isArray(items)) {
      await Item.insertMany(
        items.map((item: any) => ({
          orderId,
          ...item,
        }))
      );
    }

    // Emit socket event
    SocketService.emitNewOrder(userId, order);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:orderId/status
 * @access  Private
 */
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status, bagId, rackLocation, riderName, riderId, pickTime } = req.body;
    const userId = req.user?.id;

    const order = await Order.findOne({ orderId, userId });

    if (!order) {
      throw new ErrorResponse(`Order not found with id of ${orderId}`, 404);
    }

    // Update order
    if (status) order.status = status;
    if (bagId) order.bagId = bagId;
    if (rackLocation) order.rackLocation = rackLocation;
    if (riderName) order.riderName = riderName;
    if (riderId) order.riderId = riderId;
    if (pickTime) order.pickTime = pickTime;

    // Set startedAt when status changes to "picking"
    if (status === ORDER_STATUS.PICKING && !order.startedAt) {
      order.startedAt = new Date();
    }

    if (status === ORDER_STATUS.COMPLETED) {
      order.completedAt = new Date();
    }

    await order.save();

    // Emit socket event
    SocketService.emitOrderUpdate(orderId, {
      orderId,
      status: order.status,
      updatedAt: order.updatedAt,
    });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders by status
 * @route   GET /api/orders/status/:status
 * @access  Private
 */
export const getOrdersByStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new ErrorResponse('User ID is required', 401));
    }

    // Fetch orders from Orders table (Tata Base) filtered by userId and status
    const orders = await Order.find({ userId, status }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assignorders by status (from assignorders collection)
 * @route   GET /api/orders/assignorders/status/:status
 * @access  Private
 */
export const getAssignOrdersByStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new ErrorResponse('User ID is required', 401));
    }

    // Get the assignorders collection directly
    const assignOrdersCollection = mongoose.connection.collection('assignorders');

    // Query assignorders with the specified status, filtered by userId
    // Only show orders assigned to the current user
    const query: any = { 
      status: status,
      userId: new mongoose.Types.ObjectId(userId)
    };
    
    const orders = await assignOrdersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('[AssignOrders] Error fetching assignorders:', error);
    next(error);
  }
};

/**
 * @desc    Update assignorders status (from assignorders collection)
 * @route   PUT /api/orders/assignorders/:orderId/status
 * @access  Private
 */
export const updateAssignOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ErrorResponse('Status is required', 400);
    }

    // Get the assignorders collection directly
    const assignOrdersCollection = mongoose.connection.collection('assignorders');

    // Find the order in assignorders collection
    const order = await assignOrdersCollection.findOne({ orderId });

    if (!order) {
      throw new ErrorResponse(`AssignOrder not found with id of ${orderId}`, 404);
    }

    // Update the status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If status is completed, add completedAt timestamp
    if (status === ORDER_STATUS.COMPLETED || status === 'completed') {
      updateData.completedAt = new Date();
    }

    // Update the assignorder
    const result = await assignOrdersCollection.updateOne(
      { orderId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new ErrorResponse(`AssignOrder not found with id of ${orderId}`, 404);
    }

    // Get the updated order
    const updatedOrder = await assignOrdersCollection.findOne({ orderId });

    // Emit socket event for real-time updates
    SocketService.emitOrderUpdate(orderId, {
      orderId,
      status: updateData.status,
      updatedAt: updateData.updatedAt,
    });

    // Also emit a broadcast event for all users to refresh their pending orders list
    const io = getIO();
    io.emit('assignorder:updated', {
      orderId,
      status: updateData.status,
      updatedAt: updateData.updatedAt,
    });

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: `AssignOrder status updated to ${status}`,
    });
  } catch (error) {
    console.error('[AssignOrders] Error updating assignorder status:', error);
    next(error);
  }
};

/**
 * @desc    Get completed orders from Completed Orders table
 * @route   GET /api/orders/completed
 * @access  Private
 */
export const getCompletedOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new ErrorResponse('User ID is required', 401));
    }

    // Fetch completed orders from Completed Orders table filtered by userId
    const completedOrders = await CompletedOrder.find({ userId })
      .sort({ completedAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: completedOrders.length,
      data: completedOrders,
    });
  } catch (error) {
    console.error('[Orders] Error fetching completed orders:', error);
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import Item from '../../models/Item.model';
import { AuthRequest } from '../../middleware/auth';
import { ITEM_STATUS } from '../../utils/constants';

/**
 * @desc    Get items for an order
 * @route   GET /api/items/order/:orderId
 * @access  Private
 */
export const getOrderItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.query;

    const query: any = { orderId };
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Scan item
 * @route   POST /api/items/scan
 * @access  Private
 */
export const scanItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, itemCode } = req.body;

    if (!orderId || !itemCode) {
      throw new ErrorResponse('Please provide orderId and itemCode', 400);
    }

    const item = await Item.findOne({ orderId, itemCode });

    if (!item) {
      throw new ErrorResponse('Item not found', 404);
    }

    item.status = ITEM_STATUS.SCANNED;
    item.scannedAt = new Date();
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark item as not found
 * @route   PUT /api/items/:itemId/not-found
 * @access  Private
 */
export const markItemNotFound = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { notes } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      throw new ErrorResponse(`Item not found with id of ${itemId}`, 404);
    }

    item.status = ITEM_STATUS.NOT_FOUND;
    if (notes) item.notes = notes;
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:itemId
 * @access  Private
 */
export const updateItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { status, location, notes } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      throw new ErrorResponse(`Item not found with id of ${itemId}`, 404);
    }

    if (status) item.status = status;
    if (location) item.location = location;
    if (notes) item.notes = notes;

    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

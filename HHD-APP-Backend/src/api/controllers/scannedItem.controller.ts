import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import ScannedItem from '../../models/ScannedItem.model';
import { AuthRequest } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Create a new scanned item record
 * @route   POST /api/scanned-items
 * @access  Private
 */
export const createScannedItem = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { barcodeData, barcodeType, orderId, deviceId, metadata } = req.body;

    if (!barcodeData) {
      throw new ErrorResponse('Please provide barcodeData', 400);
    }

    // Create scanned item record
    const scannedItem = await ScannedItem.create({
      barcodeData,
      barcodeType: barcodeType || 'other',
      orderId: orderId || undefined,
      userId: req.user?.id,
      deviceId: deviceId || undefined,
      metadata: metadata || {},
      scannedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: scannedItem,
    });
  }
);

/**
 * @desc    Get all scanned items
 * @route   GET /api/scanned-items
 * @access  Private
 */
export const getScannedItems = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { orderId, userId, deviceId, barcodeType, startDate, endDate, limit = 50, page = 1 } = req.query;

    const query: any = {};

    if (orderId) query.orderId = orderId;
    if (userId) query.userId = userId;
    if (deviceId) query.deviceId = deviceId;
    if (barcodeType) query.barcodeType = barcodeType;

    // Date range filter
    if (startDate || endDate) {
      query.scannedAt = {};
      if (startDate) query.scannedAt.$gte = new Date(startDate as string);
      if (endDate) query.scannedAt.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const scannedItems = await ScannedItem.find(query)
      .sort({ scannedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await ScannedItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: scannedItems.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: scannedItems,
    });
  }
);

/**
 * @desc    Get a single scanned item by ID
 * @route   GET /api/scanned-items/:id
 * @access  Private
 */
export const getScannedItem = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const scannedItem = await ScannedItem.findById(id);

    if (!scannedItem) {
      throw new ErrorResponse(`Scanned item not found with id of ${id}`, 404);
    }

    res.status(200).json({
      success: true,
      data: scannedItem,
    });
  }
);

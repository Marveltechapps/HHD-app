import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import Bag from '../../models/Bag.model';
import { AuthRequest } from '../../middleware/auth';
import { BAG_STATUS } from '../../utils/constants';

/**
 * Parse bag QR code format: BAG-001-25L-XYZ123
 * Returns: { bagId: "BAG-001", size: "25L", code: "XYZ123" }
 */
function parseBagQR(qrCode: string): { bagId: string; size?: string; code?: string } {
  // Format: BAG-{number}-{size}-{code}
  // Example: BAG-001-25L-XYZ123
  const parts = qrCode.split('-');
  
  if (parts.length < 2) {
    throw new ErrorResponse('Invalid bag QR code format. Expected: BAG-{number}-{size}-{code}', 400);
  }

  const bagId = `${parts[0]}-${parts[1]}`; // BAG-001
  let size: string | undefined;
  let code: string | undefined;

  if (parts.length >= 3) {
    size = parts[2]; // 25L
  }

  if (parts.length >= 4) {
    code = parts.slice(3).join('-'); // XYZ123 or XYZ-123-ABC
  }

  return { bagId, size, code };
}

/**
 * @desc    Scan bag
 * @route   POST /api/bags/scan
 * @access  Private
 */
export const scanBag = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { qrCode, orderId } = req.body; // Accept qrCode instead of bagId
    const userId = req.user?.id;

    if (!qrCode || !orderId) {
      throw new ErrorResponse('Please provide qrCode and orderId', 400);
    }

    // Parse QR code to extract bagId, size, and code
    const { bagId, size, code } = parseBagQR(qrCode);

    // Check if bag ID already exists (globally unique)
    const existingBag = await Bag.findOne({ bagId });
    
    if (existingBag) {
      // Bag has already been scanned - show error message
      throw new ErrorResponse(
        `Bag ${bagId} has already been scanned for order ${existingBag.orderId}. Please scan a different bag.`,
        409 // 409 Conflict status code
      );
    }

    // Create new bag record (bagId is unique, so this is a new bag)
    const bag = await Bag.create({
      bagId,
      orderId,
      userId,
      size,
      status: BAG_STATUS.SCANNED,
      scannedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: bag,
      message: 'Bag scanned successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update bag status
 * @route   PUT /api/bags/:bagId
 * @access  Private
 */
export const updateBag = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bagId } = req.params;
    const { status, photoUrl } = req.body;

    const bag = await Bag.findOne({ bagId });

    if (!bag) {
      throw new ErrorResponse(`Bag not found with id of ${bagId}`, 404);
    }

    if (status) bag.status = status;
    if (photoUrl) bag.photoUrl = photoUrl;

    await bag.save();

    res.status(200).json({
      success: true,
      data: bag,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bag by ID
 * @route   GET /api/bags/:bagId
 * @access  Private
 */
export const getBag = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bagId } = req.params;

    const bag = await Bag.findOne({ bagId });

    if (!bag) {
      throw new ErrorResponse(`Bag not found with id of ${bagId}`, 404);
    }

    res.status(200).json({
      success: true,
      data: bag,
    });
  } catch (error) {
    next(error);
  }
};

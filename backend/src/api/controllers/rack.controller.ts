import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import Rack from '../../models/Rack.model';
import Order from '../../models/Order.model';
import CompletedOrder from '../../models/CompletedOrder.model';
import { AuthRequest } from '../../middleware/auth';
import { ORDER_STATUS } from '../../utils/constants';

/**
 * Parse rack QR code format: Rack-D1-Slot3 (John Doe)
 * Returns: { rackIdentifier: "D1", slotNumber: 3, riderName: "John Doe", rackCode: "Rack-D1-Slot3" }
 * 
 * STRICT FORMAT: Only accepts "Rack-{identifier}-Slot{number} ({rider name})"
 * Example: Rack-D1-Slot3 (John Doe)
 */
function parseRackQR(qrCode: string): {
  rackIdentifier: string;
  slotNumber: number;
  riderName: string;
  rackCode: string;
} {
  // STRICT FORMAT: Rack-{identifier}-Slot{number} ({rider name})
  // Example: Rack-D1-Slot3 (John Doe)
  // The rider name in parentheses is REQUIRED
  
  // Remove any leading/trailing whitespace
  const trimmed = qrCode.trim();
  
  // Validate the complete format using a single regex pattern
  // Pattern: Rack-{identifier}-Slot{number} ({rider name})
  // identifier: letters and numbers (e.g., D1, A1, B2)
  // number: one or more digits (e.g., 3, 10, 25)
  // rider name: any characters except closing parenthesis
  // Note: \s* allows zero or more spaces before the opening parenthesis for flexibility
  const fullPattern = /^Rack-([A-Z0-9]+)-Slot(\d+)\s*\(([^)]+)\)$/i;
  const match = trimmed.match(fullPattern);
  
  if (!match) {
    throw new ErrorResponse(
      'Invalid rack QR code format. Expected format: Rack-{identifier}-Slot{number} ({rider name}). Example: Rack-D1-Slot3 (John Doe)',
      400
    );
  }
  
  const rackIdentifier = match[1].toUpperCase(); // e.g., "D1"
  const slotNumber = parseInt(match[2], 10); // e.g., 3
  const riderName = match[3].trim(); // e.g., "John Doe"
  
  // Validate slot number
  if (isNaN(slotNumber) || slotNumber < 1) {
    throw new ErrorResponse('Invalid slot number in QR code', 400);
  }
  
  // Validate rider name is not empty
  if (!riderName || riderName.length === 0) {
    throw new ErrorResponse('Rider name is required in QR code format', 400);
  }
  
  // Generate rackCode: "Rack-D1-Slot3"
  const rackCode = `Rack-${rackIdentifier}-Slot${slotNumber}`;
  
  return {
    rackIdentifier,
    slotNumber,
    riderName,
    rackCode,
  };
}

/**
 * @desc    Scan rack QR and assign order
 * @route   POST /api/racks/scan
 * @access  Private
 */
export const scanRack = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { qrCode, orderId, riderId, pickTime } = req.body;

    if (!qrCode || !orderId) {
      throw new ErrorResponse('Please provide qrCode and orderId', 400);
    }

    // Parse QR code to extract rackIdentifier, slotNumber, and riderName
    const { rackIdentifier, slotNumber, riderName, rackCode: parsedRackCode } = parseRackQR(qrCode);

    // Find or create rack based on rackIdentifier and slotNumber
    let rack = await Rack.findOne({ rackIdentifier, slotNumber });

    if (!rack) {
      // Rack doesn't exist, create a new one
      // Determine zone from rackIdentifier (first character)
      const zone = rackIdentifier.charAt(0);
      
      rack = await Rack.create({
        rackCode: parsedRackCode,
        rackIdentifier,
        slotNumber,
        location: `${rackIdentifier}-Slot${slotNumber}`,
        zone: `Zone ${zone}`,
        isAvailable: true,
      });
    }

    if (!rack.isAvailable) {
      throw new ErrorResponse(
        `Rack ${parsedRackCode} is not available. Currently assigned to order ${rack.currentOrderId}`,
        400
      );
    }

    // Update rack with order assignment
    rack.isAvailable = false;
    rack.currentOrderId = orderId;
    rack.riderName = riderName; // riderName is now required from parseRackQR
    if (riderId) rack.riderId = riderId;
    rack.assignedAt = new Date();
    await rack.save();

    // Find the order in Orders table
    const userId = req.user?.id;
    if (!userId) {
      throw new ErrorResponse('User ID is required', 401);
    }

    const order = await Order.findOne({ orderId, userId });

    if (order) {
      // Calculate pickTime if not provided
      let calculatedPickTime = pickTime;
      if (!calculatedPickTime && order.startedAt) {
        // Calculate from startedAt to now (in minutes)
        const startTime = new Date(order.startedAt).getTime();
        const completedTime = new Date().getTime();
        const diffInSeconds = Math.round((completedTime - startTime) / 1000);
        calculatedPickTime = Math.round(diffInSeconds / 60); // Convert to minutes
      } else if (!calculatedPickTime && order.pickTime) {
        // Use existing pickTime from order
        calculatedPickTime = order.pickTime;
      }

      // Update order status to completed before moving
      order.status = ORDER_STATUS.COMPLETED;
      order.completedAt = new Date();
      order.rackLocation = parsedRackCode;
      order.riderName = riderName;
      if (riderId) order.riderId = riderId;
      if (calculatedPickTime) order.pickTime = calculatedPickTime;
      await order.save();

      // Create completed order in Completed Orders table
      const completedOrderData = {
        orderId: order.orderId,
        userId: order.userId,
        zone: order.zone,
        status: ORDER_STATUS.COMPLETED,
        itemCount: order.itemCount,
        targetTime: order.targetTime,
        pickTime: calculatedPickTime || order.pickTime,
        bagId: order.bagId,
        rackLocation: parsedRackCode, // Use the scanned rack location
        riderName: riderName,
        riderId: riderId || order.riderId,
        startedAt: order.startedAt,
        completedAt: new Date(),
        rackAssignedAt: new Date(),
        createdAt: order.createdAt,
        updatedAt: new Date(),
      };

      // Check if completed order already exists (prevent duplicates)
      const existingCompletedOrder = await CompletedOrder.findOne({ orderId });
      if (!existingCompletedOrder) {
        await CompletedOrder.create(completedOrderData);
        console.log(`[Rack] Order ${orderId} moved to Completed Orders table`);
      } else {
        console.log(`[Rack] Order ${orderId} already exists in Completed Orders table, skipping duplicate`);
      }

      // Delete the order from Orders table (move operation)
      await Order.deleteOne({ orderId, userId });
      console.log(`[Rack] Order ${orderId} deleted from Orders table (status changed from Pending to Complete)`);
    } else {
      console.warn(`[Rack] Order ${orderId} not found in Orders table, skipping move operation`);
    }

    res.status(200).json({
      success: true,
      data: rack,
      message: 'Rack scanned and assigned successfully. Order moved to Completed Orders.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rack by code
 * @route   GET /api/racks/:rackCode
 * @access  Private
 */
export const getRack = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rackCode } = req.params;

    const rack = await Rack.findOne({ rackCode });

    if (!rack) {
      throw new ErrorResponse(`Rack not found with code ${rackCode}`, 404);
    }

    res.status(200).json({
      success: true,
      data: rack,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available racks
 * @route   GET /api/racks/available
 * @access  Private
 */
export const getAvailableRacks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { zone } = req.query;

    const query: any = { isAvailable: true };
    if (zone) {
      query.zone = zone;
    }

    const racks = await Rack.find(query);

    res.status(200).json({
      success: true,
      count: racks.length,
      data: racks,
    });
  } catch (error) {
    next(error);
  }
};

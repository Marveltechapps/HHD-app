import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import Rack from '../../models/Rack.model';
import { AuthRequest } from '../../middleware/auth';

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
  const fullPattern = /^Rack-([A-Z0-9]+)-Slot(\d+)\s+\(([^)]+)\)$/i;
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
    const { qrCode, orderId, riderId } = req.body;

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

    res.status(200).json({
      success: true,
      data: rack,
      message: 'Rack scanned and assigned successfully',
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

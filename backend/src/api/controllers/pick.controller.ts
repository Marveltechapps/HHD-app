import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import { AuthRequest } from '../../middleware/auth';
import PickIssue from '../../models/PickIssue.model';
import Inventory from '../../models/Inventory.model';
import Item from '../../models/Item.model';
import Task from '../../models/Task.model';
import {
  PICK_ISSUE_TYPE,
  INVENTORY_STATUS,
  ITEM_STATUS_EXTENDED,
  TASK_STATUS,
  TASK_PRIORITY,
  PICK_NEXT_ACTION,
} from '../../utils/constants';

/**
 * @desc    Report a picking issue
 * @route   POST /api/pick/report-issue
 * @access  Private
 */
export const reportIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId, sku, binId, issueType, deviceId, timestamp } = req.body;

    // Validate required fields
    if (!orderId || !sku || !binId || !issueType) {
      throw new ErrorResponse(
        'Please provide orderId, sku, binId, and issueType',
        400
      );
    }

    // Validate issue type
    if (!Object.values(PICK_ISSUE_TYPE).includes(issueType)) {
      throw new ErrorResponse('Invalid issue type', 400);
    }

    // Find the order item
    const orderItem = await Item.findOne({ orderId, itemCode: sku });
    if (!orderItem) {
      throw new ErrorResponse('Order item not found', 404);
    }

    // Create pick issue record
    const pickIssue = await PickIssue.create({
      orderId,
      sku,
      binId,
      issueType,
      reportedBy: userId,
      deviceId: deviceId || undefined,
    });

    let nextAction = PICK_NEXT_ACTION.SKIP_ITEM;
    let alternateBinId: string | null = null;
    let itemStatus = ITEM_STATUS_EXTENDED.SHORT;

    // Handle different issue types
    switch (issueType) {
      case PICK_ISSUE_TYPE.ITEM_DAMAGED: {
        // Mark inventory as damaged
        await Inventory.updateOne(
          { sku, binId },
          {
            $set: {
              status: INVENTORY_STATUS.DAMAGED,
            },
            $inc: { quantity: -1 }, // Reduce available quantity
          },
          { upsert: false }
        );

        // Try to find alternate bin with available stock
        const alternateBin = await Inventory.findOne({
          sku,
          status: INVENTORY_STATUS.AVAILABLE,
          quantity: { $gt: 0 },
          binId: { $ne: binId },
        }).sort({ quantity: -1 });

        if (alternateBin) {
          nextAction = PICK_NEXT_ACTION.ALTERNATE_BIN;
          alternateBinId = alternateBin.binId;
          itemStatus = ITEM_STATUS_EXTENDED.REASSIGNED;
        }
        break;
      }

      case PICK_ISSUE_TYPE.ITEM_MISSING: {
        // Create audit task for bin
        await Task.create({
          title: `Bin Audit Required: ${binId}`,
          description: `Item ${sku} reported as missing in bin ${binId} for order ${orderId}`,
          userId,
          orderId,
          status: TASK_STATUS.PENDING,
          priority: TASK_PRIORITY.HIGH,
        });

        // Try to find alternate bin
        const alternateBin = await Inventory.findOne({
          sku,
          status: INVENTORY_STATUS.AVAILABLE,
          quantity: { $gt: 0 },
          binId: { $ne: binId },
        }).sort({ quantity: -1 });

        if (alternateBin) {
          nextAction = PICK_NEXT_ACTION.ALTERNATE_BIN;
          alternateBinId = alternateBin.binId;
          itemStatus = ITEM_STATUS_EXTENDED.REASSIGNED;
        }
        break;
      }

      case PICK_ISSUE_TYPE.ITEM_EXPIRED: {
        // Block expired stock
        await Inventory.updateOne(
          { sku, binId },
          {
            $set: {
              status: INVENTORY_STATUS.EXPIRED,
            },
          },
          { upsert: false }
        );

        // Try to find fresh batch (non-expired stock)
        const freshBatch = await Inventory.findOne({
          sku,
          status: INVENTORY_STATUS.AVAILABLE,
          quantity: { $gt: 0 },
          $or: [
            { expiryDate: { $gte: new Date() } },
            { expiryDate: { $exists: false } },
          ],
          binId: { $ne: binId },
        }).sort({ expiryDate: 1 }); // Prefer closest expiry date

        if (freshBatch) {
          nextAction = PICK_NEXT_ACTION.ALTERNATE_BIN;
          alternateBinId = freshBatch.binId;
          itemStatus = ITEM_STATUS_EXTENDED.REASSIGNED;
        }
        break;
      }

      case PICK_ISSUE_TYPE.WRONG_ITEM: {
        // Create bin correction task
        await Task.create({
          title: `Bin Correction Required: ${binId}`,
          description: `Wrong item found in bin ${binId} for order ${orderId}. Expected: ${sku}`,
          userId,
          orderId,
          status: TASK_STATUS.PENDING,
          priority: TASK_PRIORITY.URGENT,
        });

        // Try to find correct item in alternate bin
        const alternateBin = await Inventory.findOne({
          sku,
          status: INVENTORY_STATUS.AVAILABLE,
          quantity: { $gt: 0 },
          binId: { $ne: binId },
        }).sort({ quantity: -1 });

        if (alternateBin) {
          nextAction = PICK_NEXT_ACTION.ALTERNATE_BIN;
          alternateBinId = alternateBin.binId;
          itemStatus = ITEM_STATUS_EXTENDED.REASSIGNED;
        }
        break;
      }
    }

    // Update order item status
    orderItem.status = itemStatus;
    if (alternateBinId) {
      orderItem.location = alternateBinId; // Update location to alternate bin
    }
    await orderItem.save();

    // Prepare response
    const response: any = {
      success: true,
      data: {
        pickIssueId: pickIssue._id,
        nextAction,
      },
    };

    if (nextAction === PICK_NEXT_ACTION.ALTERNATE_BIN && alternateBinId) {
      response.data.binId = alternateBinId;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

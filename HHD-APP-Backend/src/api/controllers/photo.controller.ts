import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import Photo from '../../models/Photo.model';
import { AuthRequest } from '../../middleware/auth';
import { getFileUrl } from '../../services/fileUpload.service';

/**
 * @desc    Upload photo for bag
 * @route   POST /api/photos
 * @access  Private
 */
export const uploadPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId, bagId } = req.body;

    if (!orderId || !bagId) {
      throw new ErrorResponse('Please provide orderId and bagId', 400);
    }

    if (!req.file) {
      throw new ErrorResponse('Please upload a photo', 400);
    }

    const photoUrl = getFileUrl(req.file.filename);

    const photo = await Photo.create({
      orderId,
      bagId,
      userId,
      photoUrl,
      photoKey: req.file.filename,
    });

    res.status(201).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get photo by order and bag
 * @route   GET /api/photos/order/:orderId/bag/:bagId
 * @access  Private
 */
export const getPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, bagId } = req.params;

    const photo = await Photo.findOne({ orderId, bagId });

    if (!photo) {
      throw new ErrorResponse('Photo not found', 404);
    }

    res.status(200).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify photo
 * @route   PUT /api/photos/:photoId/verify
 * @access  Private
 */
export const verifyPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { photoId } = req.params;

    const photo = await Photo.findById(photoId);

    if (!photo) {
      throw new ErrorResponse(`Photo not found with id of ${photoId}`, 404);
    }

    photo.verified = true;
    photo.verifiedAt = new Date();
    await photo.save();

    res.status(200).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    next(error);
  }
};

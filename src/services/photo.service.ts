/**
 * Photo Service
 * Handles photo upload API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Photo {
  _id: string;
  bagId: string;
  orderId: string;
  photoUrl: string;
  uploadedAt: string;
  createdAt: string;
}

export interface UploadPhotoRequest {
  bagId: string;
  orderId: string;
  photoUri: string;
}

class PhotoService {
  /**
   * Upload photo
   */
  async uploadPhoto(data: UploadPhotoRequest): Promise<Photo> {
    const response = await apiService.uploadFile<Photo>(
      API_ENDPOINTS.PHOTOS.UPLOAD,
      data.photoUri,
      'photo',
      {
        bagId: data.bagId,
        orderId: data.orderId,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to upload photo');
    }

    return response.data;
  }

  /**
   * Get photo by order and bag
   */
  async getPhoto(orderId: string, bagId: string): Promise<Photo> {
    const response = await apiService.get<Photo>(
      `/photos/order/${orderId}/bag/${bagId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get photo');
    }

    return response.data;
  }

  /**
   * Verify photo
   */
  async verifyPhoto(photoId: string): Promise<Photo> {
    const response = await apiService.put<Photo>(`/photos/${photoId}/verify`, {});

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to verify photo');
    }

    return response.data;
  }
}

export const photoService = new PhotoService();

/**
 * Bag Service
 * Handles bag-related API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Bag {
  _id: string;
  bagId: string;
  orderId: string;
  userId: string;
  status: string;
  size?: string; // Bag size extracted from QR code (e.g., "15L", "25L", "35L", "50L")
  photoUrl?: string;
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanBagRequest {
  qrCode: string; // Full QR code string (e.g., "BAG-001-25L-XYZ123")
  orderId: string;
}

export interface UpdateBagRequest {
  status?: string;
  photoUrl?: string;
}

class BagService {
  /**
   * Scan bag
   */
  async scanBag(data: ScanBagRequest): Promise<Bag> {
    const response = await apiService.post<Bag>(API_ENDPOINTS.BAGS.SCAN, data);

    if (!response.success || !response.data) {
      // Create error with status preserved from API response
      const error: any = new Error(response.message || 'Failed to scan bag');
      // Status will be preserved from ApiError thrown by apiService
      throw error;
    }

    return response.data;
  }

  /**
   * Get bag by ID
   */
  async getBag(bagId: string): Promise<Bag> {
    const response = await apiService.get<Bag>(API_ENDPOINTS.BAGS.BY_ID(bagId));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get bag');
    }

    return response.data;
  }

  /**
   * Update bag
   */
  async updateBag(bagId: string, data: UpdateBagRequest): Promise<Bag> {
    const response = await apiService.put<Bag>(API_ENDPOINTS.BAGS.UPDATE(bagId), data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update bag');
    }

    return response.data;
  }
}

export const bagService = new BagService();

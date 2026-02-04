/**
 * Scanned Item Service
 * Handles API calls for scanned items
 */

import { apiService } from './api.service';

export interface CreateScannedItemRequest {
  barcodeData: string;
  barcodeType?: string;
  orderId?: string;
  deviceId?: string;
  metadata?: {
    itemName?: string;
    quantity?: number;
    location?: string;
    [key: string]: any;
  };
}

export interface ScannedItem {
  _id: string;
  barcodeData: string;
  barcodeType: string;
  orderId?: string;
  userId?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

class ScannedItemService {
  /**
   * Create a new scanned item record
   */
  async createScannedItem(data: CreateScannedItemRequest): Promise<ScannedItem> {
    const response = await apiService.post<ScannedItem>('scanned-items', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to save scanned item');
    }
    return response.data;
  }

  /**
   * Get scanned items with optional filters
   */
  async getScannedItems(params?: {
    orderId?: string;
    userId?: string;
    deviceId?: string;
    barcodeType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: ScannedItem[]; total: number; page: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.orderId) queryParams.append('orderId', params.orderId);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.barcodeType) queryParams.append('barcodeType', params.barcodeType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const endpoint = queryParams.toString()
      ? `scanned-items?${queryParams.toString()}`
      : 'scanned-items';

    const response = await apiService.get<ScannedItem[]>(endpoint);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch scanned items');
    }

    return {
      data: response.data,
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
    };
  }

  /**
   * Get a single scanned item by ID
   */
  async getScannedItem(id: string): Promise<ScannedItem> {
    const response = await apiService.get<ScannedItem>(`scanned-items/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch scanned item');
    }
    return response.data;
  }
}

export const scannedItemService = new ScannedItemService();

/**
 * Rack Service
 * Handles rack-related API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Rack {
  _id: string;
  rackCode: string;
  location: string;
  zone: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScanRackRequest {
  qrCode: string;
  orderId: string;
  riderId?: string;
  pickTime?: number; // in minutes
}

class RackService {
  /**
   * Scan rack QR
   * Validates and inserts rack data into the database
   */
  async scanRack(data: ScanRackRequest): Promise<Rack> {
    const response = await apiService.post<Rack>(API_ENDPOINTS.RACKS.SCAN, data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to scan rack');
    }

    return response.data;
  }

  /**
   * Get rack by code
   */
  async getRack(rackCode: string): Promise<Rack> {
    const response = await apiService.get<Rack>(API_ENDPOINTS.RACKS.BY_CODE(rackCode));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get rack');
    }

    return response.data;
  }
}

export const rackService = new RackService();

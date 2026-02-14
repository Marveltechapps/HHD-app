/**
 * Item Service
 * Handles item-related API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Item {
  _id: string;
  orderId: string;
  itemId: string;
  name: string;
  quantity: number;
  category?: string; // Fresh, Snacks, Grocery, Care
  status: string;
  scannedAt?: string;
  notFoundAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanItemRequest {
  itemId: string;
  orderId: string;
}

export interface UpdateItemRequest {
  status?: string;
  scannedAt?: string;
}

class ItemService {
  /**
   * Get items by order ID
   */
  async getItemsByOrder(orderId: string): Promise<Item[]> {
    const response = await apiService.get<Item[]>(API_ENDPOINTS.ITEMS.BY_ORDER(orderId));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get items');
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Scan item
   */
  async scanItem(data: ScanItemRequest): Promise<Item> {
    const response = await apiService.post<Item>(API_ENDPOINTS.ITEMS.SCAN, data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to scan item');
    }

    return response.data;
  }

  /**
   * Mark item as not found
   */
  async markItemNotFound(itemId: string): Promise<Item> {
    const response = await apiService.put<Item>(API_ENDPOINTS.ITEMS.NOT_FOUND(itemId), {});

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to mark item as not found');
    }

    return response.data;
  }

  /**
   * Update item
   */
  async updateItem(itemId: string, data: UpdateItemRequest): Promise<Item> {
    const response = await apiService.put<Item>(API_ENDPOINTS.ITEMS.UPDATE(itemId), data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update item');
    }

    return response.data;
  }
}

export const itemService = new ItemService();

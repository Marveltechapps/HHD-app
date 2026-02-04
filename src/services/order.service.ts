/**
 * Order Service
 * Handles order-related API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  zone: string;
  itemCount: number;
  targetTime: number;
  status: string;
  bagId?: string;
  rackLocation?: string;
  riderName?: string;
  riderId?: string;
  pickTime?: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  orderId: string;
  zone: string;
  itemCount: number;
  targetTime: number;
  items?: any[];
}

export interface UpdateOrderStatusRequest {
  status?: string;
  bagId?: string;
  rackLocation?: string;
  riderName?: string;
  riderId?: string;
  pickTime?: number;
}

class OrderService {
  /**
   * Get all orders
   */
  async getOrders(params?: { status?: string; page?: number; limit?: number }): Promise<{
    orders: Order[];
    count: number;
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `${API_ENDPOINTS.ORDERS.BASE}${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiService.get<Order[]>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get orders');
    }

    return {
      orders: Array.isArray(response.data) ? response.data : [],
      count: response.count || 0,
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
    };
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<{ order: Order; items: any[] }> {
    const response = await apiService.get<{ order: Order; items: any[] }>(
      API_ENDPOINTS.ORDERS.BY_ID(orderId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get order');
    }

    return response.data;
  }

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiService.post<Order>(API_ENDPOINTS.ORDERS.BASE, data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create order');
    }

    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiService.put<Order>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update order status');
    }

    return response.data;
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string): Promise<Order[]> {
    const response = await apiService.get<Order[]>(API_ENDPOINTS.ORDERS.BY_STATUS(status));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get orders by status');
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get assignorders by status (from assignorders collection)
   */
  async getAssignOrdersByStatus(status: string): Promise<Order[]> {
    const response = await apiService.get<Order[]>(API_ENDPOINTS.ORDERS.ASSIGNORDERS_BY_STATUS(status));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get assignorders by status');
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Update assignorder status (from assignorders collection)
   */
  async updateAssignOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await apiService.put<Order>(
      API_ENDPOINTS.ORDERS.UPDATE_ASSIGNORDER_STATUS(orderId),
      { status }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update assignorder status');
    }

    return response.data;
  }
}

export const orderService = new OrderService();

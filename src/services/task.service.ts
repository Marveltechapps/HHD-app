/**
 * Task Service
 * Handles task-related API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Task {
  _id: string;
  userId: string;
  orderId: string;
  type: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTaskRequest {
  status?: string;
  priority?: number;
}

class TaskService {
  /**
   * Get all tasks
   */
  async getTasks(): Promise<Task[]> {
    const response = await apiService.get<Task[]>(API_ENDPOINTS.TASKS.BASE);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get tasks');
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const response = await apiService.get<Task>(API_ENDPOINTS.TASKS.BY_ID(taskId));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get task');
    }

    return response.data;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiService.put<Task>(API_ENDPOINTS.TASKS.UPDATE(taskId), data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update task');
    }

    return response.data;
  }
}

export const taskService = new TaskService();

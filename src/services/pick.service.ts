/**
 * Pick Service
 * Handles pick-related API calls
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export type PickIssueType =
  | 'ITEM_DAMAGED'
  | 'ITEM_MISSING'
  | 'ITEM_EXPIRED'
  | 'WRONG_ITEM';

export type PickNextAction = 'ALTERNATE_BIN' | 'SKIP_ITEM';

export interface ReportIssueRequest {
  orderId: string;
  sku: string;
  binId: string;
  issueType: PickIssueType;
  deviceId?: string;
  timestamp?: string;
}

export interface ReportIssueResponse {
  pickIssueId: string;
  nextAction: PickNextAction;
  binId?: string; // Present when nextAction is ALTERNATE_BIN
}

class PickService {
  /**
   * Report a picking issue
   */
  async reportIssue(data: ReportIssueRequest): Promise<ReportIssueResponse> {
    const payload = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    const response = await apiService.post<ReportIssueResponse>(
      API_ENDPOINTS.PICK.REPORT_ISSUE,
      payload
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to report issue');
    }

    return response.data;
  }
}

export const pickService = new PickService();

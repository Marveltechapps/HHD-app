/**
 * Authentication Service
 * Handles OTP-based authentication
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface SendOTPRequest {
  mobile: string;
}

export interface SendOTPResponse {
  mobile: string;
  otp?: string; // Only in development
}

export interface VerifyOTPRequest {
  mobile: string;
  otp: string;
}

export interface User {
  id: string;
  mobile: string;
  name?: string;
  role: string;
}

export interface VerifyOTPResponse {
  token: string;
  user: User;
}

export interface GetMeResponse extends User {
  isActive: boolean;
  deviceId?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse extends GetMeResponse {
  _id?: string;
}

class AuthService {
  /**
   * Send OTP to mobile number
   */
  async sendOTP(mobile: string): Promise<SendOTPResponse> {
    try {
      const response = await apiService.post<SendOTPResponse>(
        API_ENDPOINTS.AUTH.SEND_OTP,
        { mobile },
        false // No auth required
      );

      console.log('[Auth Service] Send OTP Response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }

      // The API service returns ApiResponse<T> which has { success, data, message }
      // So response.data contains the actual SendOTPResponse
      if (!response.data) {
        console.error('[Auth Service] No data in response:', response);
        throw new Error(response.message || 'Invalid response from server');
      }

      const otpData = response.data;
      console.log('[Auth Service] OTP Data extracted:', otpData);
      
      // Ensure we return the correct structure
      const result: SendOTPResponse = {
        mobile: otpData.mobile || mobile,
        otp: otpData.otp, // OTP only in development mode
      };
      
      console.log('[Auth Service] Returning OTP response:', result);
      return result;
    } catch (error: any) {
      console.error('[Auth Service] Send OTP Error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and login
   */
  async verifyOTP(mobile: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await apiService.post<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      { mobile, otp },
      false // No auth required
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Invalid OTP');
    }

    // Store token
    await apiService.setToken(response.data.token);

    return response.data;
  }

  /**
   * Get current user
   */
  async getMe(): Promise<GetMeResponse> {
    const response = await apiService.get<GetMeResponse>(API_ENDPOINTS.AUTH.ME);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user');
    }

    return response.data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue even if logout fails
      console.error('Logout error:', error);
    } finally {
      // Always remove token
      await apiService.removeToken();
    }
  }

  /**
   * Get user profile (full profile data)
   */
  async getProfile(): Promise<UserProfileResponse> {
    const response = await apiService.get<UserProfileResponse>(API_ENDPOINTS.USERS.PROFILE);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user profile');
    }

    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getToken();
    return !!token;
  }
}

export const authService = new AuthService();

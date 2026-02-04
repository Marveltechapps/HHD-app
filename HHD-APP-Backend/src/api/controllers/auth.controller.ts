import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../../utils/ErrorResponse';
import User from '../../models/User.model';
import { OTPService } from '../../services/otp.service';
import { protect, AuthRequest } from '../../middleware/auth';
import { logger } from '../../utils/logger';
import { isConnected } from '../../config/database';
import mongoose from 'mongoose';

/**
 * @desc    Send OTP to mobile number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  const { mobile } = req.body;

  // Log incoming request
  logger.info(`[Send OTP] Request received for mobile: ${mobile || 'N/A'}`);

  try {
    // Validate mobile number
    if (!mobile) {
      logger.warn(`[Send OTP] Missing mobile number`);
      res.status(400).json({
        success: false,
        message: 'Please provide a mobile number',
        error: 'Mobile number is required',
      });
      return;
    }

    // Normalize mobile number (remove whitespace)
    const normalizedMobile = String(mobile).trim();
    
    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      logger.warn(`[Send OTP] Invalid mobile number format: ${normalizedMobile}`);
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number starting with 6-9',
        error: 'Invalid mobile number format',
      });
      return;
    }

    logger.info(`[Send OTP] Generating OTP for mobile: ${normalizedMobile}`);

    // Check database connection before proceeding
    if (!isConnected()) {
      logger.error(`[Send OTP] Database not connected for mobile: ${mobile}`, {
        connectionState: mongoose.connection.readyState,
      });
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again in a moment.',
        error: 'Database connection not available',
      });
      return;
    }

    // Generate and save OTP with timeout protection (use normalized mobile)
    let otp: string;
    try {
      otp = await Promise.race([
        OTPService.createOTP(normalizedMobile),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('OTP generation timeout')), 10000)
        ),
      ]);
      logger.info(`[Send OTP] OTP generated successfully for mobile: ${normalizedMobile}`, {
        otp: otp,
      });
    } catch (otpError: any) {
      logger.error(`[Send OTP] Failed to generate OTP for mobile: ${mobile}`, {
        error: otpError.message,
        stack: otpError.stack,
        connectionState: mongoose.connection.readyState,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate OTP. Please try again.';
      if (otpError.message.includes('Database not available') || 
          otpError.message.includes('timeout')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'OTP generation failed',
      });
      return;
    }

    // Send OTP via SMS service (non-blocking in production)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Development: Return OTP in response (use normalized mobile)
      logger.info(`[Send OTP] Development mode - OTP returned in response for mobile: ${normalizedMobile}`);
      const duration = Date.now() - startTime;
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { mobile: normalizedMobile, otp },
      });
      logger.info(`[Send OTP] Request completed in ${duration}ms for mobile: ${normalizedMobile}`);
      return;
    }

    // Production: Send via SMS service (non-blocking)
    try {
      // Send SMS asynchronously - don't wait for it
      sendSMSAsync(mobile, otp).catch((smsError: any) => {
        logger.error(`[Send OTP] SMS sending failed for mobile: ${mobile}`, {
          error: smsError.message,
        });
        // Don't fail the request if SMS fails - OTP is already saved
      });

      const duration = Date.now() - startTime;
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
      logger.info(`[Send OTP] Request completed in ${duration}ms for mobile: ${mobile} (SMS sent asynchronously)`);
    } catch (smsError: any) {
      // Even if SMS fails, OTP is saved and can be verified
      logger.error(`[Send OTP] SMS error for mobile: ${mobile}`, {
        error: smsError.message,
      });
      const duration = Date.now() - startTime;
      res.status(200).json({
        success: true,
        message: 'OTP generated successfully. SMS delivery may be delayed.',
      });
      logger.info(`[Send OTP] Request completed in ${duration}ms for mobile: ${mobile} (SMS failed but OTP saved)`);
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`[Send OTP] Unexpected error for mobile: ${mobile || 'N/A'}`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    // Ensure response is always sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while sending OTP. Please try again.',
        error: error.message || 'Internal server error',
      });
    }
  }
};

/**
 * Send SMS asynchronously (non-blocking)
 * This function runs in the background and doesn't block the response
 */
async function sendSMSAsync(mobile: string, otp: string): Promise<void> {
  // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
  // Example:
  // await twilioClient.messages.create({
  //   body: `Your OTP is ${otp}. Valid for 10 minutes.`,
  //   to: `+91${mobile}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  // });
  
  logger.info(`[Send OTP] SMS would be sent to ${mobile} with OTP: ${otp}`);
}

/**
 * @desc    Verify OTP and login/register user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  const { mobile, otp } = req.body;

  // Log incoming request
  logger.info(`[Verify OTP] Request received for mobile: ${mobile || 'N/A'}`);

  try {
    // Validate input
    if (!mobile) {
      logger.warn(`[Verify OTP] Missing mobile number`);
      res.status(400).json({
        success: false,
        message: 'Please provide mobile number',
        error: 'Mobile number is required',
      });
      return;
    }

    if (!otp) {
      logger.warn(`[Verify OTP] Missing OTP for mobile: ${mobile}`);
      res.status(400).json({
        success: false,
        message: 'Please provide OTP',
        error: 'OTP is required',
      });
      return;
    }

    // Normalize mobile and OTP (remove whitespace)
    const normalizedMobile = String(mobile).trim();
    const normalizedOtp = String(otp).trim();
    
    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(normalizedOtp)) {
      logger.warn(`[Verify OTP] Invalid OTP format for mobile: ${normalizedMobile} (received: ${normalizedOtp}, length: ${normalizedOtp.length})`);
      res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Please enter a 4-digit code.',
        error: 'Invalid OTP format',
      });
      return;
    }

    logger.info(`[Verify OTP] Verifying OTP for mobile: ${normalizedMobile}`, {
      otp: normalizedOtp,
      otpLength: normalizedOtp.length,
      otpType: typeof normalizedOtp,
    });

    // Check database connection before proceeding
    if (!isConnected()) {
      logger.error(`[Verify OTP] Database not connected for mobile: ${mobile}`, {
        connectionState: mongoose.connection.readyState,
      });
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again in a moment.',
        error: 'Database connection not available',
      });
      return;
    }

    // Verify OTP with timeout protection (use normalized values)
    let isValid: boolean;
    try {
      isValid = await Promise.race([
        OTPService.verifyOTP(normalizedMobile, normalizedOtp),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('OTP verification timeout')), 10000)
        ),
      ]);
    } catch (verifyError: any) {
      logger.error(`[Verify OTP] Failed to verify OTP for mobile: ${mobile}`, {
        error: verifyError.message,
        stack: verifyError.stack,
        connectionState: mongoose.connection.readyState,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to verify OTP. Please try again.';
      if (verifyError.message.includes('Database not available') || 
          verifyError.message.includes('timeout')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'OTP verification failed',
      });
      return;
    }

    if (!isValid) {
      logger.warn(`[Verify OTP] Invalid or expired OTP for mobile: ${mobile}`);
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please try again.',
        error: 'Invalid OTP',
      });
      return;
    }

    logger.info(`[Verify OTP] OTP verified successfully for mobile: ${mobile}`);

    // Find or create user (use normalized mobile)
    let user;
    try {
      user = await User.findOne({ mobile: normalizedMobile });

      if (!user) {
        logger.info(`[Verify OTP] Creating new user for mobile: ${normalizedMobile}`);
        user = await User.create({
          mobile: normalizedMobile,
          isActive: true,
        });
        logger.info(`[Verify OTP] New user created for mobile: ${normalizedMobile}`);
      } else {
        logger.info(`[Verify OTP] Existing user found for mobile: ${normalizedMobile}`);
      }
    } catch (userError: any) {
      logger.error(`[Verify OTP] Failed to find/create user for mobile: ${mobile}`, {
        error: userError.message,
        stack: userError.stack,
      });
      res.status(500).json({
        success: false,
        message: 'Failed to process login. Please try again.',
        error: 'User creation failed',
      });
      return;
    }

    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save();
      logger.info(`[Verify OTP] Last login updated for mobile: ${mobile}`);
    } catch (updateError: any) {
      logger.warn(`[Verify OTP] Failed to update last login for mobile: ${mobile}`, {
        error: updateError.message,
      });
      // Continue even if update fails
    }

    // Generate token
    let token: string;
    try {
      token = user.getSignedJwtToken();
      logger.info(`[Verify OTP] Token generated for mobile: ${mobile}`);
    } catch (tokenError: any) {
      logger.error(`[Verify OTP] Failed to generate token for mobile: ${mobile}`, {
        error: tokenError.message,
        stack: tokenError.stack,
      });
      res.status(500).json({
        success: false,
        message: 'Failed to generate authentication token. Please try again.',
        error: 'Token generation failed',
      });
      return;
    }

    const duration = Date.now() - startTime;
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
          name: user.name,
          role: user.role,
        },
      },
    });
    logger.info(`[Verify OTP] Request completed successfully in ${duration}ms for mobile: ${mobile}`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`[Verify OTP] Unexpected error for mobile: ${mobile || 'N/A'}`, {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    // Ensure response is always sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while verifying OTP. Please try again.',
        error: error.message || 'Internal server error',
      });
    }
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // In a JWT-based system, logout is handled client-side by removing the token
    // But we can track it here if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

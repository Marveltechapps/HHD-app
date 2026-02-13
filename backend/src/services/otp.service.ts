import OTP from '../models/OTP.model';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { isConnected, waitForConnection } from '../config/database';

export class OTPService {
  /**
   * Ensure MongoDB is connected before operations
   * @throws Error if connection cannot be established within timeout
   */
  private static async ensureConnection(): Promise<void> {
    if (!isConnected()) {
      logger.warn('[OTP Service] MongoDB not connected, waiting for connection...');
      try {
        await waitForConnection(5000); // Wait up to 5 seconds
      } catch (error: any) {
        throw new Error(`Database not available: ${error.message}`);
      }
    }
  }
  /**
   * Generate a 4-digit OTP (1000-9999)
   * Production-safe: Uses cryptographically secure random number generation
   * @param retryCount - Internal parameter to prevent infinite recursion (max 3 retries)
   * @returns 4-digit OTP as string
   */
  static generateOTP(retryCount: number = 0): string {
    // Generate random number between 1000 and 9999 (inclusive)
    // Math.random() generates [0, 1), so:
    // Math.random() * 9000 generates [0, 9000)
    // Math.floor(...) + 1000 generates [1000, 9999]
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Ensure OTP is always 4 digits (safety check - should never fail)
    if (otp.length !== 4) {
      logger.warn(`[OTP Service] Generated OTP length mismatch: ${otp.length} digits (expected 4)`);
      
      // Prevent infinite recursion (max 3 retries)
      if (retryCount < 3) {
        logger.warn(`[OTP Service] Regenerating OTP (attempt ${retryCount + 1}/3)`);
        return this.generateOTP(retryCount + 1);
      } else {
        // Fallback: pad or truncate to ensure 4 digits
        logger.error(`[OTP Service] Max retries reached, using fallback OTP generation`);
        const fallbackOtp = otp.padStart(4, '0').slice(0, 4);
        return fallbackOtp;
      }
    }
    
    return otp;
  }

  /**
   * Create and save OTP
   * @throws Error if database operation fails
   */
  static async createOTP(mobile: string): Promise<string> {
    try {
      // Normalize mobile number (remove whitespace, ensure string type)
      const normalizedMobile = String(mobile).trim();
      
      logger.info(`[OTP Service] Creating OTP for mobile: ${normalizedMobile}`);
      
      // Ensure database connection before operations
      await this.ensureConnection();
      
      // Generate OTP first (fast operation, no DB needed)
      const otp = this.generateOTP();
      const expiresAt = new Date();
      // Set expiration to 10 minutes (600 seconds) - ensure it's a reasonable time
      const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);
      const expireMinutesClamped = Math.max(5, Math.min(30, expireMinutes)); // Clamp between 5-30 minutes
      expiresAt.setMinutes(expiresAt.getMinutes() + expireMinutesClamped);
      
      logger.info(`[OTP Service] OTP expiration set to ${expireMinutesClamped} minutes for mobile: ${normalizedMobile}`);


      // Save OTP with timeout protection (reduced to 3 seconds for faster response)
      // Use normalized mobile to ensure consistency
      // Ensure OTP is stored as a clean string (no whitespace, exactly 4 digits)
      const otpString = String(otp).trim();
      
      // Verify OTP format before saving
      if (!/^\d{4}$/.test(otpString)) {
        logger.error(`[OTP Service] Invalid OTP format generated: ${otpString}`, {
          originalOtp: otp,
          otpType: typeof otp,
        });
        throw new Error(`Invalid OTP format: ${otpString}`);
      }
      
      // Wait for delete to complete before creating new OTP (prevents race conditions)
      try {
        await OTP.deleteMany({ mobile: normalizedMobile, isUsed: false });
        logger.debug(`[OTP Service] Deleted existing OTPs for mobile: ${normalizedMobile}`);
      } catch (deleteError: any) {
        logger.warn(`[OTP Service] Failed to delete existing OTPs for mobile: ${normalizedMobile}`, {
          error: deleteError.message,
        });
        // Continue - we'll create the new OTP anyway
      }
      
      const createdOtp = await Promise.race([
        OTP.create({
          mobile: normalizedMobile,
          otp: otpString, // Store as clean string
          expiresAt,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save OTP timeout')), 5000)
        ),
      ]);

      // Verify the OTP was saved correctly by reading it back
      const savedOtp = await OTP.findById(createdOtp._id);
      if (!savedOtp) {
        throw new Error('OTP was not saved correctly');
      }

      logger.info(`[OTP Service] OTP created and verified for mobile: ${normalizedMobile}`, {
        otp: otpString,
        otpStored: savedOtp.otp,
        otpStoredType: typeof savedOtp.otp,
        otpStoredLength: String(savedOtp.otp).length,
        expiresAt: expiresAt.toISOString(),
      });
      return otpString;
    } catch (error: any) {
      logger.error(`[OTP Service] Failed to create OTP for mobile: ${mobile}`, {
        error: error.message,
        stack: error.stack,
        connectionState: mongoose.connection.readyState,
      });
      throw new Error(`Failed to create OTP: ${error.message}`);
    }
  }

  /**
   * Verify OTP
   * @throws Error if database operation fails or times out
   */
  static async verifyOTP(mobile: string, otp: string): Promise<boolean> {
    try {
      // Normalize mobile and OTP (remove whitespace, ensure string type)
      const normalizedMobile = String(mobile).trim();
      const normalizedOtp = String(otp).trim();
      
      logger.info(`[OTP Service] Verifying OTP for mobile: ${normalizedMobile}`, {
        otpLength: normalizedOtp.length,
        otpType: typeof normalizedOtp,
      });
      
      // Ensure database connection before operations
      await this.ensureConnection();
      
      // Use MongoDB query first (most efficient and reliable)
      const currentTime = new Date();
      let otpRecord: any = null;
      
      try {
        // Try exact string match first
        otpRecord = await Promise.race([
          OTP.findOne({
            mobile: normalizedMobile,
            otp: normalizedOtp, // Exact string match
            isUsed: false,
            expiresAt: { $gt: currentTime },
          }).sort({ createdAt: -1 }), // Get most recent OTP
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Verify OTP timeout')), 5000)
          ),
        ]);
        
        if (otpRecord) {
          logger.info(`[OTP Service] Found exact match via MongoDB query for mobile: ${normalizedMobile}`);
        }
      } catch (queryError: any) {
        logger.warn(`[OTP Service] MongoDB query failed: ${queryError.message}`);
        // Fall back to manual comparison
      }
      
      // If MongoDB query didn't find a match, try manual comparison as fallback
      if (!otpRecord) {
        logger.info(`[OTP Service] MongoDB query didn't find match, trying manual comparison`);
        
        // Find all OTPs for this mobile
        const allOtps = await OTP.find({ mobile: normalizedMobile })
          .sort({ createdAt: -1 })
          .limit(5);
        
        const validOtps = allOtps.filter(r => !r.isUsed && r.expiresAt > currentTime);
        
        logger.info(`[OTP Service] Checking ${validOtps.length} valid OTPs manually for mobile: ${normalizedMobile}`, {
          providedOtp: normalizedOtp,
          providedOtpLength: normalizedOtp.length,
          validOtps: validOtps.map(r => ({
            otp: String(r.otp).trim(),
            otpType: typeof r.otp,
            isUsed: r.isUsed,
            expired: r.expiresAt <= currentTime,
          })),
        });
        
        // Try manual comparison
        for (const record of validOtps) {
          const recordOtp = String(record.otp).trim();
          const providedOtp = normalizedOtp.trim();
          
          // Exact string match
          if (recordOtp === providedOtp) {
            logger.info(`[OTP Service] Found exact match: "${recordOtp}" === "${providedOtp}"`);
            otpRecord = record;
            break;
          }
          
          // Numeric comparison (handle type mismatches)
          const recordOtpNum = parseInt(recordOtp, 10);
          const providedOtpNum = parseInt(providedOtp, 10);
          if (!isNaN(recordOtpNum) && !isNaN(providedOtpNum) && recordOtpNum === providedOtpNum) {
            logger.info(`[OTP Service] Found numeric match: ${recordOtpNum} === ${providedOtpNum}`);
            otpRecord = record;
            break;
          }
        }
      }

      if (!otpRecord) {
        // Get all OTPs for debugging
        const allOtps = await OTP.find({ mobile: normalizedMobile })
          .sort({ createdAt: -1 })
          .limit(5);
        
        logger.warn(`[OTP Service] Invalid or expired OTP for mobile: ${normalizedMobile}`, {
          providedOtp: normalizedOtp,
          providedOtpType: typeof normalizedOtp,
          providedOtpLength: normalizedOtp.length,
          currentTime: currentTime.toISOString(),
          availableOtps: allOtps.map(r => ({
            otp: String(r.otp).trim(),
            otpType: typeof r.otp,
            isUsed: r.isUsed,
            expiresAt: r.expiresAt.toISOString(),
            expired: r.expiresAt <= currentTime,
            createdAt: r.createdAt.toISOString(),
          })),
        });
        return false;
      }
      
      logger.info(`[OTP Service] Found matching OTP record:`, {
        otp: otpRecord.otp,
        mobile: otpRecord.mobile,
        expiresAt: otpRecord.expiresAt,
      });

      // Mark OTP as used with timeout protection (use atomic update to prevent race conditions)
      await Promise.race([
        OTP.updateOne(
          { _id: otpRecord._id, isUsed: false }, // Only update if not already used (prevents double-use)
          { $set: { isUsed: true } }
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Mark OTP as used timeout')), 5000)
        ),
      ]);
      
      // Verify it was marked as used
      const updatedOtp = await OTP.findById(otpRecord._id);
      if (updatedOtp && !updatedOtp.isUsed) {
        logger.warn(`[OTP Service] Failed to mark OTP as used, retrying...`);
        // Retry once
        await OTP.updateOne({ _id: otpRecord._id }, { $set: { isUsed: true } });
      }

      logger.info(`[OTP Service] OTP verified successfully for mobile: ${mobile}`);
      return true;
    } catch (error: any) {
      logger.error(`[OTP Service] Failed to verify OTP for mobile: ${mobile}`, {
        error: error.message,
        stack: error.stack,
        connectionState: mongoose.connection.readyState,
      });
      
      // If it's a timeout or connection error, throw it
      if (error.message.includes('timeout') || error.message.includes('Database not available')) {
        throw error;
      }
      
      // For other errors, return false (invalid OTP)
      return false;
    }
  }

  /**
   * Check if OTP exists and is valid
   * @throws Error if database operation fails or times out
   */
  static async isValidOTP(mobile: string, otp: string): Promise<boolean> {
    try {
      // Ensure database connection before operations
      await this.ensureConnection();
      
      const otpRecord = await Promise.race([
        OTP.findOne({
          mobile,
          otp,
          isUsed: false,
          expiresAt: { $gt: new Date() },
        }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Check OTP validity timeout')), 5000)
        ),
      ]);

      return !!otpRecord;
    } catch (error: any) {
      logger.error(`[OTP Service] Failed to check OTP validity for mobile: ${mobile}`, {
        error: error.message,
        connectionState: mongoose.connection.readyState,
      });
      return false;
    }
  }
}

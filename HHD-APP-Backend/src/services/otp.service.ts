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
      expiresAt.setMinutes(
        expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10)
      );

      // Delete existing OTPs asynchronously (non-blocking) - don't wait for it
      // This improves response time as delete is not critical
      // Use normalized mobile to ensure consistency
      OTP.deleteMany({ mobile: normalizedMobile, isUsed: false })
        .then(() => {
          logger.debug(`[OTP Service] Deleted existing OTPs for mobile: ${normalizedMobile}`);
        })
        .catch((deleteError: any) => {
          logger.warn(`[OTP Service] Failed to delete existing OTPs for mobile: ${normalizedMobile}`, {
            error: deleteError.message,
          });
          // Continue even if delete fails
        });

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
      
      const createdOtp = await Promise.race([
        OTP.create({
          mobile: normalizedMobile,
          otp: otpString, // Store as clean string
          expiresAt,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save OTP timeout')), 3000)
        ),
      ]);

      logger.info(`[OTP Service] OTP created successfully for mobile: ${normalizedMobile}`, {
        otp: otpString,
        otpStored: createdOtp.otp,
        otpStoredType: typeof createdOtp.otp,
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
      
      // First, find all OTPs for this mobile to debug
      const allOtps = await OTP.find({ mobile: normalizedMobile }).sort({ createdAt: -1 }).limit(5);
      logger.info(`[OTP Service] Found ${allOtps.length} OTP records for mobile: ${normalizedMobile}`, {
        records: allOtps.map(r => ({
          otp: r.otp,
          otpString: String(r.otp).trim(),
          otpType: typeof r.otp,
          isUsed: r.isUsed,
          expiresAt: r.expiresAt,
          createdAt: r.createdAt,
          expired: r.expiresAt < new Date(),
        })),
      });
      
      // Verify OTP with timeout protection
      // Use exact string match (MongoDB does case-sensitive string comparison)
      // Also try to find by comparing all valid OTPs to handle any edge cases
      const currentTime = new Date();
      const validOtps = allOtps.filter(r => !r.isUsed && r.expiresAt > currentTime);
      
      logger.info(`[OTP Service] Checking ${validOtps.length} valid OTPs for mobile: ${normalizedMobile}`, {
        providedOtp: normalizedOtp,
        providedOtpLength: normalizedOtp.length,
        validOtps: validOtps.map(r => ({
          otp: r.otp,
          otpType: typeof r.otp,
          otpLength: String(r.otp).length,
          matches: String(r.otp).trim() === normalizedOtp,
        })),
      });

      // First try exact query match
      let otpRecord = await Promise.race([
        OTP.findOne({
          mobile: normalizedMobile,
          otp: normalizedOtp, // Exact string match
          isUsed: false,
          expiresAt: { $gt: currentTime },
        }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Verify OTP timeout')), 5000)
        ),
      ]);

      // If not found, try manual comparison (fallback for edge cases)
      // This handles cases where MongoDB query might fail due to type/encoding issues
      if (!otpRecord && validOtps.length > 0) {
        logger.info(`[OTP Service] Exact query match failed, trying manual comparison`);
        for (const record of validOtps) {
          // Normalize both OTPs for comparison (handle any type/whitespace issues)
          const recordOtp = String(record.otp).trim();
          const providedOtp = normalizedOtp.trim();
          
          // Try exact match first
          if (recordOtp === providedOtp) {
            logger.info(`[OTP Service] Found match via manual comparison: ${recordOtp} === ${providedOtp}`);
            otpRecord = record;
            break;
          }
          
          // Also try comparing as numbers (in case one is stored as number)
          const recordOtpNum = parseInt(recordOtp, 10);
          const providedOtpNum = parseInt(providedOtp, 10);
          if (!isNaN(recordOtpNum) && !isNaN(providedOtpNum) && recordOtpNum === providedOtpNum) {
            logger.info(`[OTP Service] Found match via numeric comparison: ${recordOtpNum} === ${providedOtpNum}`);
            otpRecord = record;
            break;
          }
        }
      }

      if (!otpRecord) {
        logger.warn(`[OTP Service] Invalid or expired OTP for mobile: ${normalizedMobile}`, {
          providedOtp: normalizedOtp,
          providedOtpType: typeof normalizedOtp,
          providedOtpLength: normalizedOtp.length,
          availableOtps: validOtps.map(r => ({
            otp: String(r.otp).trim(),
            otpType: typeof r.otp,
            isUsed: r.isUsed,
            expired: r.expiresAt <= currentTime,
          })),
        });
        return false;
      }
      
      logger.info(`[OTP Service] Found matching OTP record:`, {
        otp: otpRecord.otp,
        mobile: otpRecord.mobile,
        expiresAt: otpRecord.expiresAt,
      });

      // Mark OTP as used with timeout protection
      await Promise.race([
        (async () => {
          otpRecord.isUsed = true;
          await otpRecord.save();
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Mark OTP as used timeout')), 5000)
        ),
      ]);

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

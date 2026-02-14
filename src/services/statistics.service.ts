/**
 * Statistics Service
 * Handles calculation of statistics and metrics from orders and scanned items
 */

import { orderService, Order } from './order.service';
import { scannedItemService, ScannedItem } from './scannedItem.service';
import { authService } from './auth.service';

export interface TaskStatistics {
  ordersCompleted: number;
  averagePickTime: string; // Format: "2m 14s"
  accuracy: number; // Percentage
  slaCompliance: number; // Percentage
  todayActivity: {
    itemsPicked: number;
    activeTime: string; // Format: "6h 23m"
    efficiencyRate: number; // Percentage
  };
  completedOrdersList?: Order[]; // List of completed orders
}

class StatisticsService {
  // Cache properties to prevent excessive API calls
  private completedOrdersCache: Order[] | null = null;
  private completedOrdersCacheTime: number = 0;
  private readonly CACHE_DURATION = 10000; // 10 seconds cache

  /**
   * Format seconds to "Xm Ys" format
   */
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Format minutes to "Xh Ym" format
   */
  private formatActiveTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Get today's start and end dates in ISO format
   */
  private getTodayDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    return {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    };
  }

  /**
   * Calculate pick time in seconds from order start and completion times
   */
  private calculatePickTimeInSeconds(order: Order): number | null {
    // Priority 1: Calculate from startedAt and completedAt if both are available
    if (order.startedAt && order.completedAt) {
      try {
        const startTime = new Date(order.startedAt).getTime();
        const completedTime = new Date(order.completedAt).getTime();
        const diffInSeconds = Math.round((completedTime - startTime) / 1000);
        
        if (diffInSeconds > 0) {
          return diffInSeconds;
        }
      } catch (error) {
        console.warn(`[Statistics] Error calculating pick time from dates for order ${order.orderId}:`, error);
      }
    }

    // Priority 2: Use pickTime field if available (in minutes, convert to seconds)
    if (order.pickTime && order.pickTime > 0) {
      return Math.round(order.pickTime * 60);
    }

    // No valid pick time data available
    return null;
  }

  /**
   * Get all completed orders with caching
   * This prevents excessive API calls by caching results for 10 seconds
   * Fetches from Completed Orders table (Tata Base)
   */
  private async getCompletedOrdersCached(): Promise<Order[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.completedOrdersCache && (now - this.completedOrdersCacheTime) < this.CACHE_DURATION) {
      console.log('[Statistics] Using cached completed orders');
      return this.completedOrdersCache;
    }

    // Fetch fresh data from Completed Orders table
    console.log('[Statistics] Fetching fresh completed orders from Completed Orders table');
    const completedOrders = await orderService.getCompletedOrders();
    
    // Update cache
    this.completedOrdersCache = completedOrders;
    this.completedOrdersCacheTime = now;
    
    return completedOrders;
  }

  /**
   * Clear the cache (useful when an order is completed)
   */
  clearCache(): void {
    this.completedOrdersCache = null;
    this.completedOrdersCacheTime = 0;
    console.log('[Statistics] Cache cleared');
  }

  /**
   * Get count of orders completed today
   */
  async getTodayCompletedOrdersCount(): Promise<number> {
    try {
      // Use cached method instead of direct call to prevent excessive API calls
      const completedOrders = await this.getCompletedOrdersCached();
      
      // Get today's date range
      const { startDate, endDate } = this.getTodayDateRange();
      
      // Filter orders completed today
      const todayCompletedOrders = completedOrders.filter((order) => {
        if (!order.completedAt) return false;
        const completedDate = new Date(order.completedAt);
        return completedDate >= new Date(startDate) && completedDate <= new Date(endDate);
      });

      return todayCompletedOrders.length;
    } catch (error) {
      console.error('[Statistics] Error getting today completed orders count:', error);
      return 0;
    }
  }

  /**
   * Get task statistics for the current user
   */
  async getTaskStatistics(): Promise<TaskStatistics> {
    try {
      // Get current user ID to filter data by logged-in user
      let currentUserId: string | undefined;
      try {
        const user = await authService.getMe();
        currentUserId = user.id;
      } catch (error) {
        console.warn('[Statistics] Could not get current user, proceeding without user filter:', error);
      }

      // Use cached method instead of direct call to prevent excessive API calls
      // Backend already filters completed orders by userId automatically
      const completedOrders = await this.getCompletedOrdersCached();
      
      // Get today's date range
      const { startDate, endDate } = this.getTodayDateRange();
      
      // Get today's scanned items filtered by current user
      const todayScannedItems = await scannedItemService.getScannedItems({
        userId: currentUserId,
        startDate,
        endDate,
        limit: 1000, // Get all items for today
      });

      // Filter today's completed orders
      const todayCompletedOrders = completedOrders.filter((order) => {
        if (!order.completedAt) return false;
        const completedDate = new Date(order.completedAt);
        return completedDate >= new Date(startDate) && completedDate <= new Date(endDate);
      });

      // Calculate Orders Completed (only today's orders)
      const ordersCompleted = todayCompletedOrders.length;

      // Calculate Average Pick Time (only from today's orders)
      let totalPickTimeSeconds = 0;
      let validPickTimes = 0;
      
      todayCompletedOrders.forEach((order) => {
        const pickTimeSeconds = this.calculatePickTimeInSeconds(order);
        if (pickTimeSeconds !== null && pickTimeSeconds > 0) {
          totalPickTimeSeconds += pickTimeSeconds;
          validPickTimes++;
        } else {
          console.warn(`[Statistics] Order ${order.orderId} has no valid pick time data:`, {
            startedAt: order.startedAt,
            completedAt: order.completedAt,
            pickTime: order.pickTime,
          });
        }
      });

      const averagePickTimeSeconds = validPickTimes > 0 
        ? Math.round(totalPickTimeSeconds / validPickTimes)
        : 0;
      const averagePickTime = this.formatTime(averagePickTimeSeconds);
      
      console.log(`[Statistics] Average pick time calculation:`, {
        ordersCompleted,
        validPickTimes,
        averagePickTimeSeconds,
        averagePickTime,
      });

      // Calculate Accuracy
      // Accuracy = (Correctly scanned items / Total items in completed orders today) * 100
      let todayTotalItems = 0;
      let todayScannedCount = 0;

      todayCompletedOrders.forEach((order) => {
        todayTotalItems += order.itemCount || 0;
      });

      // Count scanned items for today's completed orders
      todayCompletedOrders.forEach((order) => {
        const orderScannedItems = todayScannedItems.data.filter(
          (item: ScannedItem) => item.orderId === order.orderId
        );
        const scannedQuantity = orderScannedItems.reduce((sum, item) => {
          return sum + (item.metadata?.quantity || 1);
        }, 0);
        todayScannedCount += Math.min(scannedQuantity, order.itemCount || 0);
      });

      const accuracy = todayTotalItems > 0 
        ? Math.round((todayScannedCount / todayTotalItems) * 100)
        : 100; // Default to 100% if no items

      // Calculate SLA Compliance (only from today's orders)
      // SLA Compliance = (Orders completed within target time / Total completed orders today) * 100
      let slaCompliantOrders = 0;
      
      todayCompletedOrders.forEach((order) => {
        if (!order.targetTime || !order.startedAt || !order.completedAt) {
          // If no target time or timing data, consider it compliant
          slaCompliantOrders++;
          return;
        }

        const pickTimeSeconds = this.calculatePickTimeInSeconds(order);
        if (pickTimeSeconds === null) {
          slaCompliantOrders++;
          return;
        }

        // targetTime is in minutes, convert to seconds
        const targetTimeSeconds = order.targetTime * 60;
        
        if (pickTimeSeconds <= targetTimeSeconds) {
          slaCompliantOrders++;
        }
      });

      const slaCompliance = ordersCompleted > 0
        ? Math.round((slaCompliantOrders / ordersCompleted) * 100)
        : 100; // Default to 100% if no orders

      // Calculate Today's Activity
      // Items Picked: Total items scanned today
      const itemsPicked = todayScannedItems.data.reduce((sum, item) => {
        return sum + (item.metadata?.quantity || 1);
      }, 0);

      // Active Time: Sum of pick times for today's completed orders
      let totalActiveTimeMinutes = 0;
      todayCompletedOrders.forEach((order) => {
        const pickTimeSeconds = this.calculatePickTimeInSeconds(order);
        if (pickTimeSeconds !== null) {
          totalActiveTimeMinutes += Math.round(pickTimeSeconds / 60);
        }
      });
      const activeTime = this.formatActiveTime(totalActiveTimeMinutes);

      // Efficiency Rate: Based on average pick time vs target time
      // Efficiency = (Average target time / Average actual time) * 100, capped at 100%
      let totalTargetTimeMinutes = 0;
      let ordersWithTargetTime = 0;
      
      todayCompletedOrders.forEach((order) => {
        if (order.targetTime) {
          totalTargetTimeMinutes += order.targetTime;
          ordersWithTargetTime++;
        }
      });

      let efficiencyRate = 100; // Default
      if (ordersWithTargetTime > 0 && totalActiveTimeMinutes > 0 && todayCompletedOrders.length > 0) {
        const avgTargetTime = totalTargetTimeMinutes / ordersWithTargetTime;
        const avgActualTime = totalActiveTimeMinutes / todayCompletedOrders.length;
        if (avgActualTime > 0) {
          efficiencyRate = Math.min(100, Math.round((avgTargetTime / avgActualTime) * 100));
        }
      }

      return {
        ordersCompleted,
        averagePickTime: averagePickTime || '0s',
        accuracy: Math.min(100, Math.max(0, accuracy)),
        slaCompliance: Math.min(100, Math.max(0, slaCompliance)),
        todayActivity: {
          itemsPicked,
          activeTime: activeTime || '0m',
          efficiencyRate: Math.min(100, Math.max(0, efficiencyRate)),
        },
        completedOrdersList: todayCompletedOrders, // Include list of completed orders
      };
    } catch (error) {
      console.error('[Statistics] Error calculating statistics:', error);
      // Return default values on error
      return {
        ordersCompleted: 0,
        averagePickTime: '0s',
        accuracy: 0,
        slaCompliance: 0,
        todayActivity: {
          itemsPicked: 0,
          activeTime: '0m',
          efficiencyRate: 0,
        },
        completedOrdersList: [],
      };
    }
  }
}

export const statisticsService = new StatisticsService();

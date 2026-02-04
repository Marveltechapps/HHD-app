import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import BackIcon from './icons/BackIcon';
import NotFoundIcon from './icons/NotFoundIcon';
import ScanItemIcon from './icons/ScanItemIcon';
import ZoneIcon from './icons/ZoneIcon';
import ScannerIcon from './icons/ScannerIcon';
import CameraViewfinderIcon from './icons/CameraViewfinderIcon';
import PickingOptionsModal from './PickingOptionsModal';
import ReportIssueModal from './ReportIssueModal';
import PausePickingModal from './PausePickingModal';
import OrderDetailsModal from './OrderDetailsModal';
import CancelOrderModal from './CancelOrderModal';
import { scannedItemService } from '../services/scannedItem.service';
import { itemService, Item as ApiItem } from '../services/item.service';
import { orderService } from '../services/order.service';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface OrderItem {
  id: string;
  name: string;
  crateId: string;
  quantity: number; // Total quantity needed for this item
  grammage: string;
  mrp: string;
  expiryDate: string;
  bin: string;
}

interface ActivePickSessionScreenProps {
  orderId?: string;
  itemCount?: number;
  zone?: string;
  onBack?: () => void;
  onNotFound?: () => void;
  onScanItem?: () => void;
  onOrderComplete?: (completedItems: OrderItem[]) => void;
}

// Helper function to map API items to OrderItem format
// Handles both Item model items and items from assignorders (which may have more fields)
const mapApiItemsToOrderItems = (apiItems: any[]): OrderItem[] => {
  return apiItems.map((item, index) => {
    // Generate crateId from itemCode, itemId, or use a default format
    const crateId = (item as any).crateId || item.itemId || item.itemCode || `CRATE-${item._id || index}`;
    
    // Use location as bin, or generate from itemCode
    const bin = (item as any).bin || item.location || `BIN-${item.itemCode || index}`;
    
    // Check if item has grammage, mrp, expiryDate from assignorders or extended fields
    const grammage = (item as any).grammage || getDefaultGrammage(item.name, item.category);
    const mrp = (item as any).mrp || getDefaultMRP();
    const expiryDate = (item as any).expiryDate || getDefaultExpiryDate();
    
    return {
      id: item._id || item.itemId || String(index),
      name: item.name,
      crateId,
      quantity: item.quantity || 1,
      grammage,
      mrp,
      expiryDate,
      bin,
    };
  });
};

// Default values for missing fields - these should ideally come from the backend
// For now, we'll use sensible defaults based on item name/category
const getDefaultGrammage = (name: string, category?: string): string => {
  // Simple heuristic based on category and name
  if (category === 'Fresh') {
    if (name.toLowerCase().includes('onion') || name.toLowerCase().includes('potato')) {
      return '1 kg';
    }
    return '500g';
  }
  return '1 kg';
};

const getDefaultMRP = (): string => {
  return '₹0';
};

const getDefaultExpiryDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days from now
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ActivePickSessionScreen({
  orderId = 'ORD-45621',
  itemCount = 18,
  zone = 'Zone B',
  onBack,
  onNotFound,
  onScanItem,
  onOrderComplete,
}: ActivePickSessionScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');
  const [scannedCount, setScannedCount] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [totalScannedItems, setTotalScannedItems] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [showPickingOptionsModal, setShowPickingOptionsModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [showPausePickingModal, setShowPausePickingModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  // Fetch order items from API
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        // Try to get order with items first (might have more complete data)
        let apiItems: ApiItem[] = [];
        
        try {
          const orderResponse = await orderService.getOrder(orderId);
          if (orderResponse.items && orderResponse.items.length > 0) {
            apiItems = orderResponse.items;
          }
        } catch (error) {
          console.log('Could not fetch order with items, trying items endpoint...');
        }
        
        // If no items from order endpoint, try items endpoint
        if (apiItems.length === 0) {
          apiItems = await itemService.getItemsByOrder(orderId);
        }
        
        // Map API items to OrderItem format
        const mappedItems = mapApiItemsToOrderItems(apiItems);
        setOrderItems(mappedItems);
      } catch (error) {
        console.error('Failed to fetch order items:', error);
        // Fallback to empty array - component will show loading state
        setOrderItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && orderId !== 'ORD-45621') {
      fetchOrderItems();
    } else {
      // For default/test order, use empty array (or could use static data as fallback)
      setOrderItems([]);
      setLoading(false);
    }
  }, [orderId]);

  const currentOrderItem = orderItems[currentItemIndex];
  const totalQuantity = currentOrderItem?.quantity || 1;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      setCurrentTime(`${displayHours}:${displayMinutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Calculate remaining unique items in the order
  // currentItemIndex is 0-based, so remaining = total - currentIndex
  // When on item 1 (index 0): remaining = total - 0 = total items
  // When on item 2 (index 1): remaining = total - 1 = total - 1 items
  const remainingItems = orderItems.length - currentItemIndex;
  
  // Calculate current item position in the order (1-based)
  const currentItemPosition = currentItemIndex + 1;

  // Calculate bag size based on total scanned items (same logic as BagScanScreen)
  const getBagSize = () => {
    const totalScanned = totalScannedItems + scannedCount; // Include current item's scanned count
    if (totalScanned <= 10) {
      return '15L Small';
    } else if (totalScanned <= 20) {
      return '25L Medium';
    } else if (totalScanned <= 35) {
      return '35L Large';
    } else {
      return '50L X-Large';
    }
  };

  const bagSize = getBagSize();
  // Extract just the size label (e.g., "XL Bag" from "50L X-Large")
  const bagSizeLabel = bagSize.includes('Small') ? 'S Bag' :
                       bagSize.includes('Medium') ? 'M Bag' :
                       bagSize.includes('Large') && !bagSize.includes('X-Large') ? 'L Bag' :
                       'XL Bag';

  // Current item data
  const currentItem = currentOrderItem ? {
    crateId: currentOrderItem.crateId,
    sku: `${currentItemPosition} of ${orderItems.length}`, // Current item position in order
    name: currentOrderItem.name,
    imageUrl: `https://via.placeholder.com/84x84?text=${encodeURIComponent(currentOrderItem.name)}`,
    grammage: currentOrderItem.grammage,
    mrp: currentOrderItem.mrp,
    expiryDate: currentOrderItem.expiryDate,
    quantity: `${scannedCount} of ${totalQuantity}`, // Scanned count of current item type
    bin: currentOrderItem.bin,
    bagSize: bagSizeLabel,
  } : null;

  // Handle scan item - enable scanner
  const handleScanItem = () => {
    if (!currentOrderItem) return;
    
    // Can still scan more items of current type
    if (scannedCount < totalQuantity) {
      // Enable scanner when button is clicked
      setIsScanning(true);
    }
  };

  // Handle barcode scanned
  const handleBarcodeScanned = async ({ data, type }: BarcodeScanningResult) => {
    if (isScanning && (type === 'qr' || type === 'ean13' || type === 'ean8' || type === 'code128')) {
      console.log('Item scanned:', data, 'Type:', type);
      
      // Disable scanner immediately to prevent multiple scans
      setIsScanning(false);
      
      try {
        // Save scanned item to database
        // Each scan represents 1 unit, so quantity is always 1 per scan
        await scannedItemService.createScannedItem({
          barcodeData: data,
          barcodeType: type,
          orderId: orderId,
          deviceId: 'HHD-0234', // TODO: Get from device or user settings
          metadata: {
            itemName: currentOrderItem?.name,
            quantity: 1, // Each scan is 1 unit
            grammage: currentOrderItem?.grammage,
            mrp: currentOrderItem?.mrp,
            expiryDate: currentOrderItem?.expiryDate,
            crateId: currentOrderItem?.crateId,
            location: currentOrderItem?.bin,
            zone: zone,
          },
        });
        
        console.log('✅ Scanned item saved to database');
      } catch (error: any) {
        console.error('❌ Failed to save scanned item:', error);
        // Show error but don't block the flow
        Alert.alert(
          'Save Warning',
          'Item scanned but failed to save to database. Please check your connection.',
          [{ text: 'OK' }]
        );
      }
      
      // Increment scanned count
      const newScannedCount = scannedCount + 1;
      setScannedCount(newScannedCount);
      
      // If all items of current type are scanned, move to next item
      if (newScannedCount >= totalQuantity) {
        // Add the required quantity to total scanned items
        // This ensures we only count the required quantity, not any extra scans
        const newTotalScanned = totalScannedItems + totalQuantity;
        setTotalScannedItems(newTotalScanned);
        
        // Check if this was the last item
        const isLastItem = currentItemIndex >= orderItems.length - 1;
        
        if (isLastItem) {
          // All items completed - navigate to completion screen
          onOrderComplete?.(orderItems);
        } else {
          // Move to next item in queue
          setCurrentItemIndex((prev) => prev + 1);
          setScannedCount(0); // Reset for next item
        }
      }
      
      onScanItem?.();
    }
  };

  // Show loading if fetching data or no current item
  if (loading || !currentItem || !currentOrderItem) {
    return (
      <View style={styles.container}>
        <Header
          deviceId="HHD-0234"
          batteryLevel={batteryLevel}
          showTime={true}
          time={currentTime || '6:39 PM'}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading ? 'Loading order items...' : 'No items found'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '6:39 PM'}
      />

      {/* Fixed Order Info Card */}
      <View style={styles.fixedOrderCard}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoHeader}>
            <TouchableOpacity
              style={styles.backButtonInCard}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <BackIcon width={24} height={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.orderInfoLeft}>
              <View style={styles.orderIdRow}>
                <Text style={styles.orderId}>{orderId}</Text>
                <Text style={styles.itemCount}>({remainingItems} items)</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowPickingOptionsModal(true)}
              activeOpacity={0.8}
            >
              <ZoneIcon width={31.5} height={35} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Crate ID and SKU Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Crate ID</Text>
              <Text style={styles.infoValue}>{currentItem.crateId}</Text>
            </View>
            <View style={styles.infoColumnRight}>
              <Text style={styles.infoLabel}>SKU</Text>
              <Text style={styles.infoValue}>{currentItem.sku}</Text>
            </View>
          </View>
        </View>

        {/* Item Card */}
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemImageContainer}>
              <View style={styles.itemImagePlaceholder}>
                <Text style={styles.itemImageText}>📦</Text>
              </View>
            </View>
            <Text style={styles.itemName}>{currentItem.name}</Text>
          </View>

          <View style={styles.itemDetails}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailValue}>{currentItem.grammage}</Text>
              <Text style={styles.detailLabel}>Grammage</Text>
            </View>
            <View style={[styles.detailColumn, styles.detailColumnBorder]}>
              <Text style={styles.detailValue}>{currentItem.mrp}</Text>
              <Text style={styles.detailLabel}>MRP</Text>
            </View>
            <View style={[styles.detailColumn, styles.detailColumnBorder]}>
              <Text style={styles.detailValue}>{currentItem.expiryDate}</Text>
              <Text style={styles.detailLabel}>Expiry Date</Text>
            </View>
          </View>
        </View>

        {/* Quantity and Bin Card */}
        <View style={styles.quantityCard}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Qty</Text>
            <Text style={styles.quantityValue}>{currentItem.quantity}</Text>
          </View>
          <View style={styles.binRow}>
            <Text style={styles.binLabel}>Bin</Text>
            <View style={styles.binInfo}>
              <Text style={styles.binValue}>{currentItem.bin}</Text>
              <Text style={styles.bagSizeText}>{currentItem.bagSize}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.fixedButtonContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.notFoundButton}
          onPress={() => {
            setShowReportIssueModal(true);
            onNotFound?.();
          }}
          activeOpacity={0.8}
        >
          <NotFoundIcon width={14} height={14} color={colors.priority.high} />
          <Text style={styles.notFoundButtonText}>NOT FOUND</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanItemButton}
          onPress={handleScanItem}
          activeOpacity={0.8}
          disabled={false}
        >
          <ScanItemIcon width={14} height={14} color={colors.white} />
          <Text style={styles.scanItemButtonText}>
            SCAN ITEM ({scannedCount}/{totalQuantity})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Picking Options Modal */}
      <PickingOptionsModal
        visible={showPickingOptionsModal}
        onClose={() => setShowPickingOptionsModal(false)}
        onReportIssue={() => {
          setShowPickingOptionsModal(false);
          setShowReportIssueModal(true);
        }}
        onPausePicking={() => {
          setShowPickingOptionsModal(false);
          setShowPausePickingModal(true);
        }}
        onOrderDetails={() => {
          setShowPickingOptionsModal(false);
          setShowOrderDetailsModal(true);
        }}
        onCancelOrder={() => {
          setShowPickingOptionsModal(false);
          setShowCancelOrderModal(true);
        }}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        visible={showReportIssueModal}
        onClose={() => setShowReportIssueModal(false)}
        onSubmit={(issueType) => {
          console.log('Issue reported:', issueType);
          // Handle issue submission
        }}
      />

      {/* Pause Picking Modal */}
      <PausePickingModal
        visible={showPausePickingModal}
        onClose={() => setShowPausePickingModal(false)}
        onConfirm={() => {
          console.log('Picking paused');
          // Handle pause picking action
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        visible={showOrderDetailsModal}
        orderId={orderId}
        itemCount={itemCount}
        zone={zone}
        onClose={() => setShowOrderDetailsModal(false)}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        visible={showCancelOrderModal}
        onClose={() => setShowCancelOrderModal(false)}
        onConfirm={() => {
          console.log('Order cancelled');
          // Handle cancel order action
          onBack?.(); // Navigate back after cancellation
        }}
      />

      {/* Scanner Modal */}
      <Modal
        visible={isScanning}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsScanning(false)}
      >
        <View style={styles.scannerModalContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity
              style={styles.scannerBackButton}
              onPress={() => setIsScanning(false)}
              activeOpacity={0.8}
            >
              <BackIcon width={24} height={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>SCAN ITEM</Text>
            <View style={styles.scannerBackButton} />
          </View>
          
          <View style={styles.scannerArea}>
            {isScanning ? (
              <>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
                  }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
                <View style={styles.scanningOverlay}>
                  <View style={styles.scannerIconContainer}>
                    <ScannerIcon width={84} height={84} />
                  </View>
                  <Text style={styles.scanningText}>SCANNING ITEM...</Text>
                  <View style={styles.scanningProgressBar} />
                </View>
              </>
            ) : (
              <>
                <CameraViewfinderIcon width={112} height={112} color={colors.text.secondary} />
                <Text style={styles.cameraInstruction}>
                  Point camera at item barcode
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedOrderCard: {
    position: 'absolute',
    top: layout.statusBarHeight,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 5,
    backgroundColor: colors.background,
  },
  orderInfoCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    padding: spacing.m,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  backButtonInCard: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  orderInfoLeft: {
    flex: 1,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  orderId: {
    ...typography.b1,
    color: colors.primary,
  },
  itemCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: layout.statusBarHeight + spacing.l + spacing.m,
    paddingBottom: layout.buttonHeight + spacing.xl * 2 + spacing.m, // ~180px
    paddingHorizontal: spacing.l,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.grayMedium,
    padding: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xs,
    marginBottom: spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoColumn: {
    gap: spacing.xs,
  },
  infoColumnRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Consolas',
    letterSpacing: -0.4,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.grayMedium,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs,
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.l + spacing.xs,
    ...shadows.card,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemImageContainer: {
    width: 84,
    height: 84,
  },
  itemImagePlaceholder: {
    width: 84,
    height: 84,
    backgroundColor: colors.grayLight,
    borderRadius: radius.medium + spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageText: {
    fontSize: 42,
  },
  itemName: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemDetails: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.grayMedium,
    paddingTop: spacing.m,
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailColumnBorder: {
    borderLeftWidth: 2,
    borderLeftColor: colors.grayMedium,
  },
  detailValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  detailLabel: {
    ...typography.c4,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  quantityCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.grayMedium,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs,
    paddingBottom: spacing.xs,
    marginBottom: spacing.l + spacing.xs,
    gap: spacing.l + spacing.xs,
    ...shadows.card,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  quantityValue: {
    ...typography.headingSection,
    fontWeight: '700',
    color: colors.text.primary,
  },
  binRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  binLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  binInfo: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  binValue: {
    ...typography.headingSection,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Consolas',
    letterSpacing: 0.5,
  },
  bagSizeText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l + spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    zIndex: 10,
  },
  notFoundButton: {
    backgroundColor: colorWithOpacity.error(0.1),
    borderWidth: 2,
    borderColor: colorWithOpacity.error(0.3),
    borderRadius: radius.medium,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  notFoundButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.priority.high,
  },
  scanItemButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    ...shadows.large,
  },
  scanItemButtonDisabled: {
    opacity: 0.5,
  },
  scanItemButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.b1,
    color: colors.text.secondary,
  },
  scannerModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: layout.statusBarHeight,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  scannerBackButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scannerArea: {
    flex: 1,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    pointerEvents: 'none',
  },
  scannerIconContainer: {
    opacity: 0.5,
  },
  scanningText: {
    ...typography.bodyLarge,
    fontFamily: 'Consolas',
    fontWeight: '700',
    color: colors.success,
    marginTop: spacing.xl,
  },
  scanningProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: colors.success,
  },
  cameraInstruction: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },
});

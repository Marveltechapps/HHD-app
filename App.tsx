import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import SplashScreen from './src/components/SplashScreen';
import DeviceReadyScreen from './src/components/DeviceReadyScreen';
import TermsAndConditionsScreen from './src/components/TermsAndConditionsScreen';
import LoginScreen from './src/components/LoginScreen';
import OTPScreen from './src/components/OTPScreen';
import HomeScreen from './src/components/HomeScreen';
import OrderReceivedScreen from './src/components/OrderReceivedScreen';
import BagScanScreen from './src/components/BagScanScreen';
import OrderOverviewScreen from './src/components/OrderOverviewScreen';
import ActivePickSessionScreen from './src/components/ActivePickSessionScreen';
import OrderCompletionScreen from './src/components/OrderCompletionScreen';
import PhotoInsideBagScreen from './src/components/PhotoInsideBagScreen';
import ScanRackQRScreen from './src/components/ScanRackQRScreen';
import OrderCompleteScreen from './src/components/OrderCompleteScreen';
import TasksScreen from './src/components/TasksScreen';
import ProfileScreen from './src/components/ProfileScreen';
import { Order } from './src/services/order.service';

type Screen = 'splash' | 'deviceReady' | 'terms' | 'login' | 'otp' | 'home' | 'orderReceived' | 'bagScan' | 'orderOverview' | 'activePickSession' | 'orderCompletion' | 'photoInsideBag' | 'scanRackQR' | 'orderComplete' | 'tasks' | 'profile';

function AppContent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    // Show splash screen for 3 seconds, then navigate based on auth state
    const timer = setTimeout(() => {
      if (isLoading) {
        // Still checking auth, wait
        return;
      }
      if (isAuthenticated) {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('deviceReady');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  // Navigate to home when authentication state changes to authenticated (after OTP verification)
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentScreen === 'otp') {
      console.log('[App] User authenticated, navigating to home');
      setCurrentScreen('home');
    }
  }, [isAuthenticated, isLoading, currentScreen]);

  const handleDeviceReadyComplete = () => {
    setCurrentScreen('terms');
  };

  const handleTermsAccept = () => {
    setCurrentScreen('login');
  };

  const handleSendOTP = (mobile: string) => {
    setMobileNumber(mobile);
    setCurrentScreen('otp');
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      // Login is already called in OTPScreen, just navigate on success
      // The AuthContext will update isAuthenticated, which triggers navigation
      console.log('[App] OTP verified, navigating to home screen');
      setCurrentScreen('home');
    } catch (error: any) {
      console.error('[App] OTP verification failed:', error);
      // Error handling is done in OTPScreen component
      // Don't navigate if verification failed
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pickStartTime, setPickStartTime] = useState<Date | null>(null);
  const [rackLocation, setRackLocation] = useState<string | null>(null);

  const handleOrderReceived = () => {
    setCurrentScreen('orderReceived');
    setSelectedOrder(null); // Reset when going back to order received screen
    setPickStartTime(null);
    setRackLocation(null);
  };

  const handleStartPicking = (order?: Order) => {
    if (order) {
      setSelectedOrder(order);
    }
    setCurrentScreen('bagScan');
  };

  const handleBackFromBagScan = () => {
    setCurrentScreen('orderReceived');
  };

  const handleScanComplete = () => {
    setCurrentScreen('orderOverview');
  };

  const handleBackFromOrderOverview = () => {
    setCurrentScreen('bagScan');
  };

  const handleStartPickingFromOverview = () => {
    // Track when picking starts
    setPickStartTime(new Date());
    setCurrentScreen('activePickSession');
  };

  const handleBackFromActivePickSession = () => {
    setCurrentScreen('orderOverview');
    // Reset pick start time if going back
    setPickStartTime(null);
  };

  const [completedItems, setCompletedItems] = useState<any[]>([]);

  const handleOrderComplete = (items: any[]) => {
    setCompletedItems(items);
    setCurrentScreen('orderCompletion');
  };

  const handleCompletionBack = () => {
    setCurrentScreen('photoInsideBag');
  };

  const handlePhotoComplete = () => {
    setCurrentScreen('scanRackQR');
  };

  const handleBackFromPhoto = () => {
    setCurrentScreen('orderCompletion');
  };

  const handleRackScanComplete = (scannedRackLocation?: string) => {
    // Store the rack location
    if (scannedRackLocation) {
      setRackLocation(scannedRackLocation);
    }
    setCurrentScreen('orderComplete');
  };

  const handleReadyNext = () => {
    setCurrentScreen('home');
  };

  const handleNavigate = (screen: 'home' | 'tasks' | 'profile') => {
    if (screen === 'home') {
      setCurrentScreen('home');
    } else if (screen === 'tasks') {
      setCurrentScreen('tasks');
    } else if (screen === 'profile') {
      setCurrentScreen('profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentScreen('login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login
    setCurrentScreen('login');
    }
  };

  const handleBackFromRackScan = () => {
    setCurrentScreen('photoInsideBag');
  };

  const handleNotFound = () => {
    // Handle not found action
  };

  const handleScanItem = () => {
    // Handle scan item action
  };

  const handleChangeNumber = () => {
    setCurrentScreen('login');
  };

  const handleResendOTP = () => {
    // Handle resend OTP (to be implemented)
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'deviceReady':
        return <DeviceReadyScreen onComplete={handleDeviceReadyComplete} />;
      case 'terms':
        return <TermsAndConditionsScreen onAccept={handleTermsAccept} />;
      case 'login':
        return <LoginScreen onSendOTP={handleSendOTP} />;
      case 'otp':
        return (
          <OTPScreen
            mobileNumber={mobileNumber}
            onVerify={handleVerifyOTP}
            onChangeNumber={handleChangeNumber}
            onResend={handleResendOTP}
          />
        );
      case 'home':
        return (
          <HomeScreen
            onOrderReceived={handleOrderReceived}
            onNavigate={handleNavigate}
          />
        );
      case 'tasks':
        return <TasksScreen onNavigate={handleNavigate} />;
      case 'profile':
        return (
          <ProfileScreen onNavigate={handleNavigate} onSignOut={handleSignOut} />
        );
      case 'orderReceived':
        return (
          <OrderReceivedScreen
            onStartPicking={handleStartPicking}
            onNavigate={handleNavigate}
          />
        );
      case 'bagScan':
        return (
          <BagScanScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            itemCount={selectedOrder?.itemCount || 18}
            zone={selectedOrder?.zone || "Zone B"}
            onBack={handleBackFromBagScan}
            onStartScan={handleScanComplete}
            onToggleLight={() => {
              // Handle light toggle
            }}
            onManualEntry={() => {
              // Handle manual entry
            }}
          />
        );
      case 'orderOverview':
        return (
          <OrderOverviewScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            itemCount={selectedOrder?.itemCount || 18}
            zone={selectedOrder?.zone || "Zone B"}
            order={selectedOrder || undefined}
            onBack={handleBackFromOrderOverview}
            onStartPicking={handleStartPickingFromOverview}
          />
        );
      case 'activePickSession':
        return (
          <ActivePickSessionScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            itemCount={selectedOrder?.itemCount || 18}
            zone={selectedOrder?.zone || "Zone B"}
            onBack={handleBackFromActivePickSession}
            onNotFound={handleNotFound}
            onScanItem={handleScanItem}
            onOrderComplete={handleOrderComplete}
          />
        );
      case 'orderCompletion':
        return (
          <OrderCompletionScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            itemCount={selectedOrder?.itemCount || 18}
            zone={selectedOrder?.zone || "Zone B"}
            completedItems={completedItems}
            onBack={handleCompletionBack}
            onComplete={handlePhotoComplete}
          />
        );
      case 'photoInsideBag':
        return (
          <PhotoInsideBagScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            itemCount={selectedOrder?.itemCount || 18}
            bagId="BAG-001"
            onBack={handleBackFromPhoto}
            onComplete={handlePhotoComplete}
          />
        );
      case 'scanRackQR':
        return (
          <ScanRackQRScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            bagId="BAG-001"
            rackLocation="Rack D1-Slot 3"
            riderName="Rider Rohan"
            onBack={handleBackFromRackScan}
            onScanComplete={handleRackScanComplete}
          />
        );
      case 'orderComplete':
        // Calculate pick time in seconds
        const calculatedPickTime = pickStartTime
          ? Math.round((new Date().getTime() - pickStartTime.getTime()) / 1000)
          : 52; // Fallback to default if no start time tracked
        
        // Get target time from selected order (convert from minutes to seconds if needed)
        // Based on the model, targetTime is in minutes, but the UI shows seconds
        const targetTimeInSeconds = selectedOrder?.targetTime
          ? selectedOrder.targetTime * 60
          : 55; // Fallback to default
        
        return (
          <OrderCompleteScreen
            orderId={selectedOrder?.orderId || "ORD-45621"}
            rackLocation={rackLocation || "RACK-D1-SLOT3"}
            pickTime={calculatedPickTime}
            targetTime={targetTimeInSeconds}
            onReadyNext={handleReadyNext}
          />
        );
      default:
        return <SplashScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar
        style={
          currentScreen === 'splash' ? 'light' : 'dark'
        }
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

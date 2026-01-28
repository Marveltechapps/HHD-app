import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
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

type Screen = 'splash' | 'deviceReady' | 'terms' | 'login' | 'otp' | 'home' | 'orderReceived' | 'bagScan' | 'orderOverview' | 'activePickSession' | 'orderCompletion' | 'photoInsideBag' | 'scanRackQR' | 'orderComplete' | 'tasks' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    // Show splash screen for 3 seconds, then navigate to device ready screen
    const timer = setTimeout(() => {
      setCurrentScreen('deviceReady');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleVerifyOTP = (otp: string) => {
    // Handle OTP verification (to be implemented)
    console.log('Verifying OTP:', otp);
    // Navigate to homepage after verification
    setCurrentScreen('home');
  };

  const handleOrderReceived = () => {
    setCurrentScreen('orderReceived');
  };

  const handleStartPicking = () => {
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
    setCurrentScreen('activePickSession');
  };

  const handleBackFromActivePickSession = () => {
    setCurrentScreen('orderOverview');
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

  const handleRackScanComplete = () => {
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

  const handleSignOut = () => {
    // Navigate back to login screen
    setCurrentScreen('login');
  };

  const handleBackFromRackScan = () => {
    setCurrentScreen('photoInsideBag');
  };

  const handleNotFound = () => {
    console.log('Item not found...');
    // Handle not found action
  };

  const handleScanItem = () => {
    console.log('Scanning item...');
    // Handle scan item action
  };

  const handleChangeNumber = () => {
    setCurrentScreen('login');
  };

  const handleResendOTP = () => {
    // Handle resend OTP (to be implemented)
    console.log('Resending OTP to:', mobileNumber);
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
            orderId="ORD-45621"
            itemCount={18}
            zone="Zone B"
            onBack={handleBackFromBagScan}
            onStartScan={handleScanComplete}
            onToggleLight={() => {
              // Handle light toggle
              console.log('Toggling light...');
            }}
            onManualEntry={() => {
              // Handle manual entry
              console.log('Manual entry...');
            }}
          />
        );
      case 'orderOverview':
        return (
          <OrderOverviewScreen
            orderId="ORD-45621"
            itemCount={18}
            zone="Zone B"
            onBack={handleBackFromOrderOverview}
            onStartPicking={handleStartPickingFromOverview}
          />
        );
      case 'activePickSession':
        return (
          <ActivePickSessionScreen
            orderId="ORD-45621"
            itemCount={18}
            zone="Zone B"
            onBack={handleBackFromActivePickSession}
            onNotFound={handleNotFound}
            onScanItem={handleScanItem}
            onOrderComplete={handleOrderComplete}
          />
        );
      case 'orderCompletion':
        return (
          <OrderCompletionScreen
            orderId="ORD-45621"
            itemCount={18}
            zone="Zone B"
            completedItems={completedItems}
            onBack={handleCompletionBack}
            onComplete={handleCompletionBack}
          />
        );
      case 'photoInsideBag':
        return (
          <PhotoInsideBagScreen
            orderId="ORD-45621"
            itemCount={18}
            bagId="BAG-001"
            onBack={handleBackFromPhoto}
            onComplete={handlePhotoComplete}
          />
        );
      case 'scanRackQR':
        return (
          <ScanRackQRScreen
            orderId="ORD-45621"
            bagId="BAG-001"
            rackLocation="Rack D1-Slot 3"
            riderName="Rider Rohan"
            onBack={handleBackFromRackScan}
            onScanComplete={handleRackScanComplete}
          />
        );
      case 'orderComplete':
        return (
          <OrderCompleteScreen
            orderId="ORD-45621"
            rackLocation="RACK-D1-SLOT3"
            pickTime={52}
            targetTime={55}
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

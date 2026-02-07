// Quick script to check API configuration
// Run: node check-api-config.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('API Configuration Check');
console.log('========================================\n');

// Check app.json
const appJsonPath = path.join(__dirname, 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const apiUrl = appJson?.expo?.extra?.apiUrl;
  
  console.log('✅ app.json found');
  console.log('   API URL:', apiUrl || '❌ NOT SET');
  
  if (apiUrl) {
    console.log('   ✅ API URL is configured');
    
    // Check if it's a valid URL
    try {
      const url = new URL(apiUrl);
      console.log('   ✅ Valid URL format');
      console.log('   Host:', url.host);
      console.log('   Port:', url.port);
      console.log('   Path:', url.pathname);
    } catch (e) {
      console.log('   ❌ Invalid URL format:', e.message);
    }
  } else {
    console.log('   ❌ API URL is NOT configured in app.json');
    console.log('   Add to app.json:');
    console.log('   {');
    console.log('     "expo": {');
    console.log('       "extra": {');
    console.log('         "apiUrl": "http://YOUR_IP:5000/api"');
    console.log('       }');
    console.log('     }');
    console.log('   }');
  }
  
  // Check Android cleartext
  const usesCleartext = appJson?.expo?.android?.usesCleartextTraffic;
  console.log('\n   Android Cleartext Traffic:', usesCleartext ? '✅ Enabled' : '❌ Disabled');
  if (!usesCleartext) {
    console.log('   ⚠️  Add to app.json:');
    console.log('   "android": {');
    console.log('     "usesCleartextTraffic": true');
    console.log('   }');
  }
} else {
  console.log('❌ app.json not found!');
}

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasApiUrl = envContent.includes('EXPO_PUBLIC_API_URL');
  console.log('\n✅ .env file found');
  console.log('   EXPO_PUBLIC_API_URL:', hasApiUrl ? '✅ Set' : '❌ Not set');
} else {
  console.log('\n⚠️  .env file not found (optional)');
}

console.log('\n========================================');
console.log('Current IP Address:');
console.log('========================================');
console.log('Run: ipconfig | findstr IPv4');
console.log('Expected: your PC IPv4 on the same WiFi/LAN as your phone');
console.log('\n========================================');

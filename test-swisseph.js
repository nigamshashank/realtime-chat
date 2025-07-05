const swisseph = require('swisseph');
const path = require('path');

console.log('Testing Swiss Ephemeris module...');

try {
  // Set ephemeris path
  const ephePath = path.join(__dirname, 'ephe');
  console.log('Ephemeris path:', ephePath);
  swisseph.swe_set_ephe_path(ephePath);
  
  // Test a simple calculation
  const julianDay = 2459580.5; // 2022-01-01
  const planet = swisseph.SE_SUN;
  
  console.log('Testing calculation for Sun on 2022-01-01...');
  const result = swisseph.swe_calc_ut(julianDay, planet, swisseph.SEFLG_SWIEPH);
  
  if (result && result.longitude !== undefined) {
    console.log('✅ Swiss Ephemeris test successful!');
    console.log('Sun longitude:', result.longitude);
    console.log('Sun latitude:', result.latitude);
  } else {
    console.log('❌ Swiss Ephemeris test failed - no valid result');
  }
  
} catch (error) {
  console.error('❌ Swiss Ephemeris test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

console.log('✅ All tests passed!'); 
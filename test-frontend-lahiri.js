const { calculateHoroscope } = require('./horoscope.js');

// Simulate the exact payload that would be sent from the frontend
const frontendPayload = {
  name: 'Test User',
  dateOfBirth: '1978-12-19',
  timeOfBirth: '14:30',
  placeOfBirth: 'Mumbai, India',
  latitude: '19.0760N',
  longitude: '72.8777E',
  timezone: 'Asia/Kolkata',
  ayanamsa: '1'  // Lahiri from frontend dropdown
};

console.log('=== Testing Frontend Lahiri Request ===');
console.log('Frontend Payload:', frontendPayload);
console.log('Ayanamsa value from frontend:', frontendPayload.ayanamsa);
console.log('Ayanamsa type:', typeof frontendPayload.ayanamsa);

// Parse ayanamsa mode as the backend does
const mode = parseInt(frontendPayload.ayanamsa, 10);
console.log('Parsed ayanamsa mode:', mode);
console.log('Mode type:', typeof mode);

try {
  const horoscopeData = calculateHoroscope(
    frontendPayload.name,
    frontendPayload.dateOfBirth,
    frontendPayload.timeOfBirth,
    frontendPayload.placeOfBirth,
    frontendPayload.latitude,
    frontendPayload.longitude,
    frontendPayload.timezone,
    mode,  // Use the parsed mode
    5
  );

  console.log('\n=== HOROSCOPE CALCULATION RESULTS ===');
  console.log('Ayanamsa Mode Used:', horoscopeData.ayanamsaMode);
  console.log('Dasha Info:', horoscopeData.dashaInfo);
  console.log('First Mahadasha:', horoscopeData.dashaTree[0]);
  
  // Check if the dasha start date is correct
  const expectedStartDate = '1962-07-19'; // Expected for Mercury dasha with Lahiri
  const actualStartDate = horoscopeData.dashaInfo.dashaStart.format('YYYY-MM-DD');
  console.log('\n=== DASHA START DATE COMPARISON ===');
  console.log('Expected Start Date:', expectedStartDate);
  console.log('Actual Start Date:', actualStartDate);
  console.log('Dates Match:', expectedStartDate === actualStartDate);
  
  console.log('\n=== KEY RESULTS ===');
  console.log('✅ Ayanamsa Mode:', horoscopeData.ayanamsaMode, '(Lahiri)');
  console.log('✅ Ayanamsa Value:', horoscopeData.dashaInfo.ayanamsa.toFixed(2) + '°');
  console.log('✅ Moon Sidereal:', horoscopeData.dashaInfo.moonSiderealLongitude.toFixed(2) + '°');
  console.log('✅ Nakshatra:', horoscopeData.dashaInfo.nakshatra);
  console.log('✅ Dasha Lord:', horoscopeData.dashaInfo.dashaLord);
  console.log('✅ Dasha Start:', actualStartDate);
  console.log('✅ Dasha Balance:', (horoscopeData.dashaInfo.dashaBalance * 100).toFixed(2) + '%');

} catch (error) {
  console.error('Error:', error.message);
} 
// test-panchanga.js
const { computePanchanga } = require('./panchanga');

// Test the panchanga calculation
function testPanchanga(date, timezone, lat, lon, description) {
  try {
    console.log(`\n=== Testing: ${description} ===`);
    console.log(`Date: ${date}, Timezone: ${timezone}, Location: ${lat},${lon}`);
    
    const result = computePanchanga(date, timezone, lat, lon, 1);
    
    console.log('Results:');
    console.log(`  Tithi: ${result.tithi.number} (ends: ${result.tithi.endTime})`);
    console.log(`  Karana 1: ${result.karana1.number} (ends: ${result.karana1.endTime})`);
    console.log(`  Karana 2: ${result.karana2.number} (ends: ${result.karana2.endTime})`);
    
    // Verify karana logic
    if (result.karana1.endTime === result.tithi.endTime) {
      console.log('  ✅ Karana 1 correctly ends with tithi');
    } else {
      console.log('  ❌ Karana 1 should end with tithi');
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return null;
  }
}

console.log('Testing Panchanga Calculations...\n');

// Test cases
const testCases = [
  {
    date: '2024-01-15 12:00',
    timezone: 'Asia/Kolkata',
    lat: 28.6139,
    lon: 77.2090,
    description: 'Delhi - Mid January'
  },
  {
    date: '2024-06-15 12:00',
    timezone: 'Asia/Kolkata',
    lat: 28.6139,
    lon: 77.2090,
    description: 'Delhi - Mid June'
  },
  {
    date: '2024-12-15 12:00',
    timezone: 'Asia/Kolkata',
    lat: 28.6139,
    lon: 77.2090,
    description: 'Delhi - Mid December'
  }
];

testCases.forEach(testCase => {
  testPanchanga(
    testCase.date,
    testCase.timezone,
    testCase.lat,
    testCase.lon,
    testCase.description
  );
});

console.log('\n=== Summary ===');
console.log('Karana calculation logic:');
console.log('- Karana 1 ends at the end of current tithi');
console.log('- Karana 2 ends at the middle of next tithi');
console.log('- This represents the correct half-tithi periods in Vedic astrology');

console.log('\nNote: You need to download ephemeris files from:');
console.log('https://github.com/naturalstupid/pyjhora/tree/main/src/jhora/data/ephe');
console.log('Place them in the ./ephe/ directory'); 
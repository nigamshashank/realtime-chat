// test-today.js
const { computePanchanga } = require('./panchanga');

// Test for today's date (June 22, 2024)
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const timeStr = '12:00';

console.log(`Testing for today: ${dateStr} ${timeStr}`);

try {
  const result = computePanchanga(
    `${dateStr} ${timeStr}`,
    'America/New_York', // ET timezone
    40.7128, // NYC coordinates
    -74.0060,
    1 // Lahiri ayanamsa
  );
  
  console.log('\nPanchanga Results:');
  console.log(`Tithi: ${result.tithi.number} (ends: ${result.tithi.endTime})`);
  console.log(`Karana 1: ${result.karana1.number} (ends: ${result.karana1.endTime})`);
  console.log(`Karana 2: ${result.karana2.number} (ends: ${result.karana2.endTime})`);
  
  // Karana names mapping
  const KARANA_NAMES = [
    'Kimstughna','Bava','Balava','Kaulava','Taitila','Garaja',
    'Vanija','Vishti','Shakuni','Chatushpada','Nagava'
  ];
  
  console.log('\nKarana Names:');
  console.log(`Karana 1: ${KARANA_NAMES[result.karana1.number-1]} (ends: ${result.karana1.endTime})`);
  console.log(`Karana 2: ${KARANA_NAMES[result.karana2.number-1]} (ends: ${result.karana2.endTime})`);
  
  console.log('\nExpected:');
  console.log('Karana 1: Taitila upto 03:51 PM ET');
  console.log('Karana 2: Garaja upto 02:16 AM, Jun 23');
  
} catch (error) {
  console.error('Test failed:', error.message);
} 
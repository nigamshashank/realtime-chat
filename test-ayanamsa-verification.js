const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Test date: 1978-12-19 14:30:00 UTC
const testDate = '1978-12-19 14:30:00';
const testJD = swisseph.swe_julday(1978, 12, 19, 14.5, swisseph.SE_GREG_CAL);

console.log('=== Ayanamsa Verification Test ===');
console.log('Test Date:', testDate);
console.log('Julian Day:', testJD);

// Test 1: Get ayanamsa without setting mode (current implementation)
console.log('\n=== Test 1: Current Implementation ===');
try {
  const ayanamsaWithoutMode = swisseph.swe_get_ayanamsa_ut(testJD);
  console.log('Ayanamsa without setting mode:', ayanamsaWithoutMode.toFixed(2) + '°');
} catch (error) {
  console.log('Error without mode:', error.message);
}

// Test 2: Set Lahiri mode first, then get ayanamsa
console.log('\n=== Test 2: Proper Lahiri Implementation ===');
try {
  swisseph.swe_set_sid_mode(1, 0, 0); // Set to Lahiri mode
  const lahiriAyanamsa = swisseph.swe_get_ayanamsa_ut(testJD);
  console.log('Lahiri Ayanamsa (proper):', lahiriAyanamsa.toFixed(2) + '°');
} catch (error) {
  console.log('Error with Lahiri mode:', error.message);
}

// Test 3: Test other ayanamsa modes
console.log('\n=== Test 3: Other Ayanamsa Modes ===');
const modes = [
  { id: 0, name: 'Fagan/Bradley' },
  { id: 1, name: 'Lahiri' },
  { id: 2, name: 'DeLu' },
  { id: 3, name: 'Raman' },
  { id: 4, name: 'Krishnamurti' },
  { id: 6, name: 'ED50' },
  { id: 7, name: 'Dehant' }
];

modes.forEach(mode => {
  try {
    swisseph.swe_set_sid_mode(mode.id, 0, 0);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(testJD);
    console.log(`${mode.name} (${mode.id}): ${ayanamsa.toFixed(2)}°`);
  } catch (error) {
    console.log(`${mode.name} (${mode.id}): Error - ${error.message}`);
  }
});

// Test 4: Expected Lahiri values for different dates
console.log('\n=== Test 4: Expected Lahiri Values ===');
const testDates = [
  { date: '1950-01-01', expected: 23.15 },
  { date: '1978-12-19', expected: 23.85 },
  { date: '2000-01-01', expected: 24.00 },
  { date: '2024-01-01', expected: 24.15 }
];

testDates.forEach(test => {
  const moment = require('moment');
  const date = moment(test.date);
  const jd = swisseph.swe_julday(
    date.year(),
    date.month() + 1,
    date.date(),
    12, // noon
    swisseph.SE_GREG_CAL
  );
  
  try {
    swisseph.swe_set_sid_mode(1, 0, 0); // Lahiri
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
    const diff = Math.abs(ayanamsa - test.expected);
    console.log(`${test.date}: Expected ${test.expected}°, Got ${ayanamsa.toFixed(2)}°, Diff: ${diff.toFixed(2)}°`);
  } catch (error) {
    console.log(`${test.date}: Error - ${error.message}`);
  }
});

// Test 5: Check if we need to set mode for each calculation
console.log('\n=== Test 5: Mode Persistence ===');
try {
  // Set to Lahiri
  swisseph.swe_set_sid_mode(1, 0, 0);
  const lahiri1 = swisseph.swe_get_ayanamsa_ut(testJD);
  console.log('Lahiri 1:', lahiri1.toFixed(2) + '°');
  
  // Get again without setting mode
  const lahiri2 = swisseph.swe_get_ayanamsa_ut(testJD);
  console.log('Lahiri 2 (without setting mode):', lahiri2.toFixed(2) + '°');
  
  // Set to Fagan/Bradley
  swisseph.swe_set_sid_mode(0, 0, 0);
  const fagan = swisseph.swe_get_ayanamsa_ut(testJD);
  console.log('Fagan/Bradley:', fagan.toFixed(2) + '°');
  
  // Get again without setting mode
  const fagan2 = swisseph.swe_get_ayanamsa_ut(testJD);
  console.log('Fagan/Bradley 2 (without setting mode):', fagan2.toFixed(2) + '°');
  
} catch (error) {
  console.log('Mode persistence test error:', error.message);
} 
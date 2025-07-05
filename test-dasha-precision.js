const { calculateVimshottariDashaTree } = require('./dasha');
const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Test data: Born on 3 Jan 1978, 7:35 PM IST, Ayodhya
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== PRECISION ANALYSIS ===');
console.log('Birth Data: 1978-01-03 19:35:00 IST');
console.log('Expected Mars dasha start: Jan 25, 1971 (PyJHora)');
console.log('');

// Test different time precisions
const testTimes = [
  '1978-01-03 19:35:00',
  '1978-01-03 19:35:30',
  '1978-01-03 19:36:00',
  '1978-01-03 19:34:30',
  '1978-01-03 19:34:00'
];

console.log('=== TESTING DIFFERENT BIRTH TIMES ===');
testTimes.forEach(time => {
  const result = calculateVimshottariDashaTree(time, timezone, 1, 1);
  const expectedStart = moment('1971-01-25');
  const diffDays = result.dashaStart.diff(expectedStart, 'days');
  
  console.log(`${time}: Start ${result.dashaStart.format('YYYY-MM-DD')}, Diff: ${diffDays} days, Balance: ${result.dashaBalance.toFixed(4)}`);
});

console.log('\n=== TESTING DIFFERENT AYANAMSA MODES ===');
const ayanamsaModes = [0, 1, 2, 3, 4, 5, 6, 7];
ayanamsaModes.forEach(mode => {
  const result = calculateVimshottariDashaTree(birthDate, timezone, mode, 1);
  const expectedStart = moment('1971-01-25');
  const diffDays = result.dashaStart.diff(expectedStart, 'days');
  
  console.log(`Mode ${mode}: Start ${result.dashaStart.format('YYYY-MM-DD')}, Diff: ${diffDays} days, Ayanamsa: ${result.ayanamsa.toFixed(2)}`);
});

console.log('\n=== DETAILED ANALYSIS FOR EXACT TIME ===');
const birthMoment = moment.tz(birthDate, timezone);
const birthJD = swisseph.swe_julday(
  birthMoment.year(),
  birthMoment.month() + 1,
  birthMoment.date(),
  birthMoment.hour() + birthMoment.minute()/60 + birthMoment.second()/3600,
  swisseph.SE_GREG_CAL
);

// Let's check what the Moon's position would be at different times around birth
console.log('\n=== MOON POSITION AROUND BIRTH TIME ===');
const timeOffsets = [-2, -1, -0.5, 0, 0.5, 1, 2]; // hours
timeOffsets.forEach(offset => {
  const testTime = birthMoment.clone().add(offset, 'hours');
  const testJD = swisseph.swe_julday(
    testTime.year(),
    testTime.month() + 1,
    testTime.date(),
    testTime.hour() + testTime.minute()/60 + testTime.second()/3600,
    swisseph.SE_GREG_CAL
  );
  
  const moonResult = swisseph.swe_calc_ut(testJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(testJD);
  const moonSidereal = moonResult.longitude - ayanamsa;
  const nakLen = 360 / 27;
  const nakIdx = Math.floor(moonSidereal / nakLen);
  const posInNak = moonSidereal % nakLen;
  const balance = 1 - (posInNak / nakLen);
  
  console.log(`${offset >= 0 ? '+' : ''}${offset.toFixed(1)}h: Moon ${moonSidereal.toFixed(2)}°, Balance: ${balance.toFixed(4)}`);
});

// Let's also check what the exact balance should be for Jan 25, 1971 start
console.log('\n=== REVERSE ENGINEERING FOR JAN 25 START ===');
const expectedStart = moment('1971-01-25');
const elapsedYears = birthMoment.diff(expectedStart, 'years', true);
const expectedBalance = 1 - (elapsedYears / 7);

console.log('Expected elapsed years:', elapsedYears.toFixed(6));
console.log('Expected balance:', expectedBalance.toFixed(6));

// What Moon position would give us this balance?
const nakLen = 360 / 27;
const expectedPosInNak = nakLen * (1 - expectedBalance);
console.log('Expected position in nakshatra:', expectedPosInNak.toFixed(2));

// What sidereal longitude would give us this position?
// We know the person is in Chitra nakshatra (index 13)
const chitraStart = 13 * nakLen; // 173.33°
const expectedSiderealLongitude = chitraStart + expectedPosInNak;
console.log('Expected Moon sidereal longitude:', expectedSiderealLongitude.toFixed(2));

// What tropical longitude would give us this sidereal longitude?
const ayanamsa = swisseph.swe_get_ayanamsa_ut(birthJD);
const expectedTropicalLongitude = expectedSiderealLongitude + ayanamsa;
console.log('Expected Moon tropical longitude:', expectedTropicalLongitude.toFixed(2));

// What time would give us this Moon position?
console.log('\n=== FINDING CORRECT BIRTH TIME ===');
// Let's check a range of times to find when Moon is at the expected position
const timeRange = 24; // hours
const timeStep = 0.1; // hours

for (let hour = -timeRange/2; hour <= timeRange/2; hour += timeStep) {
  const testTime = birthMoment.clone().add(hour, 'hours');
  const testJD = swisseph.swe_julday(
    testTime.year(),
    testTime.month() + 1,
    testTime.date(),
    testTime.hour() + testTime.minute()/60 + testTime.second()/3600,
    swisseph.SE_GREG_CAL
  );
  
  const moonResult = swisseph.swe_calc_ut(testJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
  const testAyanamsa = swisseph.swe_get_ayanamsa_ut(testJD);
  const moonSidereal = moonResult.longitude - testAyanamsa;
  
  if (Math.abs(moonSidereal - expectedSiderealLongitude) < 0.1) {
    console.log(`Found matching time: ${testTime.format('YYYY-MM-DD HH:mm:ss')} (${hour >= 0 ? '+' : ''}${hour.toFixed(1)}h from original)`);
    console.log(`Moon sidereal longitude: ${moonSidereal.toFixed(2)}°`);
    break;
  }
} 
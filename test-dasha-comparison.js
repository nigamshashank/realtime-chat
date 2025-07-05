const { calculateVimshottariDashaTree } = require('./dasha');
const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Test data: Born on 3 Jan 1978, 7:35 PM IST, Ayodhya
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';
const place = 'Ayodhya, India';

console.log('=== DASHA COMPARISON TEST ===');
console.log('Birth Data:');
console.log('Date: 1978-01-03 19:35:00 IST');
console.log('Place: Ayodhya, India');
console.log('Expected Mars dasha start: Jan 25, 1971 (PyJHora)');
console.log('Our calculation: Dec 3, 1971');
console.log('');

// Parse birth date and convert to Julian Day
const birthMoment = moment.tz(birthDate, timezone);
const birthJD = swisseph.swe_julday(
  birthMoment.year(),
  birthMoment.month() + 1,
  birthMoment.date(),
  birthMoment.hour() + birthMoment.minute()/60 + birthMoment.second()/3600,
  swisseph.SE_GREG_CAL
);

console.log('=== DETAILED CALCULATION BREAKDOWN ===');
console.log('Birth Moment:', birthMoment.format('YYYY-MM-DD HH:mm:ss'));
console.log('Birth JD:', birthJD);

// Test with Lahiri Ayanamsa (Mode 1)
console.log('\n=== LAHIRI AYANAMSA CALCULATION ===');
const lahiriResult = calculateVimshottariDashaTree(birthDate, timezone, 1, 2);

console.log('Ayanamsa:', lahiriResult.ayanamsa);
console.log('Moon Sidereal Longitude:', lahiriResult.moonSiderealLongitude);
console.log('Nakshatra:', lahiriResult.nakshatra);
console.log('Dasha Lord:', lahiriResult.dashaLord);
console.log('Dasha Balance:', lahiriResult.dashaBalance);
console.log('Elapsed Years:', lahiriResult.elapsedYears);
console.log('Dasha Start Date:', lahiriResult.dashaStart.format('YYYY-MM-DD'));

// Calculate the difference
const expectedStart = moment('1971-01-25');
const calculatedStart = lahiriResult.dashaStart;
const diffDays = calculatedStart.diff(expectedStart, 'days');

console.log('\n=== COMPARISON ===');
console.log('Expected start (PyJHora):', expectedStart.format('YYYY-MM-DD'));
console.log('Calculated start (ours):', calculatedStart.format('YYYY-MM-DD'));
console.log('Difference in days:', diffDays);

// Let's also check the Moon's position calculation
console.log('\n=== MOON POSITION VERIFICATION ===');
const moonResult = swisseph.swe_calc_ut(birthJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
console.log('Moon Tropical Longitude:', moonResult.longitude);
console.log('Moon Sidereal Longitude (our calc):', lahiriResult.moonSiderealLongitude);
console.log('Moon Sidereal Longitude (tropical - ayanamsa):', moonResult.longitude - lahiriResult.ayanamsa);

// Let's also check the ayanamsa calculation
const ayanamsaResult = swisseph.swe_get_ayanamsa_ut(birthJD);
console.log('Swiss Ephemeris Ayanamsa:', ayanamsaResult);
console.log('Our Ayanamsa:', lahiriResult.ayanamsa);

// Let's calculate the nakshatra manually
const nakLen = 360 / 27; // Each nakshatra is 13°20' (13.33°)
const nakIdx = Math.floor(lahiriResult.moonSiderealLongitude / nakLen);
const posInNak = lahiriResult.moonSiderealLongitude % nakLen;
const balance = 1 - (posInNak / nakLen);

console.log('\n=== MANUAL NAKSHATRA CALCULATION ===');
console.log('Nakshatra Length:', nakLen);
console.log('Position in Nakshatra:', posInNak);
console.log('Manual Balance:', balance);
console.log('Function Balance:', lahiriResult.dashaBalance);

// Let's also check what the dasha balance should be for Jan 25, 1971 start
const expectedStartMoment = moment('1971-01-25');
const expectedElapsed = birthMoment.diff(expectedStartMoment, 'years', true);
const expectedBalance = 1 - (expectedElapsed / 7); // Mars dasha is 7 years

console.log('\n=== EXPECTED VS CALCULATED BALANCE ===');
console.log('Expected elapsed years (for Jan 25 start):', expectedElapsed);
console.log('Expected balance (for Jan 25 start):', expectedBalance);
console.log('Our calculated balance:', lahiriResult.dashaBalance);
console.log('Our calculated elapsed years:', lahiriResult.elapsedYears);

// Let's check if there's an issue with the timezone conversion
console.log('\n=== TIMEZONE VERIFICATION ===');
console.log('Birth moment in local timezone:', birthMoment.format('YYYY-MM-DD HH:mm:ss'));
console.log('Birth moment in UTC:', birthMoment.clone().utc().format('YYYY-MM-DD HH:mm:ss'));
console.log('Timezone offset:', birthMoment.format('Z'));

// Let's also check the Julian Day calculation
const birthJDManual = swisseph.swe_julday(
  1978, 1, 3, 19 + 35/60, swisseph.SE_GREG_CAL
);
console.log('Manual JD calculation:', birthJDManual);
console.log('Our JD calculation:', birthJD); 
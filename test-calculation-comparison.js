const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Test with the specific birth data
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== COMPARING TWO MOON CALCULATIONS ===');
console.log('Birth Date:', birthDate);
console.log('Timezone:', timezone);

// Method 1: Calculate Julian Day in UTC (like horoscope.js calculatePlanets)
const birthMoment = moment.tz(birthDate, timezone);
const birthMomentUTC = birthMoment.clone().utc();
const birthJD_UTC = swisseph.swe_julday(
  birthMomentUTC.year(),
  birthMomentUTC.month() + 1,
  birthMomentUTC.date(),
  birthMomentUTC.hour() + birthMomentUTC.minute()/60 + birthMomentUTC.second()/3600,
  swisseph.SE_GREG_CAL
);

console.log('\n=== METHOD 1: horoscope.js calculatePlanets (UTC) ===');
console.log('Local time:', birthMoment.format('YYYY-MM-DD HH:mm:ss'));
console.log('UTC time:', birthMomentUTC.format('YYYY-MM-DD HH:mm:ss'));
console.log('Julian Day (UTC):', birthJD_UTC);

// Calculate Moon using horoscope.js method
swisseph.swe_set_sid_mode(1, 0, 0); // Lahiri
const moonResult1 = swisseph.swe_calc_ut(birthJD_UTC, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
const ayanamsa1 = swisseph.swe_get_ayanamsa_ut(birthJD_UTC);
const moonSidereal1 = ((moonResult1.longitude - ayanamsa1) % 360 + 360) % 360;

console.log('Moon Tropical Longitude:', moonResult1.longitude.toFixed(2) + '°');
console.log('Ayanamsa:', ayanamsa1.toFixed(2) + '°');
console.log('Moon Sidereal Longitude:', moonSidereal1.toFixed(2) + '°');

// Method 2: Calculate Julian Day in local time (like dasha.js)
const birthJD_Local = swisseph.swe_julday(
  birthMoment.year(),
  birthMoment.month() + 1,
  birthMoment.date(),
  birthMoment.hour() + birthMoment.minute()/60 + birthMoment.second()/3600,
  swisseph.SE_GREG_CAL
);

console.log('\n=== METHOD 2: dasha.js (Local Time) ===');
console.log('Local time:', birthMoment.format('YYYY-MM-DD HH:mm:ss'));
console.log('Julian Day (Local):', birthJD_Local);

// Calculate Moon using dasha.js method
swisseph.swe_set_sid_mode(1, 0, 0); // Lahiri
const moonResult2 = swisseph.swe_calc_ut(birthJD_Local, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
const ayanamsa2 = swisseph.swe_get_ayanamsa_ut(birthJD_Local);
const moonSidereal2 = ((moonResult2.longitude - ayanamsa2) % 360 + 360) % 360;

console.log('Moon Tropical Longitude:', moonResult2.longitude.toFixed(2) + '°');
console.log('Ayanamsa:', ayanamsa2.toFixed(2) + '°');
console.log('Moon Sidereal Longitude:', moonSidereal2.toFixed(2) + '°');

// Compare the results
console.log('\n=== COMPARISON ===');
console.log('Julian Day Difference:', Math.abs(birthJD_UTC - birthJD_Local));
console.log('Moon Sidereal Difference:', Math.abs(moonSidereal1 - moonSidereal2).toFixed(2) + '°');

// Calculate nakshatra and pada for both
function getNakshatra(longitude) {
  const idx = Math.floor((longitude % 360) / (360 / 27));
  const nakshatraNames = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  return nakshatraNames[idx];
}

function getPada(longitude) {
  const nakLen = 360 / 27;
  const posInNak = longitude % nakLen;
  return Math.floor((posInNak / nakLen) * 4) + 1;
}

console.log('\n=== NAKSHATRA & PADA COMPARISON ===');
console.log('Method 1 (UTC):', getNakshatra(moonSidereal1), 'Pada', getPada(moonSidereal1));
console.log('Method 2 (Local):', getNakshatra(moonSidereal2), 'Pada', getPada(moonSidereal2));

// Show which one matches the frontend expectation
console.log('\n=== CONCLUSION ===');
if (getPada(moonSidereal1) === 3) {
  console.log('✅ Method 1 (UTC) gives Chitra Pada 3 - matches frontend table');
} else {
  console.log('❌ Method 1 (UTC) gives Chitra Pada', getPada(moonSidereal1));
}

if (getPada(moonSidereal2) === 3) {
  console.log('✅ Method 2 (Local) gives Chitra Pada 3 - matches frontend table');
} else {
  console.log('❌ Method 2 (Local) gives Chitra Pada', getPada(moonSidereal2));
}

console.log('\nThe frontend table uses Method 1 (UTC calculation from horoscope.js)');
console.log('The dasha calculation uses Method 2 (Local time calculation from dasha.js)'); 
const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Debug function to understand the mapping
function debugMapping(longitude) {
  const nakLen = 360 / 27;
  const nakIdx = Math.floor(longitude / nakLen);
  const lordIdx = nakIdx % 9;
  
  const NAKSHATRA_NAMES = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  
  const DASA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  
  console.log(`Longitude: ${longitude}°`);
  console.log(`Nakshatra length: ${nakLen}°`);
  console.log(`Nakshatra index: ${nakIdx}`);
  console.log(`Nakshatra name: ${NAKSHATRA_NAMES[nakIdx]}`);
  console.log(`Dasha lord index: ${lordIdx}`);
  console.log(`Dasha lord: ${DASA_LORDS[lordIdx]}`);
  console.log('---');
}

// Birth time: 3 Jan 1978 19:35 IST
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== Dasha Calculation Test ===\n');
console.log('Birth time:', birthDate);
console.log('Timezone:', timezone);

// Convert to Julian Day
const birthMoment = moment.tz(birthDate, timezone);
const birthJD = swisseph.julday(
  birthMoment.year(),
  birthMoment.month() + 1,
  birthMoment.date(),
  birthMoment.hour() + birthMoment.minute()/60 + birthMoment.second()/3600,
  1 // gregflag: 1 = Gregorian calendar
);

console.log(`Julian Day: ${birthJD.toFixed(6)}`);

// Test different Ayanamsa modes
console.log('\n=== Ayanamsa Modes ===');

// Mode 1: Lahiri (default)
const lahiriAyanamsa = swisseph.get_ayanamsa_ut(birthJD);
console.log(`Lahiri Ayanamsa: ${lahiriAyanamsa.toFixed(2)}°`);

// Mode 5: Pushya Paksha
const deltaCancriResult = swisseph.fixstar_ut("Asellus Australis", birthJD, swisseph.SEFLG_SWIEPH);
const pushyaPakshaAyanamsa = deltaCancriResult.longitude - 106;
console.log(`Pushya Paksha Ayanamsa: ${pushyaPakshaAyanamsa.toFixed(2)}°`);

// Get Moon's tropical longitude
const moonResult = swisseph.calc_ut(birthJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
const moonTropicalLongitude = moonResult.longitude;
console.log(`Moon Tropical Longitude: ${moonTropicalLongitude.toFixed(2)}°`);

// Calculate sidereal longitudes
const moonLahiriSidereal = moonTropicalLongitude - lahiriAyanamsa;
const moonPushyaSidereal = moonTropicalLongitude - pushyaPakshaAyanamsa;

console.log(`Moon Sidereal (Lahiri): ${((moonLahiriSidereal % 360) + 360) % 360}`);
console.log(`Moon Sidereal (Pushya): ${((moonPushyaSidereal % 360) + 360) % 360}`);

// Nakshatra names
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Dasha lords
const DASA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

function getNakshatraAndLord(siderealLongitude) {
  const nakLen = 360 / 27;
  const nakIdx = Math.floor(siderealLongitude / nakLen);
  const lordIdx = nakIdx % 9;
  
  return {
    nakshatra: NAKSHATRA_NAMES[nakIdx],
    nakshatraIndex: nakIdx,
    lord: DASA_LORDS[lordIdx],
    lordIndex: lordIdx
  };
}

const lahiriResult = getNakshatraAndLord(((moonLahiriSidereal % 360) + 360) % 360);
const pushyaResult = getNakshatraAndLord(((moonPushyaSidereal % 360) + 360) % 360);

console.log('\n=== Results ===');

console.log('Lahiri Ayanamsa:');
console.log(`  Nakshatra: ${lahiriResult.nakshatra} (${lahiriResult.nakshatraIndex})`);
console.log(`  Dasha Lord: ${lahiriResult.lord} (${lahiriResult.lordIndex})`);

console.log('Pushya Paksha Ayanamsa:');
console.log(`  Nakshatra: ${pushyaResult.nakshatra} (${pushyaResult.nakshatraIndex})`);
console.log(`  Dasha Lord: ${pushyaResult.lord} (${pushyaResult.lordIndex})`);

// Test dasha periods
console.log('\n=== Dasha Periods ===');
const DASA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

console.log('Lahiri Dasha:');
const lahiriDashaStart = moment.tz(birthDate, timezone).subtract(lahiriResult.lordIndex * DASA_YEARS[lahiriResult.lordIndex], 'years');
console.log(`  ${lahiriResult.lord} dasha started: ${lahiriDashaStart.format('YYYY-MM-DD')}`);

console.log('Pushya Paksha Dasha:');
const pushyaDashaStart = moment.tz(birthDate, timezone).subtract(pushyaResult.lordIndex * DASA_YEARS[pushyaResult.lordIndex], 'years');
console.log(`  ${pushyaResult.lord} dasha started: ${pushyaDashaStart.format('YYYY-MM-DD')}`);

console.log('\n=== Test Complete ==='); 
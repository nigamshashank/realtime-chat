const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Test case: Jan 3, 1978, Faizabad, India
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('Verifying Moon position for birth date:', birthDate);
console.log('Timezone:', timezone);

// Parse birth date and convert to Julian Day
const birthMoment = moment.tz(birthDate, timezone);
const birthJD = swisseph.julday(
  birthMoment.year(),
  birthMoment.month() + 1,
  birthMoment.date(),
  birthMoment.hour() + birthMoment.minute()/60 + birthMoment.second()/3600,
  1 // gregflag: 1 = Gregorian calendar
);

console.log(`Julian Day: ${birthJD.toFixed(6)}`);

// Get Moon's tropical longitude
const moonResult = swisseph.calc_ut(birthJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
const moonTropicalLongitude = moonResult.longitude;

console.log('Moon Tropical Longitude:', moonTropicalLongitude.toFixed(2) + '°');

// Calculate different Ayanamsas
const lahiriAyanamsa = swisseph.get_ayanamsa_ut(birthJD);
console.log('Lahiri Ayanamsa:', lahiriAyanamsa.toFixed(2) + '°');

// Get Delta Cancri (Pushya) position for Pushya Paksha Ayanamsa
const deltaCancriResult = swisseph.calc_ut(birthJD, swisseph.SE_DELTA_CANC, swisseph.SEFLG_SWIEPH);
const deltaCancriLongitude = deltaCancriResult.longitude;
const pushyaPakshaAyanamsa = deltaCancriLongitude - 106;

console.log('Delta Cancri (Pushya) Longitude:', deltaCancriLongitude.toFixed(2) + '°');
console.log('Pushya Paksha Ayanamsa:', pushyaPakshaAyanamsa.toFixed(2) + '°');

// Calculate sidereal longitudes
const moonLahiriSidereal = moonTropicalLongitude - lahiriAyanamsa;
const moonPushyaSidereal = moonTropicalLongitude - pushyaPakshaAyanamsa;

console.log('Moon Sidereal (Lahiri):', ((moonLahiriSidereal % 360) + 360) % 360);
console.log('Moon Sidereal (Pushya):', ((moonPushyaSidereal % 360) + 360) % 360);

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

console.log('\nExpected: Mars dasha (lord index 4)');
console.log('For Mars dasha, we need nakshatra indices: 4, 13, 22'); 
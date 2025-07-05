const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Birth time: 3 Jan 1978 19:35 IST
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== Pushya Paksha Ayanamsa Calculation ===\n');
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

// Step 1: Get tropical longitude of Delta Cancri at birth time
console.log('\n=== Step 1: Delta Cancri Tropical Longitude ===');
const deltaCancriResult = swisseph.fixstar_ut("Asellus Australis", birthJD, swisseph.SEFLG_SWIEPH);
const deltaCancriLongitude = deltaCancriResult.longitude;
console.log(`Delta Cancri Tropical Longitude: ${deltaCancriLongitude.toFixed(2)}°`);

// Step 2: Subtract 106° (16Cn0) from Delta Cancri longitude
console.log('\n=== Step 2: Calculate Ayanamsa ===');
const ayanamsa = deltaCancriLongitude - 106;
console.log(`Ayanamsa = ${deltaCancriLongitude.toFixed(2)}° - 106° = ${ayanamsa.toFixed(2)}°`);

// Step 3: Get Moon's tropical longitude
console.log('\n=== Step 3: Moon Position ===');
const moonResult = swisseph.calc_ut(birthJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
const moonTropicalLongitude = moonResult.longitude;
console.log(`Moon Tropical Longitude: ${moonTropicalLongitude.toFixed(2)}°`);

// Step 4: Calculate Moon's sidereal longitude
console.log('\n=== Step 4: Moon Sidereal Longitude ===');
const moonSiderealLongitude = moonTropicalLongitude - ayanamsa;
console.log(`Moon Sidereal Longitude = ${moonTropicalLongitude.toFixed(2)}° - ${ayanamsa.toFixed(2)}° = ${moonSiderealLongitude.toFixed(2)}°`);

// Normalize to 0-360
const normalizedLongitude = ((moonSiderealLongitude % 360) + 360) % 360;
console.log(`Normalized Longitude: ${normalizedLongitude.toFixed(2)}°`);

// Step 5: Calculate Nakshatra
console.log('\n=== Step 5: Nakshatra Calculation ===');
const nakLen = 360 / 27; // Each nakshatra is 13°20' (13.33°)
const nakIdx = Math.floor(normalizedLongitude / nakLen);
const posInNak = normalizedLongitude % nakLen;

// Nakshatra names
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

console.log(`Nakshatra Length: ${nakLen.toFixed(2)}°`);
console.log(`Nakshatra Index: ${nakIdx}`);
console.log(`Position in Nakshatra: ${posInNak.toFixed(2)}°`);
console.log(`Nakshatra Name: ${NAKSHATRA_NAMES[nakIdx]}`);

// Step 6: Calculate Pada
console.log('\n=== Step 6: Pada Calculation ===');
const padaLen = nakLen / 4; // Each pada is 3°20' (3.33°)
const padaIdx = Math.floor(posInNak / padaLen);
const posInPada = posInNak % padaLen;

console.log(`Pada Length: ${padaLen.toFixed(2)}°`);
console.log(`Pada Index: ${padaIdx + 1} (1-4)`);
console.log(`Position in Pada: ${posInPada.toFixed(2)}°`);

// Step 7: Calculate Dasha Lord
console.log('\n=== Step 7: Dasha Lord ===');
const dashaLordIdx = nakIdx % 9;
const DASA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
console.log(`Dasha Lord: ${DASA_LORDS[dashaLordIdx]}`);

console.log('\n=== Summary ===');
console.log(`Birth Time: ${birthDate}`);
console.log(`Moon's Nakshatra: ${NAKSHATRA_NAMES[nakIdx]} (${nakIdx + 1}/27)`);
console.log(`Moon's Pada: ${padaIdx + 1}/4`);
console.log(`Dasha Lord: ${DASA_LORDS[dashaLordIdx]}`);

// Also show other planets' nakshatras
console.log('\n=== Other Planets Nakshatras ===');
const planets = [
  { name: 'Sun', id: swisseph.SE_SUN },
  { name: 'Mercury', id: swisseph.SE_MERCURY },
  { name: 'Venus', id: swisseph.SE_VENUS },
  { name: 'Mars', id: swisseph.SE_MARS },
  { name: 'Jupiter', id: swisseph.SE_JUPITER },
  { name: 'Saturn', id: swisseph.SE_SATURN },
  { name: 'Rahu', id: swisseph.SE_MEAN_NODE },
  { name: 'Ketu', id: swisseph.SE_MEAN_NODE }
];

planets.forEach(planet => {
  const result = swisseph.calc_ut(birthJD, planet.id, swisseph.SEFLG_SWIEPH);
  const tropicalLongitude = result.longitude;
  const siderealLongitude = tropicalLongitude - ayanamsa;
  const normalized = ((siderealLongitude % 360) + 360) % 360;
  const planetNakIdx = Math.floor(normalized / nakLen);
  const planetPosInNak = normalized % nakLen;
  const planetPadaIdx = Math.floor(planetPosInNak / padaLen);
  
  console.log(`${planet.name}: ${NAKSHATRA_NAMES[planetNakIdx]} Pada ${planetPadaIdx + 1} (${normalized.toFixed(1)}°)`);
}); 
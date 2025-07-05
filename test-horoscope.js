// test-horoscope.js
const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Birth time: 3 Jan 1978 19:35 IST
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';
const lat = 28.6139;
const lon = 77.2090;

console.log('=== Horoscope Calculation Test ===\n');
console.log('Birth time:', birthDate);
console.log('Timezone:', timezone);
console.log('Location:', lat, lon);

// Convert to Julian Day
const birthMoment = moment.tz(birthDate, timezone);
const birthJD = swisseph.swe_julday(
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
swisseph.swe_set_sid_mode(1, 0, 0);
const lahiriAyanamsa = swisseph.swe_get_ayanamsa_ut(birthJD);
console.log(`Lahiri Ayanamsa: ${lahiriAyanamsa.toFixed(2)}°`);

// Mode 5: Pushya Paksha
swisseph.swe_set_sid_mode(5, 0, 0);
const deltaCancriResult = swisseph.swe_fixstar_ut("Asellus Australis", birthJD, swisseph.SEFLG_SWIEPH);
const pushyaPakshaAyanamsa = deltaCancriResult.longitude - 106;
console.log(`Pushya Paksha Ayanamsa: ${pushyaPakshaAyanamsa.toFixed(2)}°`);

// Test houses calculation
console.log('\n=== Houses Calculation ===');
try {
  const houses = swisseph.swe_houses(birthJD, lat, lon, 'P');
  console.log(`Ascendant: ${houses.ascendant.toFixed(2)}°`);
  console.log(`MC: ${houses.mc.toFixed(2)}°`);
  console.log(`ARMC: ${houses.armc.toFixed(2)}°`);
  console.log(`Vertex: ${houses.vertex.toFixed(2)}°`);
  console.log(`Equasc: ${houses.equasc.toFixed(2)}°`);
  
  // Show house cusps
  console.log('\nHouse Cusps:');
  for (let i = 0; i < houses.cusps.length; i++) {
    console.log(`  House ${i + 1}: ${houses.cusps[i].toFixed(2)}°`);
  }
} catch (error) {
  console.log(`Houses Error: ${error.message}`);
}

// Test planet calculations
console.log('\n=== Planet Positions ===');
const planets = [
  { name: 'Sun', id: swisseph.SE_SUN },
  { name: 'Moon', id: swisseph.SE_MOON },
  { name: 'Mercury', id: swisseph.SE_MERCURY },
  { name: 'Venus', id: swisseph.SE_VENUS },
  { name: 'Mars', id: swisseph.SE_MARS },
  { name: 'Jupiter', id: swisseph.SE_JUPITER },
  { name: 'Saturn', id: swisseph.SE_SATURN },
  { name: 'Rahu', id: swisseph.SE_MEAN_NODE }
];

planets.forEach(planet => {
  try {
    const result = swisseph.swe_calc_ut(birthJD, planet.id, swisseph.SEFLG_SWIEPH);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(birthJD);
    const siderealLongitude = ((result.longitude - ayanamsa) % 360 + 360) % 360;
    
    console.log(`${planet.name}:`);
    console.log(`  Tropical: ${result.longitude.toFixed(2)}°`);
    console.log(`  Sidereal: ${siderealLongitude.toFixed(2)}°`);
    console.log(`  Latitude: ${result.latitude.toFixed(2)}°`);
    console.log(`  Distance: ${result.distance.toFixed(2)} AU`);
  } catch (error) {
    console.log(`${planet.name}: Error - ${error.message}`);
  }
});

console.log('\n=== Test Complete ==='); 
const swisseph = require('swisseph');
const moment = require('moment-timezone');
const path = require('path');

// Birth time: 3 Jan 1978 19:35 IST
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== Swiss Ephemeris Test ===\n');
console.log('Birth time:', birthDate);
console.log('Timezone:', timezone);

// Set ephemeris path
const ephePath = path.join(__dirname, 'ephe');
swisseph.set_ephe_path(ephePath);
console.log(`Ephemeris path set to: ${ephePath}`);

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

// Test basic planet calculations
console.log('\n=== Planet Positions ===');
const planets = [
  { name: 'Sun', id: swisseph.constants.SE_SUN },
  { name: 'Moon', id: swisseph.constants.SE_MOON },
  { name: 'Mercury', id: swisseph.constants.SE_MERCURY },
  { name: 'Venus', id: swisseph.constants.SE_VENUS },
  { name: 'Mars', id: swisseph.constants.SE_MARS },
  { name: 'Jupiter', id: swisseph.constants.SE_JUPITER },
  { name: 'Saturn', id: swisseph.constants.SE_SATURN },
  { name: 'Rahu', id: swisseph.constants.SE_MEAN_NODE }
];

planets.forEach(planet => {
  try {
    const result = swisseph.calc_ut(birthJD, planet.id, swisseph.constants.SEFLG_SWIEPH);
    if (result && result.data && result.data.length >= 3) {
      const longitude = result.data[0];
      const latitude = result.data[1];
      const distance = result.data[2];
      console.log(`${planet.name}: ${longitude.toFixed(2)}° (lat: ${latitude.toFixed(2)}°, dist: ${distance.toFixed(2)} AU)`);
      if (result.error) {
        console.log(`  Warning: ${result.error}`);
      }
    } else {
      console.log(`${planet.name}: Invalid result structure`);
    }
  } catch (error) {
    console.log(`${planet.name}: Error - ${error.message}`);
  }
});

// Test Ayanamsa
console.log('\n=== Ayanamsa ===');
try {
  const ayanamsa = swisseph.get_ayanamsa_ut(birthJD);
  console.log(`Lahiri Ayanamsa: ${ayanamsa.toFixed(2)}°`);
} catch (error) {
  console.log(`Ayanamsa Error: ${error.message}`);
}

// Test houses
console.log('\n=== Houses ===');
try {
  const houses = swisseph.houses(birthJD, 28.6139, 77.2090, 'P');
  if (houses && houses.ascendant !== undefined) {
    console.log(`Ascendant: ${houses.ascendant.toFixed(2)}°`);
    console.log(`MC: ${houses.mc.toFixed(2)}°`);
  } else {
    console.log('Houses result structure:', houses);
  }
} catch (error) {
  console.log(`Houses Error: ${error.message}`);
}

// Test star calculations
console.log('\n=== Star Positions ===');
const stars = [
  { name: 'Spica', id: swisseph.constants.SE_SPICA },
  { name: 'Regulus', id: swisseph.constants.SE_REGULUS },
  { name: 'Aldebaran', id: swisseph.constants.SE_ALDEBARAN },
  { name: 'Antares', id: swisseph.constants.SE_ANTARES }
];

stars.forEach(star => {
  try {
    const result = swisseph.calc_ut(birthJD, star.id, swisseph.constants.SEFLG_SWIEPH);
    console.log(`${star.name}: ${result.longitude.toFixed(2)}°`);
  } catch (error) {
    console.log(`${star.name}: Error - ${error.message}`);
  }
});

// Test fixstar
console.log('\n=== Fixstar ===');
const fixstarNames = [
  'Spica',
  'Regulus',
  'Aldebaran',
  'Antares',
  'Asellus Australis'
];

fixstarNames.forEach(name => {
  try {
    const result = swisseph.fixstar_ut(name, birthJD, swisseph.constants.SEFLG_SWIEPH);
    if (result && result.data && result.data.length >= 3) {
      const longitude = result.data[0];
      const latitude = result.data[1];
      const distance = result.data[2];
      console.log(`${name}: ${longitude.toFixed(2)}° (lat: ${latitude.toFixed(2)}°, dist: ${distance.toFixed(2)} AU)`);
      if (result.error) {
        console.log(`  Warning: ${result.error}`);
      }
    } else {
      console.log(`${name}: Invalid result structure`);
    }
  } catch (error) {
    console.log(`${name}: Error - ${error.message}`);
  }
});

console.log('\n=== Test Complete ==='); 
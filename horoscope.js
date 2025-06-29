const swisseph = require('swisseph');
const moment = require('moment-timezone');
const { normalize, getSiderealLongitude } = require('./panchanga');
const { calculateVimshottariDashaTree } = require('./dasha');

// Planetary constants
const PLANETS = {
  SUN: 0, MOON: 1, MERCURY: 2, VENUS: 3, MARS: 4, 
  JUPITER: 5, SATURN: 6, URANUS: 7, NEPTUNE: 8, PLUTO: 9,
  RAHU: 10, KETU: 11
};

const PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Rahu', 'Ketu'
];

const PLANET_NAMES_SANSKRIT = [
  'Surya', 'Chandra', 'Budha', 'Shukra', 'Mangala',
  'Guru', 'Shani', 'Uranus', 'Neptune', 'Pluto',
  'Rahu', 'Ketu'
];

// Zodiac signs (sidereal)
const ZODIAC_SIGNS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanus', 'Makara', 'Kumbha', 'Meena'
];

// House names
const HOUSE_NAMES = [
  'Lagna', 'Dhana', 'Sahaja', 'Bandhu', 'Putra', 'Roga',
  'Kalatra', 'Ayur', 'Dharma', 'Karma', 'Labha', 'Vyaya'
];

/**
 * Convert latitude/longitude with cardinal directions to decimal degrees
 */
function parseCoordinate(value, type) {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove extra spaces and convert to uppercase
    const cleanValue = value.trim().toUpperCase();
    
    // Check if it already has cardinal directions
    if (cleanValue.includes('N') || cleanValue.includes('S') || 
        cleanValue.includes('E') || cleanValue.includes('W')) {
      
      let numericValue = parseFloat(cleanValue.replace(/[NSEW]/g, ''));
      let direction = cleanValue.replace(/[0-9.\s]/g, '');
      
      if (type === 'latitude') {
        if (direction.includes('S')) {
          numericValue = -Math.abs(numericValue);
        }
      } else if (type === 'longitude') {
        if (direction.includes('W')) {
          numericValue = -Math.abs(numericValue);
        }
      }
      
      return numericValue;
    } else {
      // Just a number, assume positive
      return parseFloat(cleanValue);
    }
  }
  
  return 0;
}

/**
 * Calculate Lagna (Ascendant) at given time and location
 */
function calculateLagna(jd, lat, lon, ayanamsaMode = 1) {
  // Set ayanamsa mode
  swisseph.swe_set_sid_mode(ayanamsaMode, 0, 0);
  
  // Calculate houses using Swiss Ephemeris
  const houses = swisseph.swe_houses(jd, lat, lon, 'P');
  
  // Get sidereal lagna (subtract ayanamsa)
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
  const lagnaLongitude = normalize(houses.ascendant - ayanamsa);
  
  return {
    longitude: lagnaLongitude,
    sign: ZODIAC_SIGNS[Math.floor(lagnaLongitude / 30)],
    signNumber: Math.floor(lagnaLongitude / 30) + 1,
    degree: lagnaLongitude % 30,
    minute: Math.floor((lagnaLongitude % 30) * 60),
    second: Math.floor(((lagnaLongitude % 30) * 60 % 1) * 60)
  };
}

/**
 * Calculate planetary positions at given time
 */
function calculatePlanets(jd, ayanamsaMode = 1) {
  // Set ayanamsa mode
  swisseph.swe_set_sid_mode(ayanamsaMode, 0, 0);
  
  const planets = {};
  
  // Calculate positions for visible planets
  for (let i = 0; i <= 9; i++) {
    const result = swisseph.swe_calc_ut(jd, i, swisseph.SEFLG_SWIEPH);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
    const longitude = normalize(result.longitude - ayanamsa);
    const latitude = result.latitude;
    const speed = result.speedLong;
    
    planets[PLANET_NAMES[i]] = {
      longitude: longitude,
      latitude: latitude,
      speed: speed,
      sign: ZODIAC_SIGNS[Math.floor(longitude / 30)],
      signNumber: Math.floor(longitude / 30) + 1,
      degree: longitude % 30,
      minute: Math.floor((longitude % 30) * 60),
      second: Math.floor(((longitude % 30) * 60 % 1) * 60),
      isRetrograde: speed < 0
    };
  }
  
  // Calculate Rahu and Ketu (Lunar Nodes)
  const rahuResult = swisseph.swe_calc_ut(jd, swisseph.SE_MEAN_NODE, swisseph.SEFLG_SWIEPH);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
  
  // Rahu is the ascending node of Moon
  const rahuLongitude = normalize(rahuResult.longitude - ayanamsa);
  const ketuLongitude = normalize(rahuLongitude + 180);
  
  planets['Rahu'] = {
    longitude: rahuLongitude,
    latitude: 0,
    speed: rahuResult.speedLong,
    sign: ZODIAC_SIGNS[Math.floor(rahuLongitude / 30)],
    signNumber: Math.floor(rahuLongitude / 30) + 1,
    degree: rahuLongitude % 30,
    minute: Math.floor((rahuLongitude % 30) * 60),
    second: Math.floor(((rahuLongitude % 30) * 60 % 1) * 60),
    isRetrograde: rahuResult.speedLong < 0
  };
  
  planets['Ketu'] = {
    longitude: ketuLongitude,
    latitude: 0,
    speed: rahuResult.speedLong,
    sign: ZODIAC_SIGNS[Math.floor(ketuLongitude / 30)],
    signNumber: Math.floor(ketuLongitude / 30) + 1,
    degree: ketuLongitude % 30,
    minute: Math.floor((ketuLongitude % 30) * 60),
    second: Math.floor(((ketuLongitude % 30) * 60 % 1) * 60),
    isRetrograde: rahuResult.speedLong < 0
  };
  
  return planets;
}

/**
 * Calculate house positions based on lagna
 */
function calculateHouses(lagnaLongitude) {
  const houses = [];
  
  for (let i = 1; i <= 12; i++) {
    const houseLongitude = normalize(lagnaLongitude + (i - 1) * 30);
    houses.push({
      number: i,
      name: HOUSE_NAMES[i - 1],
      longitude: houseLongitude,
      sign: ZODIAC_SIGNS[Math.floor(houseLongitude / 30)],
      signNumber: Math.floor(houseLongitude / 30) + 1,
      degree: houseLongitude % 30
    });
  }
  
  return houses;
}

/**
 * Determine which house a planet is in
 */
function getPlanetHouse(planetLongitude, lagnaLongitude) {
  const diff = normalize(planetLongitude - lagnaLongitude);
  const houseNumber = Math.floor(diff / 30) + 1;
  return houseNumber > 12 ? houseNumber - 12 : houseNumber;
}

/**
 * Calculate planetary aspects (Vedic astrology)
 */
function calculateAspects(planets) {
  const aspects = {};
  
  // 7th house aspect (opposition)
  for (const planet1 in planets) {
    aspects[planet1] = {};
    for (const planet2 in planets) {
      if (planet1 !== planet2) {
        const diff = Math.abs(planets[planet1].longitude - planets[planet2].longitude);
        const normalizedDiff = Math.min(diff, 360 - diff);
        
        // 7th house aspect (180°)
        if (Math.abs(normalizedDiff - 180) < 5) {
          aspects[planet1][planet2] = '7th House';
        }
        // 4th and 8th house aspects for Mars, Jupiter, Saturn
        else if (['Mars', 'Jupiter', 'Saturn'].includes(planet1)) {
          if (Math.abs(normalizedDiff - 120) < 5) {
            aspects[planet1][planet2] = '4th House';
          } else if (Math.abs(normalizedDiff - 240) < 5) {
            aspects[planet1][planet2] = '8th House';
          }
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Generate chart layout
 */
function buildChartLayout(lagna, planets, houses) {
  // Chart layout (12 houses)
  const chart = {
    houses: [],
    planets: {},
    aspects: calculateAspects(planets)
  };
  
  // Fill houses with planets
  for (let i = 1; i <= 12; i++) {
    const housePlanets = [];
    for (const planet in planets) {
      if (getPlanetHouse(planets[planet].longitude, lagna.longitude) === i) {
        housePlanets.push({
          name: planet,
          ...planets[planet]
        });
      }
    }
    
    chart.houses.push({
      number: i,
      name: houses[i - 1].name,
      sign: houses[i - 1].sign,
      signNumber: houses[i - 1].signNumber,
      planets: housePlanets
    });
  }
  
  // Add planet details
  chart.planets = planets;
  
  return chart;
}

/**
 * Main horoscope calculation function
 */
function calculateHoroscope(name, dateOfBirth, timeOfBirth, placeOfBirth, lat, lon, timezone, ayanamsaMode = 1) {
  try {
    // Parse birth date and time in local timezone
    const birthMoment = moment.tz(`${dateOfBirth} ${timeOfBirth}`, 'YYYY-MM-DD HH:mm', timezone);
    if (!birthMoment.isValid()) {
      throw new Error('Invalid birth date/time or timezone');
    }

    // Convert to UTC for Swiss Ephemeris
    const birthMomentUTC = birthMoment.clone().utc();

    // Parse coordinates with cardinal directions
    const latitude = parseCoordinate(lat, 'latitude');
    const longitude = parseCoordinate(lon, 'longitude');

    // Validate coordinates
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude. Must be between -90 and 90 degrees.');
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude. Must be between -180 and 180 degrees.');
    }

    // Convert to Julian Day in UT
    const birthJD = swisseph.swe_julday(
      birthMomentUTC.year(),
      birthMomentUTC.month() + 1,
      birthMomentUTC.date(),
      birthMomentUTC.hour() + birthMomentUTC.minute()/60 + birthMomentUTC.second()/3600,
      swisseph.SE_GREG_CAL
    );

    // Calculate lagna
    const lagna = calculateLagna(birthJD, latitude, longitude, ayanamsaMode);

    // Calculate planetary positions
    const planets = calculatePlanets(birthJD, ayanamsaMode);

    // Calculate houses
    const houses = calculateHouses(lagna.longitude);

    // Generate diamond chart
    const chart = buildChartLayout(lagna, planets, houses);

    // Calculate Vimshottari Dasha
    const moonLongitude = planets.Moon.longitude;
    const dashaTree = calculateVimshottariDashaTree(birthMoment.format('YYYY-MM-DD HH:mm:ss'), moonLongitude, timezone, 5);

    return {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      timezone,
      latitude: latitude,
      longitude: longitude,
      ayanamsaMode,
      lagna,
      planets,
      houses,
      chart,
      dashaTree,
      calculatedAt: new Date()
    };

  } catch (error) {
    throw new Error(`Horoscope calculation failed: ${error.message}`);
  }
}

module.exports = {
  calculateHoroscope,
  calculateLagna,
  calculatePlanets,
  calculateHouses,
  buildChartLayout,
  PLANET_NAMES,
  PLANET_NAMES_SANSKRIT,
  ZODIAC_SIGNS,
  HOUSE_NAMES
}; 
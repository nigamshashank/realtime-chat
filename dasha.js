const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Nakshatra names
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Dasha lords in order (Vimshottari sequence)
const DASA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Dasha years for each lord
const DASA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

// Sub-dasha names
const SUB_DASHA_NAMES = ['Mahadasha', 'Antardasha', 'Pratyantardasha', 'Sookshmadasha', 'Pranadasha'];

/**
 * Calculate Pushya Paksha Ayanamsa
 */
function calculatePushyaPakshaAyanamsa(birthJD) {
  try {
    const deltaCancriResult = swisseph.swe_fixstar_ut("Asellus Australis", birthJD, swisseph.SEFLG_SWIEPH);
    
    if (deltaCancriResult && deltaCancriResult.longitude) {
      const deltaCancriLongitude = deltaCancriResult.longitude;
      const ayanamsa = deltaCancriLongitude - 106;
      
      console.log('Delta Cancri Longitude:', deltaCancriLongitude);
      console.log('Pushya Paksha Ayanamsa:', ayanamsa);
      
      return ayanamsa;
    } else {
      console.log('Failed to get Delta Cancri position, using fallback');
      return 22.42;
    }
  } catch (error) {
    console.log('Error calculating Pushya Paksha Ayanamsa:', error.message);
    return 22.42;
  }
}

/**
 * Get Moon's sidereal longitude
 */
function getMoonSiderealLongitude(birthJD, ayanamsaMode = 1) {
  const moonResult = swisseph.swe_calc_ut(birthJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
  const moonTropicalLongitude = moonResult.longitude;
  
  let ayanamsa;
  if (ayanamsaMode === 5) {
    ayanamsa = calculatePushyaPakshaAyanamsa(birthJD);
  } else {
    swisseph.swe_set_sid_mode(ayanamsaMode, 0, 0);
    const ayanamsaResult = swisseph.swe_get_ayanamsa_ut(birthJD);
    ayanamsa = ayanamsaResult;
  }
  
  const moonSiderealLongitude = moonTropicalLongitude - ayanamsa;
  return ((moonSiderealLongitude % 360) + 360) % 360;
}

/**
 * Get nakshatra index from sidereal longitude
 */
function getNakshatraIndex(siderealLongitude) {
  const nakLen = 360 / 27;
  return Math.floor(siderealLongitude / nakLen);
}

/**
 * Get dasha lord index from nakshatra index
 */
function getDashaLordIndex(nakIdx) {
  return nakIdx % 9;
}

/**
 * Calculate dasha balance (remaining portion of current nakshatra)
 */
function getDashaBalance(siderealLongitude) {
  const nakLen = 360 / 27;
  const posInNak = siderealLongitude % nakLen;
  const balance = 1 - (posInNak / nakLen);
  return balance;
}

/**
 * Calculate antardashas (sub-periods within mahadasha)
 */
function calculateAntardashas(mahadashaLord, mahadashaStart, mahadashaEnd, maxLevel = 5) {
  const antardashas = [];
  const mahadashaLordIdx = DASA_LORDS.indexOf(mahadashaLord);
  
  if (mahadashaLordIdx === -1) return antardashas;
  
  const mahadashaYears = DASA_YEARS[mahadashaLordIdx];
  let periodStart = mahadashaStart.clone();
  let lordIdx = mahadashaLordIdx;
  
  // Calculate 9 antardashas within the mahadasha
  for (let i = 0; i < 9; i++) {
    const antardashaYears = (DASA_YEARS[lordIdx] * mahadashaYears) / 120;
    const periodEnd = periodStart.clone().add(antardashaYears, 'years');
    
    const antardasha = {
      lord: DASA_LORDS[lordIdx],
      start: periodStart.clone(),
      end: periodEnd.clone(),
      type: 'Antardasha',
      duration: antardashaYears,
      children: []
    };
    
    // Calculate pratyantardashas if maxLevel > 2
    if (maxLevel > 2) {
      antardasha.children = calculatePratyantardashas(
        DASA_LORDS[lordIdx], 
        periodStart, 
        periodEnd, 
        maxLevel
      );
    }
    
    antardashas.push(antardasha);
    periodStart = periodEnd.clone();
    lordIdx = (lordIdx + 1) % 9;
  }
  
  return antardashas;
}

/**
 * Calculate pratyantardashas (sub-sub-periods within antardasha)
 */
function calculatePratyantardashas(antardashaLord, antardashaStart, antardashaEnd, maxLevel = 5) {
  const pratyantardashas = [];
  const antardashaLordIdx = DASA_LORDS.indexOf(antardashaLord);
  
  if (antardashaLordIdx === -1) return pratyantardashas;
  
  const antardashaYears = antardashaEnd.diff(antardashaStart, 'years', true);
  let periodStart = antardashaStart.clone();
  let lordIdx = antardashaLordIdx;
  
  for (let i = 0; i < 9; i++) {
    const pratyantarYears = (DASA_YEARS[lordIdx] * antardashaYears) / 120;
    const periodEnd = periodStart.clone().add(pratyantarYears, 'years');
    
    const pratyantardasha = {
      lord: DASA_LORDS[lordIdx],
      start: periodStart.clone(),
      end: periodEnd.clone(),
      type: 'Pratyantardasha',
      duration: pratyantarYears,
      children: []
    };
    
    // Calculate sookshmadashas if maxLevel > 3
    if (maxLevel > 3) {
      pratyantardasha.children = calculateSookshmadashas(
        DASA_LORDS[lordIdx], 
        periodStart, 
        periodEnd, 
        maxLevel
      );
    }
    
    pratyantardashas.push(pratyantardasha);
    periodStart = periodEnd.clone();
    lordIdx = (lordIdx + 1) % 9;
  }
  
  return pratyantardashas;
}

/**
 * Calculate sookshmadashas (sub-sub-sub-periods within pratyantardasha)
 */
function calculateSookshmadashas(pratyantardashaLord, pratyantardashaStart, pratyantardashaEnd, maxLevel = 5) {
  const sookshmadashas = [];
  const pratyantardashaLordIdx = DASA_LORDS.indexOf(pratyantardashaLord);
  
  if (pratyantardashaLordIdx === -1) return sookshmadashas;
  
  const pratyantarYears = pratyantardashaEnd.diff(pratyantardashaStart, 'years', true);
  let periodStart = pratyantardashaStart.clone();
  let lordIdx = pratyantardashaLordIdx;
  
  for (let i = 0; i < 9; i++) {
    const sookshmaYears = (DASA_YEARS[lordIdx] * pratyantarYears) / 120;
    const periodEnd = periodStart.clone().add(sookshmaYears, 'years');
    
    const sookshmadasha = {
      lord: DASA_LORDS[lordIdx],
      start: periodStart.clone(),
      end: periodEnd.clone(),
      type: 'Sookshmadasha',
      duration: sookshmaYears,
      children: []
    };
    
    // Calculate pranadashas if maxLevel > 4
    if (maxLevel > 4) {
      sookshmadasha.children = calculatePranadashas(
        DASA_LORDS[lordIdx], 
        periodStart, 
        periodEnd, 
        maxLevel
      );
    }
    
    sookshmadashas.push(sookshmadasha);
    periodStart = periodEnd.clone();
    lordIdx = (lordIdx + 1) % 9;
  }
  
  return sookshmadashas;
}

/**
 * Calculate pranadashas (sub-sub-sub-sub-periods within sookshmadasha)
 */
function calculatePranadashas(sookshmadashaLord, sookshmadashaStart, sookshmadashaEnd, maxLevel = 5) {
  const pranadashas = [];
  const sookshmadashaLordIdx = DASA_LORDS.indexOf(sookshmadashaLord);
  
  if (sookshmadashaLordIdx === -1) return pranadashas;
  
  const sookshmaYears = sookshmadashaEnd.diff(sookshmadashaStart, 'years', true);
  let periodStart = sookshmadashaStart.clone();
  let lordIdx = sookshmadashaLordIdx;
  
  for (let i = 0; i < 9; i++) {
    const pranaYears = (DASA_YEARS[lordIdx] * sookshmaYears) / 120;
    const periodEnd = periodStart.clone().add(pranaYears, 'years');
    
    const pranadasha = {
      lord: DASA_LORDS[lordIdx],
      start: periodStart.clone(),
      end: periodEnd.clone(),
      type: 'Pranadasha',
      duration: pranaYears,
      children: []
    };
    
    pranadashas.push(pranadasha);
    periodStart = periodEnd.clone();
    lordIdx = (lordIdx + 1) % 9;
  }
  
  return pranadashas;
}

/**
 * Calculate Vimshottari Dasha Tree - CORRECTED VERSION
 */
function calculateVimshottariDashaTree(birthDate, timezone, ayanamsaMode = 1, maxLevel = 5) {
  // Parse birth date and convert to Julian Day in UTC (like horoscope.js)
  const birthMoment = moment.tz(birthDate, timezone);
  const birthMomentUTC = birthMoment.clone().utc();
  const birthJD = swisseph.swe_julday(
    birthMomentUTC.year(),
    birthMomentUTC.month() + 1,
    birthMomentUTC.date(),
    birthMomentUTC.hour() + birthMomentUTC.minute()/60 + birthMomentUTC.second()/3600,
    swisseph.SE_GREG_CAL
  );
  
  console.log('=== CORRECTED Dasha Debug ===');
  console.log('Birth Date:', birthDate);
  console.log('Local Time:', birthMoment.format('YYYY-MM-DD HH:mm:ss'));
  console.log('UTC Time:', birthMomentUTC.format('YYYY-MM-DD HH:mm:ss'));
  console.log('Birth JD (UTC):', birthJD);
  
  // Step 1: Calculate Ayanamsa
  let ayanamsa;
  if (ayanamsaMode === 5) {
    ayanamsa = calculatePushyaPakshaAyanamsa(birthJD);
  } else {
    swisseph.swe_set_sid_mode(ayanamsaMode, 0, 0);
    ayanamsa = swisseph.swe_get_ayanamsa_ut(birthJD);
  }
  
  console.log('Ayanamsa Mode:', ayanamsaMode);
  console.log('Ayanamsa:', ayanamsa);
  
  // Step 2: Get Moon's sidereal longitude
  const moonSiderealLongitude = getMoonSiderealLongitude(birthJD, ayanamsaMode);
  console.log('Moon Sidereal Longitude:', moonSiderealLongitude);
  
  // Step 3: Identify Moon's nakshatra
  const nakIdx = getNakshatraIndex(moonSiderealLongitude);
  console.log('Nakshatra Index:', nakIdx);
  console.log('Nakshatra Name:', NAKSHATRA_NAMES[nakIdx]);
  
  // Step 4: Identify nakshatra lord (starting dasha lord)
  const dashaLordIdx = getDashaLordIndex(nakIdx);
  console.log('Dasha Lord Index:', dashaLordIdx);
  console.log('Dasha Lord:', DASA_LORDS[dashaLordIdx]);
  
  // Step 5: Calculate dasha balance (remaining portion)
  const dashaBalance = getDashaBalance(moonSiderealLongitude);
  const dashaYears = DASA_YEARS[dashaLordIdx];
  
  console.log('Dasha Balance:', dashaBalance);
  console.log('Dasha Years:', dashaYears);
  
  // Step 6: Calculate the actual dasha period for the starting dasha
  const actualDashaYears = dashaYears * dashaBalance;
  console.log('Actual Dasha Years (balance):', actualDashaYears);
  
  // Step 7: Calculate dasha start date (when the current dasha began)
  const elapsedYears = dashaYears * (1 - dashaBalance);
  const dashaStart = birthMoment.clone().subtract(elapsedYears, 'years');
  console.log('Dasha Start Date:', dashaStart.format('YYYY-MM-DD'));
  
  // Step 8: Build the complete 9-dasha sequence
  const tree = [];
  let periodStart = dashaStart.clone();
  let lordIdx = dashaLordIdx;
  
  for (let i = 0; i < 9; i++) {
    const periodYears = DASA_YEARS[lordIdx];
    const periodEnd = periodStart.clone().add(periodYears, 'years');
    
    const mahadasha = {
      lord: DASA_LORDS[lordIdx],
      start: periodStart.clone(),
      end: periodEnd.clone(),
      type: 'Mahadasha',
      duration: periodYears,
      children: []
    };
    
    // Calculate antardashas if maxLevel > 1
    if (maxLevel > 1) {
      mahadasha.children = calculateAntardashas(
        DASA_LORDS[lordIdx], 
        periodStart, 
        periodEnd, 
        maxLevel
      );
    }
    
    tree.push(mahadasha);
    periodStart = periodEnd.clone();
    lordIdx = (lordIdx + 1) % 9;
  }
  
  return {
    tree,
    moonSiderealLongitude,
    nakshatra: NAKSHATRA_NAMES[nakIdx],
    nakshatraIndex: nakIdx,
    dashaLord: DASA_LORDS[dashaLordIdx],
    dashaBalance: dashaBalance,
    dashaStart: dashaStart,
    ayanamsa: ayanamsa,
    elapsedYears: elapsedYears,
    actualDashaYears: actualDashaYears,
    totalDashaYears: dashaYears
  };
}

module.exports = { calculateVimshottariDashaTree }; 
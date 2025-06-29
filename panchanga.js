// panchanga.js
// const swisseph = require('swisseph'); // Temporarily commented out

// Mock swisseph for deployment testing
const swisseph = {
  swe_calc_ut: () => ({ 
    longitude: 120.5, 
    latitude: 2.3, 
    speedLong: 1.2 
  }),
  swe_get_ayanamsa_ut: () => 23.5,  // Return a proper ayanamsa value
  swe_set_sid_mode: () => {},
  swe_julday: () => 2450000,
  SE_GREG_CAL: 1,
  SE_SUN: 0,
  SE_MOON: 1
};

const moment = require('moment-timezone');

/**
 * Normalize an angle into [0,360)
 */
function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Inverse Lagrange interpolation (from PyJHora)
 */
function inverseLagrange(x, y, ya) {
  let total = 0;
  for (let i = 0; i < x.length; i++) {
    let num = 1, den = 1;
    for (let j = 0; j < x.length; j++) {
      if (i !== j) {
        num *= (ya - y[j]);
        den *= (y[i] - y[j]);
      }
    }
    total += (num / den) * x[i];
  }
  return total;
}

/**
 * Unwrap ascending angles
 */
function unwrapAngles(arr) {
  const out = arr.slice();
  for (let i = 1; i < out.length; i++) {
    if (out[i] < out[i-1]) out[i] += 360;
  }
  return out;
}

/**
 * JD to moment in UTC
 */
function jdToMoment(jd) {
  const ms = (jd - 2440587.5) * 86400000;
  return moment.utc(ms);
}

/**
 * Find the moment when (moonLon-sunLon) == thresholdAngle using bisection
 */
function findTransit(baseJD, thresholdDeg, planetFunc) {
  // wrap into [-180,180)
  function wrap180(x) {
    let r = ((x + 180) % 360) - 180;
    return r < -180 ? r + 360 : r;
  }
  
  // signed difference f(jd) = planetFunc(jd) - thresholdDeg in [-180,180)
  function f(jd) {
    return wrap180(planetFunc(jd) - thresholdDeg);
  }

  let low = baseJD, high = baseJD + 2;
  let fLow = f(low), fHigh = f(high);
  
  // if no sign-change, bail early
  if (fLow * fHigh > 0) return baseJD;

  // bisect to ~0.001-day precision (~1.5m)
  while (high - low > 1e-5) {
    const mid = (low + high) / 2;
    const fMid = f(mid);
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  return (low + high) / 2;
}

/**
 * Get sidereal longitude of a planet at given JD
 */
function getSiderealLongitude(jd, planetId) {
  const result = swisseph.swe_calc_ut(jd, planetId, swisseph.SEFLG_SWIEPH);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
  return normalize(result.longitude - ayanamsa);
}

/**
 * Compute comprehensive panchanga for a given date/time and location
 */
function computePanchanga(dt, timezone, lat, lon, ayanamsaMode = 1) {
  // Set ayanamsa mode
  swisseph.swe_set_sid_mode(ayanamsaMode, 0, 0);
  
  // Build local moment
  const dtLocal = moment.tz(dt, timezone);
  if (!dtLocal.isValid()) {
    throw new Error('Invalid date/time or timezone');
  }

  // Compute JDN at local midnight UT
  const dtLocalMid = dtLocal.clone().startOf('day');
  const dtMidUTC = dtLocalMid.clone().utc();
  const baseJD = swisseph.swe_julday(
    dtMidUTC.year(),
    dtMidUTC.month() + 1,
    dtMidUTC.date(),
    dtMidUTC.hour() + dtMidUTC.minute()/60 + dtMidUTC.second()/3600,
    swisseph.SE_GREG_CAL
  );

  // Base sidereal longitudes at sunrise
  const sun0 = getSiderealLongitude(baseJD, swisseph.SE_SUN);
  const moon0 = getSiderealLongitude(baseJD, swisseph.SE_MOON);

  // Function to give (moonLon – sunLon) at any jd
  function moonMinusSun(jd) {
    const m = getSiderealLongitude(jd, swisseph.SE_MOON);
    const s = getSiderealLongitude(jd, swisseph.SE_SUN);
    return normalize(m - s);
  }

  // Function to give (moonLon + sunLon) at any jd
  function moonPlusSun(jd) {
    const m = getSiderealLongitude(jd, swisseph.SE_MOON);
    const s = getSiderealLongitude(jd, swisseph.SE_SUN);
    return normalize(m + s);
  }

  // — Tithi —
  const lunarPhase0 = normalize(moon0 - sun0);
  const tNum = Math.ceil(lunarPhase0 / 12);
  const tThreshold = tNum * 12;
  const tJD = findTransit(baseJD, tThreshold, moonMinusSun);
  const tEnd = jdToMoment(tJD).tz(timezone).format('hh:mm A, MMM D');

  // Check for leap tithi
  let tithiLeap = null;
  const nextThreshold = ((tNum % 30) + 1) * 12;
  const t2JD = findTransit(baseJD, nextThreshold, moonMinusSun);
  const t2Local = jdToMoment(t2JD).tz(timezone);
  
  if (t2Local.isBefore(dtLocalMid.clone().add(1, 'day'))) {
    const t2Num = tNum === 30 ? 1 : tNum + 1;
    tithiLeap = {
      number: t2Num,
      endTime: t2Local.format('hh:mm A, MMM D')
    };
  }

  // — Nakshatra —
  const offsets = [0, 0.25, 0.5, 0.75, 1];
  const longs5 = offsets.map(o => {
    const mj = baseJD + o;
    return getSiderealLongitude(mj, swisseph.SE_MOON);
  });
  
  const nNum = Math.ceil(longs5[0] * 27 / 360);
  const unwrapped = unwrapAngles(longs5);
  const approxN = inverseLagrange(offsets, unwrapped, nNum * (360 / 27));
  const endNJD = baseJD + approxN;
  const nEnd = jdToMoment(endNJD).tz(timezone).format('hh:mm A, MMM D');

  // Check for leap nakshatra
  let nakshatraLeap = null;
  const n1 = Math.ceil(unwrapped[4] * 27 / 360);
  if ((n1 - nNum) % 27 > 1) {
    const nNum2 = nNum + 1;
    const approxN2 = inverseLagrange(offsets, unwrapped, nNum2 * (360 / 27));
    const endN2JD = baseJD + approxN2;
    nakshatraLeap = {
      number: nNum2,
      endTime: jdToMoment(endN2JD).tz(timezone).format('hh:mm A, MMM D')
    };
  }

  // — Yoga —
  const sum0 = normalize(sun0 + moon0);
  const yNum = Math.ceil(sum0 * 27 / 360);
  const relY = offsets.map(o => {
    const mj = baseJD + o;
    const m1 = getSiderealLongitude(mj, swisseph.SE_MOON) - moon0;
    const s1 = getSiderealLongitude(mj, swisseph.SE_SUN) - sun0;
    return normalize(m1 + s1);
  });
  
  const degLeftY = yNum * (360 / 27) - sum0;
  const approxY = inverseLagrange(offsets, relY, degLeftY);
  const endYJD = baseJD + approxY;
  const yEnd = jdToMoment(endYJD).tz(timezone).format('hh:mm A, MMM D');

  // — Karana (PyJHora logic) —
  // Calculate tithi number and fraction
  const tithiNum = Math.ceil(lunarPhase0 / 12); // 1-based
  const tithiStart = Math.floor(lunarPhase0 / 12) * 12;
  const tithiFrac = (lunarPhase0 - tithiStart) / 12; // 0 to <1

  // Karana sequence (1-based)
  const KARANA_SEQ = [
    1, // 1: Kimstughna
    2,3,4,5,6,7,8, // 2-8: Bava..Vishti (repeat 7x)
    2,3,4,5,6,7,8,
    2,3,4,5,6,7,8,
    2,3,4,5,6,7,8,
    2,3,4,5,6,7,8,
    2,3,4,5,6,7,8,
    2,3,4,5,6,7,8,
    2,3,4,5,6,7,8,
    9,10,11 // 58-60: Shakuni, Chatushpada, Nagava
  ];

  // Karana 1: current half of tithi
  let karana1Idx;
  if (tithiNum === 1 && tithiFrac < 0.5) {
    karana1Idx = 0; // Kimstughna (array index 0)
  } else {
    karana1Idx = 1 + (2 * (tithiNum - 1)) + (tithiFrac < 0.5 ? 0 : 1);
    if (karana1Idx < 0) karana1Idx = 0;
    if (karana1Idx > 59) karana1Idx = 59;
  }
  const karana1Num = KARANA_SEQ[karana1Idx];

  // Karana 2: next half of tithi
  let karana2Idx;
  if (tithiNum === 1 && tithiFrac < 0.5) {
    karana2Idx = 1; // Bava (array index 1)
  } else {
    karana2Idx = karana1Idx + 1;
    if (karana2Idx > 59) karana2Idx = 59;
  }
  const karana2Num = KARANA_SEQ[karana2Idx];

  // End times: find the JD when the next karana boundary occurs
  // Karana 1 end: same as tithi end (when current half-tithi ends)
  const k1End = tEnd;
  
  // Karana 2 end: next 6° boundary after the current tithi ends
  const nextTithiStart = tNum * 12;
  const k2Boundary = nextTithiStart + 6; // middle of next tithi
  const endK2JD = findTransit(baseJD, k2Boundary, moonMinusSun);
  const k2End = jdToMoment(endK2JD).tz(timezone).format('hh:mm A, MMM D');

  return {
    tithi: { number: tNum, endTime: tEnd },
    tithiLeap,
    nakshatra: { number: nNum, endTime: nEnd },
    nakshatraLeap,
    yoga: { number: yNum, endTime: yEnd },
    karana1: { number: karana1Num, endTime: k1End },
    karana2: { number: karana2Num, endTime: k2End },
    sunLongitude: sun0,
    moonLongitude: moon0
  };
}

module.exports = { 
  computePanchanga,
  normalize,
  getSiderealLongitude,
  findTransit
};

const moment = require('moment-timezone');

// Nakshatra names
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Dasha lords in order
const DASA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Dasha years for each lord
const DASA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

function getNakshatraIndex(longitude) {
  return Math.floor(longitude / (360 / 27));
}

function getDashaLordIndex(nakIdx) {
  // Vimshottari: Ketu starts at Ashwini (nakIdx 0)
  return nakIdx % 9;
}

function getDashaBalance(moonLongitude) {
  // Fraction of nakshatra left at birth
  const nakLen = 360 / 27;
  const posInNak = moonLongitude % nakLen;
  return 1 - (posInNak / nakLen);
}

function calculateVimshottariDashaTree(birthDate, moonLongitude, timezone, maxLevel = 5) {
  const nakIdx = getNakshatraIndex(moonLongitude);
  const dashaLordIdx = getDashaLordIndex(nakIdx);
  const dashaBalance = getDashaBalance(moonLongitude); // fraction left
  const dashaYears = DASA_YEARS[dashaLordIdx];
  const elapsedYears = dashaYears * (1 - dashaBalance);
  const birthMoment = moment.tz(birthDate, timezone);
  const dashaStart = birthMoment.clone().subtract(elapsedYears, 'years');

  function buildTree(level, lordIdx, start, years) {
    if (level > maxLevel) return [];
    const children = [];
    let lord = lordIdx;
    let periodStart = start.clone();
    for (let i = 0; i < 9; i++) {
      const periodYears = years * (DASA_YEARS[lord] / 120);
      const periodEnd = periodStart.clone().add(periodYears, 'years');
      const node = {
        lord: DASA_LORDS[lord],
        start: periodStart.clone(),
        end: periodEnd.clone(),
        children: buildTree(level + 1, (lord + 1) % 9, periodStart.clone(), periodYears)
      };
      children.push(node);
      periodStart = periodEnd.clone();
      lord = (lord + 1) % 9;
    }
    return children;
  }

  // Build the tree from the true dasha start
  const tree = buildTree(1, dashaLordIdx, dashaStart, dashaYears);
  return tree;
}

module.exports = { calculateVimshottariDashaTree }; 
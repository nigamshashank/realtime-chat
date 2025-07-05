const { calculateVimshottariDashaTree } = require('./dasha.js');

// Test with the same birth data as before
const birthDate = '1978-12-19 14:30:00';
const timezone = 'Asia/Kolkata';

console.log('=== Testing Fixed Dasha Calculation ===');
console.log('Birth Date:', birthDate);
console.log('Timezone:', timezone);

// Test with Lahiri Ayanamsa (Mode 1)
console.log('\n=== LAHIRI AYANAMSA (Mode 1) ===');
try {
  const dashaTree = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);
  console.log('Moon Sidereal Longitude:', dashaTree.moonSiderealLongitude.toFixed(2) + '°');
  console.log('Nakshatra:', dashaTree.nakshatra);
  console.log('Dasha Lord:', dashaTree.dashaLord);
  console.log('Dasha Balance:', dashaTree.dashaBalance.toFixed(4));
  console.log('Dasha Start:', dashaTree.dashaStart);
  console.log('Ayanamsa Used:', dashaTree.ayanamsa.toFixed(2) + '°');
  console.log('First Mahadasha:', dashaTree.dashaTree[0].lord);
  console.log('First Mahadasha Start:', dashaTree.dashaTree[0].start);
  console.log('First Mahadasha End:', dashaTree.dashaTree[0].end);
} catch (error) {
  console.log('Error with Lahiri:', error.message);
}

// Test with Pushya Paksha Ayanamsa (Mode 5)
console.log('\n=== PUSHYA PAKSHA AYANAMSA (Mode 5) ===');
try {
  const dashaTree = calculateVimshottariDashaTree(birthDate, timezone, 5, 5);
  console.log('Moon Sidereal Longitude:', dashaTree.moonSiderealLongitude.toFixed(2) + '°');
  console.log('Nakshatra:', dashaTree.nakshatra);
  console.log('Dasha Lord:', dashaTree.dashaLord);
  console.log('Dasha Balance:', dashaTree.dashaBalance.toFixed(4));
  console.log('Dasha Start:', dashaTree.dashaStart);
  console.log('Ayanamsa Used:', dashaTree.ayanamsa.toFixed(2) + '°');
  console.log('First Mahadasha:', dashaTree.dashaTree[0].lord);
  console.log('First Mahadasha Start:', dashaTree.dashaTree[0].start);
  console.log('First Mahadasha End:', dashaTree.dashaTree[0].end);
} catch (error) {
  console.log('Error with Pushya Paksha:', error.message);
} 
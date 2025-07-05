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
  console.log('Dasha Tree:', JSON.stringify(dashaTree, null, 2));
} catch (error) {
  console.log('Error with Lahiri:', error.message);
}

// Test with Pushya Paksha Ayanamsa (Mode 5)
console.log('\n=== PUSHYA PAKSHA AYANAMSA (Mode 5) ===');
try {
  const dashaTree = calculateVimshottariDashaTree(birthDate, timezone, 5, 5);
  console.log('Dasha Tree:', JSON.stringify(dashaTree, null, 2));
} catch (error) {
  console.log('Error with Pushya Paksha:', error.message);
} 
const { calculateVimshottariDashaTree } = require('./dasha-corrected.js');

// Test with the same birth data
const birthDate = '1978-12-19 14:30:00';
const timezone = 'Asia/Kolkata';

console.log('=== Testing CORRECTED Vimshottari Dasha System ===');
console.log('Birth Date:', birthDate);
console.log('Timezone:', timezone);

// Test with Lahiri Ayanamsa (Mode 1)
console.log('\n=== LAHIRI AYANAMSA (Mode 1) ===');
try {
  const dashaResult = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);
  
  console.log('\n=== KEY RESULTS ===');
  console.log('✅ Ayanamsa Mode:', 1, '(Lahiri)');
  console.log('✅ Ayanamsa Value:', dashaResult.ayanamsa.toFixed(2) + '°');
  console.log('✅ Moon Sidereal:', dashaResult.moonSiderealLongitude.toFixed(2) + '°');
  console.log('✅ Nakshatra:', dashaResult.nakshatra);
  console.log('✅ Dasha Lord:', dashaResult.dashaLord);
  console.log('✅ Dasha Balance:', (dashaResult.dashaBalance * 100).toFixed(2) + '%');
  console.log('✅ Total Dasha Years:', dashaResult.totalDashaYears);
  console.log('✅ Actual Dasha Years (balance):', dashaResult.actualDashaYears.toFixed(2));
  console.log('✅ Dasha Start Date:', dashaResult.dashaStart.format('YYYY-MM-DD'));
  
  console.log('\n=== MAHADASHA SEQUENCE ===');
  dashaResult.tree.forEach((mahadasha, index) => {
    const startDate = mahadasha.start.format('YYYY-MM-DD');
    const endDate = mahadasha.end.format('YYYY-MM-DD');
    console.log(`${index + 1}. ${mahadasha.lord}: ${startDate} to ${endDate} (${mahadasha.duration.toFixed(2)} years)`);
  });
  
  // Verify the first dasha has the correct balance
  const firstDasha = dashaResult.tree[0];
  console.log('\n=== FIRST DASHA VERIFICATION ===');
  console.log('First Dasha Lord:', firstDasha.lord);
  console.log('First Dasha Duration:', firstDasha.duration.toFixed(2), 'years');
  console.log('Expected Duration (balance):', dashaResult.actualDashaYears.toFixed(2), 'years');
  console.log('Duration Match:', Math.abs(firstDasha.duration - dashaResult.actualDashaYears) < 0.01);
  
  // Check if the sequence follows Vimshottari order
  console.log('\n=== VIMSHOTTARI SEQUENCE VERIFICATION ===');
  const expectedSequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const actualSequence = dashaResult.tree.map(d => d.lord);
  console.log('Expected Sequence:', expectedSequence);
  console.log('Actual Sequence:', actualSequence);
  
  // Find where the sequence starts
  const startIndex = expectedSequence.indexOf(dashaResult.dashaLord);
  const expectedOrder = [...expectedSequence.slice(startIndex), ...expectedSequence.slice(0, startIndex)];
  console.log('Expected Order from', dashaResult.dashaLord + ':', expectedOrder);
  console.log('Sequence Correct:', JSON.stringify(actualSequence) === JSON.stringify(expectedOrder));
  
} catch (error) {
  console.log('Error with Lahiri:', error.message);
} 
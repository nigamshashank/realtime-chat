const { calculateVimshottariDashaTree } = require('./dasha.js');

// Test with the specific birth data
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== TESTING FIXED DASHA CALCULATION ===');
console.log('Birth Date:', birthDate);
console.log('Timezone:', timezone);

try {
  const dashaResult = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);
  
  console.log('\n=== KEY RESULTS ===');
  console.log('✅ Ayanamsa Mode: 1 (Lahiri)');
  console.log('✅ Ayanamsa Value:', dashaResult.ayanamsa.toFixed(2) + '°');
  console.log('✅ Moon Sidereal:', dashaResult.moonSiderealLongitude.toFixed(2) + '°');
  console.log('✅ Nakshatra:', dashaResult.nakshatra);
  console.log('✅ Dasha Lord:', dashaResult.dashaLord);
  console.log('✅ Dasha Balance:', (dashaResult.dashaBalance * 100).toFixed(2) + '%');
  console.log('✅ Dasha Start Date:', dashaResult.dashaStart.format('YYYY-MM-DD'));
  
  console.log('\n=== MAHADASHA SEQUENCE (FIXED) ===');
  dashaResult.tree.forEach((mahadasha, index) => {
    const startDate = mahadasha.start.format('YYYY-MM-DD');
    const endDate = mahadasha.end.format('YYYY-MM-DD');
    const duration = mahadasha.duration;
    const isRunningAtBirth = index === 0;
    
    console.log(`${index + 1}. ${mahadasha.lord}: ${startDate} to ${endDate} (${duration.toFixed(2)} years)${isRunningAtBirth ? ' [Running at Birth]' : ''}`);
    
    // Show the balance for the first dasha
    if (index === 0) {
      const birthDate = '1978-01-03';
      const remainingYears = dashaResult.actualDashaYears;
      console.log(`   → At birth (${birthDate}), ${mahadasha.lord} dasha has ${remainingYears.toFixed(2)} years remaining`);
    }
  });
  
  // Verify the first dasha shows the full period
  const firstDasha = dashaResult.tree[0];
  console.log('\n=== FIRST DASHA VERIFICATION ===');
  console.log('First Dasha Lord:', firstDasha.lord);
  console.log('First Dasha Full Period:', firstDasha.duration.toFixed(2), 'years');
  console.log('First Dasha Start:', firstDasha.start.format('YYYY-MM-DD'));
  console.log('First Dasha End:', firstDasha.end.format('YYYY-MM-DD'));
  console.log('Birth Date:', '1978-01-03');
  console.log('Remaining at Birth:', dashaResult.actualDashaYears.toFixed(2), 'years');
  
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
  console.log('Error:', error.message);
} 
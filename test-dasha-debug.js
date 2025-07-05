const { calculateVimshottariDashaTree } = require('./dasha.js');

// Test with the specific birth data
const birthDate = '1978-12-19 14:30:00';
const timezone = 'Asia/Kolkata';

console.log('=== DEBUGGING DASHA TREE STRUCTURE ===');
const dashaResult = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);

console.log('\n=== DASHA TREE STRUCTURE ===');
dashaResult.tree.forEach((mahadasha, index) => {
  console.log(`\nMahadasha ${index + 1}: ${mahadasha.lord}`);
  console.log(`  Start: ${mahadasha.start}`);
  console.log(`  End: ${mahadasha.end}`);
  console.log(`  Duration: ${mahadasha.duration} years`);
  console.log(`  Type: ${mahadasha.type}`);
  
  if (mahadasha.children && mahadasha.children.length > 0) {
    console.log(`  Antardashas: ${mahadasha.children.length}`);
    mahadasha.children.forEach((antardasha, antIndex) => {
      console.log(`    Antardasha ${antIndex + 1}: ${antardasha.lord} - ${antardasha.duration.toFixed(2)} years`);
    });
  }
});

console.log('\n=== SUMMARY ===');
console.log(`First Mahadasha: ${dashaResult.tree[0].lord}`);
console.log(`First Mahadasha Duration: ${dashaResult.tree[0].duration} years`);
console.log(`First Mahadasha Start: ${dashaResult.tree[0].start}`);
console.log(`First Mahadasha End: ${dashaResult.tree[0].end}`);

// Test with Lahiri Ayanamsa (Mode 1)
console.log('\n=== LAHIRI AYANAMSA (Mode 1) ===');
try {
  const dashaResult = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);
  
  console.log('\n=== DETAILED ANALYSIS ===');
  console.log('✅ Ayanamsa Mode:', 1, '(Lahiri)');
  console.log('✅ Ayanamsa Value:', dashaResult.ayanamsa.toFixed(2) + '°');
  console.log('✅ Moon Sidereal:', dashaResult.moonSiderealLongitude.toFixed(2) + '°');
  console.log('✅ Nakshatra:', dashaResult.nakshatra);
  console.log('✅ Nakshatra Index:', dashaResult.nakshatraIndex);
  console.log('✅ Dasha Lord:', dashaResult.dashaLord);
  console.log('✅ Dasha Balance:', (dashaResult.dashaBalance * 100).toFixed(2) + '%');
  console.log('✅ Total Dasha Years:', dashaResult.totalDashaYears);
  console.log('✅ Actual Dasha Years (balance):', dashaResult.actualDashaYears.toFixed(2));
  console.log('✅ Dasha Start Date:', dashaResult.dashaStart.format('YYYY-MM-DD'));
  
  // Calculate expected balance for Chitra
  console.log('\n=== EXPECTED CALCULATION FOR CHITRA ===');
  const nakLen = 360 / 27; // 13.33° per nakshatra
  const padaLen = nakLen / 4; // 3.33° per pada
  console.log('Nakshatra length:', nakLen.toFixed(2) + '°');
  console.log('Pada length:', padaLen.toFixed(2) + '°');
  
  // Chitra is nakshatra 13 (0-indexed)
  const chitraStart = 13 * nakLen; // 173.33°
  const chitraEnd = chitraStart + nakLen; // 186.67°
  console.log('Chitra nakshatra range:', chitraStart.toFixed(2) + '° to ' + chitraEnd.toFixed(2) + '°');
  
  // Calculate all pada ranges
  const pada1Start = chitraStart; // 173.33°
  const pada1End = pada1Start + padaLen; // 176.67°
  const pada2Start = pada1End; // 176.67°
  const pada2End = pada2Start + padaLen; // 180.00°
  const pada3Start = pada2End; // 180.00°
  const pada3End = pada3Start + padaLen; // 183.33°
  const pada4Start = pada3End; // 183.33°
  const pada4End = pada4Start + padaLen; // 186.67°
  
  console.log('Pada 1 range:', pada1Start.toFixed(2) + '° to ' + pada1End.toFixed(2) + '°');
  console.log('Pada 2 range:', pada2Start.toFixed(2) + '° to ' + pada2End.toFixed(2) + '°');
  console.log('Pada 3 range:', pada3Start.toFixed(2) + '° to ' + pada3End.toFixed(2) + '°');
  console.log('Pada 4 range:', pada4Start.toFixed(2) + '° to ' + pada4End.toFixed(2) + '°');
  
  // If Moon is in pada 3, balance should be around 20%
  const moonPos = dashaResult.moonSiderealLongitude;
  console.log('Moon position:', moonPos.toFixed(2) + '°');
  
  if (moonPos >= chitraStart && moonPos < chitraEnd) {
    console.log('✅ Moon is in Chitra nakshatra');
    const posInNak = moonPos - chitraStart;
    console.log('Position within Chitra:', posInNak.toFixed(2) + '°');
    
    // Determine which pada
    let actualPada = 0;
    if (moonPos >= pada1Start && moonPos < pada1End) {
      actualPada = 1;
      console.log('✅ Moon is in Pada 1');
    } else if (moonPos >= pada2Start && moonPos < pada2End) {
      actualPada = 2;
      console.log('✅ Moon is in Pada 2');
    } else if (moonPos >= pada3Start && moonPos < pada3End) {
      actualPada = 3;
      console.log('✅ Moon is in Pada 3');
    } else if (moonPos >= pada4Start && moonPos < pada4End) {
      actualPada = 4;
      console.log('✅ Moon is in Pada 4');
    }
    
    // Calculate expected balance based on actual pada
    let expectedBalance = 0;
    if (actualPada === 1) {
      const posInPada = moonPos - pada1Start;
      const remainingInPada = padaLen - posInPada;
      expectedBalance = remainingInPada / nakLen;
    } else if (actualPada === 2) {
      const posInPada = moonPos - pada2Start;
      const remainingInPada = padaLen - posInPada;
      expectedBalance = remainingInPada / nakLen;
    } else if (actualPada === 3) {
      const posInPada = moonPos - pada3Start;
      const remainingInPada = padaLen - posInPada;
      expectedBalance = remainingInPada / nakLen;
    } else if (actualPada === 4) {
      const posInPada = moonPos - pada4Start;
      const remainingInPada = padaLen - posInPada;
      expectedBalance = remainingInPada / nakLen;
    }
    
    console.log('Actual pada:', actualPada);
    console.log('Expected balance:', (expectedBalance * 100).toFixed(2) + '%');
    console.log('Actual balance:', (dashaResult.dashaBalance * 100).toFixed(2) + '%');
    console.log('Difference:', Math.abs(expectedBalance - dashaResult.dashaBalance) * 100, '%');
    
    // Check if the calculation is correct
    const posInNakCalc = moonPos - chitraStart;
    const balanceCalc = 1 - (posInNakCalc / nakLen);
    console.log('Manual calculation - Position in nakshatra:', posInNakCalc.toFixed(2) + '°');
    console.log('Manual calculation - Balance:', (balanceCalc * 100).toFixed(2) + '%');
    
    // Show the correct interpretation
    console.log('\n=== CORRECT INTERPRETATION ===');
    console.log('Moon is at', moonPos.toFixed(2) + '° in Chitra nakshatra');
    console.log('Chitra spans', chitraStart.toFixed(2) + '° to ' + chitraEnd.toFixed(2) + '°');
    console.log('Moon has traversed', posInNakCalc.toFixed(2) + '° out of', nakLen.toFixed(2) + '°');
    console.log('Remaining portion:', (nakLen - posInNakCalc).toFixed(2) + '°');
    console.log('Balance as percentage:', ((nakLen - posInNakCalc) / nakLen * 100).toFixed(2) + '%');
    
  } else {
    console.log('❌ Moon is NOT in Chitra nakshatra');
    console.log('Moon should be between', chitraStart.toFixed(2) + '° and ' + chitraEnd.toFixed(2) + '°');
  }
  
} catch (error) {
  console.log('Error with Lahiri:', error.message);
} 
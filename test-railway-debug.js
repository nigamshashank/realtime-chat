const { calculateVimshottariDashaTree } = require('./dasha.js');

// Test with the same data that was working locally
const birthDate = '1979-06-16 15:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== RAILWAY DASHA TEST ===');
console.log('Birth Date:', birthDate);
console.log('Timezone:', timezone);

try {
  const dashaResult = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);
  
  console.log('\n=== DASHA TREE SUMMARY ===');
  console.log(`Total Mahadashas: ${dashaResult.tree.length}`);
  
  dashaResult.tree.forEach((mahadasha, index) => {
    console.log(`Mahadasha ${index + 1}: ${mahadasha.lord} - ${mahadasha.duration} years`);
  });
  
  // Check total duration
  let totalYears = 0;
  dashaResult.tree.forEach(mahadasha => {
    totalYears += mahadasha.duration;
  });
  
  console.log(`\nTotal Dasha Years: ${totalYears} years`);
  console.log(`Is 120 years? ${totalYears === 120 ? 'YES' : 'NO'}`);
  console.log(`First Mahadasha: ${dashaResult.tree[0].lord}`);
  console.log(`First Mahadasha Duration: ${dashaResult.tree[0].duration} years`);
  
  // Check if dates are properly formatted
  console.log(`\n=== DATE FORMAT CHECK ===`);
  console.log(`First Mahadasha Start: ${typeof dashaResult.tree[0].start} - ${dashaResult.tree[0].start}`);
  console.log(`First Mahadasha End: ${typeof dashaResult.tree[0].end} - ${dashaResult.tree[0].end}`);
  
  console.log('\n✅ Dasha calculation test completed successfully!');
  
} catch (error) {
  console.error('❌ Error in dasha calculation:', error);
  process.exit(1);
} 
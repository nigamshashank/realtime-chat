const { calculateVimshottariDashaTree } = require('./dasha');

// Test data
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== TESTING PRANADASHA GENERATION ===');
console.log('Birth Data:', birthDate);
console.log('Timezone:', timezone);
console.log('');

const result = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);

// Check if any sookshmadashas have children (pranadashas)
let sookshmadashaCount = 0;
let pranadashaCount = 0;

function countPranadashas(node, level = 1) {
  if (level === 4 && node.type === 'Sookshmadasha') {
    sookshmadashaCount++;
    if (node.children && node.children.length > 0) {
      pranadashaCount += node.children.length;
      console.log(`Sookshmadasha ${node.lord} has ${node.children.length} pranadashas`);
      node.children.forEach((prana, index) => {
        console.log(`  Pranadasha ${index + 1}: ${prana.lord} (${prana.start.format('YYYY-MM-DD')} to ${prana.end.format('YYYY-MM-DD')}) - ${prana.duration.toFixed(4)} years`);
      });
    }
  }
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => countPranadashas(child, level + 1));
  }
}

result.tree.forEach(mahadasha => countPranadashas(mahadasha));

console.log(`\nTotal Sookshmadashas: ${sookshmadashaCount}`);
console.log(`Total Pranadashas: ${pranadashaCount}`);

// Let's also check the duration of some sookshmadashas to see if they're too short
console.log('\n=== SOOKSHMADASHA DURATIONS ===');
let durationCount = 0;

function checkSookshmadashaDurations(node, level = 1) {
  if (level === 4 && node.type === 'Sookshmadasha') {
    durationCount++;
    if (durationCount <= 10) { // Show first 10
      console.log(`Sookshmadasha ${node.lord}: ${node.duration.toFixed(4)} years`);
    }
  }
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => checkSookshmadashaDurations(child, level + 1));
  }
}

result.tree.forEach(mahadasha => checkSookshmadashaDurations(mahadasha));

// Let's manually test pranadasha calculation for a specific sookshmadasha
console.log('\n=== MANUAL PRANADASHA TEST ===');
// Find a sookshmadasha with reasonable duration
let testSookshmadasha = null;

function findTestSookshmadasha(node, level = 1) {
  if (level === 4 && node.type === 'Sookshmadasha' && node.duration > 0.1) {
    testSookshmadasha = node;
    return;
  }
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => findTestSookshmadasha(child, level + 1));
  }
}

result.tree.forEach(mahadasha => findTestSookshmadasha(mahadasha));

if (testSookshmadasha) {
  console.log(`Testing Pranadasha calculation for: ${testSookshmadasha.lord} Sookshmadasha`);
  console.log(`Duration: ${testSookshmadasha.duration.toFixed(4)} years`);
  console.log(`Period: ${testSookshmadasha.start.format('YYYY-MM-DD')} to ${testSookshmadasha.end.format('YYYY-MM-DD')}`);
  console.log(`Children count: ${testSookshmadasha.children ? testSookshmadasha.children.length : 0}`);
  
  if (testSookshmadasha.children && testSookshmadasha.children.length > 0) {
    console.log('Pranadashas found:');
    testSookshmadasha.children.forEach((prana, index) => {
      console.log(`  ${index + 1}. ${prana.lord}: ${prana.duration.toFixed(4)} years`);
    });
  } else {
    console.log('No pranadashas found - duration might be too short');
  }
} 
const { calculateVimshottariDashaTree } = require('./dasha');

// Test data
const birthDate = '1978-01-03 19:35:00';
const timezone = 'Asia/Kolkata';

console.log('=== TESTING DASHA TREE LEVELS ===');
console.log('Birth Data:', birthDate);
console.log('Timezone:', timezone);
console.log('Max Level: 5 (should show all levels)');
console.log('');

const result = calculateVimshottariDashaTree(birthDate, timezone, 1, 5);

console.log('=== DASHA TREE STRUCTURE ===');
result.tree.forEach((mahadasha, mIndex) => {
  console.log(`\n${mIndex + 1}. ${mahadasha.lord} ${mahadasha.type} (${mahadasha.start.format('YYYY-MM-DD')} to ${mahadasha.end.format('YYYY-MM-DD')})`);
  
  if (mahadasha.children && mahadasha.children.length > 0) {
    mahadasha.children.forEach((antardasha, aIndex) => {
      console.log(`   ${mIndex + 1}.${aIndex + 1}. ${antardasha.lord} ${antardasha.type} (${antardasha.start.format('YYYY-MM-DD')} to ${antardasha.end.format('YYYY-MM-DD')})`);
      
      if (antardasha.children && antardasha.children.length > 0) {
        antardasha.children.forEach((pratyantardasha, pIndex) => {
          console.log(`      ${mIndex + 1}.${aIndex + 1}.${pIndex + 1}. ${pratyantardasha.lord} ${pratyantardasha.type} (${pratyantardasha.start.format('YYYY-MM-DD')} to ${pratyantardasha.end.format('YYYY-MM-DD')})`);
          
          if (pratyantardasha.children && pratyantardasha.children.length > 0) {
            pratyantardasha.children.forEach((sookshmadasha, sIndex) => {
              console.log(`         ${mIndex + 1}.${aIndex + 1}.${pIndex + 1}.${sIndex + 1}. ${sookshmadasha.lord} ${sookshmadasha.type} (${sookshmadasha.start.format('YYYY-MM-DD')} to ${sookshmadasha.end.format('YYYY-MM-DD')})`);
              
              if (sookshmadasha.children && sookshmadasha.children.length > 0) {
                sookshmadasha.children.forEach((pranadasha, prIndex) => {
                  console.log(`            ${mIndex + 1}.${aIndex + 1}.${pIndex + 1}.${sIndex + 1}.${prIndex + 1}. ${pranadasha.lord} ${pranadasha.type} (${pranadasha.start.format('YYYY-MM-DD')} to ${pranadasha.end.format('YYYY-MM-DD')})`);
                });
              }
            });
          }
        });
      }
    });
  }
});

// Count levels
console.log('\n=== LEVEL COUNTING ===');
let maxLevelFound = 0;
let levelCounts = {};

function countLevels(node, level = 1) {
  if (level > maxLevelFound) {
    maxLevelFound = level;
  }
  
  if (!levelCounts[level]) {
    levelCounts[level] = 0;
  }
  levelCounts[level]++;
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => countLevels(child, level + 1));
  }
}

result.tree.forEach(mahadasha => countLevels(mahadasha));

console.log('Maximum level found:', maxLevelFound);
console.log('Level counts:', levelCounts);

// Check if any nodes have children
console.log('\n=== CHILDREN CHECK ===');
result.tree.forEach((mahadasha, mIndex) => {
  console.log(`Mahadasha ${mIndex + 1} (${mahadasha.lord}): ${mahadasha.children ? mahadasha.children.length : 0} children`);
  
  if (mahadasha.children && mahadasha.children.length > 0) {
    mahadasha.children.forEach((antardasha, aIndex) => {
      console.log(`  Antardasha ${aIndex + 1} (${antardasha.lord}): ${antardasha.children ? antardasha.children.length : 0} children`);
      
      if (antardasha.children && antardasha.children.length > 0) {
        antardasha.children.forEach((pratyantardasha, pIndex) => {
          console.log(`    Pratyantardasha ${pIndex + 1} (${pratyantardasha.lord}): ${pratyantardasha.children ? pratyantardasha.children.length : 0} children`);
          
          if (pratyantardasha.children && pratyantardasha.children.length > 0) {
            pratyantardasha.children.forEach((sookshmadasha, sIndex) => {
              console.log(`      Sookshmadasha ${sIndex + 1} (${sookshmadasha.lord}): ${sookshmadasha.children ? sookshmadasha.children.length : 0} children`);
            });
          }
        });
      }
    });
  }
}); 
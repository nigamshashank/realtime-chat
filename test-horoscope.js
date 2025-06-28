// test-horoscope.js
const { calculateHoroscope } = require('./horoscope');

// Test horoscope calculation
function testHoroscope() {
  console.log('Testing Horoscope Calculation...\n');
  
  const testData = {
    name: 'Test User',
    dateOfBirth: '1990-06-15',
    timeOfBirth: '14:30',
    placeOfBirth: 'Mumbai, India',
    latitude: '19.0760N',
    longitude: '72.8777E',
    timezone: 'Asia/Kolkata',
    ayanamsa: 1 // Lahiri
  };
  
  try {
    console.log('Input Data:');
    console.log(JSON.stringify(testData, null, 2));
    
    const horoscope = calculateHoroscope(
      testData.name,
      testData.dateOfBirth,
      testData.timeOfBirth,
      testData.placeOfBirth,
      testData.latitude,
      testData.longitude,
      testData.timezone,
      testData.ayanamsa
    );
    
    console.log('\n=== Horoscope Results ===');
    console.log(`Name: ${horoscope.name}`);
    console.log(`Birth: ${horoscope.dateOfBirth} ${horoscope.timeOfBirth}`);
    console.log(`Place: ${horoscope.placeOfBirth}`);
    console.log(`Timezone: ${horoscope.timezone}`);
    
    console.log('\n=== Lagna (Ascendant) ===');
    console.log(`Sign: ${horoscope.lagna.sign} (${horoscope.lagna.signNumber})`);
    console.log(`Degree: ${horoscope.lagna.degree}° ${horoscope.lagna.minute}' ${horoscope.lagna.second}"`);
    console.log(`Longitude: ${horoscope.lagna.longitude.toFixed(2)}°`);
    
    console.log('\n=== Planetary Positions ===');
    for (const [planet, data] of Object.entries(horoscope.planets)) {
      const retrograde = data.isRetrograde ? ' (R)' : '';
      console.log(`${planet}: ${data.sign} ${data.degree}° ${data.minute}' ${data.second}"${retrograde}`);
    }
    
    console.log('\n=== Houses ===');
    horoscope.houses.forEach((house, index) => {
      console.log(`House ${house.number} (${house.name}): ${house.sign} ${house.degree}°`);
    });
    
    console.log('\n=== Chart Layout (Diamond Style) ===');
    horoscope.chart.houses.forEach((house, index) => {
      const planetNames = house.planets.map(p => p.name).join(', ');
      console.log(`House ${house.number} (${house.name}): ${house.sign} - Planets: [${planetNames || 'None'}]`);
    });
    
    console.log('\n=== Sample Aspects ===');
    let aspectCount = 0;
    for (const [planet1, aspects] of Object.entries(horoscope.chart.aspects)) {
      for (const [planet2, aspect] of Object.entries(aspects)) {
        if (aspectCount < 5) { // Show first 5 aspects
          console.log(`${planet1} → ${planet2}: ${aspect}`);
          aspectCount++;
        }
      }
    }
    
    console.log('\n✅ Horoscope calculation successful!');
    
  } catch (error) {
    console.error('❌ Horoscope calculation failed:', error.message);
  }
}

// Run the test
testHoroscope(); 
# Node.js Panchanga Calculator

A Node.js implementation of Vedic Panchanga calculation based on the PyJHora library. This project provides accurate calculations for the five essential elements of the Hindu almanac:

- **Tithi** (Lunar Day)
- **Nakshatra** (Lunar Mansion) 
- **Yoga** (Sun-Moon Combination)
- **Karana** (Half-Tithi)
- **Vaara** (Weekday)

## Features

- Real-time panchanga calculations via WebSocket
- Support for multiple ayanamsa modes (Lahiri, Raman, Krishnamurti, etc.)
- Accurate end-time calculations for all panchanga elements
- Leap tithi and nakshatra detection
- Sunrise and sunset calculations
- Modern web interface

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd realtime-chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Download Ephemeris Files:**
   
   **Important:** You need to download the Swiss Ephemeris files for accurate calculations.
   
   Download from: https://github.com/naturalstupid/pyjhora/tree/main/src/jhora/data/ephe
   
   Place all the `.se1` files in the `./ephe/` directory. The files you need are:
   - `seas_18.se1` (Sun)
   - `semo_18.se1` (Moon)
   - `sepl_18.se1` (Planets)
   - `seas_18.se1` (Asteroids)
   
   Or download the entire ephe directory:
   ```bash
   mkdir -p ephe
   cd ephe
   wget https://github.com/naturalstupid/pyjhora/raw/main/src/jhora/data/ephe/*.se1
   ```

4. **Start MongoDB** (optional, for logging):
   ```bash
   mongod
   ```

5. **Run the server:**
   ```bash
   node server.js
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. Enter your name
2. Select date and time
3. Choose your timezone
4. Enter latitude and longitude (e.g., "28.6139,77.2090" for Delhi)
5. Select ayanamsa mode (Lahiri is recommended)
6. Click "Calculate Panchanga"

## API

### WebSocket Events

**Client → Server:**
```javascript
socket.emit('calculatePanchanga', {
  user: 'Your Name',
  date: '2024-01-15',
  time: '12:00',
  timezone: 'Asia/Kolkata',
  place: '28.6139,77.2090',
  ayanamsa: '1'
});
```

**Server → Client:**
```javascript
socket.on('panchangaCalculated', data => {
  // data contains all panchanga elements
  console.log(data.tithi, data.nakshatra, data.yoga, data.karana1, data.karana2);
});
```

### Direct Function Call

```javascript
const { computePanchanga } = require('./panchanga');

const result = computePanchanga(
  '2024-01-15 12:00',  // date time string
  'Asia/Kolkata',      // timezone
  28.6139,             // latitude
  77.2090,             // longitude
  1                    // ayanamsa mode (1 = Lahiri)
);
```

## Ayanamsa Modes

- `0`: Fagan/Bradley
- `1`: Lahiri (recommended)
- `2`: DeLu
- `3`: Raman
- `4`: Krishnamurti
- `6`: ED50
- `7`: Dehant

## Dependencies

- `express`: Web server
- `socket.io`: Real-time communication
- `swisseph`: Swiss Ephemeris for astronomical calculations
- `moment-timezone`: Date/time handling
- `suncalc`: Sunrise/sunset calculations
- `mongoose`: MongoDB integration (optional)

## Testing

Run the test file to verify calculations:

```bash
node test-panchanga.js
```

## Accuracy

This implementation follows the same algorithms as PyJHora and should provide results within 1-2 minutes of the original software. The accuracy depends on:

- Quality of ephemeris files
- Ayanamsa mode selection
- Input precision (latitude/longitude)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is based on PyJHora which uses AGPL-3.0 license. Please respect the original author's work.

## Acknowledgments

- **PVR Narasimha Rao** for the original Vedic Astrology book and JHora software
- **PyJHora** project for the Python implementation
- **Swiss Ephemeris** for astronomical calculations

## Troubleshooting

**"Ephemeris files not found" error:**
- Ensure you've downloaded the `.se1` files to the `./ephe/` directory
- Check file permissions

**"Invalid date/time" error:**
- Verify timezone format (e.g., "America/New_York", "Asia/Kolkata")
- Check date format (YYYY-MM-DD)

**MongoDB connection error:**
- MongoDB is optional for logging. The app will work without it.
- Or install and start MongoDB if you want request logging. 
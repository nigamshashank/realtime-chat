// Load environment variables from .env file
require('dotenv').config();

// Debug: Print all possible MongoDB environment variables
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('MONGO_URL:', process.env.MONGO_URL);

// Temporary debug log to check environment variables
console.log('Environment variables check:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGODB') || key.includes('DB')));
console.log('All env vars:', Object.keys(process.env));

// server.js
const express    = require('express');
const http       = require('http');
const socketIo   = require('socket.io');
const moment     = require('moment-timezone');
const mongoose   = require('mongoose');
const swisseph   = require('swisseph');
const SunCalc    = require('suncalc');
const path       = require('path');
const session    = require('express-session');
const passport   = require('passport');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');

const { computePanchanga } = require('./panchanga');
const { calculateHoroscope } = require('./horoscope');
const Horoscope = require('./models/horoscope');
const User = require('./models/user');

// Import passport configuration
require('./config/passport');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server);

// ─── Setup Swiss Ephemeris ───────────────────────────────────────────────
swisseph.swe_set_ephe_path(path.join(__dirname, 'ephe'));

// ─── Session Configuration ───────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// ─── Passport Configuration ─────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─── Body Parser ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Logging (optional) ──────────────────────────────────────────
// Check for various possible MongoDB URI environment variables
const mongoUri = process.env.MONGODB_URI || 
                 process.env.DATABASE_URL || 
                 process.env.MONGO_URL ||
                 'mongodb://localhost:27017/realtime-chat';

console.log('Using MongoDB URI:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log('✅ MongoDB connected'))
  .catch(e=>console.error('❌ MongoDB error', e));

const reqSchema = new mongoose.Schema({
  user: String,
  date: String,
  time: String,
  timezone: String,
  place: String,
  ayanamsa: Number,
  requestedAt: Date
});
const HoroscopeRequest = mongoose.model('HoroscopeRequest', reqSchema);

// ─── Helper Mappings ─────────────────────────────────────────────────────
// Ayanāmsa modes
const AYANAMSA_MODES = {
  0: 'Fagan/Bradley',
  1: 'Lahiri',
  2: 'DeLu',
  3: 'Raman',
  4: 'Krishnamurti',
  6: 'ED50',
  7: 'Dehant'
};

// Weekday names
const WEEKDAY_NAMES = {
  Sunday:    'Ravivara',
  Monday:    'Somavara',
  Tuesday:   'Mangalavara',
  Wednesday: 'Budhavara',
  Thursday:  'Guruwara',
  Friday:    'Shukravara',
  Saturday:  'Shanivara'
};

// Zodiac signs (sidereal)
const ZODIAC_SIGNS = [
  'Mesha','Vrishabha','Mithuna','Karka',
  'Simha','Kanya','Tula','Vrischika',
  'Dhanus','Makara','Kumbha','Meena'
];

// Month names (amānta/pūrṇimānta)
const MONTH_NAMES = [
  'Chaitra','Vaishakha','Jyeshtha','Ashadha',
  'Shravana','Bhadrapada','Ashwin','Kartika',
  'Margashirsha','Paush','Magha','Phalguna'
];

// Tithi names (1–15)
const TITHI_NAMES = [
  'Pratipada','Dvitiya','Tritiya','Chaturthi','Panchami','Shashthi',
  'Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi',
  'Trayodashi','Chaturdashi','Purnima'
];

// Nakshatra names (1–27)
const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

// Yoga names (1–27)
const YOGA_NAMES = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman',
  'Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
  'Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha',
  'Shukla','Brahma','Indra','Vaidhruti'
];

// Karana names (1–11)
const KARANA_NAMES = [
  'Kimstughna','Bava','Balava','Kaulava','Taitila','Garaja',
  'Vanija','Vishti','Shakuni','Chatushpada','Nagava'
];

// ─── Authentication Routes ───────────────────────────────────────────────
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, displayName: req.user.displayName },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`/?token=${token}`);
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
        picture: req.user.picture
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ─── Protected API Routes ────────────────────────────────────────────────
app.get('/api/user/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.user._id,
    displayName: req.user.displayName,
    email: req.user.email,
    picture: req.user.picture,
    createdAt: req.user.createdAt,
    lastLogin: req.user.lastLogin
  });
});

// ─── Main Socket Handler ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('calculatePanchanga', async payload => {
    const { user, date, time, timezone, place, ayanamsa } = payload;
    const mode = parseInt(ayanamsa, 10);
    const ayanamsaUsed = AYANAMSA_MODES[mode] || `Mode ${mode}`;

    // Log request
    await new HoroscopeRequest({
      user, date, time, timezone, place, ayanamsa: mode, requestedAt: new Date()
    }).save().catch(()=>{});

    // Parse lat,lon
    const [lat, lon] = place.split(',').map(s => parseFloat(s.trim()));

    // Build local moment
    const dt = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', timezone);
    if (!dt.isValid()) {
      return socket.emit('errorMessage', 'Invalid date/time or timezone');
    }

    // Get sunrise & sunset
    const suncalcTimes = SunCalc.getTimes(dt.toDate(), lat, lon);
    const sunrise = moment(suncalcTimes.sunrise).tz(timezone).format('hh:mm A');
    const sunset  = moment(suncalcTimes.sunset).tz(timezone).format('hh:mm A');

    try {
      // Compute panchanga using the new module
      const panchanga = computePanchanga(`${date} ${time}`, timezone, lat, lon, mode);
      
      // Add names to the panchanga elements
      const tName = `${panchanga.tithi.number <= 15 ? 'Shukla ' : 'Krishna '}${TITHI_NAMES[(panchanga.tithi.number-1)%15]}`;
      const nName = NAKSHATRA_NAMES[(panchanga.nakshatra.number-1)%27];
      const yName = YOGA_NAMES[(panchanga.yoga.number-1)%27];
      const k1Name = KARANA_NAMES[(panchanga.karana1.number-1)%11];
      const k2Name = KARANA_NAMES[(panchanga.karana2.number-1)%11];

      // Add leap names if they exist
      let tithiLeap = null;
      if (panchanga.tithiLeap) {
        const t2Name = `${panchanga.tithiLeap.number <= 15 ? 'Shukla ' : 'Krishna '}${TITHI_NAMES[(panchanga.tithiLeap.number-1)%15]}`;
        tithiLeap = {
          number: panchanga.tithiLeap.number,
          name: t2Name,
          endTime: panchanga.tithiLeap.endTime
        };
      }

      let nakshatraLeap = null;
      if (panchanga.nakshatraLeap) {
        nakshatraLeap = {
          number: panchanga.nakshatraLeap.number,
          name: NAKSHATRA_NAMES[(panchanga.nakshatraLeap.number-1)%27],
          endTime: panchanga.nakshatraLeap.endTime
        };
      }

      // — Derived values — 
      const paksha = panchanga.tithi.number <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
      const weekday = WEEKDAY_NAMES[dt.format('dddd')] || dt.format('dddd');
      const sunSign = ZODIAC_SIGNS[Math.floor(panchanga.sunLongitude/30)];
      const moonSign = ZODIAC_SIGNS[Math.floor(panchanga.moonLongitude/30)];
      const amantaMonth = MONTH_NAMES[Math.floor(panchanga.sunLongitude/30)];
      const purnimantaMonth = MONTH_NAMES[(Math.floor(panchanga.sunLongitude/30)+1)%12];

      // — Emit everything — 
      socket.emit('panchangaCalculated', {
        user,
        date,
        time,
        timezone,
        place,
        ayanamsaUsed,
        sunrise,
        sunset,
        tithi: { 
          number: panchanga.tithi.number, 
          name: tName, 
          endTime: panchanga.tithi.endTime 
        },
        tithiLeap,
        nakshatra: { 
          number: panchanga.nakshatra.number, 
          name: nName, 
          endTime: panchanga.nakshatra.endTime 
        },
        nakshatraLeap,
        yoga: { 
          number: panchanga.yoga.number, 
          name: yName, 
          endTime: panchanga.yoga.endTime 
        },
        karana1: { 
          number: panchanga.karana1.number, 
          name: k1Name, 
          endTime: panchanga.karana1.endTime 
        },
        karana2: { 
          number: panchanga.karana2.number, 
          name: k2Name, 
          endTime: panchanga.karana2.endTime 
        },
        paksha,
        weekday,
        amantaMonth,
        purnimantaMonth,
        moonSign,
        sunSign
      });
    } catch (error) {
      console.error('Panchanga calculation error:', error);
      socket.emit('errorMessage', `Calculation error: ${error.message}`);
    }
  });

  // ─── Horoscope Calculation ─────────────────────────────────────────────
  socket.on('calculateHoroscope', async payload => {
    const { 
      name, dateOfBirth, timeOfBirth, placeOfBirth, 
      latitude, longitude, timezone, ayanamsa 
    } = payload;
    
    const mode = parseInt(ayanamsa, 10);
    const ayanamsaUsed = AYANAMSA_MODES[mode] || `Mode ${mode}`;

    try {
      console.log('Received horoscope payload:', payload);
      console.log('Latitude:', latitude, 'Type:', typeof latitude);
      console.log('Longitude:', longitude, 'Type:', typeof longitude);

      // Always calculate fresh horoscope (don't use cache since we need dashaTree)
      const horoscopeData = calculateHoroscope(
        name, dateOfBirth, timeOfBirth, placeOfBirth,
        latitude, longitude, timezone, mode, 5 // Always use max depth
      );

      console.log('Calculated horoscope data:', {
        latitude: horoscopeData.latitude,
        longitude: horoscopeData.longitude,
        hasDashaTree: !!horoscopeData.dashaTree,
        dashaTreeLength: horoscopeData.dashaTree ? horoscopeData.dashaTree.length : 0
      });

      // Save to MongoDB (without dashaTree since it's not in the schema)
      const horoscope = new Horoscope({
        name: horoscopeData.name,
        dateOfBirth: horoscopeData.dateOfBirth,
        timeOfBirth: horoscopeData.timeOfBirth,
        placeOfBirth: horoscopeData.placeOfBirth,
        latitude: horoscopeData.latitude,
        longitude: horoscopeData.longitude,
        timezone: horoscopeData.timezone,
        ayanamsaMode: mode,
        lagna: horoscopeData.lagna,
        planets: horoscopeData.planets,
        houses: horoscopeData.houses,
        chart: horoscopeData.chart,
        calculatedAt: horoscopeData.calculatedAt
      });
      
      await horoscope.save();

      // Emit the calculated horoscope with dashaTree
      socket.emit('horoscopeCalculated', {
        ...horoscopeData,
        ayanamsaUsed,
        isCached: false
      });

    } catch (error) {
      console.error('Horoscope calculation error:', error);
      socket.emit('errorMessage', `Horoscope calculation error: ${error.message}`);
    }
  });

  // ─── Get Saved Horoscopes ─────────────────────────────────────────────
  socket.on('getSavedHoroscopes', async () => {
    try {
      const horoscopes = await Horoscope.find()
        .sort({ createdAt: -1 })
        .select('name dateOfBirth timeOfBirth placeOfBirth calculatedAt');
      
      console.log(`Fetched ${horoscopes.length} saved horoscopes from database`);
      
      socket.emit('savedHoroscopes', horoscopes);
    } catch (error) {
      console.error('Error fetching saved horoscopes:', error);
      socket.emit('errorMessage', 'Error fetching saved horoscopes');
    }
  });

  // ─── Get Specific Horoscope ───────────────────────────────────────────
  socket.on('getHoroscope', async (horoscopeId) => {
    try {
      const horoscope = await Horoscope.findById(horoscopeId);
      if (horoscope) {
        socket.emit('horoscopeRetrieved', horoscope);
      } else {
        socket.emit('errorMessage', 'Horoscope not found');
      }
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      socket.emit('errorMessage', 'Error fetching horoscope');
    }
  });

  // ─── Delete Horoscope ─────────────────────────────────────────────────
  socket.on('deleteHoroscope', async (horoscopeId) => {
    try {
      console.log(`Attempting to delete horoscope with ID: ${horoscopeId}`);
      
      const horoscope = await Horoscope.findById(horoscopeId);
      if (!horoscope) {
        console.log(`Horoscope not found with ID: ${horoscopeId}`);
        socket.emit('deleteError', 'Horoscope not found');
        return;
      }

      const horoscopeName = horoscope.name;
      console.log(`Found horoscope to delete: ${horoscopeName}`);
      
      const deleteResult = await Horoscope.findByIdAndDelete(horoscopeId);
      console.log(`Delete result:`, deleteResult);
      
      if (deleteResult) {
        socket.emit('horoscopeDeleted', `Deleted horoscope for: ${horoscopeName}`);
        console.log(`Horoscope deleted successfully: ${horoscopeName} (ID: ${horoscopeId})`);
      } else {
        socket.emit('deleteError', 'Failed to delete horoscope');
        console.log(`Failed to delete horoscope with ID: ${horoscopeId}`);
      }
    } catch (error) {
      console.error('Error deleting horoscope:', error);
      socket.emit('deleteError', error.message);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

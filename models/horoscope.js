const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
  // User reference (optional for unauthenticated users)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // User details
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Birth details
  dateOfBirth: {
    type: String,
    required: true
  },
  timeOfBirth: {
    type: String,
    required: true
  },
  placeOfBirth: {
    type: String,
    required: true,
    trim: true
  },
  
  // Location details
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  
  // Calculation parameters
  ayanamsaMode: {
    type: Number,
    default: 5, // Pushya Paksha
    enum: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  
  // Calculated chart data
  lagna: {
    longitude: Number,
    sign: String,
    signNumber: Number,
    degree: Number,
    minute: Number,
    second: Number
  },
  
  planets: {
    type: Map,
    of: {
      longitude: Number,
      latitude: Number,
      speed: Number,
      sign: String,
      signNumber: Number,
      degree: Number,
      minute: Number,
      second: Number,
      isRetrograde: Boolean
    }
  },
  
  houses: [{
    number: Number,
    name: String,
    longitude: Number,
    sign: String,
    signNumber: Number,
    degree: Number
  }],
  
  chart: {
    houses: [{
      number: Number,
      name: String,
      sign: String,
      planets: [{
        name: String,
        longitude: Number,
        latitude: Number,
        speed: Number,
        sign: String,
        signNumber: Number,
        degree: Number,
        minute: Number,
        second: Number,
        isRetrograde: Boolean
      }]
    }],
    aspects: {
      type: Map,
      of: Map
    }
  },
  
  // Metadata
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Optional fields for future use
  notes: {
    type: String,
    trim: true
  },
  
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient queries - name should be unique globally
horoscopeSchema.index({ name: 1 }, { unique: true });
horoscopeSchema.index({ name: 1, dateOfBirth: 1 });
horoscopeSchema.index({ calculatedAt: -1 });

// Virtual for formatted birth date
horoscopeSchema.virtual('birthDateTime').get(function() {
  return `${this.dateOfBirth} ${this.timeOfBirth}`;
});

// Method to get chart summary
horoscopeSchema.methods.getChartSummary = function() {
  return {
    name: this.name,
    birthDateTime: this.birthDateTime,
    placeOfBirth: this.placeOfBirth,
    lagna: this.lagna,
    planets: Object.fromEntries(this.planets),
    houses: this.houses
  };
};

// Static method to find by name and birth date
horoscopeSchema.statics.findByBirthDetails = function(name, dateOfBirth, timeOfBirth) {
  return this.findOne({
    name: name,
    dateOfBirth: dateOfBirth,
    timeOfBirth: timeOfBirth
  });
};

// Static method to find by name (for upsert operations)
horoscopeSchema.statics.findByName = function(name) {
  return this.findOne({
    name: name
  });
};

const Horoscope = mongoose.model('Horoscope', horoscopeSchema);

module.exports = Horoscope; 
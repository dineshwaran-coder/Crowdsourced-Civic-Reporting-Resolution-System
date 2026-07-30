const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data directory and file exist for JSON fallback
function ensureJSONDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], reports: [] }, null, 2));
  }
}

// JSON Database Helper
class JSONModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  _read() {
    ensureJSONDb();
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return { users: [], reports: [] };
    }
  }

  _write(data) {
    ensureJSONDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const data = this._read();
    let results = data[this.collectionName] || [];
    
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => {
        return (acc && acc[part] !== undefined) ? acc[part] : undefined;
      }, obj);
    };

    // Simple filter matching
    return results.filter(item => {
      for (let key in query) {
        const val = getNestedValue(item, key);
        // Handle simple arrays, nested properties, regex, or exact match
        if (query[key] instanceof RegExp) {
          if (!query[key].test(val)) return false;
        } else if (typeof query[key] === 'object' && query[key] !== null) {
          // Handle simple $ne, $in, $or if needed
          if (query[key].$ne !== undefined && val === query[key].$ne) return false;
          if (query[key].$in !== undefined && !query[key].$in.includes(val)) return false;
        } else if (val !== query[key]) {
          return false;
        }
      }
      return true;
    }).map(item => ({ ...item, id: item._id })); // Map _id to id for mongoose compatibility
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(docData) {
    const data = this._read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...docData
    };
    if (!data[this.collectionName]) {
      data[this.collectionName] = [];
    }
    data[this.collectionName].push(newDoc);
    this._write(data);
    return { ...newDoc, id: newDoc._id };
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = this._read();
    const list = data[this.collectionName] || [];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    const current = list[index];
    const updatedFields = typeof update.$set === 'object' ? update.$set : update;
    
    list[index] = {
      ...current,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    
    this._write(data);
    return { ...list[index], id: list[index]._id };
  }
}

// Check fallback state
let isFallbackMode = false;
let dbInstance = null;

const connectDB = async () => {
  if (process.env.MONGO_URI) {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000 // Time out quickly if unreached
      });
      console.log('🟢 Connected to MongoDB Atlas successfully.');
      isFallbackMode = false;
      return true;
    } catch (err) {
      console.error('🔴 MongoDB Atlas connection failed. Falling back to local JSON database.');
      isFallbackMode = true;
      ensureJSONDb();
      return false;
    }
  } else {
    console.warn('🟡 MONGO_URI not configured. Operating in local JSON fallback database mode.');
    isFallbackMode = true;
    ensureJSONDb();
    return false;
  }
};

// Define Mongoose Schemas (used in Atlas Mode)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'official'], default: 'citizen' },
  department: { type: String, default: null } // Electricity, Sanitation, Road, Water, Forestry, etc.
}, { timestamps: true });

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Pothole, Garbage, Streetlight, Sewage, etc.
  imageUrl: { type: String, default: null },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' }
  },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  citizen: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  officialComment: { type: String, default: '' },
  resolutionImageUrl: { type: String, default: null },
  history: [
    {
      status: { type: String },
      updatedBy: { type: String },
      comment: { type: String },
      updatedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// Export Models
let UserExport;
let ReportExport;

// Proxy wrapper to switch backend dynamically
const userProxy = {
  find: (...args) => isFallbackMode ? new JSONModel('users').find(...args) : mongoose.model('User', UserSchema).find(...args),
  findOne: (...args) => isFallbackMode ? new JSONModel('users').findOne(...args) : mongoose.model('User', UserSchema).findOne(...args),
  findById: (...args) => isFallbackMode ? new JSONModel('users').findById(...args) : mongoose.model('User', UserSchema).findById(...args),
  create: (...args) => isFallbackMode ? new JSONModel('users').create(...args) : mongoose.model('User', UserSchema).create(...args),
  findByIdAndUpdate: (...args) => isFallbackMode ? new JSONModel('users').findByIdAndUpdate(...args) : mongoose.model('User', UserSchema).findByIdAndUpdate(...args)
};

const reportProxy = {
  find: (...args) => isFallbackMode ? new JSONModel('reports').find(...args) : mongoose.model('Report', ReportSchema).find(...args),
  findOne: (...args) => isFallbackMode ? new JSONModel('reports').findOne(...args) : mongoose.model('Report', ReportSchema).findOne(...args),
  findById: (...args) => isFallbackMode ? new JSONModel('reports').findById(...args) : mongoose.model('Report', ReportSchema).findById(...args),
  create: (...args) => isFallbackMode ? new JSONModel('reports').create(...args) : mongoose.model('Report', ReportSchema).create(...args),
  findByIdAndUpdate: (...args) => isFallbackMode ? new JSONModel('reports').findByIdAndUpdate(...args) : mongoose.model('Report', ReportSchema).findByIdAndUpdate(...args)
};

module.exports = {
  connectDB,
  User: userProxy,
  Report: reportProxy,
  getIsFallbackMode: () => isFallbackMode
};

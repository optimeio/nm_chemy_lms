const realMongoose = require('mongoose');
const mockMongoose = require('./mockMongoose');

let activeMongoose = realMongoose;

const handler = {
  get(target, prop) {
    if (prop === 'useMock') {
      return () => {
        activeMongoose = mockMongoose;
        console.warn('🔁 Switched to mock database mode using Backend/db.json');
      };
    }
    if (prop === 'useReal') {
      return () => {
        activeMongoose = realMongoose;
        console.warn('🔁 Switched to real MongoDB mongoose');
      };
    }
    if (prop === 'isMock') {
      return () => activeMongoose === mockMongoose;
    }
    if (prop === 'getActive') {
      return () => activeMongoose;
    }
    
    // Get the actual value from active mongoose
    const value = activeMongoose[prop];
    
    // If it's a nested object like Schema, we need to handle it specially
    if (prop === 'Schema' && value) {
      // Ensure Schema.Types.ObjectId is available
      if (!value.Types) {
        value.Types = { ObjectId: String };
      }
      // Return Schema directly without binding
      return value;
    }
    
    // Only bind actual functions, not classes/constructors
    if (typeof value === 'function' && prop !== 'Schema' && prop !== 'model') {
      return value.bind(activeMongoose);
    }
    return value;
  },
  apply(target, thisArg, args) {
    if (typeof activeMongoose === 'function') {
      return activeMongoose.apply(thisArg, args);
    }
    throw new TypeError('mongoose is not callable');
  },
  has(target, prop) {
    if (prop === 'useMock' || prop === 'isMock' || prop === 'getActive') {
      return true;
    }
    return prop in activeMongoose;
  }
};

const mongooseProxy = new Proxy(realMongoose, handler);
module.exports = mongooseProxy;

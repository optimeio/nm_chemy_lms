const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Helper to load and save DB data
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// Simple unique ID generator
function generateId() {
  return 'mock_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

function matchDoc(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (let key in query) {
    let val = query[key];
    let docVal = doc[key];
    
    // Handle conversions for comparisons
    if (docVal && typeof docVal === 'object' && docVal.toString) {
      docVal = docVal.toString();
    }
    if (val && typeof val === 'object' && val.toString) {
      val = val.toString();
    }
    
    if (docVal !== val) return false;
  }
  return true;
}

class MockDocument {
  constructor(modelName, data) {
    this._modelName = modelName;
    
    if (!data._id) {
      this._id = generateId();
    } else {
      this._id = data._id.toString();
    }
    
    Object.assign(this, data);
    
    // Pre-populate fields
    if (modelName === 'User') {
      if (!this.cart) this.cart = [];
      if (!this.waitlist) this.waitlist = [];
      if (!this.status) this.status = 'active';
      if (this.isVerified === undefined) this.isVerified = false;
    }
    if (!this.createdAt) this.createdAt = new Date().toISOString();
  }

  async save() {
    const db = loadDB();
    if (!db[this._modelName]) db[this._modelName] = [];
    
    const idx = db[this._modelName].findIndex(d => d._id === this._id);
    const plainDoc = {};
    for (let key in this) {
      if (key !== '_modelName' && typeof this[key] !== 'function') {
        plainDoc[key] = this[key];
      }
    }
    
    if (idx !== -1) {
      db[this._modelName][idx] = plainDoc;
    } else {
      db[this._modelName].push(plainDoc);
    }
    
    saveDB(db);
    return this;
  }

  toJSON() {
    const plainDoc = {};
    for (let key in this) {
      if (key !== '_modelName' && typeof this[key] !== 'function') {
        plainDoc[key] = this[key];
      }
    }
    return plainDoc;
  }
}

class MockQuery {
  constructor(promise) {
    this.promise = promise;
  }
  
  sort(sortObj) {
    this.promise = this.promise.then(docs => {
      if (!Array.isArray(docs)) return docs;
      const key = Object.keys(sortObj)[0];
      const order = sortObj[key]; // 1 or -1
      return [...docs].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        if (typeof valA === 'string' && !isNaN(Date.parse(valA))) valA = new Date(valA).getTime();
        if (typeof valB === 'string' && !isNaN(Date.parse(valB))) valB = new Date(valB).getTime();
        
        if (valA < valB) return order === -1 ? 1 : -1;
        if (valA > valB) return order === -1 ? -1 : 1;
        return 0;
      });
    });
    return this;
  }

  select(selectStr) {
    this.promise = this.promise.then(docs => {
      const projectDoc = (doc) => {
        if (!doc) return doc;
        const copy = { ...doc };
        if (typeof selectStr === 'string') {
          const parts = selectStr.split(' ');
          for (let part of parts) {
            if (part.startsWith('-')) {
              delete copy[part.substring(1)];
            }
          }
        }
        return copy;
      };
      if (Array.isArray(docs)) {
        return docs.map(projectDoc);
      }
      return projectDoc(docs);
    });
    return this;
  }

  limit(limitNum) {
    this.promise = this.promise.then(docs => {
      if (!Array.isArray(docs)) return docs;
      return docs.slice(0, limitNum);
    });
    return this;
  }

  then(onResolve, onReject) {
    return this.promise.then(onResolve, onReject);
  }

  catch(onReject) {
    return this.promise.catch(onReject);
  }
}

function createModelClass(modelName) {
  return class Model extends MockDocument {
    constructor(data) {
      super(modelName, data);
    }

    static find(query) {
      const promise = Promise.resolve().then(() => {
        const db = loadDB();
        const list = db[modelName] || [];
        const filtered = list.filter(doc => matchDoc(doc, query));
        return filtered.map(d => new Model(d));
      });
      return new MockQuery(promise);
    }

    static findOne(query) {
      const promise = Promise.resolve().then(() => {
        const db = loadDB();
        const list = db[modelName] || [];
        const found = list.find(doc => matchDoc(doc, query));
        return found ? new Model(found) : null;
      });
      return new MockQuery(promise);
    }

    static findById(id) {
      const promise = Promise.resolve().then(() => {
        const db = loadDB();
        const list = db[modelName] || [];
        const found = list.find(doc => doc._id === id.toString());
        return found ? new Model(found) : null;
      });
      return new MockQuery(promise);
    }

    static findByIdAndDelete(id) {
      const promise = Promise.resolve().then(() => {
        const db = loadDB();
        const list = db[modelName] || [];
        const foundIdx = list.findIndex(doc => doc._id === id.toString());
        if (foundIdx !== -1) {
          const removed = list.splice(foundIdx, 1)[0];
          saveDB(db);
          return new Model(removed);
        }
        return null;
      });
      return new MockQuery(promise);
    }

    static findByIdAndUpdate(id, update, options) {
      const promise = Promise.resolve().then(() => {
        const db = loadDB();
        const list = db[modelName] || [];
        const found = list.find(doc => doc._id === id.toString());
        if (found) {
          Object.assign(found, update);
          saveDB(db);
          return new Model(found);
        }
        return null;
      });
      return new MockQuery(promise);
    }

    static async insertMany(arr) {
      const db = loadDB();
      if (!db[modelName]) db[modelName] = [];
      const docs = arr.map(item => {
        const doc = new Model(item);
        const plainDoc = {};
        for (let key in doc) {
          if (key !== '_modelName' && typeof doc[key] !== 'function') {
            plainDoc[key] = doc[key];
          }
        }
        db[modelName].push(plainDoc);
        return doc;
      });
      saveDB(db);
      return docs;
    }

    static async deleteMany(query) {
      const db = loadDB();
      const list = db[modelName] || [];
      const remaining = [];
      let deletedCount = 0;
      for (let doc of list) {
        if (matchDoc(doc, query)) {
          deletedCount++;
        } else {
          remaining.push(doc);
        }
      }
      db[modelName] = remaining;
      saveDB(db);
      return { deletedCount };
    }

    static countDocuments(query) {
      const promise = Promise.resolve().then(() => {
        const db = loadDB();
        const list = db[modelName] || [];
        return list.filter(doc => matchDoc(doc, query)).length;
      });
      return new MockQuery(promise);
    }
  };
}

class Schema {
  constructor(definition) {
    this.definition = definition;
  }
  index() {}
  pre() {}
  post() {}
  plugin() {}
}

Schema.Types = {
  ObjectId: String
};

const models = {};

function model(name, schema) {
  if (!schema) {
    return models[name];
  }
  if (!models[name]) {
    models[name] = createModelClass(name);
  }
  return models[name];
}

const connection = {
  db: {
    listCollections() {
      return {
        toArray: async () => {
          const db = loadDB();
          return Object.keys(db).map(name => ({ name }));
        }
      };
    },
    collection(name) {
      return {
        countDocuments: async () => {
          const db = loadDB();
          return (db[name] || []).length;
        }
      };
    }
  },
  on(event, cb) {
    if (event === 'connected') {
      setTimeout(cb, 10);
    }
    return this;
  },
  once(event, cb) {
    if (event === 'connected') {
      setTimeout(cb, 10);
    }
    return this;
  }
};

function connect(uri) {
  console.log('🔌 [Mock Mongoose] Connected to mock database file:', DB_FILE);
  return Promise.resolve(connection);
}

module.exports = {
  Schema,
  model,
  connect,
  connection,
  Types: {
    ObjectId: function(id) {
      return id || generateId();
    }
  },
  set(key, value) {}
};

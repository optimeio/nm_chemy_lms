const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

console.log('Collections in db:', Object.keys(db));
const supportQueries = db.SupportQuery || [];
console.log(`Total Support Queries: ${supportQueries.length}`);
console.log('Last 5 Support Queries:', JSON.stringify(supportQueries.slice(-5), null, 2));

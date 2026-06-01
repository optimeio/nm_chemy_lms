const http = require('http');

const data = JSON.stringify({
  response: 'Hello, this is a test response from the admin.'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/support/mock_m95iz57ngmnd9x2c/respond',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();

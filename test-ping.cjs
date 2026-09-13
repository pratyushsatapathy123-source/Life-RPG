const http = require('http');

http.get('http://localhost:3000/api/health', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Ping Response:', res.statusCode, data));
}).on('error', (e) => console.error(e));

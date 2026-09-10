const https = require('https');
const fs = require('fs');
https.get('https://www.codechef.com/users/tourist', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch/codechef.html', data);
    console.log('Saved to codechef.html');
  });
});

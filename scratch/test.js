const https = require('https');
https.get('https://www.codechef.com/users/tourist', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.slice(0, 500));
    const match = data.match(/rating-number[^>]*>(\d+)/) || data.match(/rating"[^>]*>(\d+)/) || data.match(/(\d+)<\/div>[^<]*<div[^>]*>Rating/i);
    console.log("Match:", match ? match[1] : 'Not found');
  });
});

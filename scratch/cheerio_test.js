const cheerio = require('cheerio');
fetch('https://www.codechef.com/users/tourist', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  }
}).then(r => r.text()).then(html => {
  const $ = cheerio.load(html);
  const rating = $('.rating-number').first().text().trim();
  console.log('Cheerio found rating:', rating || 'not found');
});

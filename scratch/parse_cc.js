const cheerio = require('cheerio');
const html = require('fs').readFileSync('codechef_real.html', 'utf8');
const $ = cheerio.load(html);
console.log('Rating:', $('.rating-number').first().text().trim());
console.log('Stars:', $('.rating-star').text().trim());
console.log('Solved Text:', $('h5').filter((i, el) => $(el).text().includes('Fully Solved')).text());

// CodeChef often puts total solved in an H5 like "Fully Solved (123)"
const fullySolvedMatch = html.match(/Fully Solved \s*\((\d+)\)/i);
if (fullySolvedMatch) {
  console.log('Solved Regex:', fullySolvedMatch[1]);
} else {
  // Check other places
  const solvedText = $('h5:contains("Fully Solved")').text();
  console.log('Solved contains:', solvedText);
  const match2 = solvedText.match(/\((\d+)\)/);
  if (match2) console.log('Solved match 2:', match2[1]);
}

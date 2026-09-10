import { fetchCodechefStats } from '../src/services/platforms/codechef';

async function main() {
  try {
    const res = await fetchCodechefStats('tourist');
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

main();

import 'dotenv/config';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function verify(username: string) {
   const rawKey = `raw:analysis:${username.toLowerCase()}`;
   const scoredKey = `analysis:${username.toLowerCase()}`;

   const rawData = await redis.get(rawKey);
   const scoredData = await redis.get(scoredKey);

   console.log(`--- Checking Cache for: ${username} ---`);
   console.log(`Scored Profile Found: ${!!scoredData}`);
   console.log(`Raw GitHub Data Found: ${!!rawData}`);
   if (rawData) {
    console.log(`Total Repos in Raw Cache: ${rawData.repos?.length}`);
   }
}

verify('chiragagg5k');
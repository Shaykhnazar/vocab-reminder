// scripts/setup-schedules.mjs
import { Client } from '@upstash/qstash';

const qstash = new Client({
  token: process.env.QSTASH_TOKEN
});

async function setupSchedules() {
  try {
    // Create a schedule to run every 5 minutes
    const schedule = await qstash.schedules.create({
      destination: `${process.env.VERCEL_URL}/api/cron/process-notifications`,
      cron: '*/5 * * * *', // Every 5 minutes
    });

    console.log('Schedule created:', schedule);
  } catch (error) {
    console.error('Error setting up schedule:', error);
  }
}

setupSchedules();

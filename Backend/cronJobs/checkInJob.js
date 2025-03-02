const cron = require('node-cron');
const FeelingUnsafe = require('../model/FeelingUnsafe');
const { triggerTwilioCall } = require('../utils/Twilio');

const checkInJob = cron.schedule('* * * * *', async () => {
  console.log('Running check-in job...');

  const now = new Date();
  const sessions = await FeelingUnsafe.find({ active: true });

  const callPromises = sessions.map(async (session) => {
    const lastCheckIn = new Date(session.lastCheckIn);
    const nextCheckInTime = new Date(lastCheckIn.getTime() + session.interval * 60000);

    if (now >= nextCheckInTime) {
      await triggerTwilioCall(session.phone);
      session.lastCheckIn = now;
      return session.save(); // Return save promise
    }
  });

  await Promise.all(callPromises); 
});

module.exports = checkInJob;

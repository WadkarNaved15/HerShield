const express = require('express');
const router = express.Router();
const FeelingUnsafe = require('../model/FeelingUnsafe');

const { verifyAccessToken } = require('../utils/jwt');

router.get('/', async (req, res) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer')) {
      return res.status(401).json({ error: "Unauthorized" });
  }

  try {
      const extractedToken = token.split(' ')[1];
      const decoded = verifyAccessToken(extractedToken);
      const userId = decoded._id;

      const session = await FeelingUnsafe.findOne({ user_id: userId });

      if (session) {
          return res.status(200).json({ message: 'Feeling Unsafe mode is active.', session });
      } else {
          return res.status(200).json({ message: 'Feeling Unsafe mode is inactive.' });
      }
  } catch (error) {
      console.error("Error checking Feeling Unsafe status:", error);
      return res.status(500).json({ error: 'Failed to check Feeling Unsafe mode status.' });
  }
});


router.post('/startFeelingUnsafe', async (req, res) => {
    console.log(req.body);
    const { interval } = req.body;
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({ error: "Unauthorized" });
    if (token && token.startsWith('Bearer')) {
        const extractedToken = token.split(' ')[1]; 
        const decoded = verifyAccessToken(extractedToken);
        console.log("decoded",decoded);
        const phone = decoded.phoneNumber;
    try {
      let session = await FeelingUnsafe.findOne({ phone });
  
      if (session) {
        session.interval = interval;
        session.active = true;
        session.lastCheckIn = new Date();
      } else {
        session = new FeelingUnsafe({user_id: decoded._id, phone, interval });
      }
  
      await session.save();
      res.status(200).json({ message: 'Feeling Unsafe mode activated.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to activate Feeling Unsafe mode.' });
    }
}else{
    return res.status(401).json({ error: "Unauthorized" });
}
  });
  
  // ✅ Update Interval
  router.post('/updateFeelingUnsafe', async (req, res) => {
    try {
      const { interval } = req.body;
      const token = req.headers.authorization;
  
      if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      // Extract and verify token
      const extractedToken = token.split(' ')[1];
      const decoded = verifyAccessToken(extractedToken);
      if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
  
      const userId = decoded._id; // Ensure it's the correct field
  
      // Find session
      const session = await FeelingUnsafe.findOne({ user_id: userId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
  
      // Update interval
      session.interval = interval;
      await session.save();
  
      res.status(200).json({ message: 'Interval updated successfully.' });
    } catch (error) {
      console.error('Error updating interval:', error);
      res.status(500).json({ error: 'Failed to update interval.' });
    }
  });
  
  // ✅ Stop Feeling Unsafe Mode
  router.post('/stopFeelingUnsafe', async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      // Extract and verify token
      const extractedToken = token.split(' ')[1];
      const decoded = verifyAccessToken(extractedToken);
      if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
  
      const userId = decoded._id; // Ensure correct field name
  
      // Find session
      const session = await FeelingUnsafe.findOne({ user_id: userId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
  
      // Deactivate session
      session.active = false;
      await session.save();
  
      res.status(200).json({ message: 'Feeling Unsafe mode deactivated.' });
    } catch (error) {
      console.error('Error stopping Feeling Unsafe mode:', error);
      res.status(500).json({ error: 'Failed to deactivate Feeling Unsafe mode.' });
    }
  });
module.exports = router;
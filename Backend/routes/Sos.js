const express = require('express');
const User = require('../model/Users');
const SOS = require('../model/Sos');
const { getNearestUsers, getUserLocation } = require('../utils/location');
const { verifyAccessToken } = require('../utils/jwt');
const {getFcmToken} = require('../utils/users');
const { haversine } = require('../utils/Sos');
const client = require('../utils/Redis');

const router = express.Router();

router.post("/send-sos", async (req, res) => {
    const {longitude ,latitude } = req.body;
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({ error: "Unauthorized" });
    if (token && token.startsWith('Bearer')) {
        const extractedToken = token.split(' ')[1]; 
        const decoded = verifyAccessToken(extractedToken);
        const userId = decoded._id;
    const location = await getUserLocation(userId);
    if (!userId) return res.status(400).json({ error: "User ID required" });


    if (!longitude || !latitude) return res.status(404).json({ error: "No location found" });

    const users = await getNearestUsers(location.latitude, location.longitude);
    console.log("users",users);
    if (!users.length) {
        console.log("No nearby users found");
        return [];
      }
  
      // Extract user IDs
      const userIds = users.map(user => user.userId);
  
      // Fetch FCM tokens from Redis for these users
      const tokens = await client.hmget("fcm_tokens", userIds);
  
      // Filter out any null or undefined tokens
      const validTokens = tokens.filter(token => token !== null);
  
      console.log("FCM Tokens of Nearby Users:", validTokens);
    res.json({ success: true, message: "SOS Sent", users });
    }else{
        return res.status(401).json({ error: "Unauthorized" });
    }
});

module.exports = router;

const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { Telegraf } = require('telegraf');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); 
// এখানে তোমার Firebase service account JSON ফাইল থাকবে

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-real-time-calling-app-default-rtdb.firebaseio.com"
});

const db = admin.database();

const app = express();
const bot = new Telegraf('8367516207:AAG6uKkLQffJyGkBPPJCU6YUilh-qcaUhfU'); 
// এখানে তোমার আসল বট টোকেন বসাবে

app.use(bodyParser.json());

// Endpoint for chat messages
app.post('/chat', (req, res) => {
  const { userId, message } = req.body;
  
  db.ref('messages/').push({
    userId: userId,
    message: message,
    timestamp: Date.now()
  }).then(() => {
    res.status(200).send("Message stored.");
  }).catch((error) => {
    console.error("Error storing message:", error);
    res.status(500).send("Error storing message.");
  });
});

// Telegram Bot handler
bot.start((ctx) => ctx.reply('Welcome! How can I assist you?'));

bot.on('text', (ctx) => {
  const userMessage = ctx.message.text;
  const userId = ctx.message.from.id;

  db.ref('telegramMessages/').push({
    userId: userId,
    message: userMessage,
    timestamp: Date.now()
  });

  ctx.reply('Your message has been received!');
});

// Start the bot
bot.launch();

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

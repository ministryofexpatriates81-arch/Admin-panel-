const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { Telegraf } = require('telegraf');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Replace with your service account JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<your-database-name>.firebaseio.com" // Replace with your database URL
});

const db = admin.database();
const app = express();
const bot = new Telegraf('<YOUR_TELEGRAM_BOT_TOKEN>'); // Replace with your Telegram Bot Token

app.use(bodyParser.json());

// Endpoint for chat messages
app.post('/chat', (req, res) => {
  const { userId, message } = req.body;
  
  // Store the message in Firebase
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

  // Store the message in Firebase when a user sends a message via Telegram
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

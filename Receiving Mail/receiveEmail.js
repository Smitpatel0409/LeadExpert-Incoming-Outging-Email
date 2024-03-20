const express = require('express');
const { MailListener } = require('mail-listener6');
const connectMongoDB = require('./db'); // Import MongoDB connection function
const path = require('path');

const app = express();
const mailListener = new MailListener({
    username: "ENTER YOUR EMAIL ID",
    password: "ENTER YOUR EMAIL APP PASSWORD",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    connTimeout: 10000,
    authTimeout: 5000,
    debug: console.log,
    tlsOptions: { rejectUnauthorized: false },
    mailbox: "INBOX",
    searchFilter: ["UNSEEN"],
    markSeen: true,
    fetchUnreadOnStart: true,
    attachments: true,
    attachmentOptions: { directory: "attachments/" }
});

app.use(express.static('public'));

// Start the MailListener and MongoDB connection
async function startServer() {
    try {
        const db = await connectMongoDB(); // Connect to MongoDB

        await mailListener.start(); // Start MailListener

        mailListener.on("server:connected", function(){
            console.log("IMAP server connected");
        });

        mailListener.on("mailbox", function(mailbox){
            console.log("Total number of mails: ", mailbox.messages.total);
        });

        mailListener.on("server:disconnected", function(){
            console.log("IMAP server disconnected");
        });

        mailListener.on("error", function(err){
            console.log("Error:", err);
        });

        mailListener.on("mail", async function(mail, seqno) {
            console.log("Received new email:", mail.subject);
            console.log("From:", mail.from);
            console.log("Body:", mail.text);

            // Store the email in the MongoDB collection
            await db.collection('emails').insertOne(mail);
        });

        // Define the '/inbox' endpoint to handle requests for email data
        app.get('/inbox', async (req, res) => {
            // Retrieve emails from MongoDB
            const emails = await db.collection('emails').find().toArray();
            res.json(emails);
        });

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'inbox.html'));
        });

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
} 

startServer(); // Start the server

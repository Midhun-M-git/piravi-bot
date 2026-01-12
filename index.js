const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');

// --- WEB SERVER FOR QR CODE ---
const app = express();
const port = process.env.PORT || 3000;
let qrCodeData = "";

app.get('/', (req, res) => {
    if (qrCodeData) {
        res.send(`
            <html>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f0f0f0;">
                    <div style="text-align:center;">
                        <h1>Scan this QR Code</h1>
                        <img src="${qrCodeData}" alt="QR Code" style="width:300px; height:300px; border:10px solid white;">
                        <p>Refresh if it expires.</p>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send('<html><body><h1>Bot is running!</h1><p>Bot is active and listening.</p></body></html>');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// --- BOT SETUP ---
let eventData = {};
try {
    eventData = JSON.parse(fs.readFileSync('./data/events.json', 'utf8'));
} catch (err) {
    console.error("Error loading event data:", err);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED (Scan in Terminal or Web):');
    require('qrcode-terminal').generate(qr, { small: true });
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) qrCodeData = url;
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
    qrCodeData = "";
});

client.on('message', async msg => {
    try {
        const contact = await msg.getContact();
        const senderName = contact.pushname || contact.number;
        const lowerMsg = msg.body.toLowerCase().trim();

        console.log(`Received from ${senderName}: ${msg.body}`);

        // GREETING
        if (lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'menu' || lowerMsg === 'start' || lowerMsg === 'help') {
            await msg.react('👋');
            const menu = `Hello ${senderName}! 👋 Welcome to *${eventData.event_name}*.\n\n` +
                `Here is the menu:\n` +
                `📌 *Info* \n` +
                `📅 *Schedule* \n` +
                `🛠️ *Workshops* \n` +
                `📞 *Contact* \n\n` +
                `_Type one of the options above to get details._\n\n` +
                `🚀 Powered by *https://www.novustech.in/*`;

            await client.sendMessage(msg.from, menu);
        }

        // --- COMMANDS ---

        else if (lowerMsg === 'info' || lowerMsg === 'event info' || lowerMsg === '!info') {
            await msg.react('📌');
            const info = `*Event:* ${eventData.event_name}\n` +
                `*Description:* ${eventData.description}\n` +
                `*Ticket:* ${eventData.ticket_price}\n` +
                `*Location:* ${eventData.location}\n` +
                `*Website:* ${eventData.website}`;
            msg.reply(info);
        }

        else if (lowerMsg === 'schedule' || lowerMsg === '!schedule') {
            await msg.react('📅');
            msg.reply(`📅 *Dates:* ${eventData.dates.join(' & ')}\n\n*Day 1:* Hacking WS, Talk Session, Food Fest, Cultural Night\n*Day 2:* Hackathon, 3D Printing, Robotics, Closing Ceremony.`);
        }

        else if (lowerMsg === 'workshops' || lowerMsg === 'workshop' || lowerMsg === '!workshops') {
            await msg.react('🛠️');
            let response = `🛠️ *Workshops & Events:*\n\n`;
            eventData.workshops.forEach(ws => {
                response += `🔹 *${ws.title}*\n${ws.description}\n\n`;
            });
            msg.reply(response);
        }

        else if (lowerMsg === 'contact' || lowerMsg === 'contact us' || lowerMsg === '!contact') {
            await msg.react('📞');
            let response = `📞 *Contact Team:*\n\n`;
            eventData.contact.forEach(c => {
                response += `👤 ${c}\n`;
            });
            msg.reply(response);
        }

    } catch (err) {
        console.error("Error handling message:", err);
    }
});

client.initialize();

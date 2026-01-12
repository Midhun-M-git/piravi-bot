# Piravi Event WhatsApp Bot

## Setup
Dependencies should already be installed. If not, run:
```bash
npm install
```

## Running the Bot
1. Open a terminal in this directory.
2. Run the bot:
   ```bash
   node index.js
   ```
3. A QR code will appear in the terminal.
4. Open WhatsApp on your phone, go to **Linked Devices** > **Link a Device**, and scan the QR code.
5. The bot will log "Client is ready!" when connected.

## Editing Event Data
To update the event description, schedule, or workshops, edit the `data/events.json` file. The bot will need to be restarted to pick up changes (Ctrl+C to stop, then run `node index.js` again).

## Commands
- `!info`: Event details
- `!schedule`: Dates and schedule
- `!workshops`: List of workshops
- `!website`: Website link

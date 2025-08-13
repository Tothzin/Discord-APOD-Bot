# Discord NASA APOD Bot

A Discord bot that automatically sends NASA's Astronomy Picture of the Day (APOD) to configured channels.

## Features

- ✅ Sends APOD daily at 10:00 AM
- ✅ Supports both images and videos
- ✅ Dynamic channel configuration (no hardcoding)
- ✅ Commands to manage channels
- ✅ Works across multiple servers
- ✅ Always includes links for videos
- ✅ Manual APOD sending commands

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file with:
   ```
   DISCORD_TOKEN=your_bot_token
   NASA_API_KEY=your_nasa_api_key
   ```

3. **Enable Message Content Intent:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your bot application
   - Go to **Bot** section
   - Enable **Message Content Intent** under Privileged Gateway Intents
   - Save changes

4. **Run the bot:**
   ```bash
   npx ts-node bot.ts
   ```

## Commands

### `!apod setup`
Configures the current channel to receive daily APOD.
- **Required permission:** Manage Channels
- **Usage:** Type `!apod setup` in the channel where you want to receive images

### `!apod remove`
Removes the current channel from the APOD list.
- **Required permission:** Manage Channels
- **Usage:** Type `!apod remove` in the configured channel

### `!apod send`
Sends APOD immediately to all configured channels.
- **Usage:** Type `!apod send` to send APOD right now

### `!apod test`
Tests APOD sending (same as `!apod send`).
- **Usage:** Type `!apod test` to test the functionality

### `!apod status`
Shows the status of configured channels.
- **Usage:** Type `!apod status` to see information

## How it works

1. **Dynamic configuration:** The bot no longer needs a hardcoded channel. Use `!apod setup` in any channel where the bot has permissions.

2. **Multi-server support:** The bot can be used in multiple servers simultaneously.

3. **Media handling:**
   - **Images:** Sent as file attachment + link
   - **Videos:** Only link is sent (no attachment)
   - **Others:** Only link is sent

4. **Scheduling:** APOD is automatically sent daily at 10:00 AM.

## Required Permissions

The bot needs the following permissions:
- Send Messages
- Attach Files
- Read Message History
- Use Slash Commands (if applicable)

## Problems Solved

- ✅ **Video links:** Now always includes the link when it's a video
- ✅ **Dynamic channels:** No longer need to hardcode channel IDs
- ✅ **Multiple servers:** Works in any server where it's invited
- ✅ **Manual sending:** Added commands to send APOD on demand

## Getting API Keys

### Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** section
4. Create a bot and copy the token

### NASA API Key
1. Go to [NASA API Portal](https://api.nasa.gov/)
2. Sign up for a free API key
3. Copy the generated key

## Inviting the Bot

Use this URL (replace `YOUR_BOT_CLIENT_ID` with your bot's client ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=2048&scope=bot
```

## Troubleshooting

- **"Used disallowed intents" error:** Enable Message Content Intent in Discord Developer Portal
- **Commands not working:** Make sure the bot has proper permissions and Message Content Intent is enabled
- **APOD not sending:** Check if channels are configured with `!apod status`

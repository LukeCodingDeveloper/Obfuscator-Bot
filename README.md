# Discord Code Obfuscator Bot

A Discord bot that obfuscates code in various programming languages.

## Supported Languages
- JavaScript/JS (.js)
- CSS (.css)
- HTML (.html, .htm)
- Lua (.lua)

## System Requirements
- Node.js Version 16.9.0 or higher
- Discord.js v14
- npm or yarn

## Installation

1. Install Node.js (minimum version 16.9.0)
2. Clone this repository
3. Run `npm install` to install dependencies
4. Configure the bot in `config.json`:
   - Add your Discord Bot Token
   - Add allowed channel IDs
   - Optional: Adjust settings
5. Start the bot with `npm start`

## Configuration

The `config.json` contains the following settings:

```json
{
    "token": "YOUR_DISCORD_BOT_TOKEN",
    "allowedChannels": [
        "CHANNEL_ID_1",
        "CHANNEL_ID_2"
    ],
    "settings": {
        "timeout": 30000,
        "tempDir": "temp"
    }
}
```

### Settings in Detail:
- `token`: Your Discord Bot Token
- `allowedChannels`: Array of channel IDs where the bot should be active
- `settings.timeout`: Maximum wait time for user input in milliseconds (default: 30000)
- `settings.tempDir`: Directory for temporary files (default: "temp")

### How to find Channel ID?
1. Enable Developer Mode in Discord (Settings > App Settings > Advanced > Developer Mode)
2. Right-click on the desired channel
3. Select "Copy ID"

## Usage

You have several options to obfuscate code:

### Option 1: Direct Language Commands
1. Enter one of the following commands in an allowed Discord channel:
   - `!js` or `!javascript` for JavaScript
   - `!css` for CSS
   - `!html` for HTML
   - `!lua` for Lua
2. Upload a file or paste the code
3. The bot will return your obfuscated file

### Option 2: Universal Command
1. Enter `!obfuscator` in an allowed Discord channel
2. Select the desired programming language
3. Upload a file or paste the code
4. The bot will return your obfuscated file

## Features
- File upload support
- Automatic language detection based on file extension
- Improved error handling
- No automatic mentions in responses
- Temporary files are automatically deleted
- Detailed error logging

## Notes
- The bot only responds in configured channels
- Input timeout can be adjusted in config.json
- Invalid syntax or errors will display an error message
- The obfuscated file is automatically returned with the correct file extension
- Supported file extensions: .js, .css, .html, .htm, .lua
- The bot uses the latest Discord.js features and best practices

## Support
For questions or issues, you can contact me on Discord:
- Discord Name: luke.official
- Support Server: [Discord Server](https://discord.gg/kXf3G9DMPt)

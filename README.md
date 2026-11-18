# CoopEconomy

**CoopEconomy** adds a virtual currency, wallet and bank, earning activities, a shop, inventories and optional gambling games to a Discord server.

## Features

- Wallet, bank, balance transfers and net-worth summaries
- Daily and weekly rewards, work, salary, begging, search and other earning activities
- Shop, item purchases, inventories and item transfers
- Leaderboards, wealth ranks and economy statistics
- Games such as coinflip, dice, slots, blackjack and roulette
- Owner-controlled currency and balance administration
- Utility and fun commands

## Requirements

- Node.js 22 or newer
- A Discord application and bot token
- The `bot` and `applications.commands` OAuth2 scopes

CoopEconomy uses slash commands. Message Content Intent is not required.

## Setup

```bash
npm install
cp .env.example .env
```

Configure:

```env
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
DEV_GUILD_ID=
OWNER_IDS=
LOG_CHANNEL_ID=
CURRENCY_NAME=Coins
STARTING_BALANCE=100
DATABASE_URL=
```

## Register slash commands

For a test server, set `DEV_GUILD_ID` and run:

```bash
npm run check:commands
npm run register:guild
```

For global registration:

```bash
npm run deploy
```

Then run:

```bash
npm start
```

## Example commands

`/balance`, `/daily`, `/weekly`, `/work`, `/pay`, `/deposit`, `/withdraw`, `/shop`, `/buy`, `/inventory`, `/leaderboard`, and `/coinflip`.

Use `/help` in Discord for the live command list.

## Project structure

- `commands/slash/` — economy, gambling, utility and fun commands
- `handlers/` — interaction and ready-event handlers
- `utils/` — economy data, settings, formatting and logging helpers
- `deploy-commands.js` — command schema validation and registration

## Notes

- Never commit your bot token or other secrets.
- Review the economy's starting balance, currency name, cooldowns and game settings before opening the bot to members.
- Set clear server rules for gambling-style commands and virtual currency.

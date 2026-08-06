<div align="center">

# 💰 CoopEconomy

### The all-in-one Discord economy & gambling bot with **71 slash commands** + **41 prefix commands**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Discord.js](https://img.shields.io/badge/discord.js-14-blueviolet.svg)](https://discord.js.org)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](#)

</div>

CoopEconomy brings a full **virtual economy** to your Discord server. Members earn currency through daily rewards, work, searching, and claiming salaries — then spend it in the shop, barn it in the bank, or risk it all in a variety of gambling games. Admins have full control with money management commands. Available as both **slash commands** and **prefix commands**.

---

## 📦 Features

- 💵 **Wallet & Bank** — separate wallet and bank with deposit/withdraw
- 🏆 **Leaderboard** — track the richest members
- 💼 **Earn Money** — daily, weekly, salary, work, beg, search, crime
- 🛒 **Shop & Inventory** — buy items, give items, manage inventory
- 🎰 **Gambling** — coinflip, dice, slots, blackjack, roulette, lottery, high/low
- 🎲 **Risk Gambles** — all-in, high risk, low risk, gamble
- 🦹 **Crime & Robbery** — steal from users, bank heists
- 👑 **Wealth Tiers** — show off your wealth tier
- 🛠️ **Admin Tools** — set/add/remove money, reset balances
- 🎉 **Fun Commands** — memes, fortune, flex, spin, and more

---

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org) **v18 or higher**
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Step 1 — Create the bot on Discord

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Name it `CoopEconomy`.
3. Go to the **Bot** tab → click **Reset Token** → copy the token.
4. Enable the **Message Content Intent**.
5. Under **OAuth2 → URL Generator**: scopes `bot`, `applications.commands`; permissions **Administrator**.
6. Use the URL to invite the bot.

### Step 2 — Set up the project

```bash
git clone https://github.com/CoopFT/CoopEconomy.git
cd CoopEconomy
npm install
cp .env.example .env
```

### Step 3 — Configure `.env`

```env
TOKEN=YOUR_BOT_TOKEN_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE
DEV_GUILD_ID=
PREFIX=!
OWNER_IDS=
CURRENCY_NAME=Coins
STARTING_BALANCE=100
```

### Step 4 — Register commands & run

```bash
npm run register:guild   # or npm run deploy for global
npm start
```

You should see:
```
[OK] Loaded 71 slash commands.
[OK] Loaded 41 prefix commands.
[OK] Logged in as CoopEconomy#1234
```

---

## 🎮 Command Reference

### Slash Commands (`/`)

#### 💵 Economy
| Command | Description |
|---------|-------------|
| `/balance [@user]` | Check wallet & bank |
| `/wallet` | View wallet |
| `/bank` | View bank |
| `/networth` | Total wealth |
| `/worth` | Net worth |
| `/daily` | Daily reward |
| `/weekly` | Weekly reward |
| `/salary` | Hourly salary |
| `/pay @user <amount>` | Send money |
| `/deposit <amount>` | Deposit to bank |
| `/withdraw <amount>` | Withdraw from bank |
| `/leaderboard` | Richest users |
| `/rank` | Your rank |
| `/rich` | Richest user |
| `/richest` | Top 3 richest |
| `/beg` | Beg for coins |
| `/work` | Work for money |
| `/search` | Search for money |
| `/grab` | Grab pocket change |
| `/crime` | Commit a crime |
| `/rob @user` | Rob a user |
| `/steal @user` | Steal from a user |
| `/bankrobbery` | Bank heist |
| `/economystats` | Economy stats |
| `/vault` | Server vault |

#### 🛒 Shop & Inventory
| Command | Description |
|---------|-------------|
| `/shop` | View shop |
| `/buy <item>` | Buy an item |
| `/inventory` | View inventory |
| `/give @user <item>` | Give an item |
| `/lottery` | Buy a lottery ticket |
| `/raffle <tickets>` | Buy raffle tickets |

#### 🎰 Gambling
| Command | Description |
|---------|-------------|
| `/coinflip <amount> <side>` | Coin flip gamble |
| `/dice <amount> <guess>` | Dice gamble |
| `/slots <amount>` | Slot machine |
| `/blackjack <amount>` | Blackjack |
| `/roulette <amount> <color>` | Roulette |
| `/highlow <amount> <guess>` | High/low |
| `/gamble <amount>` | Gamble |
| `/gambleall` | All-in gamble |
| `/gamblehigh <amount>` | High risk |
| `/gamblelow <amount>` | Low risk |
| `/scratch <amount>` | Scratch card |
| `/spin` | Wheel of fortune |

#### 👑 Wealth & Fun
| Command | Description |
|---------|-------------|
| `/flex` | Flex balance |
| `/wealth` | Wealth tier |
| `/fortune` | Get fortune |
| `/economyquiz` | Quiz question |
| `/moneyjoke` | Money joke |

#### 🛠️ Admin
| Command | Description |
|---------|-------------|
| `/setmoney @user <amount>` | Set balance |
| `/addmoney @user <amount>` | Add money |
| `/removemoney @user <amount>` | Remove money |
| `/resetmoney @user` | Reset balance |
| `/resetall` | Reset all balances |

#### 🎉 Utility & Fun
| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/ping` | Check latency |
| `/botinfo` | Bot info |
| `/invite` | Invite link |
| `/serverinfo` | Server info |
| `/avatar @user` | Get avatar |
| `/uptime` | Bot uptime |
| `/coinflip` | Coin flip |
| `/dice` | Roll die |
| `/joke` | Get a joke |
| `/8ball` | 8-ball |
| `/rate` | Rate something |
| `/meme` | Get a meme |
| `/roast @user` | Roast a user |
| `/catfact` | Cat fact |
| `/bribe @user` | Bribe a user |

**Total: 71 slash commands** ✨

---

### Prefix Commands (`!`)

| Command | Description |
|---------|-------------|
| `!balance` | Check balance |
| `!daily` | Daily reward |
| `!pay` | Send money |
| `!deposit` | Deposit to bank |
| `!withdraw` | Withdraw from bank |
| `!leaderboard` | Leaderboard |
| `!beg` | Beg for coins |
| `!work` | Work for money |
| `!rob` | Rob a user |
| `!shop` | View shop |
| `!buy` | Buy item |
| `!inventory` | View inventory |
| `!coinflip` | Coin flip gamble |
| `!dice` | Dice gamble |
| `!slots` | Slot machine |
| `!gamble` | Gamble |
| `!roulette` | Roulette |
| `!blackjack` | Blackjack |
| `!setmoney` | Set balance (admin) |
| `!addmoney` | Add money (admin) |
| `!resetmoney` | Reset balance (admin) |
| `!help` | Show help |
| `!ping` | Pong |
| `!botinfo` | Bot info |
| `!invite` | Invite link |
| `!uptime` | Uptime |
| `!8ball` | 8-ball |
| `!joke` | Joke |
| `!rate` | Rate |
| `!rich` | Richest user |
| `!rank` | Your rank |
| `!crime` | Crime |
| `!search` | Search |
| `!fortune` | Fortune |
| `!spin` | Spin wheel |
| `!flex` | Flex |
| `!wallet` | Wallet |
| `!bank` | Bank |
| `!networth` | Net worth |
| `!salary` | Salary |
| `!grab` | Grab |
| `!meme` | Meme |

**Total: 41 prefix commands** 🤖

---

## 📘 Tutorial — How to Use CoopEconomy

### 1. Getting Started

1. **Invite the bot** to your server.
2. Every member starts with **100 Coins**.
3. Run `/balance` to see your wallet and bank.

### 2. Earning Money

- **Daily:** `/daily` — claim every 24 hours.
- **Weekly:** `/weekly` — claim weekly.
- **Work:** `/work` — earn 20-70 coins.
- **Search:** `/search` — search random places.
- **Beg:** `/beg` — get a little charity.
- **Salary:** `/salary` — claim your salary.

### 3. Managing Your Money

- **Deposit** to your safe bank: `/deposit 500` (use `all` for everything).
- **Withdraw** when you need it: `/withdraw 200`.
- **Pay** your friends: `/pay @user 100`.
- **Check the leaderboard:** `/leaderboard`.

### 4. Shopping

Until you build wealth, browse the **shop**:
- `/shop` — see items.
- `/buy lottery` — get a lottery ticket.
- `/buy crown` — flex on everyone.
- View your items: `/inventory`.

### 5. Gambling

Gamble responsibly! Try:
- `/coinflip 50 heads` — 50/50 chance.
- `/slots 100` — match three symbols.
- `/blackjack 200` — beat the dealer.
- `/gambleall` — go all-in (risky!).

### 6. Admin Commands

As an administrator you can:
- `/setmoney @user 1000` — set a balance.
- `/addmoney @user 500` — reward a member.
- `/resetall` — reset the whole economy.

---

## 🗂️ Project Structure

```
CoopEconomy/
├── index.js                 # Entry point
├── deploy-commands.js       # Registers slash commands
├── config.js                # Configuration
├── .env.example
├── commands/
│   ├── slash/               # 71 slash commands
│   │   ├── economy/         # core + more commands
│   │   ├── gambling/        # gambling games
│   │   └── extra/           # utility + fun
│   └── prefix/              # 41 prefix commands
├── handlers/                # Event handlers
├── utils/                   # Helpers (incl. store.js)
└── package.json
```

---

## 🔧 Development

### Add a slash command
```js
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  category: "economy",
  data: new SlashCommandBuilder().setName("hello").setDescription("Hello!"),
  async execute(interaction) { await interaction.reply("Hello!"); },
};
```

### Add a prefix command
```js
module.exports = {
  name: "hello",
  description: "Hello!",
  async execute(message) { await message.channel.send("Hello!"); },
};
```

---

## 📄 License

MIT License. Made with ❤️ by the CoopFT team. Find more bots on the [CoopFT Marketplace](https://coopft.com/marketplace).

</div>
</content>

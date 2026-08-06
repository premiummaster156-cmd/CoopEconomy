const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  {
    name: "balance",
    aliases: ["bal"],
    description: "Check balance (prefix). Usage: -*-prefix*-balance [@user]",
    async execute(message, args) {
      const user = message.mentions.users.first() || message.author;
      const bal = store.getBalance(message.guild.id, user.id);
      const bank = store.getBank(message.guild.id, user.id);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary).addFields(
        { name: "💵 Wallet", value: `${bal.toLocaleString()} ${config.currency}`, inline: true },
        { name: "🏦 Bank", value: `${bank.toLocaleString()} ${config.currency}`, inline: true },
        { name: "💰 Total", value: `${(bal + bank).toLocaleString()} ${config.currency}`, inline: true },
      )] });
    },
  },
  {
    name: "daily",
    description: "Claim daily reward (prefix).",
    async execute(message) {
      if (!store.canDaily(message.guild.id, message.author.id)) return message.reply({ embeds: [warning("Already Claimed", "Come back tomorrow!")] });
      const amount = 100;
      store.setDaily(message.guild.id, message.author.id);
      store.addBalance(message.guild.id, message.author.id, amount);
      await message.channel.send({ embeds: [success("Daily", `You claimed **${amount} ${config.currency}**! 💰`)] });
    },
  },
  {
    name: "pay",
    description: "Send money (prefix). Usage: -*-prefix*-pay @user <amount>",
    async execute(message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1], 10);
      if (!target || !amount || amount <= 0) return message.reply({ embeds: [error("Usage", "Mention a user and amount.")] });
      if (target.id === message.author.id) return message.reply({ embeds: [error("Invalid", "Cannot pay yourself.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", `You have **${bal} ${config.currency}**.`)] });
      store.addBalance(message.guild.id, message.author.id, -amount);
      store.addBalance(message.guild.id, target.id, amount);
      await message.channel.send({ embeds: [success("Paid", `Sent **${amount} ${config.currency}** to ${target.tag}.`)] });
    },
  },
  {
    name: "deposit",
    aliases: ["dep"],
    description: "Deposit to bank (prefix). Usage: -*-prefix*-deposit <amount|all>",
    async execute(message, args) {
      const bal = store.getBalance(message.guild.id, message.author.id);
      const amount = args[0] === "all" ? bal : parseInt(args[0], 10);
      if (!amount || amount > bal) return message.reply({ embeds: [error("Invalid", "Invalid amount.")] });
      store.addBalance(message.guild.id, message.author.id, -amount);
      store.addBank(message.guild.id, message.author.id, amount);
      await message.channel.send({ embeds: [success("Deposited", `Deposited **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "withdraw",
    aliases: ["wd"],
    description: "Withdraw from bank (prefix). Usage: -*-prefix*-withdraw <amount|all>",
    async execute(message, args) {
      const bank = store.getBank(message.guild.id, message.author.id);
      const amount = args[0] === "all" ? bank : parseInt(args[0], 10);
      if (!amount || amount > bank) return message.reply({ embeds: [error("Invalid", "Invalid amount.")] });
      store.addBank(message.guild.id, message.author.id, -amount);
      store.addBalance(message.guild.id, message.author.id, amount);
      await message.channel.send({ embeds: [success("Withdrawn", `Withdrew **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "leaderboard",
    aliases: ["lb", "top"],
    description: "View leaderboard (prefix).",
    async execute(message) {
      const top = store.getLeaderboard(message.guild.id, 10);
      if (top.length === 0) return message.reply({ embeds: [error("Empty", "No balances yet.")] });
      const text = top.map((e, i) => `**${i + 1}.** <@${e.userId}> — ${e.balance.toLocaleString()} ${config.currency}`).join("\n");
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🏆 Leaderboard").setColor(config.colors.primary).setDescription(text)] });
    },
  },
  {
    name: "beg",
    description: "Beg for coins (prefix).",
    async execute(message) {
      const amt = Math.floor(Math.random() * 30) + 1;
      store.addBalance(message.guild.id, message.author.id, amt);
      await message.channel.send({ embeds: [success("🪙", `Someone gave you **${amt} ${config.currency}**!`)] });
    },
  },
  {
    name: "work",
    description: "Work for money (prefix).",
    async execute(message) {
      const jobs = ["As a cashier", "As a programmer", "As a chef"];
      const amt = Math.floor(Math.random() * 50) + 20;
      store.addBalance(message.guild.id, message.author.id, amt);
      await message.channel.send({ embeds: [success("💼", `You worked ${rand(jobs)} and earned **${amt} ${config.currency}**!`)] });
    },
  },
  {
    name: "rob",
    description: "Rob a user (prefix). Usage: -*-prefix*-rob @user",
    async execute(message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
      const bal = store.getBalance(message.guild.id, target.id);
      if (bal <= 0) return message.reply({ embeds: [error("Poor", `${target.tag} has no money.`)] });
      const win = Math.random() < 0.5;
      const amount = win ? Math.floor(bal * 0.2) : Math.floor((store.getBalance(message.guild.id, message.author.id) || 0) * 0.1);
      if (win) {
        store.addBalance(message.guild.id, target.id, -amount);
        store.addBalance(message.guild.id, message.author.id, amount);
        await message.channel.send({ embeds: [success("🦹", `You robbed **${amount} ${config.currency}** from ${target.tag}!`)] });
      } else {
        store.addBalance(message.guild.id, message.author.id, -amount);
        await message.channel.send({ embeds: [warning("🚨", `You got caught and paid **${amount} ${config.currency}**!`)] });
      }
    },
  },
  {
    name: "shop",
    description: "View shop (prefix).",
    async execute(message) {
      const items = ["🎫 Lottery Ticket — 50", "🎲 Lucky Dice — 100", "💎 Diamond — 500", "👑 Crown — 1000"];
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🛒 Shop").setColor(config.colors.primary).setDescription(items.map((i) => `**${i} ${config.currency}**`).join("\n"))] });
    },
  },
  {
    name: "buy",
    description: "Buy an item (prefix). Usage: -*-prefix*-buy <item>",
    async execute(message, args) {
      const item = (args[0] || "").toLowerCase();
      const items = { ticket: { name: "🎫 Lottery Ticket", price: 50 }, dice: { name: "🎲 Lucky Dice", price: 100 }, diamond: { name: "💎 Diamond", price: 500 }, crown: { name: "👑 Crown", price: 1000 } };
      const found = items[item];
      if (!found) return message.reply({ embeds: [error("Not found", "Item not in shop.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (bal < found.price) return message.reply({ embeds: [error("Insufficient", "Can't afford that.")] });
      store.addBalance(message.guild.id, message.author.id, -found.price);
      store.addItem(message.guild.id, message.author.id, found.name, 1);
      await message.channel.send({ embeds: [success("Purchased", `You bought **${found.name}**!`)] });
    },
  },
  {
    name: "inventory",
    aliases: ["inv"],
    description: "View inventory (prefix).",
    async execute(message) {
      const inv = store.getInventory(message.guild.id, message.author.id);
      const entries = Object.entries(inv);
      if (entries.length === 0) return message.reply({ embeds: [error("Empty", "Your inventory is empty.")] });
      await message.channel.send({ embeds: [info("🎒 Inventory", entries.map(([k, v]) => `**${k}** × ${v}`).join("\n"))] });
    },
  },
  {
    name: "coinflip",
    aliases: ["cf"],
    description: "Gamble on coin flip (prefix). Usage: -*-prefix*-coinflip <amount> <heads|tails>",
    async execute(message, args) {
      const amount = parseInt(args[0], 10);
      const side = (args[1] || "").toLowerCase();
      if (!amount || amount <= 0) return message.reply({ embeds: [error("Usage", "Provide amount and side.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", "Not enough money.")] });
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const win = result === side;
      if (win) store.addBalance(message.guild.id, message.author.id, amount);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)(`🪙 ${result.toUpperCase()}!`, win ? `You won **${amount} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "dice",
    description: "Gamble on dice (prefix). Usage: -*-prefix*-dice <amount> <guess>",
    async execute(message, args) {
      const amount = parseInt(args[0], 10);
      const guess = parseInt(args[1], 10);
      if (!amount || !guess || guess < 1 || guess > 6) return message.reply({ embeds: [error("Usage", "Provide amount and guess (1-6).")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", "Not enough money.")] });
      const roll = Math.floor(Math.random() * 6) + 1;
      const win = roll === guess;
      if (win) store.addBalance(message.guild.id, message.author.id, amount * 5);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)(`🎲 Rolled ${roll}!`, win ? `You won **${amount * 5} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "slots",
    description: "Play slots (prefix). Usage: -*-prefix*-slots <amount>",
    async execute(message, args) {
      const amount = parseInt(args[0], 10);
      if (!amount || amount <= 0) return message.reply({ embeds: [error("Usage", "Provide amount.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", "Not enough money.")] });
      const symbols = ["🍒", "🍋", "🍇", "💎", "7️⃣"];
      const r = () => symbols[Math.floor(Math.random() * symbols.length)];
      const a = r(), b = r(), c = r();
      const win = a === b && b === c;
      const payout = win ? amount * 3 : 0;
      if (payout) store.addBalance(message.guild.id, message.author.id, payout);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)(`🎰 ${a} ${b} ${c}`, win ? `Jackpot! **${payout} ${config.currency}**! 🎉` : `Lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "gamble",
    description: "Gamble (prefix). Usage: -*-prefix*-gamble <amount>",
    async execute(message, args) {
      const amount = parseInt(args[0], 10);
      if (!amount || amount <= 0) return message.reply({ embeds: [error("Usage", "Provide amount.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", "Not enough money.")] });
      const win = Math.random() < 0.5;
      const payout = win ? Math.floor(amount * (1 + Math.random() * 2)) : amount;
      if (win) store.addBalance(message.guild.id, message.author.id, payout);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)("🎲", win ? `You won **${payout} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "roulette",
    description: "Play roulette (prefix). Usage: -*-prefix*-roulette <amount> <red|black|green>",
    async execute(message, args) {
      const amount = parseInt(args[0], 10);
      const color = (args[1] || "").toLowerCase();
      if (!amount || !["red", "black", "green"].includes(color)) return message.reply({ embeds: [error("Usage", "Provide amount and color.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", "Not enough money.")] });
      const result = Math.floor(Math.random() * 37);
      const rc = result === 0 ? "green" : (result % 2 === 0 ? "black" : "red");
      const win = color === rc;
      const payout = win ? (color === "green" ? amount * 35 : amount) : 0;
      if (payout) store.addBalance(message.guild.id, message.author.id, payout);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)("🔴", `Ball: **${result} (${rc})**\n${win ? `You won **${payout} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`}`)] });
    },
  },
  {
    name: "blackjack",
    aliases: ["bj"],
    description: "Play blackjack (prefix). Usage: -*-prefix*-blackjack <amount>",
    async execute(message, args) {
      const amount = parseInt(args[0], 10);
      if (!amount || amount <= 0) return message.reply({ embeds: [error("Usage", "Provide amount.")] });
      const bal = store.getBalance(message.guild.id, message.author.id);
      if (amount > bal) return message.reply({ embeds: [error("Insufficient", "Not enough money.")] });
      const p = Math.floor(Math.random() * 21) + 4;
      const d = Math.floor(Math.random() * 21) + 4;
      let win = p > d && p <= 21;
      if (p > 21) win = false;
      if (d > 21 && p <= 21) win = true;
      if (win) store.addBalance(message.guild.id, message.author.id, amount);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)("🃏", `You: **${p}** | Dealer: **${d}**\n${win ? `You won **${amount} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`}`)] });
    },
  },
  {
    name: "setmoney",
    description: "Set balance (prefix, admin). Usage: -*-prefix*-setmoney @user <amount>",
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ embeds: [error("No permission", "Need Administrator.")] });
      const target = message.mentions.users.first();
      const amount = parseInt(args[1], 10);
      if (!target || !amount) return message.reply({ embeds: [error("Usage", "Mention a user and amount.")] });
      store.setBalance(message.guild.id, target.id, amount);
      await message.channel.send({ embeds: [success("Set", `${target.tag} now has **${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "addmoney",
    description: "Add money (prefix, admin). Usage: -*-prefix*-addmoney @user <amount>",
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ embeds: [error("No permission", "Need Administrator.")] });
      const target = message.mentions.users.first();
      const amount = parseInt(args[1], 10);
      if (!target || !amount) return message.reply({ embeds: [error("Usage", "Mention a user and amount.")] });
      store.addBalance(message.guild.id, target.id, amount);
      await message.channel.send({ embeds: [success("Added", `Added **${amount} ${config.currency}** to ${target.tag}.`)] });
    },
  },
  {
    name: "resetmoney",
    description: "Reset balance (prefix, admin). Usage: -*-prefix*-resetmoney @user",
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ embeds: [error("No permission", "Need Administrator.")] });
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [error("Usage", "Mention a user.")] });
      store.setBalance(message.guild.id, target.id, config.startingBalance);
      store.setBank(message.guild.id, target.id, 0);
      await message.channel.send({ embeds: [success("Reset", `${target.tag}'s balance was reset.`)] });
    },
  },
  {
    name: "help",
    aliases: ["h"],
    description: "Show help (prefix).",
    async execute(message) {
      const commands = message.client.prefixCommands;
      const text = commands.map((c) => `\`${config.prefix}${c.name}\` — ${c.description.replace(/\*-prefix-\*/g, config.prefix)}`).slice(0, 40).join("\n");
      await message.channel.send({ embeds: [info("CoopEconomy Prefix Help", text.slice(0, 4000))] });
    },
  },
  {
    name: "ping",
    description: "Pong! (prefix).",
    async execute(message) {
      const now = Date.now();
      const m = await message.channel.send({ embeds: [info("Pinging...")] });
      await m.edit({ embeds: [success("Pong!", `Latency: ${Date.now() - now}ms`)] });
    },
  },
  {
    name: "botinfo",
    description: "Bot info (prefix).",
    async execute(message) {
      await message.channel.send({ embeds: [info("💰 CoopEconomy", `Slash: ${message.client.slashCommands.size}\nPrefix: ${message.client.prefixCommands.size}\nServers: ${message.client.guilds.cache.size}`)] });
    },
  },
  {
    name: "invite",
    description: "Invite link (prefix).",
    async execute(message) {
      await message.channel.send({ embeds: [success("Invite", `Invite: https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)] });
    },
  },
  {
    name: "uptime",
    description: "Uptime (prefix).",
    async execute(message) {
      const s = Math.floor(message.client.uptime / 1000);
      await message.channel.send({ embeds: [success("Uptime", `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`)] });
    },
  },
  {
    name: "8ball",
    description: "Ask 8-ball (prefix).",
    async execute(message, args) {
      const answers = ["Yes", "No", "Maybe", "Definitely", "Ask again later", "Signs point to yes"];
      await message.channel.send({ embeds: [info("🎱", `**A:** ${rand(answers)}`)] });
    },
  },
  {
    name: "joke",
    description: "Get a joke (prefix).",
    async execute(message) {
      const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "I told my wife she should embrace her mistakes. She hugged me.", "Why did the scarecrow win an award? Because he was outstanding in his field!"];
      await message.channel.send({ embeds: [success("😂", rand(jokes))] });
    },
  },
  {
    name: "rate",
    description: "Rate something (prefix). Usage: -*-prefix*-rate <thing>",
    async execute(message, args) {
      await message.channel.send({ embeds: [info("⭐", `**${args.join(" ") || "that"}** is **${Math.floor(Math.random() * 11)}/10**.`)] });
    },
  },
  {
    name: "rich",
    description: "Richest user (prefix).",
    async execute(message) {
      const top = store.getLeaderboard(message.guild.id, 1);
      if (top.length === 0) return message.reply({ embeds: [error("Empty", "No data yet.")] });
      await message.channel.send({ embeds: [success("👑 Richest", `<@${top[0].userId}> with **${top[0].balance.toLocaleString()} ${config.currency}**!`)] });
    },
  },
  {
    name: "rank",
    description: "Your rank (prefix).",
    async execute(message) {
      const top = store.getLeaderboard(message.guild.id, 100);
      const idx = top.findIndex((e) => e.userId === message.author.id);
      if (idx === -1) return message.reply({ embeds: [error("No rank", "No balance yet.")] });
      await message.channel.send({ embeds: [success(`Rank #${idx + 1}`, `You are **#${idx + 1}** with **${top[idx].balance.toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    name: "crime",
    description: "Commit a crime (prefix).",
    async execute(message) {
      const win = Math.random() < 0.6;
      const amount = win ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 100) + 20;
      if (win) store.addBalance(message.guild.id, message.author.id, amount);
      else store.addBalance(message.guild.id, message.author.id, -amount);
      await message.channel.send({ embeds: [(win ? success : error)("🦹", win ? `Crime success! **+${amount} ${config.currency}**!` : `Got caught! **-${amount} ${config.currency}**.`)] });
    },
  },
  {
    name: "search",
    description: "Search for money (prefix).",
    async execute(message) {
      const places = ["pocket", "couch", "trash", "street"];
      const amt = Math.floor(Math.random() * 40) + 5;
      store.addBalance(message.guild.id, message.author.id, amt);
      await message.channel.send({ embeds: [success("🔍", `You searched the **${rand(places)}** and found **${amt} ${config.currency}**!`)] });
    },
  },
  {
    name: "fortune",
    description: "Get your fortune (prefix).",
    async execute(message) {
      const fortunes = ["You will be rich soon!", "Beware of gambling today.", "A lucky streak is coming."];
      await message.channel.send({ embeds: [info("🔮 Fortune", rand(fortunes))] });
    },
  },
  {
    name: "spin",
    description: "Spin the wheel (prefix).",
    async execute(message) {
      const prizes = [0, 10, 25, 50, 100, 200, 500];
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      store.addBalance(message.guild.id, message.author.id, prize);
      await message.channel.send({ embeds: [prize > 0 ? success("🎡", `You landed on **${prize} ${config.currency}**!`) : error("🎡", "You landed on **0**. Better luck next time!")] });
    },
  },
  {
    name: "flex",
    description: "Flex your balance (prefix).",
    async execute(message) {
      const bal = store.getBalance(message.guild.id, message.author.id);
      await message.channel.send({ embeds: [success("💪 Flex", `Look at my **${bal.toLocaleString()} ${config.currency}**! 💎`)] });
    },
  },
  {
    name: "wallet",
    description: "View wallet (prefix).",
    async execute(message) {
      const bal = store.getBalance(message.guild.id, message.author.id);
      await message.channel.send({ embeds: [success("💵 Wallet", `You have **${bal.toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    name: "bank",
    description: "View bank (prefix).",
    async execute(message) {
      const bank = store.getBank(message.guild.id, message.author.id);
      await message.channel.send({ embeds: [success("🏦 Bank", `You have **${bank.toLocaleString()} ${config.currency}** in the bank.`)] });
    },
  },
  {
    name: "networth",
    description: "Net worth (prefix).",
    async execute(message) {
      const bal = store.getBalance(message.guild.id, message.author.id);
      const bank = store.getBank(message.guild.id, message.author.id);
      await message.channel.send({ embeds: [success("💰 Net Worth", `Total: **${(bal + bank).toLocaleString()} ${config.currency}**`)] });
    },
  },
  {
    name: "salary",
    description: "Claim salary (prefix).",
    async execute(message) {
      const amount = 25;
      store.addBalance(message.guild.id, message.author.id, amount);
      await message.channel.send({ embeds: [success("💵 Salary", `You claimed **${amount} ${config.currency}**!`)] });
    },
  },
  {
    name: "grab",
    description: "Grab pocket change (prefix).",
    async execute(message) {
      const amount = Math.floor(Math.random() * 15) + 1;
      store.addBalance(message.guild.id, message.author.id, amount);
      await message.channel.send({ embeds: [success("🪙", `You grabbed **${amount} ${config.currency}**!`)] });
    },
  },
  {
    name: "meme",
    description: "Get a meme (prefix).",
    async execute(message) {
      const memes = ["When the job pays in exposure", "Nobody:\nMe: /gamble all", "Investing all my coins in virtual dice"];
await message.channel.send({ embeds: [success("😂", rand(memes))] });
    },
  },
];

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("gambleall").setDescription("Gamble your entire wallet!"),
    async execute(interaction) {
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (bal <= 0) return interaction.reply({ embeds: [error("Empty", "You have no money to gamble.")], ephemeral: true });
      const win = Math.random() < 0.5;
      const result = win ? bal * 2 : 0;
      if (win) store.setBalance(interaction.guild.id, interaction.user.id, result);
      else store.setBalance(interaction.guild.id, interaction.user.id, 0);
      await interaction.reply({ embeds: [(win ? success : error)("🎲 All In", win ? `DOUBLED! You now have **${result.toLocaleString()} ${config.currency}**! 🎉` : `You lost everything! **0 ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("salary").setDescription("Claim your hourly salary."),
    async execute(interaction) {
      const amount = 25;
      store.addBalance(interaction.guild.id, interaction.user.id, amount);
      await interaction.reply({ embeds: [success("💵 Salary", `You claimed **${amount} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("crime").setDescription("Commit a crime."),
    async execute(interaction) {
      const win = Math.random() < 0.6;
      const amount = win ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 100) + 20;
      const crimes = ["a bank robbery", "a heist", "a casino break-in", "a jewelry store theft"];
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, amount);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🦹 Crime", win ? `You pulled off ${rand(crimes)} and got **${amount} ${config.currency}**!` : `You got caught during ${rand(crimes)} and paid **${amount} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("steal").setDescription("Attempt to steal from a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const bal = store.getBalance(interaction.guild.id, target.id);
      if (bal <= 0) return interaction.reply({ embeds: [error("Poor", `${target.tag} has no money.`)], ephemeral: true });
      const win = Math.random() < 0.4;
      const amount = Math.floor(bal * 0.1) || 1;
      if (win) {
        store.addBalance(interaction.guild.id, target.id, -amount);
        store.addBalance(interaction.guild.id, interaction.user.id, amount);
        await interaction.reply({ embeds: [success("🦹 Stole!", `You stole **${amount} ${config.currency}** from ${target.tag}!`)] });
      } else {
        store.addBalance(interaction.guild.id, interaction.user.id, -amount);
        await interaction.reply({ embeds: [warning("🚨 Caught!", `You got caught and fined **${amount} ${config.currency}**!`)] });
      }
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("gamblehigh").setDescription("Gamble with high risk high reward.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (amount <= 0 || amount > bal) return interaction.reply({ embeds: [error("Invalid", "Invalid bet amount.")], ephemeral: true });
      const win = Math.random() < 0.25;
      const result = win ? amount * 3 : 0;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, result);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🔥 High Risk", win ? `JACKPOT! You won **${result.toLocaleString()} ${config.currency}**! 🎉` : `High risk, high loss. You lost **${amount.toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("gamblelow").setDescription("Gamble with low risk low reward.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (amount <= 0 || amount > bal) return interaction.reply({ embeds: [error("Invalid", "Invalid bet amount.")], ephemeral: true });
      const win = Math.random() < 0.8;
      const result = win ? Math.floor(amount * 0.2) : 0;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, result);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🛡️ Low Risk", win ? `Safe win! You earned **${result} ${config.currency}**.` : `Even low risk failed. You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("grab").setDescription("Grab some pocket change."),
    async execute(interaction) {
      const amount = Math.floor(Math.random() * 15) + 1;
      store.addBalance(interaction.guild.id, interaction.user.id, amount);
      await interaction.reply({ embeds: [success("🪙 Grab", `You grabbed **${amount} ${config.currency}** off the ground!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("worth").setDescription("Check your total wealth."),
    async execute(interaction) {
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      const bank = store.getBank(interaction.guild.id, interaction.user.id);
      await interaction.reply({ embeds: [success("💰 Worth", `Your total net worth is **${(bal + bank).toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("richest").setDescription("Show the top 3 richest users."),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 3);
      if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No data yet.")] });
      const medals = ["🥇", "🥈", "🥉"];
      const text = top.map((e, i) => `${medals[i] || "🏅"} <@${e.userId}> — ${e.balance.toLocaleString()} ${config.currency}`).join("\n");
      await interaction.reply({ embeds: [new EmbedBuilder().setTitle("👑 Top Richest").setColor(config.colors.primary).setDescription(text)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("bankrobbery").setDescription("Attempt a bank robbery."),
    async execute(interaction) {
      const win = Math.random() < 0.3;
      const amount = win ? Math.floor(Math.random() * 500) + 200 : Math.floor(Math.random() * 200) + 50;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, amount);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🏦 Robbery", win ? `You robbed the bank and got **${amount} ${config.currency}**! 🎉` : `The heist failed! You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("economystats").setDescription("View economy statistics."),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 100);
      const total = top.reduce((s, e) => s + e.balance, 0);
      await interaction.reply({ embeds: [success("📊 Economy Stats", `Total users: **${top.length}**\nTotal wealth: **${total.toLocaleString()} ${config.currency}**\nCurrency: ${config.currency}`)] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("avatar").setDescription("Get avatar.").addUserOption((o) => o.setName("user").setDescription("The user")),
    async execute(interaction) {
      const user = interaction.options.getUser("user") || interaction.user;
      await interaction.reply({ embeds: [new EmbedBuilder().setTitle(user.tag).setColor(config.colors.primary).setImage(user.displayAvatarURL({ size: 1024 }))] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("uptime").setDescription("Bot uptime."),
    async execute(interaction) {
      const s = Math.floor(interaction.client.uptime / 1000);
      await interaction.reply({ embeds: [success("Uptime", `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("raffle").setDescription("Enter the coin raffle.").addIntegerOption((o) => o.setName("tickets").setDescription("Number of tickets").setRequired(true)),
    async execute(interaction) {
      const tickets = interaction.options.getInteger("tickets");
      const price = tickets * 10;
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (bal < price) return interaction.reply({ embeds: [error("Insufficient", `Tickets cost **${price} ${config.currency}**.`)], ephemeral: true });
      store.addBalance(interaction.guild.id, interaction.user.id, -price);
      store.addItem(interaction.guild.id, interaction.user.id, "🎫 Raffle Ticket", tickets);
      await interaction.reply({ embeds: [success("🎫 Raffle", `You bought **${tickets}** raffle tickets for **${price} ${config.currency}**! Good luck!`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("fortune").setDescription("Get your fortune."),
    async execute(interaction) {
      const fortunes = ["You will be rich soon!", "Beware of gambling today.", "A lucky streak is coming.", "Spend wisely, great fortune awaits.", "The dice favor you today."];
      await interaction.reply({ embeds: [info("🔮 Fortune", rand(fortunes))] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("moneyjoke").setDescription("A money-themed joke."),
    async execute(interaction) {
      const jokes = ["Money talks, but all mine says is goodbye!", "I'm not broke, I'm just financially challenged!", "Why do we call it 'dough'? Because we knead it!", "My wallet is like an onion. Opening it makes me cry."];
      await interaction.reply({ embeds: [success("😂", rand(jokes))] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("flex").setDescription("Flex your balance."),
    async execute(interaction) {
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      await interaction.reply({ embeds: [success("💪 Flex", `Look at my **${bal.toLocaleString()} ${config.currency}**! I'm rich! 💎`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("spin").setDescription("Spin a wheel of fortune."),
    async execute(interaction) {
      const prizes = [0, 10, 25, 50, 100, 200, 500, 1000];
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      store.addBalance(interaction.guild.id, interaction.user.id, prize);
      await interaction.reply({ embeds: [prize > 0 ? success("🎡 Wheel", `You landed on **${prize} ${config.currency}**!`) : error("🎡 Wheel", "You landed on **0**. Better luck next time!")] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("bribe").setDescription("Bribe a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("Amount").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (amount > bal) return interaction.reply({ embeds: [error("Insufficient", "You can't afford that bribe.")], ephemeral: true });
      store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      store.addBalance(interaction.guild.id, target.id, amount);
      await interaction.reply({ embeds: [success("💼 Bribe", `You bribed **${target.tag}** with **${amount} ${config.currency}**. They'll remember that.`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("wealth").setDescription("Show your wealth tier."),
    async execute(interaction) {
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      let tier = "💸 Broke";
      if (bal >= 10000) tier = "👑 Tycoon";
      else if (bal >= 5000) tier = "💎 Rich";
      else if (bal >= 1000) tier = "💰 Well-off";
      else if (bal >= 200) tier = "🪙 Comfortable";
      await interaction.reply({ embeds: [success("📈 Wealth Tier", `You are tier **${tier}** with **${bal.toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("economyquiz").setDescription("Take an economy quiz question."),
    async execute(interaction) {
      const questions = ["What's the best way to accumulate wealth in CoopEconomy? (Answer: Daily + work + smart gambling)", "True or false: Gambling is always profitable. (Answer: False!)", "What should you do before gambling? (Answer: Check your balance!)"];
await interaction.reply({ embeds: [info("📝 Quiz", rand(questions))] });
    },
  },
];

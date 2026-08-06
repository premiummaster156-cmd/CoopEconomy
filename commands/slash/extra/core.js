const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

module.exports = [
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("wallet").setDescription("View your wallet balance."),
    async execute(interaction) {
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      await interaction.reply({ embeds: [success("💵 Wallet", `You have **${bal.toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("bank").setDescription("View your bank balance."),
    async execute(interaction) {
      const bank = store.getBank(interaction.guild.id, interaction.user.id);
      await interaction.reply({ embeds: [success("🏦 Bank", `You have **${bank.toLocaleString()} ${config.currency}** in the bank.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("networth").setDescription("View your total net worth."),
    async execute(interaction) {
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      const bank = store.getBank(interaction.guild.id, interaction.user.id);
      await interaction.reply({ embeds: [success("💰 Net Worth", `Total: **${(bal + bank).toLocaleString()} ${config.currency}**\nWallet: ${bal.toLocaleString()}\nBank: ${bank.toLocaleString()}`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("search").setDescription("Search for money.").addStringOption((o) => o.setName("place").setDescription("Where to search").addChoices({ name: "Pocket", value: "pocket" }, { name: "Couch", value: "couch" }, { name: "Trash", value: "trash" }, { name: "Street", value: "street" })),
    async execute(interaction) {
      const places = ["pocket", "couch", "trash", "street"];
      const place = interaction.options.getString("place") || places[Math.floor(Math.random() * places.length)];
      const amt = Math.floor(Math.random() * 40) + 5;
      store.addBalance(interaction.guild.id, interaction.user.id, amt);
      await interaction.reply({ embeds: [success("🔍 Search", `You searched the **${place}** and found **${amt} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("gambleexp").setDescription("Gamble experience points.").addIntegerOption((o) => o.setName("amount").setDescription("XP").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const win = Math.random() < 0.5;
      const result = win ? amount : -amount;
      store.addBalance(interaction.guild.id, interaction.user.id, result);
      await interaction.reply({ embeds: [(win ? success : error)("🎲 XP Gamble", win ? `You won **${amount} ×p**!` : `You lost **${amount} ×p**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("rich").setDescription("Show the richest user."),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 1);
      if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No data yet.")] });
      await interaction.reply({ embeds: [success("👑 Richest", `<@${top[0].userId}> with **${top[0].balance.toLocaleString()} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("rank").setDescription("Your rank in the leaderboard."),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 100);
      const idx = top.findIndex((e) => e.userId === interaction.user.id);
      if (idx === -1) return interaction.reply({ embeds: [error("No rank", "You have no balance yet.")] });
      await interaction.reply({ embeds: [success(`Rank #${idx + 1}`, `You are ranked **#${idx + 1}** with **${top[idx].balance.toLocaleString()} ${config.currency}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("vault").setDescription("View server's total economy.").setDefaultMemberPermissions(8),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 100);
      const total = top.reduce((s, e) => s + e.balance, 0);
      await interaction.reply({ embeds: [success("🏦 Server Vault", `Total wealth: **${total.toLocaleString()} ${config.currency}**\nUsers: ${top.length}`)] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("help").setDescription("Show all commands."),
    async execute(interaction) {
      const cats = {};
      for (const [, c] of interaction.client.slashCommands) { const cat = c.category || "other"; (cats[cat] = cats[cat] || []).push(`\`/${c.data.name}\``); }
      const embed = info(`CoopEconomy Help (${interaction.client.slashCommands.size})`, "Server economy & gambling.")
        .setThumbnail(interaction.client.user.displayAvatarURL());
      for (const [cat, list] of Object.entries(cats)) embed.addFields({ name: `📁 ${cat}`, value: list.join(" ").slice(0, 1024) });
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("ping").setDescription("Check latency."),
    async execute(interaction) {
      const sent = await interaction.reply({ embeds: [info("Pinging...")], fetchReply: true });
      const rt = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply({ embeds: [success("Pong!", `Latency: ${rt}ms | API: ${Math.round(interaction.client.ws.ping)}ms`)] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("botinfo").setDescription("Bot info."),
    async execute(interaction) {
      const embed = new EmbedBuilder().setTitle(interaction.client.user.tag).setColor(config.colors.primary).setThumbnail(interaction.client.user.displayAvatarURL())
        .addFields(
          { name: "Servers", value: String(interaction.client.guilds.cache.size), inline: true },
          { name: "Slash", value: String(interaction.client.slashCommands.size), inline: true },
          { name: "Prefix", value: String(interaction.client.prefixCommands.size), inline: true },
        );
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("invite").setDescription("Invite link."),
    async execute(interaction) {
      await interaction.reply({ embeds: [success("Invite", `Invite link: https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`)] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("serverinfo").setDescription("Server info."),
    async execute(interaction) {
      const embed = new EmbedBuilder().setTitle(`📊 ${interaction.guild.name}`).setColor(config.colors.primary)
        .addFields({ name: "Members", value: String(interaction.guild.memberCount), inline: true }, { name: "ID", value: interaction.guild.id, inline: true });
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "utility",
    data: new SlashCommandBuilder().setName("leaderboard").setDescription("View the economy leaderboard."),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 10);
      if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No balances yet.")] });
      const text = top.map((e, i) => `**${i + 1}.** <@${e.userId}> — ${e.balance.toLocaleString()} ${config.currency}`).join("\n");
      await interaction.reply({ embeds: [new EmbedBuilder().setTitle("🏆 Leaderboard").setColor(config.colors.primary).setDescription(text)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("coinflip").setDescription("Flip a coin (no bet)."),
    async execute(interaction) {
      await interaction.reply({ embeds: [success("🪙", `**${Math.random() < 0.5 ? "Heads" : "Tails"}**!`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("dice").setDescription("Roll a die (no bet).").addIntegerOption((o) => o.setName("sides").setDescription("Sides")),
    async execute(interaction) {
      const sides = interaction.options.getInteger("sides") || 6;
      await interaction.reply({ embeds: [success("🎲", `d${sides}: **${Math.floor(Math.random() * sides) + 1}**`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("joke").setDescription("Get a joke."),
    async execute(interaction) {
      const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "What do you call a bear with no teeth? A gummy bear!", "Why did the scarecrow win an award? Because he was outstanding in his field!"];
      await interaction.reply({ embeds: [success("😂", rand(jokes))] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("8ball").setDescription("Ask the 8-ball.").addStringOption((o) => o.setName("question").setDescription("Question").setRequired(true)),
    async execute(interaction) {
      const answers = ["Yes", "No", "Maybe", "Definitely", "Ask again later", "Signs point to yes"];
      await interaction.reply({ embeds: [info("🎱", `**A:** ${rand(answers)}`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("rate").setDescription("Rate something.").addStringOption((o) => o.setName("thing").setDescription("What to rate").setRequired(true)),
    async execute(interaction) {
      await interaction.reply({ embeds: [info("⭐", `**${interaction.options.getString("thing")}** is **${Math.floor(Math.random() * 11)}/10**.`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("meme").setDescription("Get a meme."),
    async execute(interaction) {
      const memes = ["When the job pays in exposure", "Nobody:\nMe: /gamble all", "Investing all my coins in virtual dice", "When you finally win the lottery"];
      await interaction.reply({ embeds: [success("😂 Meme", rand(memes))] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("roast").setDescription("Roast a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)),
    async execute(interaction) {
      const user = interaction.options.getUser("user");
      const roasts = ["You're the reason the gene pool needs a lifeguard.", "I'd agree with you but then we'd both be wrong.", "You're not dumb, just unlucky in thinking."];
      await interaction.reply({ embeds: [info("🔥", `${user}, ${rand(roasts)}`)] });
    },
  },
  {
    category: "fun",
    data: new SlashCommandBuilder().setName("catfact").setDescription("Get a cat fact."),
    async execute(interaction) {
      const facts = ["Cats sleep 70% of their lives.", "A cat's nose print is unique.", "A group of cats is called a clowder."];
      await interaction.reply({ embeds: [success("🐱", rand(facts))] });
    },
  },
];

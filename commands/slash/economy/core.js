const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function parseAmount(str, balance) {
  if (!str) return null;
  if (str.toLowerCase() === "all") return balance;
  const n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}

module.exports = [
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("balance").setDescription("Check your balance.").addUserOption((o) => o.setName("user").setDescription("The user")),
    async execute(interaction) {
      const user = interaction.options.getUser("user") || interaction.user;
      const bal = store.getBalance(interaction.guild.id, user.id);
      const bank = store.getBank(interaction.guild.id, user.id);
      const embed = new EmbedBuilder().setTitle(`${user.tag}`).setColor(config.colors.primary).setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "💵 Wallet", value: `${bal.toLocaleString()} ${config.currency}`, inline: true },
          { name: "🏦 Bank", value: `${bank.toLocaleString()} ${config.currency}`, inline: true },
          { name: "💰 Total", value: `${(bal + bank).toLocaleString()} ${config.currency}`, inline: true },
        );
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward."),
    async execute(interaction) {
if (!store.canDaily(interaction.guild.id, interaction.user.id)) {
        return interaction.reply({ embeds: [warning("Already Claimed", "You already claimed your daily reward today. Come back tomorrow!")], ephemeral: true });
      }
      const amount = 100;
      store.setDaily(interaction.guild.id, interaction.user.id);
      store.addBalance(interaction.guild.id, interaction.user.id, amount);
      await interaction.reply({ embeds: [success("Daily Reward", `You claimed **${amount} ${config.currency}**! 💰`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("weekly").setDescription("Claim your weekly reward."),
    async execute(interaction) {
      const amount = 500;
      store.addBalance(interaction.guild.id, interaction.user.id, amount);
      await interaction.reply({ embeds: [success("Weekly Reward", `You claimed **${amount} ${config.currency}**! 🎁`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("pay").setDescription("Send money to a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("Amount").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      if (amount <= 0) return interaction.reply({ embeds: [error("Invalid", "Amount must be positive.")], ephemeral: true });
      if (target.id === interaction.user.id) return interaction.reply({ embeds: [error("Invalid", "You cannot pay yourself.")], ephemeral: true });
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (amount > bal) return interaction.reply({ embeds: [error("Insufficient", `You only have **${bal} ${config.currency}**.`)], ephemeral: true });
      store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      store.addBalance(interaction.guild.id, target.id, amount);
      await interaction.reply({ embeds: [success("Payment Sent", `You sent **${amount} ${config.currency}** to **${target.tag}**.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("deposit").setDescription("Deposit money into your bank.").addIntegerOption((o) => o.setName("amount").setDescription("Amount or 'all'").setRequired(true)),
    async execute(interaction) {
      const amount = parseAmount(interaction.options.getInteger("amount"), store.getBalance(interaction.guild.id, interaction.user.id));
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (!amount || amount <= 0) return interaction.reply({ embeds: [error("Invalid", "Provide a valid amount.")], ephemeral: true });
      if (amount > bal) return interaction.reply({ embeds: [error("Insufficient", `You only have **${bal} ${config.currency}**.`)], ephemeral: true });
      store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      store.addBank(interaction.guild.id, interaction.user.id, amount);
      await interaction.reply({ embeds: [success("Deposited", `Deposited **${amount} ${config.currency}** into your bank.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("withdraw").setDescription("Withdraw money from your bank.").addIntegerOption((o) => o.setName("amount").setDescription("Amount or 'all'").setRequired(true)),
    async execute(interaction) {
      const amount = parseAmount(interaction.options.getInteger("amount"), store.getBank(interaction.guild.id, interaction.user.id));
      const bank = store.getBank(interaction.guild.id, interaction.user.id);
      if (!amount || amount <= 0) return interaction.reply({ embeds: [error("Invalid", "Provide a valid amount.")], ephemeral: true });
      if (amount > bank) return interaction.reply({ embeds: [error("Insufficient", `You only have **${bank} ${config.currency}** in your bank.`)], ephemeral: true });
      store.addBank(interaction.guild.id, interaction.user.id, -amount);
      store.addBalance(interaction.guild.id, interaction.user.id, amount);
      await interaction.reply({ embeds: [success("Withdrawn", `Withdrew **${amount} ${config.currency}** from your bank.`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("leaderboard").setDescription("View the richest users."),
    async execute(interaction) {
      const top = store.getLeaderboard(interaction.guild.id, 10);
      if (top.length === 0) return interaction.reply({ embeds: [error("Empty", "No balances yet.")] });
      const text = top.map((e, i) => `**${i + 1}.** <@${e.userId}> — ${e.balance.toLocaleString()} ${config.currency}`).join("\n");
      const embed = new EmbedBuilder().setTitle(`🏆 Leaderboard — ${interaction.guild.name}`).setColor(config.colors.primary).setDescription(text);
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("beg").setDescription("Beg for some coins."),
    async execute(interaction) {
      const amt = Math.floor(Math.random() * 30) + 1;
      store.addBalance(interaction.guild.id, interaction.user.id, amt);
      await interaction.reply({ embeds: [success("🪙 Begging", `Someone gave you **${amt} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("work").setDescription("Work to earn money."),
    async execute(interaction) {
      const jobs = ["As a cashier", "As a programmer", "As a chef", "As a lifeguard", "As a translator"];
      const amt = Math.floor(Math.random() * 50) + 20;
      store.addBalance(interaction.guild.id, interaction.user.id, amt);
      await interaction.reply({ embeds: [success("💼 Work", `You worked ${jobs[Math.floor(Math.random() * jobs.length)]} and earned **${amt} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("rob").setDescription("Rob a user!").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const bal = store.getBalance(interaction.guild.id, target.id);
      if (bal <= 0) return interaction.reply({ embeds: [error("Poor", `${target.tag} has no money to steal.`)], ephemeral: true });
      const successRoll = Math.random() < 0.5;
      const amount = successRoll ? Math.floor(bal * 0.2) : Math.floor((store.getBalance(interaction.guild.id, interaction.user.id) || 0) * 0.1);
      if (successRoll) {
        store.addBalance(interaction.guild.id, target.id, -amount);
        store.addBalance(interaction.guild.id, interaction.user.id, amount);
        await interaction.reply({ embeds: [success("🦹 Robbed!", `You robbed **${amount} ${config.currency}** from ${target.tag}!`)] });
      } else {
        store.addBalance(interaction.guild.id, interaction.user.id, -amount);
        await interaction.reply({ embeds: [warning("🚨 Got Caught!", `You got caught and paid **${amount} ${config.currency}**!`)] });
      }
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("shop").setDescription("View the shop."),
    async execute(interaction) {
      const items = [
        { name: "🎫 Lottery Ticket", price: 50, desc: "Try your luck!" },
        { name: "🎲 Lucky Dice", price: 100, desc: "+10% gambling luck" },
        { name: "💎 Diamond", price: 500, desc: "A shiny status symbol" },
        { name: "👑 Crown", price: 1000, desc: "Rule the server with style" },
      ];
      const embed = new EmbedBuilder().setTitle("🛒 Shop").setColor(config.colors.primary)
        .setDescription(items.map((i) => `**${i.name}** — ${i.price} ${config.currency}\n↳ ${i.desc}`).join("\n\n"));
      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("buy").setDescription("Buy an item.").addStringOption((o) => o.setName("item").setDescription("Item name").setRequired(true)),
    async execute(interaction) {
      const item = interaction.options.getString("item").toLowerCase();
      const items = { ticket: { name: "🎫 Lottery Ticket", price: 50 }, dice: { name: "🎲 Lucky Dice", price: 100 }, diamond: { name: "💎 Diamond", price: 500 }, crown: { name: "👑 Crown", price: 1000 } };
      const found = items[item];
      if (!found) return interaction.reply({ embeds: [error("Not found", "Item not in shop.")], ephemeral: true });
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (bal < found.price) return interaction.reply({ embeds: [error("Insufficient", "You can't afford that.")], ephemeral: true });
      store.addBalance(interaction.guild.id, interaction.user.id, -found.price);
      store.addItem(interaction.guild.id, interaction.user.id, found.name, 1);
      await interaction.reply({ embeds: [success("Purchased", `You bought **${found.name}** for **${found.price} ${config.currency}**!`)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("inventory").setDescription("View your inventory."),
    async execute(interaction) {
      const inv = store.getInventory(interaction.guild.id, interaction.user.id);
      const entries = Object.entries(inv);
      if (entries.length === 0) return interaction.reply({ embeds: [error("Empty", "Your inventory is empty.")] });
      const text = entries.map(([k, v]) => `**${k}** × ${v}`).join("\n");
      await interaction.reply({ embeds: [info("🎒 Inventory", text)] });
    },
  },
  {
    category: "economy",
    data: new SlashCommandBuilder().setName("give").setDescription("Give an item to a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addStringOption((o) => o.setName("item").setDescription("Item").setRequired(true)),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const item = interaction.options.getString("item");
      const removed = store.removeItem(interaction.guild.id, interaction.user.id, item, 1);
      if (!removed) return interaction.reply({ embeds: [error("Not found", "You don't have that item.")], ephemeral: true });
      store.addItem(interaction.guild.id, target.id, item, 1);
      await interaction.reply({ embeds: [success("Given", `You gave **${item}** to **${target.tag}**.`)] });
    },
  },
  {
    category: "admin",
    data: new SlashCommandBuilder().setName("setmoney").setDescription("Set a user's balance.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("Amount").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      store.setBalance(interaction.guild.id, target.id, amount);
      await interaction.reply({ embeds: [success("Balance Set", `**${target.tag}** now has **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "admin",
    data: new SlashCommandBuilder().setName("addmoney").setDescription("Add money to a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("Amount").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      store.addBalance(interaction.guild.id, target.id, amount);
      await interaction.reply({ embeds: [success("Money Added", `Added **${amount} ${config.currency}** to **${target.tag}**.`)] });
    },
  },
  {
    category: "admin",
    data: new SlashCommandBuilder().setName("removemoney").setDescription("Remove money from a user.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).addIntegerOption((o) => o.setName("amount").setDescription("Amount").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      store.addBalance(interaction.guild.id, target.id, -amount);
      await interaction.reply({ embeds: [success("Money Removed", `Removed **${amount} ${config.currency}** from **${target.tag}**.`)] });
    },
  },
  {
    category: "admin",
    data: new SlashCommandBuilder().setName("resetmoney").setDescription("Reset a user's balance.").addUserOption((o) => o.setName("user").setDescription("The user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
      const target = interaction.options.getUser("user");
      store.setBalance(interaction.guild.id, target.id, config.startingBalance);
      store.setBank(interaction.guild.id, target.id, 0);
      await interaction.reply({ embeds: [success("Balance Reset", `**${target.tag}**'s balance was reset to **${config.startingBalance} ${config.currency}**.`)] });
    },
  },
  {
    category: "admin",
    data: new SlashCommandBuilder().setName("resetall").setDescription("Reset all balances.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
      store.resetAll(interaction.guild.id);
      await interaction.reply({ embeds: [success("Reset Complete", "All balances in this server were reset.")] });
    },
  },
];

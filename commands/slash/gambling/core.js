const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const store = require("../../../utils/store");
const config = require("../../../config");
const { success, error, info, warning } = require("../../../utils/embed");

function checkBet(interaction, amount) {
  if (!amount || amount <= 0) return { err: "Bet must be positive." };
  const bal = store.getBalance(interaction.guild.id, interaction.user.id);
  if (amount > bal) return { err: `You only have **${bal} ${config.currency}**.` };
  return { bet: amount };
}

module.exports = [
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("coinflip").setDescription("Gamble on a coin flip.").addIntegerOption((o) => o.setName("amount").setDescription("Bet amount").setRequired(true)).addStringOption((o) => o.setName("side").setDescription("Heads or tails").setRequired(true).addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const side = interaction.options.getString("side");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const win = result === side;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, amount);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)(`🪙 ${result.toUpperCase()}!`, win ? `You won **${amount} ${config.currency}**! 🎉` : `You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("dice").setDescription("Gamble on a dice roll.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)).addIntegerOption((o) => o.setName("guess").setDescription("Guess 1-6").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const guess = interaction.options.getInteger("guess");
      if (guess < 1 || guess > 6) return interaction.reply({ embeds: [error("Invalid", "Guess must be 1-6.")], ephemeral: true });
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const roll = Math.floor(Math.random() * 6) + 1;
      const win = roll === guess;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, amount * 5);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)(`🎲 Rolled ${roll}!`, win ? `You guessed ${guess} and won **${amount * 5} ${config.currency}**! 🎉` : `You guessed ${guess} but it was ${roll}. Lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("slots").setDescription("Play the slot machine.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const symbols = ["🍒", "🍋", "🍇", "💎", "7️⃣", "🔔"];
      const r = () => symbols[Math.floor(Math.random() * symbols.length)];
      const a = r(), b = r(), c = r();
      const win = a === b && b === c;
      const payout = win ? amount * 3 : amount * 0;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, payout);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)(`🎰 ${a} ${b} ${c}`, win ? `Jackpot! You won **${payout} ${config.currency}**! 🎉` : `No match. You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("blackjack").setDescription("Play blackjack.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const p = Math.floor(Math.random() * 21) + 4;
      const d = Math.floor(Math.random() * 21) + 4;
      let win = p > d && p <= 21;
      if (p > 21) win = false;
      if (d > 21 && p <= 21) win = true;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, amount);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🃏 Blackjack", `You: **${p}** | Dealer: **${d}**\n${win ? `You won **${amount} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`}`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("lottery").setDescription("Buy a lottery ticket."),
    async execute(interaction) {
      const price = 50;
      const bal = store.getBalance(interaction.guild.id, interaction.user.id);
      if (bal < price) return interaction.reply({ embeds: [error("Insufficient", `Tickets cost **${price} ${config.currency}**.`)], ephemeral: true });
      store.addBalance(interaction.guild.id, interaction.user.id, -price);
      store.addItem(interaction.guild.id, interaction.user.id, "🎫 Lottery Ticket", 1);
      await interaction.reply({ embeds: [success("🎟️ Ticket Bought", `You bought a lottery ticket for **${price} ${config.currency}**! Good luck!`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("roulette").setDescription("Play roulette.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)).addStringOption((o) => o.setName("color").setDescription("Red, black, or green").setRequired(true).addChoices({ name: "Red", value: "red" }, { name: "Black", value: "black" }, { name: "Green", value: "green" })),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const color = interaction.options.getString("color");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const result = Math.floor(Math.random() * 37);
      const resultColor = result === 0 ? "green" : (result % 2 === 0 ? "black" : "red");
      const win = color === resultColor;
      const payout = win ? (color === "green" ? amount * 35 : amount) : 0;
      if (payout) store.addBalance(interaction.guild.id, interaction.user.id, payout);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🔴 Roulette", `Ball landed on **${result} (${resultColor})**.\n${win ? `You won **${payout} ${config.currency}**! 🎉` : `You lost **${amount} ${config.currency}**.`}`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("highlow").setDescription("Guess high or low.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)).addStringOption((o) => o.setName("guess").setDescription("High or low").setRequired(true).addChoices({ name: "High", value: "high" }, { name: "Low", value: "low" })),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const guess = interaction.options.getString("guess");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const num = Math.floor(Math.random() * 100) + 1;
      const isHigh = num >= 50;
      const win = isHigh === (guess === "high");
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, amount);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("⬆️⬇️ High/Low", `Number: **${num}** (${isHigh ? "high" : "low"})\n${win ? `You won **${amount} ${config.currency}**!` : `You lost **${amount} ${config.currency}**.`}`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("gamble").setDescription("Gamble a random percentage.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const win = Math.random() < 0.5;
      const payout = win ? Math.floor(amount * (1 + Math.random() * 2)) : amount;
      if (win) store.addBalance(interaction.guild.id, interaction.user.id, payout);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🎲 Gamble", win ? `You won **${payout} ${config.currency}**! 🎉` : `You lost **${amount} ${config.currency}**.`)] });
    },
  },
  {
    category: "gambling",
    data: new SlashCommandBuilder().setName("scratch").setDescription("Scratch a card.").addIntegerOption((o) => o.setName("amount").setDescription("Bet").setRequired(true)),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount");
      const check = checkBet(interaction, amount);
      if (check.err) return interaction.reply({ embeds: [error("Invalid", check.err)], ephemeral: true });
      const win = Math.random() < 0.3;
      const payout = win ? amount * 2 : 0;
      const reveal = win ? "💰💰💰" : "❌❌❌";
      if (payout) store.addBalance(interaction.guild.id, interaction.user.id, payout);
      else store.addBalance(interaction.guild.id, interaction.user.id, -amount);
      await interaction.reply({ embeds: [(win ? success : error)("🎫 Scratch Card", `${reveal}\n${win ? `You won **${payout} ${config.currency}**!` : `No luck. Lost **${amount} ${config.currency}**.`}`)] });
    },
  },
];

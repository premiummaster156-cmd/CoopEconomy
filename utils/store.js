const fs = require("fs");
const path = require("path");
const config = require("../config");
const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "store.json");
let memory = { balances: {}, inventory: {}, cooldowns: {}, daily: {}, banks: {}, leaderboardCache: {} };

function load() {
  try { if (fs.existsSync(FILE)) memory = { ...memory, ...JSON.parse(fs.readFileSync(FILE, "utf8")) }; } catch (err) {}
}
function save() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(memory, null, 2)); } catch (err) {}
}
load();

function key(guildId, userId) { return `${guildId}:${userId}`; }

function getUser(guildId, userId) {
  const k = key(guildId, userId);
  if (!memory.balances[k]) {
    memory.balances[k] = { balance: config.startingBalance, bank: 0, updatedAt: new Date().toISOString() };
    save();
  }
  return memory.balances[k];
}

function getBalance(guildId, userId) { return getUser(guildId, userId).balance; }
function getBank(guildId, userId) { return getUser(guildId, userId).bank; }

function addBalance(guildId, userId, amount) {
  const u = getUser(guildId, userId);
  u.balance += amount;
  u.updatedAt = new Date().toISOString();
  save();
  return u.balance;
}
function setBalance(guildId, userId, amount) {
  const u = getUser(guildId, userId);
  u.balance = amount;
  u.updatedAt = new Date().toISOString();
  save();
  return u.balance;
}
function addBank(guildId, userId, amount) {
  const u = getUser(guildId, userId);
  u.bank += amount;
  u.updatedAt = new Date().toISOString();
  save();
  return u.bank;
}
function setBank(guildId, userId, amount) {
  const u = getUser(guildId, userId);
  u.bank = amount;
  u.updatedAt = new Date().toISOString();
  save();
  return u.bank;
}
function getInventory(guildId, userId) {
  const k = `${guildId}:${userId}`;
  if (!memory.inventory[k]) { memory.inventory[k] = {}; save(); }
  return memory.inventory[k];
}
function addItem(guildId, userId, item, count = 1) {
  const inv = getInventory(guildId, userId);
  inv[item] = (inv[item] || 0) + count;
  save();
}
function removeItem(guildId, userId, item, count = 1) {
  const inv = getInventory(guildId, userId);
  if (!inv[item]) return false;
  inv[item] -= count;
  if (inv[item] <= 0) delete inv[item];
  save();
  return true;
}
function canDaily(guildId, userId) {
  const k = key(guildId, userId);
  const last = memory.daily[k];
  if (!last) return true;
  const now = Date.now();
  return now - last >= 24 * 60 * 60 * 1000;
}
function setDaily(guildId, userId) {
  memory.daily[key(guildId, userId)] = Date.now();
  save();
}
function getLeaderboard(guildId, limit = 10) {
  const prefix = guildId + ":";
  const entries = Object.entries(memory.balances)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, v]) => ({ userId: k.split(":")[1], balance: v.balance + v.bank }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
  return entries;
}

function resetAll(guildId) {
  const prefix = guildId + ":";
  for (const k of Object.keys(memory.balances)) if (k.startsWith(prefix)) delete memory.balances[k];
  for (const k of Object.keys(memory.inventory)) if (k.startsWith(prefix)) delete memory.inventory[k];
  save();
}

module.exports = {
  getUser, getBalance, getBank, addBalance, setBalance, addBank, setBank,
  getInventory, addItem, removeItem, canDaily, setDaily, getLeaderboard, resetAll,
};

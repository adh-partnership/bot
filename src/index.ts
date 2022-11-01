import Discord, { Intents } from "discord.js";
import fs from "fs";
import path from "path";
import Log from "./lib/Log";
import Client from "./lib/Client";
import cron from "node-cron";
import axios from "axios";
import Utils from "./lib/Utils";

if (!fs.existsSync(path.resolve("config.json"))) {
  Log.error("Config not found");
  process.exit(1);
}

global.__version = "1.2.0";
global.__basedir = __dirname;

const config: Config = JSON.parse(fs.readFileSync(path.resolve("config.json")).toString());

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
  partials: ["CHANNEL"],
});
client.githubToken = config.github.token;
client.rosterAPI = config.facility.roster_api;

let guild: Discord.Guild;
Log.info(`MASTER CONTROL PROGRAM ${global.__version}`);

client.on("ready", async () => {
  Log.info(`Logged in as ${client.user.tag}`);
  client.user.setActivity("Falcon", { type: "WATCHING" });
  guild = client.guilds.cache.first();
  guild.me.setNickname("Master Control Program");
  await guild.roles.fetch();
  const roles = config.facility.roles;
  // Roles to ignore name settings
  const rolesToIgnore = ["bot-ignore"];
  let rc: roleCache = {};

  Object.keys(roles).forEach(async (key) => {
    const role = guild.roles.cache.find((r) => r.name === roles[key]);
    rc[key] = role.id;
    console.log(`Set role ${key} to ${role.id}`);
  });
  client.roleCache = rc;
  let rci: roleCache = {};
  rolesToIgnore.forEach(async (r) => {
    rci[r] = guild.roles.cache.find((rl) => rl.name === r)?.id;
    console.log(`Role to ignore ${r} found with id ${rci[r]}`);
  });
  client.ignoredRoleCache = rci;
  Utils.UpdateMembers(client);
  /*
  await client.guilds.cache.first().members.fetch(); // Update Member Cache
  const data = (await axios.get("https://denartcc.org/getRoster")).data;
  data.forEach(async (controller) => {
    if (client.guilds.cache.first().members.cache.has(controller.discord)) {
      let member = await client.guilds.cache.first().members.fetch(controller.discord);

      Utils.VerifyRoles(client, member, controller);
    }
  });
*/
  cron.schedule("*/5 * * * *", async () => {
    Utils.UpdateMembers(client);
  });
});

client.on("guildMemberAdd", (member) => {
  member.roles.add(client.roleCache["guest"]);
});

client.loadEvents("./events");
client.loadCommands("./commands");
//client.loadDatabase(config.database);

client.login(config.discord.token);

export { guild };

import Discord, { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import Command from "../commands/Command";
import Log from "./Log";
import { resolve, join } from "path";
import DataStore from "./DataStore";

export default class Client extends Discord.Client {
  commands: Discord.Collection<string, Command>;
  aliases: Discord.Collection<string, Command>;
  slashcommands: Discord.Collection<string, Command>;
  roleCache: roleCache;
  ignoredRoleCache: roleCache;
  githubToken: string;
  rosterAPI: string;
  config: Config;
  datastore: DataStore;

  constructor(options?) {
    super(options);
    this.commands = new Discord.Collection();
    this.aliases = new Discord.Collection();
    this.slashcommands = new Discord.Collection();
    this.datastore = new DataStore();
    this.datastore.load();
  }

  loadCommands(path) {
    Log.info("Loading commands...");
    readdirSync(resolve(global.__basedir, path)).filter(f => !f.endsWith(".js") && !f.endsWith(".map")).forEach(dir => {
      const commands = readdirSync(resolve(global.__basedir, join(path, dir))).filter(f => f.endsWith(".js"));
      commands.forEach(f => {
        const Command = require(resolve(global.__basedir, join(path, dir, f)));
        const command = new Command.default(this);
        let valid = false;

        if (command.command !== undefined && command.command !== "") {
          Log.info(`Loaded command: ${command.command}`)
          this.commands.set(command.command, command);
          if (command.alias) {
            this.aliases.set(command.alias, command);
          }
          valid = true;
        }

        if (command.slashcommand !== undefined && command.slashcommand !== "") {
          Log.info(`Loaded slash command: ${command.slashcommand}`)
          this.slashcommands.set(command.slashcommand, command);
          valid = true;
        }


        if (!valid) {
          Log.info(`Problem while loading ${join(path, dir, f)}, doesn't appear to be a valid command file.`);
        }
      })
    });
    return this;
  }

  loadEvents(path) {
    readdirSync(resolve(global.__basedir, path)).filter(f => f.endsWith(".js")).forEach(file => {
      const event = require(resolve(global.__basedir, join(path, file)));
      const eventName = file.substring(0, file.indexOf("."));
      super.on(eventName, event.default.bind(null, this));
      delete require.cache[require.resolve(resolve(global.__basedir, join(path, file)))]; // Delete cache
      Log.info(`Loaded event: ${eventName}`);
    });
    return this;
  }

  registerSlashCommands() {
    const rest = new REST({ version: "10" }).setToken(this.config.discord.token);
    const commands = [];

    this.slashcommands.forEach(command => {
      commands.push(command.slashcommandb.toJSON());
    });

    Log.info(`Registering slash commands... ${JSON.stringify(commands)}`)

    rest.put(Routes.applicationGuildCommands(this.config.discord.appid, this.config.discord.guild), { body: commands }).then(() => {
      Log.info("Successfully registered slash commands.");
    }).catch(err => {
      Log.error("Error registering slash commands: " + err);
    });
  }
}

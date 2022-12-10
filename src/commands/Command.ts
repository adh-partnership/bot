import Discord, { PermissionsBitField } from "discord.js";

class Command {
  client: Discord.Client;
  command: string;
  description: string;
  name?: string;
  slashcommand?: string;
  slashcommandb?: Discord.SlashCommandBuilder;
  roles: string[];
  alias: string;

  constructor(client: Discord.Client, options: Command.Options) {
    this.validateOptions(options)
    this.client = client;
    this.command = options.command;
    this.alias = options.alias;
    this.description = options.description;
    this.roles = options.roles;
    this.slashcommand = options.slashcommand;
    this.slashcommandb = options.slashcommandb;
  }

  handle(_: Discord.Message, __: string[]) {
    throw new Error(`${this.command} has no handle method defined.`);
  }

  handleSlash(interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>) {
    throw new Error(`${this.command} has no handleSlash method defined.`);
  }

  handleModalSubmit(interaction: Discord.CommandInteraction<Discord.CacheType>) {
    throw new Error(`${this.command} has no handleModalSubmit method defined.`);
  }

  handleSelectMenu(interaction: Discord.StringSelectMenuInteraction<Discord.CacheType>) {
    throw new Error(`${this.command} has no handleSelectMenu method defined.`);
  }

  checkPermissions(message: Discord.Message, ownerOverride = true): boolean {
    let matched = false;
    this.roles.forEach((v) => {
      if (v.toLowerCase() === "administrator" && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) matched = true;
      if (v.toLowerCase() === "everyone") matched = true;
      if (message.member.roles.cache.has(v)) matched = true;
    });
    return matched;
  }

  checkInteractionPermissions(interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>, ownerOverride = true): boolean {
    let matched = false;
    this.roles.forEach((v) => {
      if (v.toLowerCase() === "administrator" && (interaction.member as Discord.GuildMember).permissions.has(PermissionsBitField.Flags.Administrator)) matched = true;
      if (v.toLowerCase() === "everyone") matched = true;
      if ((interaction.member as Discord.GuildMember).roles.cache.has(v)) matched = true;
    });
    return matched;
  }

  validateOptions(options: Command.Options): void {
    if (!options.command && !options.slashcommand) {
      let fail = "Cannot register command: command received without a command or slashcommand property";
      throw new TypeError(fail);
    }

    if (options.roles === undefined || !Array.isArray(options.roles)) {
      let fail = "Cannot register command: command received without a valid roles array";
      throw new TypeError(fail);
    }
  }
}

export default Command;
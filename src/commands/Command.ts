import Discord from "discord.js";

class Command {
  client: Discord.Client;
  command: string;
  roles: string[];

  constructor(client: Discord.Client, options: Command.Options) {
    this.validateOptions(options)
    this.client = client;
    this.command = options.command;
    this.roles = options.roles;
  }

  handle(_: Discord.Message, __: string[]) {
    throw new Error(`${this.command} has no handle method defined.`);
  }

  checkPermissions(message: Discord.Message, ownerOverride = true): boolean {
    let matched = false;
    this.roles.forEach((v) => {
      if (message.member.roles.cache.has(v)) matched = true;
    });
    return matched;
  }

  validateOptions(options: Command.Options): void {
    if (!options.command) {
      let fail = "Cannot register command: command received without a command property";
      throw new TypeError(fail);
    }

    if (options.roles === undefined || Array.isArray(options.roles)) {
      let fail = "Cannot register command: command received without a valid roles array";
      throw new TypeError(fail);
    }
  }
}

export default Command;
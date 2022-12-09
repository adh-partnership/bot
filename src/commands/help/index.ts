import Discord, { EmbedBuilder } from "discord.js";
import Client from "../../lib/Client";
import Command from "../Command";

export default class HelpCommand extends Command {
  constructor(client: Discord.Client) {
    super(client, {
      command: "help",
      description: "Shows MCP Help",
      roles: [
        "everyone"
      ]
    });
  }

  async handle(message: Discord.Message, args: string[]) {
    const embed = new EmbedBuilder();
    embed
      .setTitle("MASTER CONTROL PROGRAM HELP")
      .setDescription("PREFIX: TAG MASTER CONTROL PROGRAM")
      .setFooter({ text: "END OF LINE."})
      .setColor(message.guild.members.me.displayHexColor);
    const commands = [];
    (message.client as Client).commands.forEach(cmd => {
      commands.push(`\`${cmd.command}\` - ${cmd.description}`);
    });
    embed.addFields({name: "Commands", value : commands.join("\n")});
    message.channel.send({ embeds: [embed]});
  }
}
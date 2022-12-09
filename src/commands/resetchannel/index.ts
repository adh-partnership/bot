import Command from "../Command";
import Discord, { SlashCommandBuilder, TextChannel } from "discord.js";
export default class DevServerRestart extends Command {
  constructor(client: Discord.Client) {
    super(client, {
      command: "reset channel",
      slashcommand: "resetchannel",
      slashcommandb: new SlashCommandBuilder()
        .setName("resetchannel")
        .setDescription("Resets the channel (clone and destroy)"),
      description: "Will clone and destroy the channel command is run in",
      roles: [
        "administrator"
      ]
    });
  }

  handle(message: Discord.Message, args: string[]): void {
    this.resetChannel(message.channel as Discord.TextChannel);
  }

  handleSlash(interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>): void {
    this.resetChannel(interaction.channel as Discord.TextChannel);
  }

  async resetChannel(channel: Discord.TextChannel): Promise<void> {
    await channel.clone();
    await channel.delete();
  }
}
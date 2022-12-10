import Discord from "discord.js";
import Client from "../lib/Client";

export default async function (client: Client, interaction: Discord.CommandInteraction) {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    const command = client.slashcommands.get(commandName);
    
    if (command) {
      if (command.checkInteractionPermissions(interaction)) {
        command.handleSlash(interaction);
      } else {
        interaction.reply("YOU DO NOT HAVE ACCESS TO THIS REQUEST. END OF LINE.");
      }
    }
  } else if (interaction.isModalSubmit()) {
    const { customId } = interaction;

    client.slashcommands.get(customId)?.handleModalSubmit(interaction);
  } else if (interaction.isStringSelectMenu()) {
    const { customId } = interaction as Discord.StringSelectMenuInteraction<Discord.CacheType>;

    const command = customId.split("-")[0];

    client.slashcommands.get(command)?.handleSelectMenu(interaction);
  }
}
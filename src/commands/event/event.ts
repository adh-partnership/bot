import Command from "../Command";
import Discord, { SlashCommandBuilder, TextChannel } from "discord.js";
import axios from "axios";
import Client from "../../lib/Client";
import { config } from "process";

export default class DevServerRestart extends Command {
  client: Client;

  constructor(client: Client) {
    super(client, {
      name: "event",
      command: "event",
      slashcommand: "event",
      slashcommandb: new SlashCommandBuilder()
        .setName("event")
        .setDescription("Display event announcements or position assignments"),
      description: "Display event announcements or position assignments",
      roles: client.config.facility.eventRoles,
    });

    this.client = client;
  }

  handle(message: Discord.Message, args: string[]): void {
    message.channel.send(`${message.author}, this command can only be run as a slash command. Please use \`/event\` instead.`);
  }

  handleSlash(interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>): void {
    axios.get(`${this.client.config.facility.api_url}/v1/events?limit=5`).then((res) => {
      const events = res.data;

      const eventOptions: Discord.SelectMenuComponentOptionData[] = [];

      if (events.length === 0) {
        interaction.reply({ content: "No events found.", ephemeral: true });
        return;
      }

      events.forEach((e) => {
        eventOptions.push({
          label: e.title,
          value: JSON.stringify({
            id: e.id.toString(),
            title: e.title,
          }),
        } as Discord.SelectMenuComponentOptionData);
      });

      const eventList = new Discord.StringSelectMenuBuilder()
        .setCustomId("event-list")
        .setPlaceholder("Select an event")
        .addOptions(eventOptions);

      const row = new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>()
        .addComponents(eventList);

      interaction.reply({
        content: "Select an event",
        ephemeral: true,
        components: [row],
      });
    }).catch((err) => {
      console.error(err);
      interaction.reply({ content: "An error occurred while fetching events.", ephemeral: true });
    });
  }

  handleSelectMenu(interaction: Discord.StringSelectMenuInteraction<Discord.CacheType>): void {
    const { customId } = interaction;

    const value = interaction.values[0];

    if (customId === "event-list") {
      const eventInfo = JSON.parse(value);
      const typeList = new Discord.StringSelectMenuBuilder()
        .setCustomId("event-type")
        .setPlaceholder("Select message type")
        .addOptions([
          {
            label: "Announcement",
            value: "announcement",
          },
          {
            label: "Position Assignments",
            value: "assignments",
          },
        ]);
      const row = new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>()
        .addComponents(typeList);

      this.client.datastore.set(`event-${interaction.user.id}`, eventInfo.id);

      interaction
        .update({ content: `Selected event: ${eventInfo.title}. What kind of announcement do you want?`, components: [row] })
        .catch((err) => console.log(err));
    } else if (customId === "event-type") {
      const eventId = this.client.datastore.get(`event-${interaction.user.id}`);
      if (!eventId) {
        interaction.reply({ content: "An error occurred. Please try again.", ephemeral: true });
        return;
      }

      axios.get(`${this.client.config.facility.api_url}/v1/events/${eventId}`).then((r) => {
        const event = r.data;
        const embeds = [];

        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        switch (value) {
          case "announcement":
            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setFooter(
                    {
                      text: "END OF LINE.",
                    }
                );
            embed.setTitle(event.title);
            embed.addFields([
              {
                name: "Starting At",
                value: `${startDate.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: "short" })} ${startDate.toLocaleString('en-GB', { timeZone: 'UTC', timeStyle: "short" })}Z`,
                inline: true,
              },
              {
                name: "Ending At",
                value: `${endDate.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: "short" })} ${endDate.toLocaleString('en-GB', { timeZone: 'UTC', timeStyle: "short" })}Z`,
                inline: true,
              },
              {
                name: "Description",
                value: event.description,
                inline: false,
              }
            ]);
            embed.setImage(event.banner);
            embeds.push(embed);
            break;
          case "assignments":
            const positions = event.positions;

            if (positions.length > 25) {
              const enroutePositionFields: Discord.APIEmbedField[] = [];
              const enrouteEmbed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setTitle(event.title)
                .setDescription("Event Position Assignments")
                .setImage(event.banner);

              positions.forEach((p) => {
                if (p.position === "") return;
                if (!p.position.includes("_CTR")) return;
                let controller: string;
                if (p.user === null) {
                  controller = "Unassigned";
                } else if (p.user.discord_id !== "" && p.user.discord_id !== "NULL") {
                  controller = `<@${p.user.discord_id}>`;
                } else {
                  controller = `${p.user.first_name} ${p.user.last_name} - ${p.user.operating_initials}`;
                }
                enroutePositionFields.push({
                  name: p.position,
                  value: controller,
                  inline: true,
                });
              });

              enrouteEmbed.addFields(enroutePositionFields);

              const traconPositionFields: Discord.APIEmbedField[] = [];
              const traconEmbeds = new Discord.EmbedBuilder()
                  .setColor(Discord.Colors.Red);

              positions.forEach((p) => {
                if (p.position === "") return;
                if (!p.position.includes("_APP") && !p.position.includes("_DEP")) return;
                let controller: string;
                if (p.user === null) {
                  controller = "Unassigned";
                } else if (p.user.discord_id !== "" && p.user.discord_id !== "NULL") {
                  controller = `<@${p.user.discord_id}>`;
                } else {
                  controller = `${p.user.first_name} ${p.user.last_name} - ${p.user.operating_initials}`;
                }
                traconPositionFields.push({
                  name: p.position,
                  value: controller,
                  inline: true,
                });
              });

              traconEmbeds.addFields(traconPositionFields);

              const localPositionFields: Discord.APIEmbedField[] = [];
              const localEmbeds = new Discord.EmbedBuilder()
                  .setColor(Discord.Colors.Red)
                  .setFooter(
                      {
                        text: "END OF LINE.",
                      }
                  );

              positions.forEach((p) => {
                if (p.position === "") return;
                if (!p.position.includes("_TWR") && !p.position.includes("_GND") && !p.position.includes("_DEL")) return;
                let controller: string;
                if (p.user === null) {
                  controller = "Unassigned";
                } else if (p.user.discord_id !== "" && p.user.discord_id !== "NULL") {
                  controller = `<@${p.user.discord_id}>`;
                } else {
                  controller = `${p.user.first_name} ${p.user.last_name} - ${p.user.operating_initials}`;
                }
                traconPositionFields.push({
                  name: p.position,
                  value: controller,
                  inline: true,
                });
              });

              localEmbeds.addFields(localPositionFields);

              embeds.push(enrouteEmbed);
              embeds.push(traconEmbeds);
              embeds.push(localEmbeds);
            } else {
              const positionFields: Discord.APIEmbedField[] = [];

              const embed = new Discord.EmbedBuilder()
                  .setColor(Discord.Colors.Red)
                  .setFooter(
                      {
                        text: "END OF LINE.",
                      }
                  )
                  .setTitle(event.title)
                  .setDescription("Event Position Assignments")
                  .setImage(event.banner);

              positions.forEach((p) => {
                if (p.position === "") return;
                let controller: string;
                if (p.user === null) {
                  controller = "Unassigned";
                } else if (p.user.discord_id !== "" && p.user.discord_id !== "NULL") {
                  controller = `<@${p.user.discord_id}>`;
                } else {
                  controller = `${p.user.first_name} ${p.user.last_name} - ${p.user.operating_initials}`;
                }
                positionFields.push({
                  name: p.position,
                  value: controller,
                  inline: true,
                });
              });
              embed.addFields(positionFields);

              embeds.push(embed);
            }

            break;
          default:
            interaction.reply({ content: "An error occurred. Please try again.", ephemeral: true });
            return;
        }

        this.client.datastore.remove(`event-${interaction.user.id}`);

        interaction.update({ content: `Posting ${value} for event ${event.title}.`, components: [] });

        interaction.channel.send({ embeds });
      }).catch((err) => {
        console.error(err);
        interaction.reply({ content: "An error occurred. Please try again.", ephemeral: true });
      });
    }
  }

  async resetChannel(channel: Discord.TextChannel): Promise<void> {
    await channel.clone();
    await channel.delete();
  }
}

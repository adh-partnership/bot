import Command from "../Command";
import Discord, { SlashCommandBuilder, TextChannel } from "discord.js";
import axios from "axios";
import Client from "../../lib/Client";

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
      roles: [
        "administrator"
      ]
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
      events.forEach((e) => {
        eventOptions.push({
          label: e.title,
          value: e.id.toString(),
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
      console.log(`customId: ${customId}`)

      const value = interaction.values[0];

      if (customId === "event-list") {
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

        this.client.datastore.set(`event-${interaction.user.id}`, value);
        
        interaction.reply({ content: `Selected event. What kind of announcement do you want?`, ephemeral: true, components: [row] }).catch((err) => console.log(err));
      } else if (customId === "event-type") {
        const eventId = this.client.datastore.get(`event-${interaction.user.id}`);
        if (!eventId) {
          interaction.reply({ content: "An error occurred. Please try again.", ephemeral: true });
          return;
        }

        axios.get(`${this.client.config.facility.api_url}/v1/events/${eventId}`).then((r) => {
          const event = r.data;
          const embed = new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Red)
            .setFooter(
              {
                text: "END OF LINE.",
              }
            );
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
          switch (value) {
            case "announcement":
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
              break;
            case "assignments":
              embed.setTitle(event.title);
              embed.setDescription("Event Position Assignments");
              embed.setImage(event.banner);

              const positions = event.positions;
              const positionFields: Discord.APIEmbedField[] = [];
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
              break;
            default:
              interaction.reply({ content: "An error occurred. Please try again.", ephemeral: true });
              return;
          }

          this.client.datastore.remove(`event-${interaction.user.id}`);

          interaction.reply({ content: "Posting...", ephemeral: true });

          interaction.channel.send({ embeds: [embed] });
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
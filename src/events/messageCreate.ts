import Discord from "discord.js";
import Client from "../lib/Client";

export default async function (client: Client, message: Discord.Message) {
  const prefixRegex = new RegExp(`^(<@!?&?${client.user.id}>)\\s*`);
  if (prefixRegex.test(message.content)) {
    const [, match] = message.content.match(prefixRegex);
    const args = message.content.slice(match.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const msg = message.content.slice(match.length).trim();
    const command =
      client.commands.get(msg) ||
      findCommand(client, message.content.slice(match.length).trim().split(/ +/g)) ||
      client.commands.get(cmd); // If command not found as match, try single word command
    if (command) {
      if (!command.checkPermissions(message)) {
        message.channel.send("YOU DO NOT HAVE ACCESS TO THIS REQUEST. END OF LINE.");
      } else {
        command.handle(message, message.content.slice(match.length).trim().split(/ +/g));
      }
    }
  }
}

function findCommand(client: Client, args: string[]) {
  for (const [cmd, value] of client.commands) {
    const numWords = cmd.split(" ").length;
    const equivCmd = args.slice(0, numWords).join(" ");

    if (equivCmd.toLowerCase() == cmd.toLowerCase()) {
      return value;
    }
  }
}

import Discord, { GuildMember } from "discord.js";
import Client from "./Client";
import Controller from "./Controller";
import Log from "./Log";
import axios from "axios";

let cronRunning = false;

class Utils {
  static async UpdateMembers(client: Client) {
    if (!cronRunning) {
      Log.info("Starting cron job");
      cronRunning = true;
      try {
        await client.guilds.cache.first().roles.fetch(); // Update Role Cache
      } catch (e) {
        console.log("Failed to update role cache", e);
        cronRunning = false;
        return;
      }

      try {
        await client.guilds.cache.first().members.fetch(); // Update Member Cache
      } catch (e) {
        console.log("Failed to update member cache", e);
        cronRunning = false;
        return;
      }

      let data;

      try {
        data = (await axios.get(client.rosterAPI)).data;
      } catch (e) {
        console.log("Failed to get roster", e);
        cronRunning = false;
        return;
      }

      let dealtWith = [];
      data.forEach(async (controller) => {
        if (client.guilds.cache.first().members.cache.has(controller.discord_id)) {
          let member = await client.guilds.cache.first().members.fetch(controller.discord_id);
          dealtWith.push(member.id);
          Utils.VerifyRoles(client, member, controller);
        }
      });

      Log.info("Finished cron job");
      cronRunning = false;
    } else {
      Log.info("Cron is already running, skipping update");
    }
  }

  // @TODO define type for controller
  static VerifyRoles(client: Client, member: GuildMember, con: any) {
    let shouldHaveRoles = [];
    // Check guest, home, visitor
    if (Controller.isHomeController(con)) {
      shouldHaveRoles.push(client.roleCache["member"]);
    } else if (Controller.isVisitor(con)) {
      shouldHaveRoles.push(client.roleCache["visitor"]);
    } else {
      shouldHaveRoles.push(client.roleCache["guest"]);
    }

    // Okay, now let's check their roles...
    // Assign roles they should have
    shouldHaveRoles.forEach(val => {
      if (!member.roles.cache.has(val)) {
        Log.info(`Member ${member.nickname} is missing role ${val}`);
        member.roles.add(val).catch((err) => {
          Log.error(`Error adding role to ${member.nickname}, role is ${member.guild.roles.cache.get(val).name}: ${err}`);
        });
      }
    });

    // Now check roles they have to find ones they should not [but only ones we care about]
    member.roles.cache.forEach(r => {
      if (Object.values(client.roleCache).indexOf(r.id) > -1) {
        if (!shouldHaveRoles.includes(r.id)) {
          Log.info(`Member ${member.nickname} shouldn't have role ${r.name}`);
          member.roles.remove(r.id).catch((err) => {
            Log.error(`Error deleting role from ${member.nickname}, role is ${r.name}: ${err}`);
          });
        }
      }
    });

    let ignore = false;
    Object.keys(client.ignoredRoleCache).forEach(k => {
      if (member.roles.cache.has(client.ignoredRoleCache[k])) ignore = true;
    });

    if (!ignore && con.initials !== null) {
      let nickname = `${con.first_name} ${con.last_name}${Controller.getThirdArgument(con)}`;

      // Just in case we hit a really long name...
      // Should be rare...
      if (nickname.length > 32) {
        // Logic: if firstname + last initial + get third argument is <= 32, use that
        // otherwise, also truncate part of the first name to get to a length of 32
        let remainder_length = Controller.getThirdArgument(con).length;
        if (con.first_name.length + 2 + remainder_length <= 32) {
            nickname = `${con.first_name} ${con.last_name.substr(0,1)}. ${Controller.getThirdArgument(con)}`;
        } else {
            let first = `${con.first_name.substring(0, 32 - (2 + remainder_length))}.`;
            nickname = `${first} ${con.last_name.substr(0,1)}. ${Controller.getThirdArgument(con)}`;
        }
      }

      if (member.nickname !== nickname && member.user.username != nickname) {
        Log.info(`Member ${member.nickname} to be reset to ${nickname}`);
        member.setNickname(nickname).catch((err) => {
          Log.error(`Error changing nickname of ${member.nickname} to ${nickname}: ${err}`);
        });
      }
    }
  }
}

export default Utils;

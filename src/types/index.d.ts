declare namespace NodeJS {
  export interface Global {
    __version: string;
    __basedir: string;
  }
}

declare interface Config {
  discord: {
    appid: string;
    guild: string;
    token: string;
  };
  github: {
    token: string;
  };
  facility: {
    name: string;
    issue_github_repo: string;
    api_url: string;
    roster_api: string;
    roles: { [key: string]: string };
    nickname_format: string;
    eventRoles: string[];
  };
  database: DBConfig;
}

declare interface DiscordLink {
  type: string;
  license: string;
  discord: string;
}

declare interface SMConfig {
  ip: string;
  port: number;
  restartTimes: number[];
  restartCmd: string;
}

declare interface roleCache {
  [key: string]: string;
}

declare interface ApplicationConfig {
  type: string;
  docId: string;
  sheetId: string;
  announce: {
    column: number;
    values: { [key: string]: string } | string;
  };
}

declare interface DBConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

declare interface RconConfig {
  host: string;
  port: number;
  password: string;
}

declare interface ApplicationData {
  docid: string;
  name: string;
  channel: string;
  applications: { [key: string]: string }[];
}

declare namespace Command {
  type SlashCommandBuilder = import("discord.js").SlashCommandBuilder;

  interface Options {
    name?: string;
    command: string;
    alias?: string;
    slashcommand?: string;
    slashcommandb?: SlashCommandBuilder | any;
    description: string;
    roles: string[];
  }
}

declare interface T_Controller {
  certifications: {
    approach: string;
    enroute: string;
    ground: string;
    local: string;
    major_approach: string;
    major_ground: string;
    major_local: string;
    oceanic: string;
  };
  cid: number;
  controller_type: string;
  created_at: string;
  discord_id: string;
  division: string;
  exempted_from_activity: false;
  first_name: string;
  last_name: string;
  operating_initials: string;
  rating: string;
  region: string;
  roles: string[];
  roster_join_date: string;
  status: string;
  subdivision: string;
  updated_at: string;
}

#!/bin/sh

cat >config.json <<!SUB!THIS!
{
  "discord": {
    "appid": "$DISCORD_APPID",
    "guild": "$DISCORD_GUILD",
    "token": "$DISCORD_TOKEN"
  },
  "github": {
    "token": "$GITHUB_TOKEN"
  },
  "facility": {
    "api_url": "$FACILITY_API",
    "roster_api": "$ROSTER_API",
    "roles": {
      "visitor": "$VISITOR_ROLE",
      "member": "$MEMBER_ROLE",
      "guest": "$GUEST_ROLE"
    }
  }
}
!SUB!THIS!

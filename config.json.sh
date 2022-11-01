#!/bin/sh

cat >config.json <<!SUB!THIS!
{
  "discord": {
    "token": "$DISCORD_TOKEN"
  },
  "github": {
    "token": "$GITHUB_TOKEN"
  },
  "facility": {
    "roster_api": "$ROSTER_API",
    "roles": [
      "visitor": "$VISITOR_ROLE",
      "member": "$MEMBER_ROLE",
      "guest": "$GUEST_ROLE",
    ]
  }
}
!SUB!THIS!

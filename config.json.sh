#!/bin/sh

echo $BOT_CONFIG | base64 -d > ./config.json

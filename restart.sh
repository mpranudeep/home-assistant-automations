#!/bin/bash

cd /home/pi/production/home-assistant-automations
docker-compose down
docker-compose up -d
cd ~/MyServers/MediaStack

 docker-compose restart flaresolverr

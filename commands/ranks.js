"use strict"
const configUtils = require('../helper_services/config_helper')
const liveService = require('../helper_services/if_live_api_helper')
const messageCreator = require('../helper_services/message_creator');

module.exports = {
    name: "ranks",
    description: "Get the ranks of AFKLM",
    async execute(message) {
      message.channel.send(
          `
***Cadet (0 hours)***: Regional Routes
***Second Officer(15 hours)***: Short Haul Routes
***First Officer(45 hours)***: Medium Haul Routes (Can fly <#780498792763883520>)
***Sr. First Officer(75 hours)***: Long Haul Routes
***Captain(120 hours)***: Ultra Long Haul Routes
***Sr. Captain(165 hours)***: Fifth Freedom / Codeshare routes
***Commander(225 hours)***: Cargo/Vintage
***Rank 8(300 hours)***: Career Mdoe
          `
      );
      return;
    }
}
"use strict";
const messageCreator = require("../helper_services/wt_messages");
const wtHelper = require("../helper_services/wt_helper");
const configUtils = require("../helper_services/config_helper");

module.exports = {
  name: "wt",
  description: "Get World Tour Route Info",
  async execute(message) {
    let splitMessage = message.content.split(" ");
    let dmFlag =
      splitMessage.length > 2 && splitMessage[2].toUpperCase() === "DM";
    try {
      if (parseInt(splitMessage[1]) > 35) {
        let returnMessage = messageCreator.invalidLegMessage();
        await message.channel.send(returnMessage);
        return;
      }
    } catch {
      let returnMessage = messageCreator.invalidLegMessage();

      await message.channel.send(returnMessage);
      return;
    }
    let guildId = message.guild.id;
    let guildData = await configUtils.loadGuildConfigs(guildId);
    const legDetails = await wtHelper.fetchLeg(guildData.afklm_special, parseInt(splitMessage[1]));
    const returnMessages = messageCreator.createLegDetails(legDetails, dmFlag);
    if (dmFlag) {
      await message.channel.send(returnMessages[0]);
      await message.author.send(returnMessages[1]);
      await message.author.send(returnMessages[2]);
    } else {
      await message.channel.send(returnMessages[0]);
    }
  },
};

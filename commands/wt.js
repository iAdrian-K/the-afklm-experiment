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
      if (parseInt(splitMessage[1]) > 36 || splitMessage.length < 2) {
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
    if (
      !("callsign_patterns" in guildData) ||
      !("discord_callsign" in guildData["callsign_patterns"])
    ) {
      message.channel.send(
        "Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***"
      );
      message.channel.send(">update");

      return;
    }
    const legDetails = await wtHelper.fetchLeg(
      guildData.afklm_special,
      parseInt(splitMessage[1])
    );
    const returnMessages = messageCreator.createLegDetails(legDetails, dmFlag);

    await message.reply("Hey friend, I have DMed you the details of the leg.");
    await message.author.send(returnMessages[0]);
    await message.author.send(returnMessages[1]);
    await message.author.send(returnMessages[2]);
  },
};

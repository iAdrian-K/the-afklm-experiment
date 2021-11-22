"use strict";
const configUtils = require("../helper_services/config_helper");
const careerHelper = require("../helper_services/career_airtable_helper");
const utils = require("../helper_services/utils");
const messageCreator = require("../helper_services/message_creator");

module.exports = {
  name: "cm_stats",
  description: "Loads the CM data",
  async execute(message) {
    let guildId = message.guild.id;
    let guildData = await configUtils.loadGuildConfigs(guildId);
    if (guildData === {}) {
      message.channel.send(
        "Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***"
      );
      message.channel.send(">update");
      message.channel.send(">magic_time");
      return;
    }
    if (!("career_mode_airtable_connection" in guildData)) {
      message.channel.send(
        "Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***"
      );
      message.channel.send(">update");
      message.channel.send(">magic_time");
      return;
    }
    if (
      !("callsign_patterns" in guildData) ||
      !("discord_callsign" in guildData["callsign_patterns"])
    ) {
      message.channel.send(
        "Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***"
      );
      message.channel.send(">update");
      message.channel.send(">magic_time");
      return;
    }
    if (!("callsign_prefix_airtable" in guildData["callsign_patterns"])) {
      message.channel.send(
        "Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***"
      );
      message.channel.send(">update");
      message.channel.send(">magic_time");
      return;
    }
    if (
      !("callsign_column_name" in guildData["career_mode_airtable_connection"])
    ) {
      message.channel.send(
        "Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***"
      );
      message.channel.send(">update");
      message.channel.send(">magic_time");
      return;
    }
    let careerModeData = await careerHelper.fetchCareerModeLogs(
      guildData["career_mode_airtable_connection"]
    );
    if (careerModeData === []) {
      message.channel.send("Unable to fetch data from airtable");
      return;
    }
    let callsign = await utils.getCallSign(
      message,
      guildData["callsign_patterns"]["discord_callsign"],
      guildData["callsign_patterns"]["callsign_prefix_airtable"]
    );
    if (callsign === "") {
      message.channel.send(
        "Your callsign couldn't be extracted from your Discord Display Name! Make sure the pattern is correct"
      );
      return;
    }
    let record = await utils.filterRecordByCallsign(
      careerModeData,
      guildData["career_mode_airtable_connection"]["callsign_column_name"],
      callsign
    );
    if (record === {}) {
      message.channel.send(
        "Sorry your record could not be found in airtable!!"
      );
      return;
    }
    let responseMessage = await messageCreator.createCmStatsMessage(
      record,
      guildData["career_mode_airtable_connection"]["fields"],
      guildData["career_mode_airtable_connection"]["callsign_column_name"]
    );
    message.channel.send(responseMessage);
  },
};

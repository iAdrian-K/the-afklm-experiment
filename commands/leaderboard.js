"use strict"
const configUtils = require('../helper_services/config_helper');
const airtableHelper = require("../helper_services/wt_helper");
const utils = require("../helper_services/utils");
const messageCreator = require('../helper_services/wt_messages');
module.exports = {
    name: "leaderboard",
    description: "Get World Tour Leaderboard",
    async execute(message) {
        let guildId = message.guild.id;
        let guildData = await configUtils.loadGuildConfigs(guildId)
        //let logs = await airtableHelper.fetchWorldTourLogs(guildData.afklm_special)
        let leaders = await airtableHelper.fetchLeaderboard(guildData.afklm_special);
        // let pilots = {};
        // logs.forEach(log => {
        //     if(pilots.hasOwnProperty(log.callsignId)){
        //         pilots[log.callsignId].push(log.routeId)
        //     }else{
        //         pilots[log.callsignId] = [log.routeId]
        //     }
        // })
        // let leaders = await utils.getLeaderboards(pilots)
        let replyMessage = await messageCreator.createLeaderBoard(leaders);
        await message.channel.send(replyMessage);
    }
} 
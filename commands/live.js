"use strict"
const configUtils = require('../helper_services/config_helper')
const liveService = require('../helper_services/if_live_api_helper')
const messageCreator = require('../helper_services/message_creator');

module.exports = {
    name: "live",
    description: "Get the live flying stats of the VA members",
    async execute(message) {
        let guildId = message.guild.id;
        let guildData = await configUtils.loadGuildConfigs(guildId)
        if(guildData === {}){
            message.channel.send("Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***");
            message.channel.send(">update");
            return;
        }
        message.channel.send('Fetching your VAs live flights. Give me a second or two.')
        var liveFlights = await liveService.getFlights(process.env.IF_API_KEY, guildData);
        var messages = await messageCreator.createLiveMessage(liveFlights);
        for(let i=0; i<messages.length; i++)message.channel.send(messages[i]);
    }
}
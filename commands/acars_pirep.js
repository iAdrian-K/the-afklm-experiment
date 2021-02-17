"use strict"
const configUtils = require('../helper_services/config_helper')
const ifHelper = require('../helper_services/if_live_api_helper')
const messageCreator = require('../helper_services/message_creator');
const utils = require('../helper_services/utils');


module.exports = {
    name: "acars_pirep",
    description: "File an AFKLM pirep with ACARS data",
    async execute(message) {
        let guildId = message.guild.id;
        let guildData = await configUtils.loadGuildConfigs(guildId);
        let authorId = message.author.id;
        if (!("callsign_patterns" in guildData) || !("discord_callsign" in guildData["callsign_patterns"])) {
            message.channel.send("The callsign patterns of your server seem to be messed up. Contact admin.");
            return;
        }
        var reactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
        let callsignPattern = await utils.getLiveCallsign(message, guildData["callsign_patterns"]["discord_callsign"], guildData["callsign_patterns"]["if_callsign"]);
        let userFlight = await ifHelper.getUserCurrentFlight(process.env.IF_API_KEY, callsignPattern);
        if (userFlight === '') {
            message.channel.send("**Can't find you on the Expert Server!!! Grrrrrr**");
            return
        }
        if (userFlight['fpl'] === '') {
            message.channel.send("Either your FPL seems to be missing or IF is reluctant to provide me that :cry:\n**If you have an fpl and it still doesn't show up, try deleting a waypoint and try again. Its a bug with the live API. **");
            return
        }
        message.channel.send("***This is being tested. Don't touch this***\n```\nI see you have chosen the easy way. Let's go down this road in that case. May the force be with you!! :cheers: \
        \nYou can only file for the route currently in your FPL. No other routes are allowed.\n\n```");
        var flightModeMessage, routeMessage, finalMessage;

        let validatedRoute = await utils.validateRoute(userFlight['fpl'])
        if(validatedRoute !== {}) guildData['afklm_special']['special_routes'].push(validatedRoute);
        const route = async () => {
            let flightModes = guildData['afklm_special']['special_routes']
            let text = 'Choose your **route**: \n';
            for (let i = 0; i < flightModes.length; i++) {
                text += `React with **${i + 1}** for **${flightModes[i]['name']}**\n`
            }
            routeMessage = await message.channel.send(text);
            for (let i = 0; i < flightModes.length; i++) {
                await routeMessage.react(reactions[i])
            }
        }

        const flightMode = async () => {
            let flightModes = guildData['afklm_special']['flight_modes']
            let text = 'Choose your **Flight Mode**\n';
            for (let i = 0; i < flightModes.length; i++) {
                text += `React with **${i + 1}** for **${flightModes[i]}**\n`
            }
            flightModeMessage = await message.channel.send(text);
            for (let i = 0; i < flightModes.length; i++) {
                await flightModeMessage.react(reactions[i])
            }
        }


        const choiceComplete = async () => {
            const msg = await message.channel.send(`My all seeing eye found you in a **${userFlight['livery']} ${userFlight['aircraft']}** on the route **${userFlight['fpl']}**\n ***React only if you have chosen your route and flight mode***\n React with the check to continue`)
            await msg.react('✔️');
            await msg.react('❌');
            try {
                var collected = await msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '❌' || reaction.emoji.name == '✔️'), { max: 1, time: 30000 })
                if (collected.first().emoji.name === '✔️') {
                    msg.channel.send("Very well. Let's continue")
                    return true
                }
                if (collected.first().emoji.name === '❌') {
                    msg.reply('Daaaamn!! Good bye!!');
                    return false;
                }
            }
            catch (collected) {
                message.channel.send('You kept me waiting for 30 secs and did not respond. That hurt. Ouch!!')
            }
        }

        const getFlightTime = async () => {
            let actualMsg = message;
            const msg = await message.channel.send('What was your flight time? **Multiplier automatically added**');
            try {
                const collected = await message.channel.awaitMessages(msg => msg.author.id === actualMsg.author.id, { max: 1, time: 30000 });
                actualMsg.channel.send(`Your flight time was ${collected.first().content}.`);
            } catch (collected) {
                console.log(collected);
                actualMsg.channel.send('Oops!!Your time ran out.');
            }
        };

        await flightMode();
        console.log(flightModeMessage.id);
        
        await route();
        await choiceComplete();
        await getFlightTime();
        console.log(flightModeMessage.content)
        //Read emojis in each
        //Make one emoji for Classiic
        //Convert Flight time
        //File
    }
}
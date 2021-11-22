"use strict"
const configUtils = require('../helper_services/config_helper')
const ifHelper = require('../helper_services/if_live_api_helper')
const messageCreator = require('../helper_services/message_creator');
const utils = require('../helper_services/utils');
const airtable_service = require('../helper_services/career_airtable_helper');


module.exports = {
    name: "cm_pirep",
    description: "File an AFKLM Career mode pirep with ACARS data",
    async execute(message) {
        let guildId = message.guild.id;
        let guildData = await configUtils.loadGuildConfigs(guildId);
        let authorId = message.author.id;
        let pirepObj = {};
        let pilotRemarks = ''; //LFKC-LFRN
        var reactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
        if (!("callsign_patterns" in guildData) || !("discord_callsign" in guildData["callsign_patterns"])) {
            message.channel.send("Looks like bot needs an update. *** Please run >update followed by >magic_time and try again***");
            message.channel.send(">update");
            message.channel.send(">magic_time");
            return;
            return;
        }
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

        let callsign = await utils.getCallSign(message, guildData["callsign_patterns"]["discord_callsign"], guildData["callsign_patterns"]["callsign_prefix_airtable"]);
        let callsignId = await utils.validateCmPilot(callsign);
        if(callsignId === ""){
            message.channel.send("Was unable to find you in the career mode database. Do >update and >magic_time if you are positive that you are a CM pilot or contact Sanket or Emiel.")
            return;
        }
        let aircraftProfile = await utils.mapAircraftAirline(userFlight['aircraft'], userFlight['livery'])
        if (callsignId === "") {
            message.channel.send("Your callsign couldn't be validated. RIP!");
            return
        }

        let validatedRoute = await utils.validateRoute(userFlight['fpl']);
        let routesArray = [];
        routesArray.push(validatedRoute.routeId);
        pirepObj['Route'] = routesArray;

        //Fetching date
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;
        // Initialise and store pirep object here with the automated values
        let callsignArray = []
        callsignArray.push(callsignId);
        //Setting IFC id, airline, livery, callsign here
        pirepObj['CM Pilot Callsign'] = callsignArray;
        pirepObj["What is your IFC Username?"] = userFlight['username']
        pirepObj['Aircraft'] = aircraftProfile['aircraft'];
        pirepObj['Airline'] = aircraftProfile['airline'];
        pirepObj['Date Completed'] = today;

        let x = true;

        const getFlightTime = async () => {
            let actualMsg = message;
            const msg = await message.channel.send('Enter your Flight Time in hh:mm format.');
            try {
                const collected = await message.channel.awaitMessages(msg => msg.author.id === actualMsg.author.id, { max: 1, time: 30000 });
                let ft = collected.first().content;
                let times = ft.split(':');
                let minutes = parseInt(times[1]) * 60;
                let totalTime = (parseInt(times[1]) * 60 + parseInt(times[0]) * 3600);
                pirepObj['Flight Time'] = totalTime;

            } catch (collected) {
                x = false;
                actualMsg.channel.send('Oops!!Either your time ran out or something went wrong.');
            }
        };
        pirepObj['Flight Mode'] = "Career Mode";
        /*Objects required: Flight Mode, Callsign, Date Completed, Airline, Aircraft, Route, Flight Time, No. of Pax, Cargo (Kg), Fuel (Kg), Pilot Remarks
        Auto Recieved Objects: Flight Mode, Callsign, Date Completed, Airline, Aircraft, Route
        To be fetched: Flight Time, No. of Pax, Cargo, Fuel
        */
        const getFuel = async () => {
            let actualMessage = message;
            const msg = await message.channel.send("Enter your fuel load in Kgs");
            try {
                const collected = await message.channel.awaitMessages(msg => msg.author.id === actualMessage.author.id, { max: 1, time: 30000 });
                pirepObj['Fuel (Kg)'] = parseInt(collected.first().content);
            } catch (collected) {
                x= false;
                actualMessage.channel.send("Sorry your request could not be completed. Either you timed out or something went wrong. Try again. There is a 30 sec wait time for each response.");
            }

        }

        const getCargo = async () => {
            //Accept weight here
            let actualMessage = message;
            const msg = await message.channel.send("Enter your Cargo load in Kgs");
            try {
                const collected = await message.channel.awaitMessages(msg => msg.author.id === actualMessage.author.id, { max: 1, time: 30000 });
                pirepObj['Cargo (Kg)'] = parseInt(collected.first().content);
            } catch (collected) {
                x = false;
                actualMessage.channel.send("Sorry your request could not be completed. Either you timed out or something went wrong. Try again. There is a 30 sec wait time within which you have to respond.");
            }
        }
        const getPassengers = async () => {
            //Accept PAX here
            let actualMessage = message;
            const msg = await message.channel.send("Enter the number of passengers.");
            try {
                const collected = await message.channel.awaitMessages(msg => msg.author.id === actualMessage.author.id, { max: 1, time: 30000 });
                pirepObj['Pax'] = parseInt(collected.first().content);
            } catch (collected) {
                x = false;
                message.channel.send("Sorry your request could not be processed. Either you timed out or something went wrong. Try again. There is a 30 second time that you get for each response");
            }
        }


        const choiceComplete = async () => {
            const msg = await message.channel.send(`Here is your log:
Callsign:    **${callsign}**
Equipment:   **${userFlight['livery']} ${userFlight['aircraft']}**
Flight Mode: **${pirepObj['Flight Mode']}**
Flight Time: **${new Date(pirepObj['Flight Time'] * 1000).toISOString().substr(11, 8)}**
Route:       **${userFlight['fpl']}**
Fuel: ${pirepObj['Fuel (Kg)']}
Cargo: ${pirepObj['Cargo (Kg)']}
PAX: ${pirepObj['Pax']}
***Are you sure you want to file it?***`)
            await msg.react('✔️');
            await msg.react('❌');
            try {
                var collected = await msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '❌' || reaction.emoji.name == '✔️'), { max: 1, time: 30000 })
                if (collected.first().emoji.name === '✔️') {
                    message.channel.send("Trying to file your log")
                    x = true;
                    return true
                }
                if (collected.first().emoji.name === '❌') {
                    msg.reply('Daaaamn!! Good bye!!');
                    x = false
                    return false;
                }
            }
            catch (collected) {
                x = false
                message.channel.send('You kept me waiting for 30 secs and did not respond. That hurt. Ouch!!')
            }
        }


        await getFlightTime();
        if(!x){
            message.channel.send("Operation cancelled");
            return
        }
        await getFuel();
        if(!x){
            message.channel.send("Operation cancelled");
            return
        }
        await getPassengers();
        if(!x){
            message.channel.send("Operation cancelled");
            return
        }
        await getCargo();
        if(!x){
            message.channel.send("Operation cancelled");
            return
        }
        await choiceComplete();
        console.log(pirepObj);
        if(!x){
            message.channel.send("Operation cancelled");
            return
        }
        let y = await airtable_service.filePirep(guildData["afklm_special"]["airtable_api_key"], guildData["afklm_special"]["pirep_airtable_base_id"], 
        guildData["afklm_special"]["pirep_table_name"], pirepObj);
        if(y){
            message.channel.send("Filed successfully");
        }else{
            message.channel.send("Sorry it failed!")
        }
    }
}
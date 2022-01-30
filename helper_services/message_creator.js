const Discord = require('discord.js');
var utils = require('./utils');

exports.createCmStatsMessage = async function (record, configFields, callsignField) {
    console.log(record);
    let dataFields = []
    configFields.forEach(element => {
        let data = record[element["airtableColumnName"]];
        let fieldValue = data;
        let inline_status = false;
        if ("inline" in element && element["inline"] === "true") inline_status = true;
        if ("type" in element && element["type"] === "array") {
            fieldValue = data.join(", ");
        }
        if ("type" in element && element["type"] === "time") {
            let time_left_str = (Math.floor(data / 3600)).toString() + ":"
            time_left_str += (Math.floor((data % 3600) / 60)).toString().length === 1 ? "0" + (Math.floor((data % 3600) / 60)).toString() : (Math.floor((data % 3600) / 60)).toString()
            fieldValue = time_left_str;
        }
        dataFields.push({
            name: element["name"],
            value: fieldValue,
            inline: inline_status
        })
    });

    var cmStatsResponse = new Discord.MessageEmbed()
        .setTitle(`Career Mode stats of  ${record[callsignField]}`)
        .addFields(dataFields)
        .setAuthor("TheAircraftExperimentBot")
    return cmStatsResponse;
}
exports.createPilotStatsMessage = async function (record, configFields, callsignField) {
    let dataFields = []
    configFields.forEach(element => {
        let data = record[element["airtableColumnName"]];
        let fieldValue = data;
        let inline_status = false;
        if ("inline" in element && element["inline"] === "true") inline_status = true;
        if ("type" in element && element["type"] === "array") {
            fieldValue = data.join(", ");
        }
        if ("type" in element && element["type"] === "time") {
            let time_left_str = (Math.floor(data / 3600)).toString() + ":"
            time_left_str += (Math.floor((data % 3600) / 60)).toString().length === 1 ? "0" + (Math.floor((data % 3600) / 60)).toString() : (Math.floor((data % 3600) / 60)).toString()
            fieldValue = time_left_str;
        }
        dataFields.push({
            name: element["name"],
            value: fieldValue,
            inline: inline_status
        })
    });

    var cmStatsResponse = new Discord.MessageEmbed()
        .setTitle(`Pilot stats of  ${record[callsignField]}`)
        .addFields(dataFields)
        .setAuthor("TheAircraftExperimentBot")
    return cmStatsResponse;
}
exports.createLiveMessage = async function (responseObj) {

    let responseMessages = []
    let responseMessage = '```';
    for (let i = 0; i < responseObj.length; i++) {
        if (responseMessage.length > 1700) {
            responseMessages.push(responseMessage + '\n```');
            responseMessage = '```';
        }
        responseMessage += `
        Callsign: ${responseObj[i]['callsign']}
        IFC Username: ${responseObj[i]['username']}
        Aircraft: ${responseObj[i]['aircraft']}
        Livery: ${responseObj[i]['livery']}
        Altitude: ${responseObj[i]['altitude']}
        Ground Speed: ${responseObj[i]['gs']}
        Route: ${responseObj[i]['route']}

        `
    }
    responseMessages.push(responseMessage + '\n```');


    return responseMessages;
}

exports.createLiveMiniMessage = async function (responseObj) {

    let responseMessages = []
    let responseMessage = '```';
    for (let i = 0; i < responseObj.length; i++) {
        if (responseMessage.length > 1700) {
            responseMessages.push(responseMessage + '\n```');
            responseMessage = '```';
        }
        responseMessage += `
        Callsign: ${responseObj[i]['callsign']}
        IFC Username: ${responseObj[i]['username']}
        Aircraft: ${responseObj[i]['aircraft']}
        Livery: ${responseObj[i]['livery']}
        Altitude: ${responseObj[i]['altitude']}
        Ground Speed: ${responseObj[i]['gs']}
        Route: ${responseObj[i]['route']}

        `
    }
    responseMessages.push(responseMessage + '\n```');


    return responseMessages;
}

exports.createAircraftPerformanceMessage = async function (matchedAircraft) {
    //console.log(matchedAircraft);
    let dataFields = []
    if (matchedAircraft['matched']) {
        let objKeys = Object.keys(matchedAircraft['result'])
        objKeys.forEach(key => {
            
            if(matchedAircraft['result'][key] !== '') dataFields.push({
            name: key,
            value: matchedAircraft['result'][key],
            inline: true
           })

        });
        console.log(dataFields);
        var aircraftResponse = new Discord.MessageEmbed()
            .setTitle(`Aircraft Performance Spec of ${matchedAircraft['result']['Airplane']}`)
            .addFields(dataFields)
           // .addFields(
             //   { name: 'MTOW', value: matchedAircraft['result']["MTOW"], inline: true },
               // { name: 'MLW', value: matchedAircraft['result']["MLW"], inline: true }
            //)
            //.addField('Range', matchedAircraft['result']["Typical Range"], true)
            //.addField('Service Ceiling', matchedAircraft['result']["Ceiling"], true)
            //.addFields(
              //  { name: 'Climb To 5000ft', value: matchedAircraft['result']["Climb to 5000ft"], inline: true },
               // { name: 'Climb To 15000ft', value: matchedAircraft['result']["Climb to 15000ft"], inline: true },
                //{ name: 'Climb To 24000ft', value: matchedAircraft['result']["Climb to 24000ft"], inline: true },
                //{ name: 'Mach Climb', value: matchedAircraft['result']["Mach Climb"], inline: true },
               // { name: 'Cruise Speed', value: matchedAircraft['result']["Cruise speed"], inline: true },
               // { name: 'Descent to 24000ft', value: matchedAircraft['result']["Descend to 24000ft"], inline: true },
               // { name: 'Descent to 10000ft', value: matchedAircraft['result']["Descend to 10000ft"], inline: true },
                //{ name: 'Approach / MCS speed', value: matchedAircraft['result']["Approach / MCS"], inline: true },
                //{ name: 'Landing speed', value: matchedAircraft['result']["Landing"], inline: true },
                //{ name: 'Flap Speeds', value: matchedAircraft['result']["Flaps at descend"] })

    } else {
        var aircraftResponse = '```\nApologies! I was not able to find the aircraft you specified. You may try one from this list: \n';
        let leftBase = true;
        var spaceChar = ' ';
        //console.log(matchedAircraft['result']);
        for (let i = 0; i < matchedAircraft['result'].length; i++) {
            if (leftBase) {
                aircraftResponse += (matchedAircraft['result'][i] + spaceChar.repeat(50 - matchedAircraft['result'][i].length));
                leftBase = false
            } else {
                aircraftResponse += matchedAircraft['result'][i] + '\n';
                leftBase = true;
            }

        }
        aircraftResponse += '\n```';

    }

    return aircraftResponse;
}

exports.createATCMessage = async function (atc) {
    let airports = Object.keys(atc);
    let dataFields = [];
    for (let i = 0; i < airports.length; i++) {
        dataFields.push({
            name: "Airport",
            value: airports[i]
        });
        dataFields.push({
            name: "Controllers",
            value: atc[airports[i]]['controllers'],
            inline: true
        });
        dataFields.push({
            name: "Active Frequencies",
            value: atc[airports[i]]['frequency'],
            inline: true
        });
    }
    var atcResponse = new Discord.MessageEmbed()
        .setTitle(`Active ATC frequencies in the Expert Server`)
        .addFields(dataFields)
        .setAuthor("TheAircraftExperimentBot")
    return atcResponse;
}

exports.createUserMessage = async function (userInfo) {

    var hours = Math.floor(userInfo['flightTime'] / 60);
    var minutes = userInfo['flightTime'] % 60;
    let dataFields = [
        {
            name: "Grade",
            value: userInfo['grade'],
            inline: true
        }, {
            name: "XP",
            value: userInfo['xp'],
            inline: true
        }, {
            name: "Flight Time",
            value: `${hours.toString()}:${minutes.toString()}`
        }, {
            name: "Lvl 1 Vios",
            value: userInfo['violationCountByLevel']['level1'],
            inline: true
        }, {
            name: "Lvl 2 Vios",
            value: userInfo['violationCountByLevel']['level2'],
            inline: true
        }, {
            name: "Lvl 3 Vios",
            value: userInfo['violationCountByLevel']['level3'],
            inline: true
        }, {
            name: "VA/VO",
            value: (userInfo['virtualOrganization'] !== '') ? userInfo['virtualOrganization'] : 'No VO linked'
        }, {
            name: "Total Flights",
            value: userInfo['onlineFlights'],
            inline: true
        }, {
            name: "Landings",
            value: userInfo['landingCount'],
            inline: true
        }, {
            name: "ATC Ops",
            value: userInfo['atcOperations'],
            inline: true
        }
    ];
    var userResponse = new Discord.MessageEmbed()
        .setTitle(`Userstats for ${userInfo['discourseUsername']}`)
        .addFields(dataFields)
        .setAuthor("TheAircraftExperimentBot")
    return userResponse;
}

exports.createLeaderBoard = async function(leaders){
    let podiums  = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣' ];
    let leaderboardMessage = "";
    leaders = ["Rohan", "Susheel", "Menno", "CrazyBee", "Thifal"]
    for (var counter = 0; counter < leaders.length  && counter < 5; counter++) 
    {
        let pilotName = leaders[counter]
        leaderboardMessage = leaderboardMessage + `${podiums[counter]} - ${pilotName} (35) \n`;
    }
    let dataFields = [];
    dataFields.push({
        name: "Podium 👑",
        value: leaderboardMessage,
        inline: false
    })
    var atcResponse = new Discord.MessageEmbed()
        .setTitle(`Live AFKLM World Tour 5 Leaderboards`)
        .addFields(dataFields)
        .setAuthor("AFKLM World Tour Team")
    return atcResponse;
}
exports.createWTStats = async function(leaders){
    let podiums  = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣' ];
    let leaderboardMessage = "***Here are the pilots that participated:***\n```\n";
    let logCount = 0;
    let pilotCount = 0;
    for (var counter = 0; counter < leaders.length ; counter++) 
    {
        logCount = logCount + leaders[counter][1];
        pilotCount = pilotCount + 1;
        let pilotName = await utils.getPilotName(leaders[counter][0]);
        leaderboardMessage = leaderboardMessage + ` ${pilotName} (${leaders[counter][1]}) \n`;
    }
    let dataFields = [];
    dataFields.push({
        name: "Pilots",
        value: "Check the list below!",
        inline: false
    },{
        name: "WT4 Stats",
        value: `Pilots Participated: ${pilotCount} \n Logs Filed: ${logCount}`,
        inline: false
    }
    )
    var atcResponse = new Discord.MessageEmbed()
        .setTitle(`Live AFKLM WT4 Statistics`)
        .addFields(dataFields)
        .setAuthor("AFKLM World Tour Team")
   
    let stats = [];
    leaderboardMessage = leaderboardMessage + "\n```"
    stats.push(atcResponse);
    stats.push(leaderboardMessage);
    return stats;
}

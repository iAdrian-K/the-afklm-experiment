"use strict";
const configUtils = require("../helper_services/config_helper");
const ifHelper = require("../helper_services/if_live_api_helper");
const messageCreator = require("../helper_services/message_creator");
const utils = require("../helper_services/utils");
const airtable_service = require("../helper_services/career_airtable_helper");

module.exports = {
  name: "wt_pirep",
  description: "File an AFKLM pirep with ACARS data",
  async execute(message) {
    let guildId = message.guild.id;
    let guildData = await configUtils.loadGuildConfigs(guildId);
    let authorId = message.author.id;
    let pirepObj = {};
    let selectedFlightMode, selectedRoute, multiplier;
    let pilotRemarks = "";
    let isRotw = false;
    var reactions = [
      "1⃣",
      "2⃣",
      "3⃣",
      "4⃣",
      "5⃣",
      "6⃣",
      "7⃣",
      "8⃣",
      "9⃣",
      "🔟",
    ];
    if (
      !("callsign_patterns" in guildData) ||
      !("discord_callsign" in guildData["callsign_patterns"])
    ) {
      message.channel.send(
        "The callsign patterns of your server seem to be messed up. Contact admin."
      );
      return;
    }
    let callsignPattern = await utils.getLiveCallsign(
      message,
      guildData["callsign_patterns"]["discord_callsign"],
      guildData["callsign_patterns"]["if_callsign"]
    );
    let userFlight = await ifHelper.getUserCurrentFlight(
      process.env.IF_API_KEY,
      callsignPattern
    );
    if (userFlight === "") {
      message.channel.send(
        "**Can't find you on the Expert Server!!! Grrrrrr**"
      );
      return;
    }
    if (userFlight["fpl"] === "") {
      message.channel.send(
        "Either your FPL seems to be missing or IF is reluctant to provide me that :cry:\n**If you have an fpl and it still doesn't show up, try deleting a waypoint and try again. Its a bug with the live API. **"
      );
      return;
    }

    var flightModeMessage, routeMessage, finalMessage;
    let callsign = await utils.getCallSign(
      message,
      guildData["callsign_patterns"]["discord_callsign"],
      guildData["callsign_patterns"]["callsign_prefix_airtable"]
    );
    let callsignId = await utils.validatePilot(callsign);
    let aircraftProfile = await utils.mapAircraftAirline(
      userFlight["aircraft"],
      userFlight["livery"]
    );
    if (callsignId === "") {
      message.channel.send("Your callsign couldn't be validated. RIP!");
      return;
    }

    //Fetching date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + "-" + mm + "-" + dd;

    let callsignArray = [];
    callsignArray.push(callsignId);
    //Setting IFC id, airline, livery, callsign here
    pirepObj["Callsign"] = callsignArray;
    pirepObj["What is your IFC Username?"] = userFlight["username"];
    pirepObj["Aircraft"] = aircraftProfile["aircraft"];
    pirepObj["Airline"] = aircraftProfile["airline"];
    pirepObj["Date Completed"] = today;
    pirepObj["Flight Mode"] = "World Tour 4";
    //Conversation starts here


    //Validatinf route
    let wtRoutes = await configUtils.readJson("./wt-routes.json");

    if (wtRoutes.hasOwnProperty(userFlight["fpl"])) {
      selectedRoute = wtRoutes[userFlight["fpl"]]["route"];
      let routes_arr = [];
      routes_arr.push(wtRoutes[userFlight["fpl"]]["routeId"]);
      pirepObj["Route"] = routes_arr;
      selectedFlightMode = "World Tour 4";
      multiplier = 1;
    } else {
      message.channel.send(
        "I don't think you are flying a World Tour Route. >acars_pirep perhaps!!!"
      );
      return;
    }
    

    let x = true;

    const choiceComplete = async () => {
      const msg = await message.channel.send(`Here is your log:
Callsign:    **${callsign}**
Equipment:   **${userFlight["livery"]} ${userFlight["aircraft"]}**
Flight Mode: **${pirepObj["Flight Mode"]}**
Flight Time: **${new Date(pirepObj["Flight Time"] * 1000)
        .toISOString()
        .substr(11, 8)}**
Route:       **${selectedRoute}**
***Are you sure you want to file it?***`);
      await msg.react("✔️");
      await msg.react("❌");
      try {
        var collected = await msg.awaitReactions(
          (reaction, user) =>
            user.id == message.author.id &&
            (reaction.emoji.name == "❌" || reaction.emoji.name == "✔️"),
          { max: 1, time: 30000 }
        );
        if (collected.first().emoji.name === "✔️") {
          msg.channel.send("Very well. Let's continue");
          x = true;
          return true;
        }
        if (collected.first().emoji.name === "❌") {
          msg.reply("Daaaamn!! Good bye!!");
          x = false;
          return false;
        }
      } catch (collected) {
        x = false;
        message.channel.send(
          "You kept me waiting for 30 secs and did not respond. That hurt. Ouch!!"
        );
      }
    };

    const getFlightTime = async () => {
      let actualMsg = message;
      const msg = await message.channel.send(
        "Enter your Flight Time in hh:mm format. **Multiplier automatically added**"
      );
      try {
        const collected = await message.channel.awaitMessages(
          (msg) => msg.author.id === actualMsg.author.id,
          { max: 1, time: 30000 }
        );
        pilotRemarks +=
          "\nActual FT: " +
          collected.first().content +
          "\nMultiplier: " +
          multiplier.toString() +
          "\nActual Route from FPL: " +
          userFlight["fpl"];
        pirepObj["Pilot Remarks"] = pilotRemarks;
        let ft = collected.first().content;
        let times = ft.split(":");
        let minutes = parseInt(times[1]) * 60;
        let totalTime =
          (parseInt(times[1]) * 60 + parseInt(times[0]) * 3600) * multiplier;
        pirepObj["Flight Time"] = totalTime;
      } catch (collected) {
        actualMsg.channel.send(
          "Oops!!Either your time ran out or something went wrong."
        );
      }
    };

    
    await getFlightTime();
    await choiceComplete();
    if (!x) {
      message.channel.send("Operation cancelled");
      return;
    }
    console.log(pirepObj);
    let y = await airtable_service.filePirep(guildData["afklm_special"]["airtable_api_key"], guildData["afklm_special"]["pirep_airtable_base_id"],
     guildData["afklm_special"]["pirep_table_name"], pirepObj);
    if (true) {
      message.channel.send("Filed successfully");
    } else {
      message.channel.send("Sorry it failed!");
    }
  },
};

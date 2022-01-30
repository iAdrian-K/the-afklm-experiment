const Discord = require("discord.js");
var utils = require("./utils");

exports.createLeaderBoard = async function (leaders) {
  let podiums = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  let leaderboardMessage = "";

  for (var counter = 0; counter < leaders.length && counter < 5; counter++) {
    let pilotName = leaders[counter];
    leaderboardMessage =
      leaderboardMessage + `${podiums[counter]} - ${pilotName} \n`;
  }
  let dataFields = [];
  dataFields.push({
    name: "Podium 👑",
    value: leaderboardMessage,
    inline: false,
  });
  var leaderboard = new Discord.MessageEmbed()
    .setTitle(`Live AFKLM World Tour 5 Leaderboards`)
    .addFields(dataFields)
    .setAuthor("AFKLM World Tour Team");
  return leaderboard;
};

exports.invalidLegMessage = function () {
  let dataFields = [
    {
      name: "Total Legs",
      value: "36",
      inline: false,
    },
    {
      name: "Remarks",
      value:
        "Add 'dm' at the end of the message to receive flight parameters in a DM which can be directly copied",
      inline: true,
    },
    {
      name: "Command Format with details",
      value: ">wt 5 dm",
      inline: false,
    },
    {
      name: "Command Format without details",
      value: ">wt 5",
      inline: false,
    },
  ];

  let retMessage = new Discord.MessageEmbed()
    .setTitle(`Invalid command`)
    .addFields(dataFields)
    .setAuthor("AFKLM World Tour Team")
    .setColor("#FF0000")
    .setImage(
      "https://dl.airtable.com/.attachmentThumbnails/ed78ac885961f1528b1a6faea737de7d/492ebd90"
    );
  return retMessage;
};

exports.createLegDetails = function (legDetails, dmFlag) {
  const returnMessages = [];
  const colors = ["#0000FF", "#008000", "#800080", "#FF7F50", "#fcba03", "#208784", "#7a1157"];
  const currentColor = colors[Math.floor(Math.random() * ((colors.length -1) - 0 + 1) ) ];
  let time_left_str = Math.floor(legDetails.ft / 3600).toString() + ":";
  time_left_str +=
    Math.floor((legDetails.ft % 3600) / 60).toString().length === 1
      ? "0" + Math.floor((legDetails.ft % 3600) / 60).toString()
      : Math.floor((legDetails.ft % 3600) / 60).toString();

  let dataFieldsForMainThread = [
    {
      name: "Route",
      value: legDetails.route,
      inline: false,
    },
    {
      name: "Aircraft(s)",
      value: legDetails.aircrafts,
      inline: true,
    },
    {
      name: "Livery",
      value: legDetails.livery,
      inline: true,
    },
    {
      name: "Flight Time",
      value: time_left_str,
      inline: false,
    },
    {
      name: "Airtable Link",
      value: legDetails.url,
      inline: false,
    }
  ];
  if(dmFlag){
      dataFieldsForMainThread.push(
        {
            name: "Note",
            value: "I have DMed you the details and procedures for the leg",
            inline: false,
          }
      )
  }else{ dataFieldsForMainThread.push(
    {
        name: "Note",
        value: `Use '>wt ${legDetails.leg} dm' command to recieve procedures in PM`,
        inline: false,
      }
  )}
  returnMessages.push(
    new Discord.MessageEmbed()
      .setTitle(`Leg ${legDetails.leg}`)
      .addFields(dataFieldsForMainThread)
      .setAuthor("AFKLM World Tour Team")
      .setColor(currentColor)
      .setImage(legDetails.hero)
      .setURL(legDetails.url)
  );
  returnMessages.push(
    `**SID**: ${legDetails.sid}\n**STAR**: ${legDetails.star}\n**Dep. Terminal**: ${legDetails.depTerminal}\n**Arr. Terminal**: ${legDetails.arrTerminal}\n**Cruise Speed**: ${legDetails.cruise}\n**Copy message below for FPL**`,
    legDetails.fpl
  );
  return returnMessages;
};

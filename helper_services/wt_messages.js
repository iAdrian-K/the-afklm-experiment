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
      value: "35",
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
    .setImage("https://dl.airtable.com/.attachmentThumbnails/ed78ac885961f1528b1a6faea737de7d/492ebd90");
  return retMessage;
};

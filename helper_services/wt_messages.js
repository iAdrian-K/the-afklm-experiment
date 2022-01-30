const Discord = require('discord.js');
var utils = require('./utils');

exports.createLeaderBoard = async function(leaders){
    let podiums  = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣' ];
    let leaderboardMessage = "";
   
    for (var counter = 0; counter < leaders.length  && counter < 5; counter++) 
    {
        let pilotName = leaders[counter]
        leaderboardMessage = leaderboardMessage + `${podiums[counter]} - ${pilotName} \n`;
    }
    let dataFields = [];
    dataFields.push({
        name: "Podium 👑",
        value: leaderboardMessage,
        inline: false
    })
    var leaderboard = new Discord.MessageEmbed()
        .setTitle(`Live AFKLM World Tour 5 Leaderboards`)
        .addFields(dataFields)
        .setAuthor("AFKLM World Tour Team")
    return leaderboard;
}
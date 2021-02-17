if (!("callsign_patterns" in guildData) || !("discord_callsign" in guildData["callsign_patterns"])) {
    message.channel.send("The callsign patterns of your server seem to be messed up. Contact admin.");
    return;
}
let callsignPattern = await utils.getLiveCallsign(message, guildData["callsign_patterns"]["discord_callsign"], guildData["callsign_patterns"]["if_callsign"]);
let userFlight = await ifHelper.getUserCurrentFlight(process.env.IF_API_KEY, callsignPattern);
if (userFlight === '') {
    message.channel.send("**Can't find you on the Expert Server!!! Grrrrrr**");
    return
}
if (userFlight['fpl'] === '') {
    message.channel.send("Either your FPL seems to be missing or IF is reluctant to provide me that :cry:");
    return
}
const getNumberOfQuestions = async () => {
    const msg = await message.channel.send('How many questions should I ask? (1-10)');
    try {
        const collected = await message.channel.awaitMessages(message => message.author.id === this.owner && !isNaN(parseInt(message.content)),  { max: 1, time: 15000 });
        message.channel.send(`You asked for ${collected.first().content} questions.`);
        return parseInt(collected.first().content);
    } catch(collected) {
        message.channel.send('You did not tell me how many questions you wanted. Ending the quiz.');
    }
};

const getDifficulty = async () => {
    const msg = await message.channel.send('What difficulty would you like: easy, medium, hard?');
    try {
        const collected = await message.channel.awaitMessages(message => message.author.id === this.owner && ['easy', 'medium', 'hard'].includes(message.content.toLocaleLowerCase()),  { max: 1, time: 15000 });
        message.channel.send(`You asked for ${collected.first().content} difficulty.`);
        return collected.first().content;
    } catch(collected) {
        message.channel.send('You did not tell which difficulty you wanted. Ending the quiz.');
    }
};

// const testMethod1 = async () => {
//     var x;
//     message.channel.send('This is message 2')
//         .then((msg) => {
//             msg.react('✔️');
//             msg.react('❌');
//             msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '❌' || reaction.emoji.name == '✔️'),
//                 { max: 1, time: 30000 }).then(collected => {
//                     if (collected.first().emoji.name === '✔️') {
//                         msg.channel.send("Very well. Let's continue")
//                         return true
//                     }
//                     if (collected.first().emoji.name === '❌') {
//                         msg.reply('Daaaamn!! Good bye!!');
//                         return false;
//                     }
//                 })
//                 .catch((signal) => {
//                     if (signal) {
//                         msg.reply('No reaction after 30 seconds, operation canceled');
//                     }
//                 });
//         })
//         .catch(console.log)

// }
// const testMethod2 = async () => {
//     var x;
//     message.channel.send('This is message 2')
//         .then((msg) => {
//             msg.react('✔️');
//             msg.react('❌');
//             msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '❌' || reaction.emoji.name == '✔️'),
//                 { max: 1, time: 30000 }).then(collected => {
//                     if (collected.first().emoji.name === '✔️') {
//                         msg.channel.send("Very well. Let's continue")
//                         return true
//                     }
//                     if (collected.first().emoji.name === '❌') {
//                         msg.reply('Daaaamn!! Good bye!!');
//                         return false;
//                     }
//                 })
//                 .catch((signal) => {
//                     if (signal) {
//                         msg.reply('No reaction after 30 seconds, operation canceled');
//                     }
//                 });
//         })
//         .catch(console.log)

// }

await getNumberOfQuestions();
await getDifficulty();


// message.channel.send(`My all seeing eye found you in a **${userFlight['livery']} ${userFlight['aircraft']}** on the route **${userFlight['fpl']}**`)
//     .then((msg) => {
// msg.react('✔️');
// msg.react('❌');
//         msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '❌' || reaction.emoji.name == '✔️'),
//             { max: 1, time: 30000 }).then(collected => {
//                 if (collected.first().emoji.name === '✔️') {
//                     message.channel.send("Very well. Let's continue")
//                 }
//                 if (collected.first().emoji.name === '❌') {
//                     message.reply('Daaaamn!! Good bye!!');
//                     return false;
//                 }
//             })
//             .catch((signal) => {
//                 if (signal) {
//                     message.reply('No reaction after 30 seconds, operation canceled');
//                 }
//             });
//     })
//     .then(() => {
//         message.channel.send('That was all')

//     })
//     .catch((err) => console.log(err));



}
}
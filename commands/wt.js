"use strict"
const messageCreator = require('../helper_services/wt_messages');


module.exports = {
    name: "wt",
    description: "Get World Tour Route Info",
    async execute(message) {
        let splitMessage = message.content.split(' ');
        let dmFlag = splitMessage.length > 3 && splitMessage[2].toString().toUpperCase() === "DM";
        console.log(splitMessage);
        try{if (splitMessage[1].parseInt() > 35){
            let returnMessage = await messageCreator.invalidLegMessage();
            await message.channel.send(returnMessage)
            return 
        }}
        catch{
            let returnMessage = await messageCreator.invalidLegMessage();

            await message.channel.send(returnMessage)
            return
        }
    }
}
"use strict"

module.exports = {
    name: "acars_pirep",
    description: "File an AFKLM pirep with ACARS data",
    async execute(message) {
        message.channel.send("I see you have chosen the easy way. Let's go down this road in that case. May the force be with you!! :cheers: \
        \n**There is a 30 second timeout for each response. I have to help other AFKLM pilots too. So make it quick bossman, else I'll start ignoring you.** \
        \nYou can only file for the route currently in your FPL. No other routes are allowed.");
        
        
    }
}
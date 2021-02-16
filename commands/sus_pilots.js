"use strict"
const configUtils = require('../helper_services/config_helper');
const utils = require('../helper_services/utils')


module.exports = {
    name: "sus_pilots",
    description: "Fetches the pilots and their IFC linkings",
    async execute(message) {
        message.channel.send("May God save these pilots from the wrath of John! Finding pilots! This will take a while!!");
        await utils.compilePilotsData(process.env.IF_API_KEY, message);
    }
}
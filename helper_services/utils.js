const configsService = require('./config_helper');
const csvtojsonV2 = require("csvtojson");
const airtableConnection = require('./career_airtable_helper');
const ifHelper = require('./if_live_api_helper');
const json2csv = require('json-2-csv');

exports.getCallSign = async function getCallsign(message, pattern, callsignPrefix) {
    var value = ""
    pattern = pattern.replace("xxx", "(\\d\\d\\d)");
    var rxPattern = new RegExp(pattern);
    //console.log(rxPattern);
    await message.guild.members.fetch(message.author.id).then(data => {
        var arr = rxPattern.exec(data.displayName);
        var x = callsignPrefix + arr[1];
        value = x;
    }).catch(console.log)
    return value
}

exports.filterRecordByCallsign = async function (records, callsignField, callsign) {
    callsign = callsign.replace(' ', '').toUpperCase().normalize();
    let returnObj = {}
    await records.forEach(element => {
        //console.log(element);
        let callsign_i = element[callsignField];
        callsign_i = callsign_i.replace(' ', '').toUpperCase().normalize();
        //console.log(callsign, callsign_i, callsign === callsign_i);
        //console.log(callsign_i.length.toString() + callsign_i + ": " + callsign.length.toString() + callsign);
        if (callsign === callsign_i) {
            returnObj = element;
        }
    });
    return returnObj;
}

exports.updateAircraftsDatastore = async function () {
    let configs = await configsService.loadMasterConfigs();
    let aircraftData = []
    for (let i = 0; i < configs["IF_FLIGHT_DATA_FILES"].length; i++) {
        aircraftData.push(await loadCSV('./assets_contents/' + configs["IF_FLIGHT_DATA_FILES"][i]))
    }
    let finalObj = []
    for (let i = 0; i < aircraftData.length; i++) {
        for (let j = 0; j < aircraftData[i].length; j++)finalObj.push(aircraftData[i][j]);
    }
    configsService.writeAircraftDatastore(finalObj);
    return 0;
}
async function loadCSV(filename) {
    let aircraftData = [];
    await csvtojsonV2()
        .fromFile(filename)
        .then(jsonObj => {
            aircraftData = jsonObj;
        });
    return aircraftData
}
exports.getLiveCallsign = async function (message, discordPattern, ifPattern) {
    var value = ""
    let pattern = discordPattern.replace("xxx", "(\\d\\d\\d)");
    var rxPattern = new RegExp(pattern);
    //console.log(rxPattern);
    await message.guild.members.fetch(message.author.id).then(data => {
        var arr = rxPattern.exec(data.displayName);
        var x = ifPattern.replace('xxx', arr[1]);
        value = x;
    }).catch(console.log);
    return value
}
exports.validateJson = async function (jsonObj) {
    try {
        JSON.parse(jsonObj);
        return true;
    }
    catch (err) {
        return false;
    }
}

async function updateRoutes(configs) {
    var routes = await airtableConnection.fetchTable(configs['airtable_api_key'], configs['route_airtable_base_id'], configs['route_table_name'])
    var routeArray = []
    for (route of routes) {
        try {
            if (route.hasOwnProperty('fields') && route['fields'].hasOwnProperty('Route')) {
                routeArray.push({
                    'routeId': route['id'],
                    'route': route['fields']['Route']
                })

            }
        }
        catch (err) {
            console.log(route['fields']);
        }
    }
    var routesJson = {
        routes: routeArray
    }
    await configsService.writeJson('./assets_contents/route_database.json', routesJson);
    return routeArray;
}

async function updatePilots(configs) {
    var pilots = await airtableConnection.fetchTable(configs['airtable_api_key'], configs['pilot_airtable_base_id'], configs['pilot_table_name'])
    var pilotsArray = []
    for (pilot of pilots) {
        if (pilot.hasOwnProperty('fields') && pilot['fields'].hasOwnProperty('Name') && pilot['fields'].hasOwnProperty('Callsign') && pilot['fields'].hasOwnProperty('IFC Name')) {
            try {
                pilotsArray.push({
                    "pilotId": pilot['id'],
                    "name": pilot['fields']['Name'],
                    "callsign": pilot['fields']['Callsign'],
                    "ifc_name": pilot['fields']['IFC Name']
                })
            }
            catch (err) {
                console.log(pilot['fields']);
            }
        }
    }
    await configsService.writeJson('./assets_contents/pilots_database.json', { "pilots": pilotsArray });
    return true;
}

async function updateAcarsConfigs(configs, allRoutes) {
    var specialRoutes = configs['special_routes'];
    for (route of allRoutes) {
        for (special of specialRoutes) {
            if (special['name'] === route['route']) {
                special['routeId'] = route['routeId']
            }
        }
    }
    return specialRoutes;
}

exports.updateDatabase = async function (acars_configs, message, guildConfigs, guildId) {
    var routes = await updateRoutes(acars_configs);
    var routes = (await configsService.readJson('./assets_contents/route_database.json'));
    routes = routes['routes']
    message.channel.send("Done updating the routes database")
    await updatePilots(acars_configs);
    message.channel.send("Done updating the pilots database")
    var specialRoutes = await updateAcarsConfigs(acars_configs, routes);
    acars_configs['special_routes'] = specialRoutes;
    guildConfigs['afklm_special'] = acars_configs;
    var obj = {}
    await configsService.writeGuildConfigs(guildId, JSON.stringify(guildConfigs));
    message.channel.send("Done updating the acars configs");
    var unmatchedRoutes = []
    for (route of specialRoutes) {
        if (!route.hasOwnProperty('routeId')) unmatchedRoutes.push(route['name'])
    }
    if (unmatchedRoutes.length > 0) message.channel.send(`**Could not match the following routes from the database: ${unmatchedRoutes.join(', ')}**`);
    else message.channel.send('All routes were mapped successfully!!');
    return true;
}

exports.compilePilotsData = async function (ifApiKey, message) {
    var pilots = await configsService.readJson('./assets_contents/pilots_database.json');
    pilots = pilots['pilots'];
    var compiledData = [];
    var ifcNames = []
    message.channel.send(`This will take a while. Looking for ${pilots.length} pilots!! And IF only gives me one at a time :cry:`);
    for (pilot of pilots) {
        ifcNames.push(pilot['ifc_name'])
        compiledData.push({
            callsign: pilot['callsign'],
            name: pilot['name'],
            ifc_id: pilot['ifc_name']
        })
    }
    // ,
    //         vaAffiliation: ifStats.hasOwnProperty('virtualOrganization') ? ifStats['VirtualOrganization'] : 'None',
    //         violations: ifStats['violations'],
    //         grade: ifStats['grade']
    var ifStats = await ifHelper.getUserStats(ifApiKey, ifcNames);
    for (pilot of compiledData) {
        for (ifcData of ifStats) {
            if (ifcData['discourseUsername'] === pilot['ifc_id']) {
                pilot['vaAffiliation'] = (ifcData.hasOwnProperty('virtualOrganization')  && ifcData['virtualOrganization']!==undefined  && ifcData['virtualOrganization']!==null) ? ifcData['virtualOrganization'] : 'None'
                pilot['violations'] = (ifcData.hasOwnProperty('violations') && ifcData['violations']!==undefined) ? ifcData['violations'] : 'Data error'

                pilot['grade'] = (ifcData.hasOwnProperty('grade')  && ifcData['grade']!==undefined) ? ifcData['grade'] : 'Data error'

            }
        }
    }
    var compiledCsv = await json2csv.json2csv(compiledData, async (err, csv) => {
        if (err) {
            console.log('Some error happened');
        }
        compiledCsv = csv;
        await configsService.writeCsv('./assets_contents/pilots_compiled.csv', csv)
        message.channel.send("Here is the compiled list. Open it with Microsoft Excel or an equivalent software", { files: ['./assets_contents/pilots_compiled.csv'] })
        return csv
    })
    return
}
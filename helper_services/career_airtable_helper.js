const Airtable = require('airtable');

exports.fetchCareerModeLogs = async function(airtableConfigs){
    var base = new Airtable({apiKey: airtableConfigs["api_key"]}).base(airtableConfigs["base_id"])
    var airtableData = [];
    await base(airtableConfigs["table_name"]).select().all().then(data => {
        data.forEach(element => {
            airtableData.push(element['fields'])
        });
    }).catch(err => {
        console.log(err);
    })
    
    return airtableData;
}

exports.fetchTable = async function(apiKey, baseId, tableName){
    var base = new Airtable({apiKey: apiKey}).base(baseId)
    var airtableData;
    await base(tableName).select().all().then(data => {
        airtableData = data;
    }).catch(err => {
        console.log(err);
    })
    
    return airtableData;
}

exports.filePirep = async function(apiKey, baseId, tableName, obj){
    var base = new Airtable({apiKey: apiKey}).base(baseId);
    let fields = [];
    fields.push({
        "fields": obj
    })
    try{
        console.log(fields);
    await base(tableName).create(fields);
    return true;
}catch(err){
    console.log(err);
    return false
}
}
const Airtable = require("airtable");

exports.fetchWorldTourLogs = async function (airtableConfigs) {
    var logs = [];
    var base = new Airtable({apiKey: airtableConfigs["airtable_api_key"]}).base(airtableConfigs["pirep_airtable_base_id"]);
  await base("PIREP Center")
    .select({
      filterByFormula: "({Flight Mode}='World Tour 4')",
    })
    .all()
    .then((data) => {
      data.forEach((element) => {
        logs.push({
            callsignId: element.fields.Callsign[0],
            logDate: element.fields['Log Date'],
            routeId: element.fields.Route[0]
        })
      });
    })
    .catch((err) => {
      console.log(err);
    });

    return logs;
};

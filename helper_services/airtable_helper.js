const Airtable = require("airtable");

exports.fetchWorldTourLogs = async function (airtableConfigs) {
  var logs = [];
  var base = new Airtable({ apiKey: airtableConfigs["airtable_api_key"] }).base(
    airtableConfigs["pirep_airtable_base_id"]
  );
  await base("PIREP Center")
    .select({
      filterByFormula: "({Flight Mode}='World Tour 5')",
    })
    .all()
    .then((data) => {
      let errCount = 0;
      data.forEach((element) => {
        try {
          logs.push({
            callsignId:
              element.fields.Callsign[0] !== undefined
                ? element.fields.Callsign[0]
                : "Redacted",
            logDate: element.fields["Log Date"],
            routeId: element.fields.Route[0],
          });
        } catch (err) {
          errCount += 1;
          console.log(err);
        }
      });

      for (let i = 0; i < errCount; i++) {
        logs.push({
          callsignId:
            "Redacted",
          logDate: "",
          routeId: "Redacted",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return logs;
};

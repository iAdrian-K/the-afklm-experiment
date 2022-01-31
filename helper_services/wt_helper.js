const Airtable = require("airtable");

// Add code for fetching the leaderboard
exports.fetchLeaderboard = async function (airtableConfigs) {
  const Airtable = require("airtable");

  const airtableApiKey = airtableConfigs.airtable_api_key;
  const airtableBaseId = "appQdvvPfICT94WaD";
  const airtableTableName = "PIREP Center";

  // Initialise Airtable Connection
  var base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

  // Get Routes from the table
  let leaders = [];
  let leaderNames = [];

  await base(airtableTableName)
    .select({
      view: "WT5 - Bot - DO NOT ALTER",
      maxRecords: 20,
      sort: [
        { field: "Route", direction: "desc" },
        { field: "Log Date", direction: "asc" },
      ],
    })
    .all()
    .then((data) => {
      data.forEach((route) => {
        leaders.push(route.fields.Callsign[0]);
      });
    })
    .catch((err) => console.log(err));

  for (let i = 0; i < leaders.length; i++) {
    {
      await base("All Pilots")
        .find(leaders[i])
        .then((data) => {
     
          if (leaderNames.length === 0) {
            leaderNames.push(
              data.fields.Callsign + " - " + data.fields["IFC Name"]
            );
          } else if (
            !leaderNames.includes(
              data.fields.Callsign + " - " + data.fields["IFC Name"]
            )
          ) {
            leaderNames.push(
              data.fields.Callsign + " - " + data.fields["IFC Name"]
            );
          }
        })
        .catch((err) => console.log(err));
      if (leaderNames.length > 4) break;
    }
  }
  return leaderNames;
};

// Add code for fetching the legs of the airtable
exports.fetchLeg = async function (airtableConfigs, legNumber) {
  const airtableApiKey = airtableConfigs.airtable_api_key;
  const airtableBaseId = "appZylG0VHzYjDNaZ";
  const airtableTableName = "Fifth World Tour";

  // Initialise Airtable Connection
  var base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

  let legDetails = {};
  await base(airtableTableName)
    .select({
      view: "WT5 Route Table",
      maxRecords: 1,
      filterByFormula: `AND({Leg} = '${legNumber}')`,
    })
    .all()
    .then((data) => {
      legDetails = {
        route: data[0].fields.Route,
        leg: data[0].fields.Leg,
        aircrafts: data[0].fields.Aircraft.join(", "),
        livery: data[0].fields.Livery,
        fpl: data[0].fields["Flight Plan:"],
        hero: data[0].fields.Hero[0].url,
        sid: data[0].fields.SID,
        star: data[0].fields.STAR,
        cruise: data[0].fields["Cruise Speed"],
        depTerminal: data[0].fields["Dep. Terminal"],
        arrTerminal: data[0].fields["Arr. Terminal"],
        ft: data[0].fields.Duration,
        url: "https://airtable.com/shrcTKWwUx7GnJCys",
      };
    })
    .catch((err) => console.log(err));
  return legDetails;
};

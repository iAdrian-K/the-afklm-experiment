const Airtable = require("airtable");

// Add code for fetching the leaderboard
exports.fetchLeaderboard = async function (airtableConfigs) {
  const Airtable = require("airtable");


  // Initialising the basic config for the update
  const initials = "WT5";

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
      maxRecords: 3
    })
    .all()
    .then((data) => {
      data.forEach((route) => {
        leaders.push(route.fields.Callsign[0]);
      });
    })
    .catch(err => console.log(err))
   
    for(let i = 0; i<leaders.length ; i++){{
        await base('All Pilots').find(leaders[i])
        .then(data => {
            leaderNames.push(data.fields.Name);
        })
        .catch(err => console.log(err));
    }}
    return leaderNames;
};

// Add code for fetching the legs of the airtable
exports.fetchLeg = async function (airtableConfigs, legNumber) {};

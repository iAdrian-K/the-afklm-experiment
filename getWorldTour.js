require("dotenv").config({ path: "./.env" });
const Airtable = require("airtable");
const fs = require('fs');

// Initialising the basic config for the update
const initials = "WT5";

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const airtableTableName = "ROUTES V2";

const outFileName = "./wt-routes.json";

// Initialise Airtable Connection
var base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// Get Routes from the table
let routes = {};
base(airtableTableName)
  .select({
    view: "WT5 Routes",
  })
  .all()
  .then((data) => {
      data.forEach(route => {
          let currentRoute = route.fields.Route.slice(route.fields.Route.indexOf('[') + 1, route.fields.Route.indexOf(']'))
          routes[currentRoute] = {
              routeId: route.id,
              route: route.fields.Route
          }
      })
  })
  .then(() => {
      console.log(routes);
      fs.writeFileSync(outFileName, JSON.stringify(routes));
  })


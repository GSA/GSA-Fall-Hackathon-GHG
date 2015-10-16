/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'gsa-hackathon.cp5qykdsxe3g.us-east-1.rds.amazonaws.com',
  user     : 'hackUser',
  password : 'hackPass1234',
  database : 'ghg'
});

// Agency table: ghg_agency
// Stats table: ghg_stats

connection.connect();

var gasMult = 8.85928732;
var dieselMult = 7.40266869565217;
var hybridMult = 1.335297848;
var electricMult = 0;

module.exports = function(app) {

  // Insert routes below
  app.use('/api/things', require('./api/thing'));


    //**** ROUTES ****//

    app.route('/getAgencies')
        .get(function(req, res){
            connection.query("SELECT DISTINCT agyName, agyAbbrev FROM ghg_agency ORDER BY agyName ASC;",
                function(err, rows, fields) {
                    res.send(rows);
                });
        });

    app.route('/getVehicleStats/:agency')
        .get(function(req, res){
            connection.query("SELECT vehType, vehCount, agyName, GGE_E85, GGE_Gas, GGE_Diesel, GGE_Biodiesel, GGE_B20, GGE_Electricity FROM ghg_agency WHERE agyAbbrev = '"+ req.params.agency +"' ORDER BY GGE_Gas DESC;",
                function(err, rows, fields) {
                    var vehiclePairs = [];
                    var agencyName = rows[0]["agyName"];
                    var energyEfficientVehicles = 0;
                    var totalVehicles = 0;
                    var vehicleTypes = [];
                    var vehicleEmissions = [];
                    var totalGHG = 0;
                    var polarCars = [];
                    var polarGHG = [];
                    var max;

                    for (var i = 0; i < rows.length; i++){
                        var type = rows[i]["vehType"];
                        var count = rows[i]["vehCount"];
                        totalVehicles += count;

                        vehiclePairs.push([type,count]);

                        if (type == 'E85' || type == 'Electric'){
                            energyEfficientVehicles += count;
                        }

                        var GGE_E85 = rows[i]["GGE_E85"] * hybridMult;
                        var GGE_Gas = rows[i]["GGE_Gas"] * gasMult;
                        var GGE_Diesel = rows[i]["GGE_Diesel"] * dieselMult;
                        var GGE_Biodiesel = rows[i]["GGE_Biodiesel"] * dieselMult;
                        var GGE_B20 = rows[i]["GGE_B20"] * dieselMult;
                        var GGE_Electricity = rows[i]["GGE_Electricity"] * electricMult;

                        var ggh = GGE_E85 + GGE_Gas + GGE_Diesel + GGE_Biodiesel + GGE_B20 + GGE_Electricity;

                        vehicleTypes.push(type);
                        vehicleEmissions.push(Math.round(ggh));
                        polarCars.push(count);

                        totalGHG += ggh;
                    }

                    for (var j = 0; j < polarCars.length; j++){
                        polarCars[j] = Math.round(polarCars[j] / totalVehicles * 100);
                    }

                    var maxGHG = 0;
                    var minPercentOfFleet = 0;
                    var difference = 0;
                    var maxType = "";
                    for (var k = 0; k < vehicleEmissions.length; k++){
                        polarGHG[k] = Math.round(vehicleEmissions[k] / totalGHG * 100);

                        if (polarGHG[k] - polarCars[k] > difference){
                            difference = polarGHG[k] - polarCars[k];
                            maxGHG = polarGHG[k];
                            maxType = vehicleTypes[k];
                            minPercentOfFleet = polarCars[k];
                        }
                    }

                    var maxGHGandPercentDifference = [maxType, maxGHG, minPercentOfFleet];

                    var efficientCarPercentage = Math.round(energyEfficientVehicles/totalVehicles*100);

                    var response = {};
                    response.vehiclePairs = vehiclePairs;
                    response.agencyName = agencyName;
                    response.efficientCarPercentage = efficientCarPercentage;
                    response.vehicleTypes = vehicleTypes;
                    response.vehicleEmissions = vehicleEmissions;
                    response.polarCars = polarCars;
                    response.polarGHG = polarGHG;
                    response.maxGHGandPercentDifference = maxGHGandPercentDifference;

                    res.send(response);
                });
        });
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};

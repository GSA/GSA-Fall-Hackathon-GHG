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
            connection.query("SELECT vehType, vehCount, agyName FROM ghg_agency WHERE agyAbbrev = '"+ req.params.agency +"' ORDER BY vehType ASC;",
                function(err, rows, fields) {
                    var vehiclePairs = [];
                    var agencyName = rows[0]["agyName"];
                    var energyEfficientVehicles = 0;
                    var totalVehicles = 0;

                    for (var i = 0; i < rows.length; i++){
                        var type = rows[i]["vehType"];
                        var count = rows[i]["vehCount"];
                        totalVehicles += count;

                        vehiclePairs.push([type,count]);

                        if (type == 'E85' || type == 'Electric'){
                            energyEfficientVehicles += count;
                        }
                    }

                    console.log(totalVehicles);
                    console.log(energyEfficientVehicles);

                    var efficientCarPercentage = Math.round(energyEfficientVehicles/totalVehicles*100);

                    var response = {};
                    response.vehiclePairs = vehiclePairs;
                    response.agencyName = agencyName;
                    response.efficientCarPercentage = efficientCarPercentage;

                    res.send(response);
                });
        });

    app.route('/getVehicleEmissions/:agency')
        .get(function(req, res){
            connection.query("SELECT * FROM ghg_stats WHERE agyAbbrev = '"+ req.params.agency +"';",
                function(err, rows, fields) {
                    res.send(rows);
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

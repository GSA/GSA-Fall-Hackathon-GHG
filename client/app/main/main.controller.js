'use strict';

angular.module('ghgVisualizerApp')
  .controller('MainCtrl', function ($scope, $http) {
      $scope.selectedAgency = null;

      function loadAgencies() {
        $.ajax({
          url: "/getAgencies",
          context: document.body
        }).done(function(data) {
          if($scope.selectedAgency) {
            $scope.selectedAgency.destroy();
          }

          $scope.selectedAgency = $('#selectedAgency').selectize({
            options: data,
            labelField: 'agyName',
            valueField: 'agyAbbrev',
            searchField: 'agyName',
            onChange: function(agency) {
                agencySelected(agency);
            }
          })[0].selectize;
        });

        function agencySelected(agency){

          $.ajax({
            url: "/getVehicleStats/" + agency,
            context: document.body
          }).done(function(data) {
            renderPieChart('vehiclePieChart', data.agencyName, data.vehiclePairs, data.efficientCarPercentage);
            renderBarChart('emissionsBarChart',agency,data);
            renderSpiderChart('spiderChart',agency,data);

            var ghgStats = data.maxGHGandPercentDifference;
            $("#spiderSummary").html("Although " + ghgStats[0] + " vehicles account for <strong>" + ghgStats[1] + "%</strong> of the GHG emissions for " + data.agencyName + ", " + ghgStats[0] + " vehicles only make up <strong>" + ghgStats[2] + "%</strong> of the fleet.");

            renderFleetComposition(processFleetComposition(data));
          });

          $('#initialGraphs').show();
        }
      }

      loadAgencies();

      function processFleetComposition(raw){
          var gasCount = data.vehiclePairs[0][1];
          var e85count = data.vehiclePairs[1][1];
          var dieselCount = data.vehiclePairs[2][1];
          var electricCount = data.vehiclePairs[3][1];

          var emissionPerGas = data.vehicleEmissions[0]/gasCount;
          var emissionPerE85 = data.vehicleEmissions[1]/e85count;
          var emissionPerDiesel = data.vehicleEmissions[2]/dieselCount;
          var emissionPerElectric = data.vehicleEmissions[3]/electricCount;

          var reductions = calculateReduction(gasCount, e85count, dieselCount, electricCount,
          emissionPerGas, emissionPerE85, emissionPerDiesel, emissionPerElectric);

          var gasData = [gasCount];
          var e85Data = [e85count];
          var dieselData = [dieselCount];
          var electricData = [electricCount];

          reductions.forEach(function(r){
              gasData.push(r.gas);
              e85Data.push(r.e85);
              dieselData.push(r.diesel);
              electricData.push(r.electric);
          });

          var series = [{
              name: 'Gas',
              data: gasData
          },{
              name: 'E85',
              data: e85Data
          },{
              name: 'Diesel',
              data: dieselData
          },{
              name: 'Electric',
              data: electricData
          }];
      }

      function calculateReduction(a,b,c,d,e,f,g,h){
          var output = [];
          for ( var i = 0; i < 3; i++){
              output.push({
                  gas: 100-i*5,
                  e85: 100,
                  diesel: 100,
                  electric: 10+i*5
              });
          }
          return output;
      }

      function renderFleetComposition(series){

          $('#fleet-composition-chart').highcharts({
              chart: {
                  type: 'column'
              },
              title: {
                  text: ""
              },
              subtitle: {
                  text: 'Change Needed to Meet Emissions Reduction Executive Order'
              },
              credits: {
                  enabled: false
              },
              exporting: {
                  enabled: false
              },
              xAxis: {
                  categories: ['2014', '2017', '2021', '2025']
              },
              yAxis: {
                  min: 0,
                  title: {
                      text: 'Total Vehicles'
                  },
                  labels: {
                      formatter: function(x) {
                          return this.value+"%";
                      }
                  }
              },
              tooltip: {
                  pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                  shared: true
              },
              plotOptions: {
                  column: {
                      stacking: 'percent'
                  }
              },
              series: series
          });
      }

      function renderPieChart(id, agency, data, efficientCarPercentage) {
        console.log(id);
        $('#' + id).highcharts({
          chart: {
            type: 'pie',
            options3d: {
              enabled: true,
              alpha: 45,
              beta: 0
            }
          }, credits: {
            enabled: false
          }, exporting: {
            enabled: false
          }, title: {
            text: efficientCarPercentage + "% of " + agency + "'s vehicles are efficient"
          }, tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          }, plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              depth: 35,
              dataLabels: {
                enabled: true,
                format: '{point.name}'
              }
            }
          }, series: [{
            type: 'pie', name: 'Number of Vehicles', data: data
          }]
        });
      }

      function renderBarChart(id, agency, data){
        $('#'+id).highcharts({
          chart: {
            type: 'column'
          }, credits: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          title: {
            text: '2014 GHG Emissions by Vehicle Type'
          },
          xAxis: {
            categories: data.vehicleTypes
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Total GHG Emissions'
            },
            stackLabels: {
              enabled: true,
              style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
              }
            }
          },
          legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 25,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
          },
          tooltip: {
            formatter: function () {
              return '<b>' + this.x + '</b><br/>' +
                  this.series.name + ': ' + this.y + '<br/>' +
                  'Total: ' + this.point.stackTotal;
            }
          },
          plotOptions: {
            column: {
              stacking: 'normal',
              dataLabels: {
                enabled: false,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                style: {
                  textShadow: '0 0 3px black'
                }
              }
            }
          },
          series: [{
            name: data.agencyName,
            data: data.vehicleEmissions
          }]
        });
      }

      function renderSpiderChart(id, agency, data){
        $("#"+id).highcharts({
          credits: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          chart: {
            polar: true,
            type: 'line'
          },

          title: {
            text: "",
            x: 0
          },

          pane: {
            size: '100%'
          },

          xAxis: {
            categories: data.vehicleTypes,
            tickmarkPlacement: 'on',
            lineWidth: 0
          },

          yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
          },

          tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}%</b><br/>'
          },

          legend: {
            align: 'center',
            verticalAlign: 'bottom',
            y: 0,
            layout: 'vertical'
          },

            series: [{
              type: 'area',
              name: 'Percent of GHG Emissions',
              data: data.polarGHG
            },{
              type: 'line',
              name: 'Percent of Fleet',
              data: data.polarCars
            }]
        });
      }
  });

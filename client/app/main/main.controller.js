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
/*
        vehiclePairs: [
            [
                "Gas",
                25197
            ],
            [
                "E85",
                23927
            ],
            [
                "Diesel",
                13662
            ],
            [
                "Electric",
                513
            ]
        ],
            agencyName: "Department of Army",
            efficientCarPercentage: 39,
            vehicleTypes: [
            "Gas",
            "E85",
            "Diesel",
            "Electric"
        ],
            vehicleEmissions: [
            106233626,
            102762835,
            56042740,
            0
        ],
        */
      function processFleetComposition(raw){

      }

      function renderFleetComposition(data){

          var gasCount = data.vehiclePairs[0][1];
          var e85count = data.vehiclePairs[1][1];
          var dieselCount = data.vehiclePairs[2][1];
          var electricCount = data.vehiclePairs[3][1];

          var emissionPerGas = data.vehicleEmissions[0]/gasCount;
          var emissionPerE85 = data.vehicleEmissions[1]/gasCount;
          var emissionPerDiesel = data.vehicleEmissions[2]/gasCount;
          var emissionPerElectric = data.vehicleEmissions[3]/gasCount;

          //var i;
          //var e85series = [];
          //for ( i = 0; i < 4; i++)
          //  e85series.push(rawData.VEHCNT_E85);
          //
          //var e85gasSeries = [];
          //for (  i = 0; i < 4; i++)
          //    e85gasSeries.push(rawData.VEHCNT_GASE85);
          //
          //var otherSeries = [];
          //for ( i = 0; i < 4; i++)
          //    otherSeries.push(rawData.VEHCNT_OTHER);
          //
          //var gasSeries = [];
          //for (  i = 0; i < 4; i++)
          //    gasSeries.push(rawData.VEHCNT_TOTAL);

          var data = [{
              name: 'E85',
              data: [1,2,4,5]
          }, {
              name: 'E85 Gas',
              data: [1,2,4,5]
          }, {
              name: 'Other',
              data: [1,2,4,5]
          }, {
              name: 'Gas',
              data: [1,2,4,5]
          }];

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

              series: data
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

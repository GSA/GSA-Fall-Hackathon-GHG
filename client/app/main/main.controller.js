'use strict';

angular.module('ghgVisualizerApp')
  .controller('MainCtrl', function ($scope, $http) {
      $scope.selectedAgency = null;

      $scope.gasMult = 8.85928732;
      $scope.dieselMult = 7.40266869565217;
      $scope.hybridMult = 1.335297848;
      $scope.electricMult = 0;

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
                showFleetComposition(agency);
            }
          })[0].selectize;
        });



          function agencySelected(agency){
          // GET VEHICLE STATS

          $.ajax({
            url: "/getVehicleStats/" + agency,
            context: document.body
          }).done(function(data) {
            console.log(data);
            renderPieChart('vehiclePieChart', data.agencyName, data.vehiclePairs, data.efficientCarPercentage);
          });

          // GET

          $.ajax({
            url: "/getVehicleEmissions/" + agency,
            context: document.body
          }).done(function(data) {
            //console.log(data);


          });

          $('#initialGraphs').show();
        }
      }

        function showFleetComposition(agency){
            $.ajax({
                url: "/getVehicleEmissions/" + agency,
                context: document.body
            }).done(function(data){
                renderFleetComposition(data);
                $('#executiveOrderInformation').show();
            });
        }


      loadAgencies();


      function renderFleetComposition(agency){

          var i;
          var e85series = [];
          for ( i = 0; i < 4; i++)
            e85series.push(agency.VEHCNT_E85);

          var e85gasSeries = [];
          for (  i = 0; i < 4; i++)
              e85gasSeries.push(agency.VEHCNT_GASE85);

          var otherSeries = [];
          for ( i = 0; i < 4; i++)
              otherSeries.push(agency.VEHCNT_OTHER);

          var gasSeries = [];
          for (  i = 0; i < 4; i++)
              gasSeries.push(agency.VEHCNT_TOTAL);

          var data = [{
              name: 'E85',
              data: e85series
          }, {
              name: 'E85 Gas',
              data: e85gasSeries
          }, {
              name: 'Other',
              data: otherSeries
          }, {
              name: 'Gas',
              data: gasSeries
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
            type: 'pie', options3d: {
              enabled: true, alpha: 45, beta: 0
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
              allowPointSelect: true, cursor: 'pointer', depth: 35, dataLabels: {
                enabled: true, format: '{point.name}'
              }
            }
          }, series: [{
            type: 'pie', name: 'Number of Vehicles', data: data
          }]
        });
      }
  });

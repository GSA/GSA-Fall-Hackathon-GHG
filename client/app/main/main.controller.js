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
            onChange: function(agency) { agencySelected(agency) }
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
            console.log(data);


          });

          $('#initialGraphs').show();
        }
      }

      loadAgencies();

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

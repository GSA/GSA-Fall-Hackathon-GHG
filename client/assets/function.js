<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script>

var vehicle_count_gas      = 1324;
var vehicle_count_diesel   = 123;
var vehicle_count_hybrid   = 1412;
var vehicle_count_electric = 1;

var vehicle_emission_gas      = 130173;
var vehicle_emission_diesel   = 123123;
var vehicle_emission_hybrid   = 12321;
var vehicle_emission_electric = 0;

calculatePercentage(vehicle_count_gas, vehicle_count_diesel, vehicle_count_hybrid, vehicle_count_electric, vehicle_emission_gas, vehicle_emission_diesel, vehicle_emission_hybrid, vehicle_emission_electric);

function calculatePercentage(
  vehicle_count_gas, vehicle_count_diesel, vehicle_count_hybrid, vehicle_count_electric,
  vehicle_emission_gas, vehicle_emission_diesel, vehicle_emission_hybrid, vehicle_emission_electric) {

  //  gets units of measure for each type
  var vehicle_unit_gas      = vehicle_emission_gas / vehicle_count_gas;
  var vehicle_unit_diesel   = vehicle_emission_diesel / vehicle_count_diesel;
  var vehicle_unit_hybrid   = vehicle_emission_hybrid / vehicle_count_hybrid;
  var vehicle_unit_electric = vehicle_emission_electric / vehicle_count_electric;

  //  output array
  var output = [];

  //  totals
  var vehicle_emission_total = vehicle_emission_gas + vehicle_emission_diesel + vehicle_emission_hybrid + vehicle_emission_electric;
  var vehicle_count_total    = vehicle_count_gas + vehicle_count_diesel + vehicle_count_hybrid + vehicle_count_electric;

  console.log('---------------------------------------------------------------');
  console.log(
    '[gas] '
    + 'count: ' + vehicle_count_gas + '(' + (vehicle_count_gas / vehicle_count_total) * 100 + '%), '
    + 'emission: ' + vehicle_emission_gas + '(' + (vehicle_emission_gas / vehicle_emission_total) * 100 + '%)'
  );
  console.log(
    '[diesel] '
    + 'count: ' + vehicle_count_diesel + '(' + (vehicle_count_diesel / vehicle_count_total) * 100 + '%), '
    + 'emission: ' + vehicle_emission_diesel + '(' + (vehicle_emission_diesel / vehicle_emission_total) * 100 + '%)'
  );
  console.log(
    '[hybrid] '
    + 'count: ' + vehicle_count_hybrid + '(' + (vehicle_count_hybrid / vehicle_count_total) * 100 + '%), '
    + 'emission: ' + vehicle_emission_hybrid + '(' + (vehicle_emission_hybrid / vehicle_emission_total) * 100 + '%)'
  );
  console.log(
    '[electric] '
    + 'count: ' + vehicle_count_electric + '(' + (vehicle_count_electric / vehicle_count_total) * 100 + '%), '
    + 'emission: ' + vehicle_emission_electric + '(' + (vehicle_emission_electric / vehicle_emission_total) * 100 + '%)'
  );

  var percentageTarget_a = 4;
  var percentageTarget_b = 15;
  var percentageTarget_c = 30;

  //  gets units of measure for each type
  var new_vehicle_unit_gas      = vehicle_emission_gas / vehicle_count_gas;
  var new_vehicle_unit_diesel   = vehicle_emission_diesel / vehicle_count_diesel;
  var new_vehicle_unit_hybrid   = vehicle_emission_hybrid / vehicle_count_hybrid;
  var new_vehicle_unit_electric = vehicle_emission_electric / vehicle_count_electric;

  var new_vehicle_emission_total = vehicle_emission_total;

  var use_a = 1;
  var use_b = 1;
  var use_c = 1;

  var newPercentage = 0;
  //  decrement gas
  while (vehicle_count_gas > 0) {

    vehicle_count_gas      = vehicle_count_gas - 1;
    vehicle_count_electric = vehicle_count_electric + 1;

    new_vehicle_emission_gas      = vehicle_count_gas * vehicle_unit_gas;
    new_vehicle_emission_diesel   = vehicle_count_diesel * vehicle_unit_diesel;
    new_vehicle_emission_hybrid   = vehicle_count_hybrid * vehicle_unit_hybrid;
    new_vehicle_emission_electric = vehicle_count_electric * vehicle_unit_electric;

    new_vehicle_emission_total = new_vehicle_emission_gas + new_vehicle_emission_diesel + new_vehicle_emission_hybrid + new_vehicle_emission_electric;

// console.log('vehicle_emission_total' + vehicle_emission_total);
    //     console.log('new_vehicle_emission_total' + new_vehicle_emission_total);

    newPercentage = 100 - ((new_vehicle_emission_total / vehicle_emission_total) * 100);

    if (newPercentage > 4 && use_a == 1) {
      var data = {gas: new_vehicle_emission_gas, diesel: new_vehicle_emission_diesel, hybrid: new_vehicle_emission_hybrid, electric: new_vehicle_emission_electric}
      output.push(data);
      console.log(newPercentage);
      use_a = 0;

        console.log('---------------------------------------------------------------');
        console.log(
          '[newPercentage] '
          + newPercentage);
        console.log(
          '[gas] '
          + 'count: ' + vehicle_count_gas);
        console.log(
          '[diesel] '
          + 'count: ' + vehicle_count_diesel);
        console.log(
          '[hybrid] '
          + 'count: ' + vehicle_count_hybrid);
        console.log(
          '[electric] '
          + 'count: ' + vehicle_count_electric);

    }

    if (newPercentage > 15 && use_b == 1) {
      var data = {gas: new_vehicle_emission_gas, diesel: new_vehicle_emission_diesel, hybrid: new_vehicle_emission_hybrid, electric: new_vehicle_emission_electric}
      output.push(data);
      console.log(newPercentage);
      use_b = 0;

        console.log('---------------------------------------------------------------');
        console.log(
          '[newPercentage] '
          + newPercentage);
        console.log(
          '[gas] '
          + 'count: ' + vehicle_count_gas);
        console.log(
          '[diesel] '
          + 'count: ' + vehicle_count_diesel);
        console.log(
          '[hybrid] '
          + 'count: ' + vehicle_count_hybrid);
        console.log(
          '[electric] '
          + 'count: ' + vehicle_count_electric);
    }

    if (newPercentage > 30 && use_c == 1) {
      var data = {gas: new_vehicle_emission_gas, diesel: new_vehicle_emission_diesel, hybrid: new_vehicle_emission_hybrid, electric: new_vehicle_emission_electric}
      output.push(data);
      console.log(newPercentage);
      use_c = 0;

        console.log('---------------------------------------------------------------');
        console.log(
          '[newPercentage] '
          + newPercentage);
        console.log(
          '[gas] '
          + 'count: ' + vehicle_count_gas);
        console.log(
          '[diesel] '
          + 'count: ' + vehicle_count_diesel);
        console.log(
          '[hybrid] '
          + 'count: ' + vehicle_count_hybrid);
        console.log(
          '[electric] '
          + 'count: ' + vehicle_count_electric);
      break;
    }
  }

  console.log(output);
  return output;

}








</script>

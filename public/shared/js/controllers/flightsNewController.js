var flightNewController = function($scope, $location, api, $routeParams) {

  $scope.pageClass = 'page-flights';
  $scope.title = "Choose a Flight";
  $scope.buttonTextNxt = "Next";
  $scope.buttonTextBk = "Back";

  if (Type == "desktop") {
    $scope.isCollapsed = false;
    $scope.isOutgoingFlightSelected = false;
  } else {
    $scope.miniLogoPath = function(operatorAirline) {
      if (operatorAirline === "Air Berlin")
        return "img/air-berlin-mini-logo.png"
      return "img/other-airline-mini-logo.png"
    };
  }

  api.setIsOtherHosts(true);

  $scope.goNext = function() {

    api.setOutGoingFlight($scope.selectedOutgoingFlight);
    api.setReturningFlight($scope.selectedReturningFlight);
    api.setBooking($scope.selectedBooking);

    if (Type == "desktop")
      $location.path('/passenger-details');
    else
      $location.go('tab.passenger-details');

  }

  $scope.goBack = function() {
    $location.path('/');
  }

  $scope.selectedBooking = {
    "passengerDetails": [{
      "firstName": null,
      "lastName": null,
      "passportNum": null,
      "passportExpiryDate": null,
      "dateOfBirth": null,
      "nationality": null,
      "email": null,
    }],
    "class": null,
    "outgoingFlightId": null,
    "returnFlightId": null,
    "paymentToken": null
  }

  var origin = $routeParams.origin;
  var destination = $routeParams.destination;
  var exitDate = new Date($routeParams.exitDate * 1000);

  $scope.origin = origin;
  $scope.destination = destination;
  $scope.exitDate = exitDate;

  var isEconomy = $routeParams.flightClass == "Economy";
  $scope.roundTrip = false;

  if ($routeParams.returnDate) {
    var returnDate = new Date($routeParams.returnDate * 1000);
    $scope.returnDate = returnDate;
    $scope.roundTrip = true;
  }

  var returnDateMill;

  if (returnDate)
    returnDateMill = returnDate.getTime();

  if (isEconomy) {
    api.getOtherFlightsEco(origin, destination, exitDate.getTime(), returnDateMill).then(function mySuccess(response) {
      $scope.flights = response.data;
    }, function myError(response) {
      console.log(response.statusText);
    });
  } else {
    api.getOtherFlightsBusi(origin, destination, exitDate.getTime(), returnDateMill).then(function mySuccess(response) {
      $scope.flights = response.data;
    }, function myError(response) {
      console.log(response.statusText);
    });
  }

  $scope.selectOutgoingFlight = function(flight) {
    $scope.isOutgoingFlightSelected = true;
    $scope.selectedOutgoingFlight = flight;
    $scope.selectedBooking.class = isEconomy === true ? "economy" : "business";
    $scope.selectedBooking.outgoingFlightId = flight.flightId;
    $scope.selectedBooking.outgoingUrl = flight.url;
    $scope.selectedBooking.outgoingCost = flight.cost;
  }

  $scope.selectReturningFlight = function(flight) {
    $scope.isReturningFlightSelected = true;
    $scope.selectedReturningFlight = flight;
    $scope.selectedBooking.returnFlightId = flight.flightId;
    $scope.selectedBooking.returnUrl = flight.url;
    $scope.selectedBooking.returnCost = flight.cost;
  }

  $scope.checkNextBtnState = function() {

    if ($scope.roundTrip)
      return $scope.isReturningFlightSelected && $scope.isOutgoingFlightSelected;
    else
      return $scope.isOutgoingFlightSelected;

  }

}


if (Type == 'mobile') {
  flightNewController.$inject = ['$scope', '$state', 'api', '$stateParams'];
} else {
  flightNewController.$inject = ['$scope', '$location', 'api', '$routeParams'];
}


App.controller('flightsNewCtrl', flightNewController);

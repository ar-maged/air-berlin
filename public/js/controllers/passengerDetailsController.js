// @yassmine
App.controller('passengerDetailsCtrl', function($scope, $location, api) {
  $scope.title = "Fill in your details";

  $scope.buttonTextNxt = "Next";
  $scope.buttonTextBk = "Back";

  $scope.titles = ['Mr', 'Mrs', 'Ms', 'Dr'];
  $scope.titlesBtnText = $scope.titles[0];
  $scope.changeTitle = function(text) {
    $scope.titlesBtnText = text;
  }

  api.getCountries().then(function mySucces(response) {
    $scope.countries = response.data;
  }, function myError(response) {
    console.log(response.statusText);
  });


  $scope.passenger = {

    firstName: null,
    middleName: null,
    lastName: null,
    passportNumber: null,
    phoneNumber: null,
    email: null

  };
// ---------------------------------------- Now you have $scope.nationality and $scope.titlesBtnText you can use them in your object
  var complete = false;
  $scope.goNext = function() {
    $scope.passenger = {

      firstName: $scope.firstName,
      middleName: $scope.middleName,
      lastName: $scope.lastName,
      passportNumber: $scope.passportNumber,
      phoneNumber: $scope.phoneNumber,
      email: $scope.email
        //i couldn't extract the value of the country nor the title.

    };
    ///before you leave the page make sure that the passenger object is complete otherwise show alert("Fill in all data");
    console.log($scope.passenger);



    if (complete == false) {
      if (($scope.firstName == null) || ($scope.middleName == null) || ($scope.lastName == null) || ($scope.phoneNumber == null) || ($scope.passportNumber == null)) {
        alert("Please fill in data");
        console.log(complete);

      } else {
        if ($scope.email1 != $scope.emailver)
          alert("The repeated email doesnt match the first email");
        else {
          if (($scope.check == null))
            alert("Please check the box");
          else {
            complete = true;
          }
        }

      }


    }
    if (complete == true) {
      $location.path('/seating');
    }

  }
  $scope.goBack = function() {
      $location.path('/exit-flight');
    }
    //yasmine you're not expecting any parameters. You're only creating a form and you will have
    // the resulting object ready to be sent to the server



});

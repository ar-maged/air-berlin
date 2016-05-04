// Dependancies
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var airports = require('./mockdata/airports.json');
var aircrafts = require('./mockdata/aircrafts.json');
var flights = require('./mockdata/flights.json');
var countries = require('./mockdata/countries.json');

// Declarations
var DB = null;

// Connection URL
var url = 'mongodb://localhost:27017/air-berlin';

// Connects to database
exports.init = function(cb) {
  MongoClient.connect(url, function(err, db) {
    DB = db;
    cb(err);
  });
};

// DB getter
exports.db = function() {
  if (DB === null)
    throw Error('DB Object has not yet been initialized.');
  return DB;
};

exports.seed = function(cb) {

  /*seeds the database collections with the json files (airports/aircrafts/flights/countries)
    & creates collections for passengers & booking to insert in later on */

  // Populate airports
  DB.collection('airports', {
    strict: true
  }, function(err, collection) {
    if (err) {
      dropDB(function() {});
      DB.collection('airports', function(err, collection) {
        collection.insert(airports, {
          safe: true
        }, function(err, result) {});
      });
      cb(true);
    } else
      cb(false);
  });

  // Populate aircrafts
  DB.collection('aircrafts', {
    strict: true
  }, function(err, collection) {
    if (err) {
      DB.collection('aircrafts', function(err, collection) {
        collection.insert(aircrafts, {
          safe: true
        }, function(err, result) {});
      });
      // Feed seatmap from aircraft to flight
      flights.forEach(function(flight) {

        aircrafts.forEach(function(aircraft) {
          if (aircraft.tailNumber === flight.refAircraftTailNumber) {
            flight.seatmap = aircraft.seatmap;
            flight.refAircraftModel = aircraft.model;
            flight.emptyEconomySeatsCount = aircraft.economySeatCount;
            flight.emptyBusinessSeatsCount = aircraft.businessSeatCount;
            flight.economySeatSchema = aircraft.economySeatSchema;
            flight.buisnessSeatSchema = aircraft.businessSeatSchema;
          }
        });
      });
    }
  });

  // Populate flights
  DB.collection('flights', {
    strict: true
  }, function(err, collection) {
    if (err) {
      DB.collection('flights', function(err, collection) {
        collection.insert(flights, {
          safe: true
        }, function(err, result) {});
      });
    }
  });

  // Populate countries
  DB.collection('countries', {
    strict: true
  }, function(err, collection) {
    if (err) {
      DB.collection('countries', function(err, collection) {
        collection.insert(countries, {
          safe: true
        }, function(err, result) {});
      });
    }
  });
};

exports.getFlight = function(_id, cb) {
  // get flight from db with id
  DB.collection('flights').findOne({
    "_id": _id
  },function(err, flight) {
    if (err) return cb(err);
    cb(null, flight);
  });
};

exports.getFlights = function(origin, destination, exitDate, reEntryDate, isOneway, cb) {
  // view #2 will have to aquire flights from db with input params
  //from view #1 (date, arrival, depAirport, round/oneway)

  var result = {};
  result = {
    outgoingFlights: [],
    returnFlights: []
  }
  DB.collection('flights').find({
    $and: [{
      "refOriginAirport": origin
    }, {
      "refDestinationAirport": destination
    }]
  }).toArray(function(err, flights) {

    if (err) return cb(err);

    flights = flights.filter(function(flight) {
      var flightDate = new Date(flight.departureUTC);
      var constraintDate = new Date(exitDate);
      return flightDate.getDate() === constraintDate.getDate() && flightDate.getMonth() === constraintDate.getMonth() && flightDate.getFullYear() === constraintDate.getFullYear();
    });

    result.outgoingFlights = flights;


    if (isOneway) {
      cb(null, result);
      return;
    } else {
      DB.collection('flights').find({
        $and: [{
          "refOriginAirport": destination
        }, {
          "refDestinationAirport": origin
        }]
      }).toArray(function(err, flights) {

        if (err) return cb(err);

        flights = flights.filter(function(flight) {
          var flightDate = new Date(flight.departureUTC);
          var constraintDate = new Date(reEntryDate);
          return flightDate.getDate() === constraintDate.getDate() && flightDate.getMonth() === constraintDate.getMonth() && flightDate.getFullYear() === constraintDate.getFullYear();
        });

        result.returnFlights = flights;
        cb(null, result);
        return;
      });
    }

  });
  // console.log(result.outgoingFlights);

};

exports.getAirport = function(iata, cb) {
  // get airport from db with the given iata
  DB.collection('airports').find({
    "iata": iata
  }).toArray(function(err, airport) {
    if (err) return cb(err);
    cb(null, airport);
  });
};

exports.getAirports = function(cb) {
  // get all airports from db
  DB.collection('airports').find({}).toArray(function(err, airports) {
    if (err) return cb(err);
    cb(null, airports);
  });
};

exports.getAircraft = function(tailNumber, cb) {
  // get aircraft from db with the given tailNumber
  DB.collection('aircrafts').find({
    "tailNumber": tailNumber
  }).toArray(function(err, aircraft) {
    if (err) return cb(err);
    cb(null, aircraft);
  });
};

exports.getAircrafts = function(cb) {
  // get all aircrafts from db
  DB.collection('aircrafts').find({}).toArray(function(err, aircrafts) {
    if (err) return cb(err);
    cb(null, aircrafts);
  });
};

exports.getCountries = function(cb) {
  //gets all countries
  DB.collection('countries').find({}).toArray(function(err, countries) {
    if (err) return cb(err);
    cb(null, countries);
  });
};

exports.getBooking = function(_id, cb) {
  DB.collection('bookings').findOne({
    "_id": _id
  },function(err, booking) {
    if (err) return cb(err);
    cb(null, booking);
  });
};

exports.getPassenger = function(_id, cb) {
  DB.collection('passengers').findOne({
    "_id": _id
  },function(err, passenger) {
    if (err) return cb(err);
    cb(null, passenger);
  });
};

// On Confirmation
// exports.postPassenger = function(passenger, cb) {
//     //post created passenger to db
//     DB.collection('passengers', function(err, collection) {
//         collection.insert(passenger, {
//             safe: true
//         }, function(err, result) {
//             cb(err, result);
//         });
//     });
// };

exports.postPassengers = function(passengers, cb) {
  //post created passengers to db
  var res = [];
  for (var i = 0; i < passengers.length; i++) {
    DB.collection('passengers', function(err, collection) {
      if(err)
      console.log(err)
      else
      collection.insert(passengers[i], {
        safe: true
      }, function(err, result) {
        res.push(result.ops[0]._id);
        if(res.length == passengers.length){
          cb(null,res)
        }
      });

    });
  }
};

exports.postBooking = function(booking, cb) {
  //post created booking to db
  DB.collection('bookings', function(err, collection) {
    collection.insert(booking, {
      safe: true
    }, function(err, result) {
      cb(err, result);
    });
  });
};

exports.updateFlight = function(isOtherHosts, flightID, isEconomy, seatNumber, passengersID, bookingID, cb) {

  console.log(seatNumber);

  function findSeat(seat) {
    return seat.number === seatNumber;
  }

  //update the flight with the allocated seats
  DB.collection('flights').findOne({
    "_id": new ObjectID(flightID)
  },function(err, flight) {
    if (err) return cb(err);
    if (!isOtherHosts) {
      var seat = flight.seatmap.find(findSeat);
      console.log(seat.number);
      seat.refPassengerID.push(passengersID[0].toString());
      seat.refBookingID = bookingID.toString();
      seat.isEmpty = false;
    }
    else {
      for (var j = 0; j < passengersID.length; j++) {
        found = false;
        for (i = 0; i < flight.seatmap.length; i++) {
          var seat = flight.seatmap[i];
          if ((seat.isEconomy && isEconomy)||(!seat.isEconomy && !isEconomy) && seat.isEmpty) {
            seat.refPassengerID.push(passengersID[j].toString());
            seat.refBookingID = bookingID.toString();
            seat.isEmpty = false;
            found = true;
            break;
          }
        }

      }


    }

    if (isEconomy) {

      if (found && flight.emptyEconomySeatsCount >= passengersID.length)
        DB.collection('flights').update({
          "_id": new ObjectID(flightID)
        }, {
          $set: {
            "seatmap": flight.seatmap
          },
          $inc: {
            "emptyEconomySeatsCount": -1 * passengersID.length
          }
        }, function(err, result) {
          cb(err, result);
        });

      else cb("there is no enough seats available", null);


    } else {

      if (found && flight.emptyBusinessSeatsCount >= passengersID.length)
        DB.collection('flights').update({
          "_id": new ObjectID(flightID)
        }, {
          $set: {
            "seatmap": flight.seatmap
          },
          $inc: {
            "emptyBusinessSeatsCount": -1 * passengersID.length
          }
        }, function(err, result) {
          cb(err, result);
        });

      else cb("there is no enough seats available", null);


    }
  });

};

// Drops collections
exports.clear = function(done) {
  DB.listCollections().toArray().then(function(collections) {
    collections.forEach(function(c) {
      DB.collection(c.name).removeMany();
    });
    done();
  }).catch(done);
};

//Drops database
function dropDB(done) {
  DB.dropDatabase();
  done();
};

exports.close = function() {
  DB.close();
};

exports.DB = DB;

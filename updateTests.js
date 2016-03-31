var mongoose = require('mongoose');
var azure = require('azure-storage');
var azureConnect = require(__dirname + '/AZURE');
var Measurement = require(__dirname + '/models/measurement');
var Test = require(__dirname + '/models/test');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';
var bs = azure.createBlobService(azureConnect.storageAccount, azureConnect.storageAccessKey);
var async = require("async");
var num = 20000;
mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
	console.log("Connected to database.");
});

function createTest(name) {
	var result = new Test();
	result.name = name;
	result.save(function (err) {
        if (err)
                console.error(err);
        else {
                console.log(result.name + " created.");
 		return result;
	}
        });
}

function updateTests() {
  Measurement.find().distinct('testName', function(error, names) {
    for (var i = 0; i < names.length; i++) {
      console.log(names[i]);
      createTest(names[i]);
    }
    process.exit(0);
  });
}

updateTests();

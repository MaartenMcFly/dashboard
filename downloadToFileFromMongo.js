var mongoose = require('mongoose');
var Measurement = require(__dirname + '/models/measurement');
var MeasurementProperties = require(__dirname + '/models/measurementproperties');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';
var fs = require('fs');
var filename = __dirname + "/measurements.txt";

mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
	console.log("Connected to database.");
});

var p = new Date();
var stream = fs.createWriteStream(filename);

p.setDate(p.getDate()-7);	
var query = Measurement.find({testTimestamp: {$gte : p}}).sort({'testTimestamp':1}).exec(function(err, ms) {
	if (err)
		console.error(err);
	ms.map(function (m) {
		stream.write(m.testName + ',' + Date.parse(m.testTimestamp) + ',' + m.testDuration + ',' + m.testTimestamp);
	});
	console.log("There are " + ms.length);
});

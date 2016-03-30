var mongoose = require('mongoose');
var MeasurementProperties = require(__dirname + '/models/measurementproperties');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';
var LineByLineReader = require('line-by-line'),
	lr = new LineByLineReader('properties.txt');
var async = require("async");
var p;

mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
	console.log("Connected to database.");
});

var maxDate = MeasurementProperties.find().sort('testTimestamp': -1).filter(1);

function createMeasurementProperties(blobName, testTimestamp) {
	var m = new MeasurementProperties();
	m.blobName = blobName;
	m.testTimestamp = testTimestamp;
	m.save(function(err) {
		if (err)
		{
			console.log(err);
		}
	});
	m = null;
}

lr.on('error', function (err) {
        // 'err' contains error object
});

lr.on('line', function (line) {
	try {
		p = JSON.parse(line);
	} catch (e) {
		console.error(e);
		p = null;
	}
	
	if (p)
		createMeasurementProperties(p.name, p.properties["last-modified"]);
		
        // 'line' contains the current line without the trailing newline character.
        //console.log(s);
});

lr.on('end', function () {
        // All lines are read, file is closed now.
});

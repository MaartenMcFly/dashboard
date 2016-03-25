var mongoose = require('mongoose');
var azure = require('azure-storage');
var azureConnect = require(__dirname + '/AZURE');
var Measurement = require(__dirname + '/models/measurement');
var MeasurementProperties = require(__dirname + '/models/measurementproperties');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';
console.log(azureConnect.storageAccount);
var bs = azure.createBlobService(azureConnect.storageAccount, azureConnect.storageAccessKey);
var async = require("async");
var num = 10000;
mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
	console.log("Connected to database.");
});

function insertMeasurement(p) {
	bs.getBlobToText(azureConnect.storageContainer, p.blobName, function(err, blobContent, blob) {
		a = blobContent.split("\n");
	 	a.splice(0, a.length - 1).map(function (t) {
			t = JSON.parse(t);
			if (t.availability[0].testName) {
				var m = new Measurement();
				m.testName = t.availability[0].testName;
				m.testTimestamp = t.availability[0].testTimestamp;
				m.testDuration = t.availability[0].durationMetric.value / 10000000;
				m.save(function (err) {
					if (err)
						console.error(err);
					else {
						p.isUploaded = true;
						p.save();
					}
				});
			}
		});	
	});
}
	
var query = MeasurementProperties.find({isUploaded: false}).sort({'testTimestamp':1}).limit(num);
query.exec(function (err, props) {
	if (err)
		console.error(err);
	else {
		async.forEachLimit(props, 10, function(prop, callback) {
			//props.map(function(prop) {insertMeasurement(prop);});
			insertMeasurement(prop);
			async.setImmediate(function() {
				callback(null);
			});
		}, function (err) {
			if (err) {return next(err);}
		});
	}
});

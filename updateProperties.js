var azureConnect = require(__dirname + '/AZURE');
var storageContainer = 'appsinsightcontainer'
var azure = require('azure-storage');
var bs = azure.createBlobService(azureConnect.storageAccount, azureConnect.storageAccessKey);
var async = require("async");
var mongoose = require('mongoose');
var MeasurementProperties = require(__dirname + '/models/measurementproperties');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';

var myBlobs = [];
var i = 0;
var timeStamp;

function download(err, token) {
	if (err)
		console.log(err);
	bs.listBlobsSegmented(storageContainer, token, function (err, result) {
		if (err)
			console.error(err);
		i += result.entries.length;
		myBlobs = myBlobs.concat(result.entries);
		console.log(i);			
		if (result.continuationToken !== null)
		{
			download(err, result.continuationToken);
		} else {
			console.log("Total: " + i);
			writeBlobProperties();
		}
	});
}

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

function writeBlobProperties() {
	myBlobs.forEach(function(b) {
		if (Date.parse(b.properties["last-modified"]) > timeStamp.getTime()) 
			createMeasurementProperties(b.name, b.properties["last-modified"]);
	});
}

mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
        console.log("Connected to database.");
});

var query = MeasurementProperties.find().sort({'testTimestamp': -1}).limit(1).exec(
function (err, result) {
	if (err)
		console.error(err);
	timeStamp =(result[0].testTimestamp);;
});

download(null, null);

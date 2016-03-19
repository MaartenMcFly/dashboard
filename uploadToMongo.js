var storageAccount = 'appsinsight2blob';
var storageAccessKey = 'Lg2iv9Qg/vrfuusHeX3jOd5h+L44g01HD1csulk7bECnSWfQQk1WRVQUAvq9x3rtxkJ6BD6ZHbfMvSzlFSQZlA==';
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=appsinsight2blob;AccountKey=Lg2iv9Qg/vrfuusHeX3jOd5h+L44g01HD1csulk7bECnSWfQQk1WRVQUAvq9x3rtxkJ6BD6ZHbfMvSzlFSQZlA==;BlobEndpoint=https://appsinsight2blob.blob.core.windows.net/;TableEndpoint=https://appsinsight2blob.table.core.windows.net/;QueueEndpoint=https://appsinsight2blob.queue.core.windows.net/;FileEndpoint=https://appsinsight2blob.file.core.windows.net/';

var storageContainer = 'appsinsightcontainer'
var azure = require('azure-storage');
var blobSvc = azure.createBlobService(storageAccount, storageAccessKey);
var mongoose = require('mongoose');
var Measurement = require(__dirname + '/models/measurement');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';

var async = require("async");

mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
	console.log("Connected to database.");
});

var blobs = [];
var flag = false;
var i = 0;

function createMeasurement(testName, testTimestamp, testDuration) {
	var m = new Measurement();
	m.testName = testName;
	m.testTimestamp = testTimestamp;
	m.testDuration = testDuration;
	m.save(function(err) {
		if (err)
		{
			console.log(error);
		}
		console.log(m + " saved.");
		return m;
	});
}

function aggregateBlobs(err, result, cb) {
	if (err) {
		console.error(err);
	} else {
		console.log("Length: " + blobs.length);	
		blobs = blobs.concat(result.entries);;
		if (result.continuationToken !== null && flag) {
			console.log("Getting some more,,,");
			blobSvc.listBlobsSegmented(storageContainer, result.continuationToken, function (err, blobs) {
				aggregateBlobs(err, blobs, aggregateBlobs);
			});
		} else {
			console.log("Total: " + blobs.length);
			var p = new Date();
			p.setDate(p.getDate()-7);

			async.forEachLimit(blobs, 200, function(blob, callback) {				
				blobSvc.getBlobToText(storageContainer, blob.name, function(err, blobContent, blob) {
					var t;
        				try {
                				t = JSON.parse(blobContent);
        				} catch (e) {
                				console.error("Parse failed: " + e);
        				}	
        				if (t) {
						createMeasurement(t.availability[0].testName, t.availability[0].testTimestamp, t.availability[0].durationMetric.value / 10000000);
        				}	
        				t = null;
				});
				async.setImmediate(function() {
					callback(null);
				});}, function(err) {
					if (err) return next(err);
				});
			}
		} 
	}

blobSvc.listBlobsSegmented(storageContainer, null, function(err, result){
	aggregateBlobs(err, result, function(err, blobs) {
  		if(!error){
   			console.log("No blobs");
			console.error(err);
		} else {
			console.log(blobs);
		}
	});
});


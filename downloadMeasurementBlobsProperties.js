var azureConnect = require(__dirname + '/AZURE');
var storageContainer = 'appsinsightcontainer'
var azure = require('azure-storage');
var bs = azure.createBlobService(azureConnect.storageAccount, azureConnect.storageAccessKey);
var fs = require('fs');
var async = require("async");
var propertyFilename = "properties.txt";
var blobFilename = "output.txt";


var myBlobs = [];
var i = 0;

function download(err, token) {
	if (err)
		console.log(err);
	bs.listBlobsSegmented(storageContainer, token, function (err, result) {
		if (err)
			console.error(err);
		i += result.entries.length;
		myBlobs = myBlobs.concat(result.entries);
		console.log(i);			
		if (result.continuationToken !== null )
		{
			download(err, result.continuationToken);
		} else {
			console.log("Total: " + i);
			// Write all measurements
			//	writeMeasurements();
			writeBlobProperties();
		}
	});
}

function writeMeasurements() {
	var stream = fs.createWriteStream(blobFilename);;
	async.forEachLimit(myBlobs, 200, function(blob, callback) {
		bs.getBlobToText(storageContainer, blob.name, function(err, blobContent, blob) {
			stream.write(blob);
		});
		async.setImmediate(function() {
			callback(null);
		});
		
	}, function (err) {
		if (err) return next(err)}
	);
}

function writeBlobProperties() {
	var file = fs.createWriteStream(propertyFilename);
	file.on('error', function(err) { console.error(err);});
	myBlobs.forEach(function(b) {file.write(JSON.stringify(b) + '\n')});
	file.end();
}

download(null, null);

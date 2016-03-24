var storageAccount = 'appsinsight2blob';
var storageAccessKey = 'Lg2iv9Qg/vrfuusHeX3jOd5h+L44g01HD1csulk7bECnSWfQQk1WRVQUAvq9x3rtxkJ6BD6ZHbfMvSzlFSQZlA==';
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=appsinsight2blob;AccountKey=Lg2iv9Qg/vrfuusHeX3jOd5h+L44g01HD1csulk7bECnSWfQQk1WRVQUAvq9x3rtxkJ6BD6ZHbfMvSzlFSQZlA==;BlobEndpoint=https://appsinsight2blob.blob.core.windows.net/;TableEndpoint=https://appsinsight2blob.table.core.windows.net/;QueueEndpoint=https://appsinsight2blob.queue.core.windows.net/;FileEndpoint=https://appsinsight2blob.file.core.windows.net/';

var storageContainer = 'appsinsightcontainer'
var azure = require('azure-storage');
var bs = azure.createBlobService(storageAccount, storageAccessKey);
var fs = require('fs');
var async = require("async");
var filename = "output.txt";


var myBlobs = [];
var i = 0;
var stream = fs.createWriteStream(filename);;

function download(err, token) {
	if (err)
		console.log(err);
	bs.listBlobsSegmented(storageContainer, token, function (err, result) {
		if (err)
			console.error(err);		
		if (result.continuationToken !== null)
		{
			i += result.entries.length;
			console.log(i);
			myBlobs = myBlobs.concat(result.entries);
			download(err, result.continuationToken);
		} else {
			console.log("Total: " + i);
			// Write all measurements
			writeMeasurements();
		}
	});
}

function writeMeasurements() {
	async.forEachLimit(myBlobs, 20, function(blob, callback) {
		bs.getBlobToText(storageContainer, blob.name, function(err, blobContent, blob) {
			stream.write(blobContent);
		});
		async.setImmediate(function() {
			callback(null);
		});
		
	}, function (err) {
		if (err) return next(err)}
	);
}

download(null, null);

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Measurement = require(__dirname + '/models/measurement');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';
var router = express.Router();
var port = process.env.PORT || 5000;

mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
        console.log("Connected to database.");
});

router.route('/tests')
	.get(function(req, res) {
		Measurement.find().distinct('testName', function (error, names) {
			if (error)
				res.send(err);
			res.json(names);
		});
	});

router.route('/measurements') 
	.get(function(req, res) {
		/*var query = Measurements.find();
		for (var key in req.query) {
			if (req.query.hasOwnProperty(key)) {
				conditions[key]=
		if (req.query.since) {
			var d = new Date(req.query.since);
			delete req.query.since;
			req.query.push({testTimestamp: {$gt: d}});
		}*/
		console.log(JSON.stringify(req.query));
		Measurement.find(req.query, function (error, measurements) {
			if (error)
				res.send(err);
//			console.log(measurements[0].testTimestamp);
			res.json(measurements);
		});
	});
app.use('/api', router);
app.listen(port);



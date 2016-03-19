var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeasurementSchema = new Schema( {
	testName: String,
	testTimestamp: Date,
	testDuration: Number
}, {timsestamps: true));

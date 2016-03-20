var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeasurementSchema = new Schema( {
	testName: String,
	testTimestamp: Date,
	testDuration: Number
}, {timestamps: true});

module.exports = mongoose.model('Measurement', MeasurementSchema);

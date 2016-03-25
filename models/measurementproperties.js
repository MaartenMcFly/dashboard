var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MeasurementPropertiesSchema = new Schema( {
	blobName: String,
	testTimestamp: Date,
	isUploaded: { type: Boolean, default: false } 
});

module.exports = mongoose.model('MeasurementProperties', MeasurementPropertiesSchema);

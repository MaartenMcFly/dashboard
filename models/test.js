var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema( {
	name: {type: String, unique:true}
});

module.exports = mongoose.model('Test', TestSchema);

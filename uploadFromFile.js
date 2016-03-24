var mongoose = require('mongoose');
var Measurement = require(__dirname + '/models/measurement');
var connectString = 'mongodb://measurementsAdmin:LudHaf97!@52.58.21.162:27000/measurements?authMechanism=SCRAM-SHA-1';
mongoose.connect(connectString);
mongoose.connection.once('connected', function() {
        console.log("Connected to database.");
});

var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('output.txt');
var s;

function createMeasurement(testName, testTimestamp, testDuration) {
        var m = new Measurement();
        m.testName = testName;
        m.testTimestamp = testTimestamp;
        m.testDuration = testDuration;
        m.save(function(err) {
                if (err)
                {
                        console.log(err);
                }
                //return m;
        });
        m = null;
}

lr.on('error', function (err) {
	// 'err' contains error object
});

lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.
	try {
		s = JSON.parse(line);
		createMeasurement(s.availability[0].testName, s.availability[0].testTimestamp, s.availability[0].durationMetric.value / 10000000);
	} catch (e) {
		console.error(e);
	}
	
	//console.log(s);
});

lr.on('end', function () {
	// All lines are read, file is closed now.
});

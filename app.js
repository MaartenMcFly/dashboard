var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.js');

var visitorData = {};

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname, 'public/')));

app.get(/\/(about|contact)?$/, function(req, res) {
	res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.get('/chart_1', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/chart1.html'));
});

function computeStats(){
  return {
    pages: computePageCounts(),
    referrers: computeRefererCounts(),
    activeUsers: getActiveUsers()
  };
}

function computePageCounts() {
var pageCounts = {};
  for (var key in visitorData) {
    var page = visitorData[key].page;
    if (page in pageCounts) {
      pageCounts[page]++;
    } else {
      pageCounts[page] = 1;
    }
  }
  return pageCounts;
}

function computeRefererCounts() {
	var referrerCounts = {};
  	for (var key in visitorData) {
    		var referringSite = visitorData[key].referringSite || '(direct)';
    		if (referringSite in referrerCounts) {
      			referrerCounts[referringSite]++;
    		} else {
      			referrerCounts[referringSite] = 1;
    		}
  	}
  	return referrerCounts;
}

function getActiveUsers() {
 	return Object.keys(visitorData).length;
}

io.on('connection', function(socket) {
     	if (socket.handshake.headers.host === config.host
  && socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {
    		io.emit('updated-stats', computeStats());
        }
    
	socket.on('visitor-data', function(data) {
		visitorData[socket.id]=data;
		io.emit('updated-stats', computeStats());
	});
	
     	socket.on('disconnect', function() {
		delete visitorData[socket.id];
		io.emit('updated-stats', computeStats());
    	});
});

http.listen(app.get('port'), function() {
	console.log('listening on *:' + app.get('port'));
});

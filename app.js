var mosca = require('mosca');
var fs = require('fs');
var q = require('q');
var currentLine = 1;
var constants = require('./config/constants.js');

function getCurrentLine() {
    var defer = q.defer();
    fs.readFile('filelist', function(err, data) {
        if (err)
            defer.reject("Error reading line " + currentLine);
        var lines = data.toString('utf-8').split("\n");
        if (+currentLine > lines.length) {
            return defer.reject(err);
        }
        defer.resolve(lines[+currentLine]);
    });
    return defer.promise;
}

function publishLine() {
    var lineReadPromise = getCurrentLine();
    lineReadPromise.then(function(line) {
        console.log (line);
        var message = {
            topic: constants.publish_topic,
            payload: line,
            qos: 0,
            retain: false
        }
        server.publish(message, function() {
            console.log("published to ", constants.publish_topic);
            currentLine += 1;
            setTimeout(publishLine, 1000);
        });
    });
    lineReadPromise.catch(function(err) {
        console.log(err);
        currentLine = 1;
    });

}
var settings = {
    port: 1883
}
var server = new mosca.Server(settings);
server.on('ready', setup);

function setup() {
    publishLine();
}

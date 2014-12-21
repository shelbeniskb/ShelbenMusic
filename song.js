var Song = require('./models/Song.js');
exports.addSong = function(json, res) {
    Song.save(json, function(err){
        var data;
        if (err) {
            data = {'success' : false, 'error': err};
        } else {
            data = {'success' : true};
        }
        res.writeHead(200, {"Content-Type" : "text/json"});
        res.end(JSON.stringify(data));
    });
}

exports.findSongAll = function(res) {
    Song.findAll(function(err, songs) {
        var data;
        if (err) {
            data = {'success' : false, 'error' : err};
        } else {
            data = {'success' : true, 'songs' : songs};
        }
        res.writeHead(200, {"Content-Type": "text/json"});
        res.end(JSON.stringify(data));
    });
}
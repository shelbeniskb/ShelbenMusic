var Song = require('./models/Song.js');
exports.addSong = function(json, res) {
    Song.save(json, function(err){
        var data;
        if (err) {
            data = {'sucess' : false, 'error': err};
        } else {
            data = {'sucess' : true};
        }
        res.writeHead(200, {"Content-Type" : "text/json"});
        res.end(JSON.stringify(data));
    });
}
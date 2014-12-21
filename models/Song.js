var mongodb = require('./mongodb'),
    Schema = mongodb.mongoose.Schema,
    SongSchema = new Schema({
        number: Number,
        songName: String,
        artistName: String,
        audioUrl: String,
        artistImg: String,
        time: String,
    });

    var Song = mongodb.mongoose.model("Song", SongSchema);
    var SongDAO = function(){};
    SongDAO.prototype.save = function(obj, callback) {
        var findObj = {songName: obj.songName, artistName: obj.artistName};
        Song.find(findObj, function(err, result){
            if (err) {
                callback(err);
            } else {
                if (result.length > 0 ) {
                    callback({'msg': 'this song already exists!', 'errorcode': 1})
                } else {
                    var instance = new Song(obj);
                    instance.save(function(err){
                        callback(err);
                    });
                }
            }
        })
    }

    SongDAO.prototype.findAll = function(callback) {
        Song.find(function(err, songs) {
            callback(err, songs);
        });
    }
    module.exports = new SongDAO();
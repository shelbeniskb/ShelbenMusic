var mongodb = require('./mongodb'),
    Schema = mongodb.mongoose.Schema,
    SongSchema = new Schema({
        name: String,
        singer: String,
        url: String,
        time: String
    });

    var Song = mongodb.mongoose.model("Song", SongSchema);
    var SongDAO = function(){};
    SongDAO.prototype.save = function(obj, callback) {
        var instance = new Song(obj);
        /*console.log('1:' + obj);*/
        instance.save(function(err){
            /*console.log('2:' + obj);*/
            callback(err);
        })
    }
    module.exports = new SongDAO();
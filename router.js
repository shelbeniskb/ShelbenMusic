var fs = require('fs'),
    path = require('path'),
    song = require('./song.js');
route = function(pathname, query, res) {
    if (pathname[0] === '/') { //if pathname is "/index.html", we must change it to 'index.html', so fs.exists() can find it.
        pathname = pathname.substring(1, pathname.length);
    } 
    if (pathname === "") {
        pathname = "index.html";
    }
    //console.log(process.cwd());  The directory current thread works on
    //console.log(__dirname);    The name of the directory that the currently executing script resides in
    fs.exists(pathname, function(exists){
        if (exists) {
            switch(path.extname(pathname)) {
                case ".html":
                    res.writeHead(200, {"Content-Type" : "text/html"});
                    break;
                case ".js":
                    res.writeHead(200, {"Content-Type" : "text/javascript"});
                    break;
                case ".css":
                    res.writeHead(200, {"Content-Type" : "text/css"});
                    break;
                case ".jpg":
                    res.writeHead(200, {"Content-Type" : "image/jpg"});
                    break;
                case ".png":
                    res.writeHead(200, {"Content-Type" : "image/png"});
                    break;
                case ".gif":
                    res.writeHead(200, {"Content-Type" : "text/gif"});
                    break;
                default:
                    res.writeHead(200, {"Content-Type": "application/octet-stream"});   
            }
            fs.readFile(pathname, function (err,data){
                res.end(data);
            });
        }else {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end("<h1>404 Not Found</h1>");      
        }
    });
}
routeForPost = function(pathname, query, res) {
    if (pathname === '/addSong') {
        song.addSong(query, res);
    }

    if (pathname === "/getSongList") {
        song.findSongAll(res);
    }
}

exports.routeForPost = routeForPost;

exports.route = route;
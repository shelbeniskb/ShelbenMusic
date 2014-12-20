var http = require("http"),
    url = require("url"),
    querystring = require("querystring"),
    router = require("./router.js");

http.createServer(function(req, res) {
    var parameter = url.parse(req.url, true),
        method = req.method;
    if (method === "GET") {
        router.route(parameter.pathname, parameter.query, res);
    } else {
        var _postData = '';
        req.on('data', function(chunk){
            _postData += chunk;
        })
        .on('end', function(){
            router.routeForPost(parameter.pathname, querystring.parse(_postData), res)
        });
    }
    
}).listen(8217, '10.197.32.66');
console.log("listen 8217");
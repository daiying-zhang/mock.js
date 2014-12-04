/**
 * @fileOverview
 * @author daiying.zhang
 * Created on 14-6-19
 */
var COLOR_START_RED = '\033[31m',
    COLOR_START_GREEN = '\033[32m',
    COLOR_START_YELLOW = '\033[33m',
    COLOR_START_BLUE = '\033[34m',
    COLOR_START_GRAY = '\033[90m',
    COLOR_END = '\033[39m',
    COLOR_LOG = COLOR_START_GREEN + '[Log] ' + COLOR_END,
    COLOR_ERROR = COLOR_START_RED + '[Error] ' + COLOR_END,
    CONSOLE_PREX = COLOR_START_YELLOW + '[Mocker] ' + COLOR_END;

function getHTML(host, path, cbk) {
    var http = require('http'),
        html = '';
    var options = {
        hostname: host || '',
        port: 80,
        path: path,
        method: 'GET'
    };

    console.log(host + path);

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            html += chunk
        });
        res.on('end', function () {
            console.log('end');
            cbk(html)
        })

    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    //req.write('data\n');
    //req.write('data\n');
    req.end();
}

function getFileInfo(JSON_PATH, url){
    var pathName = url.pathname,
        fileExt = pathName.match(/\.(\w+)/g) || [],
        contentType;

    if(fileExt.length && [".json", ".html", ".htm", ".js", ".css"].indexOf(fileExt[0]) !== -1){
        contentType = getContentType(fileExt[0]);
        fileExt = "";
    }else{
        fileExt = ".json";
        contentType = getContentType("json")
    }

    return {
        filePath: JSON_PATH + url.href.replace(/([^\?]*)(\?.*)/,'$1') + fileExt,
        contentType: contentType
    }
}

function getContentType(fileExt){
    return {
        "json": "application/json;charset=utf-8",
        "html": "text/html",
        "htm": "text/html",
        "js": "application/javascript",
        "css": "text/css"
    }[fileExt.replace(".", "")]
}

exports.startServer = function (port) {
    var http = require('http'),
        fs  = require('fs'),
        url = require('url'),

        JSON_PATH = process.cwd();
        //JSON_FILE_EXT = 'json';

    //var now = new Date();

    //now.setDate(now.getDate() + 60);

    var server = http.createServer(function (req, res) {

        console.log(CONSOLE_PREX + COLOR_START_GREEN + '[url]' + COLOR_END + ' ==> ' + req.url);

        var url = require('url').parse(req.url);
        var fileInfo = getFileInfo(JSON_PATH, url),
            filePath = fileInfo.filePath,
            jsonStr = '';

        fs.exists(filePath, function (exists) {
            if(exists){
                console.log(CONSOLE_PREX + COLOR_LOG + ' geting data from "' + filePath + '" ...');
                /*stream = fs.createReadStream(filePath);
                stream.on('data', function (chunk) {
                    jsonStr += chunk
                });

                stream.on('end', function () {
                    res.writeHead(200,{
                        'Content-type' : 'application/json;charset=utf-8',
                        'Access-Control-Allow-Origin' : '*'
                        //'Content-length' : jsonStr.length,
                        //'Expires' : now.toGMTString()
                    });

                    console.log(CONSOLE_PREX + COLOR_START_GREEN + '[return data]' + COLOR_END + ' ==> \n');
                    console.log(COLOR_START_GRAY + jsonStr.replace(/(.*)/g,'    $1') + COLOR_END);
                    console.log('');

                    res.write(jsonStr);
                    res.end();
                })*/


                var stat = fs.statSync(filePath);

                res.writeHead(200, {
                    'Content-Type': fileInfo.contentType || 'application/json;charset=utf-8',
                    'Content-Length': stat.size,
                    'Access-Control-Allow-Origin' : '*'
                });

                var readStream = fs.createReadStream(filePath);
                // We replaced all the event handlers with a simple call to readStream.pipe()
                readStream.pipe(res);
            }else{
                console.log(CONSOLE_PREX + COLOR_ERROR + filePath + '" not found.');
                /*getHTML(req.headers.host, req.url, function (data) {
                    res.writeHead(200,{
                        'Content-type' : 'text/html',
                        'Content-length' : data.length
                    });
                    res.write(data);
                    res.end();
                })*/
                data = {
                    status : 1,
                    errmsg : "404"
                };
                res.writeHead(200,{
                    'Content-type' : 'application/json;charset=utf-8',
                    'Access-Control-Allow-Origin' : '*'
                    //,'Content-length' : JSON.stringify(data).length,
                    //'Expires' : now.toGMTString()
                });
                res.write(JSON.stringify(data));
                res.end();
            }
        })
    });

    server.listen(port || 10010);

    console.log(CONSOLE_PREX + COLOR_LOG + 'Mocker start listening on port ' + (port || 10010) + ' ...');
    console.log(CONSOLE_PREX + COLOR_LOG + 'The root path : ' + process.cwd());
    console.log(CONSOLE_PREX + COLOR_LOG + 'Press Ctrl + C to stop server. ');
};

exports.help = function(){
    console.log('========================= Help =========================');
    console.log('To start mock:');
    console.log('   $ cd your/mock/data/root/path');
    console.log('   $ mock [-p 10010]');
    console.log('');
    console.log('How to make mock data:');
    console.log('If you have a url that want to be mocked like : ');
    console.log('   http://youdomain.com/api/user/userlist.do');
    console.log('You can do like this:');
    console.log('   1. Make the dir ~/api/user/');
    console.log('   2. Make file that named userlist.do.json');
    console.log('   3. Exec the "mock" command on ~/');
    console.log('');
}

exports.version = function(){
    console.log('mock @ 0.2.0');
}
/**
 * @fileOverview
 * @author daiying.zhang
 * Created on 14-6-20
 */

exports.run = function () {
    var mock = require('./modules/mock');

    //var args = params.getParams(process.argv);

    var args = require('optimist').argv;
    var cmd = args._[0];
    var port = args.p || args.port;

    console.log('cmd', cmd, JSON.stringify(args));
    //console.log(Object.keys(mock))
    //console.log(require('./config.js').color.COLOR_START_RED);

    if(cmd in mock){
    	mock[cmd](args)
    }else{
    	mock.startServer(port);
    }
};

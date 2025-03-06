var liveServer = require("live-server");
var params = {
    port: 8181,
    host: "localhost",
    open: true,
    file: "index.html", 
    wait: 1000,
    logLevel: 2,  
    proxy: [['/api','http://localhost:8080/api/']]
};
liveServer.start(params);
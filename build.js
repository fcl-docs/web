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

// 构建脚本
const fs = require('fs');
const path = require('path');

// 空构建脚本，确保构建过程不会失败
console.log('静态网站无需构建步骤');
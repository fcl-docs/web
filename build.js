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

// 确保依赖已安装
console.log('正在安装依赖...');
try {
  require('child_process').execSync('npm install', { stdio: 'inherit' });
  console.log('依赖安装成功');
} catch (error) {
  console.error('依赖安装失败:', error);
  process.exit(1);
}

// 其他构建步骤...
console.log('构建完成');
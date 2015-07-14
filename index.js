var fs = require('fs');

var distPath = './dist/Promise.js';
if (fs.existsSync(distPath)) {
    module.exports = require(distPath).Promise;
} else {
    module.exports = require('./src/Promise').Promise;
}
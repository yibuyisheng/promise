try {
    module.exports = require('./dist/Promise').Promise;
} catch (e) {
    module.exports = require('./src/Promise').Promise;
}
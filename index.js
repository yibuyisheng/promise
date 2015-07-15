try {
    module.exports = require('./dist/Promise');
} catch (e) {
    module.exports = require('./src/Promise');
}
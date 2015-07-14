'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = (function () {
    function Promise(fn) {
        _classCallCheck(this, Promise);

        this.state = 'pending';
        this.fulfilledReactions = [];
        this.rejectedReactions = [];

        isFunction(fn) && fn(resolve(this), reject(this));
    }

    _createClass(Promise, [{
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            var nextPromise = new Promise();

            if (this.state === 'pending') {
                this.fulfilledReactions.push(fulfilledTask.bind(this));
                this.rejectedReactions.push(rejectedTask.bind(this));
            } else if (this.state === 'resolved') {
                executeTask(fulfilledTask.bind(this));
            } else if (this.state === 'rejected') {
                executeTask(rejectedTask.bind(this));
            }

            return nextPromise;

            function fulfilledTask() {
                try {
                    var result = isFunction(onFulfilled) ? onFulfilled(this.result) : this.result;

                    if (isThenable(result)) {
                        result.then(resolve(nextPromise), reject(nextPromise));
                    } else {
                        resolve(nextPromise)(result);
                    }
                } catch (error) {
                    reject(nextPromise)(error);
                }
            }

            function rejectedTask() {
                try {
                    var result = isFunction(onRejected) ? onRejected(this.result) : this.result;

                    if (isThenable(result)) {
                        result.then(resolve(nextPromise), reject(nextPromise));
                    } else {
                        resolve(nextPromise)(result);
                    }
                } catch (error) {
                    reject(nextPromise)(error);
                }
            }
        }
    }], [{
        key: 'resolve',
        value: function resolve(value) {
            if (isThenable(value)) {
                return value;
            }

            return new Promise(function (resolve) {
                resolve(value);
            });
        }
    }, {
        key: 'reject',
        value: function reject(value) {
            if (isThenable(value)) {
                return value;
            }

            return new Promise(function (reject) {
                reject(value);
            });
        }
    }, {
        key: 'all',
        value: function all(iterable) {
            return new Promise(function (resolve, reject) {
                var results = [];
                var totalCount = 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = iterable[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var value = _step.value;

                        Promise.resolve(value).then((function (index, result) {
                            results[index] = result;
                            if (results.length === totalCount) {
                                resolve(results);
                            }
                        }).bind(null, totalCount), reject);
                        totalCount++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            });
        }
    }, {
        key: 'race',
        value: function race(iterable) {
            return new Promise(function (resolve, reject) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = iterable[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var value = _step2.value;

                        Promise.resolve(value).then(resolve, reject);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                            _iterator2['return']();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            });
        }
    }]);

    return Promise;
})();

exports.Promise = Promise;

function isThenable(obj) {
    return obj && isFunction(obj.then);
}

function resolve(promise) {
    return function (value) {
        if (promise.state !== 'pending') {
            return;
        }

        promise.state = 'resolved';
        promise.result = value;
        promise.fulfilledReactions.map(executeTask);
    };
}

function reject(promise) {
    return function (value) {
        if (promise.state !== 'pending') {
            return;
        }

        promise.state = 'rejected';
        promise.result = value;
        promise.rejectedReactions.map(executeTask);
    };
}

function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

function executeTask(taskFn) {
    setTimeout(taskFn);
}

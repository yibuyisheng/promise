function Promise(fn) {
    this._state = 'pending';
    if (fn instanceof Function) {
        try {
            fn((function(promise) {
                return function(obj) {
                    _resolve(promise, obj);
                };
            })(this), (function(promise) {
                return function(obj) {
                    _reject(promise, obj);
                };
            })(this));
        } catch (error) {
            _reject(this, error);
        }
    }
}

Promise.reject = function(reason) {
    return new Promise(function(resolve, reject) {
        reject(reason);
    });
};

Promise.resolve = function(value) {
    return new Promise(function(resolve, reject) {
        resolve(value);
    });
};

Promise.all = function() {
    var args = arguments;
    if (!args.length) {
        return Promise.resolve();
    }

    var promises;
    if (args[0] instanceof Array) {
        promises = args[0];
    } else {
        promises = arguments;
    }

    return new Promise(function(resolve, reject) {
        var results = [];
        for (var i = 0, il = promises.length; i < il; i++) {
            var promise = promises[i];

            if (!(promise instanceof Promise)) {
                promise = Promise.resolve(promise);
            }

            promise
                .then((function(index, promise) {
                    return function(data) {
                        results[index] = data;
                        promise._isDone = true;

                        if (checkDone()) {
                            resolve(results);
                        }
                    };
                })(i, promise))
                .catch(function(error) {
                    reject(error);
                });
        }
    });

    function checkDone() {
        for (var i = 0, il = promises.length; i < il; i++) {
            var promise = promises[i];
            if (!promise._isDone) {
                return false;
            }
        }

        return true;
    }
};

Promise.prototype.then = function(onFullFilled, onRejected) {
    this._onFullFilled = onFullFilled;
    this._onRejected = onRejected;

    this._next = new Promise();
    return this._next;
};

Promise.prototype.catch = function (onRejected) {
    this._onRejected = onRejected;
    this._next = new Promise();
    return this._next;
};

// 到下一个 promise
function _toNext(promise) {
    if (!promise || !(promise._next instanceof Promise)) {
        return;
    }

    if (promise._state === 'resolved') {
        _resolve(promise._next, promise._result);
    } else if (promise._state === 'rejected') {
        _reject(promise._next, promise._result);
    }
}

function _resolve(promise, obj) {
    _nextTick(function (promise, obj) {
        try {
            if (promise._onFullFilled instanceof Function) {
                promise._result = promise._onFullFilled(obj);
            } else {
                promise._result = obj;
            }
            promise._state = 'resolved';

            _toNext(promise);
        } catch (error) {
            promise._state = 'rejected';
            promise._result = error;
        }
    }, [promise, obj]);

}

function _reject(promise, obj) {
    _nextTick(function (promise, obj) {
        try {
            if (promise._onRejected instanceof Function) {
                promise._result = promise._onRejected(obj);
                promise._state = 'resolved';
            } else {
                promise._result = obj;
                promise._state = 'rejected';
            }

            _toNext(promise);
        } catch (error) {
            promise._state = 'rejected';
            promise._result = error;
        }
    }, [promise, obj]);
}

function _nextTick(fn, args) {
    setTimeout((function (args) {
        return function () {
            fn.apply(null, args);
        };
    })(args), 0);
}

module.exports = Promise;
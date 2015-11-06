'use strict';

class Promise {
    constructor(fn) {
        this.state = 'pending';
        this.fulfilledReactions = [];
        this.rejectedReactions = [];
        this.notifyReactions = [];

        isFunction(fn) && fn(resolve(this), reject(this), notify(this));
    }

    then(onFulfilled, onRejected, onNotify) {
        let nextPromise = new Promise();

        if (this.state === 'pending') {
            this.fulfilledReactions.push(fulfilledTask.bind(this)());
            this.rejectedReactions.push(rejectedTask.bind(this)());
            this.notifyReactions.push(notifyTask.bind(this)());
        } else if (this.state === 'resolved') {
            executeTask(fulfilledTask.bind(this)());
        } else if (this.state === 'rejected') {
            executeTask(rejectedTask.bind(this)());
        }

        return nextPromise;

        function notifyTask() {
            if (isFunction(onNotify)) {
                return () => {
                    onNotify(this.result);
                };
            }

            return function () {};
        }

        function fulfilledTask() {
            return isFunction(onFulfilled)
                ? task.bind(this, (result) => onFulfilled(result))
                : task.bind(this, (result) => result);

            function task(getResultFn) {
                try {
                    let result = getResultFn(this.result);
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

        function rejectedTask() {
            return isFunction(onRejected)
                ? task.bind(this, (result) => onRejected(result), resolve)
                : task.bind(this, (result) => result, reject);

            function task(getResultFn, nextFun) {
                try {
                    let result = getResultFn(this.result);

                    if (isThenable(result)) {
                        result.then(resolve(nextPromise), reject(nextPromise));
                    } else {
                        nextFun(nextPromise)(result);
                    }
                } catch (error) {
                    reject(nextPromise)(error);
                }
            }
        }
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    static resolve(value) {
        if (isThenable(value)) {
            return value;
        }

        return new Promise(function (resolve) {
            resolve(value);
        });
    }

    static reject(value) {
        if (isThenable(value)) {
            return value;
        }

        return new Promise(function (reject) {
            reject(value);
        });
    }

    static all(iterable) {
        return new Promise(function (resolve, reject) {
            let results = [];
            let totalCount = 0;
            for (let value of iterable) {
                Promise.resolve(value).then((function (index, result) {
                    results[index] = result;
                    if (results.length === totalCount) {
                        resolve(results);
                    }
                }).bind(null, totalCount), reject);
                totalCount++;
            }
        });
    }

    static race(iterable) {
        return new Promise(function (resolve, reject) {
            for (let value of iterable) {
                Promise.resolve(value).then(resolve, reject);
            }
        });
    }
}

function isThenable(obj) {
    return obj && isFunction(obj.then);
}

function resolve(promise) {
    return function (value) {
        if (isSettled(promise)) {
            return;
        }

        promise.state = 'resolved';
        promise.result = value;
        promise.fulfilledReactions.map(executeTask);
    };
}

function reject(promise) {
    return function (value) {
        if (isSettled(promise)) {
            return;
        }

        promise.state = 'rejected';
        promise.result = value;
        promise.rejectedReactions.map(executeTask);
    };
}

function notify(promise) {
    return function (value) {
        if (isSettled(promise)) {
            return;
        }

        promise.result = value;
        promise.notifyReactions.map(executeTask);
    };
}

function isSettled(promise) {
    return promise.state !== 'pending';
}

function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

function executeTask(taskFn) {
    setTimeout(taskFn);
}

module.exports = Promise;

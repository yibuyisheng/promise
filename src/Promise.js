export class Promise {
    constructor(fn) {
        this.state = 'pending';
        this.fulfilledReactions = [];
        this.rejectedReactions = [];

        isFunction(fn) && fn(resolve(this), reject(this));
    }

    then(onFulfilled, onRejected) {
        let nextPromise = new Promise();

        if (this.state === 'pending') {
            this.fulfilledReactions.push(fulfilledTask.bind(this)());
            this.rejectedReactions.push(rejectedTask.bind(this)());
        } else if (this.state === 'resolved') {
            executeTask(fulfilledTask.bind(this)());
        } else if (this.state === 'rejected') {
            executeTask(rejectedTask.bind(this)());
        }

        return nextPromise;

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


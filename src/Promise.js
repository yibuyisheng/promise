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
                let result = isFunction(onFulfilled)
                    ? onFulfilled(this.result)
                    : this.result;

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
                let result = isFunction(onRejected)
                    ? onRejected(this.result)
                    : this.result;

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


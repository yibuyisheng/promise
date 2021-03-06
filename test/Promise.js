var Promise = require('../index');

describe('Promise 测试', function () {
    it('单个 Promise resolved', function (done) {
        this.timeout(0);

        new Promise(function (resolve) {
            setTimeout(function () {
                resolve('resolved');
            }, 1000);
        }).then(function (result) {
            shouldEqual(result === 'resolved', done, done);
        });
    });

    it('单个 Promise rejected', function (done) {
        this.timeout(0);

        new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject('rejected');
            }, 1000);
        }).then(null, function (result) {
            shouldEqual(result === 'rejected', done, done);
        });
    });

    it('Promise 变成稳定状态之后，再调用 then', function (done) {
        this.timeout(0);

        new Promise(function (resolve) {
            resolve('resolved');
        }).then(function (result) {
            shouldEqual(result === 'resolved', done, done);
        });
    });

    it('Promise 链式调用，回调方法返回非 thenable 值', function (done) {
        this.timeout(0);

        new Promise(function (resolve, reject) {
            resolve(1);
        }).then(function (result) {
            shouldEqual(result === 1);
            return 2;
        }).then(function (result) {
            shouldEqual(result === 2);
            throw new Error('3');
        }).then(null, function (error) {
            shouldEqual(error.message === '3');
            return 4;
        }).then(function (result) {
            shouldEqual(result === 4, done, done);
        }, done);
    });

    it('Promise 链式调用，回调方法返回 thenable 值', function (done) {
        this.timeout(0);

        new Promise(function (resolve, reject) {
            resolve(1);
        }).then(function (result) {
            shouldEqual(result === 1);
            return new Promise(function (resolve, reject) {
                resolve(2);
            });
        }).then(function (result) {
            shouldEqual(result === 2);
            return new Promise(function (resolve, reject) {
                reject(3);
            });
        }).then(null, function (result) {
            shouldEqual(result === 3, done, done);
        });
    });

    it('Promise 的静态方法 resolve ，传入非 thenable 参数', function (done) {
        this.timeout(0);

        Promise.resolve(1).then(function (result) {
            shouldEqual(result === 1, done, done);
        }, done);
    });

    it('Promise 的静态方法 resolve ，传入 thenable 参数', function (done) {
        this.timeout(0);

        var promise = new Promise(function (resolve, reject) {
            resolve(1);
        });
        Promise.resolve(promise).then(function (result) {
            shouldEqual(result === 1, done, done);
        }, done);
    });

    it('Promise 只能有一次变为稳定的过程', function (done) {
        this.timeout(0);

        new Promise(function (resolve, reject) {
            resolve(1);
            reject(2);
        }).then(function (result) {
            shouldEqual(result === 1, null, done);
        }, function (result) {
            done(new Error('Promise 只能有一次变为稳定的过程'));
        }).then(done);
    });

    it('Promise 的静态方法 all', function (done) {
        this.timeout(0);

        var promise = new Promise(function (resolve, reject) {
            resolve(1);
        });
        Promise.all([promise, 2, 3]).then(function (results) {
            shouldEqual(results.length === 3, null, done);
            shouldEqual(results[0] === 1, null, done);
            shouldEqual(results[1] === 2, null, done);
            shouldEqual(results[2] === 3, null, done);
            done();
        });
    });

    it('Promise 的静态方法 all ，异常', function (done) {
        this.timeout(0);

        var promise = new Promise(function (resolve, reject) {
            reject(1);
        });
        Promise.all([promise, 2, 3]).then(function (results) {
            done(new Error('错误执行路径'));
        }, function (result) {
            shouldEqual(result === 1, done, done);
        });
    });

    it('Promise 的静态方法 race', function (done) {
        this.timeout(0);

        var promise1 = new Promise(function (resolve) {
            setTimeout(function () {
                resolve(1);
            }, 1000);
        });
        var promise2 = new Promise(function (resolve) {
            resolve(2);
        });
        Promise.race([promise1, promise2]).then(function (result) {
            shouldEqual(result === 2, done, done);
        });
    });

    it('Promise catch 方法', function (done) {
        this.timeout(0);

        new Promise(function (resolve, reject) {
            reject(1);
        }).then(function () {
            done(new Error('错误执行流程'));
        }).catch(function (result) {
            shouldEqual(result === 1, done, done);
        });
    });

    it('Promise notify', function (done) {
        this.timeout(0);

        var arr = [];
        new Promise(function (resolve, reject, notify) {
            setTimeout(function () {
                notify(1);
            }, 5);
            setTimeout(function () {
                notify(2);
            }, 10);
            setTimeout(function () {
                notify(3);
            }, 20);
            setTimeout(function () {
                resolve(4);
            }, 30);
        }).then(function (result) {
            shouldEqual(result === 4, null, done);
            shouldEqual(arr.length === 3, null, done);
            shouldEqual(arr[0] === 1, null, done);
            shouldEqual(arr[1] === 2, null, done);
            shouldEqual(arr[2] === 3, done, done);
        }, null, function (result) {
            arr.push(result);
        });
    });

    it.only('Promise 链式调用，异常会被第一个 catch 捕获住', function (done) {
        new Promise(function (resolve, reject) {
            throw new Error('error');
        }).then(function () {
            done(new Error('不应该进入这个分支'));
        }).catch(function (error) {
            shouldEqual(error.message === 'error', done);
        }).then(function () {
            done();
        }).catch(function () {
            done(new Error('不应该进入这个分支'));
        });
    });

    function shouldEqual(statement, success, fail) {
        if (statement) {
            success && success();
        }
        else {
            var error = new Error('两个值不相等');
            if (fail) {
                fail(error);
            }
            else {
                throw error;
            }
        }
    }
});

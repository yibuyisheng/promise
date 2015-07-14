# Promise

Recreate a Promise library.

# How to use

If your current environment don't support ES6's `let` or arrow function or class, use the babel to compile the source code.
But before Compiling, you must ensure that you have installed `babel` :

```
npm install -g babel
```

After babel installing, run the following command:

```
npm build
```

Ok, we completed the building process. So in your code just use the `Promise` like this:

```js
var Promise = require('promise');
new Promise(function (resolve, reject) {
  ...
}).then(...);
```

# run the test code

npm test

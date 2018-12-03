const chalk = require('chalk');
const log = require('./executor');
const { format } = require('./formatter');

module.exports = (() => {
  const methods = {
    GET: [chalk.bold.green, chalk.green],
    POST: [chalk.bold.red, chalk.red],
    PUT: [chalk.bold.yellow, chalk.yellow],
    PATCH: [chalk.bold.blue, chalk.blue],
    DELETE: [chalk.bold.cyan, chalk.cyan],
    HEAD: [chalk.bold],
    OPTIONS: [chalk.bold],
  };

  const methodNames = Object.keys(methods);
  const longestMethodName = methodNames.reduce((acc, name) => acc.length > name.length ? acc : name, '');
  const methodLogFormatters = methodNames.reduce((acc, name) => ({
      ...acc,
      [name]: text => format(name.padEnd(longestMethodName.length, ' '), text)(...methods[name]),
    }), {});

  return request => {
    if (!methods.hasOwnProperty(request.method)) {
      throw new Error(`invalid method: ${request.method}`);
    }
    const colored = methodLogFormatters[request.method](request.url);
    log(colored);
  };
})();

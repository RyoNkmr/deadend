const chalk = require('chalk');
const exec = require('./executor');
const { format } = require('./formatter');

const debug =  text => format('', text)();
const log =  text => format(' i ', text)(chalk.bold.bgBlue);
const warn = text => format(' ! ', text)(chalk.bold.bgYellow.black, chalk.yellow);
const error = text => format(' ! ', text)(chalk.bold.bgRed, chalk.red.bold);
const alert = error;

const colorizr = {
  debug,
  log,
  warn,
  error,
  alert,
};

module.exports = (method = 'notice') => {
  const loggerMethod = colorizr.hasOwnProperty(method) ? method : 'log';
  return text => {
    const colored = colorizr[loggerMethod](text);
    exec(colored, text);
  };
};

const logger = require('./logger');
const requestLogger = require('./requestLogger');

module.exports = new Proxy(logger, {
  get(target, method) {
    if (method === 'request') {
      return requestLogger;
    }
    return target(method);
  },
});


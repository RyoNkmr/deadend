const chalk = require('chalk');

const align = (text, icon, margin = 1) => {
  const marginString = ' '.repeat(margin);
  const cleaned = (/(?:\s*)(^\s.*\S[^]*)(?:[\r\n]^\s*)/gm.exec(text) || [, text])[1];
  const trimmed = cleaned.trimEnd();

  const firstLineIndentSize = /\S/.exec(trimmed).index;
  const alignLineRegExp = new RegExp(`\\s{0,${firstLineIndentSize}}(.*)`);
  const iconIndent = ' '.repeat(icon.length + Number(!!icon));
  const lines = cleaned.split(/[\r\n]/);
  if (lines.length < 2) {
    return [lines[0].trimStart(), icon, marginString];
  }

  const formatted = lines
    .map(chunk => alignLineRegExp.exec(chunk)[1])
    .reduce((acc, chunk) => `${acc}
${iconIndent}${chunk}
`);

  return [formatted, icon, marginString]
}

const identity = value => value;
const format = (icon, text) => (iconCallback = identity, textCallback = identity) => {
  const [_text, _icon, space] = align(text, icon, Number(!!icon));
  return `${iconCallback(_icon)}${space}${textCallback(_text)}`;
}

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

const _logger = (method = 'notice') => {
  const loggerMethod = colorizr.hasOwnProperty(method) ? method : 'log';
  return text => {
    const colored = colorizr[loggerMethod](text);
    console.log(colored);
  };
};

module.exports = new Proxy(_logger, {
  get(target, method) {
    return target(method);
  },
});


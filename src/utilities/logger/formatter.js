const CHAR_WHITESPACE = ' ';

const align = (text = '', icon = '', margin = 1) => {
  const marginString = CHAR_WHITESPACE.repeat(margin);
  const cleaned = (/(?:\s*)(^\s.*\S[^]*)(?:[\r\n]^\s*)/gm.exec(text) || [, text])[1];
  const lines = cleaned.split(/[\r\n]/);

  if (lines.length < 2) {
    return [lines[0].trimStart(), icon, marginString];
  }

  const iconIndent = CHAR_WHITESPACE.repeat(icon.length + (Number(!!icon) * margin));
  const firstLineIndentSize = /\S/.exec(cleaned.trimEnd()).index;
  const alignLineRegExp = new RegExp(`\\s{0,${firstLineIndentSize}}(.*)`);
  const formatted = lines
    .map(chunk => alignLineRegExp.exec(chunk)[1])
    .reduce((acc, chunk) => `${acc}
${iconIndent}${chunk}`);

  return [formatted, icon, marginString]
}

const identity = value => value;
const format = (icon, text) => (iconCallback = identity, textCallback = identity) => {
  const [_text, _icon, space] = align(text, icon, Number(!!icon));
  return `${iconCallback(_icon)}${space}${textCallback(_text)}`;
}

module.exports = {
  format,
  align,
};

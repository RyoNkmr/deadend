const crypto = require('crypto');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const parser = {
  json: dataString => {
    const parsed = JSON.parse(dataString);
    return () => parsed;
  },
  js: dataString => {
    const parsed = eval(dataString);
    return typeof parsed === 'function' ? parsed() : parsed;
  },
};

const supportedFileTypes = new Set(Object.keys(parser));

class FileLoader {
  constructor() {
    this.store = {};
  }

  async parse(path, filetype, dataString) {
    const cache = this.store[path];
    const hash = crypto.createHash('sha1').update(dataString).digest('hex');

    if (cache === undefined || cache.hash !== hash) {
      this.store[path] = {
        getter: parser[filetype](dataString),
        hash,
      };
    }

    return this.store[path].getter;
  }

  async load(path) {
    const extension = (/\.(\w+)$/.exec(path) || [])[1];

    if (!extension) {
      throw new Error(`Invalid path: ${path}`);
    }

    if (!supportedFileTypes.has(extension)) {
      throw new TypeError(`.${extension} file is not supported`);
    }

    const dataString = await readFile(path, 'utf8');
    return this.parse(path, extension, dataString);
  }
}

module.exports = new FileLoader();

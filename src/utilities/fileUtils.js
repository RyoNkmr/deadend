const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const isdir = _path => stat(_path).then(stat => stat.isDirectory());


const classifyPaths = async paths => Promise.all(paths.map(_path => isdir(_path)))
  .then(results => results.reduce((accumulator, isDir, index) => {
    const type = isDir ? 'directory' : 'files';
    return {
      ...accumulator,
      [type]: [...accumulator[type], paths[index]],
    }
  }, { directory: [], files: [] }));

const classifyDir = async dir => {
  const list = await readdir(dir);
  return classifyPaths(list.map(item => path.resolve(dir, item)));
}

const readdirRecursive = async dir => {
  const scanned = await classifyDir(dir);

  while (scanned.directory.length > 0) {
    const pandingJobs = Promise.all(
      scanned.directory.map(dir => (
        classifyDir(dir).then(({ directory, files }) => {
          scanned.directory = [...scanned.directory, ...directory];
          scanned.files = [...scanned.files, ...files];
        })
      ))
    );
    scanned.directory = [];
    await pandingJobs;
  }

  return scanned.files.filter(testAllowedExtension);
};

const testAllowedExtension = _path => (/\.(js(on)?)$/.exec(_path) || [])[1];
const classifyAllowedExtentions = fileList => fileList.reduce((accumulator, filePath) => {
  const extension = testAllowedExtension(filePath);
  if (!extension) {
    return accumulator;
  }
  return {
    ...accumulator,
    [extension]: [ ...accumulator[extension], filePath],
  };
}, { js: [], json: [] })

module.exports = {
  readdirRecursive,
  classifyAllowedExtentions,
};

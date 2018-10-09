const express = require('express');
const router = express.Router();

const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
// const stat = promisify(fs.stat);
// const isdir = _path => stat(_path).then(stat => stat.isDirectory());
// const isfile = _path => stat(_path).then(stat => stat.isFile());

// const allowedFileType = ['json', 'js'];
const WILDCARD = 'any';

const requestMatcher = (req, fileList, targetName = `index`) => {
  if (!fileList || fileList.length === 0) {
    return null
  }
  const { method } = req;
  const pattern = new RegExp(`^${targetName}\\.${method.toLowerCase()}\\.(js(?:on))?$`);

  for (const file of fileList) {
    const matched = pattern.exec(file);
    if (matched) {
      return matched;
    }
  }
  return null;
}


const isIntegerString = string => /^\d+$/.test(string);

const generatePathCandidates = url => 
  url.split('/')
    .reduce((accumulator, segment) => {
      const isInteger = isIntegerString(segment);

      if (accumulator.length === 0) {
        return isInteger ? [segment, WILDCARD] : [segment];
      }

      if (!isInteger) {
        return accumulator.map(candidate => `${candidate}/${segment}`);
      }

      return accumulator.reduce((flatten, candidate) => ([
        ...flatten,
        ...[segment, WILDCARD].map(tail => `${candidate}/${tail}`),
      ]), []);
    }, []);

const createMatchResult = (parentPath, match) => match && ({
  extension: match[1],
  filename: match[0],
  fullpath: path.join(parentPath, match[0]),
});

const createApiRequestHandler = sourceDirPath => {
  const _search = async (req, requestPath = req.url) => {
    const base = path.join(sourceDirPath, requestPath);
    const fileList = await readdir(base).catch(error => {
      if (error.code === 'ENOENT') {
        return [];
      }
    });

    const matched = requestMatcher(req, fileList);

    if (matched !== null) {
      return createMatchResult(base, matched);
    }

    const parentOfBase = path.join(base, '..');
    const fileListOnRoot = await readdir(parentOfBase).catch(error => {
      if (error.code === 'ENOENT') {
        return [];
      }
    });

    const filename = requestPath.replace(/^\/.*\/(\d+)$/, '_$1');
    const fileMatched = requestMatcher(req, fileListOnRoot, filename);

    if (fileMatched === null && requestPath !== filename) {
      const wildCardMatch = requestMatcher(req, fileListOnRoot, WILDCARD);
      return createMatchResult(parentOfBase, wildCardMatch);
    }

    return createMatchResult(parentOfBase, fileMatched);
  }

  const search = async req => {
    const pathCandidates = generatePathCandidates(req.url);
    for (const candidate of pathCandidates) {
      const match = await _search(req, candidate);
      if (match) {
        return match;
      }
    }
    return null;
  }

  return async (req, res) => {
    const { url } = req;

    try {
      const matched = await search(req);

      if (matched === null) {
        res.sendStatus(404);
        return;
      }

      const { filename, extension, fullpath } = matched;

      console.log({ ...matched, url });
      const data = await readFile(fullpath);
      if (extension === 'json') {
        return JSON.parse(data);
      }
      return data;

    } catch(error) {
      console.error(error);
      if (error.code === 'ENOENT') {
        res.sendStatus(404);
        return;
      }
    }
  };
}

const handleOption = res => {
  res.sendStatus(200);
};

const createApi = sourceDirPath => {
  console.error(`sourceDir: ${sourceDirPath}`);

  if (!sourceDirPath) {
    throw new Error('sourceDirPath is required');
  }

  const handleApiRequest = createApiRequestHandler(sourceDirPath);

  return router.all('*', async (req, res, next) => {
    try {
      if (req.method === 'options') {
        handleOption(res);
      }
      const requestFilePath = await handleApiRequest(req, res);
      // const data = await readFile(requestFilePath);
      res.json(requestFilePath);
    } catch(error) {
      console.error(error);
      res.status(500).send(error);
    }
  });
};

module.exports = createApi;

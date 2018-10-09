#!/usr/bin/env node

const app = require('express')();
const createApi = require('./api');

const path = require('path');

const {
  readdirRecursive,
  classifyAllowedExtentions,
} = require('./fileUtils');

const main = async argv => {
  const { apiDefinitionsDirectory } = argv;
  const fileList = await readdirRecursive(apiDefinitionsDirectory);
  const classifiedList = classifyAllowedExtentions(fileList);
  // console.log(classifiedList);

  app.use(createApi(apiDefinitionsDirectory));
  app.listen(8888);
}

require('yargs')
  .command({
    command: '$0 [apiDefinitionsDirectory]',
    description: 'run mock server',
    builder: yargs => yargs
      .default('apiDefinitionsDirectory', '_contents'),
    handler: argv => {
      const apiDefinitionsDirectory = path.resolve(process.cwd(), argv.apiDefinitionsDirectory);
      main({ ...argv, apiDefinitionsDirectory });
    },
  })
  .argv;

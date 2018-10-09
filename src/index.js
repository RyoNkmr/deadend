#!/usr/bin/env node

const path = require('path');
const {
  readdirRecursive,
  classifyAllowedExtentions,
} = require('./fileUtils');

const main = async argv => {
  const { apiDefinitionsDirectory } = argv;
  const fileList = await readdirRecursive(apiDefinitionsDirectory);
  const classifiedList = classifyAllowedExtentions(fileList);
  console.log(classifiedList);
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

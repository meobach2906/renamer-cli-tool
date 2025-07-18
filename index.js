#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const _fs = require('./utils/_fs.utils');

const program = new Command();

const ROOT = path.resolve(process.cwd());

program
  .name('renamer')
  .version('1.0.0')
  .description('My renamer CLI tool')
  .requiredOption('-s, --source <source>')
  .requiredOption('-t, --target <target>')
  .option('-i, --ignore <ignore>')
  .option('-v, --verbose')
  .action(async () => {
    try {
      const { source, target, verbose = false, ignore = '' } = program.opts();
      const list_ignore = ignore.split(',');
  
      await _fs.rename({ directory: ROOT, source, target, verbose, list_ignore: [..._fs._CONST.LIST_IGNORE, ...list_ignore] })
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  })

program.parse()
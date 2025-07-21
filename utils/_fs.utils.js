const path = require('path');
const fse = require('fs-extra');
const _to = require('./_to.utils');
const pluralize = require('pluralize');

module.exports = (() => {
  const _fs = {};

  _fs._CONST = [];

  _fs._CONST.LIST_IGNORE = [
    '.git',
    'node_modules'
  ];

  _fs.read_dir = async ({ directory, list_ignore = _fs._CONST.LIST_IGNORE }) => {

    const result = {
      entries: []
    };

    const directory_tokens = directory.split('/');

    const folder = directory_tokens.pop();
    if (list_ignore.includes(folder)) {
      return result;
    }

    const parent_directory = directory_tokens.join('/');

    result.entries.push({
      name: folder,
      directory: parent_directory,
      path: directory,
      stats: {
        is_file: false,
        is_directory: true,
      },
    });

    const entries = await fse.readdir(directory);

    for (const entry_name of entries) {
      if (list_ignore.includes(entry_name)) {
        continue;
      }

      const entry_path = path.join(directory, entry_name);

      const stats = await fse.stat(entry_path);

      if (stats.isFile()) {
        result.entries.push({
          name: entry_name,
          directory: directory,
          path: path.join(directory, entry_name),
          stats: {
            is_file: true,
            is_directory: false,
          },
        });
      }

      if (stats.isDirectory()) {
        const { entries } = await _fs.read_dir({ directory: entry_path });

        result.entries.push(...entries);
      }
    }

    return result;
  };

  _fs.rename = async ({ directory, source, target, verbose = false, list_ignore = _fs._CONST.LIST_IGNORE }) => {
    const normalized_source = _to.normalize({ str: source });
    const normalized_target = _to.normalize({ str: target });

    const renamer_mapping = {
      [pluralize(source)]: [pluralize(target)],
      [pluralize(source.toUpperCase())]: pluralize(target.toUpperCase()),
      [pluralize(normalized_source)]: pluralize(normalized_target),
      [pluralize(normalized_source.toUpperCase())]: pluralize(normalized_target.toUpperCase()),
      [pluralize(_to.camel_case({ str: normalized_source }))]: pluralize( _to.camel_case({ str: normalized_target })),
      [pluralize(_to.pascal_case({ str: normalized_source }))]: pluralize( _to.pascal_case({ str: normalized_target })),
      [pluralize(_to.kebab_case({ str: normalized_source }))]: pluralize( _to.kebab_case({ str: normalized_target })),
      [pluralize(_to.upper_kebab_case({ str: normalized_source }))]: pluralize( _to.upper_kebab_case({ str: normalized_target })),
      [pluralize(_to.snake_case({ str: normalized_source }))]: pluralize( _to.snake_case({ str: normalized_target })),
      [pluralize(_to.screaming_snake_case({ str: normalized_source }))]: pluralize( _to.screaming_snake_case({ str: normalized_target })),
      [source]: target,
      [source.toUpperCase()]: target.toUpperCase(),
      [normalized_source]: normalized_target,
      [normalized_source.toUpperCase()]: normalized_target.toUpperCase(),
      [_to.camel_case({ str: normalized_source })]:  _to.camel_case({ str: normalized_target }),
      [_to.pascal_case({ str: normalized_source })]:  _to.pascal_case({ str: normalized_target }),
      [_to.kebab_case({ str: normalized_source })]:  _to.kebab_case({ str: normalized_target }),
      [_to.upper_kebab_case({ str: normalized_source })]:  _to.upper_kebab_case({ str: normalized_target }),
      [_to.snake_case({ str: normalized_source })]:  _to.snake_case({ str: normalized_target }),
      [_to.screaming_snake_case({ str: normalized_source })]:  _to.screaming_snake_case({ str: normalized_target }),
    };

    const source_regex = new RegExp(`${Object.keys(renamer_mapping).join('|')}`, 'g')

    const { entries } = await _fs.read_dir({ directory, list_ignore });

    for (let index = entries.length - 1; index >= 0; index--) {
      const entry = entries[index];
      
      if (entry.stats.is_file) {

        let new_name = entry.name;

        if (source_regex.test(entry.name)) {
          new_name = entry.name.replaceAll(source_regex, match => renamer_mapping[match]);
        }

        const new_path = path.join(entry.directory, new_name);

        const content = await fse.readFile(entry.path, { encoding: 'utf-8' });

        if (source_regex.test(content)) {
          const new_content = content.replaceAll(source_regex, match => renamer_mapping[match]);

          await fse.writeFile(new_path, new_content);

          if (new_name != entry.name) {
            await fse.unlink(entry.path);
            if (verbose) {
              console.log(`[REPLACE] [RENAME] [FILE: ${entry.path}] [TO: ${new_path}]`);
            }
          } else {
            await fse.rename(entry.path, new_path);
          }
        } else if (new_name != entry.name) {
          await fse.rename(entry.path, new_path);
        }

        if (verbose) {
          if (new_name != entry.name) {
            console.log(`[REPLACE] [RENAME] [FILE: ${entry.path}] [TO: ${new_path}]`);
          }
        }
      }

      if (entry.stats.is_directory) {
        if (source_regex.test(entry.name)) {
          let new_name = entry.name.replaceAll(source_regex, match => renamer_mapping[match]);
          const new_path = path.join(entry.directory, new_name)
          await fse.rename(entry.path, new_path);
          if (verbose) {
            console.log(`[REPLACE] [RENAME] [FOLDER: ${entry.path}] [TO: ${new_path}]`);
          }
        }
      }

    }
  }

  return _fs;

})()
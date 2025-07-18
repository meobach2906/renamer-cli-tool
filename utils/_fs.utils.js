const path = require('path');
const fse = require('fs-extra');
const _to = require('./_to.utils');

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
    result.entries.push({
      name: folder,
      directory: directory_tokens.join('/'),
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
      [source]: target,
      [source.toUpperCase()]: target.toUpperCase(),
      [normalized_source]: [normalized_target],
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
        await new Promise((res, rej) => {
          const read_stream = fse.createReadStream(entry.path, { encoding: 'utf8' });

          let write_path = path.join(entry.directory, `temp-${entry.name}`);

          let was_rename = false;

          if (source_regex.test(entry.name)) {
            let new_name = entry.name.replaceAll(source_regex, match => renamer_mapping[match]);

            write_path = path.join(entry.directory, new_name);

            was_rename = true;
          }

          const write_stream = fse.createWriteStream(write_path);

          let previous_chunk = '';

          let was_replace = false;

          read_stream.on('data', (data) => {

            let content = previous_chunk + data;

            if (source_regex.test(content)) {

              content = content.replaceAll(source_regex, match => renamer_mapping[match]);

              write_stream.write(content);

              was_replace = true;

              previous_chunk = '';

              return;
            }

            if (previous_chunk) {
              write_stream.write(previous_chunk);
            }

            previous_chunk = data;

          });

          read_stream.on('end', async () => {
            write_stream.end(previous_chunk);
            if (!was_rename) {
              if (was_replace) {
                await fse.rename(write_path, entry.path);
              } else {
                await fse.unlink(write_path);
              }
            }
            if (verbose) {
              if (was_replace) {
                console.log(`[REPLACE] [VARIABLE] [FILE: ${entry.path}]`);
              }
              if (was_rename) {
                console.log(`[REPLACE] [RENAME] [FILE: ${entry.path}] [TO: ${write_path}]`);
              }
            }
            read_stream.close();
            res();
          })

          read_stream.on('error', rej)
          write_stream.on('error', rej)

          read_stream.read();
        })
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
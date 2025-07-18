const _ = require('lodash');
const _do = require('./_do.utils');

module.exports = (() => {
  const _to = {};

  _to.normalize = ({ str }) => {
    str = _.lowerCase(str).trim();
    str = _do.joinS({
      values: str.split(' '),
      separator: ' '
    })

    return str;
  }

  _to.camel_case = ({ str, separator = ' '}) => {
    const tokens = str.split(separator);
    return _do.joinS({
      values: tokens.map((token, index) => {
        if (index === 0) return token;
        if (typeof token !== 'string' || token.length === 0) {
          return token;
        }
        return token.charAt(0).toUpperCase() + token.slice(1);
      }),
      separator: '',
    });
  }

  _to.snake_case = ({ str, separator = ' '}) => {
    const tokens = str.split(separator);
    return _do.joinS({
      values: tokens.map((token, index) => {
        if (typeof token !== 'string' || token.length === 0) {
          return token;
        }
        return token.toLowerCase();
      }),
      separator: '_',
    });
  }

  _to.screaming_snake_case = ({ str, separator = ' '}) => {
    const tokens = str.split(separator);
    return _do.joinS({
      values: tokens.map((token, index) => {
        if (typeof token !== 'string' || token.length === 0) {
          return token;
        }
        return token.toUpperCase();
      }),
      separator: '_',
    });
  }

  _to.pascal_case = ({ str, separator = ' '}) => {
    const tokens = str.split(separator);
    return _do.joinS({
      values: tokens.map((token, index) => {
        if (typeof token !== 'string' || token.length === 0) {
          return token;
        }
        return token.charAt(0).toUpperCase() + token.slice(1);
      }),
      separator: '',
    });
  }

  _to.kebab_case = ({ str, separator = ' '}) => {
    const tokens = str.split(separator);
    return _do.joinS({
      values: tokens.map((token, index) => {
        if (typeof token !== 'string' || token.length === 0) {
          return token;
        }
        return token.toLowerCase();
      }),
      separator: '-',
    });
  }

  _to.upper_kebab_case = ({ str, separator = ' '}) => {
    const tokens = str.split(separator);
    return _do.joinS({
      values: tokens.map((token, index) => {
        if (typeof token !== 'string' || token.length === 0) {
          return token;
        }
        return token.toUpperCase();
      }),
      separator: '-',
    });
  }

  return _to;
})()
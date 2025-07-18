const path = require('path');
const fse = require('fs-extra');
const _to = require('./_to.utils');

module.exports = (() => {
  const _do = {};

  _do.joinS = ({ values, separator = ' ', list_ignore = ['', null, undefined] }) => {
    return values.filter(val => !list_ignore.includes(val)).join(separator)
  }

  return _do;

})()
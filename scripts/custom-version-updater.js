// standard-version-updater.js
const stringifyPackage = require('stringify-package')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline')

module.exports.readVersion = function (contents) {
  const jsonObj = JSON.parse(contents);
  if (jsonObj.version) {
    console.log("version");
    return jsonObj.version;
  }
  if (jsonObj.package.version) {
    console.log("package.version");
    return jsonObj.package.version;
  }
  return undefined;
}

module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents)
  let indent = detectIndent(contents).indent
  let newline = detectNewline(contents)
  if (json.version) {
    console.log("version");
    json.version = version;
  } else if (json.package.version) {
    console.log("package.version");
    json.package.version = version;
  }
  return stringifyPackage(json, indent, newline)
}
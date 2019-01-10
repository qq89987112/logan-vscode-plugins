
const cssExtractor = require('./css-extractor/extension')
const autoImport = require('./auto-import/extension')
const cssCompiler = require('./postcss-compiler/extension')

function activate(...params) {
    cssExtractor.activate(...params)
    autoImport.activate(...params)
    cssCompiler.activate(...params)
}

function deactivate(...params) {
    cssExtractor.deactivate(...params)
    autoImport.deactivate(...params)
    cssCompiler.deactivate(...params)
}

exports.activate = activate;
exports.deactivate = deactivate;
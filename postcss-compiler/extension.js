const vscode = require('vscode');
const fs = require('fs');
const pathModule = require('path');
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const precss = require('precss')

var CompileSassExtension = function() {

    var outputChannel = vscode.window.createOutputChannel("postcss-compiler");
    function showErrorMessage (message) {
        outputChannel.appendLine(message);
        outputChannel.show(true);
    }

    // Compiles single scss/sass file.
    function compileFile(path) {
        let fileName = pathModule.basename(path,pathModule.extname(path));
        let outputPath = pathModule.join(pathModule.dirname(path),fileName+".wxss");
        fs.readFile(path, (err, css) => {
            postcss([precss, autoprefixer])
            .process(css, { from: path, to: outputPath })
            .then(result => {
                fs.writeFile(outputPath, result.css);
                outputChannel.appendLine('Scss2wxss completed...');
                // if ( result.map ) fs.writeFile(outputPath+'.map', result.map)
            }).catch(e => {
                showErrorMessage('Scss2wxss: could not generate wxss file: ' + e);
            })
          })
    }

    return {
        OnSave: function(document) {
            // 获取配置相关属性
            var configuration = vscode.workspace.getConfiguration('Scss2wxss');
            const fileName = document.fileName.toLowerCase();
            if (configuration.compileAfterSave && (fileName.endsWith('.css') || fileName.endsWith('.scss') || fileName.endsWith('.sass'))) {
                showErrorMessage('Scss2wxss compiling...');
                compileFile(document.fileName);
            }
        },
        CompileAll: function() {
            vscode.workspace.findFiles("**/*.((s[ac])|c)ss").then(files => {
                try {
                    files.forEach(i=>compileFile(files[i].fsPath));
                } catch (e) {
                    showErrorMessage('Scss2wxss: could not generate wxss file: ' + e);
                }
            });
        }
    };
};

function activate(context) {

    var extension = CompileSassExtension();

    vscode.workspace.onDidSaveTextDocument(extension.OnSave);

    var disposable = vscode.commands.registerCommand('Scss2wxss.compileAll', extension.CompileAll);

    context.subscriptions.push(disposable);
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
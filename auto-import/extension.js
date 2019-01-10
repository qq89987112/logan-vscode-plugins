const vscode = require('vscode');
const pathModule = require('path');

function activate(context) {
    
    var outputChannel = vscode.window.createOutputChannel("auto-import");
    function showMessage (message) {
        outputChannel.appendLine(message);
        outputChannel.show(true);
    }

    var files;
    showMessage("auto-import 加载中...")

    let completetion = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'javascript' }, {
        provideCompletionItems(document,position,token){
            return new Promise((resolve, reject) => {
                let wordToComplete = '';
                let range = document.getWordRangeAtPosition(position);
                if (range) {
                    wordToComplete = document.getText(new vscode.Range(range.start, position)).toLowerCase();
                }
                let ret = [];
                (files||[]).forEach(file=>{
                    const name = pathModule.basename(file.fsPath);
                    if(name.startsWith(wordToComplete)){
                        const dirRelative = pathModule.relative(pathModule.dirname(document.fileName),pathModule.dirname(file.fsPath)) || '';
                        const tempRelativeArr = pathModule.join(dirRelative,name).split(pathModule.sep);
                        tempRelativeArr.unshift('.');
                        const insertText = tempRelativeArr.join("/");
                        ret.push({
                            label: name,
                            // relative 是作用于目录,不是文件
                            insertText: insertText,
                            detail: insertText
                        });
                    }
                });
                return resolve(ret);
            })
        }
    }, '');
    // 注册一个命令
    var disposable = vscode.commands.registerCommand('autoimport.updateFiles', updateFiles);
    context.subscriptions.push(completetion);
    // 像glob一样查找文件
    var updateFiles = ()=>vscode.workspace.findFiles("**/*.js","**/node_modules/**").then(_files => {
        if(!files) showMessage("auto-import 加载完毕");
        files = _files || [];
    });
    updateFiles();

}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
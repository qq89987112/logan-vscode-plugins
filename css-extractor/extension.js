const vscode = require('vscode');
const pathModule = require('path');
const {parse,stringify} = require("himalaya");
const scssfmt = require('scssfmt')

function activate(context) {
    var outputChannel;
    var selection;
    outputChannel = vscode.window.createOutputChannel("css-extractor");
    function showMessage (message) {
        outputChannel.appendLine(message);
        outputChannel.show(true);
    }
    showMessage("css-extractor 加载中！");
    var selectionChange = vscode.window.onDidChangeTextEditorSelection(e=>{
        selection = e.textEditor.document.getText(e.selections[0]);
    })
    var extract = vscode.commands.registerCommand('css-extractor.extract', ()=>{
        let html = parse(selection);
        function generateCss(elements) {
            elements = elements || [];
            return elements.map(item => {
                let attributes = item.attributes || [];
                let css = attributes.find(i => i.key === 'class');
                let style = attributes.find(i => i.key === 'style');
                css = css && css.value || "";
                style = style && style.value || "";
                return css ? `.${css}{${style?`
                            ${style}
                            `:''}${generateCss(item.children)}
                        }` : generateCss(item.children)
            }).filter(i => i).join("\r\n")
        }
        let cssResult = scssfmt(generateCss(html));
        vscode.workspace.openTextDocument({
            content: cssResult,
            language: 'css'
        }).then(document=>{
            vscode.window.showTextDocument(document);
        })
    })
    context.subscriptions.push(selectionChange,extract);
    showMessage("css-extractor 加载完毕！");
}

function deactivate() {}

exports.activate = activate;
exports.deactivate = deactivate;
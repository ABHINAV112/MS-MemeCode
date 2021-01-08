// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require("vscode");
const axios = require("axios");
let scheduler;
const createMemeWebView = async function () {
  const panel = vscode.window.createWebviewPanel(
    "meme",
    "Meme",
    vscode.ViewColumn.One,
    {}
  );

  var config = {
    method: "get",
    url: "https://meme-api.herokuapp.com/gimme",
    headers: {},
  };
  // @ts-ignore
  const result = await axios(config);
  const memeUrl = result.data.url;
  panel.webview.html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meme</title>
  </head>
     <img src="${memeUrl}"></img>
  </body>
  </html>
`;
};

function activate(context) {
  let activeEditor = vscode.window.activeTextEditor;

  const underlineDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: "darkred wavy underline",
  });
  const noUnderlineDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: "",
  });

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
    },
    null,
    context.subscriptions
  );

  const lint = vscode.commands.registerCommand("lod.lint", function () {
    if (!activeEditor) {
      vscode.window.showErrorMessage("Editor not selected");
      return;
    }

    const selectedText = activeEditor.document.getText(activeEditor.selection);
    const range = new vscode.Range(
      activeEditor.selection.start,
      activeEditor.selection.end
    );
    activeEditor.setDecorations(underlineDecoration, [range]);

    vscode.window.showInformationMessage(selectedText);
  });

  const unlint = vscode.commands.registerCommand("lod.unlint", function () {
    if (!activeEditor) {
      vscode.window.showErrorMessage("Editor not selected");
      return;
    }

    const selectedText = activeEditor.document.getText(activeEditor.selection);

    activeEditor.setDecorations(underlineDecoration, []);

    vscode.window.showInformationMessage(selectedText);
  });

  const MINUTES = 5;
  scheduler = setInterval(() => {
    console.log("testing");
    vscode.window.showInformationMessage(
      "Its been a while, you should take a break here's a meme!"
    );
    createMemeWebView();
  }, MINUTES * 60 * 1000);

  const webview = vscode.commands.registerCommand(
    "lod.giveMeme",
    createMemeWebView
  );

  context.subscriptions.push(lint);
  context.subscriptions.push(unlint);
  context.subscriptions.push(webview);
}
// @ts-ignore
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  // @ts-ignore
  activate,
  deactivate,
};

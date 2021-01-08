// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { start } = require("repl");
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  const decorationType = vscode.window.createTextEditorDecorationType({
    borderColor: "red",
    textDecoration: "wavy underline",
  });

  let disposable = vscode.commands.registerCommand(
    "lod.helloWorld",
    function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Editor not selected");
        return;
      }

      const selectedText = editor.document.getText(editor.selection);
      const range = new vscode.Range(
        editor.selection.start,
        editor.selection.end
      );
      editor.setDecorations(decorationType, [range]);

      vscode.window.showInformationMessage(selectedText);
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

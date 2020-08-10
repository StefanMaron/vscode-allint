'use strict';
import {
	createConnection, TextDocuments, TextDocument, ProposedFeatures, Diagnostic, InitializeResult, combineConsoleFeatures
} from 'vscode-languageserver';
import { alObject } from './alobject';
import { checkForCommit, checkForWithInTableAndPage, checkFunctionReservedWord, checkFunctionForHungarianNotation, checkFieldForHungarianNotation, checkVariableForHungarianNotation, checkVariableForIntegerDeclaration, checkVariableForTemporary, checkVariableForTextConst, checkVariableForReservedWords, checkVariableNameForUnderScore, checkForMissingDrillDownPageId, checkForMissingLookupPageId, checkFunctionForNoOfLines } from './diagnostics';
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
documents.onDidChangeContent((change) => {
	validateAlDocument(change.document);
});

// The settings interface describe the server relevant settings part
interface Settings {
	allint: AlLintSettings;
}

let enabled: boolean;
let statusbar: boolean;
let checkcommit: boolean;
let checkhungariannotation: boolean;
let checkspecialcharactersinvariablenames: boolean;
let hungariannotationoptions: string;
let checkdrilldownpageid: boolean;
let checklookuppageid: boolean;
let maxnumberoffunctionlines: number;
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;

	enabled = settings.allint.enabled;
	statusbar = settings.allint.statusbar;
	checkcommit = settings.allint.checkcommit;
	checkhungariannotation = settings.allint.checkhungariannotation;
	checkspecialcharactersinvariablenames = settings.allint.checkspecialcharactersinvariablenames;
	hungariannotationoptions = settings.allint.hungariannotationoptions;
	checkdrilldownpageid = settings.allint.checkdrilldownpageid;
	checklookuppageid = settings.allint.checklookuppageid;
	maxnumberoffunctionlines = settings.allint.maxnumberoffunctionlines;
	// Revalidate any open text documents
	documents.all().forEach(validateAlDocument);
});

function validateAlDocument(alDocument: TextDocument): void {
	let diagnostics: Diagnostic[] = [];
	if (!enabled) {
		connection.sendDiagnostics({ uri: alDocument.uri, diagnostics });
		return;
	}

	let alDocumentWithoutBlockComments = alDocument.getText().replace(/\/\*.*?\*\//isg, ''); // remove all block comments before splitting

	let myObject = new alObject(alDocumentWithoutBlockComments, hungariannotationoptions);

	if (checkdrilldownpageid)
		checkForMissingDrillDownPageId(diagnostics, myObject);

	if (checklookuppageid)
		checkForMissingLookupPageId(diagnostics, myObject);

	let lines = alDocumentWithoutBlockComments.split(/\r?\n/g);
	lines = lines.filter(a => !a.trim().startsWith('//')) // remove all lines with comments

	lines.forEach((line, CurrentLineNo) => {

		if (myObject.alLine[CurrentLineNo].isCode) {
			if (checkcommit)
				checkForCommit(line.toUpperCase(), diagnostics, CurrentLineNo);

			checkForWithInTableAndPage(line.toUpperCase(), diagnostics, myObject, CurrentLineNo);
		}

		myObject.alFunction.forEach(alFunction => {
			if (alFunction.startsAtLineNo == CurrentLineNo + 1) {
				checkFunctionForNoOfLines(alFunction, line, diagnostics, CurrentLineNo, maxnumberoffunctionlines);
				checkFunctionReservedWord(alFunction, line, diagnostics, CurrentLineNo);

				if (checkhungariannotation)
					checkFunctionForHungarianNotation(alFunction, line, diagnostics, CurrentLineNo);
			}
		});

		myObject.alField.forEach(alField => {
			if (alField.lineNumber == CurrentLineNo + 1) {
				if (checkhungariannotation)
					checkFieldForHungarianNotation(alField, line, diagnostics, CurrentLineNo);
			}
		});

		myObject.alVariable.forEach(alVariable => {
			if (alVariable.lineNumber == CurrentLineNo + 1) {
				if (checkhungariannotation)
					checkVariableForHungarianNotation(alVariable, line, diagnostics, CurrentLineNo);

				checkVariableForIntegerDeclaration(alVariable, line, diagnostics, CurrentLineNo);
				checkVariableForTemporary(alVariable, line, diagnostics, CurrentLineNo);
				checkVariableForTextConst(alVariable, line, diagnostics, CurrentLineNo);
				checkVariableForReservedWords(alVariable, line, diagnostics, CurrentLineNo);

				if (checkspecialcharactersinvariablenames)
					checkVariableNameForUnderScore(alVariable, line, diagnostics, CurrentLineNo);
			}
		});
	})
	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: alDocument.uri, diagnostics });
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

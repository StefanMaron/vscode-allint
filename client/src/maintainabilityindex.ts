'use strict';
import * as vscode from 'vscode';
import { window, StatusBarItem, StatusBarAlignment } from "vscode";


export class MaintainabilityIndex {

    private _statusBarItem: StatusBarItem;

    public updateMaintainabilityIndex() {
        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if an Markdown file
        if (doc.languageId === "al") {

            let settings = Object.assign({}, vscode.workspace.getConfiguration('allint'));
            if (settings.statusbar) {
                if (settings.trace)
                    delete settings.trace;

                var uri = doc.uri;
                var parameters = ["GETOBJECT", uri.path.replace(/[a-z]\:\//, ''), JSON.stringify(settings)]; // TODO:awdkbajwhd
                // console.log(parameters);
                // return;
                let currentRec = this;
                var exec = require('child_process').execFile;
                let allinter = function (parameters: string[]) {
                    exec(__dirname + '/../../bin/al-linter.exe', parameters, function (err, data) {
                        if (err) {
                            console.error(`exec error: ${err}`);
                            return;
                        }
                        var results = JSON.parse(data);
                        var currentLineNo = editor.selection.active.line;

                        results = results.alFunction.filter(el => el.startsAtLineNo <= currentLineNo && el.endsAtLineNo >= currentLineNo)[0];
                        // console.log(editor.selection.active.line);
                        // console.log(results);
                        // return;
                        if (results) {
                            let maintainabilityIndex = results.maintainabilityIndex;
                            let cyclomaticComplexity = results.cycolomaticComplexity;
                            var currentFunctionName = results.name;

                            var theText = currentFunctionName + ` - Maintainability Index : ${maintainabilityIndex}` + ` Cyclomatic Complexity : ${cyclomaticComplexity}`;

                            currentRec._statusBarItem.text = maintainabilityIndex !== 1 ? theText : 'Maintainability Index Undefined';

                            if (maintainabilityIndex >= 20) {
                                currentRec._statusBarItem.color = 'lightgreen';
                            }
                            else if (maintainabilityIndex >= 10) {
                                currentRec._statusBarItem.color = 'orange';
                            }
                            else if (maintainabilityIndex != 0) {
                                currentRec._statusBarItem.color = 'red';
                            }
                        } else {
                            currentRec._statusBarItem.color = 'lightgreen';
                            currentRec._statusBarItem.text = 'Not inside a function';
                        }

                        currentRec._statusBarItem.show();

                    });
                }

                allinter(parameters);
            }
        } else {
            this._statusBarItem.hide();
        }
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}
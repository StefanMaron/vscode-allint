# AL Lint

The AL Lint extension is designed for AL. The main purpose is to test AL Code against guidelines for clean code.

[![Marketplace](https://vsmarketplacebadge.apphb.com/version-short/StefanMaron.allint.svg)](https://marketplace.visualstudio.com/items?itemName=StefanMaron.allint)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/StefanMaron.allint.svg)](https://marketplace.visualstudio.com/items?itemName=StefanMaron.allint)
[![GitHub issues](https://img.shields.io/github/issues/StefanMaron/vscode-allint.svg)](https://github.com/StefanMaron/vscode-allint/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/StefanMaron/vscode-allint.svg)](https://github.com/StefanMaron/vscode-allint/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/StefanMaron/vscode-allint/master/LICENSE)

## Features

The extension will check your code as you are working on it. It checks the open file and shows warnings.

Provides two commands

* Refactor - Move one or more lines of code into a new function or new codeunit. (In Prototype)

* Clean Code - Check your current object against coding guidelines for clean code. This will generate a summary report. (Not working yet)

## Requirements

Some AL code

## Extension Settings

- `allint.enabled` - enable/disable allint.
- `allint.statusbar` - enable/disable statusbar.
- `allint.checkcommit` - check code for COMMIT.
- `allint.checkhungariannotation` - check code for hungarian notation.
- `allint.hungariannotationoptions` - defines Hungarian Notation options.
- `allint.maxnumberoffunctionlines` - The limit how many lines a function should have. Blank lines and comments are not taken into account. Set to 0 to deactivate.

## Hungarian Notation Options

By default the extension will check the following abbreviations
    Record,Rec
    Integer,Int
    Code,Cod
    Function,Func
    Codeunit,Cdu
    Page,Pag
    Text,Txt
    Field,Fld

Which can be changed by modifying the HungarianNotationOptions setting like this
    "Record,Rec;Integer,Int;Code,Cod;Function,Func;Codeunit,Cdu;Page,Pag;Text,Txt;Field,Fld"

## Status Bar Explanation

The status bar will show which function you are editing and its hallstead complexity and cyclomatic complexity.

If the text is green, you are good. Orange and Red should explain itsself.

https://en.wikipedia.org/wiki/Halstead_complexity_measures

## Prepare Development setup
- run **npm install** inside `vscode-allint` folder

## Debugging both Client and Server
Debugging the client code is as easy as debugging a normal extension. Set a breakpoint in the client code and debug the extension by pressing **F5**. For a detailed description about launching and debugging an extension see [Running and Debugging Your Extension](https://code.visualstudio.com/docs/extensions/debugging-extensions).

Since the server is started by the **LanguageClient** running in the extension (client), we need to attach a debugger to the running server. To do so, switch to the Debug viewlet and select the launch configuration **Attach to Server** and press **F5**. This will attach the debugger to the server.

More Details: https://code.visualstudio.com/docs/extensions/example-language-server#_debugging-both-client-and-server

## Known Issues

Next up is the refactoring command and then uploading the summary to a report

## Release Notes

### 0.2.1

Bugfix in the code metrics

### 0.2.0

With this update the core code which does all the analyzing, is moved to c#. See [al-linter](https://github.com/StefanMaron/al-linter).
- Added message codes for easier reference
- Issues Fixed
  - [Incorrect warning for List type variables #9](https://github.com/StefanMaron/vscode-allint/issues/9)
  - [Runtime 5 Wrong Warning: Variable names should not contain special characters or whitespaces in their name #8](https://github.com/StefanMaron/vscode-allint/issues/8)
  - [Incorrect warning about reserved word as part of a name #7](https://github.com/StefanMaron/vscode-allint/issues/7)
  - [Incorrect warning when multiple variables are declared in one line #5](https://github.com/StefanMaron/vscode-allint/issues/5)
  - [Incorrect warning for temporary varaiable #3](https://github.com/StefanMaron/vscode-allint/issues/3)
  - [Incorrect positioning and variable name detection #2](https://github.com/StefanMaron/vscode-allint/issues/2)

### 0.1.7
Fixes on maintainability index and cycolomatic complexity

### 0.1.6
Code comments are now excluded from processing. 

### 0.1.4
Some refactoring. 
Added a check on function length. By default any function longer then 40 lines will be warned.

### 0.1.3

Fixed a number of issues reported on GitHub.

Check on underscore in variables

### 0.1.2

First version of refactoring is implemented. The function is always called "foo" and does not yet check if the selection makes sense or depends on variables. 
Fixed issue with system variables Rec and xRec not being recognised as Hungarian Notation.
Added fields to the model with Hungarian Notation check.
Check for using WITH statement in Tables and Pages.
Warning if local and local variables have the same name.
Text Constants throw warning if they have the old notation (TextXXX).
Temporary Table Variables must have TEMP, BUFFER, ARGS or ARGUMENTS in the name.
Check for reserved words, e.g. a function name called "Action" or a field called "SetRange".
Complex Type variables that are declared with object id instead of name give warning.
Cleaned up the Type Script a bit here and there.

WARNING: You can not yet disable the new features.

### 0.1.1

Implemented setting and fixed reported issues.

### 0.1.0

First version
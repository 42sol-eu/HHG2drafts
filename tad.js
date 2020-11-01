/**
 * Thought Asylum Library
 * @author Stephen Millard
 * @copyright 2018-2020, ThoughtAsylum
 * @licensing Please visit https://tadpole.thoughtasylum.com
 * @version 20200801
 * @lastgenerated 2020-08-01-12.18.15
 */

 // Loads a workspace by name.
 app.TA_applyWorkspaceByName = function(p_strWorkspaceName, p_bShowDraftsList)
 {
     if (app.applyWorkspace(Workspace.find(p_strWorkspaceName)))
     {
         if (p_bShowDraftsList) app.showDraftList();
         return true;
     }
     else return false;
 }
 
 // Remove all tag instances from filtered Drafts.
 app.TA_removeTags = function(p_strDelTag, p_strFromFilter)
 {
    let draftsQuery = Draft.query("", p_strFromFilter, [p_strDelTag])
    for (let processDraft of draftsQuery)
    {
        processDraft.removeTag(p_strDelTag);
        processDraft.update();
    }

    return draftsQuery.length;
 }
 
 // Capture dictation and put it on the system clipboard.
 // Returns true if it captured anything.
 app.TA_dictateToClipboard = function()
 {
     let strAudio = editor.dictate();
     if (strAudio.length > 0)
     {
         app.setClipboard(strAudio);
         return true;
     }
     return false;
 }


 // Trash unflagged drafts in the box that are tagged with the specified tag.
app.TA_trashUnflggedInboxDraftsTaggedDrafts = function(p_strTag)
{
	//Initialise
	let intCounter = 0;
	let adraftAll = Draft.query("", "inbox", [p_strTag]);
	//Work through all the drafts in turn
	adraftAll.forEach(function(anotherDraft)
	{
		//Process only unflagged ones
		if (anotherDraft.isFlagged == false)
		{
			//Keep a count for the info message
			intCounter += 1;
			//Trash the draft
			anotherDraft.isTrashed = true;
			anotherDraft.update()
		}
	});

	//Info messages on what was found and done
	if (intCounter == 0)
	{
        this.displayInfoMessage(`No drafts tagged '${p_strTag}' were found in the inbox`);
        return 0;
	}
	else
	{
		if (intCounter == 1)
		{
            this.displayInfoMessage(`1 inbox draft tagged '${p_strTag}' was moved to the Trash`);
            return 1;
		}
		else
		{
            this.displayInfoMessage(`${intCounter} inbox drafts tagged '${p_strTag}' were moved to the Trash`);
            return intCounter;
		}
	}
}


// Remove run tag from archived drafts
app.TA_removeRunTagFromArchive = function()
{
    let intInstances = this.TA_removeTags(tadLib.tagRun, "archive")
    this.displayInfoMessage("Removed " + intInstances + " instance".TA_pluralise(intInstances) + " of run tag from archive.");
    return intInstances;
}


// Display a generic message box with a title and message.
app.TA_msgbox = function(p_strTitle, p_strMessage) 
{
    //Build the prompt
    let promptMessage = Prompt.create();
    promptMessage.title = p_strTitle;
    promptMessage.message = p_strMessage;
    promptMessage.addButton("OK");
    promptMessage.isCancellable = false;

    //Display the prompt
    promptMessage.show();

    //Can only ever be OK'd, so no point in returning the show result.
    return;
}


// Display a generic information message box with a message.
app.TA_msgInfo = function(p_strMessage)
{
    return app.TA_msgbox(tadLib.msgTitleInfo, p_strMessage);
}


// Display a generic warning message box with a message.
app.TA_msgWarn = function(p_strMessage)
{
    return app.TA_msgbox(tadLib.msgTitleWarn, p_strMessage);
}


// Display a generic error message box with a message.
app.TA_msgError = function(p_strMessage)
{
    return app.TA_msgbox(tadLib.msgTitleError, p_strMessage);
}


// Display a generic debug message box with a message.
app.TA_msgDebug = function(p_strMessage)
{
    //Only display and log debug messages if we have enabled debug mode.
    if(tadLib.debugEnabled)
    {
        app.TA_msgbox(tadLib.msgTitleDebug, p_strMessage);
        console.TA_logDebug(p_strMessage);
    }
    
    //Returns the debug state
    return tadLib.debugEnabled;
}

// Display an information message and log it to the console.
app.TA_displayInfoMessage = function(p_strMessage)
{
    app.displayInfoMessage(p_strMessage);
    console.TA_logInfo(p_strMessage);
    return;
}


// Display a warning message and log it to the console.
app.TA_displayWarningMessage = function(p_strMessage)
{
    app.displayWarningMessage(p_strMessage);
    console.TA_logWarn(p_strMessage);
    return;
}


// Display an error message and log it to the console.
app.TA_displayErrorMessage = function(p_strMessage)
{
    app.displayErrorMessage(p_strMessage);
    console.TA_logError(p_strMessage);
    return;
}


// Display a success message and log it to the console.
app.TA_displaySuccessMessage = function(p_strMessage)
{
    app.displaySuccessMessage(p_strMessage);
    console.TA_logSuccess(p_strMessage);
    return;
}


// Display a debug message and log it to the console.
app.TA_displayDebugMessage = function(p_strMessage)
{
    //Only display and log debug messages if we have enabled debug mode.
    if(tadLib.debugEnabled)
    {
        app.displayInfoMessage(tadLib.msgTitleDebug + p_strMessage);
        console.TA_logDebug(p_strMessage);
    }
    
    //Returns the debug state
    return tadLib.debugEnabled;
}


// Updates the content of the clipboard to be URL encoded.
app.TA_URLEncodeClipboard = function()
{
    let strEnc = encodeURIComponent(app.getClipboard());
    this.setClipboard(strEnc);
    return strEnc;
}


// Updates the content of the clipboard to be URL decoded.
app.TA_URLDecodeClipboard = function()
{
    let strDec = decodeURIComponent(app.getClipboard());
    app.setClipboard(strDec);
    return strDec;
}


// Updates MultiMarkdown clipboard content to HTML.
app.TA_clipboard_MMD2HTML = function()
{
    let mmd = MultiMarkdown.create();
    this.setClipboard(mmd.render(this.getClipboard()));
    this.displayInfoMessage("Clipboard conversion to HTML complete. Clipboard content replaced.");
    return;
}


// Display a list of actions from the library settings and run the selected action.
app.TA_actionSelectAndRun = function(p_strSet)
{
    let astrActions = [];
    //Add buttons for every key in the pre-prepared JSON in the library settings
    for (let jsonKey in tadLib.actions[p_strSet])
    {
        if (tadLib.actions[p_strSet].hasOwnProperty(jsonKey)) astrActions.push(jsonKey);
    }

    //Set-up the generic prompt
    let strResult = Prompt.TA_promptButtonArray("Select", "", astrActions);

    //If a button was chosen, set a draft tag which is used by the next action step to 
    //include (and thereby effectively run), the required action.
    if (strResult != null)
    {
        //Use square bracket notation rather than dot notation for the selected button as it could have spaces in it.
        app.queueAction(Action.find(tadLib.actions[p_strSet][strResult]), draft);
    }
    return;
}

class TadCommand
{
    constructor()
    {
        this;
    }

    // Picks out the slash command from the end of the current line in the editor.
    TA_slashSplit()
    {
        let strSlashCommand = "";
        //Based on the end of the current selection, select the line it is on.
        //That's most likely where the typing has finished.
        editor.TA_selectLineAft();
        //Split the selection based on a slash
        let strSelected = editor.getSelectedText();
        let astrSlashed = strSelected.split("/");

        //Find the content after the final slash on the line
        if (astrSlashed.length > 1)
        {
            //Get the defined command
            strSlashCommand = astrSlashed.pop();
            //Remove the command by replacing with previous text
            editor.setSelectedText(astrSlashed.join("/"));
        }
        else
        {
            //Replace with original text
            editor.setSelectedText(strSelected);
        }

        //Now we have the command stripped out, jump to the line end.
        editor.TA_cursorToLineEnd();

        //This next line shouldn't be required, but it seems to stop a lot of visual artefacts around text selection so we'll keep it around.
        editor.load(draft);

        //Retrun the command
        return strSlashCommand;
    }


    // Runs a slash command.
    TA_command(p_strMode = "Prompt")
    {
        // Get the input from the user
        // Default to Prompt mode, but also accepts Draft mode.
        let strInputCmd = "";
        if (p_strMode == "Draft") strInputCmd = this.TA_slashSplit().trim();
        else strInputCmd = Prompt.TA_singleTextFieldPrompt("Command", "Enter your command", "/", "").trim();
    
        // Split the entered input
        // Before the first space is the 'slash' command
        let strCmd = strInputCmd.split(" ")[0];
        // Everything after the first space is a set of parameters
        let strParameters = strInputCmd.slice(-1 * (strInputCmd.length - strCmd.length)).trim();
        
    
        // Read the command from the library JSON
        // Look up the slash command and return the content as an array with elements split by a pipe
        let astrCmd = [];
        if (strCmd.length < 1) astrCmd = ["NONE"];
        else
        {
            if (tadLib.commands.hasOwnProperty(strCmd)) astrCmd = tadLib.commands[strCmd].split("|");
            else astrCmd = ["Unknown Command: " + strCmd];
        }
        
        // astrCmd[0] will be the operation
        // astrCmd[1] will be the first parameter
        // astrCmd[2] will be the second parameter
        // etc.
    
        // <1> is the standard placeholder used to represent the use of strParameters (see above).
    
        let strCmdInfo = astrCmd[0];
        
        switch(astrCmd[0])
        {
            case "OPEN_URL":
                // Open the URL passed in after the slash command
                if(astrCmd[1] == "<1>")
                {
                    app.openURL(strParameters);
                    strCmdInfo += " " + strParameters;
                }
                else
                {
                    app.openURL(astrCmd[1]);
                    strCmdInfo += " " + astrCmd[1];
                }
                break;
    
            case "RUN_ACTION":
                // Run the action passed in after the slash command
                if(astrCmd[1] == "<1>")
                {
                    app.queueAction(Action.find(strParameters), draft);
                    strCmdInfo += " " + strParameters;
                }
                // Run the action specified in the JSON as the first parameter
                else
                {
                    app.queueAction(Action.find(astrCmd[1]), draft);
                    strCmdInfo += " " + astrCmd[1];
                }
                break;
    
            case "RUN_FUNCTION":
                // Run the function specified in the JSON with the parameters from the slash command as the parameters to be evaluated for the function
                console.log(astrCmd[1] + '("' + strParameters + '");');
                eval(astrCmd[1] + '("' + strParameters + '");');
                break;
    
            default:
                //Failed, so flag it up to the user
                strCmdInfo = "";
                app.TA_displayErrorMessage(astrCmd[0]);
        }
    
        //Log what was run
        if (strCmdInfo != "") console.log("Operation: " + strCmdInfo);
        return;
    }

    // Runs a slash command from the end of the current line in the editor.
    TA_cmdDraft()
    {
        return this.TA_command("Draft");
    }

    // Runs a slash command from a prompt given to the user.
    TA_cmdPrompt()
    {
        return this.TA_command("Prompt");
    }
}

//Make a gloablly available slash command object
var tadCmd = new TadCommand();

// Write an information entry to the console log.
console.TA_logInfo = function(p_strMessage)
{
    console.log(tadLib.consoleInfoMarker + p_strMessage);
    return;
}


// Write an warning entry to the console log.
console.TA_logWarn = function(p_strMessage)
{
    console.log(tadLib.consoleWarnMarker + p_strMessage);
    return;
}


// Write an error entry to the console log.
console.TA_logError = function(p_strMessage)
{
    console.log(tadLib.consoleErrorMarker + p_strMessage);
    return;
}


// Write a success entry to the console log.
console.TA_logSuccess = function(p_strMessage)
{
    console.log(tadLib.consoleSuccessMarker + p_strMessage);
    return;
}


// Write a debug entry to the console log.
console.TA_logDebug = function(p_strMessage)
{
    //Only log debug messages if we have enabled debug mode.
    if(tadLib.debugEnabled)
    {
        console.log(tadLib.consoleDebugMarker + p_strMessage);
    }
    
    //Returns the debug state
    return tadLib.debugEnabled;
}

const TA_DRAFTS_SYNTAX = ["Plain Text", "Markdown", "MultiMarkdown", "GitHub Markdown", "Simple List", "Taskpaper", "JavaScript"];

// Counts the number of words in the draft.
Draft.prototype.TA_wordCount = function()
{
    return this.content.TA_wordCount();
}
 

// Counts the number of lines in the draft.
Draft.prototype.TA_lineCount = function(p_intBase = 0)
{
    return this.content.TA_lineCount(p_intBase);
}
 

// Send all empty drafts to the trash.
Draft.prototype.TA_trashEmptyDrafts = function()
{
    //Initialise
    let intCounter = 0;
    let adraftAll = Draft.query("", "all", []);
    //Work through all the drafts in turn
    adraftAll.forEach(function(anotherDraft)
    {
        //Find drafts that have no content and are not already trashed
        if (anotherDraft.content.length == 0 && anotherDraft.isTrashed == false)
        {
            //Keep a count for the info message
            intCounter += 1;
            //Trash the draft
            anotherDraft.isTrashed = true;
            anotherDraft.update()
        }
    });


    //Info messages on what was found and done
    if (intCounter == 0)
    {
        app.displayInfoMessage(`No blank drafts were found`);
    }
    else
    {
        if (intCounter == 1)
        {
            app.displayInfoMessage(`1 blank draft was moved to the Trash`);
        }
        else
        {
            app.displayInfoMessage(`${intCounter} blank drafts were moved to the Trash`);
        }
    }
    return intCounter;
}
 

// Converts all non-blank non- task lines to tasks.
Draft.prototype.TA_convertAllToTasks = function()
{
    //Run first regex to add task marker to all non-blank lines
    //Retains indentation
    // The second bracketed pattern ensures that blank lines are *not* matched
    let regex = /^(\s*)(\S\S*)/gm;
    this.content = this.content.replace(regex, "$1" + tadLib.taskBasicStart + tadLib.taskBasicIncomplete + tadLib.taskBasicEnd + "$2");

    //Now the second regex to remove any double markers
    let strRegexDouble = "^(\\s*)" + RegExp.TA_escape(tadLib.taskBasicStart + tadLib.taskBasicIncomplete + tadLib.taskBasicEnd + tadLib.taskBasicStart);
    let regexDouble = new RegExp(strRegexDouble, "gm")
    this.content = this.content.replace(regexDouble, "$1" + tadLib.taskBasicStart);

    this.update();
    return;
}


// Removes all tags from the draft.
Draft.prototype.TA_tagRemoveAll = function()
{
this.tags.forEach(strTag => this.removeTag(strTag));
this.update();
return;
}


// Return an array of all tag names held against drafts.
Draft.prototype.TA_tagFetchAll = function()
{
//Get all the drafts, get their arrays of tags, flatten those arrays, deduplicate and then sort it
return [...new Set([].concat(...Draft.query("", "all", []).map((draftCurrent) => draftCurrent.tags)))].sort();
}


// Takes a function as its parameter and runs it against every line in the draft
Draft.prototype.TA_lineForEach = function(someFunction)
{
//Split the draft into lines and operate on each line
this.content.split("\n").map(someFunction);
}


// Trash all inbox drafts with a specific set of tags.
Draft.prototype.TA_trashInboxDraftsTagged = function(p_astrTags)
{
    //Find the matching drafts
    draftsTempList = Draft.query("", "inbox", p_astrTags, [], "created", true);

    //Trash the matched drafts
    draftsTempList.forEach(function(draftMatch)
    {
        draftMatch.isTrashed = true;
        draftMatch.update();
    });

    return draftsTempList.length;
}


// Archive all inbox drafts with a specific set of tags.
Draft.prototype.TA_archiveInboxDraftsTagged = function(p_astrTags)
{
    //Find the matching drafts
    draftsTempList = Draft.query("", "inbox", p_astrTags, [], "created", true);

    //Trash the matched drafts
    draftsTempList.forEach(function(draftMatch)
    {
        draftMatch.isArchived = true;
        draftMatch.update();
    });

    return draftsTempList.length;
}


// Displays a pop up window to allow the user to specify a syntax.
Draft.prototype.TA_setSyntax = function(p_astrSyntaxes)
{
    let ret = true;
    let promptSyntax = Prompt.create();
        
    promptSyntax.title = "Set syntax";
    p_astrSyntaxes.forEach(strSyntax => promptSyntax.addButton(strSyntax));
        
    if (promptSyntax.show())
    {
        draft.languageGrammar = promptSyntax.buttonPressed;
        draft.update();
    }
    else
    {
        context.cancel("Operation Cancelled");
        ret = false;
    }
        
    editor.activate();
    return ret;
}

// Displays a pop up window to allow the user to specify a syntax from the standard Drafts syntaxes.
Draft.prototype.TA_setSyntaxAllStandard = function()
{
    return this.TA_setSyntax(TA_DRAFTS_SYNTAX);
}
 
 
// Creates a new draft with a specific set of content and a specific syntax.
Draft.prototype.TA_draftNew_ContentSyntax = function(p_strSyntax)
{
    let newDraft = Draft.create();
    let objHTTP = HTTP.create();

    newDraft.content = objHTTP.TA_getSyntaxTest(p_strSyntax);
    newDraft.languageGrammar = p_strSyntax;

    newDraft.update();
    editor.load(newDraft);
    return;
}


// Create a new Simple List Draft
Draft.prototype.TA_newExample_SimpleList = function()
{
    return this.TA_draftNew_ContentSyntax("Simple List");
}


// Create a new Taskpaper Draft
Draft.prototype.TA_newExample_Taskpaper = function()
{
    return this.TA_draftNew_ContentSyntax("Taskpaper");
}


// Create a new Plain Text Draft
Draft.prototype.TA_newExample_PlainText = function()
{
    return this.TA_draftNew_ContentSyntax("Plain Text");
}


// Create a new MultiMarkdown Draft
Draft.prototype.TA_newExample_MultiMarkdown = function()
{
    return this.TA_draftNew_ContentSyntax("MultiMarkdown");
}


// Create a new GitHub Markdown Draft
Draft.prototype.TA_newExample_GitHubMarkdown = function()
{
    return this.TA_draftNew_ContentSyntax("GitHub Markdown");
}


// Create a new Markdown Draft
Draft.prototype.TA_newExample_Markdown = function()
{
    return this.TA_draftNew_ContentSyntax("Markdown");
}


// Create a new JavaScript Draft
Draft.prototype.TA_newExample_JavaScript = function()
{
    return this.TA_draftNew_ContentSyntax("JavaScript");
}

// Duplicates a draft
Draft.prototype.TA_duplicate = function()
{
    // Prepare the non-tag data
    let newDraft = Draft.create();
    newDraft.content = this.content;
    newDraft.languageGrammar = this.languageGrammar;

    // Process tags if we have any
    if (this.tags.length > 0)
    {
        for (let intIndex = 0; intIndex < this.tags.length; intIndex++)
        {
            newDraft.addTag(this.tags[intIndex]);
        }

    }

    // Update the draft
    newDraft.update();
    return newDraft;
}

// Duplicates a draft including setting the content, the syntax, and the tags, and then loads the new draft into the editor.
Draft.prototype.TA_duplicateAndLoad = function()
{
    let draftNew = draft.TA_duplicate();
    editor.load(draftNew);
    editor.activate();
    return draftNew;
}


// Set a draft's tags based on all previously used tags and what it currently has set.
Draft.prototype.TA_selectSetTags = function()
{
    // Prompt the user with a list of all existing tags
    // Initialise with the draft's existing tags to already have a checkmark against them
    let promptTags = Prompt.create();
    promptTags.title = "Select Tags for Draft";
    promptTags.addSelect("tags", "Available Tags", this.TA_tagFetchAll(), this.tags, true);
    promptTags.addButton("OK");
    promptTags.show();
    
    if (promptTags.buttonPressed == "OK")
    {
        // User didn't cancel
        // Remove all of the draft's tags
        this.TA_tagRemoveAll();
        
        // Add each of the tags the user selected
        let draftToUse = this;
        promptTags.fieldValues["tags"].forEach(
            function(selTag)
            {
                draftToUse.addTag(selTag);
            });

        // Force an update of the draft
        this.update();

        return true;
    }
    else return false;
}


// Creates a new list via dictation
Draft.prototype.TA_dictateList = function(p_strGrammar = tadLib.taskBasicSyntax, p_strMarker = tadLib.taskBasicStart + tadLib.taskBasicIncomplete + tadLib.taskBasicEnd)
{
    let newList = editor.dictate();
    if (newList.length > 0)
    {
        let newDraft = Draft.create();
        newDraft.languageGrammar = p_strGrammar;
        newDraft.content = newList.replace(/^(.*)/gm, p_strMarker + '$1');
        newDraft.update();
        return newDraft;
    }
    else return this;
}


// Creates a new list via dictation and then loads it into the editor
Draft.prototype.TA_dictateListAndLoad = function(p_strGrammar, p_strMarker)
{
    return editor.TA_loadAc(this.TA_dictateList(p_strGrammar, p_strMarker));
}


// Creates a new Taskpaper list via dictation and then loads it into the editor
Draft.prototype.TA_dictateListTaskpaper = function()
{
    return this.TA_dictateListAndLoad("Taskpaper", "- ");
}


// Creates a new Simple List list via dictation and then loads it into the editor
Draft.prototype.TA_dictateListSimple = function()
{
    return this.TA_dictateListAndLoad("Simple List", "[ ] ");
}


// Creates a new Markdown list via dictation and then loads it into the editor
Draft.prototype.TA_dictateListMarkdown = function()
{
    return this.TA_dictateListAndLoad("Markdown", "-[ ] ");
}

// Creates a new draft based on the current text selection in the editor.
Draft.prototype.TA_draftNewFromSelection = function()
{
    let newDraft = Draft.create();
    newDraft.content = editor.getSelectedText();
    newDraft.update();
    if (newDraft.content == "") return null;
    else return newDraft;
}

// Creates and load a new draft based on the current text selection in the editor.
Draft.prototype.TA_draftNewFromSelectionAndLoad = function()
{
    return editor.TA_loadAc(this.TA_draftNewFromSelection());
}


// Create and load a new draft based on the text passed in.
Draft.prototype.TA_draftNew = function(p_strContent)
{
    let draftNew = Draft.create();
    draftNew.content = p_strContent;
    draftNew.update();
    editor.TA_loadAc(draftNew);
    return draftNew;
}


// Creates a new draft based on the current clipboard content.
Draft.prototype.TA_draftNewFromClipboard = function()
{
    let newDraft = Draft.create();
    newDraft.content = app.getClipboard();
    newDraft.update();
    return newDraft;
}


// Creates and load a new draft based on the current clipboard content.
Draft.prototype.TA_draftNewFromClipboardAndLoad = function()
{
    return editor.TA_loadAc(this.TA_draftNewFromClipboard());
}


// Replaces one tag on a draft with another tag.  Effectively a rename of a tag on a single draft.
Draft.prototype.TA_tagRenameInstance = function(p_strFrom, p_strTo)
{
    this.addTag(p_strTo);
    this.removeTag(p_strFrom);
    this.update();
    return;
}


// Replaces a tag on all drafts with another tag.  Effectively a rename of a tag on all drafts.
Draft.prototype.TA_tagRename = function(p_strFrom, p_strTo, p_bInfo = false)
{
    //Get all drafts with the original tag
    let arrDrafts = Draft.query("", "all", [p_strFrom], [], "created", false, false);

    //For each of those drafts, replace the orignal tag with the new one.
    //Once all matching drafts have been processed, the original tag won't exist any longer.
    arrDrafts.forEach(function(draftObject)
    {
        draftObject.TA_tagRenameInstance(p_strFrom, p_strTo);
    });

    //Display some information if the info parameter has been set
    if (p_bInfo) app.displayInfoMessage(arrDrafts.length + " tags renamed from '" + p_strFrom + "' to '" + p_strTo + "'.");
    return;
}


// Removes a tag on all drafts.  Effectively deletes a tag.
Draft.prototype.TA_tagDelete = function(p_strTag, p_bInfo = false)
{
    //Get all drafts with the tag
    let arrDrafts = Draft.query("", "all", [p_strTag], [], "created", false, false);

    //For each of those drafts, remove the tag.
    //Once all matching drafts have been processed, the original tag won't exist any longer.
    arrDrafts.forEach(function(draftObject)
    {
        draftObject.removeTag(p_strTag);
        draftObject.update();
    });

    //Display some information if the info parameter has been set
    if (p_bInfo) app.displayInfoMessage(arrDrafts.length + " tags instances removed.");
    return;
}


// Prompts the user for a tag to rename and what to rename it to. 
Draft.prototype.TA_selectAnyTagRename = function(p_bInfo = false)
{
    let astrTags = this.TA_tagFetchAll();
    // Only process if there are tags to choose from
    if (astrTags.length > 0)
    {
        let strFrom = Prompt.TA_selectPrompt("Tag Rename", "Select tag to be renamed", astrTags, []);
        
        if (typeof strFrom != "undefined")
        {
            if (strFrom.length > 0)
            {
                let strTo = Prompt.TA_singleTextFieldPrompt("Tag Rename", "Enter the new name for the tag", "New Tag Name", strFrom[0]);
                this.TA_tagRename(strFrom[0], strTo, p_bInfo);
            }
        }
    }
    else
    {
        app.displayInfoMessage("No tags available for renaming.")
    }
    return;
}


// Prompts the user for a tag to rename from a list of recent tags, and what to rename it to.
Draft.prototype.TA_selectRecentTagRename = function(p_bInfo = false)
{
    let astrRecentTags = Draft.recentTags();
    // Only process if there are tags to choose from
    if (astrRecentTags.length > 0)
    {
        let strFrom = Prompt.TA_selectPrompt("Tag Rename", "Select tag to be renamed", astrRecentTags, []);
        
        if (typeof strFrom != "undefined")
        {
            if (strFrom.length > 0)
            {
                let strTo = TA_singleTextFieldPrompt("Tag Rename", "Enter the new name for the tag", "New Tag Name", strFrom[0]);
                this.TA_tagRename(strFrom[0], strTo, p_bInfo);
            }
        }
    }
    else
    {
        app.displayInfoMessage("No recent tags available for renaming.")
    }
    return;
}

// Prompts the user for a tag to delete and deletes it. 
Draft.prototype.TA_selectAnyTagDelete = function(p_bInfo = false)
{
    let astrTags = this.TA_tagFetchAll();
    // Only process if there are tags to choose from
    if (astrTags.length > 0)
    {
        let strTag = Prompt.TA_selectPrompt("Tag Delete", "Select tag to be deleted", astrTags, []);
        
        if (typeof strTag != "undefined")
        {
            if (strTag.length > 0) this.TA_tagDelete(strTag[0], p_bInfo);
        }
    }
    else
    {
        app.displayInfoMessage("No tags available for deletion.")
    }
    return;
}

// Prompts the user for a tag to delete from a list of recent tags, and then deletes it.
Draft.prototype.TA_selectRecentTagDelete = function(p_bInfo = false)
{
    let astrRecentTags = Draft.recentTags();
    // Only process if there are tags to choose from
    if (astrRecentTags.length > 0)
    {
        let strTag = Prompt.TA_selectPrompt("Tag Delete", "Select tag to be deleted", astrRecentTags, []);
        
        if (typeof strTag != "undefined")
        {
            if (strTag.length > 0) this.TA_tagDelete(strTag[0], p_bInfo);
        }
    }
    else
    {
        app.displayInfoMessage("No recent tags available for deletion.")
    }
    return;
}


// Removes lines from the draft containing no content or whitespace only.
Draft.prototype.TA_removeBlankLines = function()
{
    this.content = this.content.TA_removeBlankLines();
    this.update();
    return;
}


// Removes lines from the draft containing no content.
Draft.prototype.TA_removeEmptyLines = function()
{
    this.content = this.content.TA_removeEmptyLines();
    this.update();
    return;
}


// Removes leading whitespace from the lines of a draft.
Draft.prototype.TA_removeWhitespaceLeading = function()
{
    this.content = this.content.TA_removeWhitespaceLeading();
    this.update();
    return;
}

// Removes trailing whitespace from the lines of a draft.
Draft.prototype.TA_removeWhitespaceTrailing = function()
{
    this.content = this.content.TA_removeWhitespaceTrailing();
    this.update();
    return;
}	


// Removes leading and trailing whitespace from the lines of a draft.
Draft.prototype.TA_removeWhitespaceLeadingTrailing = function()
{
    this.content = this.content.TA_removeWhitespaceLeadingTrailing();
    this.update();
    return;
}


// Removes leading spaces and tabs from the lines of a draft.
Draft.prototype.TA_removeSpaceTabLeading = function()
{
    this.content = this.content.TA_removeSpaceTabLeading();
    this.update();
    return;
}


// Removes trailing spaces and tabs from the lines of a draft.
Draft.prototype.TA_removeSpaceTabTrailing = function()
{
    this.content = this.content.TA_removeSpaceTabTrailing();
    this.update();
    return;
}


// Removes leading and trailing spaces and tabs from the lines of a draft.
Draft.prototype.TA_removeSpaceTabLeadingTrailing = function()
{
    this.content = this.content.TA_removeSpaceTabLeadingTrailing();
    this.update();
    return;
}


// Deduplicates lines in the draft, retaining the original order of first occurrence.
Draft.prototype.TA_deduplicateLines = function()
{
    this.content = this.content.TA_deduplicateLines();
    this.update();
    return;
}

// Adds a set of tags defined as an array of strings to the draft.
Draft.prototype.TA_tagAdd = function(p_astrTags)
{
    for (let intCounter = 0; intCounter < p_astrTags.length; intCounter++)
    {
        this.addTag(p_astrTags[intCounter]);
    }
    this.update();
    return;
}


// Adds a set of tags defined as a string of tag names to the draft.
Draft.prototype.TA_tagAddCSV = function(p_strTags)
{
    let astrTags = p_strTags.split(",");
    for (let intCounter = 0; intCounter < astrTags.length; intCounter++)
    {
        this.addTag(astrTags[intCounter]);
    }
    this.update();
    return;
}


// Removes a set of tags defined as an array of strings from the draft.
Draft.prototype.TA_tagRemove = function(p_astrTags)
{
    for (let intCounter = 0; intCounter < p_astrTags.length; intCounter++)
    {
        this.removeTag(p_astrTags[intCounter]);
    }
    this.update();
    return;
}

// Removes all tags from the draft.
Draft.prototype.TA_tagRemoveAll = function()
{
    let astrTags = this.tags;
    for (let intCounter = 0; intCounter < astrTags.length; intCounter++)
    {
        this.removeTag(astrTags[intCounter]);
    }
    this.update();
    return;
}


// Splits a draft based on the position of the selection in the currently loaded draft.
Draft.prototype.TA_split = function(p_bLoadSecondDraft = false)
{
    let firstDraftContent = this.content.substring(0, this.selectionStart);
    let secondDraftContent = this.content.substring(this.selectionStart);

    //We only need to take action and split if the contents for both would be non-zero in length
    if (firstDraftContent.length > 0 && secondDraftContent.length > 0)
    {
        //Set the content of the first draft
        this.content = firstDraftContent;
        //Ensure the first draft is up to date
        this.update();

        //Create an set the content of the second draft
        let secondDraft = Draft.create();
        secondDraft.content = secondDraftContent;
        
        //Add the tags from current draft to the new draft
        if (this.tags.length > 0) secondDraft.TA_tagAdd(this.tags);
        
        //Ensure the second draft is up to date
        secondDraft.update();
        
        //If the parameter is set to, load the second draft
        if (p_bLoadSecondDraft)
        {
            editor.load(secondDraft);
            app.displayInfoMessage("Second, split draft, created and loaded.");
        }
        else app.displayInfoMessage("Second, split draft, created in background.");
        editor.activate();
    }
    return;
}


// Quick share the content of a draft as a file
Draft.prototype.TA_shareFile = function(p_strFileExtension = "txt", p_bAsHTML = false)
{
    
    //Set the default base file name
    let strDefaultName = this.processTemplate("[[safe_title]]").substring(0,250);
    if(strDefaultName.length < 1) strDefaultName = this.processTemplate("[[date| %Y-%m-%d-%H.%M.%S]]");
    
    //Set any addtional info for the file extension
    let strAdditional = "";
    if (p_strFileExtension.length > 0) strAdditional = " (*" + p_strFileExtension + ")";
    
    let strFileName = Prompt.TA_singleTextFieldPrompt("File Name" + strAdditional, "Enter the file name", "", strDefaultName);

    if (strFileName.length > 0)
    {
        if (strFileName.endsWith(p_strFileExtension) == false || p_strFileExtension.length == 0)
        {
            //If th efile extension passed in doesn't have a period, add one before we add the rest of the extension
            if (!p_strFileExtension.startsWith(".")) strFileName += ".";
            strFileName += p_strFileExtension;
            let strContent = this.content;
            if (p_bAsHTML) strContent = this.processTemplate("%%[[draft]]%%");
            Share.shareAsFile(strFileName, strContent);
        }
    }
    return;
}


// Quick share the content of a draft as a file based on the syntax of the draft.
Draft.prototype.TA_shareFileBasedOnSyntax = function()
{
    //All standard Drafts syntaxes are non-HTML, so we can default that in until such time as 
    //drafts supports HTML formats as standard.
    //The file extension is read from the data in the library settings.
    draft.TA_shareFile(tadLib["draft_" + draft.languageGrammar.toLowerCase().replace(" ", "_")].extension, false);
    return;
}



// Sets a draft up with a set of prescribed tags and syntax based on some properties from the library settings.
Draft.prototype.TA_draftSetUp = function(p_astrTags, p_strSyntax, p_bRemoveTags = false)
{
    if (p_bRemoveTags) this.TA_tagRemoveAll();
    this.TA_tagAdd(p_astrTags);
    this.languageGrammar = p_strSyntax;
    this.update();
    editor.load(this);
    return;
}


// Sets a draft up with a set of prescribed tags and syntax based on some properties from the library settings.
Draft.prototype.TA_draftSetUp_Discourse = function()
{
    return this.TA_draftSetUp(tadLib.draft_discourse.tags, tadLib.draft_discourse.syntax, false);
}


//Sets an empty draft as a Discourse draft, otherwise prompts to convert the existing one or create a new one.
Draft.prototype.TA_draftNew_Discourse = function()
{
    if (this.content.length == 0)
    {
        //Empty draft, let's make it a Discourse one
        this.TA_draftSetUp_Discourse();
    }
    else
    {
        //Check whether to create a new draft or convert the existing one
        const buttonYes = "Current Draft";
        const buttonNo = "New Draft";
        let promptDiscourse = Prompt.create();
        promptDiscourse.title = "Create Discourse Draft Using";
        promptDiscourse.addButton(buttonYes);
        promptDiscourse.addButton(buttonNo);
        if (promptDiscourse.show())
        {
            if (promptDiscourse.buttonPressed == buttonYes)
            {
                //Convert existing
                this.TA_draftSetUp_Discourse();
            }
            else
            {
                //Create a new draft andd convert that
                let newDraft = Draft.create();
                newDraft.TA_draftSetUp_Discourse();
                editor.load(newDraft);
            }
            //If we set-up a draft, make sure we reactivate the editor ready to start typing
            editor.activate();
        }
    }
    return;
}

//Display a list of recent drafts and retrieve a specific piece of data from it.
Draft.prototype.TA_getRecentDraftData = function(p_intSelectLimit = 10, p_strTemplateTag)
{
    //Initialise
    let intLimit = 0
    let astrDrafts = [];

    //Get all drafts ordered by modified date, in reverse chronological order.
    let allDrafts = Draft.query("", "all", [], [], "modified", true);

    //Set the draft limit variable to be equal to the number of draftd we intend to work with
    if (allDrafts.length < p_intSelectLimit) intLimit = allDrafts.length;
    else intLimit = p_intSelectLimit;

    //For each of the drafts create an array entry with the modified date stamp (without the year, followed by the title
    //this is then truncated to 
    for (let intCounter = 0; intCounter < intLimit; intCounter++)
    {
        let strTemp = allDrafts[intCounter].processTemplate("[[modified|%m-%d-%H.%M.%S]]") + ": " + allDrafts[intCounter].title;
        strTemp = strTemp.substring(0, tadLib.buttonLabelTruncation - 1);
        astrDrafts.push(strTemp);
    }

    //Prompt the user to select one of the recent drafts from the list we'vew created
    let strSelected = Prompt.TA_promptButtonArray("Recent Drafts", "Select a draft to work with", astrDrafts);

    //If we got a selection, let's do something with it.
    if (strSelected != "")
    {
        //Initialise
        let intSelected = -1;

        //First of all we'll figure out which entry was selected.
        for (let intCounter = 0; intCounter < intLimit; intCounter++)
        {
            if (astrDrafts[intCounter] == strSelected) intSelected = intCounter;
        }
        
        //Initialise the template from a copy of the input template
        let strTemplateTag = "";
        if(p_strTemplateTag != undefined) strTemplateTag = p_strTemplateTag;

        //If the input template is empty, let's prompt for what to return
        if (strTemplateTag.length == 0)
        {
            //No template specified, have the user select from a few standard ones
            let astrTemplateTags = ["draft", "title", "body", "tags", "uuid", "draft_open_url", "created", "modified", "longitude", "latitude", "≪ ad hoc ≫"];
            
            strTemplateTag = Prompt.TA_promptButtonArray("Template Tags", "Select a template tag", astrTemplateTags);
            
            if (strTemplateTag == "≪ ad hoc ≫")
            {
                strTemplateTag = Prompt.TA_singleTextFieldPrompt("Template Tag", "Specify the template tag you would like to evaluate:", "Tag(s)", "")
            }
        }
        
        //If we now have content in the template for the data to retrieve, retrieve them.
        if (strTemplateTag != "")
        {
            //If the template tag(s) are not wrapped in double square brackets, add them in
            if (strTemplateTag.substring(0, 2) != "[[") strTemplateTag = "[[" + strTemplateTag;
            if (strTemplateTag.substring(strTemplateTag.length - 2) != "]]") strTemplateTag = strTemplateTag + "]]";
            
            //Process the template tag string
            return allDrafts[intSelected].processTemplate(strTemplateTag);
        }
    }
    return "";
}

//Dumps a set of draft related data into JSON and a Drafts template tag.
//Stores JSON string as a template tag against the draft

Draft.prototype.TA_infoDump = function(p_strJSONDraftDataTagPrefix = "DATAID", p_boolReturnJSON = false)
{
    //Generate the unique tag ID
    let dataid = p_strJSONDraftDataTagPrefix + "_" + this.uuid;

    // Build the JSON dump of current draft info
    let jsonDraftData = {
        "dataid" : dataid,
        "uuid": this.uuid,
        "content": this.content,
        "title": this.title,
        "languageGrammar": this.languageGrammar,
        "selectionStart": this.selectionStart,
        "selectionLength": this.selectionLength,
        "tags": this.tags,
        "isArchived": this.isArchived,
        "isTrashed": this.isTrashed,
        "isFlagged": this.isFlagged,
        "createdAt": this.createdAt,
        "createdLatitude": this.createdLatitude,
        "createdLongitude": this.createdLongitude,
        "modifiedAt": this.modifiedAt,
        "modifiedLatitude": this.modifiedLatitude,
        "modifiedLongitude": this.modifiedLongitude,
        "numberofversions": this.versions.length,
        "permalink": this.permalink,
        "selection": this.processTemplate("[[selection]]"),
        "safe_title": this.processTemplate("[[safe_title]]"),
        "selection_only": this.processTemplate("[[selection_only]]"),
        "body": this.processTemplate("[[body]]"),
        "last_line": this.processTemplate("[[line|-1]]")
    }

    //For ease of access, we'll also dump the draft data into a tag of name dataid
    //This function can therefore be called several times, and the draft data for several other drafts
    //can be held against a unique ID custom tag, derivable from the original draft's UUID.
    this.setTemplateTag(dataid, JSON.stringify(jsonDraftData));

    //Based on the second parameter either return a JSON string or an object.
    if (p_boolReturnJSON) return jsonDraftData;
    else return JSON.stringify(jsonDraftData);
}


//Display a count of Drafts with various breakdowns in a preview window.
Draft.prototype.TA_draftCountSummary = function()
{
    //Initialise the basic draft counts
	let jsonCounts = {};
	jsonCounts.inbox = this.TA_draftCountSummaryFolder('inbox');
	jsonCounts.inbox_flagged = this.TA_draftCountSummaryFlagged('inbox');
	jsonCounts.inbox_notflagged = jsonCounts.inbox - jsonCounts.inbox_flagged;
	jsonCounts.archive = this.TA_draftCountSummaryFolder('archive');
	jsonCounts.archive_flagged = this.TA_draftCountSummaryFlagged('archive');
	jsonCounts.archive_notflagged = jsonCounts.archive - jsonCounts.archive_flagged;
	jsonCounts.trash = this.TA_draftCountSummaryFolder('trash');
	jsonCounts.trash_flagged = this.TA_draftCountSummaryFlagged('trash');
	jsonCounts.trash_notflagged = jsonCounts.trash - jsonCounts.trash_flagged;
	jsonCounts.all = this.TA_draftCountSummaryFolder('all');
	jsonCounts.all_flagged = this.TA_draftCountSummaryFlagged('all');
    jsonCounts.all_notflagged = jsonCounts.all - jsonCounts.all_flagged;
    
    //Set a variable so we can reference this draft in forEach functions
    let draftX = this;

    //Initialise the draft tag counts
    let arrAllTags = this.TA_tagFetchAll();
    arrAllTagsInfo = [];
    arrAllTags.forEach(function(strTag)
    {
        arrAllTagsInfo.push(draftX.TA_draftCountSummaryTag(strTag));
    });
    jsonCounts.tagHTML = arrAllTagsInfo.join("\n");

    //Initialise the workspace tag counts
    let awsAll = Workspace.getAll();
    let astrWorkspaceInfo = [];
    awsAll.forEach(function(wsNext)
	{
        astrWorkspaceInfo.push(draftX.TA_draftCountSummaryWorkspace(wsNext));
    });
    jsonCounts.workspaceHTML = astrWorkspaceInfo.join("\n");

    //Generate the output page HTML
    let strHTML = `<html>
    <body>
    <style>
    body {font-family:"Open Sans",sans-serif;line-height: 1.25;}
    table {border: 1px solid #ccc;border-collapse: collapse;margin: 0;padding: 0;width: 100%;table-layout: fixed;}
    table caption {font-size: 1.5em;margin: .5em 0 .75em;}
    table tr {background-color: #f8f8f8;border: 1px solid #ddd;padding: .35em;}
    table th,table td {padding: .625em;text-align: center;}
    table th {font-size: .85em;letter-spacing: .1em;text-transform: uppercase;}
    @media screen and (max-width: 600px) {
        table {border: 0;}
        table caption {font-size: 1.3em;}
        table thead {border: none;clip: rect(0 0 0 0);height: 1px;margin: -1px;overflow: hidden;padding: 0;position: absolute;width: 1px;}
        table tr {border-bottom: 3px solid #ddd;display: block;margin-bottom: .625em;}
        table td {border-bottom: 1px solid #ddd;display: block;font-size: .8em;text-align: right;}
        table td::before {content: attr(data-label);float: left;font-weight: bold;text-transform: uppercase;}
        table td:last-child {border-bottom: 0;}
    }
    </style>
    <p>
    <strong>Generated: </strong>${this.processTemplate("[[date|%Y-%m-%d-%H.%M.%S]]")}
    </p>

    <h1>Drafts: Basic</h1>
    <table>
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th>Flagged</th>
                <th>Not Flagged</th>
                <th>TOTAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>Inbox</th>
                <td>${jsonCounts.inbox_flagged}</td>
                <td>${jsonCounts.inbox_notflagged}</td>
                <td>${jsonCounts.inbox}</td>
            </tr>
            <tr>
                <th>Archive</th>
                <td>${jsonCounts.archive_flagged}</td>
                <td>${jsonCounts.archive_notflagged}</td>
                <td>${jsonCounts.archive}</td>
            </tr>
            <tr>
                <th>Trash</th>
                <td>${jsonCounts.trash_flagged}</td>
                <td>${jsonCounts.trash_notflagged}</td>
                <td>${jsonCounts.trash}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th>TOTAL</th>
                <td>${jsonCounts.all_flagged}</td>
                <td>${jsonCounts.all_notflagged}</td>
                <td>${jsonCounts.all}</td>
            </tr>
        </tfoot>
    </table>

    <p>&nbsp;</p>

    <h1>Drafts: Tags</h1>
    <table>
    <thead>
        <tr>
            <th>&nbsp;</th>
            <th>Flagged</th>
            <th>Not Flagged</th>
            <th>Inbox</th>
            <th>Archive</th>
            <th>TOTAL</th>
            <th><em>Trashed</em></th>
        </tr>
    </thead>
    <tbody>
       ${jsonCounts.tagHTML}
    </tbody>
    </table>

    <p>&nbsp;</p>

    <h1>Drafts: Worksapces</h1>
    <table>
    <thead>
        <tr>
            <th>&nbsp;</th>
            <th>Flagged</th>
            <th>Not Flagged</th>
            <th>Inbox</th>
            <th>Archive</th>
            <th>TOTAL</th>
            <th><em>Trashed</em></th>
        </tr>
    </thead>
    <tbody>
       ${jsonCounts.workspaceHTML}
    </tbody>
    </table>
    </body></html>`

    //Display the output page in a preview window
    let hpCount = HTMLPreview.create();
    hpCount.show(strHTML);
    return;
}

//Counts and returns the number of drafts (flagged & unflagged) in a folder.
Draft.prototype.TA_draftCountSummaryFolder = function(p_strFolder)
{
	return Draft.query('', p_strFolder, [], [], 'created', false, false).length;
}

//Counts and returns the number of flagged drafts in a folder.
Draft.prototype.TA_draftCountSummaryFlagged = function(p_strFolder)
{
    //Retrieve all of the drafts in the folder.
    let arrDrafts = Draft.query('', p_strFolder, [], [], 'created', false, false);
    
    //Check each draft and add it to the count if the isFlagged property is set.
	let intCount = 0;
	arrDrafts.forEach(function(draftCurrent)
	{
		if (draftCurrent.isFlagged) intCount++;
	});
	return intCount;
}

// Counts and returns the number of draft occurrences with a particular tag that matches a folder or attribute.
Draft.prototype.TA_draftCountSummaryTag = function(p_strTag)
{
    //Retrieve all of the drafts with the tag.
    let arrDrafts = Draft.query('', 'all', [p_strTag], [], 'created', false, false);
    
    //Check each draft and add it to the correct count
    let intCountFlagged = 0;
    let intCountNotFlagged = 0;
	arrDrafts.forEach(function(draftCurrent)
	{
        if (draftCurrent.isFlagged) intCountFlagged++;
        else intCountNotFlagged++;
    });
    
    let arrDraftsInbox = Draft.query('', 'inbox', [p_strTag], [], 'created', false, false);
    let arrDraftsArchive = Draft.query('', 'archive', [p_strTag], [], 'created', false, false);
    let arrDraftsTrash = Draft.query('', 'trash', [p_strTag], [], 'created', false, false);

	return `<tr>
                <th>${p_strTag}</th>
                <td>${intCountFlagged}</td>
                <td>${intCountNotFlagged}</td>
                <td>${arrDraftsInbox.length}</td>
                <td>${arrDraftsArchive.length}</td>
                <td>${arrDrafts.length}</td>
                <td><em>${arrDraftsTrash.length}</em></td>
            </tr>`;
}

// Create a new draft based on the URL on the clipboard.
Draft.prototype.TA_draftNewFromClipboardURL = function()
{
    let objHTTP = HTTP.create();
    return this.TA_draftNew(objHTTP.TA_getURLContentClipboard());
}

m


// Create a new draft based on a template stored in a template file
Draft.prototype.TA_draftNewFromTemplateFile = function()
{
	//Get the list of templates
    app.displayInfoMessage("Enumerating file templates - please wait...")
    let fmCloud = FileManager.createCloud();
	let arrFiles = fmCloud.listContents("/Library/Templates/");

	//Build a prompt of drafts that are set-up as templates.
	let promptTemplate = Prompt.create();
	promptTemplate.title = "Select Template";
	arrFiles.forEach(function(file) 
	{
		promptTemplate.addButton(file.replace("Library/Templates/", ""));
	});

	//If the user chooses a template
	if (promptTemplate.show())
	{
		//Create a new draft
		let newDraft = Draft.create();

		//Copy across the content
		newDraft.content = fmCloud.readString("/Library/Templates/" + promptTemplate.buttonPressed)

		//Update and load the template
		newDraft.update();
		editor.load(newDraft);
        editor.activate();
        return newDraft;
    }
    return;
}


// Create a new draft based on a template stored in a template draft.
Draft.prototype.TA_draftNewFromTemplateDraft = function()
{
	//Build a list of drafts that are set-up as templates.
	let promptTemplate = Prompt.create();
	promptTemplate.title = "Select Template";
	let drafts = Draft.query("", tadLib.templateFilter, tadLib.templateTags);
	drafts.forEach(function(draft) 
	{
		promptTemplate.addButton(draft.title);
	});

	//If the user chooses a template
	if (promptTemplate.show())
	{
		//Create a new draft
		let newDraft = Draft.create();

		//Copy across the content
		draftTemplate = Draft.query(promptTemplate.buttonPressed, tadLib.templateFilter, tadLib.templateTags)[0];
		newDraft.content = draftTemplate.content;

		//Copy across all of the tags
		draftTemplate.tags.forEach(function(tag)
		{
			newDraft.addTag(tag);
		});
		
		//Remove any tags used to define it as a template
		tadLib.templateTags.forEach(function(tag)
		{
			newDraft.removeTag(tag);
		});

		//Set the syntax type
		newDraft.languageGrammar = draftTemplate.languageGrammar;

		//Update and load the template
		newDraft.update();
		editor.load(newDraft);
        editor.activate();
        return newDraft;
    }
    return;
}

// Preview of Markdown content that includes numerous reference expansions.
Draft.prototype.TA_explodedMDPreview = function(p_bConvertCheckboxes = false)
{
    //Transclude basic wiki-links
    let strPreviewContent = tadMisc.TA_transcludeWikiLinks(this.content);

    //Include tags, specifically template tags
	strPreviewContent = this.processTemplate(strPreviewContent);

    //Convert the Markdown to HTML
	let mmd = MultiMarkdown.create();
	mmd.format = "html";
    let strHTML = mmd.render(strPreviewContent);
    
    //Process the HTML to include any local base 64 image information
    strHTML = tadMisc.TA_addEncodedImages(strHTML);

    //Optionally convert Drafts style checkboxes to HTML
    if(p_bConvertCheckboxes)
    {
        strHTML = strHTML.replaceAll("[ ]", '<input type="checkbox">');
        strHTML = strHTML.replaceAll("[x]", '<input type="checkbox" checked>');
        strHTML = strHTML.replaceAll("[X]", '<input type="checkbox" checked>');
    }

    //Set a preview tag to be used in a preview step.
	draft.setTemplateTag("preview", strHTML);
    return;
}

// Return an array of Markdown Headings in a draft.
Draft.prototype.TA_getMDHeadings = function()
{
    //Match headings links - lines starts with at least one hash, perhaps 
    //followed by a space (strict Markdown always is, but just in case), 
    //followed by some other characters.
	return this.content.match(/^#+ ?.*/gm);
}

// Counts and returns the number of draft occurrences with a particular workspace that matches a folder or attribute.
Draft.prototype.TA_draftCountSummaryWorkspace = function(p_wsInfo)
{
    //Get the stats for the workspace
    let intCountAll = p_wsInfo.query("all").length;
    let intCountInbox = p_wsInfo.query("inbox").length;
    let intCountArchive = p_wsInfo.query("archive").length;
    let intCountTrash = p_wsInfo.query("trash").length;
    let intCountFlagged = p_wsInfo.query("flagged").length
    let intCountNotFlagged = intCountAll - intCountFlagged;

    //Retun the stats in a tabular format
	return `<tr>
                <th>${p_wsInfo.name}</th>
                <td>${intCountFlagged}</td>
                <td>${intCountNotFlagged}</td>
                <td>${intCountInbox}</td>
                <td>${intCountArchive}</td>
                <td>${intCountAll}</td>
                <td><em>${intCountTrash}</em></td>
            </tr>`;
}


// Loads a draft into the editor, and activates the editor.
editor.TA_loadAc = function(p_draftToLoad)
{
    if (p_draftToLoad == null)
    {
        return null;
    }
    else
    {
        // Not a null draft, so load it, activate and return it
        editor.load(p_draftToLoad);
        editor.activate();
        return p_draftToLoad;
    }
}


// Load a recent draft
editor.TA_loadRecentDraft = function(p_dtStart, p_dtEnd, p_strTitle, p_astrTagsInclude, p_astrTagsExclude)
{
	//Get all drafts (excluding trashed) that match the tags
	let listDrafts = [];
    let allDrafts = Draft.query("", "all", p_astrTagsInclude, p_astrTagsExclude, "created", true);
    
    //For every draft, check the creation date
	allDrafts.forEach(function(checkDraft)
	{
		if ((checkDraft.createdAt >= p_dtStart) && (checkDraft.createdAt <= p_dtEnd)) listDrafts.push(checkDraft);
	});

    //Build an array of Draft titles
	let listDraftsCol1 = [];
	listDrafts.forEach(function(checkDraft)
	{
		listDraftsCol1.push(checkDraft.title);
	});

    //Only show the list if there is something to show
    let bRet;
    switch (listDraftsCol1.length)
    {
        case 0:
            app.TA_displayWarningMessage("No matching drafts found in specified time frame.");
            bRet = false;
            break;

        case 1:
            app.TA_displayInfoMessage("Single match of draft identified. Loading...");
            this.load(listDrafts[0]);
            bRet = true;
            break;
        
        default:
            //Build a selection list
            let pr = Prompt.create();
            pr.addLabel("selLabel", "Select a draft by title to load it.", {"textSize" : "body"})
            pr.addPicker("selMain", "", [listDraftsCol1], [0]);
            pr.addLabel("info", "NOTE: Drafts are shown newest to oldest.", {"textSize" : "caption"});
            pr.title = p_strTitle;
            pr.addButton("OK", "btnOK");
            pr.isCancellable = true;

            //If the user selects a draft, load it
            if (pr.show())
            {
                this.load(listDrafts[pr.fieldValues["selMain"]]);
                bRet = true;
            }
            else bRet = false;
            break;
            
    }
    return bRet;
}


// Load a draft created today.
editor.TA_loadRecentDraftToday = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today(), Date.today().at("23:59:59"), "Created Today", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created yesterday.
editor.TA_loadRecentDraftYesterday = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.parse("yesterday"), Date.parse("yesterday").at("23:59:59"), "Created Yesterday", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created today or yesterday.
editor.TA_loadRecentDraftTodayOrYesterday = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.parse("yesterday"), Date.today().at("23:59:59"), "Created Today/Yesterday", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created in the last 7 calendar days, including today.
editor.TA_loadRecentDraftThisWeek = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today().add(-6).day(), Date.today().at("23:59:59"), "Created This Week", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created in the last 8 to 14 calendar days inclusive.
editor.TA_loadRecentDraftLastWeek = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today().add(-13).day().at("00:00:00"), Date.today().add(-7).day().at("23:59:59"), "Created Last Week", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created in the last 14 calendar days, including today.
editor.TA_loadRecentDraftLast2Weeks = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today().add(-13).day().at("00:00:00"), Date.today().at("23:59:59"), "Created Last 2 Weeks", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created in the last 28 calendar days, including today.
editor.TA_loadRecentDraftLast4Weeks = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today().add(-27).day().at("00:00:00"), Date.today().at("23:59:59"), "Created Last 4 Weeks", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created in the current calendar month.
editor.TA_loadRecentDraftThisMonth = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today().moveToFirstDayOfMonth().at("00:00:00"), Date.today().at("23:59:59"), "Created This Month", p_astrTagsInclude, p_astrTagsExclude);
}


// Load a draft created in the previous calendar month.
editor.TA_loadRecentDraftLastMonth = function(p_astrTagsInclude, p_astrTagsExclude)
{
	this.TA_loadRecentDraft(Date.today().add(-1).month().moveToFirstDayOfMonth().at("00:00:00"), Date.today().add(-1).month().moveToLastDayOfMonth().at("23:59:59"), "Created Last Month", p_astrTagsInclude, p_astrTagsExclude);
}


// Load the previously loaded draft.
editor.TA_toggleLoadPreviousLoad = function()
{
    this.load(this.recentDrafts[1]);
    return;
}


// Load the last modified draft.
editor.TA_toggleLoadPreviousModified = function()
{
    let arrAllDrafts = Draft.query("", "all", [], [], "modified", true, false);
	if (arrAllDrafts.length > 1)
	{
		if (draft.uuid == arrAllDrafts[0].uuid)
		{
			this.load(arrAllDrafts[1]);
		}
		else
		{
			this.load(arrAllDrafts[0]);
		}
	}
	else
	{
		app.displayErrorMessage("Sorry, not enough available drafts to use this action");
    }
    return;
}


// Add content to the start of the editor and retain the current selection.
editor.TA_prefixDraftEditorContent = function(p_strPrefix)
{
	//Get initial selection
	let rngInitial = this.getSelectedRange();
	//Update the content
	this.setText(p_strPrefix + this.getText());
	//Translate the selection along the content
	this.setSelectedRange(rngInitial[0] + p_strPrefix.length, rngInitial[1]);
	//We want to jump straight back to the editor having focus
    this.activate();
    return;
}


// Add content to the end of the editor and retain the current selection.
editor.TA_suffixDraftEditorContent = function(p_strSuffix)
{
	//Get initial selection
	let rngInitial = this.getSelectedRange();
	//Update the content
	this.setText(this.getText() + p_strSuffix);
	//Translate the selection along the content
	this.setSelectedRange(rngInitial[0], rngInitial[1]);
	//We want to jump straight back to the editor having focus
    this.activate();
    return;
}


// Replace one text string with another in the editor and retain the equivalent current selection.
editor.TA_replaceDraftEditorContent = function(p_strFind, p_strReplace)
{
    //Get initial selection
    let rngInitial = this.getSelectedRange();

    //Work out initial strings that comprise the content
    let allText = this.getText();
    let strFore = allText.slice(0, rngInitial[0]);
    let strSelection = allText.slice(rngInitial[0], rngInitial[0] + rngInitial[1]);
    let strAft = allText.slice(rngInitial[0] + rngInitial[1], allText.length);

    //Carry out the replacements across all three
    strFore = strFore.replaceAll(p_strFind, p_strReplace);
    strSelection = strSelection.replaceAll(p_strFind, p_strReplace);
    strAft = strAft.replaceAll(p_strFind, p_strReplace);

    //Update the content
    this.setText(strFore + strSelection + strAft);
    
    //Translate the selection along the content
	this.setSelectedRange(strFore.length, strSelection.length);

    //We want to jump straight back to the editor having focus
	this.activate();
    return;
}


// Remove a text string in the editor and retain the equivalent current selection.
editor.TA_removeDraftEditorContent = function(p_strRemove)
{
    this.TA_replaceDraftEditorContent(p_strRemove, "");
    return;
}


// Select all content in the editor.
editor.TA_setSelectedRangeAll = function()
{
	this.setSelectedRange(0, this.getText().length);
    this.activate();
    return;
}


// Jump to the start of the content in the editor.
editor.TA_setSelectedRangeStart = function()
{
	this.setSelectedRange(0, 0);
    this.activate();
    return;
}


// Jump to the end of the content in the editor.
editor.TA_setSelectedRangeEnd = function()
{
	this.setSelectedRange(this.getText().length, 0);
    this.activate();
    return;
}


// Insert text at the current selection and then move the cursor to the end of the inserted text.
editor.TA_insertTextPosAtEnd = function(p_strText)
{
	this.setSelectedText(p_strText);

	//Jump to the end of the redefined selection
	this.setSelectedRange(editor.getSelectedRange()[0] + editor.getSelectedRange()[1], 0);
	this.activate();
}


// Create and load a new draft
editor.TA_loadNewDraftWithContent = function(p_strContent)
{
    //This is here just in case it makes more sense to someone to call this from the
    //editor rather than a draft. The function involves both really.
	return draft.TA_draftNew(p_strContent);
}


// Move the cursor to the end of the current selection.
editor.TA_cursorToSelectionEnd = function()
{
    this.setSelectedRange(this.getSelectedRange()[0] + this.getSelectedRange()[1], 0);
    this.activate();
    return this.getSelectedRange()[0];
}


// Move the cursor to the start of the current selection.
editor.TA_cursorToSelectionStart = function()
{
    this.setSelectedRange(this.getSelectedRange()[0], 0);
    this.activate();
    return this.getSelectedRange()[0];
}


// Deletes the next character (to the right).
editor.TA_deleteNextChar = function()
{
    //Get's the current text selection, extends it by one and then replaces that selection
    //with what was previously selected.
    strInitial = this.getSelectedText();
	this.setSelectedRange(this.getSelectedRange()[0], this.getSelectedRange()[1] + 1)
	this.setSelectedText(strInitial);
	this.activate();
    return;
}


// Select the current line.
editor.TA_selectLine = function(p_bExcludeNewLine = true)
{
    let intLess = 0;
    if (this.getTextInRange(this.getSelectedLineRange()[0], this.getSelectedLineRange()[1]).endsWith("\n") && p_bExcludeNewLine) intLess = 1;
    this.setSelectedRange(this.getSelectedLineRange()[0], this.getSelectedLineRange()[1] - intLess);

    this.activate();
    return;
}


// Select the current line based on the start of any selection.
editor.TA_selectLineFore = function()
{
    this.TA_cursorToSelectionStart();
    this.TA_selectLine();
    return;
}


// Select the current line based on the end of any selection.
editor.TA_selectLineAft = function()
{
    this.TA_cursorToSelectionEnd();
    this.TA_selectLine();
    return;
}


// Deletes the current line.
editor.TA_deleteCurrentLine = function()
{
	this.TA_selectLine();
    this.setSelectedText("");
    return;
}

// Deletes the current line based on the start of any selection.
editor.TA_deleteCurrentLineFore = function()
{
	this.TA_selectLineFore();
    this.setSelectedText("");
    return;
}

// Deletes the current line based on the end of any selection.
editor.TA_deleteCurrentLineAft = function()
{
	this.TA_selectLineAft();
    this.setSelectedText("");
    return;
}


//Sort selected lines alphabetically.
editor.TA_sortSelectionAlphabetic = function()
{
	let lineRange = this.getSelectedLineRange();
	let astrLines = this.getTextInRange(lineRange[0], lineRange[1]).split('\n');
	astrLines.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    this.setTextInRange(lineRange[0], lineRange[1], astrLines.join('\n'));
    this.activate();
    return astrLines.join('\n');
}


//Sort selected lines reverse alphabetically.
editor.TA_sortSelectionReverseAlphabetic = function()
{
	let lineRange = this.getSelectedLineRange();
	let astrLines = this.getTextInRange(lineRange[0], lineRange[1]).split('\n');
	astrLines.sort((b, a) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    this.setTextInRange(lineRange[0], lineRange[1], astrLines.join('\n'));
    this.activate();
    return astrLines.join('\n');
}


// Select all content in the editor.
editor.TA_selectAll = function()
{
    this.setSelectedRange(0, this.getText().length);
    return this.getText();
}


// Sort all editor lines alphabetically.
editor.TA_sortAllAlphabetic = function()
{
	this.TA_selectAll();
    return this.TA_sortSelectionAlphabetic();
}


// Sort all editor lines reverse alphabetically.
editor.TA_sortAllReverseAlphabetic = function()
{
	this.TA_selectAll();
    return this.TA_sortSelectionReverseAlphabetic();

}


// Sort selected lines based on numeric rather than alphabetic sorting.
editor.TA_sortSelectionNumeric = function()
{
	let lineRange = this.getSelectedLineRange();
	let astrLines = this.getTextInRange(lineRange[0], lineRange[1]).split('\n');
	astrLines.sort(function(a, b){return a - b});
    this.setTextInRange(lineRange[0], lineRange[1], astrLines.join('\n'));
    return astrLines.join('\n');
}


// Sort selected lines based on reverse numeric rather than reverse alphabetic sorting.
editor.TA_sortSelectionReverseNumeric = function()
{
	let lineRange = this.getSelectedLineRange();
	let astrLines = this.getTextInRange(lineRange[0], lineRange[1]).split('\n');
	astrLines.sort(function(a, b){return b - a});
    this.setTextInRange(lineRange[0], lineRange[1], astrLines.join('\n'));
    return astrLines.join('\n');
}


// Sort all editor lines based on numeric value rather than alphabetic sorting.
editor.TA_sortAllNumeric = function()
{
	this.TA_selectAll();
	return this.TA_sortSelectionNumeric();
}


//Sort all editor lines based on reverse numeric value rather than reverse alphabetic sorting.
editor.TA_sortAllReverseNumeric = function()
{
	this.TA_selectAll();
	return this.TA_sortSelectionReverseNumeric();
}


// Sort the selection of lines into a random order.
editor.TA_sortSelectionRandom = function()
{
	let lineRange = this.getSelectedLineRange();
	let astrLines = this.getTextInRange(lineRange[0], lineRange[1]).split('\n');
	astrLines.sort(function(a, b){return 0.5 - Math.random()});
    this.setTextInRange(lineRange[0], lineRange[1], astrLines.join('\n'));
    return astrLines.join('\n');
}

// Sort all editor lines into a random order.
editor.TA_sortAllRandom = function()
{
	this.TA_selectAll();
	return this.TA_sortSelectionRandom();
}


// Get the content of the line(s) the cursor/current selection is on.
editor.TA_getCurrentLine = function()
{
    return strLine = this.getTextInRange(this.getSelectedLineRange()[0], this.getSelectedLineRange()[1]);
}


// Get the content of the line(s) the cursor/current selection is on, excluding any trailing new line.
editor.TA_getCurrentLineNoNewLine = function()
{
    return this.TA_getCurrentLine().TA_stripFinalNewLine();
}


// Replace the content of the line(s) the cursor/current selection is on, accommodating any trailing new line.
editor.TA_replaceCurrentLine = function(p_strReplacementText)
{
    //Select the line(s) we want to replace
    this.TA_selectLine();

    //If we have a newline on the selected line(s), but not on the replacement text, we'll append one
    const NEWLINE = "\n";
    if(this.getSelectedText().endsWith(NEWLINE) && !(p_strReplacementText.endsWith(NEWLINE))) p_strReplacementText += NEWLINE;

    //Set the replacement text
    this.setSelectedText(p_strReplacementText)
    return p_strReplacementText;
}

// Duplicate the current line(s) the cursor/current selection is on a specified number of times.
editor.TA_duplicateCurrentLineNTimes = function(p_intTimes)
{
    //Get the current line selection with no new lines
    let strInitial = this.TA_getCurrentLineNoNewLine();
    let astrFinal = [];

    //Build an array of duplicates. Entry 0 will be the original line(s).
    for (let intCounter = 0; intCounter <= p_intTimes; intCounter++)
    {
        astrFinal.push(strInitial);
    }

    //Replace the current line(s) with the joined version of the replacement array.
    this.TA_replaceCurrentLine(astrFinal.join("\n"));

    //Jump to the end of the current selection.
    this.TA_cursorToSelectionEnd();

    return;
}

// Duplicate the current line(s) the cursor/current selection is on.
editor.TA_duplicateCurrentLine = function()
{
    return this.TA_duplicateCurrentLineNTimes(1);
}

// Duplicate the current line(s) the cursor/current selection is on, a prompted number of times.
editor.TA_repeatDuplicateCurrentLineAsk = function(p_intDefault = tadLib.duplicateLinesDefault)
{
	//Capture the number of times to duplicate a line
	let promptDupeLines = Prompt.create();
	promptDupeLines.title = "Number of duplicate lines to create";
	promptDupeLines.addTextField("numRepetitions", "Lines", p_intDefault, ["numberPad"]);
	promptDupeLines.addButton("OK");
	if (promptDupeLines.show())
	{
		//If the prompt wasn't cancelled use the captured value for repeatedly duplicating a line
		if (promptDupeLines.buttonPressed == "OK")
		{
		    this.TA_duplicateCurrentLineNTimes(promptDupeLines.fieldValues["numRepetitions"]);
		}
	}
}

// Create and load a new empty draft.
editor.TA_loadEmpty = function()
{
    let draftNew = Draft.create()
    this.load(draftNew);
    return draftNew;
}


// Load the last created draft.
editor.TA_loadLastCreatedDraft = function()
{
	let allDrafts = Draft.query("", "all", []);
	allDrafts = allDrafts.sort(function(draftA, draftB)
	{
		return draftB.createdAt - draftA.createdAt
	});
    this.load(allDrafts[0]);
    return allDrafts[0];
}


// Load the last modified draft.
editor.TA_loadLastModifiedDraft = function()
{
	let allDrafts = Draft.query("", "all", []);
	allDrafts = allDrafts.sort(function(draftA, draftB)
	{
		return draftB.modifiedAt - draftA.modifiedAt
	});
	this.load(allDrafts[0]);
}

// Load the last created draft (inclusive of trashed drafts).
editor.TA_loadLastCreatedDraftIncludeTrashed = function()
{
	//Combine the all and the trashed drafts
	let allDrafts = Draft.query("", "all", []);
	let trashDrafts = Draft.query("", "trash", []);
	allDrafts = allDrafts.concat(trashDrafts);
	
	//Sort the drafts
	allDrafts = allDrafts.sort(function(draftA, draftB)
	{
		return draftB.createdAt - draftA.createdAt
	});
	
	//Load the latest draft
	this.load(allDrafts[0]);
}


// Load the last modified draft (inclusive of trashed drafts).
editor.TA_loadLastModifiedDraftIncludeTrashed = function()
{
	//Combine the all and the trashed drafts
	let allDrafts = Draft.query("", "all", []);
	let trashDrafts = Draft.query("", "trash", []);
	allDrafts = allDrafts.concat(trashDrafts);
	
	//Sort the drafts
	allDrafts = allDrafts.sort(function(draftA, draftB)
	{
		return draftB.modifiedAt - draftA.modifiedAt
	});
	
	//Load the latest draft
	this.load(allDrafts[0]);
}


// Inserts a yyyy-MM-dd-hh.mm.ss format timestamp at the current editor position.
editor.TA_insertTimestampyyyyMMddhhmmss = function()
{
    this.TA_insertTextPosAtEnd(TA_getTimestampyyyyMMddhhmmss());
    return;
}


// Inserts a markdown link with the page title as the text using a URL on the clipboard.
editor.TA_mdTitleLinkFromClipboardURL = function()
{
	this.setSelectedText(TA_mdTitleLinkFromURL(app.getClipboard()));
    this.TA_cursorToSelectionEnd();
    return;
}


// Inserts a markdown link with the page title as the text using a URL selected in the editor.
editor.TA_mdTitleLinkFromSelectedURL = function()
{
	this.setSelectedText(this.TA_mdTitleLinkFromURL(this.getSelectedText()));
    this.TA_cursorToSelectionEnd();
    return;
}


// Insert a discourse hide details section around the currently selectced text.
editor.TA_discourseHideDetails = function()
{
	//Capture a title for the expansion section
	strExpansionTitle = Prompt.TA_singleTextFieldPrompt("Discourse Hide Details Generator", "Enter the title for the expansion section", "Select to reveal...", "");

	//Insert the content and place the cursor at the end
	if (strExpansionTitle != "")
	{
		this.TA_insertTextPosAtEnd("[details=\"" + strExpansionTitle + "\"\]\n" + this.getSelectedText() + "\n[\/details]");
    }
    
    return;
}

//Inserts a markdown link with the page title as the text using a URL on the clipboard.
editor.TA_mdTitleLinkFromClipboardURL = function()
{
    let objHTTP = HTTP.create();
	this.setSelectedText(objHTTP.TA_mdTitleLinkFromURL(app.getClipboard()));
    this.TA_cursorToSelectionEnd();
    return;
}


//Inserts a markdown link with the pge title as the text using a URL selected in the editor
editor.TA_mdTitleLinkFromSelectedURL = function()
{
    let objHTTP = HTTP.create();
	this.setSelectedText(objHTTP.TA_mdTitleLinkFromURL(this.getSelectedText()));
    this.TA_cursorToSelectionEnd();
    return;
}


// Inserts a script fence block marker around the currently selected text.
editor.TA_mdScriptSelectedText = function(p_strCodeType = "")
{
    //When inserting, add an extra newline
	this.setSelectedText(this.getSelectedText().TA_mdCodeBlock(p_strCodeType) + "\n");
    this.TA_cursorToSelectionEnd();
    return;
}


// Move the cursor to the start of the line for the start of the current selection.
editor.TA_cursorToLineStart = function()
{
    this.setSelectedRange(this.getSelectedLineRange()[0], 0);
    this.activate();
    return this.getSelectedRange()[0];
}


// Move the cursor to the end of the line for the end of the current selection.
editor.TA_cursorToLineEnd = function()
{
    //Jump to the end of the selection, and then get our line range
    this.TA_cursorToSelectionEnd();
    let lineRange = this.getSelectedLineRange();

    //If the start of the line is also the end of the line, do nothing.
    //We're probably on the very last, and very empty line of the draft.
    //We risk jumping back to the previous line if we don't account for this 
    //unusual scenarioscenario.
    if (lineRange[0] != (lineRange[0] + lineRange[1]))
    {
        //Jump to the end of the line, but not past the final new line character
        //otherwise we actually jump to the next line.
        this.setSelectedRange(lineRange[0] + lineRange[1] - 1, 0);
    }
   
    //Activate the editor and return the new position.
    this.activate();
    return this.getSelectedRange()[0];
}


// Move the cursor to the start of the draft.
editor.TA_cursorToStart = function()
{
    this.setSelectedRange(0, 0);
    //Activate the editor and return the new position.
    this.activate();
    return 0;
}


// Move the cursor to the end of the draft.
editor.TA_cursorToEnd = function()
{
    this.setSelectedRange(this.getText().length, 0);
    //Activate the editor and return the new position.
    this.activate();
    return this.getSelectedRange()[0];
}


// Share selection or Draft (if no selection) as raw text.
editor.TA_shareText = function()
{
    //Initialise
    let strShare = "";

    //Determine what to share
	if(editor.getSelectedText().length > 0) Share.shareAsText(editor.getSelectedText());
    else Share.shareAsText(draft.content);
    
    //Share and return
    Share.shareAsText(strShare);
    this.activate();
    return strShare;
}


//Share selection or Draft (if no selection) converted to HTML from Markdown.
editor.TA_shareHTML = function()
{
    //Initialise
    let strShare = "";

    //Determine what to share
	if(editor.getSelectedText().length > 0) strShare = draft.processTemplate("%%[[selection]]%%");
    else strShare = draft.processTemplate("%%[[draft]]%%");

    //Share and return
    Share.shareAsText(strShare);
    this.activate();
    return strShare;
}


// Set Drafts to a persistent/focussed reading mode.
editor.TA_readingModeEnable = function()
{
    //This next line is correct. We can indeed enable reading mode by feeding
    //every parameter as `true` to the function to disable reading mode.
    this.TA_readingModeDisable(true, true, true);
    return;
}


// Set Drafts to not be in a persistent/focussed reading mode.
editor.TA_readingModeDisable = function(p_bLME = false, p_bFME = false, p_bSID = false)
{
    this.linkModeEnabled = p_bLME;
    this.focusModeEnabled = p_bFME;
    app.isIdleDisabled = p_bSID;
    return;
}


// Toggle Drafts to/from a persistent/focussed reading mode.
editor.TA_readingModeToggle = function(p_bLME = false, p_bFME = false, p_bSID = false)
{
    //Check all reading mode properties are true and if it is disable, otherwise enable
    if (this.TA_readingModeIsEnabled()) this.TA_readingModeDisable(p_bLME, p_bFME, p_bSID);
    else this.TA_readingModeEnable();
    return this.TA_readingModeIsEnabled();
}


// Determine if Drafts is in a persistent/focussed reading mode.
editor.TA_readingModeIsEnabled = function()
{
    //Reading mode only enabled if all three properties are true.
    return (this.linkModeEnabled && this.focusModeEnabled && app.isIdleDisabled);
}


// Show the current Boolean states of the properties used to set reading mode.
editor.TA_readingModeShowProperties = function()
{
    let strReadingMode = "READING MODE PROPERTIES: ("
    if (this.TA_readingModeIsEnabled()) strReadingMode += "Enabled)\n\n";
    else strReadingMode += "Disabled)\n\n";

    strReadingMode += "• Link Mode Enabled = ";
    if (this.linkModeEnabled) strReadingMode += "Enabled\n";
    else strReadingMode += "Disabled\n";

    strReadingMode += "• Link Mode Enabled = ";
    if (this.focusModeEnabled) strReadingMode += "Enabled\n";
    else strReadingMode += "Disabled\n";

    strReadingMode += "• Idle Disabled = ";
    if (app.isIdleDisabled) strReadingMode += "Enabled\n";
    else strReadingMode += "Disabled\n";

    strReadingMode += "\n All properties must be true to constitute reading mode being enabled."
    app.TA_msgInfo(strReadingMode);
    return this.TA_readingModeIsEnabled();
}


// Selects a paragraph of text.
editor.TA_selectParagraph = function()
{
	//Define what the delimiter is for a paragraph
	//Note that the start and end of a draft are implicitly catered for as delimiters of a paragraph
	const PARA_DELIM = "\n\n";

	//Get the current cursor position
	let [intPos, intSelLen] = this.getSelectedRange();

	//Everything before the cursor position
	let strBefore = draft.content.substring(0, intPos);

	//Everything after the cursor position
	let strAfter = draft.content.substring(intPos, draft.content.length);

	//Find the start of the paragraph
	let intParaStart = strBefore.lastIndexOf(PARA_DELIM);
	if (intParaStart == -1) intParaStart = 0;
	else intParaStart = intParaStart + PARA_DELIM.length;

	//Find the end of the paragraph
	let intParaEnd = strAfter.indexOf(PARA_DELIM);
	if (intParaEnd == -1) intParaEnd = strAfter.length;
	intParaEnd = intPos + intParaEnd;

	//Set the selection and ensure the editor is activated, and return the selection
    this.setSelectedRange(intParaStart, intParaEnd - intParaStart);
    this.activate();
    return this.getSelectedText();
}


// With a cursor selection in a paragraph, prefix and append a set of characters to the paragraph.
editor.TA_wrapParagraph = function(p_strPrefix, p_strSuffix)
{
	//Get the current cursor position
	let [intPos, intSelLen] = editor.getSelectedRange();
	//Select the paragraph
	this.TA_selectParagraph();
	//Replace the selected text with the prefix and suffix
	this.setSelectedText(p_strPrefix + this.getSelectedText() + p_strSuffix);
	//Set the cursor back in position
    this.setSelectedRange(intPos + p_strPrefix.length, intSelLen);
    return;
}


// With a cursor selection in a paragraph, prefix and append a single set of characters to the paragraph.
editor.TA_delimitParagraph = function(p_strDelimit)
{
    this.TA_wrapParagraph(p_strDelimit, p_strDelimit);
    return;
}


// With a cursor selection in place, prefix and append a set of characters to the line selection.
editor.TA_wrapLines = function(p_strPrefix, p_strSuffix)
{
	//Get the current cursor position
	let [intPos, intSelLen] = editor.getSelectedRange();
	//Select the line(s)
	this.TA_selectLine();
	//Replace the selected text with the prefix and suffix
	this.setSelectedText(p_strPrefix + this.getSelectedText() + p_strSuffix);
	//Set the cursor back in position
    this.setSelectedRange(intPos + p_strPrefix.length, intSelLen);
    return;
}


// With a cursor selection in place, prefix and append a single set of characters to the line selection.
editor.TA_delimitLines = function(p_strDelimit)
{
    this.TA_wrapLines(p_strDelimit, p_strDelimit);
    return;
}


// With a cursor selection in place, prefix and append a set of characters to the selection.
editor.TA_wrapSelection = function(p_strPrefix, p_strSuffix)
{
	//Get the current cursor position
	let [intPos, intSelLen] = editor.getSelectedRange();
	//Replace the selected text with the prefix and suffix
	this.setSelectedText(p_strPrefix + this.getSelectedText() + p_strSuffix);
	//Set the cursor back in position
    this.setSelectedRange(intPos + p_strPrefix.length, intSelLen);
    return;
}


// With a cursor selection in place, prefix and append a single set of characters to the selection.
editor.TA_delimitSelection = function(p_strDelimit)
{
    this.TA_wrapSelection(p_strDelimit, p_strDelimit);
    return;
}


// With a cursor selection in a paragraph, move the cursor to the start of the paragraph.
editor.TA_cursorToParagraphStart = function()
{
    this.TA_selectParagraph();
    return this.TA_cursorToSelectionStart();
}


// With a cursor selection in a paragraph, move the cursor to the end of the paragraph.
editor.TA_cursorToParagraphEnd = function()
{
    this.TA_selectParagraph();
    return this.TA_cursorToSelectionEnd();
}

// Move the cursor to the start of the next line (below).
editor.TA_cursorToStartOfNextLine = function()
{
    this.setSelectedRange(this.getSelectedLineRange()[0] + this.getSelectedLineRange()[1], 0);
    this.activate();
    return this.getSelectedRange()[0];
}


// Move the cursor to the end of the previous line (above).
editor.TA_cursorToEndOfPreviousLine = function()
{
    this.setSelectedRange(this.getSelectedLineRange()[0] - 1, 0);
    this.activate();
    return this.getSelectedRange()[0];
    
}


// Extend the character selection left by the specified number of characters.
editor.TA_selectionExtendLeft = function(p_intCharacters = 1)
{
    this.setSelectedRange(this.getSelectedRange()[0] - p_intCharacters, this.getSelectedRange()[1] + p_intCharacters);
    return this.getSelectedRange();
}


// Extend the character selection right by the specified number of characters.
editor.TA_selectionExtendRight = function(p_intCharacters = 1)
{
    this.setSelectedRange(this.getSelectedRange()[0], this.getSelectedRange()[1] + p_intCharacters);
    return this.getSelectedRange();
}


// Move the cursor left by one or more characters.
editor.TA_cursorToLeft = function(p_intCharacters = 1)
{
    this.setSelectedRange(this.getSelectedRange()[0] - p_intCharacters, 0);
    editor.activate();
    return this.getSelectedRange();
}


// Move the cursor right by one or more characters.
editor.TA_cursorToRight = function(p_intCharacters = 1)
{
    this.setSelectedRange(this.getSelectedRange()[0] + p_intCharacters, 0);
    editor.activate();
    return this.getSelectedRange();
}


// Extend the current text selection to encompass a word.
editor.TA_selectionExtendWord = function()
{
	//Get the current cursor position
	let [intPos, intSelLen] = this.getSelectedRange();

	//Derive the new start position
	let strBefore = draft.content.substring(0, intPos);
    let intNewStart;
	if(strBefore.TA_regexLastIndexOf(/[^a-zA-Z0-9_\-\–\—]/, intPos) == "undefined") intNewStart = 0;
	else intNewStart = strBefore.TA_regexLastIndexOf(/[^a-zA-Z0-9_\-\–\—]/, intPos) + 1;

	//Derive the new end position
	let strAfter = draft.content.substring(intPos, draft.content.length);
    let intNewEnd;
    
	//If we find a terminating character, use it, otherwise go to the end.
	if(strAfter.TA_regexIndexOf(/[^a-zA-Z0-9_\-\–\—]/, 0) == -1) intNewEnd = draft.content.length;
	else intNewEnd = strAfter.TA_regexIndexOf(/[^a-zA-Z0-9_\-\–\—]/, 0) + strBefore.length;
	
	//Set the selection
    this.setSelectedRange(intNewStart, intNewEnd - intNewStart);
    editor.activate();
    return this.getSelectedRange();
}


// Display information about how many characters are currently selected.
editor.TA_selectionDisplayCharacterCount = function()
{
    let strInfo = "Selection contains " + this.getSelectedText().length + " character".TA_pluralise(this.getSelectedText().length) + ".\n" + this.getSelectedText().TA_lengthExclLineBreaks() + " ignoring new lines.";
    app.TA_msgInfo(strInfo);
    return strInfo;
}


// Display information about how many words are currently selected.
editor.TA_selectionDisplayWordCount = function()
{
    let intCount = this.getSelectedText().TA_countWords();
    let strInfo = "Selection contains " + intCount + " word".TA_pluralise(intCount) + ".";
    app.TA_msgInfo(strInfo);
    return strInfo;
}


// Display information about how many lines are currently selected.
editor.TA_selectionDisplayLineCount = function()
{
    let intCount = this.getSelectedText().TA_countLines();
    let strInfo = "Selection contains " + intCount + " line".TA_pluralise(intCount) + ".";
    app.TA_msgInfo(strInfo);
    return strInfo;
}


// Display character, word and line count information about current selection.
editor.TA_selectionDisplayCount = function()
{
    //Character info
    let strInfo = "Selection contains " + this.getSelectedText().length + " character".TA_pluralise(this.getSelectedText().length);
    strInfo += ", " + this.getSelectedText().TA_lengthExclLineBreaks() + " ignoring new lines."

    //Word info
    let intCount = this.getSelectedText().TA_countWords();
    strInfo += "\n\nSelection contains " + intCount + " word".TA_pluralise(intCount) + "."

    //Line info
    intCount = this.getSelectedText().TA_countLines();
    strInfo += "\n\nSelection contains " + intCount + " line".TA_pluralise(intCount) + ".";

    //Display and return
    app.TA_msgInfo(strInfo);
    return strInfo;
}


// Move the cursor to the start of the next sentence.
editor.TA_cursorToStartOfNextSentence = function()
{
    //Get the curret cursor position based on the end of the current selection
    let intCurrentPosition = editor.getSelectedRange()[0] + editor.getSelectedRange()[1];

    //Find the next sentence end
    let intNextPeriodDSpace = editor.getText().indexOf(".  ",intCurrentPosition);
    let intNextPeriodSSpace = editor.getText().indexOf(". ",intCurrentPosition);
    let intNextLineEnd = editor.getText().indexOf("\n", intCurrentPosition);

    //Initialise
    let intNewPosition = editor.getText().length;

    //Incrementally check positions
    if(intNextPeriodSSpace > 0 && intNextPeriodSSpace <= intNewPosition) intNewPosition = intNextPeriodSSpace + 2;
    if(intNextPeriodDSpace > 0 && intNextPeriodDSpace <= (intNewPosition + 1)) intNewPosition = intNextPeriodDSpace + 3;
    if(intNextLineEnd > 0 && intNextLineEnd < intNewPosition) intNewPosition = intNextLineEnd + 1;

    //Set new position
    editor.setSelectedRange(intNewPosition, 0);

    //Activate and return
    editor.activate();
    return this.getSelectedRange()[0];
}

// Move the cursor to the start of the next sentence.
editor.TA_cursorToStartOfPreviousSentence = function()
{
    //Get the curret cursor position based on the end of the current selection
    let intCurrentPosition = editor.getSelectedRange()[0] + editor.getSelectedRange()[1];

    //Finding the start of the current sentence
    let strPrior = editor.getText().slice(0, intCurrentPosition);
    let intPrevPeriodDSpace = strPrior.lastIndexOf(".  ",intCurrentPosition);
    let intPrevPeriodSSpace = strPrior.lastIndexOf(". ",intCurrentPosition);
    let intPrevLineEnd = strPrior.lastIndexOf("\n", intCurrentPosition);

    //Initialise
    let intNewPosition = 0;

    //Incrementally check positions and put as just before the end of the last sentence
    if(intPrevPeriodSSpace > 0 && intPrevPeriodSSpace >= intNewPosition) intNewPosition = intPrevPeriodSSpace -1;
    if(intPrevPeriodDSpace > 0 && intPrevPeriodDSpace >= (intNewPosition + 1)) intNewPosition = intPrevPeriodDSpace -1;
    if(intPrevLineEnd > 0 && intPrevLineEnd > intNewPosition) intNewPosition = intPrevLineEnd -1;

    //Now if we repeat, we should get to the start of the current sentence,
    //which is the start of the previous sentence relative to where we started
    strPrior = editor.getText().slice(0, intNewPosition);
    intPrevPeriodDSpace = strPrior.lastIndexOf(".  ",intNewPosition);
    intPrevPeriodSSpace = strPrior.lastIndexOf(". ",intNewPosition);
    intPrevLineEnd = strPrior.lastIndexOf("\n", intNewPosition);

    //Initialise (again)
    intNewPosition = 0;
    
    //Incrementally check positions and adjust forward
    if(intPrevPeriodSSpace > 0 && intPrevPeriodSSpace >= intNewPosition) intNewPosition = intPrevPeriodSSpace + 2;
    if(intPrevPeriodDSpace > 0 && intPrevPeriodDSpace >= (intNewPosition + 1)) intNewPosition = intPrevPeriodDSpace + 3;
    if(intPrevLineEnd > 0 && intPrevLineEnd > intNewPosition) intNewPosition = intPrevLineEnd + 1;
    
    //Set new position
    editor.setSelectedRange(intNewPosition, 0);

    //Activate and return
    editor.activate();
    return this.getSelectedRange()[0];
}

// Move the cursor to the start of the current sentence.
editor.TA_cursorToStartOfCurrentSentence = function()
{
    //Get the curret cursor position based on the end of the current selection
    let intCurrentPosition = editor.getSelectedRange()[0] + editor.getSelectedRange()[1];

    //Finding the start of the current sentence
    let strPrior = editor.getText().slice(0, intCurrentPosition);
    let intPrevPeriodDSpace = strPrior.lastIndexOf(".  ",intCurrentPosition);
    let intPrevPeriodSSpace = strPrior.lastIndexOf(". ",intCurrentPosition);
    let intPrevLineEnd = strPrior.lastIndexOf("\n", intCurrentPosition);

    //Initialise
    let intNewPosition = 0;

    //Incrementally check positions and put as just before the end of the last sentence
    if(intPrevPeriodSSpace > 0 && intPrevPeriodSSpace >= intNewPosition) intNewPosition = intPrevPeriodSSpace +2;
    if(intPrevPeriodDSpace > 0 && intPrevPeriodDSpace >= (intNewPosition + 1)) intNewPosition = intPrevPeriodDSpace +3;
    if(intPrevLineEnd > 0 && intPrevLineEnd > intNewPosition) intNewPosition = intPrevLineEnd +1;
    
    //Set new position
    editor.setSelectedRange(intNewPosition, 0);

    //Activate and return
    editor.activate();
    return this.getSelectedRange()[0];
}


// Reduce the character selection to the left by the specified number of characters.
editor.TA_selectionReduceLeft = function(p_intCharacters = 1)
{
    return this.TA_selectionExtendLeft(-1 * p_intCharacters);
}


// Reduce the character selection to the right by the specified number of characters.
editor.TA_selectionReduceRight = function(p_intCharacters = 1)
{
    return this.TA_selectionExtendRight(-1 * p_intCharacters);
}


// Prefix the selected lines with the specified prefix string.
editor.TA_selectedLinesPrefix = function(p_strPrefix)
{
    return this.TA_selectedLinesDelimit(p_strPrefix, "");
}

// Suffix the selected lines with the specified prefix string.
editor.TA_selectedLinesSuffix = function(p_strSuffix)
{
    return this.TA_selectedLinesDelimit("", p_strSuffix);
}


// Wrap the selected lines at both ends with a specified string.
editor.TA_selectedLinesWrap = function(p_strWrapper)
{
    return this.TA_selectedLinesDelimit(p_strWrapper, p_strWrapper);
}


// Delimit the selected lines with the specified prefix and suffix strings.
editor.TA_selectedLinesDelimit = function(p_strPrefix, p_strSuffix)
{
    //Fully select the lines to update
    this.TA_selectLine();
    let strText = this.getSelectedText();
    //Add in the prefixes
    strText = p_strPrefix + strText.replaceAll("\n", p_strSuffix + "\n" + p_strPrefix) + p_strSuffix;
    //Update the text in the editor and jump to the end of the selection
    this.setSelectedText(strText);
    this.TA_cursorToSelectionEnd();
    return this.getSelectedRange();
}


// Prefix all lines in the loaded draft with a string of characters.
editor.TA_prefixAllLines = function(p_strPrefix)
{
	let astrText = this.getText().split("\n");
	astrText.forEach(function(p_strLine, p_intIndex)
	{
		this[p_intIndex] = p_strPrefix + p_strLine;
	}, astrText);
    this.setText(astrText.join("\n"));
    return;
}


// Prefix all non-blank lines in the loaded draft with a string of characters.
editor.TA_prefixAllNonBlankLines = function(p_strPrefix)
{
	let astrText = this.getText().split("\n");
	astrText.forEach(function(p_strLine, p_intIndex)
	{
		if(this[p_intIndex].trim() != "") this[p_intIndex] = p_strPrefix + p_strLine;
	}, astrText);
    this.setText(astrText.join("\n"));
    return;
}


// Based on the current selection, returns the full text of the lines the selection partially or full includes.
editor.TA_getCurrentLinesContent = function()
{
	return this.getTextInRange(this.getSelectedLineRange()[0], this.getSelectedLineRange()[1]);
}

// Based on the current selection, sets the full text of the lines the selection partially or full includes.
editor.TA_setCurrentLinesContent = function(p_strNewText)
{
	return this.setTextInRange(this.getSelectedLineRange()[0],this.getSelectedLineRange()[1],p_strNewText);
}


// Incrementally add Markdown header markers up to level 6 then wrap to level 0 for start line of current selection.
editor.TA_lineMDHeader = function()
{
    //Get the details of the initial selection
    let [intPosStart, intPosLen] = this.getSelectedRange();
    //Get the current lines selection text
    let strLine = this.TA_getCurrentLinesContent();
    //Get the hashes from the start of this
	let strHashes = strLine.match(/^(#*)/)[0];
	
    //Check for a space separator
	let strSeparator = "";
    if (strLine.startsWith(strHashes + " ")) strSeparator = " ";
    
    //We'll start the newline by stripping away any existing hashes *and* any separator we might have
	let strNewLine = strLine.slice((strHashes + strSeparator).length);

    //Let's build the new hashes. It will be one more than before unless that would take us to 7.
    //In that case we'll stick on the 'default' of none.
	let strNewHashes = "";
	if (strHashes.length < 6) strNewHashes = "#" + strHashes + " ";

    //Set the content and set the text selection back to what it started as, then reactivate the editor.
	this.TA_setCurrentLinesContent(strNewHashes + strNewLine);
	this.setSelectedRange(intPosStart + strNewHashes.length - strHashes.length - strSeparator.length, intPosLen);
    this.activate();
    return;
}


// Set Markdown header marker level for start line of current selection.
editor.TA_lineMDHeaderN = function(p_intLevel)
{
    //Get the details of the initial selection
    let [intPosStart, intPosLen] = this.getSelectedRange();
    //Get the current lines selection text
    let strLine = this.TA_getCurrentLinesContent();
    //Get the hashes from the start of this
	let strHashes = strLine.match(/^(#*)/)[0];
	
    //Check for a space separator
	let strSeparator = "";
    if (strLine.startsWith(strHashes + " ")) strSeparator = " ";
    
    //We'll start the newline by stripping away any existing hashes *and* any separator we might have
	let strNewLine = strLine.slice((strHashes + strSeparator).length);

    //Let's build the new hashes to be added based on the value passed in.
    let strNewHashes = "#".repeat(p_intLevel);
    if (p_intLevel > 0) strNewHashes += " ";

    //Set the content and set the text selection back to what it started as, then reactivate the editor.
	this.TA_setCurrentLinesContent(strNewHashes + strNewLine);
	this.setSelectedRange(intPosStart + strNewHashes.length - strHashes.length - strSeparator.length, intPosLen);
    this.activate();
    return;
}


// Returns the current line(s).
editor.TA_getLine = function()
{
    return this.getTextInRange(this.getSelectedLineRange()[0],this.getSelectedLineRange()[1]);
}


// Copies the current line(s) to the clipboard.
editor.TA_copyLine = function()
{
    return app.setClipboard(this.TA_getLine());
}


// Dictate to the current selection, prefixed with standard time stamp.
editor.TA_dictateDateTimeStampLogEntry = function()
{
    return tadMisc.TA_logToDraftCurrent("", "cursor", ":\n", "", "%Y-%m-%d-%H.%M.%S")
}


// Append text to the end of the current draft being edited.
editor.TA_append = function(p_strText, p_strSeparator = "\n")
{
    let [intStart, intLength] = this.getSelectedRange();
    this.setText(this.getText() + p_strSeparator + p_strText);
    this.setSelectedRange(intStart, intLength);
    this.activate();
    return;
}


// Prefix text to the start of the current draft being edited.
editor.TA_prepend = function(p_strText, p_strSeparator = "\n")
{
    //Chose prepend here rather than prefix so as to match it to the equivalent draft function.

    let [intStart, intLength] = this.getSelectedRange();
    let strInsert = p_strText + p_strSeparator;
    this.setText(strInsert + this.getText());
    this.setSelectedRange(intStart + strInsert.length, intLength);
    this.activate();
    return;
}


// Prepend text to every word in the current selection.
editor.TA_selectionPrependWords = function(p_strPrefix)
{
	this.setSelectedText(this.getSelectedText().TA_prependWords(p_strPrefix));
    this.activate();
    return;
}


// Append text to every word in the current selection.
editor.TA_selectionAppendWords = function(p_strSuffix)
{
	this.setSelectedText(this.getSelectedText().TA_appendWords(p_strSuffix));
    this.activate();
    return;
}


// Prefix and suffix text strings to every word in the current selection.
editor.TA_selectionWrapWords = function(p_strPrefix, p_strSuffix)
{
	this.setSelectedText(this.getSelectedText().TA_wrapWords(p_strPrefix, p_strSuffix));
    return;
}


// Wrap text to the start and end of every word in the current selection.
editor.TA_selectionDelimitWords = function(p_strDelimiter)
{
	this.setSelectedText(this.getSelectedText().TA_delimitWords(p_strDelimiter));
    return;
}

// Deletes a file.
FileManager.prototype.TA_delete = function(p_strFilePath)
{
    return this.moveItem(p_strFilePath, null, true);
}

// Snapshot a file by duplicating it in the same folder, but prefixing the file name with a time stamp.
FileManager.prototype.TA_snapshot = function(p_strFilePath)
{
    return this.copyItem(p_strFilePath, p_strFilePath.TA_folderPathFromPath() + tadMisc.TA_getTimestampyyyyMMddhhmmss() + " " + p_strFilePath.TA_fileNameFromPath(), true);
}

// Fetches content from a URL.
HTTP.prototype.TA_getContent = function(p_strURL)
{
	let objResponse = this.request({"url": p_strURL, "method": "GET"});

	if (objResponse.success)
	{
		return objResponse.responseText;
	}
	else
	{
		console.log(objResponse.statusCode);
        console.log(objResponse.error);
        return "";
	}
}

// Fetches example syntax content from @sylumer's GitHub repo of https://github.com/sylumer/drafts_syntax_tests.
HTTP.prototype.TA_getSyntaxTest = function(p_strSyntax)
{
    const REPO_LINK = "https://raw.githubusercontent.com/sylumer/drafts_syntax_tests/master/";
    const EXTENSION = "txt";
    return this.TA_getContent(REPO_LINK + encodeURI(p_strSyntax) + "." + EXTENSION);
}


// Checks a string is a valid URL.
HTTP.prototype.TA_isValidURL = function(p_strURL)
{
	let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name OR
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // IP address (IPv4)
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port (optional) and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	if (pattern.test(p_strURL)) return true;
	else
	{
		console.TA_logError("Invalid URL = " + p_strURL);
		return false;
	}
}


// Fetches content from a URL on the clipboard.
HTTP.prototype.TA_getURLContentClipboard = function()
{
	if (this.TA_isValidURL(app.getClipboard()))
	{
		return this.TA_getContent(app.getClipboard());
	}
	return;
}


// Returns a web page title for a specified URL.
HTTP.prototype.TA_getTitleFromURL = function(p_strURL)
{
	let objResponse = this.request({"url": p_strURL, "method": "GET"});

	if (objResponse.success)
	{
		return objResponse.responseText.TA_htmlTitle();
	}
	else
	{
		//Log the URL and result
		console.log("Attempting to fetch title for URL: " + p_strURL);
		console.log(objResponse.statusCode);
		console.log(objResponse.error);
	}
}

// Returns a markdown link for a page, utilising it's title as the link text, for a specified URL.
HTTP.prototype.TA_mdTitleLinkFromURL = function(p_strURL)
{
	return "[" + this.TA_getTitleFromURL(p_strURL) + "](" + p_strURL + ")";
}

// Save the content of a URL to an iCloud file.
HTTP.prototype.TA_getContentToiCloudFile = function(p_strURL, p_strFilePath)
{
	let fmCloud = FileManager.createCloud();
	return fmCloud.writeString(p_strFilePath, this.TA_getContent(p_strURL));
}


// Save the content of a URL to a local file.
HTTP.prototype.TA_getContentToLocalFile = function(p_strURL, p_strFilePath)
{
	let fmLocal = FileManager.createLocal();
	return fmLocal.writeString(p_strFilePath, this.TA_getContent(p_strURL));
}

// Save a JavaScript library file to the Drafts library scripts folder.
HTTP.prototype.TA_downloadLibrary = function(p_strURL, p_strLibraryName)
{
	let strLibraryName = p_strLibraryName;
	if (strLibraryName.endsWith(".js") == false) strLibraryName = strLibraryName + ".js";
	return this.TA_getContentToiCloudFile(p_strURL, "/Library/Scripts/" + strLibraryName);
}

// Save a copy of the minified beautifier library file to the Drafts library scripts folder.
HTTP.prototype.TA_updateBeautifierLibrary = function()
{
	return this.TA_downloadLibrary(tadLib.beautifierURL, tadLib.beautifierLibName);
}

// Save a copy of the TADpoLe library file to the Drafts library scripts folder.
HTTP.prototype.TA_updateTadpoleLibrary = function()
{
	return this.TA_downloadLibrary(tadLib.libSourceURL, tadLib.libName);
}

// Get the external IP address of the device.
HTTP.prototype.TA_getExternalIP = function()
{
	return this.TA_getContent("https://api.ipify.org/?format=text");
}


// Get a random integer from an online service.
HTTP.prototype.TA_randomInteger = function(p_intMin, p_intMax)
{
	let objResult = JSON.parse(this.TA_getContent(`https://csrng.net/csrng/csrng.php?min=${p_intMin}&max=${p_intMax}`));
	return Number(objResult[0].random);
}


// Fetch a random The Simpson's quote from the thesimpsonsquoteapi.glitch.me.
HTTP.prototype.TA_quoteSimpsons = function()
{
	let strURL = "https://thesimpsonsquoteapi.glitch.me/quotes";
	let jsonQuote = JSON.parse(this.TA_getContent(strURL));
	return (jsonQuote[0].quote + " [" + jsonQuote[0].character + "]");
}

class TadInfo
{
    constructor()
    {
        this;
    }

    // Returns basic version information on the app and device.
    TA_versionInfo(p_strMarker = "")
    {
        let strOutput = p_strMarker + "Drafts Version:" + p_strMarker + " " + app.version + "\n";
        strOutput += p_strMarker + "OS Version:" + p_strMarker + " " + device.systemName + " " + device.systemVersion + "\n";
        strOutput += p_strMarker + "Device:" + p_strMarker + " " + device.model + "\n";
        strOutput += p_strMarker + "Pro Licensed:" + p_strMarker + " ";
        if (app.isPro) strOutput += "Yes";
        else strOutput += "No";
        return strOutput;
    }

     // Puts basic version information on the app and device in template tags.
     TA_versionTemplateTags()
     {
        draft.setTemplateTag("version", app.version);
        if (app.isPro) draft.setTemplateTag("ispro", "Pro");
        else draft.setTemplateTag("ispro", "Free");
        draft.setTemplateTag("systemname", device.systemName);
        draft.setTemplateTag("systemversion", device.systemVersion);
        draft.setTemplateTag("model", device.model);
        return
     }
}

//Make a gloablly available information object
var tadInfo = new TadInfo();

class TadLibrary
{
    constructor()
    {
        //Use a constant for the version number so it is quick and easy to find and update.
        const TADVER = "20200801";

        //Set the source library file location
        this.libSourceURL = "https://tadpole.thoughtasylum.com/assets/library/tad.js";
        this.libName = "tad";

        //Set the file location for the settings file
        this.settingsPath = "/Library/Scripts/tad.json";

        //Set the file location for the persistent data file
        this.dataPath = "/Library/Scripts/tad-data.json";

        //Default Run settings
        this.runTag = "#run#";
        this.runArea = "inbox";
        this.runSyntax = "JavaScript";
        this.runTagScript = "javascript";

        //Default JavaScript beautifier settings
        this.beautifierURL = "https://tadpole.thoughtasylum.com/assets/library/beautifier.js";
        this.beautifierLibName = "beautifier";
        this.beautifierSettings = "beautifier";

        //Default Task Settings
        this.taskBasicStart = "- [";
        this.taskBasicComplete = "x";
        this.taskBasicIncomplete = " ";
        this.taskBasicEnd = "] ";
        this.taskBasicSyntax = "Simple List";

        //Default button settings
        this.buttonLabelTruncation = 32;

        //Default Debug Settings
        this.debugEnabled = false;

        //Deafult Console Settings
        this.consoleDebugMarker = "🐞 ";
        this.consoleInfoMarker = "💡 ";
        this.consoleWarnMarker = "⚠️ ";
        this.consoleErrorMarker = "⛔️ ";
        this.consoleSuccessMarker = "✅️ ";

        //Default message box settings
        this.msgTitleInfo = "💡 INFORMATION 💡";
        this.msgTitleWarn = "⚠️ WARNING ⚠️";
        this.msgTitleError = "⛔️ ERROR ⛔️";
        this.msgTitleDebug = "🐞 ⒹⒺⒷⓊⒼ 🐞";

        //Separator settings
        this.separatorDateStamp = "-";
        this.separatorDateTimeStamp = "-";
        this.separatorTimeStamp = ".";

        //Template settings
        this.templateFilter = "archive";
        this.templateTags = ["template"];

        //Default special draft settings
        this.draft_discourse = {"tags" : ["Discourse"], "syntax" : "MultiMarkdown", "extension" : "mmd"};
        this.draft_javascript = {"tags" : ["javascript"], "syntax" : "JavaScript", "extension" : "js"};
        this.draft_markdown = {"tags" : [], "syntax" : "Markdown", "extension" : "md"};
        this.draft_multimarkdown = {"tags" : [], "syntax" : "MultiMarkdown", "extension" : "mmd"};
        this.draft_taskpaper = {"tags" : [], "syntax" : "Taskpaper", "extension" : "taskpaper"};
        this.draft_plain_text = {"tags" : [], "syntax" : "Plain Text", "extension" : "txt"};
        this.draft_simple_list = {"tags" : [], "syntax" : "Plain Text", "extension" : "txt"};
        this.draft_github_markdown = {"tags" : [], "syntax" : "GitHub Markdown", "extension" : "mmd"};

        //Default duplication settings
        this.duplicateLinesDefault = 5;

        //Default encoding mappings for enhanced URL encoding
        this.encodeMap = {"!":"%21", "'":"%27", "(":"%28", ")":"%29", "*":"%2A", "~":"%7E"};

        //Default command set
        this.commands = {
            "url" : "OPEN_URL|<1>",
            "actdir" : "OPEN_URL|https://actions.getdrafts.com",
            "cbdic" : "RUN_ACTION|TAD-Dictate-to-clipboard",
            "act" : "RUN_ACTION|<1>",
            "ws" : "RUN_FUNCTION|app.TA_applyWorkspaceByName",
            "wsc" : "RUN_FUNCTION|Workspace.TA_selectLoadWorkspaceByButton",
            "tag" : "RUN_FUNCTION|draft.TA_tagAddCSV"
        };

        //Actions
        this.actions = {
            "info" : {
                "Display Library Settings" : "TAD-Display Settings",
                "Display System & App Settings" : "TAD-Display Drafts and System Information"
            }
        };

        //Test Libraries set-up
        this.testLibsEnable = false;
        this.testLibsListPath = "/Library/Scripts/tad-testlibs.txt";

        //Initialise the library from or to settings
        this.TA_libraryInitialise();

        //Get the current date for use later
        let dtNow = new Date();

        //Always override the following properties, no matter what has been stored in the settings
        this.version = TADVER;
        this.authors = ["Stephen Millard"];
        this.source = "https://www.thoughtasylum.com/";
        this.copyrightPeriod = "2018 - " + dtNow.getFullYear();
        this.copyright = "Copyright " + this.copyrightPeriod + ": " + this.authors.join(", ") + " (ThoughtAsylum).";

        //Load test libraries if the option is enabled.
        if (this.testLibsEnable) this.TA_libraryTestLibLoad();
    }


    //Initialise Settings
    TA_libraryInitialise()
    {
        //Try to read in the library settings
        let fmCloud = FileManager.createCloud();
        let objSettings = fmCloud.readJSON(this.settingsPath);
        if (objSettings === undefined)
        {
            //Create the settings file from the existing defaults
            fmCloud.writeJSON(this.settingsPath, this);
        }
        else
        {
            //Merge in any updated settings
            let objTest = this;
            objTest = Object.assign(objTest, objSettings);
        }
        return;
    }


    // Load additional library files for testing.
    TA_libraryTestLibLoad()
    {
        //Try to read in the testing library list
        let fmCloud = FileManager.createCloud();
        let strContent = fmCloud.readString(this.testLibsListPath);
        let bRet;

        
        if (typeof strContent == undefined)
        {
            //If the return is undefined, the file isn't found/has no content.
            //We're not going to do anything in this situation.
            bRet = false;
        }
        else
        {
            //The testing library list is available and has content.
            //Load the testing library list and this should load the constituent libraries
            for (let strLib of strContent.split('\n'))
            {
                //Ignore blank lines
                if(strLib.length > 0)
                {
                    //Clean up any carriage returns, carriage returns and line feeds hanging around
                    let strLibClean = strLib.replace('\n','');
                    strLibClean = strLibClean.replace('\r','');
                    strLibClean = strLibClean.replace('\f','');

                    //Load the library
                    require(strLibClean);
                }
            }
            app.displayInfoMessage('--- Testing Libraries Loaded ---');
            bRet = true;
        }
        return bRet;
    }

    // Saves the latest library settings to file.
    TA_save()
    {
        let fmCloud = FileManager.createCloud();
        return fmCloud.writeJSON(this.settingsPath, this);
    }


    // Get the library settings of the library object as a string of text.
    TA_getSettingsLoaded()
    {
        let strLibInfo = [];
        for(var propertyName in this)
        {
            strLibInfo.push(propertyName + "=" + this[propertyName]);
        }
        strLibInfo = strLibInfo.sort();
        return strLibInfo.join("\n");
    }


    // Get the persistent library settings that are saved to file as a JSON formatted string of text.
    TA_getSettingsSavedJSON()
    {
         let fmCloud = FileManager.createCloud();
         let strSettings = fmCloud.readString(this.settingsPath);
         if (strSettings === undefined) return "";
         else return strSettings;
    }


    // Display the current settings for the library object in a pop up.
    TA_displaySettingsLoaded()
    {
        let strInfo = this.TA_getSettingsLoaded()
        app.TA_msgInfo(strInfo);
        return strInfo;
    }


    // Display the current settings for the library object as a text representation of JSON in a pop up.
    TA_displaySettingsLoadedJSON()
    {
        let strInfo = JSON.stringify(this);
        app.TA_msgInfo(strInfo);
        return strInfo;
    }


    // Display the persistent library settings that are saved to file, as a text representation of JSON in a pop up.
    TA_displaySettingsSavedJSON()
    {
        let strInfo = this.TA_getSettingsSavedJSON();
        app.TA_msgInfo(strInfo);
        return strInfo;
    }


    // Display a set of options for displaying a set of settings and show the selected settings.
    TA_displaySettings()
    {
        let strResult;
        switch (Prompt.TA_promptButtonArray("TADpoLe Settings", "Choose information to display", ["Loaded Settings (Text)", "Loaded Settings (JSON)", "Saved Settings (JSON)"])) 
        {
            case "Loaded Settings (Text)":
                strResult = tadLib.TA_displaySettingsLoaded();
                break;
            case "Loaded Settings (JSON)":
                strResult = tadLib.TA_displaySettingsLoadedJSON();
                break;
            case "Saved Settings (JSON)":
                strResult = tadLib.TA_displaySettingsSavedJSON();
                break;
            default:
                //Cancelled do nothinng
        }
        return strResult;
    }


    // Copy the current settings for the library object to the clipboard.
    TA_copySettingsLoaded()
    {
        let strInfo = this.TA_getSettingsLoaded()
        app.setClipboard(strInfo);
        return strInfo;
    }


    // Copy the current settings for the library object as a text representation of JSON to the clipboard.
    TA_copySettingsLoadedJSON()
    {
        let strInfo = JSON.stringify(this);
        app.setClipboard(strInfo);
        return strInfo;
    }


    // Copy the persistent library settings that are saved to file, as a text representation of JSON to the clipboard.
    TA_copySettingsSavedJSON()
    {
        let strInfo = this.TA_getSettingsSavedJSON();
        app.setClipboard(strInfo);
        return strInfo;
    }


    // Copy a set of options for displaying a set of settings to the clipboard.
    TA_copySettings()
    {
        let strResult;
        switch (Prompt.TA_promptButtonArray("TADpoLe Settings", "Choose information to copy to clipboard", ["Loaded Settings (Text)", "Loaded Settings (JSON)", "Saved Settings (JSON)"])) 
        {
            case "Loaded Settings (Text)":
                strResult = tadLib.TA_copySettingsLoaded();
                break;
            case "Loaded Settings (JSON)":
                strResult = tadLib.TA_copySettingsLoadedJSON();
                break;
            case "Saved Settings (JSON)":
                strResult = tadLib.TA_copySettingsSavedJSON();
                break;
            default:
                //Cancelled do nothinng
        }
        return strResult;
    }


    // Used to quickly replace the TAD-Libray action contents from the tad.js library file.
    TA_buildLibraryAction()
    {
        const strCall = "drafts5://action?data=";

        let fmCloud = FileManager.createCloud();
        let strScript = fmCloud.readString("/Library/Scripts/tad.js");

        let jsonBuildStep0 = {};
        jsonBuildStep0.platforms = 3;
        jsonBuildStep0.type = "script";
        jsonBuildStep0.isEnabled = true;
        jsonBuildStep0.uuid = "A0E1974C-F0B2-4DEF-860D-934BD3B9C041";
        jsonBuildStep0.data = {};
        jsonBuildStep0.data.allowAsync = "false";
        jsonBuildStep0.data.script = strScript;

        let jsonKeyCmd = {};
        jsonKeyCmd.optionKey = false;
        jsonKeyCmd.input = "";
        jsonKeyCmd.controlKey = false;
        jsonKeyCmd.commandKey = false;
        jsonKeyCmd.type = "action";
        jsonKeyCmd.discoverabilityTitle = "TAD-Library";
        jsonKeyCmd.shiftKey = false;

        let jsonBuild = {};
        jsonBuild.uuid = "31D93149-34A7-47B4-AD7F-4B2FB635E7DE";
        jsonBuild.steps = [];
        jsonBuild.steps.push(jsonBuildStep0);
        jsonBuild.backingPlatforms = 3;
        jsonBuild.shortName = "";
        jsonBuild.shouldConfirm = false;
        jsonBuild.disposition = 0;
        jsonBuild.keyCommand = jsonKeyCmd

        jsonBuild.logLevel = 1;
        jsonBuild.groupDisposition = 0;
        jsonBuild.notificationType = 1;
        jsonBuild.tintColor = "gray";
        jsonBuild.actionDescription = "An action copy of the tad.js library file.";
        jsonBuild.keyUseIcon = false;
        jsonBuild.icon = "667-gear3";
        jsonBuild.visibility = 480;
        jsonBuild.backingIsSeparator = false;
        jsonBuild.groupUUID = "54ADF94F-8F6B-4477-947C-175000317F7B";
        jsonBuild.assignTags = [];
        jsonBuild.name = "TAD-Library";

        let strJSONBuild = JSON.stringify(jsonBuild)

        app.openURL(strCall + encodeURIComponent(strJSONBuild));
        return;
    }

}

//Make a gloablly available library object
var tadLib = new TadLibrary();


// Generate a random integer value between a minimum and maximum value (inclusive).
Math.TA_randInt = function(p_intMin, p_intMax)
{
    const intMin = Math.floor(p_intMin);
    const intMax = Math.floor(p_intMax);
    return Math.floor(Math.random() * (intMax - intMin + 1)) + intMin;
}

class TadMiscellaneous
{
    // Constructor for the object.
    constructor()
    {
        //Do nothing
        return;
    }

    // Creates a timestamp for this moment to the nearest second.
    TA_getTimestampyyyyMMddhhmmss()
    {
        let objNow = new Date();
        let intYear = "" + objNow.getFullYear();
        let strMonth = ("" + (objNow.getMonth() + 1)).padStart(2, '0');
        let strDay = ("" + objNow.getDate()).padStart(2, '0');
        let strHour = ("" + objNow.getHours()).padStart(2, '0');
        let strMinute = ("" + objNow.getMinutes()).padStart(2, '0');
        let strSecond = ("" + objNow.getSeconds()).padStart(2, '0');

        //Build the output using the separators defined for the library object.
        return intYear + tadLib.separatorDateStamp 
            + strMonth + tadLib.separatorDateStamp 
            + strDay + tadLib.separatorDateTimeStamp 
            + strHour + tadLib.separatorTimeStamp 
            + strMinute + tadLib.separatorTimeStamp 
            + strSecond;
    }

        // Creates a timestamp for this moment to the nearest millisecond.
        TA_getTimestampyyyyMMddhhmmssxxx()
        {
            let objNow = new Date();
            let intYear = "" + objNow.getFullYear();
            let strMonth = ("" + (objNow.getMonth() + 1)).padStart(2, '0');
            let strDay = ("" + objNow.getDate()).padStart(2, '0');
            let strHour = ("" + objNow.getHours()).padStart(2, '0');
            let strMinute = ("" + objNow.getMinutes()).padStart(2, '0');
            let strSecond = ("" + objNow.getSeconds()).padStart(2, '0');
            let strMillisecond = ("" + objNow.getMilliseconds()).padStart(3, '0');
    
            //Build the output using the separators defined for the library object.
            return intYear + tadLib.separatorDateStamp 
                + strMonth + tadLib.separatorDateStamp 
                + strDay + tadLib.separatorDateTimeStamp 
                + strHour + tadLib.separatorTimeStamp 
                + strMinute + tadLib.separatorTimeStamp 
                + strSecond + tadLib.separatorTimeStamp 
                + strMillisecond;
        }

    // Evaluate a string of JavaScript several times.
    //e.g. can be used to repeat a function
    TA_repeatEvaluation(p_strToEvaluate, p_intTimes)
    {
        for (let intCount = 0; intCount < p_intTimes; intCount++)
        {
            eval(p_strToEvaluate);
        }
        return;
    }

    // Return the ordinal term for a day of the month. e.g. 3 => 'third'.
    TA_ordinalDay(p_intNumber)
    {
        //Just in case, let's take just the integer part to work with
        let intNumber = Math.trunc(p_intNumber);

        //Initialise the ordinals
        let objOrdinal = [];
        objOrdinal.n1 = "first";
        objOrdinal.n2 = "second";
        objOrdinal.n3 = "third";
        objOrdinal.n4 = "fourth";
        objOrdinal.n5 = "fifth";
        objOrdinal.n6 = "sixth";
        objOrdinal.n7 = "seventh";
        objOrdinal.n8 = "eighth";
        objOrdinal.n9 = "ninth";
        objOrdinal.n10 = "tenth";
        objOrdinal.n11 = "eleventh";
        objOrdinal.n12 = "twelfth";
        objOrdinal.n13 = "thirteenth";
        objOrdinal.n14 = "fourteenth";
        objOrdinal.n15 = "fifteenth";
        objOrdinal.n16 = "sixteenth";
        objOrdinal.n17 = "seventeenth";
        objOrdinal.n18 = "eighteenth";
        objOrdinal.n19 = "nineteenth";
        objOrdinal.n20 = "twentieth";
        objOrdinal.n21 = "twenty first";
        objOrdinal.n22 = "twenty second";
        objOrdinal.n23 = "twenty third";
        objOrdinal.n24 = "twenty fourth";
        objOrdinal.n25 = "twenty fifth";
        objOrdinal.n26 = "twenty sixth";
        objOrdinal.n27 = "twenty seventh";
        objOrdinal.n28 = "twenty eighth";
        objOrdinal.n29 = "twenty ninth";
        objOrdinal.n30 = "thirtieth";
        objOrdinal.n31 = "thirty first";

        //Return the ordinal by named index or if out of bounds, return the numeric value.
        if (intNumber > 31 || intNumber < 1) return intNumber.toString();
        else return objOrdinal["n" + intNumber];
    }

    // Pause doing anything else until a specified number of milliseconds has elapsed.
    TA_sleepMS(p_intms)
    {
        //Loop and keep checking time against a start time, until
        //the passed in elapsed time (milliseconds) has passed.
        let dtStart = new Date().getTime();
        let bContinueLooping = true;
        while (bContinueLooping)
        {
            if ((new Date().getTime() - dtStart) >= p_intms) bContinueLooping = false;
        }
        return;
    }

    // Pause doing anything else until a specified number of seconds has elapsed.
    TA_sleep(p_intSecs)
    {
        return tadMisc.TA_sleepMS(1000 * p_intSecs);
    }


    // Pause doing anything else until a specified number of milliseconds has elapsed while displaying a counter.
    TA_sleepMSDisplay(p_intms, p_intDisplayms, p_strPrefix = "", p_strSuffix = "")
    {
        //Initialise
        let dtStart = new Date().getTime();
        let bContinueLooping = true;
        let intElapsed = 0;
        let intLast = 0;

        //Run the loop
        while (bContinueLooping)
        {
            //initialise values we'll use
            let dtNow = new Date().getTime();
            intElapsed = dtNow - dtStart;
            let intSecondsElapsed = Math.trunc(intElapsed/1000);
            let intTracker = Math.trunc(intElapsed/p_intDisplayms);

            //Check if we need to break out of the loop
            if (intElapsed >= p_intms) bContinueLooping = false;

            //If we've switched to a new second, display a message
            if(intTracker > intLast) app.displayInfoMessage(p_strPrefix + intSecondsElapsed + p_strSuffix);

            //Set the seconds elapsed
            intLast = intTracker;
        }
        return;
    }


    // Load the most recently modified draft configured for execution into the editor.
    TA_devLoadRunDraft()
    {
        //Find the run tagged drafts in the area we're keeping them in
        //e.g. drafts tagged "#run#" in Inbox.
        //Sorts in reverse chronological order on modification date
        let allRunDrafts = Draft.query("", tadLib.runArea, [tadLib.runTag],[],"modified", false, false);
    
        if (allRunDrafts.length == 0)
        {
            //No runnable draft found - show an error
            app.displayErrorMessage("No drafts found with tag '" + tadLib.runTag + "' in " + tadLib.runArea);
        }
        else
        {
            //There should be only one, but also sorted by last modified, so we're just picking the first 
            //one and loading it in
            editor.load(allRunDrafts[0]);
            editor.activate();
            return allRunDrafts[0].uuid;
        }
    }
    
    // Set the currently loaded draft for execution.
    TA_devSetRunDraft()
    {
        //Identify all of the drafts that qualify as a runnable draft.
        let allRunDrafts = Draft.query("", tadLib.runArea, [tadLib.runTag]);
    
        allRunDrafts.forEach( function (thisDraft)
        {
            thisDraft.removeTag(tadLib.runTag);
            thisDraft.update();
        });
    
        //Configure the current draft for running
        draft.languageGrammar = tadLib.runSyntax;
        
        //Set run & script tags
        draft.addTag(tadLib.runTag);
        draft.addTag(tadLib.runTagScript);
        
        //Apply the changes
        draft.update();

        //Unload and reload the draft as the syntax change in the UI sometimes needs a bump
        //Also, i*OS doesn't always pick up tag updates in the editor (Mac seems to).
        editor.load(Draft.create());
        editor.load(draft);
        return draft.uuid;
    }
    

    // Execute the contents of the most recently modified draft configured for execution into the editor.
    TA_devExecuteRunDraft()
    {
        //Find the run tagged drafts in the area we're keeping them in
        //e.g. drafts tagged "#run#" in Inbox.
        //Sorts in reverse chronological order on modification date
        let allRunDrafts = Draft.query("", tadLib.runArea, [tadLib.runTag],[],"modified", false, false);
    
        if (allRunDrafts.length == 0)
        {
            //No runnable draft found - show an error
            app.displayErrorMessage("No drafts found with tag '" + tadLib.runTag + "' in " + tadLib.runArea);
        }
        else
        {
            //There should be only one, but also sorted by last modified, so we're just picking the first 
            //one and executing it's contents
            eval(allRunDrafts[0].content);
        }
        editor.activate();
        return;
    }


    // Reformat the JavaScript content of the current draft.
    TA_devBeautifyJSDraft()
    {
        //Load the beautifier library
        require(tadLib.beautifierLibName + ".js");

        //Attempt to read in any custom settings and beautify the content of the current draft
        let fmCloud = FileManager.createCloud();
        let strContent = fmCloud.readString("/Library/Scripts/" + tadLib.beautifierSettings + ".json");
        if (typeof strContent == "undefined")
        {
            //File not found, so we'll call the beautify function on the content without any additional settings.
            app.displayInfoMessage("Using default JS Beautifer settings");
            draft.content = js_beautify(draft.content);
        }
        else
        {
            //File found, so pass that in as JSON for some non-default settings.
            app.displayInfoMessage("Using custom JS Beautifer settings");
            draft.content = js_beautify(draft.content, JSON.parse(strContent));
        }

        //The draft content has been changed, so lets update the draft and return the content.
        draft.update();
        return draft.content;
    }


    // Converts action group install link to an array of action names and/or separators.
    TA_actionGroupLink(p_strActionGroupLink, p_bActions = true, p_bSeparators = false)
    {
        //Initialise arrays for action names and separators
        let astrNames = [];

        //Convert action group installation link data to JSON
        let strLink = p_strActionGroupLink.replace("drafts5://actionGroup?data=","");
        strLink = decodeURIComponent(strLink);
        let jsonData = JSON.parse(strLink);

        //Loop through all action entries and add the action/separator to the correct array
        jsonData.actions.forEach(function(action)
        {
            //Process separators
            if (action.backingIsSeparator && p_bSeparators) astrNames.push(action.name);

            //Process actions
            if (!action.backingIsSeparator && p_bActions) astrNames.push(action.name);
  
        });

        return astrNames;
    }

    // Converts action group install link to an array of action names.
    TA_actionGroupLinkToActions(p_strActionGroupLink)
    {
        return this.TA_actionGroupLink(p_strActionGroupLink, true, false);
    }


    // Converts action group install link to an array of separator names.
    TA_actionGroupLinkToSeparators(p_strActionGroupLink)
    {
        return this.TA_actionGroupLink(p_strActionGroupLink, false, true);
    }


    // Converts action group install link to an array of action and separator names.
    TA_actionGroupLinkToList(p_strActionGroupLink)
    {
        return this.TA_actionGroupLink(p_strActionGroupLink, true, true);
    }


    // Converts action group install link to a count of action names.
    TA_actionGroupLinkToActionsCount(p_strActionGroupLink)
    {
        return this.TA_actionGroupLink(p_strActionGroupLink, true, false).length;
    }


    // Converts action group install link to a count of separator names.
    TA_actionGroupLinkToSeparatorsCount(p_strActionGroupLink)
    {
        return this.TA_actionGroupLink(p_strActionGroupLink, false, true).length;
    }


    // Converts action group install link to a count of action and separator names.
    TA_actionGroupLinkToListCount(p_strActionGroupLink)
    {
        return this.TA_actionGroupLink(p_strActionGroupLink, true, true).length;
    }


    // Converts action group install link to the name of the group
    TA_actionGroupLinkToName(p_strActionGroupLink)
    {
        //Convert action group installation link data to JSON
        let strLink = p_strActionGroupLink.replace("drafts5://actionGroup?data=","");
        strLink = decodeURIComponent(strLink);
        return JSON.parse(strLink).name;
    }



    // Converts action group install link to a Markdown draft of basic documentation about the action group.
    TA_actionGroupLinkDocument(p_strActionGroupLink)
    {
        //Convert action group installation link data to JSON
        let strLink = p_strActionGroupLink.replace("drafts5://actionGroup?data=","");
        strLink = decodeURIComponent(strLink);
        let jsonData = JSON.parse(strLink);
        let strDoc = "# " + jsonData.name + "\n";

        //Loop through all action entries and process each action/separator
        let tadMiscLoop = this;
        jsonData.actions.forEach(function(action)
        {
            if (action.backingIsSeparator)
            {
                strDoc += "\n## " + action.name + "\n";  
                //strDoc += "\n**Type:** Separator  \n";
            }
            else
            {
                strDoc += "\n### " + action.name;  
                strDoc += "\n**Type:** Action";
                if (action.hasOwnProperty("keyCommand")) strDoc += "  \n**Keyboard Shortcut:** " + tadMiscLoop.TA_actionKeys(action.keyCommand);
                strDoc += "  \n**Icon:** " + action.icon;
                strDoc += "  \n**Colour:** " + action.tintColor;
                strDoc += "  \n**Confirm to Run:** " + action.shouldConfirm;
                strDoc += "  \n**Notifications:** " + tadMiscLoop.TA_actionLevelDescription(action.notificationType);
                strDoc += "  \n**Log Level:** " + tadMiscLoop.TA_actionLevelDescription(action.logLevel);
                strDoc += "  \n**Number of Steps:** " + action.steps.length;
                strDoc += "  \n**Unique ID:** " + action.uuid;
                strDoc += "  \n**Description:**  \n";
                strDoc += action.actionDescription + "\n";
            }
            strDoc += "\n"
        });

        return draft.TA_draftNew(strDoc);
    }


    // Return the keyboard shortcut for an action as a string.
    TA_actionKeys(p_jsonKey)
    {
        console.log("calling TA_actionKeys");
        let astrReturn = [""];
        if (p_jsonKey.shiftKey) astrReturn.push("⇧");
        if (p_jsonKey.controlKey) astrReturn.push("⌃");
        if (p_jsonKey.optionKey) astrReturn.push("⌥");
        if (p_jsonKey.commandKey) astrReturn.push("⌘");
        if (p_jsonKey.input.length > 0) astrReturn.push(p_jsonKey.input);
        return astrReturn.join("");
    }


    // Return the descriptor for an action level.
    TA_actionLevelDescription(p_intLevel)
    {
        switch (p_intLevel)
        {
            case 0:
                return "None";
            case 1:
                return "Errors";

            case 2:
                return "All";            
        }
    }


    // Expand Drafts wiki-style links in a string of content.
    TA_transcludeWikiLinks_$(p_strContent)
    {
        //Match wiki links
        let strContent = p_strContent.replace(/\[\[(.+?)\]\]/gm, 
            function (re_strWikiLink, re_strTitle)
            {
                //Find drafts, sort latest modified to top as that's the most likely to be wanted 
                //in case of a naming clash.
                let adraftMatches = Draft.query(re_strTitle, "all", [], [], "modified", true, false);

                //Process matching drafts
                if (adraftMatches.lenth != 0) 
                {
                    for (let draftCheck of adraftMatches)
                    {
                        //Remove any heading hashes from the title when comparing to the title in the wiki link; first match returns
                        if (draftCheck.title.replace(/^\#*/g,"").trim().toLowerCase() == re_strTitle.toLowerCase()) 
                            return draftCheck.content;
                    }
                }
                //Fallback for no matching is to return the original wiki link
                return re_strWikiLink;
            });
	    return strContent;
    }


    // Expand Drafts d-wiki-style links in a string of content.
    TA_transcludeWikiLinks_d(p_strContent)
    {
        //Match wiki links
        let strContent = p_strContent.replace(/\[\[d:(.+?)\]\]/gm, 
            function (re_strWikiLink, re_strTitle)
            {
                //Find drafts, sort latest modified to top as that's the most likely to be wanted 
                //in case of a naming clash.
                let adraftMatches = Draft.query(re_strTitle, "all", [], [], "modified", true, false);

                //Process matching drafts
                if (adraftMatches.lenth != 0) 
                {
                    for (let draftCheck of adraftMatches)
                    {
                        //Remove any heading hashes from the title when comparing to the title in the wiki link; first match returns
                        if (draftCheck.title.replace(/^\#*/g,"").trim().toLowerCase() == re_strTitle.toLowerCase()) 
                            return draftCheck.content;
                    }
                }
                //Fallback for no matching is to return the original wiki link
                return re_strWikiLink;
            });
	    return strContent;
    }


    // Expand Drafts u-wiki-style links in a string of content.
    TA_transcludeWikiLinks_u(p_strContent)
    {
        //Match wiki links
        let strContent = p_strContent.replace(/\[\[u:(.+?)\]\]/gm, 
            function (re_strWikiLink, re_strUUID)
            {
                //We have the UUID, so it should be easy to get the draft.
                let draftMatched = Draft.find(re_strUUID);
                if (draftMatched == undefined) return re_strWikiLink;
                else return draftMatched.content;
            });
	    return strContent;
    }

    // Expand Drafts wiki-style links in a string of content, including d and u type links.
    TA_transcludeWikiLinks(p_strContent)
    {
        return this.TA_transcludeWikiLinks_$(this.TA_transcludeWikiLinks_d(this.TA_transcludeWikiLinks_u(p_strContent)));
    }

    // Transform local HTML image links to use pre-encoded Base 64 data URLs.
    TA_addEncodedImages(p_strHTMLContent)
    {
        //Match HTML Image image links - includes sub-matching of alt text, URL, and title
        //Tried this with Markdown, and the results were messed up by the rendering engines that
        //translated HTML to literals (use a lazy match to ensure we only get the src attribute).
        let strContent = p_strHTMLContent.replace(/src="(.*?)"/gm, 
            function (re_strImage, re_strPath)
            {
                //No changes required if we're picking up images from a web server
                if(re_strPath.startsWith("http://")) return re_strImage;
                if(re_strPath.startsWith("https://")) return re_strImage;
                
                //Prefix a root slash if necessary
                let strPath = re_strPath;
                if (!strPath.startsWith("/")) strPath = "/" + strPath;

                //The file we actually want to retrieve is a base 64 encoded text file.
                //Purely by convention, we're going to identify these as files with the same path as
                //the image, but with ".b64.txt" appended to the end.
                strPath += ".b64.txt";

                //Attempt to read the content from the file
                let fmCloud = FileManager.createCloud();
                let strContent = fmCloud.readString(strPath)

                //Fallback for no matching is to return the original data
                if (strContent == undefined) return re_strImage;

                //At this point we have the content of a matching base 64 encoded file.
                //We need to substitute that in for the image tag content we matched
                let strImgTag = 'src="data:image/';
                //for the image type, we'll pop the extension from the file path
                strImgTag += re_strPath.toLowerCase().split('.').pop();
                strImgTag += ';base64, ';
                //Now to add the image data and close the tag
                strImgTag += strContent;
                strImgTag += '"';
                return strImgTag;
            });
        return strContent;
    }

    // Presents a user with a list of synonyms to select from for a specified word/phrase.
    TA_synonymSelect(p_strText, p_intMax = 25)
    {
        let objHTTP = HTTP.create();
        let objSynonyms = JSON.parse(objHTTP.TA_getContent("https://api.datamuse.com/words?ml=" + encodeURI(p_strText) + "&max=" + p_intMax));
        let astrSynonyms = [];
    
        objSynonyms.forEach(function(objSynonym)
        {
            astrSynonyms.push(objSynonym.word);
        });
    
        return Prompt.TA_selectPrompt("Synonyms for '" + p_strText + "'", "Please select a synonym", astrSynonyms);
    }
    

    // Presents a user with a list of synonyms to select from for a selected word/phrase, or if none selected, prompts the user to enter a word/phrase to lookup.
    TA_synonymOfSelected(p_intMax = 25)
    {
        let strText = editor.getSelectedText();
        if (strText == "") strText = Prompt.TA_singleTextFieldPrompt("Enter Word", "", "Enter a word or phrase to find a synonym for.", "");
        if (strText != "")
        {
            let strReplace = this.TA_synonymSelect(strText, p_intMax);
            if(strReplace != undefined)
            {
                if (strReplace.length > 0) return strReplace;
            }
        }
        return;
    }
    

    // Inserts a user selected synonym for a selected word/phrase, or if none selected, prompts the user to enter a word/phrase to lookup.
    TA_synonymInsert(p_intMax = 25)
    {
        let strReplace = this.TA_synonymOfSelected(p_intMax);
        if(strReplace != undefined)
        {
            if (strReplace.length > 0) editor.setSelectedText(strReplace);
        }
        return strReplace;
    }
    

    // Returns a set of definitions for a specified word (English).
    TA_definition(p_strText)
    {
        let objHTTP = HTTP.create();
        let objDefinitions = JSON.parse(objHTTP.TA_getContent("https://api.datamuse.com/words?sp=" + encodeURI(p_strText) + "&md=d&max=1"));
        if(objDefinitions.length > 0)
        {
            let astrDefinitions = objDefinitions[0].defs;
            return astrDefinitions.join("\n\n");
        }
        return;
    }
    

    // Displays a set of definitions for a specified word (English).
    TA_definitionDisplay(p_strText)
    {
        return app.TA_msgbox("Definition: " + p_strText, this.TA_definition(p_strText));
    }
    

    // Displays a set of definitions for a selected word (English), or prompts the user for the word to lookup if none is selected.
    TA_definitionOfSelected()
    {
        let strText = editor.getSelectedText();
        if (strText == "") strText = Prompt.TA_singleTextFieldPrompt("Enter Word", "", "Enter a word or phrase to find a definition for.", "");
        if  (strText != undefined)
        {
            if (strText != "") this.TA_definitionDisplay(strText);
        }
        return;
    }


    // Generic logging function.
    TA_logToDraft(p_strUUID, p_strTextToLog, p_strMode = "append", p_strPrefix = "", p_strSuffix = "", p_strDTFormat = "")
    {
        //If there is no text passed in  to log, we'll trigger a dictation
        let strTextToLog = p_strTextToLog;
        if (p_strTextToLog == "") strTextToLog = editor.dictate();

        //Add any additional wrapper text
        strTextToLog = p_strPrefix + strTextToLog + p_strSuffix;

        //If we have date/time format provided, we're applying a date/time, so let's add it in
        if (p_strDTFormat != "")
        {
            strTextToLog = draft.processTemplate(`[[date|${p_strDTFormat}]]`) + strTextToLog;
        }

        //Different modes do different things
        let draftLog;
        switch (p_strMode.toLowerCase())
        {
            //Add to the end of the draft
            case "append":
                draftLog = Draft.find(p_strUUID);
                draftLog.content = draftLog.content + strTextToLog;
                draftLog.update();
                break;

            //Add to the start of the draft
            case "prepend":
                draftLog = Draft.find(p_strUUID);
                draftLog.content = strTextToLog + draftLog.content;
                draftLog.update();
                break;

            //Insert at cursor position in editor
            case "cursor":
                editor.TA_insertTextPosAtEnd(strTextToLog);
                break;

            //If another mode was passed in, flag it as an error.
            default:
                app.TA_displayErrorMessage("Invalid Logging Mode: " + p_strMode);
                break;
        }

        //Return the text to be logged
        return strTextToLog;
    }


    // Generic logging function for the currently edited draft.
    TA_logToDraftCurrent(p_strTextToLog, p_strMode = "append", p_strPrefix = "", p_strSuffix = "", p_strDTFormat = "", p_strDTSeparator = "")
    {
        //Pass in the current draft UUID
        return this.TA_logToDraft(draft.uuid, p_strTextToLog, p_strMode, p_strPrefix, p_strSuffix, p_strDTFormat, p_strDTSeparator)
    }


    // Generate a v4 UUID.
    TA_uuidv4(a,b)
    {
        for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');
        return b;
    }


    // Generate a random integer value between a minimum and maximum value (inclusive).
    TA_randInt(p_intMin, p_intMax)
    {
        const intMin = Math.floor(p_intMin);
        const intMax = Math.floor(p_intMax);
        return Math.floor(Math.random() * (intMax - intMin + 1)) + intMin;
    }

    //JSON array comparator function for sorting based on a root property of each array item.
    TA_JSONArraySorter(p_strProperty)
    {
        return function(p_objA, p_objB)
        {
            if (p_objA[p_strProperty] > p_objB[p_strProperty]) return 1;
            else if (p_objA[p_strProperty] < p_objB[p_strProperty]) return -1;
            else return 0;
        }
    }
}

//Make a gloablly available miscellaneous object
var tadMisc = new TadMiscellaneous();

// A simple single selection prompt that constructs a lot of the details around using this type of prompt.
Prompt.TA_selectPrompt = function(p_strTitle, p_strLabel, p_astrOptions, p_strSelected = "")
{
    //Set the default either from the parameters, or select the first option
    let arrDefaultSelected = [];
    if (p_strSelected == "") arrDefaultSelected.push(p_astrOptions[0]);
    else arrDefaultSelected.push(p_strSelected);

	//Build the prompt
	const buttonOK = "OK";
	const selectedItems = "selectedItems";
    let promptSelect = Prompt.create();
    promptSelect.title = p_strTitle;
	promptSelect.addSelect(selectedItems, p_strLabel, p_astrOptions, arrDefaultSelected, false);
	promptSelect.addButton(buttonOK);

	//Get the result
	if (promptSelect.show())
	{
		if (promptSelect.buttonPressed == buttonOK)
		{
			return promptSelect.fieldValues[selectedItems];
		}
		else return null;
	}
}


// A multi-selection prompt that constructs a lot of the details around using this type of prompt.
Prompt.TA_multiSelectPrompt = function(p_strTitle, p_strLabel, p_astrOptions, p_astrDefaultSelected)
{
	//Build the prompt
	const buttonOK = "OK";
	const selectedItems = "selectedItems";
	let promptSelect = Prompt.create();
	promptSelect.title = p_strTitle;
	promptSelect.addSelect(selectedItems, p_strLabel, p_astrOptions, p_astrDefaultSelected, true);
	promptSelect.addButton(buttonOK);

	//Get the result
	if (promptSelect.show())
	{
		if (promptSelect.buttonPressed == buttonOK)
		{
			return promptSelect.fieldValues[selectedItems];
		}
		else return null;
	}
}


// Displays a list of button options to select from as a prompt.
Prompt.TA_promptButtonArray = function(p_strTitle, p_strMessage, p_astrButtons, p_bCancellable = true)
{
	//Set-up the base prompt
	let promptButtonArray = Prompt.create();
	promptButtonArray.title = p_strTitle;
	if (p_strMessage.length > 0) promptButtonArray.message = p_strMessage;
	promptButtonArray.isCancellable = p_bCancellable;

	//Create a button for each array item
	p_astrButtons.forEach(function(item)
	{
		promptButtonArray.addButton(item);
	});
	
	if (promptButtonArray.show())
	{
		return promptButtonArray.buttonPressed;
	}
	else
	{
		return null;
	}
}


// Displays a prompt with a single text field to enter a text string into.
Prompt.TA_singleTextFieldPrompt = function(p_strTitle, p_strMessage, p_strLabel, p_strDefault = "")
{
	//Build the prompt
	const buttonOK = "OK";
	let promptText = Prompt.create();
	promptText.title = p_strTitle;
	if (p_strMessage.length > 0)
	{
		promptText.message = p_strMessage;
	}
	promptText.addTextField("textFieldName", p_strLabel, p_strDefault,
	{
		"wantsFocus": true
	});
	
	//Single button added so defaults to default button
	//Therefore responds to CMD+Return
	promptText.addButton(buttonOK);

	//Get the result
	if (promptText.show())
	{
		if (promptText.buttonPressed == buttonOK)
		{
			return promptText.fieldValues["textFieldName"];
		}
	}
	return "";
}


// Displays a prompt with two text fields to enter text strings into.
Prompt.TA_doubleTextFieldPrompt = function(p_strTitle, p_strMessage, p_strLabel1, p_strDefault1, p_strLabel2, p_strDefault2)
{
	//Build the prompt
	const buttonOK = "OK";
	let promptText = Prompt.create();
	promptText.title = p_strTitle;
	if (p_strMessage.length > 0)
	{
		promptText.message = p_strMessage;
	}
	promptText.addTextField("textFieldName1", p_strLabel1, p_strDefault1,
	{
		"wantsFocus": true
	});
	promptText.addTextField("textFieldName2", p_strLabel2, p_strDefault2,
	{
		"wantsFocus": false
	});
	promptText.addButton(buttonOK);

	//Get the result
	if (promptText.show())
	{
		if (promptText.buttonPressed == buttonOK)
		{
			return [promptText.fieldValues["textFieldName1"], promptText.fieldValues["textFieldName2"]];
		}
	}
	return ["", ""];
}


// Displays a prompt with a single text field to enter a number into.
Prompt.TA_singleNumberFieldPrompt = function(p_strTitle, p_strMessage, p_strLabel, p_numDefault = 0)
{
	//Build the prompt
	const buttonOK = "OK";
	let promptText = Prompt.create();
	promptText.title = p_strTitle;
	if (p_strMessage.length > 0)
	{
		promptText.message = p_strMessage;
	}
	promptText.addTextField("textFieldName", p_strLabel, p_numDefault,
	{
		"wantsFocus": true,
		"keyboard" : "decimalPad"
	});
	
	//Single button added so defaults to default button
	//Therefore responds to CMD+Return
	promptText.addButton(buttonOK);

	//Get the result
	if (promptText.show())
	{
		if (promptText.buttonPressed == buttonOK)
		{
			return Number(promptText.fieldValues["textFieldName"]);
		}
	}
	return;
}


// Displays a prompt with a single text field to enter an integer into.
Prompt.TA_singleIntegerFieldPrompt = function(p_strTitle, p_strMessage, p_strLabel, p_intDefault = 0)
{
	//Build the prompt
	const buttonOK = "OK";
	let promptText = Prompt.create();
	promptText.title = p_strTitle;
	if (p_strMessage.length > 0)
	{
		promptText.message = p_strMessage;
	}
	promptText.addTextField("textFieldName", p_strLabel, p_intDefault,
	{
		"wantsFocus": true,
		"keyboard" : "numberPad"
	});
	
	//Single button added so defaults to default button
	//Therefore responds to CMD+Return
	promptText.addButton(buttonOK);

	//Get the result
	if (promptText.show())
	{
		if (promptText.buttonPressed == buttonOK)
		{
			return Number(promptText.fieldValues["textFieldName"]);
		}
	}
	return;
}


// Displays a confirmation prompt - a question with a yes/no response.
Prompt.TA_confirm = function(p_strTitle, p_strMessage)
{
	if(Prompt.TA_promptButtonArray(p_strTitle, p_strMessage, ["Yes", "No"], false) == "Yes") return true;
	else return false;
}

// Escape a regular expression string to ensure things like hyphens and square brackets, which Drafts uses in standard check mark syntax for example, is not translated to a special pattern identifier,but remains intact and interpreted as the litral character.
RegExp.TA_escape = function(p_strRegEx)
{
    return p_strRegEx.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Counts the number of words in the string
String.prototype.TA_countWords = function()
{
    if (this.length > 0) {
        return this.match(/([^\u0000-\u007F]|\w)+/g).length;
    }
    //Empty strings means no words
    return 0;
};


//Counts the number of characters in the string, but new lines are excluded.
String.prototype.TA_lengthExclLineBreaks = function()
{
    if (this.length > 0) {
        return this.replace(/\n/g, "").length;
    }
    //Empty strings means no characters
    return 0;
};


//Counts the number of lines in the string.
//  Pass in a base of 0 or 1, defaults to 0
//	   0 = if string is empty count it as 0 lines (default)
//	   1 = if string is empty count it as 1 line
String.prototype.TA_countLines = function(p_intBase = 0)
{
	if (this.length > 0)
	{
		return this.split(/\n/).length;
	}
	return p_intBase;
}


// Returns the original text with an "s" on the end when the numeric value passed in is not 1.
// Useful when passing in a count such that if it is greater than 1 it will add the "s".
String.prototype.TA_pluralise = function(p_intCount)
{
	if (p_intCount == 1)
	{
		return this;
	}
	return this + "s";
}


// Returns first character of the string.
String.prototype.TA_head = function()
{
	return this.slice(0, 1);
}


// Returns second and subsequent characters of the string.
String.prototype.TA_tail = function()
{
	return this.slice(1);
}


// Normalises (NFC mode) and upper cases the string.
String.prototype.TA_toUpperCase = function()
{
	return this.normalize().toUpperCase();
}


//  Normalises (NFC mode) and lower cases the string.
String.prototype.TA_toLowerCase = function()
{
	return this.normalize().toLowerCase();
}


// Normalises (NFC mode) and converts a string to title case
// This function is a slightly modified version of To Title Case 2.1
//	To Title Case 2.1 – http://individed.com/code/to-title-case/
//	Copyright © 2008–2013 David Gouch. Licensed under the MIT License.
String.prototype.TA_toTitleCase = function()
{
	let smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
	return this.normalize().replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title)
	{
		if (index > 0 && index + match.length !== title.length &&
			match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
			(title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
			title.charAt(index - 1).search(/[^\s-]/) < 0)
		{
			return match.toLowerCase();
		}

		if (match.substr(1).search(/[A-Z]|\../) > -1)
		{
			return match;
		}
		return match.charAt(0).toUpperCase() + match.substr(1);
	});
};


// Normalises (NFC mode) and convert the string to sentence case.
String.prototype.TA_toSentenceCase = function()
{
	return this.normalize().replace(/(^\w{1}|\.\s*\w{1})/gi, function(toReplace)
	{
		return toReplace.toUpperCase();
	});
}


// Normalises (NFC mode) and convert the string to Pascal case.
String.prototype.TA_toPascalCase = function()
{

	return this.normalize().toLowerCase().match(/[a-z]+/gi).map(function(strWord)
	{
		return strWord.charAt(0).toUpperCase() + strWord.substr(1).toLowerCase()
	}).join("");
}


// Normalises (NFC mode) and convert the string to Camel case.
String.prototype.TA_toCamelCase = function()
{

	let strBase = this.TA_toPascalCase();
	return strBase.TA_head().toLowerCase() + strBase.TA_tail();

}


// Normalises (NFC mode) and convert the string to Snake case.
String.prototype.TA_toSnakeCase = function()
{
	return this.TA_toPascalCase().split(/(?=[A-Z])/).join('_').toLowerCase();
}


// Normalises (NFC mode) and convert the string to Screaming Snake case.
String.prototype.TA_toScreamingSnakeCase = function()
{
	return this.TA_toPascalCase().split(/(?=[A-Z])/).join('_').toUpperCase();
}


// Normalises (NFC mode) and convert the string to Kebab case.
String.prototype.TA_toKebabCase = function()
{
	return this.TA_toPascalCase().split(/(?=[A-Z])/).join('-').toLowerCase();
}


// Normalises (NFC mode) and convert the string to Train case.
String.prototype.TA_toTrainCase = function()
{
	return this.TA_toPascalCase().split(/(?=[A-Z])/).join('-').toUpperCase();
}


// Searches the string for the first index of a regular expression based match.
String.prototype.TA_regexIndexOf = function(p_objRegExMatch, p_intStartAt = 0)
{
    let intMatchPos = this.substring(p_intStartAt).search(p_objRegExMatch);
    if (intMatchPos >= 0) return intMatchPos + p_intStartAt;
    else return intMatchPos;
}


// Searches a string for the last index of a regular expression based match
String.prototype.TA_regexLastIndexOf = function(p_objRegExMatch, p_intStartAt)
{
	//Initialise
	let objRegExMatch = (p_objRegExMatch.global) ? p_objRegExMatch : new RegExp(p_objRegExMatch.source, "g" + (p_objRegExMatch.ignoreCase ? "i" : "") + (p_objRegExMatch.multiLine ? "m" : ""));
	let intStartAt;
	let intLastIndexOf = -1;
    let intNext = 0;

	//Set the start position if one has not been passed in to be the end of the string.
	//Also ensure it is at least zero. 
    if (typeof (p_intStartAt) == "undefined") intStartAt = this.length;
	else if (p_intStartAt < 0) intStartAt = 0;
	else intStartAt = p_intStartAt;

	//Run the search on the defined sub-string - loop to find the highest position
	while ((objMatch = objRegExMatch.exec(this.substring(0, intStartAt + 1))) != null)
	{
        intLastIndexOf = objMatch.index;
        objRegExMatch.lastIndex = ++intNext;
	}
	
	//Return the position
    return intLastIndexOf;
}


// Removes lines containing no content, or whitespace only.
String.prototype.TA_removeBlankLines = function()
{
	//Remove lines containing whitespace only
	let strTemp = this.replace(/^\s*$(?:\r\n?|\n)/gm, '');
	//Remove any final empty line that might be in place
	return strTemp.replace(/\n$/g, '');
}


// Removes lines containing no content.
String.prototype.TA_removeEmptyLines = function()
{
	//Remove lines containing nothing
	let strTemp = this.replace(/^\n/gm, '');
	//Remove any final empty line that might be in place
	return strTemp.replace(/\n$/g, '');
}


// Removes leading whitespace from the lines of the string.
String.prototype.TA_removeWhitespaceLeading = function()
{
	//Remove any leading whitespace
	let strTemp = this.replace(/^\s+/gm, '');
	//Remove any final empty line that might be in place
	return strTemp.replace(/\n$/g, '');
}


// Removes trailing whitespace from the lines of the string.
String.prototype.TA_removeWhitespaceTrailing = function()
{
	//Remove any leading or trailing whitespace
	let strTemp = this.replace(/\s+$/gm, '');
	//Remove any initial empty line that might be in place
	return strTemp.replace(/^\n/g, '');
}


// Removes leading and trailing whitespace from the lines of the string.
String.prototype.TA_removeWhitespaceLeadingTrailing = function()
{
	//Remove any leading or trailing whitespace
	let strTemp = this.replace(/[^\S\r\n]+$/gm, '');
	strTemp = strTemp.replace(/^\s+/gm, '');
	strTemp = strTemp.replace(/\n$/g, '');
	return strTemp.replace(/^\n/g, '');
}


// Removes leading spaces and tabs from the lines of the string.
String.prototype.TA_removeSpaceTabLeading = function()
{
	//Remove any leading spaces or tabs
	return this.replace(/^ +|^\t+/gm, '');
}


// Removes trailing spaces and tabs from the lines of the string.
String.prototype.TA_removeSpaceTabTrailing = function()
{
	//Remove any trailing spaces or tabs
	return this.replace(/ +$|\t+$/gm, '');
}


// Removes leading and trailing spaces and tabs from the lines of the string.
String.prototype.TA_removeSpaceTabLeadingTrailing = function()
{
	//Remove any leading or trailing spaces or tabs
	let strTemp = this.replace(/^ +|^\t+/gm, '');
	return strTemp.replace(/ +$|\t+$/gm, '');
}


// Deduplicates lines, retaining the original order of first occurrence.
String.prototype.TA_deduplicateLines = function()
{
	//Initialise arrays for lines of original and final contents
    let astrOriginal = this.split("\n");
    let astrDeduplicated = [];

    //Loop through all existing lines
    for (let intIndex = 0; intIndex < astrOriginal.length; intIndex++)
    {
        //When a line isn't already found in the new content, add it in
        if (astrDeduplicated.indexOf(astrOriginal[intIndex]) == -1)
        {
            astrDeduplicated.push(astrOriginal[intIndex]);
        }
    }

    //Return the deuplicated array as a string (no blank line at the end)
    return astrDeduplicated.join("\n");
}


// When the string is an HTML string it returns the content between the first instance of the specified tag pair.
String.prototype.TA_htmlFirstTagContent = function(p_strTag)
{
	let regexMatch = new RegExp("<" + p_strTag + "[^>]*>([^<]+)<\/" + p_strTag + ">", "");
	return this.match(regexMatch)[1];
}


// When the string is an HTML string it returns the content between the first instance of the title tag pair.
String.prototype.TA_htmlTitle = function()
{
	return this.TA_htmlFirstTagContent("title");
}


// Checks if a string is valid JSON.
String.prototype.TA_isJSON = function()
{
	try 
	{
		JSON.parse(this);
	}
	catch (errorText)
	{
		console.TA_logError("Error caught by TA_isJSON()");
		console.log("	Message: " + errorText);
		console.log("	Processing: " + this);
		//Error, so return false
		return false;
	}
	//No error, so return true
	return true;
}


// Takes a drafts action URL and converts it into something more human readable.
String.prototype.TA_formatDraftsActionLinkToRead = function()
{
	//URL decode and replace the newline & tab markers with actual characters
	return decodeURIComponent(this).replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}


// Strip any trailing new line from a string.
String.prototype.TA_stripFinalNewLine = function()
{
	const NEWLINE = "\n";
    if(this.endsWith(NEWLINE)) return this.slice(0,-1 * NEWLINE.length);
    else return this;
}


// Wrap a string in single backticks for a Markdown span of code.
String.prototype.TA_mdCode = function()
{
	return "`" + this + "`";
}


// Wrap a string in triple backticks for a Markdown block of code.
String.prototype.TA_mdCodeBlock = function(p_strCodeType = "")
{
	return "```" + p_strCodeType + "\n" + this + "\n```";
}


// Wrap a string in triple backticks for a Markdown block of JavaScript.
String.prototype.TA_mdCodeBlockJS = function()
{
	return this.TA_mdCodeBlock("javascript");
}


// Wrap a string in triple backticks for a Markdown block of AppleScript.
String.prototype.TA_mdCodeBlockAS = function()
{
	return this.TA_mdCodeBlock("applescript");
}


// Wrap a string in triple backticks for a Markdown block of shell script.
String.prototype.TA_mdCodeBlockSH = function()
{
	return this.TA_mdCodeBlock("sh");
}

// Capitalise each word in a string.
String.prototype.TA_capitalise = function()
{
	return this.replace(/(?:^|\s|["'([{])+\S/g, strMatch => strMatch.toUpperCase());
};


// Prefix each word in a string with a string of text.
String.prototype.TA_prependWords = function(p_strPrefix)
{
	return this.replace(/(\b\w)/g, p_strPrefix + "$1");
};


// Suffix each word in a string with a string of text.
String.prototype.TA_appendWords = function(p_strSuffix)
{
	return this.replace(/(\w\b)/g, "$1" + p_strSuffix);
};


// Prefix and suffix each word in a string with strings of text.
String.prototype.TA_wrapWords = function(p_strPrefix, p_strSuffix)
{
	return this.TA_prependWords(p_strPrefix).TA_appendWords(p_strSuffix);
};


// Delimit each word in a string with a string of text.
String.prototype.TA_delimitWords = function(p_strDelimit)
{
	return this.TA_wrapWords(p_strDelimit, p_strDelimit);
};


// Return the file name from a file path.
String.prototype.TA_fileNameFromPath = function()
{
    return this.split('/').pop();
}


// Return the base name of a file from a file path or file name.
String.prototype.TA_fileNameBaseFromPath = function()
{
	if(this.indexOf(".") == -1) return this.TA_fileNameFromPath();
    else return this.TA_fileNameFromPath().split('.').slice(0, -1).join(".");
}


// Return the file extension of a file from a file path or file name.
String.prototype.TA_fileNameExtensionFromPath = function()
{
	if(this.indexOf(".") == -1) return "";
    else return this.TA_fileNameFromPath().split('.').pop();
}


// Return the file extension of a file from a file path or file name.
String.prototype.TA_fileNameRemoveExtensionFromPath = function()
{
	return this.TA_folderPathFromPath() + this.TA_fileNameBaseFromPath();
}


// Return the folder path from a file path.
String.prototype.TA_folderPathFromPath = function()
{
    return this.split('/').slice(0, -1).join("/") + "/";
}


// Return the string with the specified 0-based range replaced by the specified replacement text.
String.prototype.TA_overwriteRange0 = function(p_intStart, p_intEnd, p_strReplacement)
{
    return this.substring(0, p_intStart) + p_strReplacement + this.substring(p_intEnd + 1, this.length);
}


// Return the string with the specified 1-based range replaced by the specified replacement text.
String.prototype.TA_overwriteRange1 = function(p_intStart, p_intEnd, p_strReplacement)
{
    return this.substring(0, p_intStart - 1) + p_strReplacement + this.substring(p_intEnd, this.length);
}


// Return the string with the the specified text inserted after the specified 0-based index.
String.prototype.TA_insertAfter0 = function(p_intInsertAfter, p_strInsertText)
{
    return this.substring(0, p_intInsertAfter + 1) + p_strInsertText + this.substring(p_intInsertAfter + 1, this.length);
}


// Return the string with the the specified text inserted after the specified 1-based index.
String.prototype.TA_insertAfter1 = function(p_intInsertAfter, p_strInsertText)
{
    return this.substring(0, p_intInsertAfter) + p_strInsertText + this.substring(p_intInsertAfter, this.length);
}


// Replace all text matching keys with values from the object map passed in.
String.prototype.TA_replaceAllMap = function(p_objReplace)
{
	let strContent = this;
	for (const [strKey, strValue] of Object.entries(p_objReplace))
	{
		strContent = strContent.replaceAll(strKey, strValue);
	}
	return strContent;
}


// Applies a more extensive set of URL encoding to a set of characters than `encodeURIComponent()`.
String.prototype.TA_encodeURI = function()
{
	//URI encode the text, then run an additional set of find and replace based on JSON in the library settings.
	return encodeURIComponent(this).TA_replaceAllMap(tadLib.encodeMap);
}

/**
 * This is the set of extensions to the Workspace object
 */
// Returns an array of all Workspace names.
Workspace.TA_getAllWorkspaceNames = function ()
{
    var strWS = [];
    this.getAll().forEach(function (wsItem) {
        strWS.push(wsItem.name);
    });
    return strWS;
};

// Loads a named Workspace.
Workspace.TA_selectWorkspace = function(p_strMessage)
{
	let astrWorkspaces = this.TA_getAllWorkspaceNames();
	if(astrWorkspaces.length == 0)
	{
		context.cancel("Cannot Load Workspace: No Workspaces Available");
		return "";
	}
	else if (astrWorkspaces.length == 1)
	{
		app.displayInfoMessage("Selected only available workspace.");
		return astrWorkspaces[0];
	}
	else
	{
		return Prompt.TA_promptButtonArray("Workspaces", p_strMessage, astrWorkspaces);
	}
}

// Prompt the user to select a workspace to load.
Workspace.TA_selectLoadWorkspaceByButton = function(p_bShowDraftsList = false)
{
	let strWS = this.TA_selectWorkspace("Switch to workspace:");
    if (strWS.length > 0) 
    {
        let wsSelected = Workspace.find(strWS);
        if (wsSelected === undefined) app.displayWarningMessage("Workspace " + strWS + "not found.")
        else
        {
            app.displayInfoMessage("Loading workspace '" + strWS + "'...");
            app.applyWorkspace(wsSelected);
            if (p_bShowDraftsList) app.showDraftList();
        }
    }
    else app.displayWarningMessage("No workspace to load.");
    return;
}


// Load a worksapce by name.
Workspace.TA_loadWorkspaceByName = function(p_strWorkspaceName)
{
	let wsLoad = Workspace.find(p_strWorkspaceName);
    if (wsLoad === undefined)
    {
        app.TA_displayErrorMessage(`Workspace ${p_strWorkspaceName} not found.`);
        return false;
    }
    else return app.applyWorkspace(wsLoad);
}


class TadData
{
    // Creates new instance of TadData class.
    constructor(p_strPath)
    {
        //Set the file path and load in the existing file
        this.dataPath = p_strPath;
        this.TA_load();
	}

    
	// Load data from file.
	TA_load()
	{
		let fmCloud = FileManager.createCloud();
		let objStoredData = fmCloud.readJSON(this.dataPath);
		if (objStoredData != undefined)
		{
			//Merge in the data
			let objDataCombined = this;
			objDataCombined = Object.assign(objDataCombined, objStoredData);
			return true;
		}
		else return false;
	}
    

    // Store the current object properties in the data file.
    TA_store()
	{
		//Save all values
        let fmCloud = FileManager.createCloud();
		return fmCloud.writeJSON(this.dataPath, this);
    }


    // Save a key value pair to file, where the key can be expressed as a path.
    TA_save(p_strPath, p_objValue)
	{
        //Split any path we have
        let astrPath = p_strPath.split(".");

        //Create a reference object, iterate over the path to the right location,
        //then add the key-value pair at that point. As a reference, this will
        //therefore apply to the main item.
        let objOp = this;
        for (let intElement = 0; intElement < astrPath.length - 1; intElement++)
        {
            let objElement = astrPath[intElement];
            if( !objOp[objElement] ) objOp[objElement] = {};
            objOp = objOp[objElement];
        }
        objOp[astrPath[astrPath.length - 1]] = p_objValue;
        
		//Save the updated JSON to file
		return this.TA_store();
    }


    // Delete a key value pair to file, where the key can be expressed as a path.
    TA_delete(p_strPath)
	{
        //Split any path we have
        let astrPath = p_strPath.split(".");

        //Create a reference object, iterate over the path to the right location,
        //then delete the key-value pair at that point. As a reference, this will
        //therefore apply to the main item.
        let objOp = this;
        for (let intElement = 0; intElement < astrPath.length - 1; intElement++)
        {
            objOp = objOp[astrPath[intElement]];
        }
        delete objOp[astrPath.pop()];
        
		//Save the updated JSON to file
		return this.TA_store();
    }


    // Return the value of a key, which can be expressed as a path.
    TA_value(p_strPath)
    {
        let objData = this;
        return p_strPath.split('.').reduce((objData, objProperty) => objData[objProperty], objData);
    }


    // Add a numeric value to the value of the specified key, which can be expressed as a path.
    TA_addition(p_strPath, p_numValue)
	{
		//Save the updated value to file
		return this.TA_save(p_strPath, this.TA_value(p_strPath) + p_numValue);
    }


    // Deduct a numeric value from the value of the specified key, which can be expressed as a path.
    TA_subtraction(p_strPath, p_numValue)
	{
		//Save the updated value to file
		return this.TA_addition(p_strPath, -1 * p_numValue);
    }


    // Add a prefix to the value of the specified key, which can be expressed as a path.
    TA_prefix(p_strPath, p_strPrefix)
	{
        //Save the updated value to file
		return this.TA_save(p_strPath, p_strPrefix + this.TA_value(p_strPath));
    }


    // Add a suffix to the value of the specified key, which can be expressed as a path.
    TA_suffix(p_strPath, p_strSuffix)
	{
		//Save the updated value to file
		return this.TA_save(p_strPath, this.TA_value(p_strPath) + p_strSuffix);
    }
}

//Make a gloablly available library data object
var tadData = new TadData(tadLib.dataPath);


class TadConsole
{
	// Constructor for the object.
	constructor(p_strFilePath = "/Library/Scripts/tadcon.json")
	{
		//Initialise the path
		this.path = p_strFilePath;
		this.log = [];

		//Try to read in the console file
		let fmCloud = FileManager.createCloud();
		let objConsole = fmCloud.readJSON(this.path);
		if (objConsole === undefined)
		{
			//Create the console file from the object
			this.TA_saveLog();
		}
		else
		{
			//Merge in any updated settings
			let objTest = this;
			objTest = Object.assign(objTest, objConsole);
		}
		return;
	}

	// Add a log entry to the console object instance.
	TA_addEntry(p_strEntry, p_strType = "", p_strCode = "")
	{
		let dtNow = tadMisc.TA_getTimestampyyyyMMddhhmmssxxx();
		let jsonLogEntry = {};
		jsonLogEntry.stamp = dtNow;
		//We'll always write the optional data as it makes working with the data much easier later on
		jsonLogEntry.type = p_strType;
		jsonLogEntry.code = p_strCode;
		jsonLogEntry.entry = p_strEntry;
		this.log.push(jsonLogEntry);       
		return;
	}

	// Add an entry to the console object and save any unsaved console updates to file.
	TA_saveEntry(p_strEntry, p_strType = "", p_strCode = "")
	{
		this.TA_addEntry(p_strEntry, p_strType, p_strCode);
		return this.TA_saveLog();
	}

	// Save the console object to file.
	TA_saveLog()
	{
		//Initialise
		let fmCloud = FileManager.createCloud();

		//Prepare snapshot data on object prior to save

		//Update time
		this.lastSaved = tadMisc.TA_getTimestampyyyyMMddhhmmssxxx();

		//Details of Drafts action being executed
		this.lastAction = {};
		this.lastAction.name = action.name;
		this.lastAction.uuid = action.uuid;

		//Details of draft being executed upon
		this.lastDraft = {};
		this.lastDraft.uuid = draft.uuid;
		//Include the details of the version being executed upon
		this.lastDraft.version = {}
		this.lastDraft.version.number = draft.versions.length;
		//Only try and log the next two properties if there's a version to log details for
        if (draft.versions.length > 0)
        {
		    this.lastDraft.version.uuid = draft.versions[0].uuid;
            this.lastDraft.version.createdAt = "" + draft.versions[0].createdAt;
        }

		//Update the log file
		return fmCloud.writeJSON(this.path, this);
	}

	// Clear all log entries from the console object.
	TA_clearLog()
	{
		this.log = [];
		return;
	}

	// Clear all log entries from the console object and file.
	TA_clearSaveLog()
	{
		this.TA_clearLog();
		return this.TA_saveLog();
	}

	// Delete the log file.
	TA_deleteLog()
	{
		let fmCloud = FileManager.createCloud();
		return fmCloud.TA_delete(this.path);
	}


	// Return the array of log elements filtered to include on a key by a single match.
	TA_filterLogInclude(p_strKey, p_strMatch)
	{
		return this.log.filter(function (element)
			{
				return element[p_strKey] == p_strMatch;
			});
	}

	// Return the array of log elements filtered to exclude on a key by a single match.
	TA_filterLogExclude(p_strKey, p_strMatch)
	{
		return this.log.filter(function (element)
			{
				return element[p_strKey] != p_strMatch;
			});
	}

	// Display the log using a filterable, sortable table layout.
	TA_previewLogTable(p_bFull = true)
	{
		let previewLog = HTMLPreview.create();
		let strLog = JSON.stringify(this.log);

		let strConfig;
		let strTableContent;
		if (p_bFull)
		{
			strConfig = `let table = $('#tableLog').DataTable( {
				"data" : astrLogEntries,
				"order" : [[ 0, 'asc' ]],
				"orderCellsTop" : true,
				"fixedHeader" : true,
				"pageLength": 25,
				"columns" : [
					{ "data" : "stamp" },
					{ "data" : "type" },
					{ "data" : "code" },
					{ "data" : "entry" }
				],
				"columnDefs": [
					{ "width": "180px", "targets": 0 },
					{ "width": "10%", "targets": 1 },
					{ "width": "5%", "targets": 2 }
				]
			} );`

			strTableContent = `<thead>
			<tr>
				<th>Timestamp</th>
				<th>Type</th>
				<th>Code</th>
				<th>Entry</th>
			</tr>
		</thead>
		<tbody>
		</tbody>
		<tfoot>
			<tr>
				<th>Timestamp</th>
				<th>Type</th>
				<th>Code</th>
				<th>Entry</th>
			</tr>
		</tfoot>`
		}
		else
		{
			strConfig = `let table = $('#tableLog').DataTable( {
				"data" : astrLogEntries,
				"order" : [[ 0, 'asc' ]],
				"orderCellsTop" : true,
				"fixedHeader" : true,
				"pageLength": 25,
				"columns" : [
					{ "data" : "stamp" },
					{ "data" : "entry" }
				],
				"columnDefs": [
					{ "width": "180px", "targets": 0 }
				]
			} );`

			strTableContent = `<thead>
			<tr>
				<th>Timestamp</th>
				<th>Entry</th>
			</tr>
		</thead>
		<tbody>
		</tbody>
		<tfoot>
			<tr>
				<th>Timestamp</th>
				<th>Entry</th>
			</tr>
		</tfoot>`
		}

		let strHTML = `<html>
			<head>
				<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/jq-3.3.1/dt-1.10.21/b-1.6.2/b-colvis-1.6.2/b-print-1.6.2/cr-1.5.2/fh-3.1.7/kt-2.5.2/sp-1.1.1/datatables.min.css"/>
				<script type="text/javascript" src="https://cdn.datatables.net/v/dt/jq-3.3.1/dt-1.10.21/b-1.6.2/b-colvis-1.6.2/b-print-1.6.2/cr-1.5.2/fh-3.1.7/kt-2.5.2/sp-1.1.1/datatables.min.js"></script>
				<script>
					$(document).ready(function()
					{
					
						// Setup - add a text input to each footer cell
						$('#tableLog thead tr').clone(true).appendTo( '#tableLog thead' );
						$('#tableLog thead tr:eq(1) th').each( function (i) {
							var title = $(this).text();
							$(this).html( '<input type="text" placeholder="Search '+title+'" />' );
					
							$( 'input', this ).on( 'keyup change', function () {
								if ( table.column(i).search() !== this.value ) {
									table
										.column(i)
										.search( this.value )
										.draw();
								}
							} );
						} );
					
						${strConfig};
					
					
					} );
				</script>
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<style>
				body
				{
					font-family: Arial;
					font-size: small;
				}
				/*
				* Table styles
				*/
			   table.dataTable {
				 width: 100%;
				 margin: 0 auto;
				 clear: both;
				 border-collapse: separate;
				 border-spacing: 0;
				 /*
				  * Header and footer styles
				  */
				 /*
				  * Body styles
				  */ }
				 table.dataTable thead th,
				 table.dataTable tfoot th {
				   font-weight: bold; }
				 table.dataTable thead th,
				 table.dataTable thead td {
				   padding: 10px 18px;
				   border-bottom: 1px solid #111111; }
				   table.dataTable thead th:active,
				   table.dataTable thead td:active {
					 outline: none; }
				 table.dataTable tfoot th,
				 table.dataTable tfoot td {
				   padding: 10px 18px 6px 18px;
				   border-top: 1px solid #111111; }
				 table.dataTable thead .sorting,
				 table.dataTable thead .sorting_asc,
				 table.dataTable thead .sorting_desc,
				 table.dataTable thead .sorting_asc_disabled,
				 table.dataTable thead .sorting_desc_disabled {
				   cursor: pointer;
				   *cursor: hand;
				   background-repeat: no-repeat;
				   background-position: center right; }
				 table.dataTable thead .sorting {
				   background-image: url("../images/sort_both.png"); }
				 table.dataTable thead .sorting_asc {
				   background-image: url("../images/sort_asc.png"); }
				 table.dataTable thead .sorting_desc {
				   background-image: url("../images/sort_desc.png"); }
				 table.dataTable thead .sorting_asc_disabled {
				   background-image: url("../images/sort_asc_disabled.png"); }
				 table.dataTable thead .sorting_desc_disabled {
				   background-image: url("../images/sort_desc_disabled.png"); }
				 table.dataTable tbody tr {
				   background-color: white; }
				   table.dataTable tbody tr.selected {
					 background-color: #abc3d1; }
				 table.dataTable tbody th,
				 table.dataTable tbody td {
				   padding: 8px 10px; }
				 table.dataTable.row-border tbody th, table.dataTable.row-border tbody td, table.dataTable.display tbody th, table.dataTable.display tbody td {
				   border-top: 1px solid #dddddd; }
				 table.dataTable.row-border tbody tr:first-child th,
				 table.dataTable.row-border tbody tr:first-child td, table.dataTable.display tbody tr:first-child th,
				 table.dataTable.display tbody tr:first-child td {
				   border-top: none; }
				 table.dataTable.cell-border tbody th, table.dataTable.cell-border tbody td {
				   border-top: 1px solid #dddddd;
				   border-right: 1px solid #dddddd; }
				 table.dataTable.cell-border tbody tr th:first-child,
				 table.dataTable.cell-border tbody tr td:first-child {
				   border-left: 1px solid #dddddd; }
				 table.dataTable.cell-border tbody tr:first-child th,
				 table.dataTable.cell-border tbody tr:first-child td {
				   border-top: none; }
				 table.dataTable.stripe tbody tr.odd, table.dataTable.display tbody tr.odd {
				   background-color: #f9f9f9; }
				   table.dataTable.stripe tbody tr.odd.selected, table.dataTable.display tbody tr.odd.selected {
					 background-color: #a6becc; }
				 table.dataTable.hover tbody tr:hover, table.dataTable.display tbody tr:hover {
				   background-color: whitesmoke; }
				   table.dataTable.hover tbody tr:hover.selected, table.dataTable.display tbody tr:hover.selected {
					 background-color: #a4bbc9; }
				 table.dataTable.order-column tbody tr > .sorting_1,
				 table.dataTable.order-column tbody tr > .sorting_2,
				 table.dataTable.order-column tbody tr > .sorting_3, table.dataTable.display tbody tr > .sorting_1,
				 table.dataTable.display tbody tr > .sorting_2,
				 table.dataTable.display tbody tr > .sorting_3 {
				   background-color: #f9f9f9; }
				 table.dataTable.order-column tbody tr.selected > .sorting_1,
				 table.dataTable.order-column tbody tr.selected > .sorting_2,
				 table.dataTable.order-column tbody tr.selected > .sorting_3, table.dataTable.display tbody tr.selected > .sorting_1,
				 table.dataTable.display tbody tr.selected > .sorting_2,
				 table.dataTable.display tbody tr.selected > .sorting_3 {
				   background-color: #a7bfcc; }
				 table.dataTable.display tbody tr.odd > .sorting_1, table.dataTable.order-column.stripe tbody tr.odd > .sorting_1 {
				   background-color: #f1f1f1; }
				 table.dataTable.display tbody tr.odd > .sorting_2, table.dataTable.order-column.stripe tbody tr.odd > .sorting_2 {
				   background-color: #f3f3f3; }
				 table.dataTable.display tbody tr.odd > .sorting_3, table.dataTable.order-column.stripe tbody tr.odd > .sorting_3 {
				   background-color: whitesmoke; }
				 table.dataTable.display tbody tr.odd.selected > .sorting_1, table.dataTable.order-column.stripe tbody tr.odd.selected > .sorting_1 {
				   background-color: #a1b8c5; }
				 table.dataTable.display tbody tr.odd.selected > .sorting_2, table.dataTable.order-column.stripe tbody tr.odd.selected > .sorting_2 {
				   background-color: #a2b9c7; }
				 table.dataTable.display tbody tr.odd.selected > .sorting_3, table.dataTable.order-column.stripe tbody tr.odd.selected > .sorting_3 {
				   background-color: #a4bbc8; }
				 table.dataTable.display tbody tr.even > .sorting_1, table.dataTable.order-column.stripe tbody tr.even > .sorting_1 {
				   background-color: #f9f9f9; }
				 table.dataTable.display tbody tr.even > .sorting_2, table.dataTable.order-column.stripe tbody tr.even > .sorting_2 {
				   background-color: #fbfbfb; }
				 table.dataTable.display tbody tr.even > .sorting_3, table.dataTable.order-column.stripe tbody tr.even > .sorting_3 {
				   background-color: #fdfdfd; }
				 table.dataTable.display tbody tr.even.selected > .sorting_1, table.dataTable.order-column.stripe tbody tr.even.selected > .sorting_1 {
				   background-color: #a7bfcc; }
				 table.dataTable.display tbody tr.even.selected > .sorting_2, table.dataTable.order-column.stripe tbody tr.even.selected > .sorting_2 {
				   background-color: #a8c0ce; }
				 table.dataTable.display tbody tr.even.selected > .sorting_3, table.dataTable.order-column.stripe tbody tr.even.selected > .sorting_3 {
				   background-color: #aac2d0; }
				 table.dataTable.display tbody tr:hover > .sorting_1, table.dataTable.order-column.hover tbody tr:hover > .sorting_1 {
				   background-color: #eaeaea; }
				 table.dataTable.display tbody tr:hover > .sorting_2, table.dataTable.order-column.hover tbody tr:hover > .sorting_2 {
				   background-color: #ebebeb; }
				 table.dataTable.display tbody tr:hover > .sorting_3, table.dataTable.order-column.hover tbody tr:hover > .sorting_3 {
				   background-color: #eeeeee; }
				 table.dataTable.display tbody tr:hover.selected > .sorting_1, table.dataTable.order-column.hover tbody tr:hover.selected > .sorting_1 {
				   background-color: #9cb3bf; }
				 table.dataTable.display tbody tr:hover.selected > .sorting_2, table.dataTable.order-column.hover tbody tr:hover.selected > .sorting_2 {
				   background-color: #9eb4c1; }
				 table.dataTable.display tbody tr:hover.selected > .sorting_3, table.dataTable.order-column.hover tbody tr:hover.selected > .sorting_3 {
				   background-color: #a0b6c3; }
				 table.dataTable.no-footer {
				   border-bottom: 1px solid #111111; }
				 table.dataTable.nowrap th, table.dataTable.nowrap td {
				   white-space: nowrap; }
				 table.dataTable.compact thead th,
				 table.dataTable.compact thead td {
				   padding: 4px 17px; }
				 table.dataTable.compact tfoot th,
				 table.dataTable.compact tfoot td {
				   padding: 4px; }
				 table.dataTable.compact tbody th,
				 table.dataTable.compact tbody td {
				   padding: 4px; }
				 table.dataTable th.dt-left,
				 table.dataTable td.dt-left {
				   text-align: left; }
				 table.dataTable th.dt-center,
				 table.dataTable td.dt-center,
				 table.dataTable td.dataTables_empty {
				   text-align: center; }
				 table.dataTable th.dt-right,
				 table.dataTable td.dt-right {
				   text-align: right; }
				 table.dataTable th.dt-justify,
				 table.dataTable td.dt-justify {
				   text-align: justify; }
				 table.dataTable th.dt-nowrap,
				 table.dataTable td.dt-nowrap {
				   white-space: nowrap; }
				 table.dataTable thead th.dt-head-left,
				 table.dataTable thead td.dt-head-left,
				 table.dataTable tfoot th.dt-head-left,
				 table.dataTable tfoot td.dt-head-left {
				   text-align: left; }
				 table.dataTable thead th.dt-head-center,
				 table.dataTable thead td.dt-head-center,
				 table.dataTable tfoot th.dt-head-center,
				 table.dataTable tfoot td.dt-head-center {
				   text-align: center; }
				 table.dataTable thead th.dt-head-right,
				 table.dataTable thead td.dt-head-right,
				 table.dataTable tfoot th.dt-head-right,
				 table.dataTable tfoot td.dt-head-right {
				   text-align: right; }
				 table.dataTable thead th.dt-head-justify,
				 table.dataTable thead td.dt-head-justify,
				 table.dataTable tfoot th.dt-head-justify,
				 table.dataTable tfoot td.dt-head-justify {
				   text-align: justify; }
				 table.dataTable thead th.dt-head-nowrap,
				 table.dataTable thead td.dt-head-nowrap,
				 table.dataTable tfoot th.dt-head-nowrap,
				 table.dataTable tfoot td.dt-head-nowrap {
				   white-space: nowrap; }
				 table.dataTable tbody th.dt-body-left,
				 table.dataTable tbody td.dt-body-left {
				   text-align: left; }
				 table.dataTable tbody th.dt-body-center,
				 table.dataTable tbody td.dt-body-center {
				   text-align: center; }
				 table.dataTable tbody th.dt-body-right,
				 table.dataTable tbody td.dt-body-right {
				   text-align: right; }
				 table.dataTable tbody th.dt-body-justify,
				 table.dataTable tbody td.dt-body-justify {
				   text-align: justify; }
				 table.dataTable tbody th.dt-body-nowrap,
				 table.dataTable tbody td.dt-body-nowrap {
				   white-space: nowrap; }
				
			   table.dataTable,
			   table.dataTable th,
			   table.dataTable td {
				 box-sizing: content-box; }
				
			   /*
				* Control feature layout
				*/
			   .dataTables_wrapper {
				 position: relative;
				 clear: both;
				 *zoom: 1;
				 zoom: 1; }
				 .dataTables_wrapper .dataTables_length {
				   float: left; }
				 .dataTables_wrapper .dataTables_filter {
				   float: right;
				   text-align: right; }
				   .dataTables_wrapper .dataTables_filter input {
					 margin-left: 0em; float: left; }
				 .dataTables_wrapper .dataTables_info {
				   clear: both;
				   float: left;
				   padding-top: 0.755em; }
				 .dataTables_wrapper .dataTables_paginate {
				   float: right;
				   text-align: right;
				   padding-top: 0.25em; }
				   .dataTables_wrapper .dataTables_paginate .paginate_button {
					 box-sizing: border-box;
					 display: inline-block;
					 min-width: 1.5em;
					 padding: 0.5em 1em;
					 margin-left: 2px;
					 text-align: center;
					 text-decoration: none !important;
					 cursor: pointer;
					 *cursor: hand;
					 color: #333333 !important;
					 border: 1px solid transparent;
					 border-radius: 2px; }
					 .dataTables_wrapper .dataTables_paginate .paginate_button.current, .dataTables_wrapper .dataTables_paginate .paginate_button.current:hover {
					   color: #333333 !important;
					   border: 1px solid #376daa;
					   background-color: #fcfdfe;
					   background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #fcfdfe), color-stop(100%, #90b3db));
					   /* Chrome,Safari4+ */
					   background: -webkit-linear-gradient(top, #fcfdfe 0%, #90b3db 100%);
					   /* Chrome10+,Safari5.1+ */
					   background: -moz-linear-gradient(top, #fcfdfe 0%, #90b3db 100%);
					   /* FF3.6+ */
					   background: -ms-linear-gradient(top, #fcfdfe 0%, #90b3db 100%);
					   /* IE10+ */
					   background: -o-linear-gradient(top, #fcfdfe 0%, #90b3db 100%);
					   /* Opera 11.10+ */
					   background: linear-gradient(to bottom, #fcfdfe 0%, #90b3db 100%);
					   /* W3C */ }
					 .dataTables_wrapper .dataTables_paginate .paginate_button.disabled, .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:hover, .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:active {
					   cursor: default;
					   color: #666 !important;
					   border: 1px solid transparent;
					   background: transparent;
					   box-shadow: none; }
					 .dataTables_wrapper .dataTables_paginate .paginate_button:hover {
					   color: white !important;
					   border: 1px solid #111111;
					   background-color: #585858;
					   background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #585858), color-stop(100%, #111111));
					   /* Chrome,Safari4+ */
					   background: -webkit-linear-gradient(top, #585858 0%, #111111 100%);
					   /* Chrome10+,Safari5.1+ */
					   background: -moz-linear-gradient(top, #585858 0%, #111111 100%);
					   /* FF3.6+ */
					   background: -ms-linear-gradient(top, #585858 0%, #111111 100%);
					   /* IE10+ */
					   background: -o-linear-gradient(top, #585858 0%, #111111 100%);
					   /* Opera 11.10+ */
					   background: linear-gradient(to bottom, #585858 0%, #111111 100%);
					   /* W3C */ }
					 .dataTables_wrapper .dataTables_paginate .paginate_button:active {
					   outline: none;
					   background-color: #2b2b2b;
					   background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #2b2b2b), color-stop(100%, #0c0c0c));
					   /* Chrome,Safari4+ */
					   background: -webkit-linear-gradient(top, #2b2b2b 0%, #0c0c0c 100%);
					   /* Chrome10+,Safari5.1+ */
					   background: -moz-linear-gradient(top, #2b2b2b 0%, #0c0c0c 100%);
					   /* FF3.6+ */
					   background: -ms-linear-gradient(top, #2b2b2b 0%, #0c0c0c 100%);
					   /* IE10+ */
					   background: -o-linear-gradient(top, #2b2b2b 0%, #0c0c0c 100%);
					   /* Opera 11.10+ */
					   background: linear-gradient(to bottom, #2b2b2b 0%, #0c0c0c 100%);
					   /* W3C */
					   box-shadow: inset 0 0 3px #111; }
				   .dataTables_wrapper .dataTables_paginate .ellipsis {
					 padding: 0 1em; }
				 .dataTables_wrapper .dataTables_processing {
				   position: absolute;
				   top: 50%;
				   left: 50%;
				   width: 100%;
				   height: 40px;
				   margin-left: -50%;
				   margin-top: -25px;
				   padding-top: 20px;
				   text-align: center;
				   font-size: 1.2em;
				   background-color: white;
				   background: -webkit-gradient(linear, left top, right top, color-stop(0%, rgba(255, 255, 255, 0)), color-stop(25%, rgba(255, 255, 255, 0.9)), color-stop(75%, rgba(255, 255, 255, 0.9)), color-stop(100%, rgba(255, 255, 255, 0)));
				   background: -webkit-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.9) 75%, rgba(255, 255, 255, 0) 100%);
				   background: -moz-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.9) 75%, rgba(255, 255, 255, 0) 100%);
				   background: -ms-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.9) 75%, rgba(255, 255, 255, 0) 100%);
				   background: -o-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.9) 75%, rgba(255, 255, 255, 0) 100%);
				   background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.9) 75%, rgba(255, 255, 255, 0) 100%); }
				 .dataTables_wrapper .dataTables_length,
				 .dataTables_wrapper .dataTables_filter,
				 .dataTables_wrapper .dataTables_info,
				 .dataTables_wrapper .dataTables_processing,
				 .dataTables_wrapper .dataTables_paginate {
				   color: #333333; }
				 .dataTables_wrapper .dataTables_scroll {
				   clear: both; }
				   .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody {
					 *margin-top: -1px;
					 -webkit-overflow-scrolling: touch; }
					 .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > thead > tr > th, .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > thead > tr > td, .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > tbody > tr > th, .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > tbody > tr > td {
					   vertical-align: middle; }
					 .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > thead > tr > th > div.dataTables_sizing,
					 .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > thead > tr > td > div.dataTables_sizing, .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > tbody > tr > th > div.dataTables_sizing,
					 .dataTables_wrapper .dataTables_scroll div.dataTables_scrollBody > table > tbody > tr > td > div.dataTables_sizing {
					   height: 0;
					   overflow: hidden;
					   margin: 0 !important;
					   padding: 0 !important; }
				 .dataTables_wrapper.no-footer .dataTables_scrollBody {
				   border-bottom: 1px solid #111111; }
				 .dataTables_wrapper.no-footer div.dataTables_scrollHead table.dataTable,
				 .dataTables_wrapper.no-footer div.dataTables_scrollBody > table {
				   border-bottom: none; }
				 .dataTables_wrapper:after {
				   visibility: hidden;
				   display: block;
				   content: "";
				   clear: both;
				   height: 0; }
				
			   @media screen and (max-width: 767px) {
				 .dataTables_wrapper .dataTables_info,
				 .dataTables_wrapper .dataTables_paginate {
				   float: none;
				   text-align: center; }
				 .dataTables_wrapper .dataTables_paginate {
				   margin-top: 0.5em; } }
			   @media screen and (max-width: 640px) {
				 .dataTables_wrapper .dataTables_length,
				 .dataTables_wrapper .dataTables_filter {
				   float: none;
				   text-align: center; }
				 .dataTables_wrapper .dataTables_filter {
				   margin-top: 0.5em; } }
				</style>
			</head>
			<body>
				<script>
					var astrLogEntries = ${strLog};
				</script>
				<h1>Log Viewer</h1>
				<table id="tableLog" class="display compact stripe" style="width:100%">
					${strTableContent}
				</table>
			</body>
		</html>`;

		return previewLog.show(strHTML);
	}


	// Convert an array of log entries to a sorted plain text format suitable for display.
	TA_arrayToSimpleText(p_jsonArray, p_bSortOldToNew = true)
	{
		let astrOutput = [];
		p_jsonArray.forEach(function(jsonLogEntry)
		{
			let strTemp = jsonLogEntry.stamp;
			if (jsonLogEntry.type != "") strTemp += " - " + jsonLogEntry.type;
			if (jsonLogEntry.code != "") strTemp += " [" + jsonLogEntry.code + "]";
			strTemp += ": " + jsonLogEntry.entry;
			astrOutput.push(strTemp);
		});
		astrOutput = astrOutput.sort();
		if (!p_bSortOldToNew) astrOutput = astrOutput.reverse();
		return astrOutput.join("\n");	
	}


	// Convert the array of log entries for the console object instance to a sorted plain text format suitable for display.
	TA_logToSimpleText(p_bSortOldToNew = true)
	{
		return this.TA_arrayToSimpleText(this.log, p_bSortOldToNew);
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is made.
	TA_logToSimpleTextInclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		return this.TA_arrayToSimpleText(this.TA_filterLogInclude(p_strKey, p_strMatch), p_bSortOldToNew);
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is not made.
	TA_logToSimpleTextExclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		return this.TA_arrayToSimpleText(this.TA_filterLogExclude(p_strKey, p_strMatch), p_bSortOldToNew);
	}


	// Convert the array of log entries for the console object instance to a sorted plain text format suitable for display, and place it on the clipboard.
	TA_logExportToClipboard(p_bSortOldToNew = true)
	{
		app.setClipboard(this.TA_logToSimpleText(p_bSortOldToNew));
		return;
	}

	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is made, and place it on the clipboard.
	TA_logExportToClipboardInclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		app.setClipboard(this.TA_logToSimpleTextInclude(p_strKey, p_strMatch, p_bSortOldToNew));
		return;
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is not made, and place it on the clipboard.
	TA_logExportToClipboardExclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		app.setClipboard(this.TA_logToSimpleTextExclude(p_strKey, p_strMatch, p_bSortOldToNew));
		return;
	}


	// Convert the array of log entries for the console object instance to a sorted plain text format suitable for display, and place it in a new draft.
	TA_logExportToDraft(p_bSortOldToNew = true)
	{
		return draft.TA_draftNew(this.TA_logToSimpleText(p_bSortOldToNew));
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is made, and place it in a new draft.
	TA_logExportToDraftInclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		return draft.TA_draftNew(this.TA_logToSimpleTextInclude(p_strKey, p_strMatch, p_bSortOldToNew));
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is not made, and place it in a new draft.
	TA_logExportToDraftExclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		return draft.TA_draftNew(this.TA_logToSimpleTextExclude(p_strKey, p_strMatch, p_bSortOldToNew));
	}


	// Convert the array of log entries for the console object instance to a sorted plain text format suitable for display, and insert it at the current cursor position.
	TA_logExportToInsert(p_bSortOldToNew = true)
	{
		let strReturn = editor.setSelectedText(this.TA_logToSimpleText(p_bSortOldToNew));
		editor.activate();
		return strReturn;
	}

	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is made, and insert it at the current cursor position.
	TA_logExportToInsertInclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		let strReturn = editor.setSelectedText(this.TA_logToSimpleTextInclude(p_strKey, p_strMatch, p_bSortOldToNew));
		editor.activate();
		return strReturn;
	}

	
	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is not made, and insert it at the current cursor position.
	TA_logExportToInsertExclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		let strReturn = editor.setSelectedText(this.TA_logToSimpleTextExclude(p_strKey, p_strMatch, p_bSortOldToNew));
		editor.activate();
		return strReturn;
	}

	// Convert the array of log entries for the console object instance to a sorted plain text format suitable for display, and display it in an alert.
	TA_logExportToAlert(p_bSortOldToNew = true)
	{
		alert(this.TA_logToSimpleText(p_bSortOldToNew));
		return;
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is made, and display it in an alert.
	TA_logExportToAlertInclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		alert(this.TA_logToSimpleTextInclude(p_strKey, p_strMatch, p_bSortOldToNew));
		return;
	}


	// Convert an array of log entries to a sorted plain text format suitable for display, including only log entries where a key match is not made, and display it in an alert.
	TA_logExportToAlertExclude(p_strKey, p_strMatch, p_bSortOldToNew = true)
	{
		alert(this.TA_logToSimpleTextExclude(p_strKey, p_strMatch, p_bSortOldToNew));
		return;
	}


	// Snapshot the log file.
	TA_snapshot()
	{
		return FileManager.createCloud().TA_snapshot(this.path);
	}


	// Log a set of text based log entries to log file.
	TA_logExportEntriesToFile(p_strContent, p_bTimeStamped = false, p_strFileExtension = "log")
	{
		// If there's a non-empty file extension, ensure we have a period in place for when we use it later
		let strFileExtension = "";
		if (p_strFileExtension.length > 0)
		{
			if(p_strFileExtension.startsWith(".")) strFileExtension = p_strFileExtension;
			else strFileExtension = "." + p_strFileExtension
		}

		//Build the output file path
		let strPath = "";
		if (p_bTimeStamped) strPath = this.path.TA_folderPathFromPath() + tadMisc.TA_getTimestampyyyyMMddhhmmss() 
			+ " " + this.path.TA_fileNameBaseFromPath() + strFileExtension;
		else strPath = this.path.TA_fileNameRemoveExtensionFromPath() + strFileExtension;

		//Write the file
		return FileManager.createCloud().writeString(strPath, p_strContent);
	}

	// Convert the array of log entries for the console object instance to a sorted plain text format and save to an optionally time stamped log file.
	TA_logExportToFile(p_bSortOldToNew = true, p_bTimeStamped = false, p_strFileExtension = "log")
	{
		return this.TA_logExportEntriesToFile(this.TA_logToSimpleText(p_bSortOldToNew), p_bTimeStamped, p_strFileExtension);
	}


	// Convert the array of log entries to a sorted plain text format and save to an optionally time stamped log file, including only log entries where a key match is made.
	TA_logExportToFileInclude(p_strKey, p_strMatch, p_bSortOldToNew = true, p_bTimeStamped = false, p_strFileExtension = "log")
	{
		return this.TA_logExportEntriesToFile(this.TA_logToSimpleTextInclude(p_strKey, p_strMatch, p_bSortOldToNew), p_bTimeStamped, p_strFileExtension);
	}


	// Convert the array of log entries to a sorted plain text format and save to an optionally time stamped log file, including only log entries where a key match is not made.
	TA_logExportToFileExclude(p_strKey, p_strMatch, p_bSortOldToNew = true, p_bTimeStamped = false, p_strFileExtension = "log")
	{
		return this.TA_logExportEntriesToFile(this.TA_logToSimpleTextExclude(p_strKey, p_strMatch, p_bSortOldToNew), p_bTimeStamped, p_strFileExtension);
	}


	//Query the log entries with filters and sort order to return a set of matching log entries.
	TA_filterLog(p_bSortOldToNew, p_strKey, p_strMatch, p_bInclude)
	{
		//Start off by initialising with all log entries.
		let aLogEntry = this.log;
		
		//If we need to include/exclude, then the key parameter will not be blank
		if (p_strKey != "")
		{
			if (p_bInclude) aLogEntry = this.log.filter(function (element){return element[p_strKey] == p_strMatch;});
			else aLogEntry = this.log.filter(function (element){return element[p_strKey] != p_strMatch;});
		}

		//Sort the log entries based upon the timestamp and the chronology specified.
		aLogEntry.sort(tadMisc.TA_JSONArraySorter("stamp"));
		if (!p_bSortOldToNew) aLogEntry = aLogEntry.reverse();

		return aLogEntry;
	}


	// Query the log entries, possibly filtered, for a positional match and return the log entry object.
	TA_filterLogEntry(p_intEntry, p_bSortOldToNew = true, p_strKey = "", p_strMatch = "", p_bInclude = true)
	{
		//Fetch the log entries we are to work with
		let aLogEntry = this.TA_filterLog(p_bSortOldToNew, p_strKey, p_strMatch, p_bInclude)

		//Set the retrieval index to be the corresponding array index within the bounds of the array.
		let intEntry = p_intEntry - 1;
		if (intEntry > aLogEntry.length - 1) intEntry = aLogEntry.length - 1;
		if (intEntry < 0) intEntry = 0;

		//Return the specified log entry
		if (aLogEntry[intEntry] == undefined) return {"stamp" : "", "type" : "", "code" : "", "entry" : ""};
		else return aLogEntry[intEntry];
	}


	// Query the log entries, possibly filtered, for a range of positional matched and return the array of matching log entry objects.
	TA_filterLogEntries(p_intEntryStart, p_intEntryEnd, p_bSortOldToNew = true, p_strKey = "", p_strMatch = "", p_bInclude = true)
	{
		//Fetch the log entries we are to work with
		let aLogEntry = this.TA_filterLog(p_bSortOldToNew, p_strKey, p_strMatch, p_bInclude)

		//Set the retrieval indicies to be the corresponding array index within the bounds of the array.
		let intEntryStart = p_intEntryStart - 1;
		if (intEntryStart > aLogEntry.length - 1) intEntryStart = aLogEntry.length - 1;
		if (intEntryStart < 0) intEntryStart = 0;
		let intEntryEnd = p_intEntryEnd - 1;
		if (intEntryEnd > aLogEntry.length - 1) intEntryEnd = aLogEntry.length - 1;
		if (intEntryEnd < 0) intEntryEnd = 0;

		//Add the in-range matched log entry objects to the output array
		let aLogEntryOutput = [];
		for (let intIndex = intEntryStart; intIndex <= intEntryEnd; intIndex++)
		{
			if (aLogEntry[intIndex] != undefined) aLogEntryOutput.push(aLogEntry[intIndex]);
		}

		//Return the output array
		return aLogEntryOutput;
	}


	// Returns the first log entry.
	TA_logEntryFirst()
	{
		return this.TA_filterLogEntry(1, true, "", "", true);
	}


	// Returns the last log entry.
	TA_logEntryLast()
	{
		return this.TA_filterLogEntry(1, false, "", "", true);
	}


	// Returns the first log entry of a specific type.
	TA_logEntryFirstType(p_strType)
	{
		return this.TA_filterLogEntry(1, true, "type", p_strType, true);
	}


	// Returns the last log entry of a specific type.
	TA_logEntryLastType(p_strType)
	{
		return this.TA_filterLogEntry(1, false, "type", p_strType, true);
	}


	// Returns the first log entry for a specific code.
	TA_logEntryFirstCode(p_strCode)
	{
		return this.TA_filterLogEntry(1, true, "code", p_strCode, true);
	}


	// Returns the last log entry for a specific code.
	TA_logEntryLastCode(p_strCode)
	{
		return this.TA_filterLogEntry(1, false, "code", p_strCode, true);
	}

	// Format the details for a single log entry to display.
	TA_logEntryFormat(p_logEntry)
	{
		let strOutput = p_logEntry.stamp + " ";
		if (p_logEntry.type != "") strOutput += p_logEntry.type;
		if (p_logEntry.code != "") strOutput += " (" + p_logEntry.code + ")";
		return strOutput + "\n" + p_logEntry.entry;
	}
}

//Make a gloablly available ThoughtAsylum Console object
var tadCon = new TadConsole();


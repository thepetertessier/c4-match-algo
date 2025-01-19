function exportArrayOfObjectsToSheet(arrayOfObjects, sheetName) {
  // Get the folder containing the script
  var scriptFileId = ScriptApp.getScriptId();
  var scriptFile = DriveApp.getFileById(scriptFileId);
  var scriptFolder = scriptFile.getParents().next();

  // Search for an existing sheet in the folder
  var files = scriptFolder.getFilesByName(sheetName);
  var sheet;

  if (files.hasNext()) {
    var file = files.next();
    sheet = SpreadsheetApp.open(file).getActiveSheet();
  } else {
    // If no sheet is found, create a new one
    var spreadsheet = SpreadsheetApp.create(sheetName);
    scriptFolder.addFile(DriveApp.getFileById(spreadsheet.getId()));
    DriveApp.getRootFolder().removeFile(DriveApp.getFileById(spreadsheet.getId())); // Remove from root folder
    sheet = spreadsheet.getActiveSheet();
  }

  // Clear previous data
  sheet.clear();

  // Extract headers from the first object in the array
  var headers = Object.keys(arrayOfObjects[0]);
  sheet.appendRow(headers);

  // Add each object as a row
  arrayOfObjects.forEach(obj => {
    var row = headers.map(header => obj[header]);
    sheet.appendRow(row);
  });

  Logger.log(`Data exported to Google Sheets named '${sheetName}' in the same directory as the script.`);
}

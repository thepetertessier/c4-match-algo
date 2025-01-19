const mentorFormResponseSheetId = '15MaTdBmDytbJAWGvKBKHbHmcvQl8sJ3GH1MNCvkstnc';
const menteeFormResponseSheetId = '1Q_eHcLzBrd-o_UuaPwSlNK_njBeZmuyYsvFU-KBHMFs';

function _getFormResponses(sheetId, sheetName) {
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  
  var headers = data[0];
  var responses = data.slice(1).map(row => {
    var response = {};
    row.forEach((cell, index) => {
      response[headers[index]] = cell;
    });
    return response;
  });

  return responses;
}

const getMentorFormResponses = () => _getFormResponses(mentorFormResponseSheetId, 'Form Responses 1');
const getMenteeFormResponses = () => _getFormResponses(menteeFormResponseSheetId, 'Form Responses 1');

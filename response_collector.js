const mentorFormResponseSheetId = '1vBkztM2cwWvnBOffdiiPAUD66i9AnoKerlnszaDrYPs';
const menteeFormResponseSheetId = '1vBkztM2cwWvnBOffdiiPAUD66i9AnoKerlnszaDrYPs';

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

const getMentorFormResponses = () => _getFormResponses(mentorFormResponseSheetId, 'Mentors');
const getMenteeFormResponses = () => _getFormResponses(menteeFormResponseSheetId, 'Mentees');

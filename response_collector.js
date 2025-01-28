const mentorFormResponseSheetId = '1pLGcv_udh43xM-uZkyd1-M1HJRNngrCAFqQ-UiGNS0g';
const menteeFormResponseSheetId = '1pLGcv_udh43xM-uZkyd1-M1HJRNngrCAFqQ-UiGNS0g';

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

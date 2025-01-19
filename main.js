/* Tips for running the algorithm automation:
 * After the forms are generated, manually create any sections, since this only creates text objects
 * Also manually change any themes, markdown for the description, and picture
 */

function main() {
  var algorithm = build_algorithm();

  // Generate forms
  // algorithm.generateForms();

  var mentorResponses = getMentorFormResponses();
  var menteeResponses = getMenteeFormResponses();

  // Use the first response for testing
  var mentor = mentorResponses[0];
  var mentee = menteeResponses[0];

  // Now pass them to your function
  var result = algorithm.calculateScoreBreakdownAndExplanation(mentor, mentee);

  const { matches, breakdown, explanation } = algorithm.generateMatchArray(mentorResponses, menteeResponses);

  Logger.log(result);
  Logger.log(matches);
  Logger.log(breakdown);
  Logger.log(explanation);

  exportMatchesToSheet(matches);

  const mentorAssignments = assignMenteesToMentors(matches, {'asdasd':3, 'abc14de':2, 'abc0de':3}, new Set(['fgh0ij', '1231231']));
  printMentorAssignments(mentorAssignments);
  writeMentorAssignmentsToGoogleSheet(mentorAssignments);
}

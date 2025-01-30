/* Tips for running the algorithm automation:
 * After the forms are generated, manually create any sections, since this only creates text objects
 * Also manually change any themes, markdown for the description, and picture
 * 
 * Once responses are gathered, make sure to update the SheetId's in response_collector.gs
 */

/* Steps:
 * 1. Once build_algorithm has all the criteria that you want, run generateForms
 * 2. Get responses in the mentor and mentee forms
 * 3. Click "Link to Sheets" in both forms
 * 4. Get the SheetId and page name from both those sheets and put it into response_collector.gs
 * 5. Run generateMatches
 */

function generateForms() {
  const algorithm = build_algorithm();
  algorithm.generateForms();
  return algorithm;
}

function generateMatches() {
  const algorithm = build_algorithm();

  var mentorResponses = getMentorFormResponses();
  var menteeResponses = getMenteeFormResponses();

  const { matches, breakdowns, explanations } = algorithm.generateMatchArray(mentorResponses, menteeResponses);

  // Logger.log(matches);
  // Logger.log(JSON.stringify(breakdowns, null, 2));
  // Logger.log(JSON.stringify(explanations, null, 2));

  exportMatchesToSheet(matches);

  const mentorAssignments = assignMenteesToMentors(matches, {'dwj7ma':3}, new Set(['petrbogus2']));
  printMentorAssignments(mentorAssignments);
  writeMentorAssignmentsToGoogleSheet(mentorAssignments);
  writeMatchExplanations(mentorAssignments, breakdowns, explanations)
}

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

  const mentorResponses = getMentorFormResponses();
  const menteeResponses = getMenteeFormResponses();

  const mentorNameMap = getNameMap(mentorResponses);
  const menteeNameMap = getNameMap(menteeResponses);

  const { matches, breakdowns, explanations, maxMentees } = algorithm.generateMatchArray(mentorResponses, menteeResponses, mentorNameMap, menteeNameMap);

  exportMatchesToSheet(matches);

  const menteeIdSet = new Set(menteeResponses.map(mentee => mentee['Computing id']));
  const mentorAssignments = assignMenteesToMentors(matches, maxMentees, menteeIdSet);
  printMentorAssignments(mentorAssignments, mentorNameMap, menteeNameMap);
  writeMentorAssignmentsToGoogleSheet(mentorAssignments, mentorNameMap, menteeNameMap);
  writeMatchExplanations(mentorAssignments, breakdowns, explanations, mentorNameMap, menteeNameMap)
}

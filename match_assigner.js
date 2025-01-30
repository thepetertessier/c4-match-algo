function _assignMenteeIfPossible(row, mentorAssignments, assignedMentees, maxMenteesPerMentor, pass) {
    let mentor = row.Mentor;
    let mentee = row.Mentee;

    // Ensure the mentor's assignment list is initialized
    if (!mentorAssignments[mentor]) {
        mentorAssignments[mentor] = []; // Initialize as an empty array if it doesn't exist
    }

    // Determine the maximum number of mentees allowed for this mentor
    const maxMentees = (pass === 1) ? 1 : maxMenteesPerMentor[mentor];

    // Check if the mentor has space and the mentee hasn't already been assigned
    if (mentorAssignments[mentor].length < maxMentees) {
        if (!assignedMentees.has(mentee)) {
            let score = row.total; // Get the match score from the row
            mentorAssignments[mentor].push({ mentee, score }); // Add mentee with score
            assignedMentees.add(mentee); // Mark the mentee as assigned
            Logger.log(`Pass ${pass}: Assigned ${mentee} to ${mentor} with match score ${score}`);
        }
    }
}

function assignMenteesToMentors(matchArray, maxMenteesPerMentor, menteeIds) {
  // Initialize a dictionary to hold assigned mentees for each mentor
  let mentorAssignments = {};
  for (let mentor in maxMenteesPerMentor) {
    mentorAssignments[mentor] = [];
  }
  let assignedMentees = new Set();

  // Create a copy of the matchArray to avoid modifying the original
  let matchArrayCopy = [...matchArray];

  // First pass: Assign each mentor at least one mentee
  matchArrayCopy.forEach(row => _assignMenteeIfPossible(row, mentorAssignments, assignedMentees, maxMenteesPerMentor, 1));

  // Second pass: Assign additional mentees until maxMentees is reached
  matchArrayCopy.forEach(row => _assignMenteeIfPossible(row, mentorAssignments, assignedMentees, maxMenteesPerMentor, 2));

  // Check if all mentees are assigned
  if (menteeIds.size !== assignedMentees.size) {
    throw new Error(`Some mentees are unassigned: ${[...menteeIds].filter(mentee => !assignedMentees.has(mentee))}`);
  }

  return mentorAssignments;
}

function printMentorAssignments(mentorAssignments) {
  Logger.log("\nMentor Assignments:\n" + "=".repeat(20));

  for (let mentor in mentorAssignments) {
    let mentees = mentorAssignments[mentor];
    let menteesList = mentees.length > 0 
      ? mentees.map(({ mentee, score }) => `${mentee} (${score})`).join(', ') 
      : "No mentees assigned";
    
    Logger.log(`Mentor: ${mentor} | Mentees: ${menteesList}`);
  }

  Logger.log("=".repeat(20));
}

function writeMentorAssignmentsToGoogleSheet(mentorAssignments) {
  // Transform mentorAssignments into an array of objects
  var arrayOfObjects = Object.keys(mentorAssignments).map(mentor => ({
      Mentor: mentor,
      Mentees: mentorAssignments[mentor].map(pair =>`${pair.mentee} (${pair.score})`).join(', ')
  }));

  // Call exportArrayOfObjectsToSheet with the transformed data
  exportArrayOfObjectsToSheet(arrayOfObjects, 'Mentor Assignments Sheet');
}


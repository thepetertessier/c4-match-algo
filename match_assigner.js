function _assignMenteeIfPossible(row, mentorAssignments, assignedMentees, maxMenteesPerMentor, pass) {
    let mentor = row.Mentor;
    let mentee = row.Mentee;

    // Make sure mentor doesn't have too many mentees; on first pass, 2 is too many
    const maxMentees = (pass === 1) ? 1 : maxMenteesPerMentor[mentor];
    if (mentorAssignments[mentor].length < maxMentees) {
      if (!assignedMentees.has(mentee)) {
        let score = row.total;
        mentorAssignments[mentor].push({ mentee: mentee, score: score });
        assignedMentees.add(mentee);
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
  var arrayOfObjects = Object.keys(mentorAssignments).map(mentor => {
    return {
      Mentor: mentor,
      Mentees: mentorAssignments[mentor].map(pair => `${pair[0]} (${pair[1]})`).join(', ')
    };
  });

  // Call exportArrayOfObjectsToSheet with the transformed data
  exportArrayOfObjectsToSheet(arrayOfObjects, 'Mentor Assignments Sheet');
}


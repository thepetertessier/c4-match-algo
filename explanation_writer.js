function writeMatchExplanations(mentorAssignments, breakdowns, explanations, mentorNameMap, menteeNameMap) {
  const folderName = 'explanations';
  const parentFolder = getWorkingDirectory()

  // Get or create the 'explanations' folder in the root directory
  let explanationsFolder = getOrCreateFolder(folderName, parentFolder);

  // Clear its contents
  clearFolderContents(explanationsFolder);

  for (const mentor in mentorAssignments) {
    const mentees = mentorAssignments[mentor];
    for (const { mentee, score } of mentees) {
      const total = score;
      const header = `Score explanation for ${mentorNameMap[mentor]} (${mentor}, mentor) and ${menteeNameMap[mentee]} (${mentee}, mentee):`;
      const toWrite = [];
      toWrite.push(header);
      toWrite.push('='.repeat(header.length));

      const breakdown = breakdowns[`${mentor}-${mentee}`]; // Assumes breakdown keys are formatted as 'mentor-mentee'
      const explanation = explanations[`${mentor}-${mentee}`];
      const didntContribute = [];

      // Sort breakdown by score in descending order and generate text
      const sortedCategories = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
      for (const category of sortedCategories) {
        const score = breakdown[category];
        if (score === 0) {
          didntContribute.push(category);
          continue;
        }
        if (category === 'total') continue; // Skip 'total' category

        let text = explanation[category];
        let formattedScore = score >= 0 ? `+${score}` : `${score}`;
        if (formattedScore.endsWith('.0')) {
          formattedScore = formattedScore.slice(0, -2);
        }
        toWrite.push(`${category}: ${text} (${formattedScore})`);
      }

      toWrite.push(`TOTAL SCORE: ${total}`);
      toWrite.push('\nThe following did not contribute to the score:');
      for (const category of didntContribute) {
        toWrite.push(`\t${category}: ${explanation[category]}`);
      }

      // Create and save the document in the folder
      const docName = `${total}_${mentor}_${mentee} (${mentorNameMap[mentor]} and ${menteeNameMap[mentee]})`;
      const doc = DocumentApp.create(docName);
      doc.getBody().setText(toWrite.join('\n'));
      const file = DriveApp.getFileById(doc.getId());
      explanationsFolder.addFile(file);
      DriveApp.getRootFolder().removeFile(file); // Remove from root folder to avoid clutter
    }
  }
  Logger.log(`Match explanations written to folder "${folderName}".`)
}

function getOrCreateFolder(folderName, parentFolder) {
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

function clearFolderContents(folder) {
  // Remove all files in the folder
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    folder.removeFile(file);
  }

  // Remove all subfolders in the folder
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    folder.removeFolder(subfolder);
  }
}

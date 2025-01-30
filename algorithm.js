// Provides the Algorithm class, along with supporting classes Question and Criterion, and methods

// Types of questions
const MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
const CHECKBOX = 'CHECKBOX'
const LIKERT = 'LIKERT'

activity_categories = ['Social & Hobby', 'Public Service', 'Media Group', 'Cultural & Ethnic',
    'Visual & Performing Arts', 'Honor Society', 'Academic & Professional',
    'A Cappella', 'Peer Mentors', 'Debate', 'Choir'
]

// Question constructor
function Question(title, type, choices, required=true) {
  // Validate the question type
  const validTypes = [CHECKBOX, MULTIPLE_CHOICE, LIKERT];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid question type: ${type}. Must be one of ${validTypes.join(', ')}.`);
  }

  this.title = title;
  this.type = type; // e.g., CHECKBOX, MULTIPLE_CHOICE
  this.choices = choices; // Array of possible choices
  this.required = required; // true/false if question is required
}

// Criterion constructor
function Criterion(identifier, mentorQuestion, menteeQuestion, scoringRule, addMenteePreferenceQuestion=false) {
  this.identifier = identifier;
  this.mentorQuestion = mentorQuestion;
  this.menteeQuestion = menteeQuestion;
  this.scoringRule = scoringRule; // Function to calculate score (float) given mentorResponse and menteeResponse
  this.addMenteePreferenceQuestion = addMenteePreferenceQuestion; // Adds another question asking mentee how much they prefer this; scales the score accordingly
}

// Algorithm constructor
function Algorithm() {
  this.criteria = [];
}

// Method to add a criterion to the algorithm
Algorithm.prototype.addCriterion = function(criterion) {
  this.criteria.push(criterion);
};

function addMenteeFormTitleAndDescription(form) {
  form.setTitle('Mentee Form')
      .setDescription(`Welcome to C4! We\'re glad you\'re interested in matching with one of our mentors.
See our homepage here: https://sites.google.com/view/c4-initiative/`);
}

function addMentorFormTitleAndDescription(form) {
  form.setTitle('Mentor Form')
      .setDescription(`Thanks for showing interest in becoming a mentor for the C4 Initiative, UVA's low-barrier peer-mentorship CIO!

We're looking for mentors who fit the following criteria:
* Have been a UVA student for at least a year
* Are passionate about guiding new students

See our homepage https://sites.google.com/view/c4-initiative/ for more about C4.

As an FYI, in order to get an adequate background, this form takes ~5 minutes to complete.`);
}

function addPersonalInfoToForm(form) {
  form.addTextItem()
      .setTitle('Full name')
      .setRequired(true);

  form.addTextItem()
    .setTitle('Computing id')
    .setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .requireTextMatchesPattern('^[a-z0-9]+$')
      .setHelpText('Please enter a valid Computing id (numbers and letters only, lowercase).')
      .build());

  // Add a text item for Email with email validation
  form.addTextItem()
    .setTitle('Email')
    .setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .requireTextIsEmail()
      .setHelpText('Please enter a valid email address.')
      .build());

  // Add a text item for Phone Number with validation
  form.addTextItem()
    .setTitle('Phone number')
    .setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .requireTextMatchesPattern('^\\d{10}$')
      .setHelpText('Please enter a valid 10-digit phone number (numbers only).')
      .build());
}

const getPreferenceQuestion = criterionIdentifier =>
  `How important is the previous question (${criterionIdentifier}) to you in the context of matching?`

const getMaxMenteesQuestion = () => 'What is the maximum number of mentees that you are comfortable mentoring?';

// Modified generateForms method in the Algorithm prototype
Algorithm.prototype.generateForms = function() {
  // Get the folder containing this script
  var scriptFileId = ScriptApp.getScriptId();
  var scriptFile = DriveApp.getFileById(scriptFileId);
  var scriptFolder = scriptFile.getParents().next();

  // Create forms in the same folder
  var mentorForm = FormApp.create('Join C4 as a Mentor');
  var menteeForm = FormApp.create('Join C4 as a Mentee');

  // Move forms to the folder
  DriveApp.getFileById(mentorForm.getId()).moveTo(scriptFolder);
  DriveApp.getFileById(menteeForm.getId()).moveTo(scriptFolder);

  // Add the first section to both forms
  addMentorFormTitleAndDescription(mentorForm);
  addPersonalInfoToForm(mentorForm);
  addMenteeFormTitleAndDescription(menteeForm);
  addPersonalInfoToForm(menteeForm);

  // Populate forms with respective questions based on criteria
  [mentorForm, menteeForm].forEach(form => form.addSectionHeaderItem()
    .setTitle('Matching questions')
    .setHelpText('The following questions will be used for mentorship matching.')
  );

  this.criteria.forEach(criterion => {
    const mentorQuestionAndForm = { question: criterion.mentorQuestion, form: mentorForm };
    const menteeQuestionAndForm = { question: criterion.menteeQuestion, form: menteeForm };

    [mentorQuestionAndForm, menteeQuestionAndForm].forEach(({ question, form }) => {
      switch (question.type) {
        case CHECKBOX:
          form.addCheckboxItem()
            .setTitle(question.title)
            .setChoiceValues(question.choices)
            .setRequired(false); // Always let them select none
          break;
        case MULTIPLE_CHOICE:
          form.addMultipleChoiceItem()
            .setTitle(question.title)
            .setChoiceValues(question.choices)
            .setRequired(question.required);
          break;
        case LIKERT:
          form.addScaleItem()
            .setTitle(question.title)
            .setLabels(question.choices[0], question.choices[1])
            .setRequired(question.required);
          break;
        default:
          throw new Error(`Unsupported question type: ${question.type}`);
      }
    });
    if (criterion.addMenteePreferenceQuestion) {
      menteeForm.addScaleItem()
        .setTitle(getPreferenceQuestion(criterion.identifier))
        .setLabels('Not at all', 'A lot')
        .setRequired(criterion.menteeQuestion.required);
    }
  });

  // Ask mentors the max number of mentees they're comfortable with
  mentorForm.addScaleItem()
    .setTitle(getMaxMenteesQuestion())
    .setLabels('1', '5')
    .setRequired(true);

  // Add free response at the end
  [mentorForm, menteeForm].forEach(form => form.addParagraphTextItem()
    .setTitle('Is there anything else you would like us to know?')
    .setRequired(false)
  );
};


function avg(a, b) {
  return (a + b) / 2;
}

// Method to calculate match score breakdown
Algorithm.prototype.calculateScoreBreakdownAndExplanation = function(mentor, mentee) {
  let scoreBreakdown = {};
  let scoreExplanation = {};
  let totalScore = 0;

  // Iterate over each criterion and calculate scores
  this.criteria.forEach(criterion => {
    const mentorResponse = mentor[criterion.mentorQuestion.title];
    const menteeResponse = mentee[criterion.menteeQuestion.title];
    let {score, explanation} = criterion.scoringRule(mentorResponse, menteeResponse);
    
    if (criterion.addMenteePreferenceQuestion) {
      let menteePreference = +mentee[getPreferenceQuestion(criterion.identifier)];
      menteePreference -= 1;
      score *= menteePreference;
    }

    scoreBreakdown[criterion.identifier] = score;
    totalScore += score;
    scoreExplanation[criterion.identifier] = explanation;
  });

  scoreBreakdown['total'] = totalScore;
  
  return { scoreBreakdown, scoreExplanation };
};

Algorithm.prototype.generateMatchArray = function(mentors, mentees) {
  // Initialize arrays and objects to store results
  const matches = [];
  const breakdowns = {};
  const explanations = {};
  const maxMentees = {};

  // Loop through each mentee
  mentees.forEach(mentee => {
    const menteeId = mentee['Computing id'];

    // Loop through each mentor
    mentors.forEach(mentor => {
      const mentorId = mentor['Computing id'];

      // Calculate match score using the getMatchScoreBreakdown method
      const { scoreBreakdown, scoreExplanation } = this.calculateScoreBreakdownAndExplanation(mentor, mentee);

      // Create match information object
      const matchInfo = {
        Mentee: menteeId,
        Mentor: mentorId,
        score: scoreBreakdown.total, // sometimes it's referenced as score instead of total
        ...scoreBreakdown
      };

      // Add the match info to the matches array
      matches.push(matchInfo);

      // Store breakdowns and explanations using mentor-mentee pair as the key
      breakdowns[`${mentorId}-${menteeId}`] = scoreBreakdown;
      explanations[`${mentorId}-${menteeId}`] = scoreExplanation;
    });

    maxMentees[menteeId] = mentee[getMaxMenteesQuestion()];
  });

  // Sort matches by the total score in descending order
  matches.sort((a, b) => b.total - a.total);

  return { matches, breakdowns, explanations, maxMentees };
}


/*
Algorithm.prototype.calculateScoreBreakdown = function(mentor, mentee) {
  // For each category, 5 is the highest weight, -5 is the lowest weight
  const scoreKeys = [
    'total', 'gender', 'year', 'school', 'major', 'study style', 'academic interests',
    'personality traits', 'extroversion', 'research', 'work experience', 'hours',
    'mentorship style'
  ];
  
  scoreKeys.push(...activityCategories);
  scoreKeys.push('activity matches');
  
  const scoreBreakdown = scoreKeys.reduce((obj, key) => {
    obj[key] = 0;
    return obj;
  }, {});
  
  const matchExplanation = scoreKeys.reduce((obj, key) => {
    obj[key] = `"${key}" did not contribute to the score.`;
    return obj;
  }, {});
  
  Object.assign(matchExplanation, {
    'gender': 'You have different genders or don\'t prefer the same gender',
    'year': 'The mentor is older than the mentee',
    'school': 'You don\'t go to the same school (e.g., College of Arts and Sciences)',
    'major': 'You don\'t share any majors/minors or don\'t care',
    'study style': 'You don\'t share a study style or don\'t care',
    'academic interests': 'You don\'t share any academic interests or don\'t care',
    'personality traits': 'The mentor doesn\'t have the mentee\'s desired personality traits or the mentee doesn\'t care',
    'extroversion': 'The mentor doesn\'t have the mentee\'s desired level of extroversion or the mentee doesn\'t care',
    'research': 'The mentor doesn\'t do research or the mentee doesn\'t care',
    'work experience': 'The mentor hasn\'t had work experience related to their major (e.g., an internship) or the mentee doesn\'t care',
    'hours': 'The mentor is willing to spend as many hours as the mentee prefers',
    'mentorship style': 'You don\'t share a mentorship style or don\'t care',
    'activity matches': 'The mentor isn\'t involved in any activities the mentee indicated interest in'
  });

  // Gender
  if (mentor['Gender'] === mentee['Gender']) {
    const weightMentee = mentee['How much do you prefer a mentor with the same gender?'] - 1;
    const weightMentor = mentor['Do you prefer to mentor someone with the same gender?'] ? 3 : 0;
    const weight = avg(weightMentee, weightMentor);
    scoreBreakdown['gender'] = weight;

    if (weight) {
      const menteePreferred = ['didn\'t prefer', 'slightly preferred', 'preferred', 'preferred', 'strongly preferred'][weightMentee];
      const mentorPreferred = weightMentor === 0 ? 'didn\'t prefer' : 'preferred';
      matchExplanation['gender'] = `You both share the same gender (mentee ${menteePreferred}, mentor ${mentorPreferred}).`;
    }
  }

  this.criteria.forEach(function(criterion) {

  });

  // Add remaining logic for other categories (year, school, major, study style, etc.) 
  // similar to the Python version but adapted to JavaScript syntax.

  return { scoreBreakdown, matchExplanation };
}
*/

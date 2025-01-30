// Helper functions
const getCheckboxIntersectionRule = multiplier =>
  (mentorResponse, menteeResponse) => {
    var mentorInterests = (mentorResponse || '').split(', ');
    var menteeInterests = (menteeResponse || '').split(', ');
    const intersection = mentorInterests.filter(interest => menteeInterests.includes(interest))
    return {
      score: intersection.length * multiplier,
      explanation: `The mentor and mentee share the following: ${intersection.join(', ')}.`
    };
  };

const getMultipleChoiceMatchRule = multiplier =>
  (mentorResponse, menteeResponse) =>
    mentorResponse === menteeResponse
    ? {score: multiplier, explanation: `You both answered: ${mentorResponse}.`}
    : {score: 0, explanation: `You answered differently (mentor: ${mentorResponse}, mentee: ${menteeResponse})`};

const getLikertDifferenceRule = multiplier =>
  (mentor, mentee) => ({
    score: multiplier*(2 - Math.abs(+mentor - +mentee)),
    explanation: `The mentor said '${mentor}', and the mentee said '${mentee}'.`
  });

const getLikertDegreeRule = multiplier =>
  (mentor, mentee) => ({
    score: multiplier*(+mentee - 1)*(+mentor - 2),
    explanation: `The mentee prefers this to a degree of ${mentee}/5, and the mentor this to a degree of ${mentor}/5.`
  });


// The main function we provide
function build_algorithm() {
  // Create algorithm instance
  var algorithm = new Algorithm();

  /*
  Criterion template:
  algorithm.addCriterion(new Criterion(
    identifier,
    mentorQuestion,
    menteeQuestion,
    scoringRule
  ))

  Question template:
  new Question(
    title,
    type (CHECKBOX, MULTIPLE_CHOICE),
    choices
  )
  */

  // Year
  const yearToInt = year => (year === 'Graduate student') ? 5 : +year[0];

  algorithm.addCriterion(new Criterion(
    'year',
    new Question(
      'Year',
      MULTIPLE_CHOICE,
      ['2nd', '3rd', '4th', 'Graduate student']
    ),
    new Question(
      'Year',
      MULTIPLE_CHOICE,
      ['1st', '2nd', '3rd', '4th', 'Graduate student']
    ),
    (mentorResponse, menteeResponse) => {
      const yearsOlder = yearToInt(mentorResponse) - yearToInt(menteeResponse);
      return yearsOlder < 0 ? {score: -100, explanation: 'The mentor is younger than the mentee.'}
        : yearsOlder === 0 ? {score: -20, explanation: 'The mentor is as old as the mentee.'}
        : {score: 0, explanation: 'The mentor is older than the mentee.'};
    }
  ));

  // Gender
  algorithm.addCriterion(new Criterion(
    'gender',
    new Question(
      'Gender',
      MULTIPLE_CHOICE,
      ['Male', 'Female', 'Non-binary']
    ),
    new Question(
      'What gender do you prefer your mentor to have?',
      MULTIPLE_CHOICE,
      ['Male', 'Female', 'Non-binary', 'No preference']
    ),
    (mentorResponse, menteeResponse) =>
      menteeResponse === 'No preference'
        ? {score: 2, explanation: 'The mentee doesn\'t care which gender the mentor has.'}
        : menteeResponse === mentorResponse
        ? {score: 2, explanation: `The mentor\'s gender is ${mentorResponse}, which is what the mentee prefers.`}
        : {score: -2, explanation: `The mentor\'s gender is ${mentorResponse}, which is not what the mentee prefers (${menteeResponse}).`}
  ));

  // Extracurricular interests
  const extracurricularInterestsQuestion = new Question(
    'What are you interested in (choose up to 6)?',
    CHECKBOX,
    [
      'Technology', 'Arts', 'Sports', 'Music', 'Theatre/Drama',
      'Community Service', 'Debate/Public Speaking', 'Gaming',
      'Science and Research', 'Writing/Blogging', 'Environmental Sustainability',
      'Cooking/Baking', 'Fitness/Wellness', 'Photography/Filmmaking'
    ]
  );
  algorithm.addCriterion(new Criterion(
    'extracurricular interests',
    extracurricularInterestsQuestion,
    extracurricularInterestsQuestion,
    getCheckboxIntersectionRule(2), // 2 points per matching interest
    true // Ask mentee preference
  ));

  // School
  const schools = [
    "College and Graduate School of Arts & Sciences",
    "Darden School of Business",
    "Frank Batten School of Leadership and Public Policy",
    "McIntire School of Commerce",
    "School of Architecture",
    "School of Continuing & Professional Studies",
    "School of Data Science",
    "School of Education and Human Development",
    "School of Engineering and Applied Science",
    "School of Law",
    "School of Medicine",
    "School of Nursing",
    "UVA's College at Wise"
  ];
  
  const schoolQuestion = new Question(
    'What school are you in?',
    MULTIPLE_CHOICE,
    schools
  );

  algorithm.addCriterion(new Criterion(
    'school',
    schoolQuestion,
    schoolQuestion,
    getMultipleChoiceMatchRule(3),
    true
  ));

  // Major
  const majors = [
    "Aerospace Engineering",
    "African American and African Studies",
    "American Studies",
    "Anthropology",
    "Applied Statistics, B.A.",
    "Archaeology",
    "Architectural History",
    "Architecture",
    "Area Studies, B.A.",
    "Art History",
    "Astronomy",
    "Bachelor of Interdisciplinary Studies",
    "Bachelor of Professional Studies in Health Sciences Management",
    "Behavioral Neuroscience, B.S.",
    "Biology",
    "Biomedical Engineering",
    "Chemical Engineering",
    "Chemistry",
    "Chinese Language & Literature",
    "Civil Engineering",
    "Classics",
    "Cognitive Science",
    "Commerce",
    "Computer Engineering",
    "Computer Science (B.A.)",
    "Computer Science (B.S.)",
    "Data Science, B.S.",
    "Drama",
    "Early Childhood Education (BSEd)",
    "East Asian Languages, Literatures and Culture",
    "Economics",
    "Electrical Engineering",
    "Elementary Education (BSEd)",
    "Engineering Science",
    "English",
    "Environmental Sciences",
    "Environmental Thought and Practice",
    "Foreign Affairs, B.A.",
    "French",
    "German",
    "German Studies",
    "Global Studies",
    "Government, B.A.",
    "Health Sciences Management, B.P.S.",
    "History",
    "History of Art",
    "Human Biology",
    "Italian, B.A.",
    "Japanese Language & Literature",
    "Jewish Studies",
    "Kinesiology (BSEd)",
    "Latin American Studies",
    "Linguistics",
    "Materials Science and Engineering",
    "Mathematics",
    "Mechanical Engineering",
    "Media Studies",
    "Medieval Studies",
    "Middle Eastern and South Asian Languages and Cultures",
    "Music",
    "Neuroscience",
    "Nursing",
    "Philosophy",
    "Physics",
    "Political and Social Thought",
    "Political Philosophy, Policy, and Law",
    "Politics",
    "Psychology",
    "Public Policy and Leadership",
    "Religious Studies",
    "Slavic Languages and Literatures",
    "Sociology",
    "South Asian Languages and Literatures",
    "Spanish",
    "Special Education (BSEd)",
    "Speech Communication Disorders",
    "Statistics",
    "Studio Art",
    "Systems Engineering",
    "Urban and Environmental Planning",
    "Women, Gender & Sexuality",
    "Youth & Social Innovation (BSEd)"
  ];

  const majorQuestion = new Question(
    'Major(s)',
    CHECKBOX,
    majors
  );

  algorithm.addCriterion(new Criterion(
    'major',
    majorQuestion,
    majorQuestion,
    getCheckboxIntersectionRule(4), // 4 points per matching major
    true
  ));

  // Minor
  const minors = [
    "American Sign Language",
    "Applied Mathematics",
    "Asian Pacific American Studies",
    "Business Spanish",
    "Dance",
    "Data Analytics",
    "Data Science",
    "Design Minor",
    "Entrepreneurship",
    "General Business Minor",
    "Global Culture and Commerce",
    "Global Studies in Education Minor",
    "Global Sustainability Minor",
    "History of Science and Technology",
    "Health, Ethics, and Society",
    "Historic Preservation Minor",
    "Health and Wellbeing Minor",
    "Korean",
    "Landscape Architecture Minor",
    "Latinx Studies Minor",
    "Leadership",
    "Native American Indigenous Studies",
    "Portuguese",
    "Public Policy and Leadership Minor",
    "Public Writing and Rhetoric Minor",
    "Real Estate",
    "Science and Technology Policy",
    "Science, Technology, and Society",
    "Southern Studies",
    "Statistics",
    "Technology and the Environment",
    "Technology Ethics"
  ];

  const minorQuestion = new Question(
    'Minor(s)',
    CHECKBOX,
    minors
  );

  algorithm.addCriterion(new Criterion(
    'minor',
    minorQuestion,
    minorQuestion,
    getCheckboxIntersectionRule(4),
    true
  ));

  // Study style
  const studyStyleQuestion = new Question(
    'Do you prefer to study alone or in groups?',
    MULTIPLE_CHOICE,
    ['Alone', 'In groups', 'Either']
  );

  algorithm.addCriterion(new Criterion(
    'study style',
    studyStyleQuestion,
    studyStyleQuestion,
    getMultipleChoiceMatchRule(3),
    true
  ));

  // Meet up
  const meetUpStyleQuestion = new Question(
    'Preferred way to meet up (select up to 2)',
    CHECKBOX,
    [
      'One-on-One Meetings',
      'Group Meetings',
      'Virtual Check-ins',
      'Casual Hangouts'
    ]
  );

  algorithm.addCriterion(new Criterion(
    'meet up',
    meetUpStyleQuestion,
    meetUpStyleQuestion,
    getCheckboxIntersectionRule(1),
    true
  ));

  // Academic interests
  const academicInterestsQuestion = new Question(
    'Academic interests',
    CHECKBOX,
    ['STEM', 'Humanities', 'Social Sciences', 'Business', 'Arts']
  );

  algorithm.addCriterion(new Criterion(
    'academic interests',
    academicInterestsQuestion,
    academicInterestsQuestion,
    getCheckboxIntersectionRule(2),
    true
  ));

  // Extroversion
  algorithm.addCriterion(new Criterion(
    'extroversion',
    new Question(
      'How introverted/extroverted are you?',
      LIKERT,
      ['Very introverted', 'Very extroverted']
    ),
    new Question(
      'How introverted/extroverted would you like your MENTOR to be?',
      LIKERT,
      ['Very introverted', 'Very extroverted']
    ),
    getLikertDifferenceRule(1),
    true // Ask the mentee how much they prefer this
  ));

  // Personality traits
  const personalityTraits = [
    'Outgoing',
    'Reserved',
    'Adventurous',
    'Empathetic',
    'Analytical',
    'Creative',
    'Organized',
    'Spontaneous'
  ];

  algorithm.addCriterion(new Criterion(
    'personality traits',
    new Question(
      'Personality Traits (select up to 4)',
      CHECKBOX,
      personalityTraits
    ),
    new Question(
      'What personality traits would you prefer your mentor to have (select up to 4)?',
      CHECKBOX,
      personalityTraits
    ),
    getCheckboxIntersectionRule(1),
    true
  ));

  // Research
  algorithm.addCriterion(new Criterion(
    'research',
    new Question(
      'How much research experience do you have?',
      LIKERT,
      ['None', 'A lot']
    ),
    new Question(
      'How much do you prefer that your mentor has been involved in research?',
      LIKERT,
      ['Not at all', 'A lot']
    ),
    getLikertDegreeRule(1)
  ));

  // Career
  algorithm.addCriterion(new Criterion(
    'career',
    new Question(
      'How much career experience do you have (e.g., internships)?',
      LIKERT,
      ['None', 'A lot']
    ),
    new Question(
      'How much do you prefer that your mentor has career experience (e.g., internships)?',
      LIKERT,
      ['Not at all', 'A lot']
    ),
    getLikertDegreeRule(1)
  ));

  // Time
  algorithm.addCriterion(new Criterion(
    'time',
    new Question(
      'What is the ideal amount of meetings per MONTH that you\'d want to have with your mentee(s)?',
      LIKERT,
      ['1', '5']
    ),
    new Question(
      'What is the ideal amount of meetings per MONTH that you\'d want to have with your mentor?',
      LIKERT,
      ['1', '5']
    ),
    getLikertDifferenceRule(2)
  ));

  // Mentorship style
  const mentorshipStyleQuestion = new Question(
    'What do you want this mentorship to look like (select all that apply)?',
    CHECKBOX,
    [
      'A friend to grab a cup of coffee with',
      'A guide for college life',
      'A study buddy',
      'A career advisor',
      'An academic advisor',
      'Very low commitment',
      'Frequent meetings'
    ]
  );

  algorithm.addCriterion(new Criterion(
    'mentorship style',
    mentorshipStyleQuestion,
    mentorshipStyleQuestion,
    getCheckboxIntersectionRule(1),
    true
  ));

  return algorithm;
}

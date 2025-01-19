// Types of questions
const MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
const CHECKBOX = 'CHECKBOX'

// Provides the build_algorithm function
function getCheckboxIntersectionRule(multiplier) {
  return (mentorResponse, menteeResponse) => {
    var mentorInterests = mentorResponse.split(', ');
    var menteeInterests = menteeResponse.split(', ');
    return mentorInterests.filter(interest => menteeInterests.includes(interest)).length * multiplier;
  }
}

function build_algorithm() {
  // Create algorithm instance
  var algorithm = new Algorithm();

  /*
  Criterion template:
  algorithm.addCriterion(new Criterion(
    criterionTitle,
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
      (menteeResponse === 'No preference' || mentorResponse === menteeResponse) ? 2 : 0
  ));

  // Year
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
    (mentorResponse, menteeResponse) =>
      (menteeResponse === 'No preference' || mentorResponse === menteeResponse) ? 2 : 0
  ))

  // Extracurricular interests
  const extracurricularInterestsQuestion = new Question(
    'Extracurricular interests (choose up to 3)',
    CHECKBOX,
    ['Technology', 'Arts', 'Sports']
  )
  algorithm.addCriterion(new Criterion(
    'extracurricular interests',
    extracurricularInterestsQuestion,
    extracurricularInterestsQuestion,
    getCheckboxIntersectionRule(1) // 1 point per matching interest
  ));

  return algorithm;
}

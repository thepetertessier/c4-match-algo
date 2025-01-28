// Types of questions
const MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
const CHECKBOX = 'CHECKBOX'

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
  }

// The main function we provide
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
  ))

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
  )
  algorithm.addCriterion(new Criterion(
    'extracurricular interests',
    extracurricularInterestsQuestion,
    extracurricularInterestsQuestion,
    getCheckboxIntersectionRule(2) // 2 points per matching interest
  ));

  return algorithm;
}

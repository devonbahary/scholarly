/*
  scholarly
    app
      scripts
        services
          * Quiz.js
   +---------------------------------------------------------------------------
    * Quiz.js
        A service for quiz-building.
   ---------------------------------------------------------------------------+
*/

(function() {
  function Quiz($rootScope, $firebaseArray, Words, UserWords) {
    var Quiz = {};

    var userWordsByNumSuccess = null;

    initQuiz();

    function initQuiz() {
      $rootScope.quiz = {
        questions: [],
        size: 0,
        progIndex: 0,
        // determined after quiz completion in 'calcResults()'
        incorrectQuestionIndices: [],
        total: 0
      }
    }

    /*
      getLessSuccessfulWord()
        => Returns a random word from user's database in the bottom half of
        words ordered by 'numSuccess'.
    */
    function getLessSuccessfulWord() {
      var randIndex = Math.floor(Math.random() * userWordsByNumSuccess.length / 2);
      return userWordsByNumSuccess[randIndex];
    }

    /*
      getRandWord()
        => Returns a random word from user's database.
    */
    function getRandWord() {
      var randIndex = Math.floor(Math.random() * userWordsByNumSuccess.length);
      return userWordsByNumSuccess[randIndex];
    }

    /*
      gatherOptionsForWord(word, options)
        => Takes in an 'options' array and 'word' and returns a promise that
        will resolve into a question object with properties 'word' (the original
        word object), 'options' (the original 'options' array with filled
        options), and 'userAnswer' for future answer recording.
    */
    function gatherOptionsForWord(word, options) {
      var numOptions = 4; // hard-coded 4 multiple choice options
      // resolve conditions
      if (options.length === numOptions) {
        // return a 'Quiz.instance' object 'question' array object
        return {
          word: word,
          options: shuffleArray(options),
          userAnswer: null
        };
      }
      // gather random word
      return Words.getRandWordForPartOfSpeech(word.partOfSpeech).then(function(randWord) {
        // traverse definitions
        for (var i = 0; i < randWord.results.length; i++) {
          // add the definition
          if (randWord.results[i].partOfSpeech === word.partOfSpeech) {
            var randDef = randWord.results[i].definition;
            if (!options.includes(randDef)) {
              options.push(randDef);
            }
          }
          // recursive call
          return gatherOptionsForWord(word, options);
        }
      });
    }


    /*
      shuffleArray(array)
        => Returns 'array' with its elements randomly reordered.
    */
    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    /*
      calcResults()
        => Populates the 'incorrectQuestionIndices' array of '$rootScope.quiz'
        with the indices of questions answered wrong and determines a quiz
        'total'.
    */
    function calcResults() {
      // iterate through question objects in '$rootScope.quiz',
      for (var i = 0; i < $rootScope.quiz.size; i++) {
        var answer = $rootScope.quiz.questions[i].word.definition;
        var userAnswer = $rootScope.quiz.questions[i].userAnswer;
        // update word stats based on answer success
        if (answer === userAnswer) {
          UserWords.updateWordStats($rootScope.quiz.questions[i].word, true);
        } else {
          // if wrong, record index for post-quiz display
          $rootScope.quiz.incorrectQuestionIndices.push(i);
          UserWords.updateWordStats($rootScope.quiz.questions[i].word, false);
        }
      }
      // calculate quiz total
      $rootScope.quiz.total = $rootScope.quiz.size - $rootScope.quiz.incorrectQuestionIndices.length;
    }


    /*
      buildQuiz()
        => Generates a 'quiz' object into '$rootScope' with the following
        structure:
          {
            questions: [
              {
                word: ...,
                options: [
                  ...
                ]
              },
              ...
            ],
            progIndex: number, (progress into quiz)
            size: number,
            ...
          }
    */
    function buildQuiz() {
      if (userWordsByNumSuccess.length !== 0) {
        // in the event that 'quizSize' > # user words
        var quizSize = Math.min(userWordsByNumSuccess.length, quizSize = 4);
        $rootScope.quiz.size = quizSize;

        // select 'quizWords'
        var quizWords = [];
        // first half from least successful words
        while (quizWords.length < quizSize / 2) {
          var randWord = getLessSuccessfulWord();
          if (!quizWords.includes(randWord)) {
            quizWords.push(randWord);
          }
        }
        // second half at random
        while (quizWords.length < quizSize) {
          var randWord = getRandWord();
          if (!quizWords.includes(randWord)) {
            quizWords.push(randWord);
          }
        }

        quizWords = shuffleArray(quizWords);

        // gather options for each 'quizWord' and populate 'questions'
        for (var i = 0; i < quizSize; i++) {
          var options = [];
          options.push(quizWords[i].definition);
          gatherOptionsForWord(quizWords[i], options).then(function(wordObject) {
            $rootScope.quiz.questions.push(wordObject);
          });
        }
      }
    }

    /*
      Quiz.userSubmitAnswer(optionDef)
        => Stores user's answer (optionDef) and increments 'quiz.progIndex',
        returns a boolean representing quiz complete status.
    */
    Quiz.userSubmitAnswer = function(optionDef) {
      // record answer
      $rootScope.quiz.questions[$rootScope.quiz.progIndex].userAnswer = optionDef;
      // increment quiz progress
      $rootScope.quiz.progIndex++;
      // quiz complete?
      if ($rootScope.quiz.progIndex === $rootScope.quiz.size) {
        calcResults();
        return true;
      } else {
        return false;
      }

    }

    /*
      Quiz.getLoadState()
        => Returns the load progress of quiz questions into 'quiz' as a decimal.
    */
    Quiz.getLoadState = function() {
      if ($rootScope.quiz.size !== 0) {
        return $rootScope.quiz.questions.length / $rootScope.quiz.size;
      } else {
        return 0;
      }
    }


    /*
      Quiz.reset()
        =>
    */
    Quiz.reset = function() {
      // for each quiz question..
      for (var i = 0; i < $rootScope.quiz.size; i++) {
        // ..reshuffle definition options
        $rootScope.quiz.questions[i].options = shuffleArray($rootScope.quiz.questions[i].options);
        // ..erase user answer
        $rootScope.quiz.questions[i].userAnswer = null;
      }
      // reshuffle quiz question order
      $rootScope.quiz.questions = shuffleArray($rootScope.quiz.questions);
      // start quiz from beginning
      $rootScope.quiz.progIndex = 0;
      $rootScope.quiz.total = 0;
      $rootScope.quiz.incorrectQuestionIndices = [];
    }

    /*
      Quiz.newQuiz()
        => Rebuilds the quiz object for use in a new quiz.
    */
    Quiz.newQuiz = function() {
      initQuiz();
      buildQuiz();
    }

    // seize opportunities while the user isn't engaged with the Quiz state to
    // load a new one to prevent excessive loading screens
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if ($rootScope.quiz.progIndex > 0) {
        Quiz.newQuiz();
      }
    });


    // trigger Quiz initializing on user recognition
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // init user words
        var uid = firebase.auth().currentUser.uid;
        var ref = firebase.database().ref('user-words/' + uid).orderByChild('numSuccess');
        $firebaseArray(ref).$loaded().then(function(userWords) {
          userWordsByNumSuccess = userWords;
          // then init quiz
          buildQuiz();
        });

      }
    });

    return Quiz;
  }

  angular
    .module('scholarly')
    .factory('Quiz', ['$rootScope', '$firebaseArray', 'Words', 'UserWords', Quiz]);
})();

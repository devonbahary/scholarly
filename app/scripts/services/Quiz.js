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
  function Quiz($rootScope, $firebaseArray, Words) {
    var Quiz = {};

    var userWordsByNumSuccess = null;

    $rootScope.quiz = {
      questions: [],
      size: 0,
      progIndex: 0
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
        word object) and 'options' (the original 'options' array with filled
        options).
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
      Quiz.buildQuiz()
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
            size: number
          }
    */
    Quiz.buildQuiz = function() {
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
            if ($rootScope.quiz.questions.length === $rootScope.quiz.size) {
              console.log($rootScope.quiz)
            }
          });
        }
      }
    }

    /*
      Quiz.userSubmitAnswer(optionDef)
        => Stores user's answer (optionDef) and increments 'quiz.progIndex'
    */
    Quiz.userSubmitAnswer = function(optionDef) {
      // record answer
      $rootScope.quiz.questions[$rootScope.quiz.progIndex].userAnswer = optionDef;
      // increment quiz progress
      $rootScope.quiz.progIndex++;
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


    // trigger Quiz initializing on user recognition
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // init user words
        var uid = firebase.auth().currentUser.uid;
        var ref = firebase.database().ref('user-words/' + uid).orderByChild('numSuccess');
        $firebaseArray(ref).$loaded().then(function(userWords) {
          userWordsByNumSuccess = userWords;
          // then init quiz
          Quiz.buildQuiz();
        });

      }
    });

    return Quiz;
  }

  angular
    .module('scholarly')
    .factory('Quiz', ['$rootScope', '$firebaseArray', 'Words', Quiz]);
})();

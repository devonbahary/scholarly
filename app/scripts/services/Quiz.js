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
  function Quiz(Words, $firebaseArray) {
    var Quiz = {};

    var userWordsByNumSuccess = null;

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
      Quiz.buildQuiz(quizSize = 4)
        => Generates an 'instance' object as a property into the 'Quiz' service
        retrievable as 'Quiz.instance' with the following structure:
          Quiz.instance = {
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
            size: number, (size === questions.length when 'generated' === true)
            generated: boolean (completed state)
          }
    */
    Quiz.buildQuiz = function(quizSize = 4) {
      if (userWordsByNumSuccess.length === 0) {
        Quiz.instance = null;
      } else {
        // in the event that 'quizSize' > # user words
        var quizSize = Math.min(userWordsByNumSuccess.length, quizSize);

        // init 'Quiz.instance' object
        Quiz.instance = {
          questions: [],
          size: quizSize,
          progIndex: 0,
          generated: false
        };

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
            Quiz.instance.questions.push(wordObject);
            if (Quiz.instance.questions.length === Quiz.instance.size) {
              Quiz.instance.generated = true;
              console.log(Quiz.instance)
            }
          });
        }
      }
    }

    /*
      Quiz.userAnswerQuestion(optionIndex)
        => Stores user's answer (optionIndex) to current question in quiz in
        '..questions[..progIndex].answer' and increments '..progIndex' to
        move onto next question.
    */
    Quiz.userAnswerQuestion = function(optionIndex) {
      // ignore if quiz isn't ready
      if (!Quiz.instance.generated) {
        return;
      }
      // record answer
      Quiz.instance.questions[Quiz.instance.progIndex].userAnswer = optionIndex;
      // increment quiz progress
      Quiz.instance.progIndex++;
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
    .factory('Quiz', ['Words', '$firebaseArray', Quiz]);
})();

/*
  scholarly
    app
      scripts
        controllers
          * QuizCtrl.js
  +---------------------------------------------------------------------------
    * QuizCtrl.js
        A controller to handle the 'quiz' state.
  ---------------------------------------------------------------------------+
*/

(function() {
  function QuizCtrl() {
    this.quizProgIndex = 0;

    this.quizLength = 4;

    this.quizWords = [
      {
        wordName: 'affectation',
        multipleChoice: [
          'a headless horse.',
          'a singing ferret.',
          'a kind of pasta.',
          'the noise of sneezing.'
        ]
      }
    ];

    this.getNumber = function(num) {
      return new Array(num);
    }
  }

  angular
    .module('scholarly')
    .controller('QuizCtrl', QuizCtrl);
})();

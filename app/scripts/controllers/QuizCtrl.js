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
  function QuizCtrl($rootScope, $scope, Quiz) {

    var that = this;

    $scope.quizService = Quiz;

    $scope.inProgress = false;

    this.btnSelectOption = function(option) {
      Quiz.userSubmitAnswer(option);
      var quizProg = $rootScope.quiz.progIndex / $rootScope.quiz.size;
      document.getElementById('progress-bar-thumb').style.width = (quizProg * 100) + '%';
    }

    // watch quiz load progress and adjust load progress bar accordingly
    $rootScope.$watch('quiz.questions.length', function(newQuestions) {
      var loadProg = $scope.quizService.getLoadState();
      document.getElementById('quiz-load-prog-bar-thumb').style.width =  (loadProg * 100) + '%';
      if (loadProg === 1) {
        setTimeout(function() {
          $scope.inProgress = true;
          $scope.$apply();
        }, 400);
      }
    });
  }

  angular
    .module('scholarly')
    .controller('QuizCtrl', ['$rootScope', '$scope', 'Quiz', QuizCtrl]);
})();

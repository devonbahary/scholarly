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
  function QuizCtrl($rootScope, $scope, $state, Quiz) {
    var that = this;


    this.scrollMem = 0;

    $scope.inProgress = false;
    $scope.complete = false;

    // handling when quiz is revisited
    if ($rootScope.quiz.progIndex > 0) {
      Quiz.newQuiz(); // create new quiz if quiz was unfinished
    } else if (Quiz.getLoadState() === 1) {
      $scope.inProgress = true;
    }

    /*
      this.btnSelectOption(option)
        => Takes a definition argument and records it as an answer to the current
        quiz question, animates the quiz progress bar, and flags quiz completion.
    */
    this.btnSelectOption = function(option) {
      // submit answer and check for quiz complete status
      if (Quiz.userSubmitAnswer(option)) {
        $scope.complete = true;
        that.scrollMem = 0;
        // wait a moment at quiz completion before transitioning to quiz success
        // bar
        setTimeout(function() {
          var quizSuccess = $rootScope.quiz.total / $rootScope.quiz.size;
          document.getElementById('progress-bar-thumb').style.width = (quizSuccess * 100) + '%';
        }, 100);
      }
      // animate quiz progress bar
      var quizProg = $rootScope.quiz.progIndex / $rootScope.quiz.size;
      document.getElementById('progress-bar-thumb').style.width = (quizProg * 100) + '%';
    }


    this.btnReplay = function() {
      Quiz.reset();
      $state.reload();
    }

    this.btnNext = function() {
      Quiz.newQuiz();
      $state.go($state.current, {}, {reload: true});
    }

    // watch quiz load progress and adjust load progress bar accordingly
    $rootScope.$watch('quiz.questions.length', function(newQuestions) {
      var loadProg = Quiz.getLoadState();
      var quizLoadProgThumb = document.getElementById('quiz-load-prog-bar-thumb');
      if (quizLoadProgThumb) {
        quizLoadProgThumb.style.width =  (loadProg * 100) + '%';
      }
      // wait a moment at full load progress before beginning quiz
      if (loadProg === 1) {
        setTimeout(function() {
          $scope.inProgress = true;
          $scope.$apply();
        }, 400);
      }
    });

    var scrollElement = document.getElementById('word-list-box')
    var containerBtns = document.getElementById('container-btns');
    scrollElement.onscroll = function() {
      if (scrollElement.scrollTop > that.scrollMem) {
        containerBtns.classList.add('hidden');
      } else {
        containerBtns.classList.remove('hidden');
      }
      that.scrollMem = scrollElement.scrollTop;
    }
  }

  angular
    .module('scholarly')
    .controller('QuizCtrl', ['$rootScope', '$scope', '$state', 'Quiz', QuizCtrl]);
})();

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
  function QuizCtrl(Quiz) {

    var that = this;

    this.instance = Quiz.instance;
  }

  angular
    .module('scholarly')
    .controller('QuizCtrl', ['Quiz', QuizCtrl]);
})();

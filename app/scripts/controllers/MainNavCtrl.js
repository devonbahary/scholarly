/*
  scholarly
    app
      scripts
        controllers
          * MainNavCtrl.js
  +---------------------------------------------------------------------------
    * MainNavCtrl.js
        A controller to handle state transitions.
  ---------------------------------------------------------------------------+
*/

(function() {
  function MainNavCtrl($state) {
    this.btnGoToWords = function() {
      $state.go('words');
    }

    this.btnGoToQuiz = function() {
      $state.go('quiz', {}, {reload: true});
    }

    this.btnGoToUser = function() {
      firebase.auth().signOut();
    }

    this.currentStateIs = function(name) {
      return $state.is(name);
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        $state.go('landing');
      }
    });
  }

  angular
    .module('scholarly')
    .controller('MainNavCtrl', ['$state', MainNavCtrl]);
})();

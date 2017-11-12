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
  function MainNavCtrl($state, UserWords) {
    var that = this;

    this.user = null;
    this.openSignOut = false;

    this.btnGoToWords = function() {
      $state.go('words');
    }

    this.btnGoToQuiz = function() {
      $state.go('quiz', {}, {reload: true});
    }

    this.btnOpenSignOut = function() {
      that.openSignOut = true;
    }

    this.btnSignOut = function() {
      firebase.auth().signOut();
    }

    this.btnCloseSignOutModal = function() {
      that.openSignOut = false;
    }

    this.currentStateIs = function(name) {
      return $state.is(name);
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.user = user;
      } else {
        $state.go('landing');
      }
    });
  }

  angular
    .module('scholarly')
    .controller('MainNavCtrl', ['$state', 'UserWords', MainNavCtrl]);
})();

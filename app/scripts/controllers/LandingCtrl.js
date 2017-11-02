/*
  scholarly
    app
      scripts
        controllers
          * LandingCtrl.js
  +---------------------------------------------------------------------------
    * LandingCtrl.js
        A controller to handle the 'landing' state.
  ---------------------------------------------------------------------------+
*/

(function() {
  function LandingCtrl($scope, $state, $http) {
    /*
      resetForms()
        => Initializes form ng-models 'logInUser', 'signUpUser', + 'inputError'.
    */
    function resetForms() {
      // log in form
      $scope.logInUser = {
        email: '',
        password: ''
      };
      // sign up form
      $scope.signUpUser = {
        displayName: '',
        email: '',
        password: ''
      };
      // contains error message || false
      $scope.inputError = false;
    }

    resetForms();

    /*
      btnOpenLogIn()
        => Transitions to log in view.
    */
    this.btnOpenLogIn = function() {
      document.getElementById('welcome-view').style.left = '-100%';
      document.getElementById('login-view').style.left = '0';
    }

    /*
      btnOpenSignUp()
        => Transitions to sign up view.
    */
    this.btnOpenSignUp = function() {
      document.getElementById('welcome-view').style.left = '-100%';
      document.getElementById('signup-view').style.left = '0';
    }

    /*
      btnClose()
        => Transition back to welcome view and reset forms.
    */
    this.btnClose = function() {
      document.getElementById('welcome-view').style.left = '0';
      document.getElementById('login-view').style.left = '100%';
      document.getElementById('signup-view').style.left = '100%';
      document.getElementById('login-form').reset();
      document.getElementById('signup-form').reset();
      resetForms();
    }

    /*
      btnLogIn()
        => Log in with validated log in form input; display error message.
    */
    this.btnLogIn = function() {
      email = $scope.logInUser.email;
      password = $scope.logInUser.password;
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        $scope.inputError = error.message;
      });
    }

    /*
      btnSignUp()
        => Sign up with validated sign up form input; display error message.
    */
    this.btnSignUp = function() {
      displayName = $scope.signUpUser.displayName;
      email = $scope.signUpUser.email;
      password = $scope.signUpUser.password;
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        $scope.inputError = error.message;
      }).then(function(user) {
        if (user) {
          user.updateProfile({
            displayName: displayName
          });
        }
      });
    }


    // EDIT
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $state.go('quiz');
      } else {
        alert('signed out');
      }
    });

  }

  angular
    .module('scholarly')
    .controller('LandingCtrl', ['$scope', '$state', '$http', LandingCtrl]);
})();

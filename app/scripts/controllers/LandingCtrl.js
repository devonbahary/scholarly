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
  function LandingCtrl($scope, $state, $http, User) {

    var that = this;



    /*
      Password reset via email
    */
    this.openForgotEmailModal = false;
    this.sendingEmailPasswordReset = false;
    this.emailForgot = "";
    this.forgotPasswordErrorMsg = null;
    this.forgotPasswordSuccess = false;

    /*
      resetForms()
        => Initializes form ng-models 'logInUser', 'signUpUser', + 'inputError'.
    */
    function resetForms() {
      // log in form
      that.logInUser = {
        email: '',
        password: ''
      };
      // sign up form
      that.signUpUser = {
        displayName: '',
        email: '',
        password: ''
      };
      // contains error message || false
      that.inputError = false;
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
      email = that.logInUser.email;
      password = that.logInUser.password;
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        that.inputError = error.message;
      });
      document.getElementById('input-log-in-email').blur();
      document.getElementById('input-log-in-password').blur();
    }

    /*
      btnSignUp()
        => Sign up with validated sign up form input; display error message.
    */
    this.btnSignUp = function() {
      displayName = that.signUpUser.displayName;
      email = that.signUpUser.email;
      password = that.signUpUser.password;
      User.createUser(email, password, displayName).then(function resolve(val) {

      }, function reject(errorMessage) {
        that.inputError = errorMessage;
        $scope.$apply();
      });
      document.getElementById('input-sign-up-display-name').blur();
      document.getElementById('input-sign-up-email').blur();
      document.getElementById('input-sign-up-password').blur();
    }


    this.btnOpenForgotPasswordModal = function() {
      that.openForgotEmailModal = true;
    }

    this.btnForgotPassword = function() {
      var email = that.emailForgot;
      that.emailForgot = "";
      that.sendingEmailPasswordReset = true;
      that.forgotPasswordSuccess = false;
      that.forgotPasswordErrorMsg = null;
      User.sendPasswordReset(email).then(function resolve() {
        that.forgotPasswordSuccess = true;
        that.sendingEmailPasswordReset = false;
        $scope.$apply();
      }, function reject(errorMessage) {
        that.forgotPasswordErrorMsg = errorMessage;
        that.sendingEmailPasswordReset = false;
        $scope.$apply();
      });
    }

    this.btnCloseForgotPasswordModal = function() {
      that.openForgotEmailModal = false;
      document.getElementById('modal-forgot-password').reset();
      that.emailForgot = "";
      that.forgotPasswordSuccess = false;
      that.forgotPasswordErrorMsg = null;
    }

    this.showPasswordResetPrompt = function() {
      return !that.sendingEmailPasswordReset && !that.forgotPasswordErrorMsg && !that.forgotPasswordSuccess;
    }

    this.showPasswordResetRequest = function() {
      return that.sendingEmailPasswordReset && !that.forgotPasswordErrorMsg && !that.forgotPasswordSuccess;
    }


    // EDIT
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $state.go('words');
      } else {
        $state.go('landing')
      }
    });

  }

  angular
    .module('scholarly')
    .controller('LandingCtrl', ['$scope', '$state', '$http', 'User', LandingCtrl]);
})();

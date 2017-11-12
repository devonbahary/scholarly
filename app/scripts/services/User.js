/*
  scholarly
    app
      scripts
        services
          * User.js
   +---------------------------------------------------------------------------
    * User.js
        A service for interaction with the Firebase database for the user's
        profile.
   ---------------------------------------------------------------------------+
*/

(function() {
  function User() {
    var User = {};


    /*
      User.createUser()
        => Attempts to create a user through Firebase, resolving on success or
        rejecting with an error message.
    */
    User.createUser = function(email, password, displayName) {
      return new Promise((resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
          reject(error.message);
        }).then(function(user) {
          if (user) {
            user.updateProfile({
              displayName: displayName
            });
          }
          resolve();
        });
      });
    }


    /*
    */
    User.sendPasswordReset = function(email) {
      return new Promise((resolve, reject) => {
        firebase.auth().sendPasswordResetEmail(email).then(function() {
          resolve();
        }).catch(function(error) {
          reject(error.message);
        });
      });
    }

    return User;
  }

  angular
    .module('scholarly')
    .factory('User', User);
})();

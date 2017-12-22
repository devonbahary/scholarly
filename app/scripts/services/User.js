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
  function User($firebaseObject, $rootScope) {
    var User = {};

    User.userProfile = null;

    /*
      userProfileRef()
        => Returns the firebase reference to the profile data for current user.
    */
    function userProfileRef() {
      var uid = firebase.auth().currentUser.uid;
      return firebase.database().ref('user-profiles/' + uid);
    }

    User.getUserProfile = function() {
      if (User.userProfile) {
        return Promise.resolve(User.userProfile);
      } else {
        return $firebaseObject(userProfileRef()).$loaded().then(function(userProfile) {
          User.userProfile = userProfile;
          return userProfile;
        });
      }
    }

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
      User.createUserProfile()
        => Creates a new user profile in the database to store user information.
    */
    User.createUserProfile = function() {
      userProfileRef().set({
        settingQuizLength: 4,
        settingQuizBuffering: true
      });
    }

    /*
      User.updateSettings()
        => Takes the existing userProfile object (modified from the view) and
        updates the database userProfile object with its properties.
    */
    User.updateSettings = function() {
      var newProfile = User.userProfile;
      userProfileRef().once('value').then(function(snapshot) {
        // detect + emit change in 'settingQuizLength'
        if (snapshot.val().settingQuizLength !== newProfile.settingQuizLength) {
          $rootScope.$emit('quizLengthChanged');
        }
        // detect + emit change in 'settingQuizBuffering'
        if (snapshot.val().settingQuizBuffering !== newProfile.settingQuizBuffering) {
          $rootScope.$emit('quizBufferingChanged', newProfile.settingQuizBuffering);
        }
      });
      userProfileRef().update({
        settingQuizLength: newProfile.settingQuizLength,
        settingQuizBuffering: newProfile.settingQuizBuffering
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

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // create user profile data if !exists
        userProfileRef().once('value').then(function(snapshot) {
          if (!snapshot.val()) {
            User.createUserProfile();
          }
        });
        User.getUserProfile();
      } else {
        User.userProfile = null;
      }
    });

    return User;
  }

  angular
    .module('scholarly')
    .factory('User', ['$firebaseObject', '$rootScope', User]);
})();

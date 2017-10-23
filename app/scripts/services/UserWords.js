/*
  scholarly
    app
      scripts
        services
          * UserWords.js
   +---------------------------------------------------------------------------
    * UserWords.js
        A service for interaction with the Firebase database for the user's
        collected words.
   ---------------------------------------------------------------------------+
*/

(function() {
  function UserWords($firebaseArray) {
    var UserWords = {};

    function userWordsRef() {
      var uid = firebase.auth().currentUser.uid;
      return firebase.database().ref('user-words/' + uid);
    }

    /*
      UserWords.getWords()
        => Returns a '$firebaseArray' of user's collected words.
    */
    UserWords.getWords = function() {
      return $firebaseArray(userWordsRef()).$loaded().then(function(val) {
        return val;
      });
    }

    /*
      UserWords.hasWord(...)
    */

    return UserWords;
  }

  angular
    .module('scholarly')
    .factory('UserWords', ['$firebaseArray', UserWords]);
})();

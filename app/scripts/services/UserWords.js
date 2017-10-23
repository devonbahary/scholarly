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

    var userWords = null;

    /*
      userWordsRef()
        => Returns the firebase reference to the words data for current user.
    */
    function userWordsRef() {
      var uid = firebase.auth().currentUser.uid;
      return firebase.database().ref('user-words/' + uid);
    }

    /*
      getWords()
        => Returns a '$firebaseArray' of user's collected words.
    */
    UserWords.getWords = function() {
      // return 'userWords' if already instantiated
      if (userWords) {
        return userWords;
      }
      // otherwise, request 'userWords', assign, and return
      return $firebaseArray(userWordsRef()).$loaded().then(function(val) {
        userWords = userWords || val;
        return val;
      });
    }

    /*
      hasWord(wordName)
        => Returns true if 'wordName' already exists in user's database.
    */
    UserWords.hasWord = function(wordName) {
      // iterate through instantiated 'userWords'
      for (var i = 0; i < userWords.length; i++) {
        if (userWords[i].name === wordName.trim().toLowerCase()) {
          return true;
        }
      }
      // if not found, return false
      return false;
    }

    /*
      addWord(wordObject)
        => Takes in 'wordObject' and adds it to the database. Returns success boolean.
    */
    UserWords.addWord = function(wordObject) {
      // return 'false' if word already exists
      if (UserWords.hasWord(wordObject.name)) {
        return false;
      }
      // create new word
      var newWordsRef = userWordsRef().push();
      newWordsRef.set({
        name: wordObject.name.trim().toLowerCase(),
        definition: wordObject.definition,
        partOfSpeech: wordObject.partOfSpeech || '---',
        numSuccess: 0,
        numAttempts: 0
      });
      // return 'true' for success
      return true;
    }


    return UserWords;
  }

  angular
    .module('scholarly')
    .factory('UserWords', ['$firebaseArray', UserWords]);
})();

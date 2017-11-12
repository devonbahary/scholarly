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
  function UserWords($firebaseArray, $firebaseObject) {
    var UserWords = {};


    UserWords.words = null;

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
        => Returns the user's words from the database.
    */
    UserWords.getWords = function() {
      if (UserWords.words) {
        return Promise.resolve(UserWords.words);
      } else {
        return $firebaseArray(userWordsRef()).$loaded().then(function(words) {
          UserWords.words = words;
          return UserWords.words;
        });
      }

    }

    /*
      hasWord(wordName)
        => Returns true if 'wordName' already exists in user's database.
    */
    UserWords.hasWord = function(wordName) {
      for (var i = 0; i < UserWords.words.length; i++) {
        if (UserWords.words[i].name === wordName.trim().toLowerCase()) {
          return true;
        }
      }

      // if not found, return false
      return false;
    }

    /*
      hasDefForWord(wordName, definition)
        => Returns true if a matching 'definition' is found for the given 'wordName'
    */
    UserWords.hasDefForWord = function(wordName, definition) {
      for (var i = 0; i < UserWords.words.length; i++) {
        if (UserWords.words[i].name === wordName.trim().toLowerCase() && UserWords.words[i].definition === definition) {
          return true;
        }
      }

      // return false if failed above conditions
      return false;
    }

    /*
      getDefForWord(wordName)
        => Returns definition for word in database, or null if word not found.
    */
    UserWords.getDefForWord = function(wordName) {
      for (var i = 0; i < UserWords.words.length; i++) {
        if (UserWords.words[i].name === wordName.trim().toLowerCase()) {
          return UserWords.words[i].definition;
        }
      }
      // return null if can't find word
      return null;
    }

    /*
      getPartOfSpeechForWord(wordName)
        => Returns part of speech for word in database, or null if word not
        found.
    */
    UserWords.getPartOfSpeechForWord = function(wordName) {
      for (var i = 0; i < UserWords.words.length; i++) {
        if (UserWords.words[i].name === wordName.trim().toLowerCase()) {
          return UserWords.words[i].partOfSpeech;
        }
      }

      // return null if can't find word
      return null;
    }


    UserWords.getWordObjectForName = function(wordName) {
      for (var i = 0; i < UserWords.words.length; i++) {
        if (UserWords.words[i].name === wordName.trim().toLowerCase()) {
          return UserWords.words[i];
        }
      }
      // return false if can't find word
      return null;
    }

    /*
      addWord(wordObject)
        => Takes in 'wordObject' and adds it to the database and returns success boolean.
    */
    UserWords.addWord = function(wordObject) {
      // create new word
      var newWordsRef = userWordsRef().push();
      var custom = wordObject.custom ? wordObject.custom : false;
      console.log('custom = ' + custom)
      newWordsRef.set({
        name: wordObject.name.trim().toLowerCase(),
        definition: wordObject.definition,
        partOfSpeech: wordObject.partOfSpeech,
        syllables: wordObject.syllables ? wordObject.syllables : "",
        example: wordObject.example ? wordObject.example : "",
        custom: wordObject.custom ? wordObject.custom : false,
        numSuccess: 0,
        numAttempts: 0,
        successRate: 0,
        streak: 0
      });
      // return 'true' for success
      return true;
    }


    /*
      @func updateWordStats(...)
      @desc Updates the firebase 'user-words/uid' with the results of the
      success of the argument word
      @param {object}, {boolean}
    */
    UserWords.updateWordStats = function(word, success) {
      // update 'user-words'
      var newNumAttempts = word.numAttempts + 1;
      var newNumSuccess = success ? word.numSuccess + 1 : word.numSuccess;
      var newSuccessRate = newNumSuccess / newNumAttempts * 100;
      var newStreak = success ? word.streak + 1 : 0
      userWordsRef().child(word.$id).update({
        numAttempts: newNumAttempts,
        numSuccess: newNumSuccess,
        successRate: newSuccessRate,
        streak: newStreak
      });
    };


    /*
      removeWord(wordName)
        => Removes given 'wordName' from the database if it exists.
    */
    UserWords.removeWord = function(wordName) {
      if (UserWords.hasWord(wordName)) {
        $firebaseObject(userWordsRef().orderByChild('name').equalTo(wordName.trim().toLowerCase())).$remove();
      }
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        UserWords.getWords();
      }
    });


    return UserWords;
  }

  angular
    .module('scholarly')
    .factory('UserWords', ['$firebaseArray', '$firebaseObject', UserWords]);
})();

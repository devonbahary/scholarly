/*
  scholarly
    app
      scripts
        services
          * Words.js
   +---------------------------------------------------------------------------
    * Words.js (https://www.wordsapi.com/docs)
        A service for interaction with the [Words API] (see link).
   ---------------------------------------------------------------------------+
*/

(function () {
  function Words($http) {
    var Words = {};

    // Mashape API keys for $http requests (http://docs.mashape.com/api-keys)
    var headers = {
      'X-Mashape-Authorization': 'TXquNOq49pmshGH8Nj6IaF9GE9dGp1BrhDrjsn8VrwQ4AbAbUt'
    };


    /*
      responseToWordObjects(response)
        => Takes a 'response' from Words API and return an array of relevant
        word objects from the word queried.
    */
    function responseToWordObjects(response, wordName) {
      var filteredResponse = [];
      for (var i = 0; i < response.data.results.length; i++) {
        filteredResponse[i] = {
          name: wordName ? wordName : response.data.word,
          definition: response.data.results[i].definition,
          partOfSpeech: response.data.results[i].partOfSpeech,
          synonyms: response.data.results[i].synonyms,
          example: response.data.results[i].examples ? response.data.results[i].examples[0] : null,
          syllables: response.data.syllables ? response.data.syllables.list.join(' · ') : null,
          frequency: response.data.frequency
        };
      }
      return filteredResponse;
    }

    /*
      Words.getWord(wordName)
        => Returns a word object for 'wordName', or the response 'statusText'
        if the $http request was unsuccessful.
    */
    Words.getWord = function(wordName) {
      // $http call for word data
      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words/' + wordName,
        headers
      }).then(function(response) {
        return successfulCallback(response)
      }, function(response) {
        return errorCallback(response)
      });
      // success return function
      function successfulCallback(response) {
        if (!response.data.results) {
          return errorCallback({statusText: 'Not Found'});
        }
        return responseToWordObjects(response, wordName);
      }
      // error return function
      function errorCallback(response) {
        return response.statusText;
      }
    }

    /*
      Words.getRandWordForPartOfSpeech(partOfSpeech)
        => Takes in an optional string 'partOfSpeech' and uses it in a query to
        Words API to return a random word matching the part of speech.
    */
    Words.getRandWordForPartOfSpeech = function(partOfSpeech) {
      var query = "/?random=true" + (partOfSpeech ? '&partOfSpeech=' + partOfSpeech : '');

      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words' + query,
        headers
      }).then(function successfulCallback(response) {
        // recursive call if random word selected does not have definition data
        if (!response.data.results) {
          return Words.getRandWordForPartOfSpeech(partOfSpeech);
        }
        return response.data;
      }, function errorCallback(response) {
        return response.statusText;
      });
    }

    /*
      Words.getPartsOfSpeech()
        => Returns an array containing strings for each part of speech.
    */
    Words.getPartsOfSpeech = function() {
      return [
        "noun",
        "pronoun",
        "verb",
        "adverb",
        "adjective",
        "conjunction",
        "preposition",
        "interjection"
      ];
    }

    /*
      Words.getWordSimilarTo(sampleWord)
        => Takes a sample word from UserWords and returns a word from Words API
        "similar to" the sample word. If it can't find a good result (a non-
        empty response with valid definition), returns a random word.
    */
    Words.getWordSimilarTo = function(sampleWord) {
      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words/' + sampleWord + '/similarTo',
        headers
      }).then(function(response) {
          var similarWords = response.data.similarTo;
          if (similarWords.length > 0) {
              var randomSample = similarWords[Math.floor(Math.random() * similarWords.length)];
              return Words.getWord(randomSample).then(function(wordData) {
                  return wordData[Math.floor(Math.random() * wordData.length)];
              });
          } else {
              return Words.getRandomWord();
          }
      });
    }

    /*
      Words.getRandomWord()
        =>  Returns a random word object from Words API.
    */
    Words.getRandomWord = function() {
      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words/?random=true',
        headers
      }).then(function(response) {
          // recursive call if random word selected does not have definition data
          if (!response.data.results) {
              return Words.getRandomWord();
          }
          var wordData = responseToWordObjects(response);
          return wordData[Math.floor(Math.random() * wordData.length)];
      });
    }

    return Words;
  }

  angular
    .module('scholarly')
    .factory('Words', ['$http', Words]);
})();

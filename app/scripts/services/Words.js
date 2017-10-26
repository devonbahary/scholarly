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
      Words.getWord(wordName)
        => Returns a word object for 'wordName', or the response 'statusText'
        if the $http request was unsuccessful.
    */
    Words.getWord = function(wordName) {
      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words/' + wordName,
        headers
      }).then(function successfulCallback(response) {
        var filteredResponse = [];
        for (var i = 0; i < response.data.results.length; i++) {
          filteredResponse[i] = {
            name: wordName,
            definition: response.data.results[i].definition,
            partOfSpeech: response.data.results[i].partOfSpeech,
            synonyms: response.data.results[i].synonyms,
            example: response.data.results[i].examples ? response.data.results[i].examples[0] : null,
            syllables: response.data.syllables ? response.data.syllables.list.join(' · ') : null,
            frequency: response.data.frequency
          };
        }
        console.log(filteredResponse);
        return filteredResponse;
      }, function errorCallback(response) {
        return response.statusText;
      });
    }

    /*
      Words.getWordInfo(word)
        => Returns the word object data for the given word.
    */
    Words.getWordInfo = function(word) {
      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words/' + word,
        headers
      }).then(function successfulCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return null;
      });
    }

    return Words;
  }

  angular
    .module('scholarly')
    .factory('Words', ['$http', Words]);
})();

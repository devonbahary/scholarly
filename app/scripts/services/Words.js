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
      Words.getDefinitions(word)
        => Returns an array of definition objects for the given string argument,
        or the response 'statusText' if the $http request was unsuccessful
    */
    Words.getDefinitions = function(word) {
      return $http({
        method: 'GET',
        url: 'https://wordsapiv1.p.mashape.com/words/' + word + '/definitions',
        headers
      }).then(function successfulCallback(response) {
        return response.data.definitions;
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

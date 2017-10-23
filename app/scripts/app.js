/*
  scholarly
    app
      scripts
        * app.js
  +---------------------------------------------------------------------------
    * app.js
        Main script for the 'scholarly' app.
  ---------------------------------------------------------------------------+
*/

(function() {
  function config($stateProvider, $locationProvider) {
    $locationProvider
      .html5Mode({
        enabled: true,
        requireBase: false
      });

    $stateProvider
      .state('landing', {
        controller: 'LandingCtrl',
        controllerAs: 'landing',
        url: '/',
        templateUrl: '/templates/landing.html'
      })
      .state('words', {
        controller: 'WordsCtrl',
        controllerAs: 'words',
        url: '/words',
        templateUrl: '/templates/words.html'
      });
  }

  angular
    .module('scholarly', ['ui.router', 'firebase'])
    .config(config);
})();

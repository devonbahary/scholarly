/*
  scholarly
    app
      scripts
        controllers
          * WordsCtrl.js
  +---------------------------------------------------------------------------
    * WordsCtrl.js
        A controller to handle the 'words' state.
  ---------------------------------------------------------------------------+
*/

(function() {
  function WordsCtrl(UserWords, Words, $scope, $firebaseArray, $http) {

    var that = this;

    this.searchUserWord = "";
    this.userWords = [];

    this.scrollMem = 0;

    function initSearchVars() {
      that.searchAddWord = "";
      that.searchResults = [];
      that.searchPending = false;
      that.searchErrorFlag = false;
    }

    initSearchVars();

    this.clearSearchUserWord = function() {
      that.searchUserWord = "";
    }

    /*

    */
    this.attachBtnOpenAddWordResponsiveness = function() {
      var userWordsBox = document.getElementById('user-words-box');
      var btnNav = document.getElementById('btn-open-add-word');
      userWordsBox.onscroll = function() {
        if (userWordsBox.scrollTop > that.scrollMem) {
          btnNav.style.opacity = '0';
        } else {
          btnNav.style.opacity = '1';
        }
        that.scrollMem = userWordsBox.scrollTop;
      }
    }

    this.btnOpenAddWord = function(searchWord) {
      // transition view
      document.getElementById('words-view').style.left = '100%';
      document.getElementById('add-word-view').style.left = '0';
      document.getElementById('add-word-input').focus();

      // implement nav button responsiveness
      var searchResultsBox = document.getElementById('search-results-box');
      var btnNav = document.getElementById('btn-return-to-words');
      searchResultsBox.onscroll = function() {
        if (searchResultsBox.scrollTop > that.scrollMem) {
          btnNav.style.opacity = '0';
        } else {
          btnNav.style.opacity = '1';
        }
        that.scrollMem = searchResultsBox.scrollTop;
      }

      // trigger auto-search
      if (searchWord) {
        that.searchAddWord = searchWord;
        that.searchWord();
      }
    }

    this.btnReturnToWords = function() {
      // transition view
      document.getElementById('words-view').style.left = '0';
      document.getElementById('add-word-view').style.left = '-100%';
      document.getElementById('form-add-word-search').reset();
      that.scrollMem = 0;
      initSearchVars();

      // implement nav button responsiveness
      that.attachBtnOpenAddWordResponsiveness();
    }

    this.searchWord = function() {
      that.searchResults = [];
      that.searchErrorFlag = false;
      that.searchPending = true;
      Words.getDefinitions(that.searchAddWord).then(function(value) {
        that.searchResults = value;
        that.searchErrorFlag = (typeof(value) === 'string');
        that.searchPending = false;
      });
      document.getElementById('add-word-input').blur();
    }

    // load 'userWords' as soon as user detected
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        UserWords.getWords().then(function(val) {
          that.userWords = val;
        });
      }
    })

  }

  angular
    .module('scholarly')
    .controller('WordsCtrl', ['UserWords', 'Words', '$scope', '$firebaseArray', '$http', WordsCtrl]);
})();

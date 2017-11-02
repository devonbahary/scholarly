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

    this.txtActionNotification = "";

    this.searchUserWord = "";
    this.userWords = [];

    this.pendingWordToAdd = null;
    this.pendingWordToReplace = false;
    this.pendingWordToReplaceDef = null;
    this.pendingWordToReplacePartOfSpeech = null;

    this.viewWord = null;
    this.viewWordData = null;
    this.removeWordFlag = false;

    /*
      0 => alpha A-Z
      1 => alpha Z-A
      2 => numSuccess (lowest to high)
      3 => numSuccess (highest to low)
    */
    this.sortBy = 0;


    this.scrollMem = 0;

    function resetAddSearchVars() {
      that.searchAddWord = "";
      that.searchResults = [];
      that.searchPending = false;
      that.searchErrorFlag = false;
    }

    resetAddSearchVars();

    function addBtnNavResponsivenessToElementScroll(btnNav, element) {
      element.onscroll = function() {
        if (element.scrollTop > that.scrollMem) {
          btnNav.classList.add('hidden');
        } else {
          btnNav.classList.remove('hidden');
        }
        that.scrollMem = element.scrollTop;
      }
    }

    function updateTxtActionNotification(text) {
      that.txtActionNotification = text;
      var oldText = text;
      document.getElementById('action-notification').classList.add('show');
      setTimeout(function() {
        // allow element to persist if new notification appears before timeout
        if (oldText === that.txtActionNotification) {
          document.getElementById('action-notification').classList.remove('show');
        }
      }, 3000);
    }

    this.sortByOrder = function() {
      return (that.sortBy < 2 ) ? '-name' : '-successRate';
    }

    this.sortByReversed = function() {
      return (that.sortBy % 2 == 0) ? true : false;
    }

    this.clearSearchUserWord = function() {
      that.searchUserWord = "";
    }

    /*
      btnSortUserWords()
        => Iterates 'this.sortBy' to the next sort category.
    */
    this.btnSortUserWords = function() {
      that.sortBy++;
      if (that.sortBy > 3) { that.sortBy = 0; }
      document.getElementById('user-words-box').scrollTop = 0;
    }

    /*

    */
    this.attachBtnOpenAddWordResponsiveness = function() {
      var btnNav = document.getElementById('btn-open-add-word');
      var userWordsBox = document.getElementById('user-words-box');
      addBtnNavResponsivenessToElementScroll(btnNav, userWordsBox);
    }

    this.btnOpenAddWord = function(searchWord) {
      if (!searchWord && document.getElementById('btn-open-add-word').style.opacity === '0') {
        return;
      }

      that.btnCloseViewWordModal()

      // transition view
      document.getElementById('words-view').style.left = '100%';
      document.getElementById('add-word-view').style.left = '0';
      document.getElementById('add-word-input').focus();
      document.getElementById('btn-open-add-word').style.right = "-95%";
      document.getElementById('btn-return-to-words').style.right = '5%';

      // implement nav button responsiveness
      var btnNav = document.getElementById('btn-return-to-words');
      var searchResultsBox = document.getElementById('search-results-box');
      addBtnNavResponsivenessToElementScroll(btnNav, searchResultsBox);

      // trigger auto-search
      if (searchWord) {
        that.searchAddWord = searchWord;
        that.searchWord();
      }
    }

    this.btnReturnToWords = function(force = false) {
      if (!force && document.getElementById('btn-return-to-words').style.opacity === '0') {
        return;
      }

      // transition view
      document.getElementById('words-view').style.left = '0';
      document.getElementById('add-word-view').style.left = '-100%';
      document.getElementById('form-add-word-search').reset();
      document.getElementById('btn-return-to-words').style.right = '105%';
      document.getElementById('btn-open-add-word').style.right = '5%';
      that.scrollMem = 0;
      resetAddSearchVars();

      // implement nav button responsiveness
      that.attachBtnOpenAddWordResponsiveness();
      // reset modal
      that.btnCloseAddWordModal();
    }

    this.searchWord = function() {
      that.searchResults = [];
      that.searchErrorFlag = false;
      that.searchPending = true;
      Words.getWord(that.searchAddWord).then(function(response) {
        // unsuccessful request
        if (typeof(response) === 'string') {
          that.searchResults = response;
          that.searchErrorFlag = true;
        } else { // successful
          that.searchResults = response;
        }
        that.searchPending = false;
      });
      document.getElementById('add-word-input').blur();
    }

    this.btnOpenAddWordModal = function(result) {
      if (that.hasDefForWord(result)) {
        return;
      }
      that.pendingWordToAdd = result;
      if (UserWords.hasWord(that.searchAddWord)) {
        that.pendingWordToReplace = true;
        that.pendingWordToReplaceDef = UserWords.getDefForWord(that.searchAddWord);
        that.pendingWordToReplacePartOfSpeech = UserWords.getPartOfSpeechForWord(that.searchAddWord);
      }
    }

    this.btnCloseAddWordModal = function() {
      that.pendingWordToAdd = null;
      that.pendingWordToReplace = false;
      that.pendingWordToReplacePartOfSpeech = null;
      that.pendingWordToReplaceDef = null;
    }

    this.btnAddWord = function() {
      // remove word first if it already exists with a different definition
      if (that.pendingWordToReplace) {
        UserWords.removeWord(that.searchAddWord);
      }
      // add word
      if (UserWords.addWord(that.pendingWordToAdd)) {
        var wordName = that.pendingWordToAdd.name;
        that.searchUserWord = wordName;
        updateTxtActionNotification(that.pendingWordToReplace ? "Replaced " + wordName : "Added " + wordName);
        that.btnReturnToWords(true); // force return
      }
    }

    this.btnOpenViewWordModal = function(word) {
      that.viewWord = word;
    }

    this.btnCloseViewWordModal = function() {
      that.viewWord = null;
    }

    this.btnRemoveWord = function() {
      this.removeWordFlag = true;
    }

    this.btnCancelRemoveWord = function() {
      this.removeWordFlag = false;
    }

    this.btnConfirmRemoveWord = function() {
      UserWords.removeWord(that.viewWord.name);
      updateTxtActionNotification("Removed " + that.viewWord.name);
      that.searchUserWord = "";
      this.removeWordFlag = false;
      that.btnCloseViewWordModal();
    }

    /*
      hasDefForWord(result)
        => Returns true if a database match for 'that.searchAddWord' and
        'result.definition' is found.
    */
    this.hasDefForWord = function(result) {
      return UserWords.hasDefForWord(that.searchAddWord, result.definition);
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

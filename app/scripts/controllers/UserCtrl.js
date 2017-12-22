/*
  scholarly
    app
      scripts
        controllers
          * UserCtrl.js
  +---------------------------------------------------------------------------
    * UserCtrl.js
        A controller to handle the 'user' state.
  ---------------------------------------------------------------------------+
*/

(function() {
  function UserCtrl($scope, User) {
    var that = this;

    this.user = User;

    /*
      => Save changes to settings made in the view to the database on controller
      exit.
    */
    $scope.$on('$destroy', function() {
      User.updateSettings();
    });
  }

  angular
    .module('scholarly')
    .controller('UserCtrl', ['$scope', 'User', UserCtrl]);
})();

'use strict';

angular.module('autonomyApp.auth', [])
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
  })
;

angular.module('autonomyApp.auth')
  .controller('UserInfoController', ['$scope', '$rootScope', 'Session', 'loadUserSession', 'AuthService', 'Logger', '$translate', '$cookies', '$timeout', '$modal', 'Idle', 'Keepalive', function ($scope, $rootScope, Session, loadUserSession, AuthService, Logger, $translate, $cookies, $timeout, $modal, Idle, Keepalive) {
    var logger = Logger.getInstance('UserInfoController');
    $scope.user = loadUserSession;

    $scope.changeLanguage = function (language) {
      AuthService.updateLanguage(language.isoCode);
      AuthService.updateCookie(language.isoCode);
      $translate.use(language.isoCode);
      $scope.currentLanguage = language.label;
    };

    $scope.changeRateInPercent = function (rate) {
      AuthService.updateRateInPercent(rate.rateInPercent);
      $scope.user.currentRateInPercent = rate.rateInPercent;
      $scope.currentRateInPercent = rate.label;
      $scope.user.currentRateLabel = rate.label;
    };

    $scope.logout = function () {
      AuthService.logout(); // Defect #435: Session logging out following a timeout wrongly managed
    };

    $scope.userPreferencesView = function () {
      $scope.modalUserPreferences = $modal.open({
        backdrop: 'static',
        animation: true,
        scope: $scope,
        templateUrl: 'views/header/userPreferencesModal.html',
        controller: function ($scope, $modalInstance) {
          $scope.close = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    };

    $scope.limit = 20;

    $scope.loadCurrentLanguage = function () {
      logger.debug('START loadCurrentLanguage :', $scope.user.currentLanguage);

      angular.forEach($scope.user.languages, function (value, key) {
        if ($scope.user.currentLanguage == value.isoCode) {
          $scope.currentLanguage = value.label;
        }
      });

      logger.debug('END loadCurrentLanguage');
    };

    $scope.loadCurrentRateInPercent = function () {
      logger.debug('START loadCurrentRateInPercent :', $scope.user.currentRateInPercent);

      angular.forEach($scope.user.rateInPercents, function (value, key) {
        if ($scope.user.currentRateInPercent === value.rateInPercent) {
          $scope.currentRateInPercent = value.label;
        }
      });

      logger.debug('END loadCurrentRateInPercent');
    };

    $scope.loadCurrentLanguage();
    $scope.loadCurrentRateInPercent();

    /**
     * Defect #435: Session logging out following a timeout wrongly managed
     * Session timeout management via ng-idle
     */
    // serverSessionDuration in sec
    var serverSessionDuration = Session.propertiesEnvironment.sessionDuration;
    Idle.setIdle(serverSessionDuration);
    // Duration for the display of the timeout message should be less than 10% margin - let's take 5%
    $scope.timeoutMessageDuration = Math.floor(serverSessionDuration * 0.05);
    Idle.setTimeout($scope.timeoutMessageDuration);
    // Interval used to keep the user session alive on server side - for exemple every 75% of the server session duration
    Keepalive.setInterval(Math.floor(serverSessionDuration * 0.75));

    Idle.watch();

    $scope.sessionStarted = false;

    function closeModals() {
      if ($scope.sessionWarning) {
        $scope.sessionWarning.close();
        $scope.sessionWarning = null;
      }
    }

    $scope.$on('IdleStart', function () {
      closeModals();

      $scope.sessionWarning = $modal.open({
        templateUrl: 'views/common/modalSessionTimeout.html',
        windowClass: 'modal-danger',
        controller: function ($scope) {
          $scope.max = angular.element('header.header').scope().timeoutMessageDuration;
        }
      });
    });

    $scope.$on('IdleEnd', function () {
      closeModals();
    });

    $scope.$on('IdleTimeout', function () {
      closeModals();
      $scope.logout();
    });
  }])
;

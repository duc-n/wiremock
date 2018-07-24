'use strict';

angular.module('autonomyApp.transformation', [])
  .controller('TransformationController', ['$scope', '$stateParams', 'Logger', '$modalInstance', 'loadTransformationReport', '$translate',
    function ($scope, $stateParams, Logger, $modalInstance, loadTransformationReport, $translate) {
      var logger = Logger.getInstance('TransformationController');

      logger.debug('Get transformation report : ' + $scope.caseId);

      $scope.policy = angular.fromJson(loadTransformationReport.data);
      $scope.currentLanguage = $translate.use();

      $scope.close = function () {
        $modalInstance.dismiss('cancel');
        angular.element('#site-wrapper').removeClass('notPrintableArea');
      };

      $scope.print = function() {
        var modalDialog = angular.element('.modal-dialog')[0];
        var domClone = modalDialog.cloneNode(true);
        domClone.className = domClone.className.replace(/modal-dialog/,'modal-dialog-print');
        printElement(domClone);
      };

    }]);

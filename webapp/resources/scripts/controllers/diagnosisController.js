'use strict';

angular.module('autonomyApp.diagnosis', [])
  .controller('DiagnosisController', ['$scope', '$stateParams', 'Logger', 'loadDiagnosis','$modalInstance', 'growl', 'DiagnosisResource', '$translate',
    function ($scope, $stateParams, Logger, loadDiagnosis, $modalInstance, growl, DiagnosisResource, $translate) {
      var logger = Logger.getInstance('DiagnosisController');

      logger.debug('Get diagnosis : ' + $scope.caseId);

      $scope.jsonDynamicContent = loadDiagnosis.content;
      $scope.obsoleteOptions = angular.fromJson(loadDiagnosis.obsoleteOptions);

      $scope.saveDiagnosis = function () {        
        logger.debug('Save the diagnosis : ' + $scope.jsonDynamicContent.data);
        growl.info('diagnosis.saving.msg');
        DiagnosisResource.update({'content':$scope.jsonDynamicContent});
        $scope.close();
      };

      $scope.close = function () {
        $modalInstance.dismiss('cancel');
      };
      
      $scope.typeOfObject = function(value) {
    	  return typeof(value);
      };

    }]);

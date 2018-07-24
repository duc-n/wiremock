'use strict';

angular.module('autonomyApp.transformContract', [])
  .controller('TransformContractController',['$scope','$modalInstance','$state','SearchService','Session','spinnerService','growl','Logger','type', function ($scope, $modalInstance,$state,SearchService,Session,spinnerService,growl,Logger,type) {

	  var logger = Logger.getInstance('TransformContractController');

    $scope.type = type;
	  $scope.isCLO = function() {
      return ($scope.type == 'CLO');
    };
	  $scope.isTransform = function () {
      return ($scope.type == 'TRANSF');
    };
    $scope.isRenewal = function() {
      return ($scope.type == 'RENEWAL');
    };
	  $scope.contractNumber = null;
      $scope.company = null;
      $scope.cases = null;
      $scope.link = null;
      $scope.param = {contractTest :false};
      $scope.hasSupervisionRight = Session.getUserManager().hasSupervisionRight;

      $scope.checkContractNumber = function (contractForm) {
        if (contractForm.$valid) {
        	logger.debug('debug','checkContractToTransform : ' + $scope.contractNumber);
          SearchService.checkContractNumber($scope.contractNumber,$scope.type.toLowerCase())
            .then(function (data) {
              logger.debug('debug', 'Response from create case: {0}', [data.data]);
              $scope.company = data.data.company;
              $scope.cases = data.data.cases;
              $scope.type = data.data.businessType;
              if($scope.isTransform) {
            	  $scope.link = data.data.link;
              }
            })
            .finally(function () {
            });
        }
      };

      $scope.createTransformationCase = function (contractForm) {
        if (contractForm.$valid) {
          spinnerService.show('caseSpinner');
          growl.info('search.creating.case.msg');
          SearchService.transformContract($scope.contractNumber, $scope.param.contractTest)
            .then(function (data) {
                logger.debug('debug', 'Response from create case: {0}', [data.data]);
                $state.go('app.questionnaire', {caseId: data.data.caseId, scenarioId: data.data.scenarioId});
                $modalInstance.dismiss('cancel');
              },
              function (failure) {
                spinnerService.hide('caseSpinner');
              })
            .finally(function () {
            });
        }
      };

    $scope.createRenewalCase = function (contractForm) {
      if (contractForm.$valid) {
        spinnerService.show('caseSpinner');
        growl.info('search.creating.case.msg');
        SearchService.renewContract($scope.contractNumber, $scope.param.contractTest)
          .then(function (data) {
              logger.debug('debug', 'Response from create case: {0}', [data.data]);
              $state.go('app.questionnaire', {caseId: data.data.caseId, scenarioId: data.data.scenarioId});
              $modalInstance.dismiss('cancel');
            },
            function (failure) {
              spinnerService.hide('caseSpinner');
            })
          .finally(function () {
          });
      }
    };

      $scope.createCheckMigrationCase = function (contractForm) {

        if (contractForm.$valid) {

          spinnerService.show('caseSpinner');
          growl.info('search.check.contract.reference.msg');
          SearchService.createCheckMigrationCase($scope.contractNumber)
            .then(function (data) {
                logger.debug('debug', 'Response from create case: {0}', [data.data]);
                $state.go('app.questionnaire', {caseId: data.data.caseId, scenarioId: data.data.scenarioId});
                $modalInstance.dismiss('cancel');
              },
              function (failure) {
                spinnerService.hide('caseSpinner');
              })
            .finally(function () {
            });
        }
      };

      $scope.createCloCase = function (contractForm) {
          if (contractForm.$valid) {
        	spinnerService.show('caseSpinner');
            SearchService.createCloCase($scope.contractNumber)
            .then(function (data) {
                logger.debug('debug', 'Response from create case: {0}', [data.data]);
                $state.go('app.questionnaire', {caseId: data.data.caseId, scenarioId: data.data.scenarioId});
                $modalInstance.dismiss('cancel');
              },
              function (failure) {
                spinnerService.hide('caseSpinner');
              })
            .finally(function () {
            });
          }
        };

      $scope.cancel = function () {
        $scope.company = null;
        $scope.cases = null;
        $scope.link = null;
      };
      $scope.close = function () {
        $modalInstance.dismiss('cancel');
      };
  }]);

'use strict';

angular.module('autonomyApp.verticalMenu', [])
  .controller('VerticalMenuController', ['$scope', '$rootScope', '$state', '$modal', 'spinnerService', 'ScenarioService', 'localStorageService', 'DIVERS_EVENTS', 'VerticalMenuService', 'ScenarioDataService', 'REST_URLS', 'Session', 'Logger', 'growl','SalesDiscussionsDataService','$translate',
    function ($scope, $rootScope, $state, $modal, spinnerService, ScenarioService, localStorageService, DIVERS_EVENTS, VerticalMenuService, ScenarioDataService, REST_URLS, Session, Logger, growl,SalesDiscussionsDataService,$translate) {

      var logger = Logger.getInstance('VerticalMenuController');
//      $scope.bcContractRight = localStorageService.get('bcContractRight');
      

      $scope.ScenarioDataService = ScenarioDataService;

      $scope.getBccontractXmlInProgress = false;

      $scope.user = Session.getUserManager();
    //Defect985 : Evolution : Create a new Discussions zone common to all scenarios of a case
      $scope.SalesDiscussionsDataService =  SalesDiscussionsDataService;
      $scope.getBcContractXml = function () {
        if (!$scope.getBccontractXmlInProgress) {
          $scope.getBccontractXmlInProgress = true;
          VerticalMenuService.getBcContractXml().then(function () {
            $scope.getBccontractXmlInProgress = false;
          });
        }
      };

      $scope.save = function () {
        if (!ScenarioDataService.saveInProgress) {
          ScenarioDataService.saveInProgress = true;
          angular.element('main.main').scope().submitForm();
        } else {
          logger.debug('debug', 'save already in progress');
        }
      };

      $scope.scenarioSaveAs = function () {
        $scope.modalScenarioSaveAs = $modal.open({
          backdrop: 'static',
          animation: true,
          templateUrl: 'views/common/modalScenarioSaveAs.html',
          controller: function ($scope, $modalInstance) {

            $scope.scenario = {};
            $scope.saveAs = function (scenarioSaveAsForm) {

              if (scenarioSaveAsForm.$valid) {
            	  scenarioSaveAsForm.saveInProgress.$setValidity("saveInProgress", false);
                var policy = angular.element('main.main').scope().policy;
                var proposal = angular.element('main.main').scope().proposal;

                var objectDTO = {
                  policyDTO: null,
                  proposalDTO: null,
                  scenarioDTO: null
                };

                //The current page is policy
                if (angular.isDefined(policy)) {
                  objectDTO.policyDTO = policy;
                  objectDTO.policyDTO.scenarioName = $scope.scenario.scenarioName;
                  objectDTO.policyDTO.scenarioDescription = $scope.scenario.scenarioDescription;
                }
                //The current page is proposal
                else if (angular.isDefined(proposal)) {
                  objectDTO.proposalDTO = proposal;
                  objectDTO.proposalDTO.scenarioName = $scope.scenario.scenarioName;
                  objectDTO.proposalDTO.scenarioDescription = $scope.scenario.scenarioDescription;
                }
                //Other page
                else {
                  objectDTO.scenarioDTO = $scope.scenario;
                }

                ScenarioService.add(localStorageService.get('caseId'), localStorageService.get('scenarioId'), objectDTO).then(function (response) {

                  $rootScope.$broadcast(DIVERS_EVENTS.scenarioUpdated, response.data);

                  $modalInstance.dismiss('cancel');
                });
              }
            };

            $scope.close = function () {
            	$modalInstance.dismiss('cancel');
            };
          }
        });
      };

      $scope.markAsFavoriteInProgress = false;

      $scope.scenarioFavorite = function () {
        if (!$scope.markAsFavoriteInProgress) {
          $scope.markAsFavoriteInProgress = true;
          ScenarioService.markAsFavorite(localStorageService.get('scenarioId')).then(function (response) {
            $scope.ScenarioDataService.setCurrentScenarioAsFavorite();
            $scope.markAsFavoriteInProgress = false;
            /**
             * Defect #21: Interactions with SMART - Update Sales Funnel
             */
            if (Session.getPropertiesEnvironment().updateSmart) {
//              if ($scope.policy.smartCase) {
                SmartService.updateSmart().then(function (data) {
                  logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
                });
  //            }
            }
          });
        }
      };

    

      $scope.openTransformationReport = function () {
        spinnerService.show('loadingAppSpinner');

        angular.element('#site-wrapper').addClass('notPrintableArea');

        $scope.modalTransformationInstance = $modal.open({
          backdrop: 'static',
          animation: true,
          templateUrl: 'views/transformation/transformationModal.html',
          controller: 'TransformationController',
          resolve: {
            loadTransformationReport: function (TransformationService) {
              return TransformationService.loadReport();
            }
          },
          size: 'cube-width'
        });
        $scope.modalTransformationInstance.rendered.finally(function () {
          spinnerService.hide('loadingAppSpinner');
        });
      };
   // Defect #944: Service to list java fields names and content for Excel Export
      $scope.exportCase = function () {
        window.location.href = REST_URLS.CASE_EXPORT_URL.replace(':caseId', localStorageService.get('caseId')).replace(':scenarioId', localStorageService.get('scenarioId')).replace(':page', $state.current.name.substring(4));
      };
      
      
      $scope.exportBdocDataJson = function () {
          window.location.href = REST_URLS.BDOC_DATA_EXPORT_JSON_URL.replace(':scenarioId', localStorageService.get('scenarioId'));
       };

      $scope.saveVisible = function () {
        return (  !angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) &&
        null != $scope.ScenarioDataService.getBcContractRight() && !ScenarioDataService.getBcContractRight().transferToGCC && !ScenarioDataService.getBcContractRight().contractCancelled && !ScenarioService.isReadOnly && !$scope.ScenarioDataService.getBcContractRight().checkMigration && !$scope.ScenarioDataService.getBcContractRight().clo &&
        $state.current.name != 'app.buyerstudy' );
      };

      $scope.saveAsVisible = function () {
        return (  !angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) &&
        null != $scope.ScenarioDataService.getBcContractRight() && !ScenarioDataService.getBcContractRight().transferToGCC && !ScenarioDataService.getBcContractRight().contractCancelled && !$scope.ScenarioDataService.getBcContractRight().checkMigration && !$scope.ScenarioDataService.getBcContractRight().clo);
      };

      $scope.diagnosisVisible = function () {
        return (  !angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) &&
        null != $scope.ScenarioDataService.getBcContractRight() && !ScenarioDataService.getBcContractRight().transferToGCC && !ScenarioDataService.getBcContractRight().contractCancelled &&
        $scope.ScenarioDataService.getBcContractRight().newBusiness );
      };

      $scope.favouriteVisible = function () {
        return (  !angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) &&
        null != $scope.ScenarioDataService.getBcContractRight() && !ScenarioDataService.getBcContractRight().transferToGCC && !ScenarioDataService.getBcContractRight().contractCancelled && !$scope.ScenarioDataService.getBcContractRight().checkMigration && !$scope.ScenarioDataService.getBcContractRight().clo && !$scope.ScenarioDataService.isCurrentScenarioFavorite());
      };

      $scope.xmlVisible = function () {
        return (!angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) && null != $scope.ScenarioDataService.getBcContractRight() && $scope.ScenarioDataService.getBcContractRight().supervisor && ($scope.ScenarioDataService.getBcContractRight().newBusiness || $scope.ScenarioDataService.getBcContractRight().transform || $scope.ScenarioDataService.getBcContractRight().checkMigration) );
      };
      
      $scope.openDiscussionsVisible = function () {
          return true;
        };
      
      
    /*defect #944 : Service to list java fields names and content for Excel Export */
      $scope.exportBdocDataJsonVisible = function(){
    	  return  $scope.user.hasSupervisionRight;
    	  //return  true;
      }

      $scope.reportVisible = function () {
        return (!angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) && null != $scope.ScenarioDataService.getBcContractRight() && ($scope.ScenarioDataService.getBcContractRight().transform || $scope.ScenarioDataService.getBcContractRight().renewal));
      };

      $scope.saveInCubeVisible = function () {
        return (  $scope.user.hasSupervisionRight && !angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) && !ScenarioDataService.getBcContractRight().transferToGCC && !ScenarioDataService.getBcContractRight().contractCancelled &&
          null != $scope.ScenarioDataService.getBcContractRight() &&
          ($scope.ScenarioDataService.getBcContractRight().transform || $scope.ScenarioDataService.getBcContractRight().newBusiness)
        );
      };
      
      
      

      $scope.saveContractInCube = function () {
        if (!ScenarioDataService.saveInProgress) {
          ScenarioDataService.saveInProgress = true;
          growl.info('update.contract.process.msg');
          ScenarioService.saveContractInCube(localStorageService.get('scenarioId')).then(function (response) {
            ScenarioDataService.saveInProgress = false;
          }, function (error) {
            ScenarioDataService.saveInProgress = false;
          });
        } else {
          logger.debug('debug', 'save already in progress');
        }
      };
      
      $scope.openDiagnosis = function () {

          spinnerService.show('loadingAppSpinner');
          $scope.modalDiagnosisInstance = $modal.open({
            backdrop: 'static',
            animation: true,
            templateUrl: 'views/menu/diagnosisModal.html',
            controller: 'DiagnosisController',
            resolve: {
              loadDiagnosis: function (DiagnosisResource, localStorageService) {

                var diagnosisPromise = DiagnosisResource.get({caseId: localStorageService.get('caseId')});

                return diagnosisPromise.$promise;
              }
            }
          ,size: 'lg'
          });
          $scope.modalDiagnosisInstance.rendered.finally(function () {
            spinnerService.hide('loadingAppSpinner');
          });
        };
      
      /*Defect985:Evolution : Create a new Discussions zone common to all scenarios of a case - */
      $scope.openDiscussions = function () {

          spinnerService.show('loadingAppSpinner');
          $scope.modalSalesDiscussionInstance = $modal.open({
            backdrop: 'static',
            animation: true,
            templateUrl: 'views/menu/salesDiscussionsModal.html',
            controller: 'SalesDiscussionsController',
            resolve: {
              loadSalesDiscussions: function (SalesDiscussionsResource, localStorageService) {

                var salesDiscussionsPromise = SalesDiscussionsResource.get({caseId: localStorageService.get('caseId')});

                return salesDiscussionsPromise.$promise;
              }
            },
            size: 'lg'
          });
          $scope.modalSalesDiscussionInstance.rendered.finally(function () {
            spinnerService.hide('loadingAppSpinner');
          });
        };
        
        
        $scope.showPopoverGlobalMessage = function(){
    		
    			var msg = $translate.instant('vertical.menu.sales.discussions.btn',{p0:SalesDiscussionsDataService.getCommentsCount()}) ;
    		
    		return  msg;
    	};

    }]);



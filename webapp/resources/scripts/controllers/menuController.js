'use strict';

angular.module('autonomyApp.menuController', [])
.controller('MenuController', ['$scope', '$rootScope', '$state', 'Session', 'ScenarioService','ScenarioDataService', 'DIVERS_EVENTS', 'localStorageService', '$confirm', 'growl', 'PolicyResource', 
	'QuestionnaireResource','ProposalResource', 'FinalizationResource','Logger', '$modal','spinnerService','$translate','QuestionnaireService','$document', 'NomenclatureService','$sce',
	function ($scope, $rootScope, $state, Session, ScenarioService,ScenarioDataService, DIVERS_EVENTS, localStorageService, $confirm, growl, PolicyResource, 
	QuestionnaireResource,ProposalResource, FinalizationResource, Logger, $modal,spinnerService,$translate,QuestionnaireService,$document,NomenclatureService,$sce) {
	var logger = Logger.getInstance('MenuController');

	$scope.isoCountryCode = localStorageService.get('isoCountryCode');

	$scope.hasBackofficeRight = Session.getUserManager().hasBackofficeRight;

	$scope.ScenarioDataService = ScenarioDataService;

    $scope.scenarioFrozenReasons = NomenclatureService.getScenarioFrozenReasons($translate.use());

	$scope.$watchCollection('$state.current.name', function (newVal, oldVal) {
		$scope.pageName = newVal.split('.')[1];
	});

	$scope.gotoPage = function (page, event) {
		logger.debug('debug', 'START gotoPage : ' + page);
		if (page !== $state.current.name) {
			if(!ScenarioDataService.saveInProgress) {
				ScenarioDataService.saveInProgress = true;
				angular.element('main.main').scope().submitForm(event, page);
				if (page !== 'app.policy' || page !== 'app.proposal') {
					ScenarioDataService.setPricingObsolete(false);
				}
			} else {
				logger.debug('debug', 'Save in progress');
			}
		}
		logger.debug('debug', 'END gotoPage : ' + page);
	};

	$scope.isActive = function (menuState) {
		return (menuState === $state.current.name);
	};

	$scope.setCurrentScenario = function() {
		$scope.ScenarioDataService.updateCurrentScenario();
	};

	$scope.$on(DIVERS_EVENTS.scenarioUpdated, function (event, data) {
		$scope.ScenarioDataService.addScenarioToList(data);
		$scope.scenarioChange(data);
	});

	$scope.$on(DIVERS_EVENTS.scenarioCurrent, function (event,data) {
		$scope.setCurrentScenario();
	});

	// Defect #700: Ergonomic: Save data on Backspace keyboard
	$document.on('keydown', function(e){
        if(e.which === 8 && ( e.target.nodeName !== "INPUT" && e.target.nodeName !== "SELECT" && e.target.nodeName !== "TEXTAREA" ) ){
            e.preventDefault();
        }
    });

	var scenarioChange = function (caseId, scenarioId, currentPage) {
		growl.info('scenario.load.msg');

		if (currentPage === 'policy') {
			spinnerService.show('loadingDataSpinner');
			PolicyResource.get({
				caseId: localStorageService.get('caseId'),
				scenarioId: scenarioId
			}).$promise.then(function (data) {
				logger.debug('debug', 'Update Scenario Id to session {0}', [scenarioId]);
				data.changePolicy = true;
				if (data.scenarioPricingObsolete) {
					ScenarioDataService.setPricingObsolete(true);
				}
				else {
					ScenarioDataService.setPricingObsolete(false);
				}

				$rootScope.$broadcast(DIVERS_EVENTS.scenarioPolicyUpdated, data);
				$scope.updateCurrentScenario(scenarioId);
				ScenarioService.isReadOnly = $scope.ScenarioDataService.getCurrentScenario().validated;
			})
			.finally(function () {
				spinnerService.hide('loadingDataSpinner');
			});
		}
		else if (currentPage === 'proposal') {
			ProposalResource.get({
				caseId: localStorageService.get('caseId'),
				scenarioId: scenarioId
			}).$promise.then(function (data) {

				if (data.scenarioPricingObsolete) {
					ScenarioDataService.setPricingObsolete(true);
				}
				else {
					ScenarioDataService.setPricingObsolete(false);
				}

				$rootScope.$broadcast(DIVERS_EVENTS.scenarioProposalUpdated, data);
				$scope.updateCurrentScenario(scenarioId);
			});
		}
		else if (currentPage === 'questionnaire') {
			
			//Defect 984
			var newScenario = ScenarioDataService.findScenarioInList(scenarioId);
			
			QuestionnaireResource.get({
				caseId: localStorageService.get('caseId'),
				scenarioId: scenarioId
			}).$promise.then(function (data) {
				$rootScope.$broadcast(DIVERS_EVENTS.scenarioQuestionnaireUpdated, data);
			});
			
			//Defect 680 : no need to call the request quotation service if the user have the quotation right
			if (!QuestionnaireService.getPricingRight()) {
				QuestionnaireService.getRequestQuoteInfo(caseId, scenarioId).then(function (data) {
					$rootScope.$broadcast(DIVERS_EVENTS.requestQuotationChanged, data.data);
				});
			}
			$scope.updateCurrentScenario(scenarioId);
		}
		else if (currentPage === 'finalization') {
			FinalizationResource.get({				
				scenarioId: scenarioId
			}).$promise.then(function (data) {

				if (data.scenarioPricingObsolete) {
					ScenarioDataService.setPricingObsolete(true);
				}
				else {
					ScenarioDataService.setPricingObsolete(false);
				}

				$rootScope.$broadcast(DIVERS_EVENTS.scenarioFinalizationUpdated, data);
				$scope.updateCurrentScenario(scenarioId);
			});
		}
		
		//other page
		else {
			$scope.updateCurrentScenario(scenarioId);
		}
	};

	$scope.scenarioChange = function (scenario) {
		if (scenario.scenarioId == localStorageService.get('scenarioId')) {
			return;
		}

		logger.debug('debug', 'Load Scenario {0}', [JSON.stringify(scenario)]);

		var currentPage = $state.current.name.split('.')[1];
		
		if ((currentPage === 'policy' && angular.element('main.main').scope().policyForm.modified)
				|| (currentPage === 'proposal' && angular.element('main.main').scope().proposalForm.modified)
				|| (currentPage === 'finalization' && angular.element('main.main').scope().finalizationForm.modified)
		) {

			$confirm({
				text: 'scenario.load.data.modified.msg'
			}, {
				backdrop: 'static',
				templateUrl: 'views/common/modalConfirm.html'
			}).then(function () {
				scenarioChange(localStorageService.get('caseId'), scenario.scenarioId, currentPage);
			});
		}
		//Nothing modified from form
		else {
			scenarioChange(localStorageService.get('caseId'), scenario.scenarioId, currentPage);
		}
	};

	$scope.scenarioUpdate = function (scenario) {
		$scope.modalScenarioUpdate = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/common/modalScenarioUpdate.html',
			scope:$scope,
			controller: function ($scope, $modalInstance) {

				$scope.scenarioUpdate = {};

				$scope.scenarioUpdate = angular.copy(scenario);

				$scope.showState = function() {
					return !$scope.scenarioUpdate.favorite && localStorageService.get('scenarioId') != $scope.scenarioUpdate.scenarioId;
				};

				$scope.update = function (scenarioUpdateForm) {

					if (scenarioUpdateForm.$valid) {
						ScenarioService.update(scenario.scenarioId, $scope.scenarioUpdate).then(function (response) {

							angular.forEach($scope.ScenarioDataService.getScenarioList(), function (scenarioElement, key) {
								if ($scope.scenarioUpdate.scenarioId == scenarioElement.scenarioId) {
									scenarioElement.scenarioName =  $scope.scenarioUpdate.scenarioName;
									scenarioElement.scenarioDescription =  $scope.scenarioUpdate.scenarioDescription;
									scenarioElement.state =  $scope.scenarioUpdate.state;
									if (localStorageService.get('scenarioId') == $scope.scenarioUpdate.scenarioId) {
										$rootScope.$broadcast(DIVERS_EVENTS.scenarioCurrent);
									}
									return;
								}
							});

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

	$scope.updateCurrentScenario = function (scenarioId) {
		localStorageService.set('scenarioId', scenarioId);
		$rootScope.scenarioId = localStorageService.get('scenarioId');
		$scope.setCurrentScenario();
	};

	$scope.isCheckMigration = function () {
		return (!angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) && $scope.ScenarioDataService.getBcContractRight() != null && $scope.ScenarioDataService.getBcContractRight().checkMigration );
	};

	$scope.isCloCase = function () {
		return (!angular.isUndefined($scope.ScenarioDataService.getBcContractRight()) && $scope.ScenarioDataService.getBcContractRight() != null && $scope.ScenarioDataService.getBcContractRight().clo );
	};
	
	

	//$scope.setCurrentScenario();

	$scope.isCheckMigration();
	
	
	$scope.showPopoverScenario = function(scenario){
		var sepPattern  = scenario.scenarioDescription && scenario.createdByFullName ? "<BR>":"";
		var msg = scenario.scenarioDescription || "";
		if(scenario.createdByFullName){
			msg += sepPattern +$translate.instant('scenario.createdby.fullname.popover',{p0:scenario.createdByFullName}) ;
		}
		return  msg;
	};

	
	$scope.isCaseLocked = function () {
		return ScenarioDataService.getBcContractRight().transferToGCC ||  ScenarioDataService.getBcContractRight().contractCancelled ; 
	};

	$scope.getCaseLockedInfoMsg = function () {
		var msg = "";
		if($scope.isCaseLocked()){
			if (ScenarioDataService.getBcContractRight().transferToGCC){
				msg = "policy.quote.file.transferred.tooltip" ;
			}else if(ScenarioDataService.getBcContractRight().contractCancelled){
				msg = "case.locked.project.cancelled.info.over" ;
			}
		}
		return  $translate.instant(msg);
	}

}]);

'use strict';

angular.module('autonomyApp.finalization', ['ngResource'])
.controller('FinalizationController', ['$translate', '$scope','$rootScope', '$state', 'Session', 'FinalizationResource',
	'localStorageService', 'Logger', 'growl', 'loadFinalization', '$modal', 'FinalizationService', 'ScenarioService', 
	'$confirm', 'spinnerService', 'ScenarioDataService', '$filter','NomenclatureService','DIVERS_EVENTS','SmartService','ProposalService','REST_URLS','SalesDiscussionsDataService',
	function ($translate, $scope, $rootScope, $state, Session, FinalizationResource, 
			localStorageService, Logger, growl, loadFinalization, $modal, FinalizationService, ScenarioService,
			$confirm, spinnerService, ScenarioDataService, $filter,NomenclatureService,DIVERS_EVENTS,SmartService,ProposalService,REST_URLS,SalesDiscussionsDataService) {

	var logger = Logger.getInstance('FinalizationController');

	logger.debug('Get finalization for caseId : ' + localStorageService.get('caseId'));

	$scope.finalization = loadFinalization;

	$scope.ScenarioDataService = ScenarioDataService;

	$scope.user = Session.getUserManager();

	$scope.availableLanguages = [];

	$scope.availableLanguages = $scope.finalization.proposal.contractEditionLanguages;

	$scope.civilities = NomenclatureService.getCivilities($translate.use());

	$scope.contractButtonDisabledTooltip = {message: ''};

	$rootScope.$on('$translateChangeSuccess', function () {
		$scope.civilities = NomenclatureService.getCivilities($translate.use());
	});

	$scope.isWordGenerationRequest = false;
	
	// Defect985 : Evolution : Create a new Discussions zone common to all
	// scenarios of a case -
	SalesDiscussionsDataService.setCommentsCount( $scope.finalization.salesDiscussionsCount)

	/*
	 * Action "Get Role Reference Id" - open contractFollowupView to get the
	 * selected Role Reference Id
	 */
	$scope.getRoleReferenceId = function () {

		logger.debug('debug', 'Call open contractFollowupView function');

		$scope.modalContractFollowupViewInstance = $modal.open({

			backdrop: 'static',

			animation: true,

			templateUrl: 'views/finalization/contractFollowupViewModal.html',

			scope: $scope,

			controller: function ($scope, $sce, $modalInstance, spinnerService) {

				var contractFollowupViewUrl = Session.getPropertiesEnvironment().searchContractFollowupViewUrl;

				var firstTime = true;

				// defect #624 : Define correctly the organization provided to
				// CUBE in the different services
				$scope.contractFollowupViewUrl = $sce.trustAsResourceUrl(contractFollowupViewUrl.replace('{0}', $scope.finalization.easyNumber).replace('{1}', ScenarioDataService.getBcContractRight().entityOrganizationId).replace('%7B1%7D', localStorageService.get('caseId')));

				$scope.stopSpinner = function () {

					if (firstTime) {

						spinnerService.hide('contractFollowupViewModalSpinner');

						angular.element('#contractFollowupViewModal').click();

						firstTime = false;

					}

				};

				$scope.close = function () {

					$modalInstance.dismiss('cancel');

				};
			},
			size: 'cube-width'
		});
	};

	$scope.showRoleRefId = function (roleReferenceId, companyName) {
		$scope.finalization.roleReferenceId = roleReferenceId;
		$scope.finalization.companyName = companyName;
		$scope.modalContractFollowupViewInstance.close();
	};

	$scope.updateTransferToGCC = function () {
        $scope.modalUpdateTransferToGCC = $modal.open({
          backdrop: 'static',
          animation: true,
          scope: $scope,
          templateUrl: 'views/common/modalFinalizationTransferGCC.html',
          controller: function ($scope, $modalInstance) {
            $scope.accepted = function () {
              spinnerService.show('loadingDataSpinner');
              growl.info('finalization.transfer.to.gcc.msg');
              FinalizationService.tranferToGCC(localStorageService.get('scenarioId')).then(function () {
                $scope.finalization.transferToGCC = true;
                $scope.finalization.transfertDate = $filter('date')(new Date(), Session.getPropertiesEnvironment().dateFormat);
                $scope.finalization.transfertDoneBy = Session.getUserManager().fullName;
                $scope.finalization.transfertToGCCXmlAvailable = true;
                // Defect #812: Hightlight locked scenarios and cases
                ScenarioDataService.getBcContractRight().transferToGCC = true;
                
                $scope.finalization.isReadOnly = true;
                
                ScenarioDataService.reloadScenarioList();
                //
                $modalInstance.dismiss('cancel');
              }, function () {
                $scope.finalization.transferToGCC = false;
                $modalInstance.dismiss('cancel');
              })
                .finally(function () {
                  spinnerService.hide('loadingDataSpinner');
                });
            };
            $scope.canceled = function () {
              $scope.finalization.transferToGCC = false;
              $modalInstance.dismiss('cancel');
            };
          }
        });
      };

	$scope.submitForm = function (event, page) {
		if (event) {
			event.preventDefault();
		}		

		if ($scope.finalizationForm.$dirty) {
			/*
			 * Save the form
			 */
			logger.debug('debug', 'Save the finalization : {0}', [JSON.stringify($scope.finalization)]);
			growl.info('finalization.saving.msg');

			FinalizationResource.update({
				scenarioId: localStorageService.get('scenarioId')
			},
			$scope.finalization).$promise.then(function () {

				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.finalization.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
						SmartService.updateSmart().then(function(data){
							logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
						});
					}
				}

				gotoPageProcess(page);
			}, updateError);

		} else {
			gotoPageProcess(page);
		}
	};

	var gotoPageProcess = function (page) {
		ScenarioDataService.saveInProgress = false;
		if (angular.isDefined(page)) {
			if (page === 'app') {
				$state.go(page, {}, {reload: true});
			}
			else {
				$state.go(page, {
					caseId: localStorageService.get('caseId'),
					scenarioId: localStorageService.get('scenarioId')
				});
			}
		}
		else {
			$scope.finalizationForm.$setPristine();
		}
	};

	/**
	 * Show the input error
	 * 
	 * @param error
	 */
	var updateError = function (error) {
		ScenarioDataService.saveInProgress = false;
		if (error.data.messages.length > 0) {
			angular.forEach(error.data.messages, function (errorField, index) {
				if (angular.isObject($scope.finalizationForm[errorField.field])) {
					$scope.finalizationForm[errorField.field].$setValidity(errorField.errorType, false);
				}
			});
		}
	};

	// Defect #823: Keep XML flow to BC Contract on transfert to GCC
	$scope.getTransfertToGCCXml = function () {
		FinalizationService.getTransfertToGCCXml();
	};
	//

	/**
	 * Function is called when user change a scenario
	 */
	$scope.$on(DIVERS_EVENTS.scenarioFinalizationUpdated, function (event, data) {
		$scope.finalization = data;
		
		// For a word generation request, user must give the reason. Defect #760
		// :
		// Audit trail Manual Editions in Word
		if ($scope.finalization.proposal.nbContractDownloaded > 0 && !$scope.finalization.proposal.contractWordGenerationBy 
				&& $scope.finalization.proposal.contractDocType && $scope.finalization.proposal.contractDocType === 'PDF'
					&& !$scope.finalization.proposal.contractWordGenerationReason) {
			$scope.isWordGenerationRequest = true;
		}
		else {
			$scope.isWordGenerationRequest = false;
		}
		$scope.finalizationForm.$setPristine();
	});


	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};

	$scope.adjustFirstInsPeriodTo = function () {
		var newEndDate = angular.copy($scope.finalization.firstInsPeriodFrom);
		newEndDate.setFullYear(newEndDate.getFullYear() + 1);
		$scope.finalization.firstInsPeriodTo = newEndDate-1;// defect1064:Duration period_Ending Date
	};

	$scope.format = 'dd.MM.yyyy';

	$scope.statusDate = {
			firstInsPeriodFromOpened: false,
			firstInsPeriodToOpened: false
	};

	$scope.openFirstInsPeriodFrom = function () {
		$scope.statusDate.firstInsPeriodFromOpened = true;
	};

	$scope.openFirstInsPeriodTo = function () {
		$scope.statusDate.firstInsPeriodToOpened = true;
	};

	$scope.isGenerateContractDisable = function () {
		if ($scope.finalization.smartCase && !$scope.finalization.smartCofalinkStatus) {
			$scope.contractButtonDisabledTooltip.message = "proposal.cofalink.status.tooltip";
			return true;
		}

		if (!$scope.user.hasContractEditionRight && $scope.finalization.proposal.requestContractEditionTaskId != null) {
			if ($scope.finalization.proposal.nbContractDownloaded > 0) {
				$scope.contractButtonDisabledTooltip.message = "proposal.request.contract.edition.completed.tooltip";
			} else {
				$scope.contractButtonDisabledTooltip.message = "proposal.request.contract.edition.in.progress.tooltip";
			}

			return true;
		}
		/*
		 * Defect977:Manage as a single Quotation Task in case of Duplicate
		 * Scenario
		 */
		/*
		 * if ($scope.proposal.nbContractDownloaded > 0 &&
		 * !($scope.user.hasGenerateWordDocumentRight &&
		 * $scope.user.hasContractEditionRight)) {
		 * $scope.contractButtonDisabledTooltip.message =
		 * "proposal.document.generated.tooltip"; return true; }
		 */		

		return ProposalService.isGenerateDocDisable($scope.finalization.proposal,$scope.contractButtonDisabledTooltip,$scope.finalizationForm);
	};

	$scope.createContract = function () {

		// For a word generation request, user must give the reason. Defect #760
		// :
		// Audit trail Manual Editions in Word
		if ($scope.finalization.proposal.nbContractDownloaded > 0 && !$scope.finalization.proposal.contractWordGenerationBy 
				&& $scope.finalization.proposal.contractDocType && $scope.finalization.proposal.contractDocType === 'PDF'
					&& !$scope.finalization.proposal.contractWordGenerationReason) {
			$scope.isWordGenerationRequest = true;
		}
		else {
			spinnerService.show('contractGenerationDocumentSpinner');

			$scope.finalization.proposal.editionCodeLang = $scope.finalization.proposal.contractEditionCodeLang;

			ProposalService.createContract($scope.finalization)
			.then(function () {

				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.finalization.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
						SmartService.updateSmart().then(function(data){
							logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
						});
					}
				}

				$scope.close();
			})
			.finally(function () {
				spinnerService.hide('contractGenerationDocumentSpinner');
			});
		}

	};

	$scope.getContract = function () {
		ProposalService.getContract($scope.finalization.proposal);
	};

	$scope.requestContractEditionProcess = function () {
		$scope.modalRequestContractEdition = $modal.open({
			backdrop: 'static',
			animation: true,
			scope: $scope,
			templateUrl: 'views/finalization/modalRequestContractEdition.html',
			controller: function ($scope, $modalInstance, ProposalService,DateService) {
				$scope.requestContractEdition = {};
				var defaultDelay = Session.getPropertiesEnvironment().defaultTaskDelayDays;
				$scope.taskPriorityThreshold = Session.getPropertiesEnvironment().taskPriorityThreshold;
				$scope.requestInProgress = false;
				$scope.requestContractEdition.comment = "";
				$scope.requestContractEdition.completionDueDate = DateService.addDaysToCurrentDate(defaultDelay,true);
				$scope.requestCompletionDueDays = defaultDelay;
				$scope.format = 'dd.MM.yyyy';
				$scope.statusDate = {
					 requestDateOpened: false
				};
				
				$scope.dateOptions = {
				          formatYear: 'yy',
				          startingDay: 1,
				      
				};
				
				/*
				 * Configure days to be disabled from calendar
				 * @return boolean : true if date disabled
				 */
				 $scope.disabled = function(date, mode) {
					 	var minDate = new Date();
					 	minDate.setHours(0, 0, 0, 0);
					    return date < minDate || ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
				 };
				
				 $scope.openRequestDateCalendar = function () {
			          $scope.statusDate.requestDateOpened = true;
			     };
			     
			     $scope.computeRequestCompletionDueDays = function (){
			    	 $scope.requestCompletionDueDays = DateService.computeDiffDays(new Date(),(angular.copy($scope.requestContractEdition.completionDueDate)),true);
			     }

				$scope.submit = function (requestContractEditionForm) {

					if (requestContractEditionForm.$valid) {
						

						ProposalService.requestContractEdition($scope.requestContractEdition).then(function (response) {
							$scope.finalization.proposal.requestContractEditionTaskId = response.data;
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

	$scope.contractDocVisible = function () {
		return $scope.finalization.proposal.contractDocType == 'PDF' || $scope.finalization.proposal.accessContractWordDocument || $scope.finalization.proposal.contractDocType == $scope.finalization.proposal.contractDoc.format;
	};

	$scope.getProductXml = function () {
		ProposalService.getProductXml();
	};

	$scope.getQuestionnaireExcelFile = function () {
		window.location.href = REST_URLS.PROPOSAL_NBI_QUESTIONNAIRE_EXCEL_FILE_URL.replace(':scenarioId', localStorageService.get('scenarioId'));
	};
	
	
	$scope.cancelProject = function () {
		$scope.finalization.cancellationProjectReason = null;
		$scope.modalCancelProject = $modal.open({
			backdrop: 'static',
			animation: true,
			scope: $scope,
			templateUrl: 'views/finalization/modalCancelProject.html',
			controller: function ($scope, $modalInstance, FinalizationService,spinnerService) {

				$scope.requestContractEdition = {};

				$scope.submit = function (cancelProjectyForm) {

					if (cancelProjectyForm.$valid) {
						 spinnerService.show('cancelProjetSpinner');
						FinalizationService.cancelProject($scope.finalization.cancellationProjectReason).then(function (response) {
							angular.extend($scope.finalization,response.data);
							 ScenarioDataService.getBcContractRight().contractCancelled = true;							 
							 $scope.finalization.isReadOnly = true;
							 ScenarioDataService.reloadScenarioList();
							$modalInstance.dismiss('cancel');
						}).finally(function () {
							spinnerService.hide('cancelProjetSpinner');
						});;
					}
				};

				$scope.close = function () {
					$scope.finalization.cancellationProjectReason = null;
					$modalInstance.dismiss('cancel');
				};
			}
		});
	};
	
	
	$scope.isTrasfertGccDisabed = function () {
		return $scope.finalization.proposal.nbContractDownloaded === 0 || !$scope.finalization.hasContractId || !ScenarioDataService.getCurrentScenario().favorite || $scope.finalization.contractCancelled ; 
	};

	$scope.getTransfertGccDisabledinfoMsg = function () {
		
		var msg = "";
		if($scope.isTrasfertGccDisabed()){
			if ($scope.finalization.contractCancelled){
				msg = "finalization.transfer.gcc.button.disabled.contract.cancelled.tooltip" ;
			}else if(!$scope.finalization.hasContractId){
				msg = "'finalization.transfer.gcc.button.disabled.contractId.empty.tooltip" ;
			}else if (!ScenarioDataService.isCurrentScenarioFavorite()){
				msg = "finalization.transfer.gcc.button.disabled.not.favorite.tooltip" ;
			}else if ($scope.finalization.proposal.nbContractDownloaded === 0){
				msg = "finalization.transfer.gcc.button.disabled.contract.not.generated.tooltip" ;
			}
		}
		return  $translate.instant(msg);
	};
	
	$scope.isCancelProjectDisabed = function () {
		return $scope.finalization.smartCase || !ScenarioDataService.isCurrentScenarioFavorite() || $scope.finalization.contractCancelled || $scope.finalization.transferToGCC ; 
	};
	
	
	$scope.getCancelProjectDisabledinfoMsg = function () {
		var msg = "";
		if($scope.isCancelProjectDisabed()){
			if ($scope.finalization.contractCancelled){
				msg = "finalization.contract.status.follow.up.cancel.already.cancelled.info.over" ;
			}else if($scope.finalization.smartCase){
				msg = "finalization.contract.status.follow.up.cancel.smart.info.over" ;
			}else if (!ScenarioDataService.isCurrentScenarioFavorite()){
				msg = "finalization.contract.status.follow.up.cancel.not.favorit.scenario.info.over" ;
			}else if($scope.finalization.transferToGCC){
				msg = "finalization.contract.status.follow.up.cancel.already.transfeed.gcc.info.over" ;
			}
		}
		return  $translate.instant(msg);
	};
	
	$scope.getProjectOrigin = function () {
		var  msg = $scope.finalization.smartCase ? 'finalization.contract.status.follow.up.origin.smart' : 'finalization.contract.status.follow.up.origin.autonomy';
		return $translate.instant(msg);
	};

	
}]);

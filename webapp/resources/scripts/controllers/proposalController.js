'use strict';

angular.module('autonomyApp.proposal', ['ngResource'])
.controller('ProposalController', ['$scope', '$rootScope', 'ProposalResource', 'ProposalService', 'loadProposal', 'localStorageService', 'Logger', 'growl', '$state', 'DIVERS_EVENTS', 'ScenarioService', 'Session', '$filter', 'spinnerService', '$confirm', 'ScenarioDataService', '$modal', '$translate', 'REST_URLS', 'SmartService',
	'$location','SalesDiscussionsDataService',function ($scope, $rootScope, ProposalResource, ProposalService, loadProposal, localStorageService, Logger, growl, $state, DIVERS_EVENTS, ScenarioService, Session, $filter, spinnerService, $confirm, ScenarioDataService, $modal, $translate, REST_URLS, SmartService,$location,SalesDiscussionsDataService) {
	var logger = Logger.getInstance('ProposalController');

	logger.debug('Get proposal for caseId : ' + localStorageService.get('caseId'));

	$scope.proposal = loadProposal;

	ScenarioService.isReadOnly = false;

	$scope.user = Session.getUserManager();

	// DEFECT #106
	$scope.derogationVerifiedDate = $scope.proposal.derogationVerifiedDate;
	$scope.derogationVerifiedBy = $scope.proposal.derogationVerifiedBy;

	if ($scope.derogationVerifiedDate == null) {
		$scope.derogationVerifiedDate = $filter('date')(new Date(), Session.getPropertiesEnvironment().dateFormat);
	}

	if ($scope.derogationVerifiedBy == null) {
		$scope.derogationVerifiedBy = $scope.user.lastName + ' ' + $scope.user.firstName;
	}

	if ($scope.proposal.scenarioPricingObsolete) {
		ScenarioDataService.setPricingObsolete(true);

	}
	
	//Defect985 : Evolution : Create a new Discussions zone common to all scenarios of a case -
	SalesDiscussionsDataService.setCommentsCount( $scope.proposal.salesDiscussionsCount);

	$scope.createNBIProposal = function () {

		// Defect #760 : Audit trail Manual Editions in Word
		if ($scope.proposal.nbiEditionLanguages.length > 1 || ($scope.proposal.nbNBIDownloaded > 0 && $scope.proposal.nbiDocType === 'PDF')) {
			$scope.modalGenerationDocumentValidation = $modal.open({
				backdrop: 'static',
				animation: true,
				templateUrl: 'views/proposal/modalGenerationDocumentValidation.html',
				controller: 'GenerationDocumentValidationController',
				resolve: {
					proposal: function () {
						return $scope.proposal;
					},
					documentType: function () {
						return 'NBI';
					}
				}
			});
		} else {
			$scope.proposal.editionCodeLang = 'en';
			if ($scope.proposal.nbiEditionLanguages.length == 1) {
				$scope.proposal.editionCodeLang = $scope.proposal.nbiEditionLanguages[0].isoCode;
			}
			spinnerService.show('loadingDataSpinner');
			ProposalService.createNBIProposal($scope.proposal).then(function () {

				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.proposal.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
						SmartService.updateSmart().then(function(data){
							logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
						});
					}
				}
			})
			.finally(function () {
				spinnerService.hide('loadingDataSpinner');
			});
		}
	};

	$scope.getNBIProposal = function () {
		ProposalService.getNBIProposal($scope.proposal);
	};

	$scope.createBUYERSTUDYProposal = function () {
		if ($scope.proposal.buyerStudyEditionLanguages.length > 1) {
			$scope.modalGenerationDocumentValidation = $modal.open({
				backdrop: 'static',
				animation: true,
				templateUrl: 'views/proposal/modalGenerationDocumentValidation.html',
				controller: 'GenerationDocumentValidationController',
				resolve: {
					proposal: function () {
						return $scope.proposal;
					},
					documentType: function () {
						return 'BUYERSTUDY';
					}
				}
			});
		} else {
			$scope.proposal.editionCodeLang = 'en';
			if ($scope.proposal.buyerStudyEditionLanguages.length == 1) {
				$scope.proposal.editionCodeLang = $scope.proposal.buyerStudyEditionLanguages[0].isoCode;
			}

			spinnerService.show('loadingDataSpinner');
			ProposalService.createBUYERSTUDYProposal($scope.proposal)
			.finally(function () {
				spinnerService.hide('loadingDataSpinner');
			});
		}
	};

	$scope.getBUYERSTUDYProposal = function () {
		ProposalService.getBUYERSTUDYProposal($scope.proposal.buyerStudyDoc);
	};

	$scope.getProductXml = function () {
		ProposalService.getProductXml();
	};

	$scope.validateDerogationProcess = function () {
		spinnerService.show('loadingDataSpinner');

		ProposalService.validateDerogationProcess($scope.proposal)
		.then(function (data) {
			$scope.proposal.derogationProcessApplied = true;
		})
		.finally(function () {
			spinnerService.hide('loadingDataSpinner');
		});
	};

	$scope.submitForm = function (event, page) {

		if (event) {
			event.preventDefault();
		}
		if ($scope.proposalForm.$invalid) {
			$confirm(
					{title: 'form.invalid.title', text: 'form.invalid.text', okBtnLabel: 'ok.label'},
					{templateUrl: 'views/common/modalMessage.html'}
			);
			ScenarioDataService.saveInProgress = false;
		}
		else if ($scope.proposalForm.$dirty) {
			/*
			 * Save the form
			 */
			logger.debug('debug', 'Save the proposal');
			growl.info('proposal.saving.msg');

			ProposalResource.update({scenarioId: ''}, $scope.proposal).$promise.then(function () {

				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.proposal.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
						SmartService.updateSmart().then(function(data){
							logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
						});
					}
				}

				gotoPageProcess(page);
			}, updateError);
		}
		else {
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
			$scope.proposalForm.$setPristine();
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
				if (angular.isObject($scope.proposalForm[errorField.field])) {
					$scope.proposalForm[errorField.field].$setValidity(errorField.errorType, false);
				}
			});
		}
	};

	$scope.validateInitialScenario = function () {
		spinnerService.show('loadingDataSpinner');

		ProposalService.validateInitialScenario()
		.then(function (response) {
			$scope.proposal.nbDerogationAccepted = $scope.proposal.nbDerogationAccepted + $scope.proposal.nbDerogationPending;
			$scope.proposal.nbDerogationPending = 0;
			$scope.proposal.checkValidationActive = false;
			$scope.proposal.derogationPending = false;
			ScenarioDataService.getScenarioList()[0].frozenReason = 'SCN_VALID';
		})
		.finally(function () {
			spinnerService.hide('loadingDataSpinner');
		});
	};

	/**
	 * Function is called when user change a scenario
	 */
	$scope.$on(DIVERS_EVENTS.scenarioProposalUpdated, function (event, data) {
		$scope.proposal = data;
		$scope.productXmlEnable = (($scope.proposal.nbContractDownloaded != null && $scope.proposal.nbContractDownloaded > 0)
				|| ($scope.proposal.nbNBIDownloaded != null && $scope.proposal.nbNBIDownloaded > 0));

		$scope.proposalForm.$setPristine();
	});

	// defect #259 : Migration Problème bouton Edition Scenario initial

	$scope.buyerStudyButtonDisabledTooltip = {message: ''};
	$scope.nbiButtonDisabledTooltip = {message: ''};

	$scope.isGenerateNBIDisable = function () {
		if ($scope.proposal.smartCase && !$scope.proposal.smartCofalinkStatus) {
			$scope.nbiButtonDisabledTooltip.message = "proposal.cofalink.status.tooltip";
			return true;
		}
		if (!$scope.user.hasGenerateWordDocumentRight && $scope.proposal.nbNBIDownloaded > 0) {
			$scope.nbiButtonDisabledTooltip.message = "proposal.document.generated.tooltip";
			return true;
		}

		// defect #561 : FR Feedback: Contact Info mandatory for Edition
		if ($scope.proposal.contactInformationEmpty) {
			$scope.nbiButtonDisabledTooltip.message = "questionnaire.contact.information.required.error";
			return true;
		}

		return ProposalService.isGenerateDocDisable($scope.proposal,$scope.nbiButtonDisabledTooltip);
	};

	$scope.requestValidationProcess = function () {
		$scope.modalRequestValidation = $modal.open({
			backdrop: 'static',
			animation: true,
			scope: $scope,
			templateUrl: 'views/proposal/modalRequestValidation.html',
			controller: function ($scope, $modalInstance, ProposalService) {

				$scope.requestValidation = {};
				$scope.clicked = false;
				$scope.submit = function (requestValidationForm) {

					if (requestValidationForm.$valid) {

						// @defect:886@date:11-12-2017@author:szi
						var comment = $scope.requestValidation.comment;
						if($scope.proposal.derogationWorkflow.validateButton18NValue == "proposal.derogation.process.button.validation.certify.label"){
							comment = $translate.instant("proposal.derogation.process.button.validation.certify.label")+ ".\n" +  comment;
						};

						$scope.clicked = true;
						ProposalService.requestValidation(comment, false).then(function (response) {
							$scope.proposal.derogationWorkflow = response.data;
							if (response.data.derogationSummary) {
								$scope.proposal.derogationSummary = response.data.derogationSummary;
							}
							// Defect #812: Hightlight locked scenarios and cases
							if ($scope.proposal.derogationWorkflow.derogationWorkflowFinished) {
								ScenarioDataService.getCurrentScenario().frozenReason = 'DRG_WKF_FINISH';
							}
							//

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

	$scope.requestStopProcess = function () {
		$scope.modalRequestValidation = $modal.open({
			backdrop: 'static',
			animation: true,
			scope: $scope,
			templateUrl: 'views/proposal/modalRequestValidation.html',
			controller: function ($scope, $modalInstance, ProposalService) {

				$scope.requestValidation = {};

				$scope.submit = function (requestValidationForm) {

					if (requestValidationForm.$valid) {

						ProposalService.requestValidation($scope.requestValidation.comment, true).then(function (response) {
							$scope.proposal.derogationWorkflow = response.data;

							// Defect #812: Hightlight locked scenarios and cases
							if ($scope.proposal.derogationWorkflow.derogationWorkflowStopped) {
								ScenarioDataService.getCurrentScenario().frozenReason = 'DRG_WKF_STOP';
							}
							//
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

	// defect #616 : FR feedback: Create a specific right to generate
	// documents in Word format
	$scope.nbiDocVisible = function () {
		return $scope.proposal.nbiDocType == 'PDF' || $scope.proposal.accessNBIWordDocument || $scope.proposal.nbiDocType == $scope.proposal.nbiDoc.format;
	};     

	$scope.getQuestionnaireExcelFile = function () {
		window.location.href = REST_URLS.PROPOSAL_NBI_QUESTIONNAIRE_EXCEL_FILE_URL.replace(':scenarioId', localStorageService.get('scenarioId'));
	};

	/**
	 * Open the discussion modal that allows user to create a comment and
	 * submit in database. A result will send back and show in the end of
	 * discussions list.
	 * 
	 * Defect #743 - Derogation Management - add Discussion Flow
	 */
	$scope.addDiscussion = function (parentDiscussion) {
		$scope.modalDiscussion = $modal.open({
			backdrop: 'static',
			animation: true,
			scope: $scope,
			templateUrl: 'views/proposal/modalDiscussion.html',
			controller: function ($scope, $modalInstance, ProposalService) {

				$scope.discussion = {};
				$scope.clicked = false;

				// defect #958 : Add the ability to select the user receiving the
				// comment in the Discussion flow
				$scope.discussion.sendToId = parentDiscussion != null ? parentDiscussion.discussionById : null ;
				$scope.discussion.isReply = parentDiscussion != null? true:false;

				$scope.eligibleUsersToReceiveComments =  ProposalService.getEligibleUsersToReceiveComments($scope.proposal,$scope.user.accountId);
				$scope.submit = function (discussionForm) {
					if (discussionForm.$valid) {
						$scope.clicked = true;
						ProposalService.addDiscussion($scope.discussion.comment,$scope.discussion.sendToId,parentDiscussion?parentDiscussion.id:null,$location).then(function (response) {
							$scope.proposal.discussions = response.data;
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

}]);

'use strict';

angular.module('autonomyApp.questionnaire', ['ngResource'])
.controller('QuestionnaireController', ['$translate', '$scope', '$rootScope', '$resource', '$state', 'Session','QuestionnaireResource', 'localStorageService', 'AuthService',
	'Logger', 'AUTH_EVENTS', 'loadQuestionnaire', '$confirm', 'spinnerService', 'growl', 'DIVERS_EVENTS', '$modal', 'NomenclatureService','ScenarioService','ScenarioDataService','QuestionnaireService','$sce','SmartService','$filter','SalesDiscussionsDataService',
	'DateService',function ($translate, $scope, $rootScope, $resource, $state, Session, QuestionnaireResource, localStorageService, AuthService,
			Logger, AUTH_EVENTS, loadQuestionnaire, $confirm, spinnerService, growl, DIVERS_EVENTS, $modal, NomenclatureService,ScenarioService,ScenarioDataService,QuestionnaireService,$sce,SmartService,$filter,SalesDiscussionsDataService,DateService) {
	var logger = Logger.getInstance('QuestionnaireController');

	logger.debug('debug', 'Get Questionnaire for caseId : ' + $scope.caseId);

	$scope.questionnaire = loadQuestionnaire;
	
	//Defect 977 : Manage as a single Quotation Task in case of Duplicate Scenario => need to reload scenarios information to manage request quotation button state 
	ScenarioDataService.reloadScenarioList();

	// Defect 680
	QuestionnaireService.setPricingRight($scope.questionnaire.pricingRight);

	$scope.maxNumberBuyers = Session.getPropertiesEnvironment().questionnaireMaxNumberBuyers - 1;
	
	//Defect985 : Evolution : Create a new Discussions zone common to all scenarios of a case -
	SalesDiscussionsDataService.setCommentsCount($scope.questionnaire.salesDiscussionsCount);

	// Defect 910 Work around Loss history Management
	var today = new Date();
	var currentMonth = today.getMonth();
	$scope.today = today;
	
	$scope.init = function() {
		
		if($scope.questionnaire.specificQuestionnaire.referenceYearBadDebts == null){
			$scope.questionnaire.specificQuestionnaire.referenceYearBadDebts  =  today.getFullYear()-1 ; 
		}
		
		if($scope.questionnaire.specificQuestionnaire.referenceYearBadDebts !=  $scope.newReferenceYearBadDebts){
			$scope.isReferenceYearBadDebtsChanged = true;
			if(!$scope.questionnaire.specificQuestionnaire.badDebtsExperience){
				$scope.badDebtsExperienceChangeRefYear = true;
				$scope.questionnaire.specificQuestionnaire.referenceYearBadDebts =  $scope.newReferenceYearBadDebts;
			}
		}else{
			$scope.isReferenceYearBadDebtsChanged = false;
		}
		
		$scope.yearsList = [$scope.questionnaire.specificQuestionnaire.referenceYearBadDebts,$scope.questionnaire.specificQuestionnaire.referenceYearBadDebts-1,$scope.questionnaire.specificQuestionnaire.referenceYearBadDebts-2,$scope.questionnaire.specificQuestionnaire.referenceYearBadDebts-3];
		
		/*
		 * Defect788:FR feedback - Questionnaire / Debtors Outstanding Breakdown :
		 * additional columns variable used to control visibility of
		 * numberDebtorsExport and numberDebtorsDomestic columns
		 */
		$scope.showDebtorsDetails = $scope.checkDebtorsExportValueExist();
		
		$scope.countries = [];
		
		$scope.initCountriesList();
		
		$scope.nacesCodeByActivitySector = naceCodes();
		
		$scope.computeInsurableTurnovers();
	}
	
	
	$scope.badDebtsExperienceChangeRefYear = false;
	
	if(currentMonth > NomenclatureService.getBadDebtsYearThreshold()){
		$scope.newReferenceYearBadDebts = today.getFullYear();
	}else{
		$scope.newReferenceYearBadDebts = today.getFullYear()- 1;
	}
	
	
	$scope.globalTurnover = 0;
	$scope.exportTurnover = null;
	$scope.showReportExportTurnover = false;

	$scope.additionalInformationAccordionOpened = false;

	$scope.ScenarioDataService = ScenarioDataService;

	$scope.$watch('additionalInformationAccordionOpened', function (isOpen) {
		if (isOpen && !$scope.questionnaire.pricingRight) {
			$scope.checkQuestionnaireFieldsMandatory();
		}
	});
	
	
	/*
	 * Defect788:FR feedback - Questionnaire / Debtors Outstanding Breakdown :
	 * additional columns
	 * 
	 * compute number of domestic debetors domestic from number of total Debtors
	 * and number of export Debtors
	 */
	$scope.numberDebtorsDomesticCompute = function(numberDebtors,numberDebtorsExport){
		var rst = "";
		if(numberDebtorsExport || numberDebtorsExport === 0 ){
			rst =  (numberDebtors - numberDebtorsExport);
		}
		return rst;
	}
	
	
	/*
	 * Defect788:FR feedback - Questionnaire / Debtors Outstanding Breakdown :
	 * additional columns
	 * 
	 * check id at least there is debtorOutstanding item(record) that contain
	 * numberDebtorsExport value
	 */
	$scope.checkDebtorsExportValueExist = function(){
		
		var valueExist = false;
		for ( var i = 0; i<  $scope.questionnaire.specificQuestionnaire.debtorOutstandings.length;i++){
			if($scope.questionnaire.specificQuestionnaire.debtorOutstandings[i].numberDebtorsExport){
				valueExist =  true;
				break;
			}
		}
		return  valueExist;
		
	}
	
	/*
	 * Defect788:FR feedback - Questionnaire / Debtors Outstanding Breakdown :
	 * additional columns Handel click action when user click details button, to
	 * show or hide numberDebtorsExport and numberDebtorsDomestic columns
	 */
	$scope.toggleDebtorsDetailsClickHandler = function() {
		
		if($scope.questionnaireForm.debtorsOutstandingSubForm.$valid || !$scope.showDebtorsDetails){
			$scope.toggleDebtorsDetailsClass() ;
			$scope.showDebtorsDetails = !$scope.showDebtorsDetails;
		}
	}
	/*
	 * Defect788:FR feedback - Questionnaire / Debtors Outstanding Breakdown :
	 * additional columns toggle the icone ofshow detail button, (+) when
	 * details columns are hidden and (-) when details column are visible
	 */
	$scope.toggleDebtorsDetailsClass = function() {
		$('toggle-debtors-details-btn').toggleClass('fa-plus-square-o fa-minus-square-o');
	};
	
	/**
	 * Update the quotation tooltip when user changes a scenario
	 */
	$scope.updateQuotationTooltip = function () {
		var tooltipQuotationRequest = '';
		tooltipQuotationRequest = $scope.questionnaire.quoteGenerated
		? $translate.instant('policy.quote.request.action.completed.tooltip')
				: $translate.instant('policy.quote.request.in.progress.tooltip');
		return $sce.trustAsHtml(tooltipQuotationRequest);
	}

	/**
	 * Check the mandatory fields in Questionnaire page in order to disable /
	 * enable the Request Quotation button.
	 */
	$scope.checkQuestionnaireFieldsMandatory = function () {

		$scope.requestQuoteButtonTooltip = '';
		var currentScenario = ScenarioDataService.getCurrentScenario();
		
		if (currentScenario.isReadOnly) {
				if (currentScenario.fileTransferredToGCC) {
					// Defect #809: Impossible to price a nex scenario created from
					// an already priced scenario
					$scope.requestQuoteButtonTooltip = $sce.trustAsHtml($translate.instant('policy.quote.file.transferred.tooltip'));
				} else if (currentScenario.nbiOrContractGenerated) {
					$scope.requestQuoteButtonTooltip = $sce.trustAsHtml($translate.instant('policy.quote.contract.downloaded.tooltip'));
				} else if (currentScenario.derogationWorkflowStopped) {
					$scope.requestQuoteButtonTooltip = $sce.trustAsHtml($translate.instant('proposal.derogation.process.stopped.tooltip'));
				} else if (currentScenario.derogationWorkflowFinished) {
					$scope.requestQuoteButtonTooltip = $sce.trustAsHtml($translate.instant('proposal.derogation.process.final.validation.tooltip'));
				}
				return;
		}

		if ($scope.questionnaire.specificQuestionnaire.requestQuoteTaskId != null) {
			$scope.requestQuoteButtonTooltip = $scope.updateQuotationTooltip();
			$scope.buttonRequestQuotationDisabled = false;
			return;
		}

		var fieldsMandatory = QuestionnaireService.checkQuestionnaireFieldsMandatory($scope.questionnaire);
		$scope.buttonRequestQuotationDisabled = (fieldsMandatory.length > 0);

		if (fieldsMandatory.length > 0) {

			var fieldMandatoryContent = '<div class="col-sm-12"><div class="form-group"><label>' + $translate.instant('policy.quote.mandatory.fields.tooltip') + '</label></div>';
			fieldMandatoryContent += '<div class="form-group">';
			fieldMandatoryContent += '<p>' + $translate.instant('questionnaire.mandatory.field.label') + '</p>';
			fieldMandatoryContent += '<ul>';

			angular.forEach(fieldsMandatory, function(item) {
				fieldMandatoryContent += '<li>' + $translate.instant(item) + '</li>';
			});

			fieldMandatoryContent += '</ul></div>';

			$scope.requestQuoteButtonTooltip = $sce.trustAsHtml(fieldMandatoryContent);
		}

	};

	$scope.sectorsArray = function() {

		$scope.count = $scope.count + 1;
		var result = [];
		angular.forEach(NomenclatureService.getSectors($translate.use()), function(sector, id) {

			var sectorObject = {
					'value':sector,
					'id':id
			};
			result.push(sectorObject);
		});
		return result;
	};

	$scope.initCountriesList = function() {
// return NomenclatureService.getCountries($translate.use());;
		var country = NomenclatureService.getCountries($translate.use());
		angular.forEach(country, function(value, key) {
			if(key != $scope.questionnaire.specificQuestionnaire.domesticCountry) {
				$scope.countries.push({"code":key,"label":value});
			}
		});
	};

	$scope.sectors = $scope.sectorsArray();

	$scope.naces = NomenclatureService.getNaces($translate.use());

	// localStorageService.set('pricingEntity',
	// $scope.questionnaire.pricingEntity);
// localStorageService.set('isoCountryCode',
// $scope.questionnaire.isoCountryCode);
// localStorageService.set('companyName',$scope.questionnaire.companyLegalName);

	ScenarioDataService.companyName = $scope.questionnaire.companyLegalName;

	ScenarioService.isReadOnly = false;

	$scope.reportExportTurnoverButtonTooltip = '';

	$scope.civilities = NomenclatureService.getCivilities($translate.use());
	$scope.serviceProviders = NomenclatureService.getServiceProviders($translate.use());

	$rootScope.$on('$translateChangeSuccess', function () {
		$scope.civilities = NomenclatureService.getCivilities($translate.use());
		$scope.serviceProviders = NomenclatureService.getServiceProviders($translate.use());
		$scope.naces = NomenclatureService.getNaces($translate.use());
		$scope.sectors = $scope.sectorsArray();
		$scope.initCountriesList();
	});

	var naceCodes = function() {
		var naces = [];
		if($scope.questionnaire.specificQuestionnaire.activitySector != null && $scope.questionnaire.specificQuestionnaire.activitySector != '') {
			naces = $scope.questionnaire.specificQuestionnaire.nace38naceMap[$scope.questionnaire.specificQuestionnaire.activitySector];
		} else {
			for(var key in $scope.questionnaire.specificQuestionnaire.nace38naceMap) {
				angular.forEach($scope.questionnaire.specificQuestionnaire.nace38naceMap[key], function(item) {
					if(naces.indexOf(item) == -1) {
						naces.push(item);
					}
				});
			}
		}
		return naces;
	};

	$scope.selectNace = function() {
		if($scope.questionnaire.specificQuestionnaire.napceCode != null) {
			for(var key in $scope.questionnaire.specificQuestionnaire.nace38naceMap) {
				if($scope.questionnaire.specificQuestionnaire.nace38naceMap[key].indexOf($scope.questionnaire.specificQuestionnaire.napceCode) != -1) {
					$scope.questionnaire.specificQuestionnaire.activitySector = key;
					return;
				}
			}
		}
	};

	$scope.setNacesCodeByActivitySector = function () {
		$scope.nacesCodeByActivitySector = naceCodes();
		$scope.questionnaire.specificQuestionnaire.napceCode = null;
	};

	$scope.$on(AUTH_EVENTS.accessDenied, function (event, args) {
		logger.debug('debug', 'Access Denied, go to home page');
		$state.go('app');
	});

	$scope.submitForm = function (event, page) {
		logger.debug('debug', 'START submitForm');

		logger.debug('debug', 'Questionnaire called');
		if (event) {
			event.preventDefault();
		}

		if($scope.questionnaire.isReadOnly || $scope.questionnaire.checkMigration) {
			gotoPageProcess(page);
			return;
		}

		if($scope.questionnaire.newBusiness) {
			// validate form before submit
			$scope.validateTurnoverExperienceForYear(0);
			$scope.validateDebtorOutStandingGlobal();
		}

		if ($scope.questionnaireForm.$invalid) {
			$confirm(
					{title: 'form.invalid.title', text: 'form.invalid.text', okBtnLabel: 'ok.label'},
					{templateUrl: 'views/common/modalMessage.html'}
			);
			ScenarioDataService.saveInProgress = false;
		}
		// Only save if detected a modification
		else if ($scope.questionnaireForm.$dirty){

			/*
			 * Save the form
			 */
			// logger.debug('debug', 'Save the questionnaire : {0}',
			// [JSON.stringify($scope.questionnaire)]);
			growl.info('questionnaire.saving.msg');

			QuestionnaireResource.update({caseId: localStorageService.get('caseId')},$scope.questionnaire).$promise.then(function () {
				/*Defect869 : Management of Bad Debts on Year Change*/
				 if($scope.questionnaire.specificQuestionnaire.badDebedtModified){
					 $scope.questionnaire.specificQuestionnaire.updateDateBadDebts = $filter('date')(new Date(), "dd/MM/yyyy");
				 }
				
				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.questionnaire.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
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

	var gotoPageProcess = function(page) {
		ScenarioDataService.saveInProgress = false;
		if (angular.isDefined(page)) {
			if (page === 'app') {
				$state.go(page, {}, {reload: true});
			}
			else {
				$state.go(page,{ caseId: localStorageService.get('caseId'),scenarioId:localStorageService.get('scenarioId') });
			}
		}
		else {
			// defect #522 :
			$scope.questionnaire.oldPartnerRoleReferenceId = $scope.questionnaire.partnerRoleReferenceId;
			$scope.questionnaireForm.$setPristine();
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
				// Get the subForm name
				angular.forEach(angular.element('.aty-sub-form'), function (subForm, index) {
					var subFormName = subForm.attributes['name'].value;
					// Check if the field is existed in the nest form
					if (angular.isObject($scope.questionnaireForm[subFormName][errorField.field])) {
						$scope.questionnaireForm[subFormName][errorField.field].$setValidity(errorField.errorType, false);
					}
				});
			});
		}
	};

	$scope.removeInsurableTurnover = function (index) {
		$scope.questionnaire.specificQuestionnaire.insurableTurnovers.splice(index, 1);
		$scope.computeInsurableTurnovers();
		$scope.questionnaireForm.$setDirty();
	};

	$scope.addInsurableTurnover = function (initCountry, amount) {
		if (null === $scope.questionnaire.specificQuestionnaire.insurableTurnovers || $scope.questionnaire.specificQuestionnaire.insurableTurnovers.length === 0) {
			if (null === $scope.questionnaire.specificQuestionnaire.insurableTurnovers) {
				$scope.questionnaire.specificQuestionnaire.insurableTurnovers = [];
			}
		}
		$scope.questionnaire.specificQuestionnaire.insurableTurnovers.push({
			country: initCountry,
			amount: amount
		});
		$scope.computeInsurableTurnovers();
	};

	$scope.addDefaultInsurableTurnover = function() {
		if (angular.isNumber($scope.questionnaire.specificQuestionnaire.exportTurnover) && angular.isDefined($scope.questionnaire.specificQuestionnaire.exportCountry) && (null === $scope.questionnaire.specificQuestionnaire.insurableTurnovers || $scope.questionnaire.specificQuestionnaire.insurableTurnovers.length === 0)) {
			$scope.addInsurableTurnover($scope.questionnaire.specificQuestionnaire.exportCountry,$scope.questionnaire.specificQuestionnaire.exportTurnover);
		}
	};

	$scope.computeInsurableTurnovers = function () {
		$scope.globalTurnover = null;
		$scope.exportTurnover = null;
		angular.forEach($scope.questionnaire.specificQuestionnaire.insurableTurnovers, function (turnover, key) {
			if (angular.isNumber(turnover.amount)) {
				$scope.exportTurnover += turnover.amount;
			}
		});
		if (angular.isNumber($scope.questionnaire.specificQuestionnaire.domesticTurnover) || angular.isNumber($scope.exportTurnover)) {
			$scope.globalTurnover = $scope.questionnaire.specificQuestionnaire.domesticTurnover + $scope.exportTurnover;
		}
	};

	$scope.removeBuyerCreditSales = function (index) {
		$scope.questionnaire.buyers.splice(index, 1);
	};

	$scope.addBuyerCreditSales = function () {
		if (null === $scope.questionnaire.buyers) {
			$scope.questionnaire.buyers = [];
		}
		$scope.questionnaire.buyers.push({
			country: '',
			companyName: '',
			maximumOutstanding: null,
			termsPayment: null,
			comment: ''
		});
	};

	$scope.showAddBuyersBtn = function (index, last) {
		return (index == last && index <= $scope.maxNumberBuyers);
	};

	$scope.updateCurrency = function (currency) {

		$scope.questionnaire.specificQuestionnaire.debtorOutstandings = [];

		var deptorSize = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[currency].length;

		for (var i = 0; i < deptorSize; i++) {
			$scope.questionnaire.specificQuestionnaire.debtorOutstandings.push({
				'id': null,
				'globalsOutstanding': null,
				'numberDebtors': null
			});
		}
	};


	/**
	 * Check if the data is modified after the quote is computed.
	 */

	$scope.$watch('questionnaireForm.modified', function (newVal, oldVal) {

		if (angular.isUndefined(newVal)) {return;}

		if (newVal !== oldVal) {
			
			var currentScenario = ScenarioDataService.getCurrentScenario();
			
			if (newVal && currentScenario.isReadOnly && !currentScenario.specificQuestionnaireChanged && $scope.questionnaireForm.$dirty) {
				$scope.modalQuestionnaireModify = $modal.open({
					backdrop: 'static',
					animation: true,
					scope: $scope,
					templateUrl: 'views/common/modalQuestionnaireModify.html',
					controller: function ($scope, $modalInstance) {
						
						$scope.modificationAccepted = function () {
							
							QuestionnaireService.getSpecificQuestionnaire(localStorageService.get('caseId'),localStorageService.get('scenarioId')).then(function(result) {
								if (result !== null ) {
									$scope.questionnaire.specificQuestionnaire = result;
									$scope.init();
									
									currentScenario.specificQuestionnaireChanged = true;
									
									$scope.questionnaireForm.$setPristine();
								}
							});
							
							$scope.questionnaire.specificQuestionnaire.pricingObsolete = true;
							
							$modalInstance.dismiss('cancel');
						};
						
						$scope.modificationCanceled = function () {
							$scope.questionnaireForm.reset();
							$scope.questionnaire.specificQuestionnaire.pricingObsolete = false;
							$modalInstance.dismiss('cancel');
						};
					}
				});
				
			} else {
				$scope.questionnaire.specificQuestionnaire.pricingObsolete = newVal;
			}
		}

	});


	/**
	 * validate debtor outstanding
	 */
	$scope.validateDebtorOutStanding = function (index, min, max,validateGreatestOutstanding) {
		if(null != $scope.questionnaire.specificQuestionnaire.debtorOutstandings[index]) {
			var globalsOutstanding = $scope.questionnaire.specificQuestionnaire.debtorOutstandings[index].globalsOutstanding;
			var numberDebtorsExport = $scope.questionnaire.specificQuestionnaire.debtorOutstandings[index].numberDebtorsExport;
		
			
			var isError = false;
			var numberDebtors = $scope.questionnaire.specificQuestionnaire.debtorOutstandings[index].numberDebtors;
			if (angular.isNumber(globalsOutstanding) && angular.isNumber(numberDebtors)) {
				if (max != null) {
					if ( !(min <= (globalsOutstanding / numberDebtors) && (globalsOutstanding / numberDebtors) <= max) ) {
						isError = true;
					}
				} else { // last element
					if ( !(min <= (globalsOutstanding / numberDebtors)) ) {
						isError = true;
					}
				}
				
				
			}
			if(angular.isNumber(numberDebtorsExport)) {
				if(numberDebtorsExport > numberDebtors){
					isError = true;
				}
			}

			if(isError) {
				if(null != $scope.questionnaireForm && null != $scope.questionnaireForm.debtorsOutstandingSubForm && null != $scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].globalsOutstanding']) {
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].globalsOutstanding'].$setValidity('debtorOutStanding', false);
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].numberDebtors'].$setValidity('debtorOutStanding', false);
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].numberDebtorsExport'].$setValidity('debtorOutStanding', false);
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].numberDebtorsDomestic'].$setValidity('debtorOutStanding', false);
					
					/*
					 * Defect788:FR feedback - Questionnaire / Debtors
					 * Outstanding Breakdown : if record is not valid and
					 * details columns are hidden and contain values(not empty),
					 * force details columns to be displayed, and let user can
					 * fix errors
					 */
					if(!$scope.showDebtorsDetails && $scope.checkDebtorsExportValueExist()){
						$scope.showDebtorsDetails = true  ;
						$scope.toggleDebtorsDetailsClass();
					}
				}
			}
			else {
				if(null != $scope.questionnaireForm && null != $scope.questionnaireForm.debtorsOutstandingSubForm && null != $scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].globalsOutstanding']) {
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].globalsOutstanding'].$setValidity('debtorOutStanding', true);
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].numberDebtors'].$setValidity('debtorOutStanding', true);
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].numberDebtorsExport'].$setValidity('debtorOutStanding', true);
					$scope.questionnaireForm.debtorsOutstandingSubForm['debtorOutstandings[' + index + '].numberDebtorsDomestic'].$setValidity('debtorOutStanding', true);
					
				}
				if(validateGreatestOutstanding) {
					$scope.validateGreatestOutstanding();
				}
			}
		}
	};
	// defect #657 : Error inconsistency Questionaire Outstanding
	$scope.validateDebtorOutStandingGlobal = function() {
		// questionnaire.outstandingBreakdown[questionnaire.contractCurrency]
		if(null != $scope.questionnaire.specificQuestionnaire.outstandingBreakdown && null != $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency]) {
			var outstandingBreakdowns = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency];
			for(var i = 0;i<outstandingBreakdowns.length;i++) {
				var outstanding = outstandingBreakdowns[i];
				var min,max = null;
				if(i == 0) {
					min = 0;
					max = outstanding;
				} else if(i == outstandingBreakdowns.length -1) {
					min = outstandingBreakdowns[i -1] + 1;
				} else {
					min = outstandingBreakdowns[i -1] + 1;;
					max = outstanding;
				}
				$scope.validateDebtorOutStanding(i,min,max,false);
			}
			$scope.validateGreatestOutstanding();
		}
	}

	$scope.validateGreatestOutstanding = function() {
		var isError = false;
		var greatestOutstanding = $scope.questionnaire.specificQuestionnaire.greatestOutstanding;
		if ( angular.isNumber(greatestOutstanding) ) {
			var outstandingBreakdowns = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency];
			var _length = outstandingBreakdowns.length;
			var max = null, min = 0;

			for(var i = _length - 1; i >= 0; i--) {
				if(null != $scope.questionnaire.specificQuestionnaire.debtorOutstandings[i]) {
					var globalsOutstanding = $scope.questionnaire.specificQuestionnaire.debtorOutstandings[i].globalsOutstanding;
					if(angular.isNumber(globalsOutstanding)) {
						if(i == ($scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency].length - 1)) {
							min = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency][i];
						} else if( i == 0) {
							max = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency][i];
						} else {
							min = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency][i-1] + 1;
							max = $scope.questionnaire.specificQuestionnaire.outstandingBreakdown[$scope.questionnaire.specificQuestionnaire.contractCurrency][i];
						}
						break;
					}
				}
			}

			if(max != null) {
				if(greatestOutstanding < min || greatestOutstanding > max) {
					isError = true;
				}
			} else {
				if(greatestOutstanding < min) {
					isError = true;
				}
			}
		}

		if(isError) {
			return 'non-blocking-error';
		} else {
			return '';
		}
	};

	/**
	 * Validate Export turnovers
	 */
	$scope.validateExportTurnover = function (automaticReport) {
		if(null != $scope.questionnaire.specificQuestionnaire.insurableTurnovers && $scope.questionnaire.specificQuestionnaire.insurableTurnovers.length > 0) {
			if(angular.isNumber($scope.questionnaire.specificQuestionnaire.exportTurnover)) {
				if ($scope.exportTurnover != $scope.questionnaire.specificQuestionnaire.exportTurnover) {
					$scope.questionnaireForm.figuresSubForm.exportTurnover.$setValidity('exportTurnover', false);
					$scope.showReportExportTurnover = true;
				}
				else {
					$scope.questionnaireForm.figuresSubForm.exportTurnover.$setValidity('exportTurnover', true);
					$scope.showReportExportTurnover = false;
				}
			} else {
				$scope.questionnaireForm.figuresSubForm.exportTurnover.$setValidity('exportTurnover', false);
				$scope.showReportExportTurnover = true;
			}
		} else {
			if(automaticReport == true) {
				$scope.showReportExportTurnover = true;
			} else {
				$scope.questionnaireForm.figuresSubForm.exportTurnover.$setValidity('exportTurnover', true);
				$scope.showReportExportTurnover = false;
			}
		}

		if($scope.showReportExportTurnover) {
			// defect #399 : Automatic Report of Export Turnover in
			// Questionnaire
			if(automaticReport != null && automaticReport == true) {
				$scope.reportExportTurnover()
			} else {
				$scope.reportExportTurnoverButtonTooltip = $translate.instant('report.export.turnover.tooltip.label',{p0: $scope.exportTurnover});
			}
		}
	};

	$scope.reportExportTurnover = function () {
// if (null != $scope.exportTurnover) {
		$scope.questionnaire.specificQuestionnaire.exportTurnover = $scope.exportTurnover;
		$scope.validateExportTurnover();
// }
	};

	/**
	 * Validate Bad Debts Experience : unpaid >= recovery
	 */
	$scope.validateBadDebtExperience = function (unpaidFieldName, recoveryFieldName) {
		var unpaid = $scope.questionnaire[unpaidFieldName];
		var recovery = $scope.questionnaire[recoveryFieldName];
		if (unpaid != null && unpaid != '' && recovery != null && recovery != '' && angular.isNumber(unpaid) && angular.isNumber(recovery) && unpaid < recovery) {
			$scope.questionnaireForm.badDebtorsSubForm[recoveryFieldName].$setValidity('badDebtsExperience', false);
		} else {
			// null value is accepted
			$scope.questionnaireForm.badDebtorsSubForm[recoveryFieldName].$setValidity('badDebtsExperience', true);
		}
	};

	/**
	 * Validate Number Retained Loss field : the number of retained loss data
	 * must be less than the number of loss and the number of loss must not be
	 * null
	 */
	$scope.validateNumberRetainedLoss = function (numberOfLoss_, numberRetainedLoss_) {
		var numberRetainedLoss = $scope.questionnaire[numberRetainedLoss_];
		var numberOfLoss = $scope.questionnaire[numberOfLoss_];

		if ((numberOfLoss == null && numberRetainedLoss != null) || (numberOfLoss != null && numberRetainedLoss != null && numberRetainedLoss > numberOfLoss)) {
			$scope.questionnaireForm.badDebtorsSubForm[numberRetainedLoss_].$setValidity('numberRetainedLoss', false);
		} else {
			$scope.questionnaireForm.badDebtorsSubForm[numberRetainedLoss_].$setValidity('numberRetainedLoss', true);
		}

	};

	/*
	 * Validate Turnover experience is not null when Bad Debts Experience is set
	 */
	$scope.validateTurnoverExperienceForYear = function (minusYear) {
		var fNumberLoss = 'numberLoss';
		var fUnpaidInvoice = 'unpaidInvoice';
		var fRecovery = 'recovery';
		var fRetainedLoss = 'retainedLoss';
		var fNumberRetainedLoss = 'numberRetainedLoss';
		var fDomesticTurnoverY = minusYear == 0 ? 'domesticTurnover' : 'domesticTurnoverY_' + minusYear;
		var fExportTurnoverY = minusYear == 0 ? 'exportTurnover' : 'exportTurnoverY_' + minusYear;

		if (minusYear == 0) {
			fNumberLoss = fNumberLoss + 'CurrentYear';
			fUnpaidInvoice = fUnpaidInvoice + 'CurrentYear';
			fRecovery = fRecovery + 'CurrentYear';
			fRetainedLoss = fRetainedLoss + 'CurrentYear';
			fNumberRetainedLoss = fNumberRetainedLoss + 'CurrentYear';
		} else {
			fNumberLoss = fNumberLoss + 'Y_' + minusYear;
			fUnpaidInvoice = fUnpaidInvoice + 'Y_' + minusYear;
			fRecovery = fRecovery + 'Y_' + minusYear;
			fRetainedLoss = fRetainedLoss + 'Y_' + minusYear;
			fNumberRetainedLoss = fNumberRetainedLoss + 'Y_' + minusYear;
		}

		// Defect #455 the field Recovery is set to 0 if any values are typed
// if(($scope.questionnaire[fNumberLoss] != null ||
// $scope.questionnaire[fUnpaidInvoice] != null) &&
// $scope.questionnaire[fRecovery] == null) {
// $scope.questionnaire[fRecovery] = 0;
// }

		// defect #398 : Error Quote when Losses are declared and not fulfilled
		// 2) if the field "Number of Loss" is set to 0, then automatically the
		// 2 others fields of the same line are set to 0
		if($scope.questionnaire.specificQuestionnaire[fNumberLoss] != null && $scope.questionnaire.specificQuestionnaire[fNumberLoss] == 0) {
			$scope.questionnaire.specificQuestionnaire[fUnpaidInvoice] = 0;
			$scope.questionnaire.specificQuestionnaire[fRecovery] = 0;
			$scope.questionnaire.specificQuestionnaire[fRetainedLoss] = 0;
			$scope.questionnaire.specificQuestionnaire[fNumberRetainedLoss] = 0;
		}

		// logger.debug('debug', 'validateTurnoverExperienceForYear : ' +
		// minusYear + ' - ' + fNumberLoss + ' - ' + fUnpaidInvoice + ' - ' +
		// fRecovery + ' - ' + fDomesticTurnoverY + ' - ' + fExportTurnoverY);
		// logger.debug('$scope.questionnaire[' + fDomesticTurnoverY + '] : ' +
		// $scope.questionnaire[fDomesticTurnoverY]);
		// logger.debug('$scope.questionnaire[' + fExportTurnoverY + '] : ' +
		// $scope.questionnaire[fExportTurnoverY]);
		if ($scope.questionnaire.specificQuestionnaire.badDebtsExperience) {
			if(minusYear == 0 || minusYear == 1) {
				// defect #398 : Error Quote when Losses are declared and not
				// fulfilled
				// 1) if the option is selected to YES :
				// - Year n-1 (2016) Turnover shall not be empty
				// - Year n-1 (2016-2017) loss fields (3 fields) shall be
				// fulfilled

				if($scope.questionnaire.specificQuestionnaire[fNumberLoss] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberLoss])) {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired1', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired1', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fUnpaidInvoice] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fUnpaidInvoice])) {
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired1', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired1', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fRecovery] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fRecovery])) {
					$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired1', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired1', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fRetainedLoss] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fRetainedLoss])) {
					$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired1', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired1', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fNumberRetainedLoss] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberRetainedLoss])) {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired1', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired1', true);
				}

			}

			// defect #398 : Error Quote when Losses are declared and not
			// fulfilled
			// 3) if for a given year there is Turnover, then the 3 fileds of
			// losses of this year shall be fulfilled (put in Red if not filled)
			if (($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY])) ||
					($scope.questionnaire.specificQuestionnaire[fExportTurnoverY] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fExportTurnoverY]))) {
				if($scope.questionnaire.specificQuestionnaire[fNumberLoss] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberLoss])) {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired3', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired3', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fUnpaidInvoice] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fUnpaidInvoice])) {
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired3', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired3', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fRecovery] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fRecovery])) {
					$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired3', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired3', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fRetainedLoss] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fRetainedLoss])) {
					$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired3', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired3', true);
				}

				if($scope.questionnaire.specificQuestionnaire[fNumberRetainedLoss] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberRetainedLoss])) {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired3', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired3', true);
				}
			} else {
				$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired3', true);
				$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired3', true);
				$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired3', true);
				$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired3', true);
				$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired3', true);
			}

			// defect #398 : Error Quote when Losses are declared and not
			// fulfilled
			// 4) (existing rule to keep) if for a given year there is some
			// loss, then the Turnover of this year shall be declared (Dom or
			// Export) : put in red if not filled
			if (($scope.questionnaire.specificQuestionnaire[fNumberLoss] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberLoss])) ||
					($scope.questionnaire.specificQuestionnaire[fUnpaidInvoice] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fUnpaidInvoice])) ||
					($scope.questionnaire.specificQuestionnaire[fRecovery] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fRecovery]))) {
				if ($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY] == null && $scope.questionnaire.specificQuestionnaire[fExportTurnoverY] == null) {
					$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY].$setValidity('turnoverExperienceRequired4', false);
					$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY].$setValidity('turnoverExperienceRequired4', false);
				} else {
					$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY].$setValidity('turnoverExperienceRequired4', true);
					$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY].$setValidity('turnoverExperienceRequired4', true);
				}
			}
			// The domestic and export turnover must not be null for the current
			// year and the year -1
			else if ((minusYear == 0 || minusYear == 1) && ($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY] == null && $scope.questionnaire.specificQuestionnaire[fExportTurnoverY] == null)) {
				$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY].$setValidity('turnoverExperienceRequired4', false);
				$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY].$setValidity('turnoverExperienceRequired4', false);
			} else {
				$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY].$setValidity('turnoverExperienceRequired4', true);
				$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY].$setValidity('turnoverExperienceRequired4', true);
			}

			// defect #398 : Error Quote when Losses are declared and not
			// fulfilled
			// 5) No Gap authorized : If Year n-3 is filled, then Year -2 shall
			// not be empty (but can be 0) : Control can be done on the field Nb
			// of loss
			if(minusYear == 3) {
				var fDomesticTurnoverY2 = 'domesticTurnoverY_2';
				var fExportTurnoverY2 = 'exportTurnoverY_2';
				var fNumberLossY2 = 'numberLossY_2';
				var fUnpaidInvoiceY2 = 'unpaidInvoiceY_2';
				var fRecoveryY2 = 'recoveryY_2';
				var fNumberRetainedLossY2 = 'numberRetainedLossY_2';

				if (($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY])) ||
						($scope.questionnaire.specificQuestionnaire[fExportTurnoverY] != null && angular.isNumber($scope.questionnaire.specificQuestionnaire[fExportTurnoverY]))) {
					if(($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY2] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fDomesticTurnoverY2])) &&
							($scope.questionnaire.specificQuestionnaire[fExportTurnoverY2] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fExportTurnoverY2]))	) {
						$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY2].$setValidity('turnoverExperienceRequired5', false);
						$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY2].$setValidity('turnoverExperienceRequired5', false);
					} else {
						$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY2].$setValidity('turnoverExperienceRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY2].$setValidity('turnoverExperienceRequired5', true);
					}
				}

				if($scope.questionnaire.specificQuestionnaire[fNumberLoss] != null || $scope.questionnaire.specificQuestionnaire[fUnpaidInvoice] != null
						||  $scope.questionnaire.specificQuestionnaire[fRecovery] != null || $scope.questionnaire.specificQuestionnaire[fNumberRetainedLossY2] != null) {
					if($scope.questionnaire.specificQuestionnaire[fNumberLossY2] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberLossY2])) {
						$scope.questionnaireForm.badDebtorsSubForm[fNumberLossY2].$setValidity('lossRequired5', false);
					} else {
						$scope.questionnaireForm.badDebtorsSubForm[fNumberLossY2].$setValidity('lossRequired5', true);
					}

					if($scope.questionnaire.specificQuestionnaire[fUnpaidInvoiceY2] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fUnpaidInvoiceY2])) {
						$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoiceY2].$setValidity('lossRequired5', false);
					} else {
						$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoiceY2].$setValidity('lossRequired5', true);
					}

					if($scope.questionnaire.specificQuestionnaire[fRecoveryY2] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fRecoveryY2])) {
						$scope.questionnaireForm.badDebtorsSubForm[fRecoveryY2].$setValidity('lossRequired5', false);
					} else {
						$scope.questionnaireForm.badDebtorsSubForm[fRecoveryY2].$setValidity('lossRequired5', true);
					}

					if($scope.questionnaire.specificQuestionnaire[fNumberRetainedLossY2] == null || !angular.isNumber($scope.questionnaire.specificQuestionnaire[fNumberRetainedLossY2])) {
						$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLossY2].$setValidity('lossRequired5', false);
					} else {
						$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLossY2].$setValidity('lossRequired5', true);
					}
				}else {
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLossY2].$setValidity('lossRequired5', true);
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoiceY2].$setValidity('lossRequired5', true);
					$scope.questionnaireForm.badDebtorsSubForm[fRecoveryY2].$setValidity('lossRequired5', true);
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLossY2].$setValidity('lossRequired5', true);
				}
			}
		} else {
			try {
				if(null != $scope.questionnaireForm && null != $scope.questionnaireForm.badDebtorsSubForm) {
					$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY].$setValidity('turnoverExperienceRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY].$setValidity('turnoverExperienceRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY].$setValidity('turnoverExperienceRequired4', true);
					$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY].$setValidity('turnoverExperienceRequired4', true);
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired1', true);
					$scope.questionnaireForm.badDebtorsSubForm[fNumberLoss].$setValidity('lossRequired3', true);
					$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoice].$setValidity('lossRequired3', true);
					$scope.questionnaireForm.badDebtorsSubForm[fRecovery].$setValidity('lossRequired3', true);
					$scope.questionnaireForm.badDebtorsSubForm[fRetainedLoss].$setValidity('lossRequired3', true);
					$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLoss].$setValidity('lossRequired3', true);
					if(minusYear == 3) {
						var fDomesticTurnoverY2 = 'domesticTurnoverY_2';
						var fExportTurnoverY2 = 'exportTurnoverY_2';
						var fNumberLossY2 = 'numberLossY_2';
						var fUnpaidInvoiceY2 = 'unpaidInvoiceY_2';
						var fRecoveryY2 = 'recoveryY_2';
						var fRetainedLossY2 = 'retainedLossY_2';
						var fNumberRetainedLossY2 = 'numberRetainedLossY_2';
						$scope.questionnaireForm.badDebtorsSubForm[fDomesticTurnoverY2].$setValidity('turnoverExperienceRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fExportTurnoverY2].$setValidity('turnoverExperienceRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fNumberLossY2].$setValidity('lossRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fUnpaidInvoiceY2].$setValidity('lossRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fRecoveryY2].$setValidity('lossRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fRetainedLossY2].$setValidity('lossRequired5', true);
						$scope.questionnaireForm.badDebtorsSubForm[fNumberRetainedLossY2].$setValidity('lossRequired5', true);
					}
				}
			}
			catch(err) {
				logger.debug('debug',err.message);
			}
		}
	};

	/**
	 * The retained loss is the sum of unpaid invoice and recovery.
	 */
	$scope.computeRetainedLossForYear =  function(year) {
		switch (year) {
		case 0:

			if ($scope.questionnaire.specificQuestionnaire.unpaidInvoiceCurrentYear == null && $scope.questionnaire.specificQuestionnaire.recoveryCurrentYear == null ){
				$scope.questionnaire.specificQuestionnaire.retainedLossCurrentYear = null;
			}
			else {
				$scope.questionnaire.specificQuestionnaire.retainedLossCurrentYear = $scope.questionnaire.specificQuestionnaire.unpaidInvoiceCurrentYear - $scope.questionnaire.specificQuestionnaire.recoveryCurrentYear;
			}
			break;
		case 1:
			if ($scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_1 == null && $scope.questionnaire.specificQuestionnaire.recoveryY_1 == null) {
				$scope.questionnaire.specificQuestionnaire.retainedLossY_1 = null;
			}
			else {
				$scope.questionnaire.specificQuestionnaire.retainedLossY_1 = $scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_1 - $scope.questionnaire.specificQuestionnaire.recoveryY_1;
			}
			break;
		case 2:
			if ($scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_2 == null &&  $scope.questionnaire.specificQuestionnaire.recoveryY_2 == null) {
				$scope.questionnaire.specificQuestionnaire.retainedLossY_2 = null;
			}
			else {
				$scope.questionnaire.specificQuestionnaire.retainedLossY_2 = $scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_2 - $scope.questionnaire.specificQuestionnaire.recoveryY_2;
			}

			break;
		case 3:
			if ($scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_3 == null &&  $scope.questionnaire.specificQuestionnaire.recoveryY_3 == null) {
				$scope.questionnaire.specificQuestionnaire.retainedLossY_3 = null;
			}
			else {
				$scope.questionnaire.specificQuestionnaire.retainedLossY_3 = $scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_3 - $scope.questionnaire.specificQuestionnaire.recoveryY_3;
			}
			break;
		}
	}

	/**
	 * The recovery value must be set to 0 when other field has data in the same
	 * year
	 */
	$scope.initRecoveryValue = function(year) {
		switch (year) {
		case 0:
			// Init the Number of Loss retained field
			$scope.questionnaire.specificQuestionnaire.numberRetainedLossCurrentYear = $scope.questionnaire.specificQuestionnaire.numberLossCurrentYear;

			if (($scope.questionnaire.specificQuestionnaire.numberLossCurrentYear == null && $scope.questionnaire.specificQuestionnaire.unpaidInvoiceCurrentYear == null && $scope.questionnaire.specificQuestionnaire.retainedLossCurrentYear == null)){
				$scope.questionnaire.specificQuestionnaire.recoveryCurrentYear = null
			}
			else if ($scope.questionnaire.specificQuestionnaire.recoveryCurrentYear == null) {
				$scope.questionnaire.specificQuestionnaire.recoveryCurrentYear = 0;
			}
			break;
		case 1:

			// Init the Number of Loss retained field
			$scope.questionnaire.specificQuestionnaire.numberRetainedLossY_1 = $scope.questionnaire.specificQuestionnaire.numberLossY_1;

			if (($scope.questionnaire.specificQuestionnaire.numberLossY_1 == null && $scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_1 == null && $scope.questionnaire.specificQuestionnaire.retainedLossY_1 == null)){
				$scope.questionnaire.specificQuestionnaire.recoveryY_1 = null
			}
			else if ($scope.questionnaire.specificQuestionnaire.recoveryY_1 == null) {
				$scope.questionnaire.specificQuestionnaire.recoveryY_1 = 0;
			}
			break;
		case 2:

			// Init the Number of Loss retained field
			$scope.questionnaire.specificQuestionnaire.numberRetainedLossY_2 = $scope.questionnaire.specificQuestionnaire.numberLossY_2;

			if (($scope.questionnaire.specificQuestionnaire.numberLossY_2 == null && $scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_2 == null && $scope.questionnaire.specificQuestionnaire.retainedLossY_2 == null)){
				$scope.questionnaire.specificQuestionnaire.recoveryY_2 = null
			}
			else if ($scope.questionnaire.specificQuestionnaire.recoveryY_2 == null) {
				$scope.questionnaire.specificQuestionnaire.recoveryY_2 = 0;
			}

			break;
		case 3:
			// Init the Number of Loss retained field
			$scope.questionnaire.specificQuestionnaire.numberRetainedLossY_3= $scope.questionnaire.specificQuestionnaire.numberLossY_3;

			if (($scope.questionnaire.specificQuestionnaire.numberLossY_3 == null && $scope.questionnaire.specificQuestionnaire.unpaidInvoiceY_3 == null && $scope.questionnaire.specificQuestionnaire.retainedLossY_3 == null)){
				$scope.questionnaire.specificQuestionnaire.recoveryY_3 = null
			}
			else if ($scope.questionnaire.specificQuestionnaire.recoveryY_3 == null) {
				$scope.questionnaire.specificQuestionnaire.recoveryY_3 = 0;
			}
			break;
		}
	}

	/*
	 * Action "Get Role Reference Id" - open contractFollowupView to get the
	 * selected Role Reference Id
	 */
	$scope.openCompanyOnCube = function() {

		logger.debug('debug', 'Call open contractFollowupView function');

		$scope.modalContractFollowupViewCubeCompanyInstance = $modal.open({

			backdrop: 'static',

			animation: true,

			templateUrl: 'views/questionnaire/contractFollowupViewCubeCompanyModal.html',

			scope: $scope,

			controller: function ($scope, $sce,$modalInstance, spinnerService) {

				var searchContractFollowupViewCubeCompanyUrl = Session.getPropertiesEnvironment().searchContractFollowupViewCubeCompanyUrl;

				var firstTime = true;

				$scope.searchContractFollowupViewCubeCompanyUrl = $sce.trustAsResourceUrl(searchContractFollowupViewCubeCompanyUrl.replace('{0}',$scope.questionnaire.easyNumber).replace('{1}',ScenarioDataService.getBcContractRight().entityOrganizationId));

				$scope.stopSpinner = function() {

					if (firstTime) {

						spinnerService.hide('contractFollowupViewCubeCompanyModalSpinner');

						angular.element('#contractFollowupViewCubeCompanyModal').click();

						firstTime = false;

					}

				};

				$scope.close = function () {

					$modalInstance.dismiss('cancel');

				};
			},
			size: 'cube-width'
		});

		$scope.modalContractFollowupViewCubeCompanyInstance.result.finally(function () {
			QuestionnaireService.getKYCNotationInfo(localStorageService.get('caseId')).then(function(result) {
				if (result.data !== null ) {
					var kycInfo = result.data;

					$scope.questionnaire.companyKYC = kycInfo.kycScore;
					if(kycInfo.amlNotation != null) {
						$scope.questionnaire.companyAMLNotationRiskLevel = kycInfo.amlNotation + ' - ' + kycInfo.levelOfRisk;
					}
				}
			});
		});
	};

	/*
	 * Action "Get Role Reference Id" - open contractFollowupView to get the
	 * selected Role Reference Id
	 */
	$scope.getPartnerRoleReferenceId = function() {

		logger.debug('debug', 'Call open contractFollowupView function');

		$scope.modalContractFollowupViewInstance = $modal.open({

			backdrop: 'static',

			animation: true,

			templateUrl: 'views/questionnaire/partnerContractFollowupViewModal.html',

			scope: $scope,

			controller: function ($scope, $sce,$modalInstance, spinnerService) {

				var contractFollowupViewUrl = Session.getPropertiesEnvironment().searchPartnerContractFollowupViewUrl;
				contractFollowupViewUrl = contractFollowupViewUrl.replace('{0}',$scope.ScenarioDataService.getBcContractRight().entityOrganizationId).replace('%7B1%7D',localStorageService.get('caseId'));

				var firstTime = true;

				// defect #624 : Define correctly the organization provided to
				// CUBE in the different services
				$scope.contractFollowupViewUrl = $sce.trustAsResourceUrl(contractFollowupViewUrl);

				$scope.stopSpinner = function() {

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

	// This function is standby and will be reuse in a future sprint
// $scope.showRoleRefId = function (roleReferenceId,companyName) {
// $scope.questionnaire.partnerRoleReferenceId = roleReferenceId;
// $scope.questionnaire.partnerCompanyName = companyName;
// $scope.modalContractFollowupViewInstance.close();
// };

// $scope.getPartnerInfo = function () {
// if ($scope.questionnaire.cardIdInput) {
// QuestionnaireService.getPartnerInfo($scope.questionnaire.cardIdInput,localStorageService.get('caseId')).then(function(result)
// {
// if (result.data !== null ) {
// $scope.questionnaire.partnerRoleReferenceId = result.data.cardId;
// $scope.questionnaire.partnerCompanyName = result.data.companyName;
// $scope.questionnaireForm.additionalInformationSubForm['cardIdInput'].$setValidity('cardIdInput',
// true);
// }
// else {
// $scope.questionnaireForm.additionalInformationSubForm['cardIdInput'].$setValidity('cardIdInput',
// false);
// }

// });

// }
// else {
// $scope.questionnaireForm.additionalInformationSubForm['cardIdInput'].$setValidity('cardIdInput',
// true);
// }
// };

	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};
	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'yyyy-MM-dd', 'shortDate'];
	$scope.format = $scope.formats[2];
	$scope.statusDate = {
			debtorInvoiceDateY: false,
			debtorInvoiceDateY_1: false,
			debtorInvoiceDateY_2:false
	};

	$scope.openInvoiceDate = function (debtorInvoiceDate) {
		switch (debtorInvoiceDate) {
		case 'debtorInvoiceDateY':
			$scope.statusDate.debtorInvoiceDateY = true;
			break;
		case 'debtorInvoiceDateY_1':
			$scope.statusDate.debtorInvoiceDateY_1 = true;
			break;
		case 'debtorInvoiceDateY_2':
			$scope.statusDate.debtorInvoiceDateY_2 = true;
			break;
		}

	};

	$scope.addNewPartner = function(roleReferenceId) {
		$scope.questionnaire.partnerRoleReferenceId = roleReferenceId;
		$scope.questionnaire.oldPartnerRoleReferenceId = roleReferenceId;

		QuestionnaireService.getListPartners().then(function(result) {
			if (result.data !== null ) {
				$scope.questionnaire.partners = result.data;
			}
		});

		$scope.modalContractFollowupViewInstance.close();
	};

	// defect #451 : Offcover countries list
	$scope.checkOffCoverCountryForInsurableTurnover = function(insurableTurnover) {
		insurableTurnover.offCover = $scope.isOffCoverCountry(insurableTurnover.country);
	};

	$scope.isOffCoverCountry = function(isoCode) {
		var result = false;
		if(null != $scope.questionnaire.offCoverCountries && $scope.questionnaire.offCoverCountries.length > 0) {
			angular.forEach($scope.questionnaire.offCoverCountries, function(country) {
				if(isoCode == country) {
					result = true;
					return;
				}
			});
		}
		return result;
	};


	// defect #680 Button Request Quotation available in
	// Questionary-Complementary Info
	$scope.requestQuotation = function () {
		$scope.modalRequestQuotation = $modal.open({
			backdrop: 'static',
			animation: true,
			scope: $scope,
			templateUrl: 'views/common/modalRequestQuotation.html',
			controller: function ($scope, $modalInstance,QuoteService,PolicyResource,growl,DateService) {

				var defaultDelay = Session.getPropertiesEnvironment().defaultTaskDelayDays;
				$scope.taskPriorityThreshold = Session.getPropertiesEnvironment().taskPriorityThreshold;
				$scope.requestInProgress = false;
				$scope.requestQuoteComments = "";
				$scope.requestCompletionDueDate = DateService.addDaysToCurrentDate(defaultDelay,true);
				$scope.requestCompletionDueDays = defaultDelay;
				$scope.format = 'dd.MM.yyyy';
				$scope.statusDate = {
					 requestDateOpened: false
				};
				
				$scope.dateOptions = {
				          formatYear: 'yy',
				          startingDay: 1
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
			    	 $scope.requestCompletionDueDays = DateService.computeDiffDays(new Date(),(angular.copy($scope.requestCompletionDueDate)),true);
			     }

				$scope.submit = function (requestQuotationForm) {

					if (requestQuotationForm.$valid && !$scope.requestInProgress) {
						$scope.requestInProgress = true;
						growl.info('policy.request.quotation.in.progress.msg');

						$scope.requestQuoteDTO = {
								questionnaireDTO : $scope.questionnaire,
								comment : $scope.requestQuoteComments,
								completionDueDate : $scope.requestCompletionDueDate
						};

						QuoteService.requestQuotation($scope.requestQuoteDTO).then(function (response) {

							$scope.questionnaire.requestQuoteTaskId = response.data;
							$scope.checkQuestionnaireFieldsMandatory();

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

	/**
	 * Defect 680 : Update the request quotation when user changes the scenario
	 */
	$scope.$on(DIVERS_EVENTS.requestQuotationChanged, function (event, data) {
		$scope.questionnaire.requestQuoteTaskId = data.requestQuoteTaskId;
		$scope.questionnaire.pricingRight = data.pricingRight;
		$scope.questionnaire.quoteGenerated = data.quoteGenerated;

		$scope.checkQuestionnaireFieldsMandatory();

	});
	
	
	$scope.isCountryTurnoverDisabled = function(countryCode) {
		 return $filter('filter')($scope.questionnaire.specificQuestionnaire.insurableTurnovers,{"country": countryCode}).length > 0  ;
	}
	
	$scope.badDebitChanged =  function() {
		$scope.questionnaire.badDebedtModified = true;
	}
	
	$scope.shiftBadDebtsYearRef =  function() {
			$scope.shiftBadDebtsTurnovers();
			$scope.shiftBadDebtsLoss();
			$scope.questionnaire.referenceYearBadDebts =  $scope.newReferenceYearBadDebts;
			$scope.yearsList = [$scope.questionnaire.referenceYearBadDebts,$scope.questionnaire.referenceYearBadDebts-1,$scope.questionnaire.referenceYearBadDebts-2,$scope.questionnaire.referenceYearBadDebts-3];
			$scope.badDebtsExperienceChangeRefYear = true;
			
	}
	
	$scope.shiftBadDebtsTurnovers =  function() {
		$scope.shiftBadDebtsTurnoverYearRef();
		
		var domesticTurnoverPrefix = "domesticTurnover";
		var exportTurnoverPrefix = "exportTurnover";
		var y3Suffix = "Y_3";
		var y2Suffix = "Y_2";
		var y1Suffix = "Y_1";
			
		var badDebtsTurnoverColumnsDesc =  [
			
			[domesticTurnoverPrefix + y3Suffix, domesticTurnoverPrefix + y2Suffix, domesticTurnoverPrefix + y1Suffix, domesticTurnoverPrefix,$scope.questionnaire[domesticTurnoverPrefix]],
			[exportTurnoverPrefix + y3Suffix, exportTurnoverPrefix + y2Suffix, exportTurnoverPrefix + y1Suffix, exportTurnoverPrefix,$scope.questionnaire[exportTurnoverPrefix]]
			];
		$scope.shiftBadDebtsLossByColumns(badDebtsTurnoverColumnsDesc);
	}
	
	$scope.shiftBadDebtsTurnoverYearRef =  function() {
		$scope.referenceYearBadDebts = (+$scope.referenceYearBadDebts)+1;
	}
	
	$scope.shiftBadDebtsLoss =  function() {
		var unumberLossPrefix = "numberLoss";
		var unpaidInvoicePrefix = "unpaidInvoice";
		var recoveryPrefix = "recovery";
		var retainedLossPrefix = "retainedLoss";
		var numberRetainedLossPrefix = "numberRetainedLoss"
		var y3Suffix = "Y_3";
		var y2Suffix = "Y_2";
		var y1Suffix = "Y_1";
		var currentYearSuffix = "CurrentYear";
			
		var badDebtsLossColumnsDesc =  [
			[unumberLossPrefix + y3Suffix, unumberLossPrefix + y2Suffix, unumberLossPrefix + y1Suffix, unumberLossPrefix + currentYearSuffix,null],
			[unpaidInvoicePrefix + y3Suffix, unpaidInvoicePrefix + y2Suffix, unpaidInvoicePrefix + y1Suffix, unpaidInvoicePrefix + currentYearSuffix,null],
			[recoveryPrefix + y3Suffix, recoveryPrefix + y2Suffix, recoveryPrefix + y1Suffix, recoveryPrefix + currentYearSuffix,null],
			[retainedLossPrefix + y3Suffix, retainedLossPrefix + y2Suffix, retainedLossPrefix + y1Suffix, retainedLossPrefix + currentYearSuffix,null],
			[numberRetainedLossPrefix + y3Suffix, numberRetainedLossPrefix + y2Suffix, numberRetainedLossPrefix + y1Suffix, numberRetainedLossPrefix + currentYearSuffix,null]];
		$scope.shiftBadDebtsLossByColumns(badDebtsLossColumnsDesc);
		
	}
	
	$scope.shiftBadDebtsLossByColumns = function(columnsDesc) {
		angular.forEach(columnsDesc, function(columnDesc) {
			angular.forEach(columnDesc, function(value, key) {
				if(key < columnDesc.length-2){
					$scope.questionnaire[value] = parseInt($scope.questionnaireForm.badDebtorsSubForm[columnDesc[key+1]].$viewValue,10);
				}else if(key  == columnDesc.length-2){
					$scope.questionnaire[value] = columnDesc[key+1];
				}
			})
		})
	}
	
	
	$scope.isChangeBadDebtsReferenceYearEnabled = function(){
		return $scope.isReferenceYearBadDebtsChanged &&  $scope.questionnaire.specificQuestionnaire.badDebtsExperience && !$scope.badDebtsExperienceChangeRefYear;
	}
	
	
	/**
	 * Function is called when user change a scenario
	 */
	$scope.$on(DIVERS_EVENTS.scenarioQuestionnaireUpdated, function (event, data) {
		
		$scope.questionnaire = data;
		$scope.init();
		$scope.questionnaireForm.$setPristine();
		
	});
	
	// Init
	$scope.init();

}]);

'use strict';

angular.module('autonomyApp.policy', ['ngResource'])
.controller('PolicyController', ['$scope', '$rootScope', '$q', '$filter', 'PolicyResource', 'Session', 'AuthService', 'Logger', 'loadPolicy',
	'QuoteService', 'NomenclatureService', 'growl', '$state', 'spinnerService', 'DIVERS_EVENTS', 'DerogationService', 'ScenarioService', '$translate', '$modal', 'PolicyService','localStorageService','ScenarioDataService','$sce','SmartService','CountryService','$confirm','ExtensionAffiliateService','SalesDiscussionsDataService',
	'DateService',function ($scope, $rootScope, $q, $filter, PolicyResource, Session, AuthService, Logger, loadPolicy,
			QuoteService, NomenclatureService, growl, $state, spinnerService, DIVERS_EVENTS, DerogationService, ScenarioService, $translate, $modal, PolicyService,localStorageService,ScenarioDataService,$sce,SmartService,CountryService,$confirm,ExtensionAffiliateService,SalesDiscussionsDataService,DateService) {

	var logger = Logger.getInstance('PolicyController');

	$scope.policy = loadPolicy;

	// Put the derogationLevels object in DerogationService
	DerogationService.setDerogationLevels($scope.policy.derogationLevels);

	// Put the list of derogations in DerogationService. Will be used in
	// derogation directive
	DerogationService.setDerogations($scope.policy.derogation);

	$scope.searchCountry = '';
	$scope.searchServOptCountry = '';
	$scope.authService = AuthService;
	$scope.derogationService = DerogationService;
	$scope.ScenarioDataService = ScenarioDataService;

	$scope.initialArea1Countries = [];
	$scope.initialArea2Countries = [];
	$scope.initialArea3Countries = [];
	

	$scope.excludedCCO = {counter: 0, dragging: false, countries: []};
	$scope.excludedATCO = {counter: 0, dragging: false, countries: []};
	$scope.excludedATCH = {counter: 0, dragging: false, countries: []};
	
	$scope.user = Session.getUserManager();
	
	$scope.maxLiabilityCalculated = null;
	
	// defect 61:Cover Option : Extension to affiliate Option shall be activated
	$scope.maxNumberAffiliates = Session.getPropertiesEnvironment().policyMaxNumberAffiliates - 1;

	/**
	 * Get price zoning list
	 */
	$scope.getPriceZoning = function(){
		$scope.priceZonings = $scope.policy.priceZoningList[''+$scope.policy.domesticScope+$scope.policy.exportScope+$scope.policy.rates];
	}
	
	$scope.typeOfObject = function(value) {
		return typeof(value);
	};

	$scope.initSpecialClauses = function() {
		if($scope.policy.specialClauses != null) {
			$scope.jsonDynamicContent = $scope.policy.specialClauses.content;
			$scope.obsoleteOptions = $scope.policy.specialClauses.obsoleteOptions;

			$scope.specialClausesSelectedOptions = [];
			$scope.getSpecialClausesSelectedOptions($scope.jsonDynamicContent.data,null);
		}
	};

	$scope.getSpecialClausesSelectedOptions = function(items,parent) {
		angular.forEach(items, function(item) {
			angular.forEach(item, function(value,key) {
				var optionFullName = parent != null ? parent + '.' + key : key;
				var valueType = $scope.typeOfObject(value);
				switch (valueType) {
				case 'boolean':
					if(value === true) {
						$scope.specialClausesSelectedOptions.push(optionFullName);
					}
					break;

				case 'object':
					if(value.option === true && value.selected === true) {
						$scope.specialClausesSelectedOptions.push(optionFullName);
					}
					$scope.getSpecialClausesSelectedOptions(value.items,optionFullName);
				default:
					break;
				}
			});
		});
	};

	/* Defect998 : ML Reorganization +Warming */
	$scope.updateMaxLiabilityAmountFromMultiplier = function() {
		$scope.policy.maxLiabilityAmount = null;
			if( $scope.policy.maxLiabilityMultiple != null && $scope.policy.quotationSummary != null ) {
				
				if($scope.policy.quotationSummary.negotiatedExpectedPremium != null) {
					$scope.policy.maxLiabilityAmount = $scope.policy.maxLiabilityMultiple * $scope.policy.quotationSummary.negotiatedExpectedPremium;
				} else if( $scope.policy.quotationSummary.expectedPremium != null){
					$scope.policy.maxLiabilityAmount = $scope.policy.maxLiabilityMultiple * $scope.policy.quotationSummary.expectedPremium;
				}
			
			}

	};
	
	/* Defect998 : ML Reorganization +Warming */
	$scope.updateMaxLiabilityMultiplierFromAmount = function() {
		$scope.policy.maxLiabilityMultiple = null;
		
			if( $scope.policy.maxLiabilityAmount != null && $scope.policy.quotationSummary != null ) {
			
				if($scope.policy.quotationSummary.negotiatedExpectedPremium != null && $scope.policy.quotationSummary.negotiatedExpectedPremium != 0) {
					$scope.policy.maxLiabilityMultiple =Math.round( $scope.policy.maxLiabilityAmount / $scope.policy.quotationSummary.negotiatedExpectedPremium);
				} else if( $scope.policy.quotationSummary.expectedPremium != null && $scope.policy.quotationSummary.expectedPremium != 0 ){
					$scope.policy.maxLiabilityMultiple =Math.round( $scope.policy.maxLiabilityAmount / $scope.policy.quotationSummary.expectedPremium);
				}
				
			}
			
	};

	$scope.maxLiabilityDerogationVisible = function() {
		var ml = null;
		if($scope.policy.contractualMLBasis == 'FACT') {
			ml = $scope.maxLiabilityCalculated;
		} else {
			ml = $scope.policy.maxLiabilityAmount;
		}

		if(ml != null && ml != 'undefined' && $scope.policy.maxLiabilityThd != null && $scope.policy.maxLiabilityThd != 'undefined' && $scope.maxLiabilityCalculated < $scope.policy.maxLiabilityThd) {
			var derogation = $scope.policy.derogation.maxLiability;

			if(null != derogation && derogation != 'undefined' && ml >= derogation) {
				return false;
			}

			return true;
		}

		return false;

	};

	$scope.sortCoveredCountriesLists = function () {
		$scope.policy.area1.countries = $filter('atyOrderByTranslated')($scope.policy.area1.countries, 'country.');
		$scope.policy.area2.countries = $filter('atyOrderByTranslated')($scope.policy.area2.countries, 'country.');
		$scope.policy.area3.countries = $filter('atyOrderByTranslated')($scope.policy.area3.countries, 'country.');
		$scope.policy.areaExcluded.countries = $filter('atyOrderByTranslated')($scope.policy.areaExcluded.countries, 'country.');
	};

	$scope.sortServiceOptionCountriesLists = function () {
		$scope.policy.zoneCCO.countries = $filter('atyOrderByTranslated')($scope.policy.zoneCCO.countries, 'country.');
		$scope.policy.zoneATCO.countries = $filter('atyOrderByTranslated')($scope.policy.zoneATCO.countries, 'country.');
		$scope.policy.zoneATCH.countries = $filter('atyOrderByTranslated')($scope.policy.zoneATCH.countries, 'country.');
		$scope.policy.blindCoverCountriesList.countries = $filter('atyOrderByTranslated')($scope.policy.blindCoverCountriesList.countries, 'country.');
		$scope.policy.discretionaryCountriesList.countries = $filter('atyOrderByTranslated')($scope.policy.discretionaryCountriesList.countries, 'country.');

		$scope.excludedCCO.countries = $filter('atyOrderByTranslated')($scope.excludedCCO.countries, 'country.');
		$scope.excludedATCO.countries = $filter('atyOrderByTranslated')($scope.excludedATCO.countries, 'country.');
		$scope.excludedATCH.countries = $filter('atyOrderByTranslated')($scope.excludedATCH.countries, 'country.');
		$scope.policy.excludedBlindCoverCountriesList.countries = $filter('atyOrderByTranslated')($scope.policy.excludedBlindCoverCountriesList.countries, 'country.');
		$scope.policy.excludedDiscretionaryCountriesList.countries = $filter('atyOrderByTranslated')($scope.policy.excludedDiscretionaryCountriesList.countries, 'country.');


	};

	
	// END defect #446 : New Dynamic Block in Contract Terms for Special Clauses

	$scope.fragment = {
			'coverOption' : false,
			'risk' : false,
			'riskOption' : false,
			'indemnification' : false,
			'claimOption' : false,
			'serviceOption' : false,
			'activities' : false,
			'duration' : false
	};

	/**
	 * In order to improve the loading performance, the fragment is loaded one
	 * by one (IE problem fixed)
	 * 
	 */
	$rootScope.$on("$includeContentLoaded", function(event, templateName){

		switch(templateName) {
		case "views/policy/cover.html":
			$scope.fragment.coverOption = true;
			break;
		case "views/policy/coverOption.html":
			$scope.fragment.risk = true;
			break;
		case "views/policy/risk.html":
			$scope.fragment.riskOption = true;
			break;
		case "views/policy/riskOption.html":
			$scope.fragment.indemnification = true;
			break;
		case "views/policy/indemnification.html":
			$scope.fragment.claimOption = true;
			break;
		case "views/policy/claimOption.html":
			$scope.fragment.serviceOption = true;
			break;
		case "views/policy/serviceOption.html":
			$scope.fragment.activities = true;
			break;
		case "views/policy/activities.html":

			$scope.fragment.duration = true;
			break;

		}
	});
	
	

	// defect #377 :
	// defect 579 : FR feedback: Modificiation on Business Rule Check Max
	// Liability
	/*
	 * Evolution 2) : For ML Amount computation for Derogation ML AMount = ML
	 * Factor x Expected Annual Premium with Expected Annual Premium is the
	 * Negotiated Expected Premium if Negotiated values are Available else
	 * Expected Annual Premium is the Submitted Expected Premium (as currrently)
	 */
	$scope.getMaxLiabilityCalculated = function() {
		
		$scope.maxLiabilityCalculated = null;
		
		if ($scope.policy.contractualMLBasis === 'AMNT') {
			$scope.maxLiabilityCalculated = $scope.policy.maxLiabilityAmount;
			// Defect 998 : ML Reorganization +Warming
			$scope.updateMaxLiabilityMultiplierFromAmount();
		
		}else{
			// Defect 998 : ML Reorganization +Warming
			$scope.updateMaxLiabilityAmountFromMultiplier();
			if($scope.policy.maxLiabilityMultiple != null && $scope.policy.quotationSummary != null && $scope.policy.quotationSummary.expectedPremium != null) {
					
				if($scope.policy.quotationSummary.negotiatedExpectedPremium != null) {
					$scope.maxLiabilityCalculated = $scope.policy.maxLiabilityMultiple * $scope.policy.quotationSummary.negotiatedExpectedPremium;
				} else {
					$scope.maxLiabilityCalculated = $scope.policy.maxLiabilityMultiple * $scope.policy.quotationSummary.expectedPremium;
				}
			}	
		}

	};
		
	$scope.initServiceOptionCountries = function (option, coveredZone, notCoveredZone, allCountries, notCoveredCountriesGlobal) {
		if (coveredZone.countries.length == 0) {
			if (notCoveredCountriesGlobal) {
				coveredZone.countries = angular.copy($filter('atyExclusion')(allCountries, notCoveredCountriesGlobal.countries));
				notCoveredZone.countries = angular.copy($filter('atyExclusion')(allCountries, coveredZone.countries));
			}
			else {
				coveredZone.countries = angular.copy($filter('atyExclusion')(allCountries, []));
			}
		} else {
			notCoveredZone.countries = angular.copy($filter('atyExclusion')(allCountries, coveredZone.countries));
		}
	};
	

	$scope.computeInitialZoneCountries = function() {
		$scope.initialArea1Countries = [];
		$scope.initialArea2Countries = [];
		$scope.initialArea3Countries = [];

		angular.forEach($scope.policy.area1.countries, function (item) {
			$scope.initialArea1Countries.push(item.code);
		});
		angular.forEach($scope.policy.area2.countries, function (item) {
			$scope.initialArea2Countries.push(item.code);
		});
		angular.forEach($scope.policy.area3.countries, function (item) {
			$scope.initialArea3Countries.push(item.code);
		});
	};

	
	$scope.init = function(){
		
		$scope.getPriceZoning();
		
		ScenarioService.isReadOnly = $scope.policy.isReadOnly;

		DerogationService.policyId = $scope.policy.id;
		
		// Cover => Build Area
		// PolicyService.buildCountriesArea($scope.policy);
		
		// Defect #408
		// When a scenario is frozen (a contract was generated), modifying a
		// threshold in back-office might not impact this scenario
		DerogationService.validable = $scope.policy.validationDerogationRight;
		DerogationService.disabled = $scope.policy.derogationDisabled;

		$scope.computeInitialZoneCountries();
		
		$scope.getMaxLiabilityCalculated();
		
		$scope.sortCoveredCountriesLists();
		
		$scope.sortServiceOptionCountriesLists();
		
		$scope.initSpecialClauses();
		
		$scope.initServiceOptionCountries($scope.policy.productCcoOption, $scope.policy.zoneCCO, $scope.excludedCCO, $scope.policy.coveredCountriesList);
		$scope.initServiceOptionCountries($scope.policy.productAtCoOption, $scope.policy.zoneATCO, $scope.excludedATCO, $scope.policy.coveredCountriesList);
		$scope.initServiceOptionCountries($scope.policy.productAtChOption, $scope.policy.zoneATCH, $scope.excludedATCH, $scope.policy.coveredCountriesList);

		//$scope.initServiceOptionCountries(null, $scope.policy.discretionaryCountriesList, $scope.policy.excludedDiscretionaryCountriesList, $scope.policy.discretionaryAllCountriesList,$scope.policy.areaExcluded);
		//$scope.initServiceOptionCountries(null, $scope.policy.blindCoverCountriesList, $scope.excludedBlindCoverCountriesList, $scope.policy.blindCoverAllCountriesList,$scope.policy.areaExcluded);

		// Defect985 : Evolution : Create a new Discussions zone common to all
		// scenarios of a case -
		SalesDiscussionsDataService.setCommentsCount( $scope.policy.salesDiscussionsCount);
		
		if (!$scope.policy.isReadOnly && ($scope.policy.scenarioPricingObsolete)) {
			ScenarioDataService.setPricingObsolete(true);
		}
	}

	$scope.init();
	
	/**
	 * dnd-dragging determines what data gets serialized and send to the
	 * receiver of the drop. While we usually just send a single object, we send
	 * the array of all selected items here.
	 */
	$scope.getSelectedItemsIncluding = function (area, item) {
		if($scope.policy.isReadOnly) {
			return false;
		}

		item.selected = true;

		return area.countries.filter(function (item) {
			return item.selected;
		});
	};

	/**
	 * We set the list into dragging state, meaning the items that are being
	 * dragged are hidden. We also use the HTML5 API directly to set a custom
	 * image, since otherwise only the one item that the user actually dragged
	 * would be shown as drag image.
	 */
	$scope.onDragstart = function (area, event) {

		area.dragging = true;
		if (event.dataTransfer.setDragImage) {
			var img = new Image();
			img.src = 'images/draganddrop.png';
			event.dataTransfer.setDragImage(img, 0, 0);
		}
	};

	/**
	 * In the dnd-drop callback, we now have to handle the data array that we
	 * sent above. We handle the insertion into the list ourselves. By returning
	 * true, the dnd-list directive won't do the insertion itself.
	 */
	$scope.onDrop = function (area, items, index) {
		
		if($scope.policy.isReadOnly) {
			return false;
		}
		
		angular.forEach(items, function (item) {
			item.selected = false;
			
			if (area.areaNumber) {
				item.area = area.areaNumber;
			}
			
		});
		
		area.countries = area.countries.concat(items);
		area.countries = $filter('atyOrderByTranslated')(area.countries, 'country.');
		return true;
	};

	// Defect #797: Wrong countries exported to BC Contract about Discretionary
	// Limits
	$scope.isCountryExcludedInCover = function(country) {
		if (CountryService.inCountryList(country,$scope.policy.areaExcluded.countries)) {
			country.disabled = true;
			return true;
		}
		country.disabled = false;
		return false;
	};

	$scope.onSelected = function (area, country,event, checkNotCovered) {
		
		if($scope.policy.isReadOnly) {
			return false;
		}

		// defect #310 : Solution pour sélectionner tous les pays d une zone
		var element = event.target;
		if(element.nodeName.toLowerCase() != 'li') {
			while(element.nodeName.toLowerCase() != 'li') {
				element = element.parentNode;
			}
		}
		if (event.shiftKey) {
			// get one already selected row
			$(element).addClass('selected');
			var first = $(element).parent().find('.selected').first().index();
			var last = $(element).parent().find('.selected').last().index();

			// if we hold shift and try to select last element that is upper in
			// the list
			if (last < first) {
				var firstHolder = first;
				first = last;
				last = firstHolder;
			}

			if (first == -1 || last == -1) {
				return false;
			}

			// unselect all
			$(element).parent().find('.selected').removeClass('selected');

			var num = last - first;
			var x = first;
			for (var i=0;i<=num;i++) {
				var li = $(element).parent().find('> li').eq(x);
				angular.forEach(area.countries, function (item) {
					if(item.code == li.attr('iso') && item.code != $scope.policy.domesticCountry && (!checkNotCovered || (checkNotCovered && !$scope.isCountryExcludedInCover(item)))) {
						item.selected = true;
						$(li).addClass('selected');
					}
				});
				x++;
			}
		} else if (event.ctrlKey) {
			country.selected = !country.selected;
		} else {
			var selected = country.selected;
			$scope.unSelect(area);
			country.selected = !selected;
		}

		area.counter = countSelectedCountriesInZone(area);
	};

	$scope.unSelect = function (area) {
		if($scope.policy.isReadOnly) {
			return false;
		}
		angular.forEach(area.countries, function (country) {
			country.selected = false;
		});
		area.counter = 0;
	};

	var countSelectedCountriesInZone = function (area) {
		var result = 0;
		angular.forEach(area.countries, function (zCountry) {
			if (zCountry.selected) {
				result += 1;
			}
		});
		return result;
	};
	
	/*
	 * Last but not least, we have to remove the previously dragged items in the
	 * dnd-moved callback.
	 */
	$scope.onMoved = function (area,isBlindCoverOrDCL) {
		area.countries = area.countries.filter(function (item) {
			return !item.selected;
		});
		area.counter = countSelectedCountriesInZone(area);
		
		if (!isBlindCoverOrDCL) {
			$scope.updateBlindCoverAndDiscretionaryCountries();
		}
		
		$scope.policyForm.$setDirty();
	};

// $scope.policy = {
// firstInsPeriodFrom: null,
// firstInsPeriodTo: null
// };

	$scope.quoteButtonTooltip = '';
	$scope.buttonQuoteDisabled = null;
	$scope.pricingAccordionOpened = false;

	$scope.showPricingPlatformList = function() {
		return null != $scope.policy.pricingPlatformList && $scope.policy.pricingPlatformList.length > 0 && !$scope.policy.fileHasQuotation;
	};

	$scope.showFilePricingPlatform = function() {
		return null != $scope.policy.pricingPlatform && $scope.policy.fileHasQuotation;
	};

	/**
	 * Check if the user has the pricing right to call the service. Each user
	 * must have at least one pricing platform associated to the entity
	 */
	$scope.showPEPSRight = function() {
		return $scope.user.pepsAuthorized && null != $scope.policy.pricingPlatformList && $scope.policy.pricingPlatformList.length > 0;
	};

	$scope.showNegotiatedMargin = function() {
		return $scope.user.pepsAuthorized && null != $scope.policy.pricingPlatformList && $scope.policy.pricingPlatformList.length > 0 && $scope.policy.negotiatedMargin != null;
	};

	$scope.buttonPepsHidden = false;

	$scope.isButtonPepsHidden = function () {
		return ( $scope.buttonPepsHidden || $scope.policy.pricingProjectId == null || $scope.policy.pricingSimulationId == null || $scope.policy.quotationSummary == null);
	};

	$scope.save = function(callBack) {
		if ($scope.policy.isReadOnly) {
			if (callBack != null) {
				callBack();
			}
			return;
		}

		if ($scope.policyForm.$invalid) {
			$confirm(
					{title: 'form.invalid.title', text: 'form.invalid.text', okBtnLabel: 'ok.label'},
					{templateUrl: 'views/common/modalMessage.html'}
			);
		} else {
			/*
			 * Save the form
			 */
			logger.debug('debug', 'Save the policy');
			ScenarioDataService.saveInProgress = true;
			growl.info('policy.saving.msg');
			PolicyResource.update({policyId: $scope.policy.id}, $scope.policy).$promise.then(function () {
				ScenarioDataService.saveInProgress = false;
				if ($scope.policy.dataModified) {
					$scope.policy.scenarioPricingObsolete = true;
				}

				$scope.policyForm.$setPristine();
				if (callBack != null) {
					callBack();
				}

				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.policy.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
						SmartService.updateSmart().then(function(data){
							logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
						});
					}
				}

			}, updateError);
		}
	};

	$scope.submitForm = function (event, page) {
		if (event) {
			event.preventDefault();
		}

		if ($scope.policy.isReadOnly) {
			gotoPageProcess(page);
			return;
		}

		if ($scope.policyForm.$invalid) {
			$confirm(
					{title: 'form.invalid.title', text: 'form.invalid.text', okBtnLabel: 'ok.label'},
					{templateUrl: 'views/common/modalMessage.html'}
			);
			ScenarioDataService.saveInProgress = false;
		}
		// Only save if detected a modification
		else if ($scope.policyForm.$dirty){
			logger.debug('debug', 'Save the policy');

			growl.info('policy.saving.msg');

			PolicyResource.update({policyId: $scope.policy.id}, $scope.policy).$promise.then(function () {

				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.policy.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
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

	var gotoPageProcess = function(page) {
		ScenarioDataService.saveInProgress = false;
		if (angular.isDefined(page)) {
			if (page === 'app') {
				$state.go(page, {}, {reload: true});
			}
			else {
				// $state.go(page);
				$state.go(page,{ caseId: localStorageService.get('caseId'),scenarioId:localStorageService.get('scenarioId') });
			}
		}
		else {
			if ($scope.policy.dataModified) {
				$scope.policy.scenarioPricingObsolete = true;
			}

			$scope.computeInitialZoneCountries();
			$scope.policyForm.$setPristine();
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
					if (angular.isObject($scope.policyForm[subFormName][errorField.field])) {
						$scope.policyForm[subFormName][errorField.field].$setValidity(errorField.errorType, false);
					}
				});
			});
		}
	};

	$scope.quote = function () {
		spinnerService.show('quoteSpinner');

		QuoteService.getQuote($scope.policy)
		.then(function (data) {
			$scope.policy = data;
			// defect #203
			// $scope.policy.maxLiabilityMultiple =
			// Math.round($scope.policy.maxLiabilityAmount /
			// $scope.policy.quotationSummary.minimumPremium);
			// defect #109
			$scope.policy.depositAmount = Math.round($scope.policy.quotationSummary.expectedPremium / 4);
			$scope.policy.depositAmountThd = $scope.policy.depositAmount;
			// defect #339 :GMD - Autonomy - French Test Feedback:Cover of
			// Existing Debts Option - Rate Option
			$scope.updateExistingDebtsRateFromPricing();
			// defect #377 : Business Rule Check Max Liability against Max
			// Outstanding and Buyer STudy
			$scope.getMaxLiabilityCalculated();			
			
			/*
			 * Defect 949 : New derogation rules for ECL and other discretionary
			 * limits
			 */
			$scope.updateDynamicInputDerogationAfterRequote();
			// $scope.policyForm.$setPristine();
			$scope.policyForm.$setDirty();
			$scope.policy.dataModified = false;
			$scope.policy.scenarioPricingObsolete = false;
			$scope.policy.fileHasQuotation = true;
			ScenarioDataService.setPricingObsolete(false);

			// defect #688 : FR Feedback: Prorata Minimum Premiumdefect #688
			$scope.computeMinPremiumProrated();

			growl.info('policy.saving.msg');
			PolicyResource.update({policyId: $scope.policy.id}, $scope.policy).$promise.then(function () {
				/**
				 * Defect #21: Interactions with SMART - Update Sales Funnel
				 */
				if (Session.getPropertiesEnvironment().updateSmart) {
					if ($scope.policy.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
						SmartService.updateSmart().then(function(data){
							logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
						});
					}
				}
				$scope.policyForm.$setPristine();
			}, updateError);
		})
		.finally(function () {
			spinnerService.hide('quoteSpinner');
		});
	};

	$scope.initDepositAmount = function() {
		if($scope.policy.reportingPeriod == 'QU') {
			if($scope.policy.quotationSummary != null && $scope.policy.quotationSummary.expectedPremium != null) {
				$scope.policy.depositAmount = Math.round($scope.policy.quotationSummary.expectedPremium / 4);
				$scope.policy.depositAmountThd = $scope.policy.depositAmount;
				$scope.policyForm.$setDirty();
			}
		}
	};

	$scope.updateExistingDebtsRateFromPricing = function() {
		if($scope.policy.coverExistDebtOption == 'RATE' && $scope.policy.existDebtPremRate == null && $scope.policy.quotationSummary != null && $scope.policy.quotationSummary.globalRate != null) {
			$scope.policy.existDebtPremRate = $scope.policy.quotationSummary.globalRate;
			$scope.policyForm.$setDirty();
		}
	};

	$scope.checkNegotiated = function () {
		if($scope.policy.pricingProjectId != null && $scope.policy.pricingProjectId != '' && $scope.policy.pricingSimulationId != null && $scope.policy.pricingSimulationId != '') {
			spinnerService.show('quoteSpinner');

			QuoteService.checkNegotiated($scope.policy.id)
			.then(function (response) {
				if(null != response.data && response.data.negotiatedExpectedPremium != null) {
					$scope.policy.quotationSummary = response.data;
					$scope.policy.negotiatedMargin = $scope.policy.quotationSummary.negotiatedMargin;
					$scope.policy.negotiatedMinPremiumRate = $scope.policy.quotationSummary.negotiatedMinPremiumRate;

					/**
					 * Defect #21: Interactions with SMART - Update Sales Funnel
					 */
					if (response.data.negotiated) {
						if (Session.getPropertiesEnvironment().updateSmart) {
							if ($scope.policy.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
								SmartService.updateSmart().then(function (data) {
									logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
								});
							}
						}
					}

					// defect 714 : Possibility to change Notification Threshold
					if ($scope.policy.negotiatedMinPremiumRate) {
						$scope.policy.pricingNegociated = true;
					}
					// defect #579 : FR feedback: Modificiation on Business Rule
					// Check Max Liability
					$scope.getMaxLiabilityCalculated();
					// defect #688 : FR Feedback: Prorata Minimum Premiumdefect
					// #688
					$scope.computeMinPremiumProrated();					
					/*
					 * Defect 949 : New derogation rules for ECL and other
					 * discretionary limits
					 */
					$scope.updateDynamicInputDerogationAfterRequote();
					// defect #965 : Price obsolescence and Negotiation
					// Consistency
					if($scope.user.hasSupersedeNegotiationRight) {
						$scope.policy.isNegotiationReadOnly = true;
					} else {
						$scope.policy.isReadOnly = true;
					}

					$scope.checkQuoteAndRequestQuoteBtn();
				}
			})
			.finally(function () {
				spinnerService.hide('quoteSpinner');
			});
		}
	};

	$scope.isDeductibleEEL = function () {
		return angular.equals($scope.policy.deductible, 'EEL');
	};

	$scope.isDeductibleMNR = function () {
		return angular.equals($scope.policy.deductible, 'MNR');
	};

	$scope.isDeductibleNQL = function () {
		return angular.equals($scope.policy.deductible, 'NQL');
	};

	$scope.isBonusSelected = function () {
		return angular.equals($scope.policy.bonusOption, 'BONUS');
	};

	$scope.isMalusSelected = function () {
		return angular.equals($scope.policy.malusOption, 'true');
	};

	$scope.isPreshipmentSelected = function () {
		return angular.equals($scope.policy.preshipmentOption, 'MA') ||
		angular.equals($scope.policy.preshipmentOption, 'SATA') ||
		angular.equals($scope.policy.preshipmentOption, 'CONS');
	};

	// defect #195 : Improvement of Preshipment option for Construction
	$scope.isPreshipmentConstructionSelected = function () {
		return angular.equals($scope.policy.preshipmentOption, 'CONS');
	};

	$scope.isDCLSelfUnderWritingSelected = function () {
		return angular.equals($scope.policy.dclSelfUnderWritingOption, 'STE') ||
		angular.equals($scope.policy.dclSelfUnderWritingOption, 'CMP') ||
		angular.equals($scope.policy.dclSelfUnderWritingOption, 'CMPCZ');
	};

	$scope.isCoverExistDebtRateOptionSelected = function () {
		return angular.equals($scope.policy.coverExistDebtOption, 'RATE');
	};

	$scope.isCoverExistDebtFlatOptionSelected = function () {
		return angular.equals($scope.policy.coverExistDebtOption, 'FLAT');
	};

	$scope.isDeclarationBasisTurnoverSelected = function () {
		return angular.equals($scope.policy.declarationBasis, 'TO');
	};

	$scope.isDeclarationBasisOutstandingSelected = function () {
		return angular.equals($scope.policy.declarationBasis, 'OS');
	};

	$scope.isDeclarationBasisCreditLimitSelected = function () {
		return angular.equals($scope.policy.declarationBasis, 'CL');
	};

	$scope.$watch('pricingAccordionOpened', function (isOpen) {
		if (isOpen) {
			$scope.checkQuoteAndRequestQuoteBtn();
		}
	});

	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};

	$scope.adjustFirstInsPeriodTo = function() {
		var newEndDate = angular.copy($scope.policy.firstInsPeriodFrom);
		newEndDate.setFullYear(newEndDate.getFullYear() + 1);
		$scope.policy.firstInsPeriodTo = newEndDate -1 ;// defect1064:Duration
														// period_Ending Date
		$scope.computeMinPremiumProrated();
		$scope.policyForm.$setDirty();
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'yyyy-MM-dd', 'shortDate'];
	$scope.format = $scope.formats[2];

	$scope.statusDate = {
			firstInsPeriodFromOpened: false,
			firstInsPeriodToOpened: false,
			dclSelfUnderWritingProcedureDateOpened: false // defect 690 : FR
															// Feedback: Add
															// "Credit Manager
															// Contact" and
															// "Procedure date"
	};

	$scope.openFirstInsPeriodFrom = function () {
		$scope.statusDate.firstInsPeriodFromOpened = true;
	};

	$scope.openFirstInsPeriodTo = function () {
		$scope.statusDate.firstInsPeriodToOpened = true;
	};

	$scope.openDclSelfUnderWritingProcedureDate = function () {
		$scope.statusDate.dclSelfUnderWritingProcedureDateOpened = true;
	};

	$scope.checkQuoteAndRequestQuoteBtn = function () {
		$scope.quoteButtonTooltip = '';

		if ($scope.policy.isReadOnly) {
			if ($scope.policy.fileTransferredToGCC) {
				// Defect #809: Impossible to price a nex scenario created from
				// an already priced scenario
				$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('policy.quote.file.transferred.tooltip'));
			} else if ($scope.policy.nbiOrContractGenerated) {
				$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('policy.quote.contract.downloaded.tooltip'));
			} else if ($scope.policy.derogationWorkflowStopped) {
				$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('proposal.derogation.process.stopped.tooltip'));
			} else if ($scope.policy.derogationWorkflowFinished) {
				$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('proposal.derogation.process.final.validation.tooltip'));
			}
			else {
				$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('policy.quote.price.negotiated.tooltip'));
			}

			return;
		}

		if (!$scope.showPEPSRight()) {
			$scope.buttonPepsHidden = true;
			// Defect #477
			if ($scope.policy.requestQuoteTaskId != null) {
				$scope.quoteButtonTooltip = $sce.trustAsHtml(($scope.policy.quotationSummary != null && $scope.policy.quotationSummary.negotiatedMinimumPremium != null)
						? $translate.instant('policy.quote.price.negotiated.tooltip') : $translate.instant('policy.quote.request.in.progress.tooltip'));
				return;
			}
		}

		if($scope.policy.initialScenarioValidated) {
			$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('scenario.validated.tooltip'));
			return;
		}

		// defect #656 : Error Tooltip on Negotiated Scenario
		if ($scope.policy.quotationSummary != null && $scope.policy.quotationSummary.negotiatedMinimumPremium != null) {
			$scope.quoteButtonTooltip = $sce.trustAsHtml($translate.instant('policy.quote.price.negotiated.tooltip'));
			$scope.buttonQuoteDisabled = true;
			return;
		}

		var fieldsMandatory = QuoteService.checkValues($scope.policy,$scope.user.pepsAuthorized);
		$scope.buttonQuoteDisabled = fieldsMandatory.buttonDisable;

		if (fieldsMandatory.buttonDisable) {

			var fieldMadatoryContent = '<div class="col-sm-12"><div class="form-group"><label>' + $translate.instant('policy.quote.mandatory.fields.tooltip') + '</label></div>';
			if (fieldsMandatory.fieldsMandatoryQuestionnaire !== null && fieldsMandatory.fieldsMandatoryQuestionnaire.length > 0) {
				fieldMadatoryContent += '<div class="form-group">';
				fieldMadatoryContent += '<p>' + $translate.instant('questionnaire.mandatory.field.label') + '</p>';
				fieldMadatoryContent += '<ul>';

				angular.forEach(fieldsMandatory.fieldsMandatoryQuestionnaire, function(item) {
					fieldMadatoryContent += '<li>' + $translate.instant(item) + '</li>';
				});

				fieldMadatoryContent += '</ul></div>';
			}

			if (fieldsMandatory.fieldsMandatoryPolicy !== null && fieldsMandatory.fieldsMandatoryPolicy.length > 0) {
				fieldMadatoryContent += '<div class="form-group">';
				fieldMadatoryContent += '<p>' + $translate.instant('policy.mandatory.field.label') + '</p>';
				fieldMadatoryContent += '<ul>';

				angular.forEach(fieldsMandatory.fieldsMandatoryPolicy, function(item) {
					fieldMadatoryContent += '<li>' + $translate.instant(item) + '</li>';
				});

				fieldMadatoryContent += '</ul></div></div>';
			}
			$scope.quoteButtonTooltip = $sce.trustAsHtml(fieldMadatoryContent);
		}

	};

	/**
	 * Check if the data is modified after the quote is computed.
	 */

	$scope.policyFormModified = $scope.$watch('policyForm.modified', function (newVal, oldVal) {
		$scope.onFormModified(newVal, oldVal);
	});

	$scope.policyZoneDomModified = $scope.$watchCollection('policy.area1.countries', function (newVal, oldVal) {
		$scope.policyZoneCountriesChangedHandle(newVal,oldVal,$scope.initialArea1Countries);
	});
	$scope.policyZone1Modified = $scope.$watchCollection('policy.area2.countries', function (newVal, oldVal) {
		$scope.policyZoneCountriesChangedHandle(newVal,oldVal,$scope.initialArea2Countries);
	});
	$scope.policyZone2Modified = $scope.$watchCollection('policy.area3.countries', function (newVal, oldVal) {
		$scope.policyZoneCountriesChangedHandle(newVal,oldVal,$scope.initialArea3Countries);
	});

	$scope.policyZoneCountriesChangedHandle = function(newVal,oldVal,initialCountriesList) {
		if(newVal.length != initialCountriesList.length) {
			$scope.onFormModified(true, false);
		} else {
			var result = [];
			angular.forEach(newVal, function (item1) {
				var isIn = false;
				angular.forEach(initialCountriesList, function (item2) {
					if (item1.code === item2) {
						isIn = true;
						return;
					}
				});
				if (!isIn) {
					result.push(item1);
				}
			});
			if(result.length > 0) {
				$scope.onFormModified(true, false);
			}
		}
	};


	$scope.onFormModified = function (newVal, oldVal) {
		if ($scope.policy.changePolicy == false) {
			if (!$scope.policy.scenarioPricingObsolete && $scope.policy.quotationSummary != null && $scope.policy.quotationSummary.expectedPremium != null) {
				ScenarioDataService.setPricingObsolete(newVal);
				$scope.policy.dataModified = newVal;
				$scope.computeMinPremiumProrated();
			}
		}
		else {
			$scope.policy.changePolicy = false;
		}
	};

	/**
	 * Check to show/hide derogation icon in accordion header
	 */
	$scope.checkDerogation = function (eltId) {

		var nbPending = $('#' + eltId).parents('.content-accordion').find('.panel-body .btn-derogation.visible.pending').size();

		// var pendingDerogation = $('#' +
		// eltId).parents('.content-accordion').find('.panel-body
		// .btn-derogation.visible.pending');

		var nbValidated = $('#' + eltId).parents('.content-accordion').find('.panel-body .btn-derogation.visible.validated').size();
		var result = '';
		if (nbPending > 0 || nbValidated > 0) {
			if (nbPending > 0) {
				result += 'pending';
				var myEl = angular.element( document.querySelector( '#'+eltId ) );
				myEl.addClass('pending');

			} else if (nbValidated > 0) {
				result += 'validated';
			}
		}

		return result;
	};

	$scope.isFlexibleWaitingPeriodTableVisible = function () {
		if ($scope.policy.waitingPeriodAfterNOA == null || $scope.policy.waitingPeriodAfterNOA == '') {
			$scope.policy.flexWaitingPeriod = false;
			return false;
		}

		if ($scope.policy.claimOptFlexWaitingPeriodTableComputed != null && $scope.policy.waitingPeriodAfterNOA <= $scope.policy.claimOptFlexWaitingPeriodTableComputed) {
			$scope.policy.flexWaitingPeriod = false;
			return false;
		}

		if ($scope.policy.flexWaitingPeriod) {
			return true;
		} else {
			return false;
		}
	};

	$scope.openPepsView = function () {
		logger.debug('debug', 'Call open pepsView function');
		$scope.modalPepsViewInstance = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/policy/pepsViewModal.html',
			scope: $scope,
			controller: function ($scope, $sce, $modalInstance, spinnerService) {
				var pepsViewUrl = Session.getPropertiesEnvironment().policyPepsViewUrl;
				var firstTime = true;
				$scope.pepsViewUrl = $sce.trustAsResourceUrl(pepsViewUrl.replace('{0}', $scope.policy.pricingSimulationId).replace('{1}', $scope.policy.pricingProjectId));

				$scope.stopSpinner = function () {
					if (firstTime) {
						spinnerService.hide('pepsViewModalSpinner');
						angular.element('#pepsViewModal').click();
						firstTime = false;
					}
				};
				$scope.close = function () {
					$modalInstance.dismiss('cancel');
				};
			},
			size: 'peps-width'
		});

		// defect #290 : Améliorer la récupération automatique du prix négocié
		// dans PEPS
		$scope.modalPepsViewInstance.result.finally(function () {
			// defect #769: Error Scenario Frozen - PEPS prices shall not be
			// updated
			if (!$scope.policy.isReadOnly) {
				$scope.checkNegotiated();
			}
		});
	};

	$scope.openCalculator = function() {
		$scope.modalCalculatorViewInstance = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/policy/calculatorModal.html',
			controller: 'CalculatorController',
			resolve: {
				policy: function () {
					return $scope.policy;
				}
			},
			size: 'peps-width'
		});

		$scope.modalCalculatorViewInstance.result.finally(function () {
			$scope.policyForm.$setDirty();
		});
	};

	// handle when covered country is moved to uncoveredCountries zone.
	// if covered countries list is empty (manually by user with drag&drop), set
	// option to false
	$scope.serviceOptionCoveredCountryMovedHandle = function (optionName, option, area) {
		if (null != area && null != area.countries && area.countries.length == 0 && null != option && option == true) {
			if (optionName == 'CCO') {
				$scope.policy.productCcoOption = false;
			}
			if (optionName == 'ATCO') {
				$scope.policy.productAtCoOption = false;
			}
			if (optionName == 'ATCH') {
				$scope.policy.productAtChOption = false;
			}
			if (optionName == 'BCC') {
				$scope.policy.blindCover = false;
			}
			if (optionName == 'DCL') {
				$scope.policy.discretionaryCreditLimit = false;
			}

			$scope.policyForm.$setDirty();
		}
	};

	// defect #226


	// events listeners

	/**
	 * Function is called when user change a scenario
	 */
	$scope.$on(DIVERS_EVENTS.scenarioPolicyUpdated, function (event, data) {
		$scope.policy = data;
		// Put the derogationLevels object in DerogationService
		DerogationService.setDerogationLevels($scope.policy.derogationLevels);
		DerogationService.setDerogations($scope.policy.derogation);

		$scope.initSpecialClauses();
		$scope.computeInitialZoneCountries();
		DerogationService.disabled = $scope.policy.derogationDisabled;
		$scope.policyForm.$setPristine();

		$scope.initServiceOptionCountries($scope.policy.productCcoOption, $scope.policy.zoneCCO, $scope.excludedCCO, $scope.policy.coveredCountriesList);
		$scope.initServiceOptionCountries($scope.policy.productAtCoOption, $scope.policy.zoneATCO, $scope.excludedATCO, $scope.policy.coveredCountriesList);
		$scope.initServiceOptionCountries($scope.policy.productAtChOption, $scope.policy.zoneATCH, $scope.excludedATCH, $scope.policy.coveredCountriesList);
		//$scope.initServiceOptionCountries(null, $scope.policy.discretionaryCountriesList, $scope.policy.excludedDiscretionaryCountriesList, $scope.policy.discretionaryAllCountriesList,$scope.policy.areaExcluded);
		//$scope.initServiceOptionCountries(null, $scope.policy.blindCoverCountriesList, $scope.excludedBlindCoverCountriesList, $scope.policy.blindCoverAllCountriesList,$scope.policy.areaExcluded);

		$scope.sortServiceOptionCountriesLists();

		$scope.checkQuoteAndRequestQuoteBtn();
		$scope.computeMinPremiumProrated();
		$scope.getMaxLiabilityCalculated();
		$scope.getPriceZoning();
	});

	$rootScope.$on('$translateChangeSuccess', function () {
		$scope.sortCoveredCountriesLists();
		$scope.sortServiceOptionCountriesLists();
	});

	$scope.checkActiveMalus = function() {
		if(!angular.equals($scope.policy.bonusOption, 'NONE')) {
			$scope.policy.malusOption = true;
			$scope.policyForm.$setDirty();
		}
	};


	
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
								policyDTO : $scope.policy,
								comment : $scope.requestQuoteComments,
								completionDueDate : $scope.requestCompletionDueDate,
								requestQuotationFromPolicyPage : true
						};

						QuoteService.requestQuotation($scope.requestQuoteDTO).then(function (response) {

							$scope.policy.requestQuoteTaskId = response.data;
							$scope.checkQuoteAndRequestQuoteBtn();
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


	$scope.isJsonDynamicContentReadOnly = function() {
		return $scope.policy.isReadOnly;
	};

	// defect #688 : FR Feedback: Prorata Minimum Premium
	$scope.isMinPremiumProratedVisible = false;

	// defect #798 FR Feedback-For policy period greater than 12 months
	$scope.periodInMonth = null;

	$scope.computeMinPremiumProrated = function() {

		var diff = Math.round(($scope.policy.firstInsPeriodTo - $scope.policy.firstInsPeriodFrom)/(1000*60*60*24*30));
		$scope.periodInMonth = diff != 12 ? diff: null;

		if($scope.policy.quotationSummary != null && $scope.policy.quotationSummary.minimumPremium != null) {
			if(diff != 12) {

				$scope.isMinPremiumProratedVisible = true;
				if(!ScenarioDataService.getPricingObsolete()) {
					var mp = (null != $scope.policy.quotationSummary.negotiatedMinimumPremium) ? $scope.policy.quotationSummary.negotiatedMinimumPremium : $scope.policy.quotationSummary.minimumPremium;
					$scope.policy.minPremiumProrated = Math.round((mp*diff)/12);
				} else {
					$scope.policy.minPremiumProrated = null;
				}
			} else {
				$scope.isMinPremiumProratedVisible = false;
				$scope.policy.minPremiumProrated = null;
			}
		} else {
			$scope.isMinPremiumProratedVisible = false;
			$scope.policy.minPremiumProrated = null;
		}
	};

	// START defect #732 : Malus - Bonus Improvment
	$scope.toggleExpandCollapseClass = function(event) {
		$(event.target).toggleClass('fa-plus-square-o fa-minus-square-o');
	};

	$scope.bonusExpanded = false;
	$scope.malusExpanded = false;

	$scope.toogleBonus = function() {
		$scope.bonusExpanded = !$scope.bonusExpanded;
	};

	$scope.toogleMalus = function() {
		$scope.malusExpanded = !$scope.malusExpanded;
	};

	$scope.getMalusLimitLabel = function(limitValue) {
		if(limitValue != null && limitValue == 999) {
			return $translate.instant('malus.above.limit.label');
		}

		return limitValue + '%';
	};
	// END defect #732 : Malus - Bonus Improvment

	$scope.$on('$viewContentLoaded', function() {
		$scope.computeMinPremiumProrated();
	});
	
	// defect 975 GUI modification for "Activitity declaration and Premium
	// payment" chapter - Integration of premium payment clauses
	/**
	 * Get the reporting period list depending on the invoicing scheme value.
	 * Adjustment period has to be greater or equal than the reporting period.
	 */
	$scope.getPeriodOptionsDisabled = function() {
		if ($scope.policy.invoicingScheme === 'AAD') { // AAD for Actual
														// activity declaration
			
			angular.forEach($scope.policy.reportingPeriodSelectOptions, function (value, key) {
                
				if (value.code === 'SE' || value.code === 'AN') {
                	value.disabled = true;
                }
				
            });
			
			if ($scope.policy.reportingPeriod === 'SE'|| $scope.policy.reportingPeriod === 'AN') {
				$scope.policy.reportingPeriod = 'MO';
			}
			
			if ($scope.policy.dra > 2) {
				
				$scope.policy.paimentPeriod = $scope.policy.reportingPeriod;
				
				angular.forEach($scope.policy.paimentPeriodsSelectOptions, function (value, key) {
	                
                	value.disabled = value.code !== $scope.policy.paimentPeriod;
	            });
			}
			
		}else { // APA (Advance payment with adjustment) Option
			
			angular.forEach($scope.policy.reportingPeriodSelectOptions, function (reportingPeriodValue, reportingPeriodKey) {
                
				if (reportingPeriodValue.code === 'SE' || reportingPeriodValue.code === 'AN') {
					reportingPeriodValue.disabled = false;
                }			
				
            });
			
			// adjustment period has to be greater or equal than the reporting
			// period
			
			// get the ordinal
			var reportingPeriodOrdinal = 0;
			var adjustmentPeriodOrdinal = 0;
			angular.forEach($scope.policy.adjustmentPeriodSelectOptions, function (adjustmentPeriodValue, adjustmentPeriodKey) {
				if (adjustmentPeriodValue.code === $scope.policy.reportingPeriod) {
					reportingPeriodOrdinal = adjustmentPeriodValue.ordinal;
				}
				if (adjustmentPeriodValue.code === $scope.policy.adjustmentPeriod) {
					adjustmentPeriodOrdinal = adjustmentPeriodValue.ordinal;
				}
			});
			
			if (adjustmentPeriodOrdinal < reportingPeriodOrdinal) {
				$scope.policy.adjustmentPeriod = $scope.policy.reportingPeriod;
			}
			
			// Disable the adjustmentPeriod options
			angular.forEach($scope.policy.adjustmentPeriodSelectOptions, function (adjustmentPeriodValue, adjustmentPeriodKey) {
				
				adjustmentPeriodValue.disabled = adjustmentPeriodValue.ordinal < reportingPeriodOrdinal;
				
			});
			
			if ($scope.policy.dra > 2) {				
				
				angular.forEach($scope.policy.paimentPeriodsSelectOptions, function (value, key) {
	                
                	value.disabled = false;
	            });
			}
			
			
		}
		
	}
	
	$scope.computeBlindCoverPercent = function() {
		
		if ($scope.policy.quotationSummary.negotiatedMinimumPremium && $scope.policy.blindCoverDCLLimit) {
			$scope.policy.blindCoverPercent =  Math.round($scope.policy.blindCoverDCLLimit*100/$scope.policy.quotationSummary.negotiatedMinimumPremium);
			console.log("blindCoverPercent negotiated : "+$scope.policy.blindCoverPercent);
			
			$scope.policyForm.$setPristine();
		} else if ($scope.policy.quotationSummary.minimumPremium && $scope.policy.blindCoverDCLLimit) {
			$scope.policy.blindCoverPercent =  Math.round($scope.policy.blindCoverDCLLimit*100/$scope.policy.quotationSummary.minimumPremium);
			console.log("blindCoverPercent : "+$scope.policy.blindCoverPercent);
			
			$scope.policyForm.$setPristine();
		}
	};
	
	
	
	$scope.removeMaximumLiabilityBuyer = function(maximumLiabilityBuyer) {

		// Enable the option in select list
		angular.forEach($scope.policy.maximumLiabilityBuyerRefs, function (value, key) {
			
			if (value.easyNumber === maximumLiabilityBuyer.easyNumber && value.amount === maximumLiabilityBuyer.agreedAmount) {
				value.disabled = false;
			}
			
		});
		
		// Delete object in select list
		var index = $scope.policy.maximumLiabilityBuyers.indexOf(maximumLiabilityBuyer);
		$scope.policy.maximumLiabilityBuyers.splice(index, 1);
		// Set policy form to dirty manually in order to save the form
		$scope.policyForm.$setDirty();
	};
	
	$scope.addMaximumLiabilityBuyer = function() {
		if ($scope.policy.maximumLiabilityBuyerRefSelected) {
			
			$scope.newMaximumLiabilityBuyer = {};
			$scope.newMaximumLiabilityBuyer['easyNumber'] = $scope.policy.maximumLiabilityBuyerRefSelected.easyNumber; 
			$scope.newMaximumLiabilityBuyer['companyName'] = $scope.policy.maximumLiabilityBuyerRefSelected.companyName;
			$scope.newMaximumLiabilityBuyer['agreedAmount'] = $scope.policy.maximumLiabilityBuyerRefSelected.amount;
			$scope.newMaximumLiabilityBuyer['currency'] = $scope.policy.contractCurrency;			
			$scope.newMaximumLiabilityBuyer['amount'] = null;
			
			$scope.policy.maximumLiabilityBuyers.push($scope.newMaximumLiabilityBuyer);
			$scope.policy.maximumLiabilityBuyerRefSelected.disabled = true;
		}
	};
	
	// defect 61:Cover Option : Extension to affiliate Option shall be activated
	$scope.removeAffiliate = function (roleRef) {
		
		spinnerService.show('extensionAffiliateSpinner');
		ExtensionAffiliateService.deleteExtensionAffiliate(localStorageService.get('caseId'),$scope.policy.id,roleRef)
		.then(function (response) {
			if(null != response.data ) {
				
				$scope.policy.affiliates = $filter('filter')($scope.policy.affiliates, {"roleRef": "!"+roleRef });
			}
		})
		.finally(function () {
			spinnerService.hide('extensionAffiliateSpinner');
		});
		
		
	};

	$scope.addAffiliate = function () {
		$scope.openCubeViewToSearchAffiliate();
		
	};

	
	/*
	 * Action "Get Role Reference Id" - open contractFollowupView to get the
	 * selected Role Reference Id
	 */
	$scope.openCubeViewToSearchAffiliate = function() {

		logger.debug('debug', 'openCubeViewToSearchAffiliate');

		$scope.affiliateFromCubeViewModalInstance = $modal.open({

			backdrop: 'static',

			animation: true,

			templateUrl: 'views/policy/affiliateFromCubeViewModal.html',

			scope: $scope,

			controller: function ($scope, $sce,$modalInstance, spinnerService) {

				var serachAffiliateFromCubeViewUrl = Session.getPropertiesEnvironment().searchAffiliateFromCubeViewUrl;
				serachAffiliateFromCubeViewUrl = serachAffiliateFromCubeViewUrl.replace('{0}',$scope.ScenarioDataService.getBcContractRight().entityOrganizationId).replace('%7B1%7D',localStorageService.get('caseId')).replace('%7B2%7D',$scope.policy.id);

				var firstTime = true;

				// defect #624 : Define correctly the organization provided to
				// CUBE in the different services
				$scope.serachAffiliateFromCubeViewUrl = $sce.trustAsResourceUrl(serachAffiliateFromCubeViewUrl);

				$scope.stopSpinner = function() {

					if (firstTime) {

						spinnerService.hide('affiliateFromCubeViewModalSpinner');

						angular.element('#affiliateFromCubeViewModal').click();

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
	
	
	$scope.addOrUpdateAffiliate = function(roleRef,companyName,city){
		$scope.affiliateFromCubeViewModalInstance.close();
		var filteredAffiliates = $filter('filter')($scope.policy.affiliates,{"roleRef": roleRef}) 
		if(filteredAffiliates.length >0 ){
			filteredAffiliates[0].companyName=companyName;
			filteredAffiliates[0].city=city;
		}else{
			$scope.policy.affiliates.push({"roleRef": roleRef,"companyName": companyName,"city": city});
		}
	};
	
	$scope.computeMaxLiabilityThd = function(roleRef,companyName,city){
		var maxLiabilityThd = $scope.policy.maxLiabilityThd;
		if($scope.policy.coverInsuredPercentage != null){
			maxLiabilityThd = Math.round(maxLiabilityThd * $scope.policy.coverInsuredPercentage*0.01);
		}
		return maxLiabilityThd;
		
	}
	// defect1046:Implement derogation for DRA < or = 2 if no full updront
	// payment upfront
	$scope.lowDRARulesDerogated = function(){
		var baseAmount = $scope.policy.baseOnAmount ? $scope.policy.baseOnAmount : 0;
		var expectedPremium = $scope.policy.quotationSummary.expectedPremium ? $scope.policy.quotationSummary.expectedPremium : 0;
		var dra = $scope.policy.dra;
		return ((dra <=2) && ( $scope.policy.paimentPeriod != 'AN' || (baseAmount< expectedPremium) ));
	}
	
/*
 * return negotiatedExpectedPremium if not null otherwise return expectedPremium
 */
	$scope.getNegociatedOrExpectedPremium  = function() {
		var negociatedOrExpectedPremium  = null;
		if( $scope.policy.quotationSummary){
			negociatedOrExpectedPremium = $scope.policy.quotationSummary.negotiatedExpectedPremium != null ? $scope.policy.quotationSummary.negotiatedExpectedPremium : $scope.policy.quotationSummary.expectedPremium;
		}
		console.log("negociatedOrExpectedPremium : " + negociatedOrExpectedPremium);
		return negociatedOrExpectedPremium;
   }
	
	 /* return negotiatedExpectedPremium plus AFL */
	$scope.computePremiumWithAFL = function(negociatedOrExpectedPremium){
		return negociatedOrExpectedPremium + $scope.policy.aggreagateFirstLossAmount;
	}
	
	/* compute dynamic eclPercentEAP value */
	$scope.computeEclPercentEAP = function() {
		
			var negociatedOrExpectedPremium = $scope.getNegociatedOrExpectedPremium();
			if($scope.policy.eclLimit != null && negociatedOrExpectedPremium != null){
				$scope.policy.eclPercentEAP = Math.ceil(($scope.policy.eclLimit / $scope.computePremiumWithAFL(negociatedOrExpectedPremium)) *100);
				console.log("eclPercentEAP : " + $scope.policy.eclPercentEAP);
		}
		
	}
	
	/*
	 * eclPercentEAP derogation is visible only when eclLimit derogation is
	 * visible
	 */
	$scope.isEclPercentEAPVisible = function(){
		return  $scope.policy.riskProductEcl && $scope.isDerogationVisible("riskDerogation","eclLimit");
	}

	/* compute dynamic dclInfoReportPercentEAP value */
	$scope.computeDclInfoReportPercentEAP = function(){
		var negociatedOrExpectedPremium = $scope.getNegociatedOrExpectedPremium();
		if($scope.policy.infoReportDCLLimit != null && negociatedOrExpectedPremium != null){
			$scope.policy.dclInfoReportPercentEAP = Math.ceil(($scope.policy.infoReportDCLLimit / $scope.computePremiumWithAFL(negociatedOrExpectedPremium)) *100);
			console.log("dclInfoReportPercentEAP : " + $scope.policy.dclInfoReportPercentEAP);
			
		}
	}
	
	/*
	 * dclInfoReportPercentEAP derogation is visible only when
	 * infoReportDCLLimit derogation is visible
	 */
	$scope.isDclInfoReportPercentEAPVisible = function(){
		
		return  $scope.policy.discretionaryCreditLimit && $scope.policy.infoReport && $scope.isDerogationVisible("riskDerogation","infoReportDCLLimit");
	}
	
	/* compute dynamic dclSatisfExperiencePercentEAP value */
	$scope.computeDclSatisfExperiencePercentEAP = function(){
		var negociatedOrExpectedPremium = $scope.getNegociatedOrExpectedPremium();
		if($scope.policy.satisfactoryTradingExperienceLimit != null && negociatedOrExpectedPremium != null){
			$scope.policy.dclSatisfExperiencePercentEAP = Math.ceil(($scope.policy.satisfactoryTradingExperienceLimit / $scope.computePremiumWithAFL(negociatedOrExpectedPremium)) *100);
			console.log("dclSatisfExperiencePercentEAP : " + $scope.policy.dclSatisfExperiencePercentEAP);
			
		}
	}
	
	/*
	 * dclSatisfExperiencePercentEAP derogation is visible only when
	 * satisfactoryTradingExperienceLimit derogation is visible
	 */
	$scope.isDclSatisfExperiencePercentEAPVisible = function(){
		
		return  $scope.policy.discretionaryCreditLimit && $scope.policy.satisfactoryTradingExperience && $scope.isDerogationVisible("riskDerogation","satisfactoryTradingExperienceLimit");
	}
	
	
	/* Compute dynamic dclMgtProcedurePercentEAP value */
	$scope.computeDclMgtProcedurePercentEAP = function(){
		var negociatedOrExpectedPremium = $scope.getNegociatedOrExpectedPremium();
		if($scope.policy.dclSelfUnderWritingBuyerLimit != null && negociatedOrExpectedPremium != null){
			$scope.policy.dclMgtProcedurePercentEAP = Math.ceil(($scope.policy.dclSelfUnderWritingBuyerLimit / $scope.computePremiumWithAFL(negociatedOrExpectedPremium)) *100);
			console.log("dclMgtProcedurePercentEAP : " + $scope.policy.dclMgtProcedurePercentEAP);
			
		}
	}
	
	/*
	 * dclMgtProcedurePercentEAP derogation is visible only when
	 * dclSelfUnderWritingBuyerLimit derogation is visible
	 */
	$scope.isDclMgtProcedurePercentEAPVisible = function(){
		return  $scope.policy.discretionaryCreditLimit && $scope.isDCLSelfUnderWritingSelected() && $scope.isDerogationVisible("riskDerogation","dclSelfUnderWritingBuyerLimit");
	}
	
	$scope.isDerogationVisible = function(sectionName,derogationId){
		
		return DerogationService.isDerogationButtonVisible(sectionName,derogationId);
		
		
	} 
	
	/**
	 * Update all dynamic input derogation after requote
	 */
	$scope.updateDynamicInputDerogationAfterRequote = function(){
		$scope.computeBlindCoverPercent();
		$scope.computeEclPercentEAP();
		$scope.computeDclMgtProcedurePercentEAP();
		$scope.computeDclSatisfExperiencePercentEAP();
		$scope.computeDclInfoReportPercentEAP();
	}	 
	
	
	/*
	 * Defect #1035 : Price : new zones to display
	 * 
	 * Update the rate and the price zoning list
	 */
	$scope.onZoneScopeChange = function(){
		
		// Set the rate to 1 when the domestic's or export's value = false
		if (!($scope.policy.domesticScope && $scope.policy.exportScope)) {
			$scope.policy.rates = 1;
		}
		// Update the price zoning list
		$scope.updatePriceZoning();
		
	}
	
	/**
	 * Defect #1035 : Price : new zones to display
	 * 
	 * Update the price zoning list when changing number of rates
	 */
	$scope.onRatesChange = function(){
		
		// Update the price zoning list
		$scope.updatePriceZoning();
		
	}
	
	/**
	 * Update the price zoning list depending on the value of the combination :
	 * rates, domestic and export scope
	 */
	$scope.updatePriceZoning = function(){
		$scope.getPriceZoning();
		// Get the key of the first element
		$scope.policy.priceZoning = Object.keys($scope.priceZonings)[0];
		
		// Build the countries area
		$scope.onPriceZoningChange();
	}
	
	/**
	 * Rebuild the countries zone list. This service will get the default
	 * countries list of each area that is defined in Back-Office
	 */
	$scope.onPriceZoningChange = function(){
		
		spinnerService.show('countriesZoneSpinner');
		
		PolicyService.getDefaultCountriesArea($scope.policy.priceZoning).then(function (data) {
			$scope.policy.area1.countries = $filter('atyOrderByTranslated')(data.AREA1.countries, 'country.');
			$scope.policy.area1.counter = 0;
			
			$scope.policy.area2.countries = $filter('atyOrderByTranslated')(data.AREA2.countries, 'country.');
			$scope.policy.area2.counter = 0;
			
			$scope.policy.area3.countries = $filter('atyOrderByTranslated')(data.AREA3.countries, 'country.');
			$scope.policy.area3.counter = 0;
			
			$scope.policy.coveredCountriesList = $filter('atyOrderByTranslated')(data.GLOBAL.countries, 'country.');
			$scope.policy.areaExcluded.countries = $filter('atyOrderByTranslated')(data.EXCLUDED.countries, 'country.');

			$scope.computeInitialZoneCountries();
			
			$scope.updateBlindCoverAndDiscretionaryCountries();
		}).finally(function () {
			spinnerService.hide('countriesZoneSpinner');
		});
		
	}
	
	/**
	 * Returns the area title that depends on the price zoning combination
	 */
	$scope.getAreaTitle = function(areaNumber){
				
		var priceZoning = $scope.policy.priceZoning;
		
		if (!priceZoning) {return;}
		
		// Get number of area
		var arrayOfPriceZonings = priceZoning.split("_");
		
		var area = arrayOfPriceZonings[areaNumber - 1];
		var label = "";
		angular.forEach($scope.policy.priceZoningList, function(value, key) {
			  
			  if (value[area]) {
				  label =  value[area];
			  }

		});
		
		return label;
		
	}
	
	//Defect #797: Wrong countries exported to BC Contract about
	/**
	 * Updates blind cover and discretionary countries list when a split premium is changed
	 */
	$scope.updateBlindCoverAndDiscretionaryCountries = function() {
		
		var blindCoverAllCountriesList = $scope.policy.blindCoverAllCountriesList;
		var discretionaryAllCountriesList = $scope.policy.discretionaryAllCountriesList;
		
		var blindCoverCountriesListDefault = $scope.policy.blindCoverCountriesListDefault;
		var discretionaryCountriesListDefault = $scope.policy.discretionaryCountriesListDefault;
		
		var areExcluded = $scope.policy.areaExcluded;
						
		$scope.policy.blindCoverCountriesList.countries = $filter('atyOrderByTranslated')(CountryService.getCountryListsDifference(areExcluded.countries,blindCoverCountriesListDefault.countries), 'country.');
		$scope.policy.discretionaryCountriesList.countries = $filter('atyOrderByTranslated')(CountryService.getCountryListsDifference(areExcluded.countries,discretionaryCountriesListDefault.countries), 'country.');

		$scope.policy.excludedBlindCoverCountriesList.countries = $filter('atyOrderByTranslated')(CountryService.getCountryListsDifference($scope.policy.blindCoverCountriesList.countries,blindCoverAllCountriesList), 'country.');
		$scope.policy.excludedDiscretionaryCountriesList.countries = $filter('atyOrderByTranslated')(CountryService.getCountryListsDifference($scope.policy.discretionaryCountriesList.countries,discretionaryAllCountriesList), 'country.');
		
		$scope.policy.firstSalesCountriesList = $scope.policy.discretionaryCountriesList.countries;
		
	}
		
}]);

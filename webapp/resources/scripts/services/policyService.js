'use strict';
angular.module('autonomyApp.policy')
.factory('PolicyResource', ['$resource', 'REST_URLS', function ($resource, REST_URLS) {

	return $resource(REST_URLS.POLICY_REST_URL, {},
			{
		'update': {url:REST_URLS.POLICY_UPDATE_REST_URL, method: 'PUT'}
			});
}])
.factory('QuoteService', ['$http', '$q', 'REST_URLS', 'localStorageService','Logger','growl', function ($http, $q, REST_URLS, localStorageService,Logger,growl) {

	var logger = Logger.getInstance('QuoteService');
	
	function checkMaximumLiabilityBuyersRequired(maximumLiabilityBuyers) {
		var ok = true;
		angular.forEach(maximumLiabilityBuyers, function(item) {
			if (!item.amount) {
				ok = false;
			}
		});
		
		return ok;
	};
	
	return {
		
		checkMaximumLiabilityBuyersRequired : checkMaximumLiabilityBuyersRequired,
		
		checkNegotiated: function (policyId) {

			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET',
				url: REST_URLS.POLICY_QUOTE_CHECK_NEGOTIATED_REST_URL.replace(':policyId', policyId)
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		
		checkValues: function(policy,pepsAuthorized) {
			var valueNull = false;
			var fieldsMandatoryPolicy = [];
			var fieldsMandatory = {
					fieldsMandatoryPolicy : null,
					fieldsMandatoryQuestionnaire : [],
					buttonDisable : false
			};

			if (policy.buttonQuoteDisabled) {
// fieldsMandatory.fieldsMandatoryQuestionnaire.push('questionnaire.mandatory.field.label');
				fieldsMandatory.fieldsMandatoryQuestionnaire = fieldsMandatory.fieldsMandatoryQuestionnaire.concat(policy.questionnaireAttributesEmpty);
				
				fieldsMandatory.buttonDisable = fieldsMandatory.fieldsMandatoryQuestionnaire.length > 0;

				logger.debug('debug', policy.questionnaireAttributesEmpty);
			}

			if (policy.margin == null) {
				logger.debug('debug', 'The field Margin is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.margin.required.error');
				valueNull = true;
			}
			if (policy.deductible == null) {
				logger.debug('debug', 'The field Deductible is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.deductible.required.error');
				valueNull = true;
			}

			if ("AMNT" === policy.contractualMLBasis && 
					((!policy.mlBuyerEnabled && (policy.maxLiabilityAmount == null || policy.maxLiabilityAmount === 0))
				|| (policy.mlBuyerEnabled && ((policy.maximumLiabilityBuyers.length === 0) || (!checkMaximumLiabilityBuyersRequired(policy.maximumLiabilityBuyers))))	
				)) {
				
				logger.debug('debug', 'The field MaxLiabilityAmount is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.maxLiabilityAmount.required.error');
				valueNull = true;
			}

			if ("FACT" === policy.contractualMLBasis && (!policy.mlBuyerEnabled &&	(policy.maxLiabilityMultiple == null || policy.maxLiabilityMultiple === 0)
			)){
				
				logger.debug('debug', 'The field MaxLiabilityFactor is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.maxLiabilityFactor.required.error');
				valueNull = true;
			}else if ("FACT" === policy.contractualMLBasis && (policy.mlBuyerEnabled && ((policy.maximumLiabilityBuyers.length === 0) || (!checkMaximumLiabilityBuyersRequired(policy.maximumLiabilityBuyers))))) {
				logger.debug('debug', 'The field MaxLiabilityAmount is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.maxLiabilityAmount.required.error');
				valueNull = true;
			}

			if (policy.minPremiumRate == null) {
				logger.debug('debug', 'The field Min Premium Rate is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.minPremiumRate.required.error');
				valueNull = true;
			}

			if (policy.contractPeriod == null) {
				logger.debug('debug', 'The field ContractPeriod is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.contractPeriod.required.error');
				valueNull = true;
			}
			if (policy.coverInsuredPercentage == null) {
				logger.debug('debug', 'The field CoverInsuredPercentage is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.contractInsuredPercentage.required.error');
				valueNull = true;
			}

			if (policy.priceZoning == null) {
				logger.debug('debug', 'The field Price Zoning is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.splitPremium.required.error');
				valueNull = true;
			}

			// Defect #477 The pricing platform is not required
			if (policy.pricingPlatform == null && pepsAuthorized) {
				logger.debug('debug', 'The field PricingPlatform is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.pricingPlatform.required.error');
				valueNull = true;
			}

			// defect # 369 : FR Feedback DSO - the questionary value shall be
			// adjustable for Pricing computation.
			if (policy.appliedDSO == null && pepsAuthorized) {
				logger.debug('debug', 'The field AppliedDSO is mandatory to fill');
				fieldsMandatoryPolicy.push('policy.appliedDSO.required.error');
				valueNull = true;
			}
			
			
			var currentDclSelfUnderWritingOption =  policy.dclSelfUnderWritingOption;
			if(currentDclSelfUnderWritingOption == 'CMP' || currentDclSelfUnderWritingOption == 'CMPCZ'){
				if(policy.dclSelfUnderWritingBuyerLimit == null){
					logger.debug('debug', 'The field dclSelfUnderWritingBuyerLimit is mandatory to fill');
					fieldsMandatoryPolicy.push('policy.dclSelfUnderWritingBuyerLimit.required.error');
					valueNull = true;
				}
				
				if(policy.dclSelfUnderWritingInsuPercent == null){
					logger.debug('debug', 'The field dclSelfUnderWritingInsuPercent is mandatory to fill');
					fieldsMandatoryPolicy.push('policy.dclSelfUnderWritingInsuPercent.required.error');
					valueNull = true;
				}
				
				if(policy.dclSelfUnderWritingProcedureManager == null){
					logger.debug('debug', 'The field dclSelfUnderWritingProcedureManager is mandatory to fill');
					fieldsMandatoryPolicy.push('policy.dclSelfUnderWritingProcedureManager.required.error');
					valueNull = true;
				}
				
				if(policy.dclSelfUnderWritingProcedureDate == null){
					logger.debug('debug', 'The field dclSelfUnderWritingProcedureDate is mandatory to fill');
					fieldsMandatoryPolicy.push('policy.dclSelfUnderWritingProcedureDate.required.error');
					valueNull = true;
				}
			}

			if ( valueNull === true ) {
				fieldsMandatory.fieldsMandatoryPolicy = fieldsMandatoryPolicy;
				fieldsMandatory.buttonDisable = true;
			}

			policy.buttonQuoteDisabled = fieldsMandatory.buttonDisable === true;   
			
			return fieldsMandatory;
		},
		requestQuotation: function(policy) {

			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				data: policy,
				url: REST_URLS.REQUEST_QUOTATION_REST_URL.replace(':caseId', localStorageService.get('caseId')).replace(':scenarioId', localStorageService.get('scenarioId'))
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		getQuote: function (policy) {

			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				url: REST_URLS.POLICY_QUOTE_REST_URL.replace(':policyId', policy.id),
				data: policy
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},

		// end
	};
}])
.factory('PolicyService', ['$http','$q','REST_URLS','localStorageService','growl','FileSaver','Blob', function($http, $q, REST_URLS,localStorageService,growl,FileSaver,Blob) {
	return {
		getBcContractXml: function() {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET',
				responseType: 'arraybuffer',
				url: REST_URLS.POLICY_BCCONTRACT_XML_REST_URL.replace(':caseId',localStorageService.get('caseId')),
			}).success(function(data) {
				var file = new Blob([data], {type: 'application/xml'});
				FileSaver.saveAs(file, 'contract_xml.xml');
				deferred.resolve();
			}).error(function(msg, code) {
				growl.error('contract.get.error');
			});
			return deferred.promise;

		},
		getDefaultCountriesArea: function(priceZoning) {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET',
				responseType: 'json',
				url: REST_URLS.DEFAULT_COUNTRIES_ZONE_SPLITTING_REST_URL.replace(':scenarioId',localStorageService.get('scenarioId'))
				.replace(':priceZoning',priceZoning)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		}
		
	};
}])
// Defect #797: Wrong countries exported to BC Contract about Discretionary
// Limits
.factory('CountryService',['$filter', function($filter) {
	
	/**
	 * Perfoms intersection and difference between two list of countries
	 */
	function helperCountriesOperation(countries1,countries2, isUnion) {
				
		if (isUnion) {
			return angular.copy($filter('atyIntersections')(countries1, countries2));
		}
		else {
			return angular.copy($filter('atyExclusion')(countries1, countries2));
		}
		
		// return countries1.filter( a => isUnion === countries2.some( b =>
		// a.code === b.code ) );
	};
	
	return {
		inCountryList: function(country,countries) {
			
			var result = false;
			
			if (angular.isObject(country) && angular.isArray(countries)) {
				angular.forEach(countries, function(value) {
					if (value.code === country.code) {
						result = true;
						return false;
					}
				});
			}
			return result;
		},
		getCountryListsIntersection: function(countries1,countries2) {
			
			return helperCountriesOperation(countries1,countries2,true);
		},
		getCountryListsDifference: function(countries,list) {
			
			return helperCountriesOperation(list,countries,false);
		}
	};
}]).factory('ExtensionAffiliateService', ['$http', '$q', 'REST_URLS', 'localStorageService','Logger','growl', function ($http, $q, REST_URLS, localStorageService,Logger,growl) {

	var logger = Logger.getInstance('ExtensionAffiliateService');
	return {
		deleteExtensionAffiliate: function (caseId,policyId,roleRef) {

			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'DELETE',
				url: REST_URLS.POLICY_EXTENSION_AFFILIATE_REST_URL.replace(':caseId',caseId).replace(':policyId', policyId).replace(':roleRef', roleRef)
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		}
	};
}]).factory('DateService',['Logger', function (Logger) {
	var logger = Logger.getInstance('DateService');

	return {
		
		/*
		 * Check if the target date is weekend
		 * @return booelan
		 */
		isWeekDate : function(date) {
			 	return this.isWeekDay(date.getDay());
		},
	
		/*
		 * Check if the target day is weekend
		 * @return boolean
		 */
		isWeekDay : function(day) {
			var weekdays = [0,6];
			return weekdays.includes(day);
		},
		
		/*
		 * Compute days difference between 2 dates with skipweeks option
		 * @return diff days count
		 */
		computeDiffDays : function(startDate, endDate, skipWeeks){
			this.dateWithOutTime(startDate);
			this.dateWithOutTime(endDate);
			var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
			var diffDays =  Math.ceil(timeDiff / (1000 * 3600 * 24));
			if(skipWeeks){
				diffDays -= this.computeWeeksDays(startDate,endDate);
			}
			return diffDays;
		},
		
		/*
		 * Compute week days between 2 date
		 * @return week days count 
		 */
		computeWeeksDays : function(startDate, endDate){
			this.dateWithOutTime(startDate);
			this.dateWithOutTime(endDate);
			var weekendDayCount = 0;
			while(startDate < endDate){
				if(this.isWeekDate(startDate)){
		            ++weekendDayCount ;
		        }
				startDate.setDate(startDate.getDate() + 1);
		    }
		    return weekendDayCount ;
		},
		
		/*
		 * Remove time from target date
		 * @return date without time
		 */
		dateWithOutTime : function(date){
			return date.setHours(0, 0, 0, 0);
		},
		
		/*
		 * Add number of days to a date without counting weeks
		 * @return new date = date + days + week days(if exist)
		 */
		addDaysToDateSkipWeeks : function(date,days){
			
		var newDate = (angular.copy(date));
		var d = 0;
		while(d <days){
			newDate.setDate(newDate.getDate() + 1);
			if(this.isWeekDate(newDate)){
				days++;
			}
			d++;
		}
		return 	newDate;
			
		},
		
		/*
		 * Add number of days to a date
		 * @return new date = date + days
		 */
		addDaysToDate : function(date,days){
			var newDate = (angular.copy(date));
			newDate.setDate(newDate.getDate() + days);
			return 	newDate;
		},
		
		/*
		 * Add number of days to a date with skip weeks option 
		 * @return new date = date + days + week days(if skipWeeks = true)
		 */
		addDaysToCurrentDate : function(days,skipWeeks){
			var currentDate = this.getCurrentDate();
			var newDate = null;
			if(skipWeeks === true){
				newDate = this.addDaysToDateSkipWeeks(currentDate,days);
			}else{
				newDate = this.addDaysToDate(currentDate,days);
			}
			return newDate;
			
		},
		
		/*
		 * Get current date, add time if noTime = false
		 * @return now date with or without time
		 */
		getCurrentDate : function (noTime){
			var currentDate = new Date();
			if(noTime === true){
				currentDate.setHours(0, 0, 0, 0);
			}
			return  currentDate;
			
		},
				
	};
}])
//
;

'use strict';
angular.module('autonomyApp.questionnaire')
.factory('QuestionnaireResource', ['$resource','REST_URLS','localStorageService',function ($resource, REST_URLS,localStorageService) {

	return $resource(REST_URLS.QUESTIONNAIRE_REST_URL, {},
			{
		'update' : { method:'PUT'}
			});

}])

.factory('QuestionnaireService', ['$http','$q','REST_URLS', function($http, $q, REST_URLS) {
	//defect 680 save the pepsRight
	var pricingRight;

	function setPricingRight(pricingRightData) {
		pricingRight = pricingRightData;
	}

	function getPricingRight() {
		return pricingRight;
	}

	return {

		setPricingRight: setPricingRight,
		getPricingRight: getPricingRight,
		
		getPartnerInfo: function(cardId,caseId) {

			var deferred = $q.defer();
			$http({
				method: 'GET',
				url: REST_URLS.QUESTIONNAIRE_PARTNER_INFO_REST_URL.replace(':cardId', cardId).replace(':caseId', caseId)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		
		getSpecificQuestionnaire: function(caseId,scenarioId) {

			var deferred = $q.defer();
			$http({
				method: 'GET',
				url: REST_URLS.SPECIFIC_QUESTIONNAIRE_REST_URL.replace(':caseId', caseId).replace(':scenarioId',scenarioId)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		
		getListPartners: function() {

			var deferred = $q.defer();
			$http({
				method: 'GET',
				url: REST_URLS.QUESTIONNAIRE_PARTNER_LIST_REST_URL
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		getKYCNotationInfo: function(caseId) {

			var deferred = $q.defer();
			$http({
				method: 'GET',
				url: REST_URLS.QUESTIONNAIRE_KYC_NOTATION_INFO_REST_URL.replace(':caseId', caseId)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		getRequestQuoteInfo: function(caseId, scenarioId) {

			var deferred = $q.defer();
			$http({
				method: 'GET',
				url: REST_URLS.QUESTIONNAIRE_REQUEST_QUOTE_INFO_REST_URL.replace(':caseId', caseId).replace(':scenarioId', scenarioId)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		checkQuestionnaireFieldsMandatory: function(questionnaire) {

			var questionnaireFieldsMandatory = [];

			if (questionnaire.civility == null) {
				questionnaireFieldsMandatory.push('questionnaire.civility.required.error');
			}

			if (questionnaire.lastName == null) {
				questionnaireFieldsMandatory.push('questionnaire.lastName.required.error');
			}

			if (questionnaire.specificQuestionnaire.napceCode == null) {
				questionnaireFieldsMandatory.push('questionnaire.napce.code.required.error');
			}

			if (questionnaire.specificQuestionnaire.activitySector == null) {
				questionnaireFieldsMandatory.push('questionnaire.activity.sector.required.error');
			}


			if (questionnaire.specificQuestionnaire.contractCurrency == null) {
				questionnaireFieldsMandatory.push('questionnaire.contract.currency.required.error');
			}


			if (questionnaire.specificQuestionnaire.domesticCountry == null) {
				questionnaireFieldsMandatory.push('questionnaire.domestic.country.required.error');
			}


			if (questionnaire.specificQuestionnaire.numberCustomer == null) {
				questionnaireFieldsMandatory.push('questionnaire.number.customer.required.error');
			}

			if (questionnaire.specificQuestionnaire.greatestOutstanding == null) {
				questionnaireFieldsMandatory.push('questionnaire.greatest.outstanding.required.error');
			}

			if (questionnaire.specificQuestionnaire.theoriticalDSO == null) {
				questionnaireFieldsMandatory.push('questionnaire.theoritical.dso.required.error');
			}


			if (questionnaire.newBusiness) {
				if(questionnaire.specificQuestionnaire.exportTurnover == null && questionnaire.specificQuestionnaire.domesticTurnover == null) {
					questionnaireFieldsMandatory.push('questionnaire.domestic.turnover.required.error');
					questionnaireFieldsMandatory.push('questionnaire.export.turnover.required.error');
				}
				else {
					var globalTurnover = (questionnaire.specificQuestionnaire.domesticTurnover != null ? questionnaire.specificQuestionnaire.domesticTurnover : 0) + (questionnaire.specificQuestionnaire.exportTurnover != null ? questionnaire.specificQuestionnaire.exportTurnover : 0);
					if(globalTurnover === 0) {
						questionnaireFieldsMandatory.push('questionnaire.export.turnover.required.error');
					}
				}

				if (questionnaire.specificQuestionnaire.exportTurnover !=null && (questionnaire.specificQuestionnaire.insurableTurnovers == null || questionnaire.specificQuestionnaire.insurableTurnovers.length === 0)) {
					questionnaireFieldsMandatory.push('questionnaire.insurable.turnovers.required.error');
				}
			}
			
			if (questionnaire.transform || questionnaire.renewal) {
				if (questionnaire.specificQuestionnaire.globalTurnover == null) {
					questionnaireFieldsMandatory.push('questionnaire.global.turnovers.required.error');
				}
				else if(questionnaire.specificQuestionnaire.globalTurnover === 0){
					questionnaireFieldsMandatory.push('questionnaire.global.turnovers.zero.error');
				}
			}

			return questionnaireFieldsMandatory;
		}

	};
}])

;


'use strict';
angular.module('autonomyApp.derogation',[])
.factory('DerogationService', ['$http', '$q', 'REST_URLS', 'localStorageService','Logger','growl','$translate', function ($http, $q, REST_URLS, localStorageService,Logger,growl,$translate) {

	var logger = Logger.getInstance('DerogationService');

	//Object derogationLevels will be instantiated when user goes to policy page 
	var derogationLevels = {};
	
	//Group derogations by section in order to count the number of derogations in each section
	var derogationsSection = {};
	
	//List of validated derogations retrieved from policy object (policyController.js)
	var derogations = {};
	
	function setDerogations(derogations_) {
		derogations = derogations_;
	}

	function getDerogations() {
		return derogations;
	}
	
	function getDerogation(fieldName) {
		return derogations[fieldName];
	}
	
	
	/**
	 * Return the derogations list in all section
	 */
	function getDerogationsSection() {
		return derogationsSection;
	}
		
	
	/**
	 * Check if there are pending derogations in a section
	 */
	function hasPendingDerogations(sectionName) {
				
		for (var attribute in derogationsSection[sectionName]) {			

			if (derogationsSection[sectionName][attribute].pending) {
				return true;
			}
		}
		
		return false;
		
	}
	
	
	/**
	 * Get the pending derogations list
	 */
	function getPendingDerogations(sectionName) {
		
		var pendingDerogations = [];
		
		for (var attribute in derogationsSection[sectionName]) {			

			if (derogationsSection[sectionName][attribute].pending && pendingDerogations.indexOf("L"+derogationsSection[sectionName][attribute]['level']) === -1) {
				
				
				pendingDerogations.push("L"+derogationsSection[sectionName][attribute]['level']);
			}
		}
		
		return pendingDerogations.sort();
		
	}
	
	/**
	 * Check if there are derogations in a section
	 */
	function hasDerogations(sectionName) {

		return derogationsSection[sectionName] != null;
		
	}
	
	/**
	 * Add a derogation into a section except the warning derogation type
	 * There are two types of derogation : pending derogation and validated derogation
	 */
	function addToSection(sectionName, attribute, isPending, level) {	
		
		if (angular.isUndefined(sectionName) || isWarningType(attribute)) {
			return;
		}
		
		if (derogationsSection[sectionName] == null) {
			derogationsSection[sectionName] = {};
		}
		
		if (derogationsSection[sectionName][attribute] == null){
			derogationsSection[sectionName][attribute] = {};
		}		
		
		derogationsSection[sectionName][attribute]['pending'] = isPending ? true : false;
		derogationsSection[sectionName][attribute]['level'] = level;
		
	}
	
	/**
	 * Remove a derogation from a section
	 */
	function removeFromSection(sectionName, attribute) {
		
		if (!isWarningType(attribute) && derogationsSection[sectionName] != null && derogationsSection[sectionName][attribute] != null) {
						
			delete derogationsSection[sectionName][attribute];
			if (Object.keys(derogationsSection[sectionName]).length == 0) {
				delete derogationsSection[sectionName];
			}
			
		}
		
	}
	
	function setDerogationLevels(derogationLevelsData) {
		derogationLevels = derogationLevelsData;
	}

	function getDerogationLevels() {
		return derogationLevels;
	}

	function getDerogationLevel(attribute) {
		
		if (derogationLevels != null) {
			var derogation = derogationLevels.derogation[attribute];

			if (derogation != null) {
				return derogation;
			}			
			else {
				logger.warn("The derogation :{0} is not found in Json",[attribute])
				return null;
			}
		}
		else {
			logger.error("The derogationLevels list is not initiated")
		}
	}

	function getLower(attribute) {
		return getDerogationLevel(attribute).lower;
	}

	function getEqual(attribute) {
		return !angular.isNumber(getDerogationLevel(attribute).threshold);
	}
	
	function isWarningType(attribute) {
		return getDerogationLevel(attribute).warning;
	}

	function getThreshold(attribute) {
		return getDerogationLevel(attribute).threshold;
	}

	function getLevel(attribute, inputValue) {
		
		if(angular.isUndefined(inputValue)) {
			return '';
		}
	
		var derogation = getDerogationLevel(attribute);

		//For the Enum and Boolean type, return the value of the first element.
		//The thresholds value of Enum or Boolean type is true or false 
		if (!angular.isNumber(derogation.threshold)) {
			return  derogation.thresholdLevels[0];
			//Numeric type	
		} else {

			var levelCount = 6;

			var highestLevel = 0; // Big Boss Level. The Big Boss Level is the level in which the value is out of range.

			for (var i = 0 ; i < levelCount ; i ++) {
				var firstIndex = 0;
				//A threshold can be equal to the threshold level. Ignore if they are same value. Ex : 120 -> 120,120,130,140,150,160
				if (derogation.threshold === derogation.thresholdLevels[i]) {
					continue;
				} else {
					firstIndex = i;
				}
				
				//Check if the thresholdLevels list are arranged in ascending order by checking if the threshold value < thresholdLevels[0] 	
				if (derogation.threshold < derogation.thresholdLevels[firstIndex]) {
					if (inputValue <= derogation.thresholdLevels[i]) {				
						return levelCount - i ;
					}
				}
				else if (inputValue >= derogation.thresholdLevels[i]) {						
					return levelCount - i ; 
				}
			}
			
			//If the value is not found in the list, only big boss (level 0) could validate this derogation
			return highestLevel;
		}

	}
	
	function isDerogationButtonVisible(sectionName,attribute){
		return derogationsSection[sectionName] && derogationsSection[sectionName][attribute] ? true:false;
	}

	return {
		
		setDerogations : setDerogations,
		getDerogations : getDerogations,
		getDerogation : getDerogation,
		getDerogationsSection : getDerogationsSection,
		hasPendingDerogations : hasPendingDerogations,
		getPendingDerogations : getPendingDerogations,
		hasDerogations : hasDerogations,
		addToSection : addToSection,
		removeFromSection : removeFromSection, 
		setDerogationLevels : setDerogationLevels,
		getDerogationLevels : getDerogationLevels,
		getDerogationLevel : getDerogationLevel,
		getLower : getLower,
		getEqual : getEqual,
		getThreshold : getThreshold,
		getLevel : getLevel,
		isWarningType : isWarningType,
		policyId:null,
		validable:false,
		//Defect #408
		//When a scenario is frozen (a contract was generated), modifying a threshold in back-office might not impact this scenario
		disabled:false,
		isDerogationButtonVisible : isDerogationButtonVisible,
		updateDerogation: function (policyId,fieldName,acceptedValue,level) {
			if(policyId != null && policyId != '') {
				var deferred = $q.defer();
				var param = {'policyId':policyId,'fieldName':fieldName,'acceptedValue':acceptedValue,'level':level};
				growl.info('derogation.saving.msg');
				$http({
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'PUT',
					url: REST_URLS.POLICY_DEROGATION_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId')),
					data: param
				}).success(function (data) {
					deferred.resolve(data);
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
			} else {
				alert('policyId is null');
			}
		}
	};
}])
;

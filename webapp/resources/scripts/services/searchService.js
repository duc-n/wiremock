'use strict';
angular.module('autonomyApp.search')
.factory('SearchService', ['$http','$q','REST_URLS', function($http, $q, REST_URLS) {
	
	var isSearchExportInProgress = false;
	
	return {
		isSearchExportInProgress : function() {
			return isSearchExportInProgress;
		},
		setSearchExportInProgress : function(isSearchExportInProgress_) {
			isSearchExportInProgress = isSearchExportInProgress_;
		},
		search: function(searchCriteriaObj) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: REST_URLS.SEARCH_CASES_REST_URL,
				data: $.param(searchCriteriaObj)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);

			});
			return deferred.promise;
		},
		//Defect #770: FR Feedback-Excel Reporting of cases
		exportResult: function(searchCriteriaObj) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: REST_URLS.SEARCH_CASES_EXPORT_REST_URL.replace(':page','search_result'),
				headers: {
					'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
				},
				responseType: 'blob',
				data: $.param(searchCriteriaObj)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		//
		createCase: function(easyNumber, contractTest) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
				url: REST_URLS.CREATE_CASE_REST_URL.replace(':easyNumber',easyNumber),
        data : $.param({contractTest:contractTest})
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
    transformContract: function(contractId,contractTest) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: REST_URLS.TRANSFORM_CONTRACT_REST_URL.replace(':contractId',contractId),
        data : $.param({contractTest:contractTest})
      }).success(function(data) {
        deferred.resolve(data);
      }).error(function(msg, code) {
        deferred.reject(msg);
      });
      return deferred.promise;
    },
    renewContract: function(contractId,contractTest) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        url: REST_URLS.RENEW_CONTRACT_REST_URL.replace(':contractId',contractId),
        data : $.param({contractTest:contractTest})
      }).success(function(data) {
        deferred.resolve(data);
      }).error(function(msg, code) {
        deferred.reject(msg);
      });
      return deferred.promise;
    },
    createCheckMigrationCase: function(contractNumber) {
    	var deferred = $q.defer();
    	$http({
    		method: 'POST',
    		url: REST_URLS.CREATE_CASE_FOR_CHECK_MIGRATION_CONTRACT_REST_URL.replace(':contractId',contractNumber)
    	}).success(function(data) {
    		deferred.resolve(data);
    	}).error(function(msg, code) {
    		deferred.reject(msg);
    	});
    	return deferred.promise;
    },
    createCloCase: function(contractNumber) {
    	var deferred = $q.defer();
    	$http({
    		method: 'POST',
    		url: REST_URLS.CREATE_CLO_CASE_REST_URL.replace(':contractNumber',contractNumber)
    	}).success(function(data) {
    		deferred.resolve(data);
    	}).error(function(msg, code) {
    		deferred.reject(msg);
    	});
    	return deferred.promise;
    },
    checkContractNumber:function(contractNumber,type) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: REST_URLS.TRANSFORM_CONTRACT_CHECK_REST_URL.replace(':contractNumber',contractNumber).replace(':type',type)
        }).success(function(data) {
          deferred.resolve(data);
        }).error(function(msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      },
      searchCaseFromEasyNumber:function(easyNumber) {
    	  var deferred = $q.defer();
    	  $http({
    		  method: 'GET',
    		  url: REST_URLS.SEARCH_CASES_FROM_EASYNUMBER_REST_URL.replace(':easyNumber',easyNumber)
    	  }).success(function(data) {
    		  deferred.resolve(data);
    	  }).error(function(msg, code) {
    		  deferred.reject(msg);
    	  });
    	  return deferred.promise;
      },
      searchAccount:function(search) {
    	  var deferred = $q.defer();
    	  $http({
    		  method: 'POST',
    		  headers: {
  				'Content-Type': 'application/json'
  			  },
    		  url: REST_URLS.SEARCH_ACCOUNT_SEARCH_REST_URL,
    		  data : search
    	  }).success(function(data) {
    		  deferred.resolve(data);
    	  }).error(function(msg, code) {
    		  deferred.reject(msg);
    	  });
    	  return deferred.promise;
      },
      changeCasesOwner:function(accountId,caseIds) {
    	  var deferred = $q.defer();
    	  $http({
    		  headers: {
					'Content-Type': 'application/json'
				},
    		  method: 'PUT',
    		  url: REST_URLS.SEARCH_CHANGE_CASES_OWNER_CHECK_REST_URL.replace(':accountId',accountId),
    		  data:caseIds
    	  }).success(function(data) {
    		  deferred.resolve(data);
    	  }).error(function(msg, code) {
    		  deferred.reject(msg);
    	  });
    	  return deferred.promise;
      }
	};
}])
.service('SharedProperties', function () {
	var property = {};

	this.getProperty = function() {
		return property;
	};

	this.setProperty = function(value) {
		property = value;
	};

})
;

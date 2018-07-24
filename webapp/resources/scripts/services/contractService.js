'use strict';
angular.module('autonomyApp.contract',[])
.factory('ContractService', ['$http','$q','REST_URLS','localStorageService','growl', function($http, $q, REST_URLS,localStorageService,growl) {

	return {
		updateContract: function() {
			var deferred = $q.defer();
			growl.info('update.contract.process.msg');
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'PUT',
				url: REST_URLS.CONTRACT_UPDATE_REST_URL.replace(':scenarioId',localStorageService.get('scenarioId'))
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		}
	};
}])
;


'use strict';
angular.module('autonomyApp.smart',[])
.factory('SmartService', ['$http','$q','REST_URLS','localStorageService','growl', function($http, $q, REST_URLS,localStorageService,growl) {

	return {
		updateSmart: function() {
			var deferred = $q.defer();
//			growl.info('smart.update.process.msg');
			$http({
				method: 'PUT',
				url: REST_URLS.SMART_UPDATE_REST_URL.replace(':scenarioId',localStorageService.get('scenarioId'))
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


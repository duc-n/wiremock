'use strict';
angular.module('autonomyApp.finalization')
	.factory('FinalizationResource', ['$resource','REST_URLS',function ($resource, REST_URLS, localStorageService) {

	return $resource(REST_URLS.FINALIZATION_REST_URL, {},
			{
		'update' : { method:'PUT' }
			});
}])
.factory('FinalizationService', ['$http','$q','REST_URLS', 'localStorageService','FileSaver','Blob', function($http, $q, REST_URLS, localStorageService,FileSaver,Blob) {
	return {
		tranferToGCC: function(scenarioId) {

			var deferred = $q.defer();
			$http({
				method: 'PUT',
				url: REST_URLS.FINALIZATION_TRANSFER_GCC_REST_URL.replace(':scenarioId', scenarioId)
			}).success(function(data) {
				deferred.resolve(data);
			}).error(function(msg, code) {
				deferred.reject(msg);

			});
			return deferred.promise;
		},
    // Defect #823: Keep XML flow to BC Contract on transfert to GCC
    getTransfertToGCCXml: function() {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        responseType: 'arraybuffer',
        url: REST_URLS.FINALIZATION_TRANSFERT_GCC_XML_REST_URL.replace(':caseId',localStorageService.get('caseId'))

      }).success(function(data, status, headers, config) {
        var fileName = headers('fileName');
        var file = new Blob([data], {type: 'application/xml'});
        FileSaver.saveAs(file, fileName);
        deferred.resolve();
      }).error(function(msg, code) {
        growl.error('finalization.get.error');
      });
      return deferred.promise;
    },
    
    cancelProject : function(reason){
    	var deferred = $q.defer();
		$http({
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			data: reason,
			url: REST_URLS.FINALIZATION_CANCEL_PROJECT_REST_URL.replace(':caseId',localStorageService.get('caseId')).replace(':scenarioId',localStorageService.get('scenarioId'))
		}).success(function (data) {
			deferred.resolve(data);
		}).error(function (msg, code) {
			deferred.reject(msg);
		});
		return deferred.promise;
    }
    //
	};
}])
;


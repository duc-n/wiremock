'use strict';
angular.module('autonomyApp.verticalMenu')  
  .factory('VerticalMenuService', ['$http','$q','REST_URLS','localStorageService','growl','FileSaver','Blob', function($http, $q, REST_URLS,localStorageService,growl,FileSaver,Blob) {
	return {
		getBcContractXml: function() {
			var deferred = $q.defer();
			$http({
				headers: {
		            'Content-Type': 'application/json'
		          },
				method: 'GET',				
				responseType: 'arraybuffer',
				url: REST_URLS.GLOBAL_BCCONTRACT_XML_REST_URL.replace(':caseId',localStorageService.get('caseId')),				
			}).success(function(data) {        	
				var file = new Blob([data], {type: 'application/xml'});
				FileSaver.saveAs(file, 'contract_xml.xml');   
				deferred.resolve();
			}).error(function(msg, code) {
				growl.error('contract.get.error');
				deferred.reject(msg);
			});
			return deferred.promise;

		},
		getBcContractRight : function() {
			var deferred = $q.defer();
			
			$http({				
				method: 'GET',				
				url: REST_URLS.GLOBAL_BCCONTRACT_RIGHT_REST_URL.replace(':caseId',localStorageService.get('caseId')),				
			}).success(function(data) {        	
				deferred.resolve(data);
			}).error(function(msg, code) {
				growl.error('contract.get.error');
				deferred.reject(msg);
			});
			return deferred.promise;
		}
	};
}])

;


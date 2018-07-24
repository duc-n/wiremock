'use strict';
angular.module('autonomyApp.diagnosis')
  .factory('DiagnosisResource', ['$resource', 'REST_URLS', 'localStorageService', function ($resource, REST_URLS, localStorageService) {

    return $resource(REST_URLS.DIAGNOSIS_REST_URL, {},
      {
        'update' : { method:'PUT', params : { caseId: localStorageService.get('caseId') } }
      });

  }]);

'use strict';
angular.module('autonomyApp.transformation')
  .factory('TransformationService', ['$q', '$http', 'REST_URLS', 'localStorageService', function ($q, $http, REST_URLS, localStorageService) {

    return {
      loadReport: function () {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: REST_URLS.TRANSFORMATION_REPORT_REST_URL.replace(':caseId', localStorageService.get('caseId')),
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      }
    };
  }]);

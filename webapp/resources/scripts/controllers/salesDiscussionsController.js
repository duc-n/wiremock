'use strict';

angular.module('autonomyApp.salesDiscussions', [])
  .controller('SalesDiscussionsController', ['$scope', '$stateParams', 'Logger', 'loadSalesDiscussions','$modalInstance', 'growl', 'SalesDiscussionsResource','SalesDiscussionsDataService', '$translate','localStorageService',
    function ($scope, $stateParams, Logger, loadSalesDiscussions, $modalInstance, growl, SalesDiscussionsResource,SalesDiscussionsDataService, $translate,localStorageService) {
      var logger = Logger.getInstance('SalesDiscussionsController');

      logger.debug('Get SalesDiscussionsController : ' + $scope.caseId);
      $scope.salesDiscussions = loadSalesDiscussions.data;
      $scope.addSalesDiscussion = function (salesDiscussionForm) {
			if (salesDiscussionForm.$valid) {
				var gloablDiscussionDto = {"comments":$scope.salesDiscussion.comments};
				SalesDiscussionsResource.update({
					 caseId: localStorageService.get('caseId')
				},gloablDiscussionDto).$promise.then(function (response){
					 logger.debug('SalesDiscussionsRessource.update: ' + response);
					 $scope.salesDiscussions.push(response.data);
					 SalesDiscussionsDataService.setCommentsCount( $scope.salesDiscussions.length)
					 $scope.salesDiscussion.comments = null;
				});
				
			}
		};

      $scope.close = function () {
        $modalInstance.dismiss('cancel');
      };

    }]);

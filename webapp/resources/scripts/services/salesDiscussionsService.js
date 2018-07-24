'use strict';
angular.module('autonomyApp.salesDiscussions')
  .factory('SalesDiscussionsResource', ['$resource', 'REST_URLS', 'localStorageService', function ($resource, REST_URLS, localStorageService) {

    return $resource(REST_URLS.SALES_DISCUSSIONS_REST_URL, {},
      {
        'update' : { method:'PUT' }
      });

  }]).factory('SalesDiscussionsDataService', [ function() {
	  var commentsCount = null;
	  
	  
	  
	  return {
		  getCommentsCount : getCommentsCount,
		  setCommentsCount : setCommentsCount
	  }
	  
	  function getCommentsCount() {
	      return commentsCount;
	  }
	  
	  
	  function setCommentsCount(commentsCount_) {
		  commentsCount = commentsCount_;
	  }

  }]);

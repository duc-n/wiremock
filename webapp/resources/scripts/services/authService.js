'use strict';

angular.module('autonomyApp.auth')
.factory('AuthService', ['$http', '$q', 'Session', 'REST_URLS', 'Logger','localStorageService','$translate', '$cookies', function ($http, $q, Session, REST_URLS, Logger, localStorageService,$translate, $cookies) {
	var logger = Logger.getInstance('AuthService');

	var authService = {};

	authService.getSession = function () {

		if (null != Session.getUserManager()) {
			return Session.getUserManager();
		}
		else {
			logger.log('info', 'Get user information from server');

			var deferred = $q.defer();

			$http({method: 'GET', url: REST_URLS.USER_MANAGER_REST_URL}).
			success(function (data, status, headers, config) {

				logger.debug('debug', 'Load the translation for language : {0}', [JSON.stringify(data.userManager.currentLanguage)]);          
				$translate.use(data.userManager.currentLanguage);       

				logger.debug('debug', 'Put the userManager object in Session : {0}', [JSON.stringify(data)]);
				Session.create(null,data);


				deferred.resolve(Session.getUserManager());
			}).
			error(function (data, status, headers, config) {
				alert('Request error ' + data);
			});
			return deferred.promise;
		}

	};

	authService.updateCookie = function (lang) {
		$http({
			method: 'GET',
			url: REST_URLS.TRANSLATE_UPDATE_COOKIE_LANG_REST_URL + '?lang=' + lang
		});
	};

	authService.updateRateInPercent = function (rateInPercent) {
		$http({
			method: 'GET',
			url: REST_URLS.UPDATE_RATE_IN_PERCENT_REST_URL + '?rateInPercent=' + rateInPercent
		});
	};

	authService.updateLanguage = function (language) {
		$http({
			method: 'GET',
			url: REST_URLS.UPDATE_LANGUAGE_REST_URL + '?language=' + language
		});
	};

	authService.isAuthenticated = function () {
		return !!Session.userId;
	};

	authService.isAuthorized = function (authorizedRoles) {
		if (!angular.isArray(authorizedRoles)) {
			authorizedRoles = [authorizedRoles];
		}
		return (authService.isAuthenticated() &&
				authorizedRoles.indexOf(Session.userRole) !== -1);
	};

	authService.logout = function (credentials) {
	// Defect #435: Session logging out following a timeout wrongly managed
    var csrfToken = $cookies.get('XSRF-TOKEN');
		localStorageService.clearAll();
    $('#_csrf').val(csrfToken);
    document.forms.namedItem('logoutForm').submit();
	};

	return authService;
}])
.factory('AuthResolver', ['$q', '$rootScope', '$state', function ($q, $rootScope, $state) {
	return {
		resolve: function () {
			var deferred = $q.defer();
			var unwatch = $rootScope.$watch('currentUser', function (currentUser) {
				if (angular.isDefined(currentUser)) {
					if (currentUser) {
						deferred.resolve(currentUser);
					} else {
						deferred.reject();
						$state.go('user-login');
					}
					unwatch();
				}
			});
			return deferred.promise;
		}
	};
}])
.service('Session', function () {

	this.getUserManager = function() {
		return this.userManager;
	};
	
	this.getUserInfo = function() {
		return  this.userManager.fullName;
	};

	this.setUserManager = function (userManager) {
		this.userManager = userManager;
	};

	this.getPropertiesEnvironment = function() {
		return this.propertiesEnvironment;
	};

	this.setPropertiesEnvironment = function (propertiesEnvironment) {
		this.propertiesEnvironment = propertiesEnvironment;
	};

	this.create = function (sessionId, sessionData) {
		this.id = sessionId;
		if (null != sessionData) {
			this.userManager = sessionData.userManager;
			this.propertiesEnvironment = sessionData.propertiesEnvironment;
		}
	};
	this.destroy = function () {
		this.id = null;
		this.userManager = null;
		this.propertiesEnvironment = null;
	};
})
;

'use strict';
angular.module('autonomyApp.buyerStudy')
.factory('BuyerStudyResource',['$resource','REST_URLS', function ($resource, REST_URLS) {

	return $resource(REST_URLS.BUYER_STUDY_REST_URL, {},
			{
		'update' : { method:'PUT'}
			});
}])

.factory('BuyerStudyWebSocketService',['$http','$q','REST_URLS','localStorageService','$timeout','growl','$stomp','Logger','spinnerService', function ($http,$q,REST_URLS,localStorageService,$timeout,growl,$stomp,Logger,spinnerService) {

	var logger = Logger.getInstance('BuyerStudyWebSocketService');
	
	var service = {},
		listener = $q.defer(),
		socket = {
		client: null,
		stomp: null,
		subscription:null,
		sessionId:null
	},messagesReceived = {};

	service.RECONNECT_TIMEOUT = 3000;
	service.SOCKET_URL = '/autonomyView/ws/bccontract';
	service.CONTRACT_QUEUE = '/user/queue/message';
	service.CONTRACT_QUEUE_ERROR = '/user/queue/error';
	service.CONTRACT_BROKER = '/app/ws/bccontract';
	service.CONTRACT_BROKER_CHECK = '/app/ws/bccontract/checkconnection';
	service.MAX_RECONNECT_TIME = 5;
	service.CONNECT_COUNTER = 0;


	service.receive = function() {
		return listener.promise;
	};

	service.send = function(caseId, scenarioId) {
		socket.stomp.send(service.CONTRACT_BROKER, {
			priority: 9
		}, JSON.stringify({
			caseId: caseId,
			scenarioId: scenarioId
		}));

	};

	service.isConnected = function() {
		return socket.stomp !== null;
	};

	service.disconnect = function() {
		if(socket.stomp !== null) {
			socket.subscription.unsubscribe();

			socket.stomp.disconnect(function () {
				socket.stomp = null;
				socket.client = null;
				socket.subscription = null;
				logger.debug('debug', 'Disconnected');
			});
		}
	};

	var reconnect = function() {
		logger.debug('debug', 'Lost connection. Reconnect !!!');
		if(service.CONNECT_COUNTER <= service.MAX_RECONNECT_TIME) {
			$timeout(function() {
				service.initialize();
			}, service.RECONNECT_TIMEOUT);			
		} else {
			logger.debug('MAX RECONNECT TIME EXCEEDED');
			service.CONNECT_COUNTER = 0;
			growl.error('buyerstudy.check.buyers.compatibility.failed.error');
			listener.notify({'type':'END','data':''});
			socket.stomp = null;
		}
	};

	var getMessage = function(data) {
		//You may need to add some more process

		messagesReceived[service.sessionId].push(data);

		logger.debug('debug', messagesReceived);
		return data;
	};

	var connectCallback = function() {
		var sessionId = Math.floor(Math.random() * 1000000);
		service.sessionId = sessionId;
		messagesReceived = {};
		messagesReceived[sessionId] = [];

		socket.subscription = socket.stomp.subscribe(service.CONTRACT_QUEUE, function(data) {

			var result = JSON.parse(data.body);
			if (result.type == 'END') {
				service.disconnect();
				listener.notify({'type':'END','data':''});
			}else {
				listener.notify(result);
			}
		});

		socket.subscription = socket.stomp.subscribe(service.CONTRACT_QUEUE_ERROR, function(data) {
			service.disconnect();
			growl.error('buyerstudy.check.buyers.compatibility.failed.error');
			listener.notify({'type':'END','data':''});
		});

		service.send(localStorageService.get('caseId'),localStorageService.get('scenarioId'));
	};

	var errorCallback = function (error) {
	    logger.debug('debug', 'STOMP: ' + error);
	    logger.debug('debug', 'STOMP: Reconnecting in 6 seconds');
	    reconnect();
	};

	service.initialize = function() {
		service.CONNECT_COUNTER ++;
		var ws = new SockJS(service.SOCKET_URL);
		socket.client = ws;
		socket.stomp = Stomp.over(socket.client);
		socket.stomp.connect(service.SOCKET_URL, connectCallback,errorCallback);
	};
	return service;
}])

.factory('BuyerStudyService', ['$http','$q','Session', 'REST_URLS','localStorageService','$sce','growl','Logger', function($http, $q, Session, REST_URLS,localStorageService,$sce,growl,Logger) {
	var logger = Logger.getInstance('BuyerStudyService');
	return {
		tokenLoginAs:null,
		cofanetViewLogoutUrl:null,
		getLoginAsTokenParam: function() {
			if(this.tokenLoginAs == null) {
				var deferred = $q.defer();
				$http({
					method: 'GET',
					url: REST_URLS.COFANET_LOGIN_AS_REST_URL
				}).success(function(data) {
					deferred.resolve(data);
				}).error(function(msg, code) {
					deferred.reject(msg);
				});
				this.tokenLoginAs = deferred.promise;
				return deferred.promise;
			} else {
				return this.tokenLoginAs;
			}
		},
		logoutCofanet : function() {
			logger.debug('debug', 'logoutCofanet');
			if(this.cofanetViewLogoutUrl == null) {
				this.cofanetViewLogoutUrl = Session.getPropertiesEnvironment().buyerStudyCofanetViewLogoutUrl;
			}
			logger.debug('debug', 'logoutCofanetViewURL ' + this.logoutCofanetViewURL);
			if(this.cofanetViewLogoutUrl != null) {
				var deferred = $q.defer();
				$http({
					method: 'PATCH',
					url: this.cofanetViewLogoutUrl
				}).success(function(data) {
					deferred.resolve(data);
				}).error(function(msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			}
		},
		getPortfolioLines: function() {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET',
				url: REST_URLS.BUYER_STUDY_GET_PORTFOLIO_REST_URL.replace(':caseId',localStorageService.get('caseId'))
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		businessCaseSync: function() {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'GET',
				url: REST_URLS.BUYERSTUDY_BUSINESS_CASE_SYNC_REST_URL.replace(':scenarioId',localStorageService.get('scenarioId'))
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


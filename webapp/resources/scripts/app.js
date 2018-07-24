'use strict';

/**
 * @ngdoc overview
 * @name autonomyApp
 * @description
 * # autonomyApp
 *
 * Main module of the application.
 */
angular
  .module('autonomyApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ngOnload',
    'ngStomp',
    'ngCsv',
    'ngFileSaver',
    'ui.router',
    'ui.bootstrap',
    'LocalStorageModule',
    'pascalprecht.translate',
    'angularSpinners',
    'datatables',
    'datatables.bootstrap',
    'duScroll',
    'angular-confirm',
    'ny.logger',
    'chart.js',
    'ngInputModified',
//    'popoverToggle',
    'angular-growl',
//    'angular.filter',
    'dndLists',
    'ngIdle', // Defect #435: Session logging out following a timeout wrongly managed
    'ui.select',
    'autonomyApp.auth',
    'autonomyApp.search',
    'autonomyApp.questionnaire',
    'autonomyApp.buyerStudy',
    'autonomyApp.policy',
    'autonomyApp.derogation',
    'autonomyApp.proposal',
    'autonomyApp.finalization',
    'autonomyApp.diagnosis',
    'autonomyApp.filter',
    'autonomyApp.directive',
    'autonomyApp.nomenclature',
    'autonomyApp.scenario',
    'autonomyApp.menuController',
    'autonomyApp.verticalMenu',
    'autonomyApp.contract',
    'autonomyApp.transformation',
    'autonomyApp.calculator',
    'autonomyApp.graph',
    'autonomyApp.transformContract',
    'autonomyApp.generationDocumentValidation',
    'autonomyApp.smart',
    'autonomyApp.salesDiscussions'
  ])

  .value('duScrollDuration', 1000)
  .value('duScrollOffset', 30)

   .constant('REST_URLS', {
     TRANSLATE_LOADER_URL: 'http://localhost:8888/autonomyView/rest/messageBundle',
     TRANSLATE_UPDATE_COOKIE_LANG_REST_URL: 'http://localhost:8888/autonomyView/rest/language',
     UPDATE_RATE_IN_PERCENT_REST_URL: 'http://localhost:8888/autonomyView/rest/updateRateInPercent',
     UPDATE_LANGUAGE_REST_URL: 'http://localhost:8888/autonomyView/rest/updateLanguage',
     //********************  Remove the comment line if you want to test with a admin user *************************************// 
	 USER_MANAGER_REST_URL: 'http://localhost:8888/autonomyView/rest/adminSessionUser',     
	 //********************  Remove the comment line if you want to test with a restricted user *******************************//   
	 //USER_MANAGER_REST_URL: 'http://localhost:8888/autonomyView/rest/restrictedSessionUser',
	 
	 QUESTIONNAIRE_REST_URL: 'http://localhost:8888/autonomyView/rest/questionnaire/:caseId/:scenarioId',
     SPECIFIC_QUESTIONNAIRE_REST_URL: 'http://localhost:8888/autonomyView/rest/questionnaire/specificQuestionnaire/:caseId/:scenarioId',
     QUESTIONNAIRE_KYC_NOTATION_INFO_REST_URL: 'http://localhost:8888/autonomyView/rest/questionnaire/getKYCNotationInfo/:caseId',
     QUESTIONNAIRE_PARTNER_INFO_REST_URL: 'http://localhost:8888/autonomyView/rest/questionnaire/getPartnerInfo/:cardId/:caseId',
     QUESTIONNAIRE_PARTNER_LIST_REST_URL: 'http://localhost:8888/autonomyView/rest/questionnaire/getListPartners',
     QUESTIONNAIRE_REQUEST_QUOTE_INFO_REST_URL: 'http://localhost:8888/autonomyView/rest/questionnaire/requestQuoteInfo/:caseId/:scenarioId',
     BUYER_STUDY_REST_URL: 'http://localhost:8888/autonomyView/rest/buyerstudy/:scenarioId',
     BUYER_STUDY_GET_PORTFOLIO_REST_URL: 'http://localhost:8888/autonomyView/rest/buyerstudy/:caseId/portfolio',
     COFANET_LOGIN_AS_REST_URL: 'http://localhost:8888/autonomyView/rest/buyerstudy/loginastoken',
     POLICY_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/:scenarioId',
     POLICY_UPDATE_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/:policyId',
     POLICY_QUOTE_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/:policyId/quote',
     POLICY_QUOTE_CHECK_NEGOTIATED_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/:policyId/checkNegotiated',
     REQUEST_QUOTATION_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/:caseId/:scenarioId/requestQuotation',
     GLOBAL_BCCONTRACT_XML_REST_URL: 'http://localhost:8888/autonomyView/rest/contract/:caseId/getBcContractXml',
     GLOBAL_BCCONTRACT_RIGHT_REST_URL: 'http://localhost:8888/autonomyView/rest/:caseId/getBcContractRight',
     PROPOSAL_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId',
     PROPOSAL_CONTRACT_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/createContract',
     PROPOSAL_CONTRACT_DOC_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/getContract',
     PROPOSAL_NBI_PROPOSAL_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/createNBIProposal',
     PROPOSAL_NBI_PROPOSAL_DOC_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/getNBIProposal',
     PROPOSAL_NBI_QUESTIONNAIRE_EXCEL_FILE_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/getQuestionnaire',
     PROPOSAL_BUYERSTUDY_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/createBUYERSTUDYProposal',
     PROPOSAL_BUYERSTUDY_DOC_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/getBUYERSTUDYProposal',
     PROPOSAL_PRODUCT_XML_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/getProductXml',
     PROPOSAL_VALIDATE_DEROGATION_PROCESS_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/validateDerogationProcess',
     PROPOSAL_VALIDATE_INITIAL_SCENARIO_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/validateInitialScenario',
     PROPOSAL_REQUEST_VALIDATION_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/:isStopRequest/requestValidation',
     PROPOSAL_REQUEST_CONTRACT_EDITION_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/requestContractEdition',
     PROPOSAL_ADD_DISCUSSION_REST_URL: 'http://localhost:8888/autonomyView/rest/proposal/:scenarioId/addDiscussion',
     FINALIZATION_REST_URL: 'http://localhost:8888/autonomyView/rest/finalization/:scenarioId',
     DIAGNOSIS_REST_URL: 'http://localhost:8888/autonomyView/rest/diagnosis/:caseId',
     SEARCH_CASES_REST_URL: 'http://localhost:8888/autonomyView/rest/cases/search',
     SEARCH_CASES_FROM_EASYNUMBER_REST_URL: 'http://localhost:8888/autonomyView/rest/cases/search/:easyNumber',
     CREATE_CASE_REST_URL: 'http://localhost:8888/autonomyView/rest/case/create/:easyNumber',
     CREATE_CASE_FOR_CHECK_MIGRATION_CONTRACT_REST_URL: 'http://localhost:8888/autonomyView/rest/case/create/checkmigration/:contractId',
     CREATE_CLO_CASE_REST_URL: 'http://localhost:8888/autonomyView/rest/case/create/clo/:contractNumber',
     SEARCH_POLICYHOLDER_FROM_CONTRACT_REST_URL: 'http://localhost:8888/autonomyView/rest/contract/:contractId/policyholder',
     TRANSFORM_CONTRACT_REST_URL: 'http://localhost:8888/autonomyView/rest/case/create/transform/:contractId',
     RENEW_CONTRACT_REST_URL: 'http://localhost:8888/autonomyView/rest/case/create/renewal/:contractId',
     TRANSFORM_CONTRACT_CHECK_REST_URL: 'http://localhost:8888/autonomyView/rest/contract/check/:type/:contractNumber',
     LOGOUT_URL: 'http://localhost:8888/autonomyView/logout',
     FINALIZATION_TRANSFER_GCC_REST_URL: 'http://localhost:8888/autonomyView/rest/finalization/:scenarioId/transfergcc',
     FINALIZATION_TRANSFERT_GCC_XML_REST_URL: 'http://localhost:8888/autonomyView/rest/finalization/:caseId/getTransfertGCCXml',
     SCENARIO_LIST_REST_URL: 'http://localhost:8888/autonomyView/rest/scenario/:caseId',
     SCENARIO_ADD_REST_URL: 'http://localhost:8888/autonomyView/rest/scenario/:scenarioId/add',
     SCENARIO_SET_FAVORITE_REST_URL: 'http://localhost:8888/autonomyView/rest/scenario/:scenarioId/setFavorite',
     SCENARIO_SAVE_IN_CUBE_REST_URL: 'http://localhost:8888/autonomyView/rest/scenario/:scenarioId/saveInCube',
     SCENARIO_LOAD_REST_URL: 'http://localhost:8888/autonomyView/rest/scenario/:caseId/:scenarioId/:page/load',
     SCENARIO_UPDATE_REST_URL: 'http://localhost:8888/autonomyView/rest/scenario/:scenarioId/updateScenario',
     POLICY_DEROGATION_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/:scenarioId/derogation',
     BDOC_DATA_EXPORT_JSON_URL: 'http://localhost:8888/autonomyView/exportBdocData/:scenarioId',// Defect #944: Service to list java fields names and content for Excel Export
     BUYERSTUDY_CHECK_BUYERS_COMPATIBILITY_REST_URL: 'http://localhost:8888/autonomyView/rest/buyerstudy/:caseId/:scenarioId/buyerscompatibility',
     BUYERSTUDY_BUSINESS_CASE_SYNC_REST_URL: 'http://localhost:8888/autonomyView/rest/buyerstudy/businessCaseSync/:scenarioId',
     CONTRACT_UPDATE_REST_URL: 'http://localhost:8888/autonomyView/rest/contract/:scenarioId/update',
     TRANSFORMATION_REPORT_REST_URL: 'http://localhost:8888/autonomyView/rest/transformation/report/:caseId',
     SEARCH_ACCOUNT_SEARCH_REST_URL: 'http://localhost:8888/autonomyView/rest/search/account',
     SEARCH_CHANGE_CASES_OWNER_CHECK_REST_URL: 'http://localhost:8888/autonomyView/rest/search/cases/owner/change/:accountId',
     DEFAULT_COUNTRIES_ZONE_SPLITTING_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/countrieszonesplitting/:scenarioId/:priceZoning',
     CASE_EXPORT_URL: 'http://localhost:8888/autonomyView/exportCase?caseId=:caseId&scenarioId=:scenarioId&page=:page',
     KEEP_SESSION_ALIVE: 'http://localhost:8888/autonomyView/rest/keepSessionAlive', // Defect #435: Session logging out following a timeout wrongly managed
     SMART_UPDATE_REST_URL: 'http://localhost:8888/autonomyView/rest/smart/:scenarioId/updateSmartCase', //Defect #21: Interactions with SMART - Update Sales Funnel
     SEARCH_CASES_EXPORT_REST_URL: 'http://localhost:8888/autonomyView/rest/cases/export/:page', //Defect #770: FR Feedback-Excel Reporting of cases
     POLICY_EXTENSION_AFFILIATE_REST_URL: 'http://localhost:8888/autonomyView/rest/policy/extensionAffiliate/:caseId/:policyId/:roleRef',
     SALES_DISCUSSIONS_REST_URL : 'http://localhost:8888/autonomyView/rest/salesDiscussions/:caseId',
     FINALIZATION_CANCEL_PROJECT_REST_URL: 'http://localhost:8888/autonomyView/rest/finalization/:caseId/:scenarioId/cancelProject'
   })

  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
    accessDenied: 'access-denied',
    badRequest: 'bad-request'
  })

  .constant('DIVERS_EVENTS', {
    scenarioCurrent: 'scenario-current',
    scenarioUpdated: 'scenario-updated',
    scenarioQuestionnaireUpdated: 'scenario-questionnaire-updated',
    scenarioPolicyUpdated: 'scenario-policy-updated',
    scenarioProposalUpdated: 'scenario-proposal-updated',
    scenarioFinalizationUpdated: 'scenario-finalization-updated',
    scenarioValidated: 'scenario-validated',
    bcContractRightChanged:'bc-contract-right-changed',
    casesOwnerChanged:'cases-owner-changed',
    requestQuotationChanged:'request-quotation-changed'
  })

  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
  })

  //.config(function simulateNetworkLatency($httpProvider) {
  //  $httpProvider.interceptors.push(httpDelay);
  //  // I add a delay to both successful and failed responses.
  //  function httpDelay($timeout, $q) {
  //    var delayInMilliseconds = 2000;
  //    // Return our interceptor configuration.
  //    return ({
  //      response: response,
  //      responseError: responseError
  //    });
  //    // ---
  //    // PUBLIC METHODS.
  //    // ---
  //    // I intercept successful responses.
  //    function response(response) {
  //      var deferred = $q.defer();
  //      $timeout(
  //        function () {
  //          deferred.resolve(response);
  //        },
  //        delayInMilliseconds,
  //        // There's no need to trigger a $digest - the view-model has
  //        // not been changed.
  //        false
  //      );
  //      return ( deferred.promise );
  //    }
  //
  //    // I intercept error responses.
  //    function responseError(response) {
  //      var deferred = $q.defer();
  //      $timeout(
  //        function () {
  //          deferred.reject(response);
  //        },
  //        delayInMilliseconds,
  //        // There's no need to trigger a $digest - the view-model has
  //        // not been changed.
  //        false
  //      );
  //      return ( deferred.promise );
  //    }
  //  }
  //})

  .config(['$httpProvider', function ($httpProvider) {

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.interceptors.push([
      '$injector',
      function ($injector) {
        return $injector.get('AuthInterceptor');
      }
    ]);
  }])
  .config(['$translateProvider', 'REST_URLS','$cookiesProvider', function ($translateProvider, REST_URLS,$cookiesProvider) {
    $translateProvider.useLoader('translationLoader', angular.extend({url: REST_URLS.TRANSLATE_LOADER_URL}));
    //$translateProvider.preferredLanguage('en');
    //$translateProvider.fallbackLanguage('en');
    //$translateProvider.useCookieStorage();
    //defect #134 ToolTips dont support Special characters
    $translateProvider.useSanitizeValueStrategy('escape');
    //$translateProvider.determinePreferredLanguage();
  }])
  .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('autonomy');
    localStorageServiceProvider.setStorageType('sessionStorage');
  }])
  .config(function (inputModifiedConfigProvider) {
    inputModifiedConfigProvider
      .disableGlobally();
  })
  .config(function ($tooltipProvider) {
	  $tooltipProvider.options({appendToBody: true});
  })
  .config(['growlProvider', '$httpProvider', function (growlProvider, $httpProvider) {
    growlProvider.onlyUniqueMessages(false);
    growlProvider.messagesKey('messages');
    growlProvider.messageTextKey('code');
    growlProvider.messageSeverityKey('severity');
    growlProvider.globalDisableCloseButton(false);
    growlProvider.globalDisableIcons(true);
    growlProvider.globalDisableCountDown(true);
    growlProvider.globalReversedOrder(false);
    growlProvider.globalTimeToLive({success: 3000, error: -1, warning: 4000, info: 3000});
    $httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);
  }])
  .config(['KeepaliveProvider', 'IdleProvider','REST_URLS', function(KeepaliveProvider, IdleProvider,REST_URLS) {
  // Defect #435: Session logging out following a timeout wrongly managed
    KeepaliveProvider.http({
      method: 'GET',
      url: REST_URLS.KEEP_SESSION_ALIVE
    });
  }])
  .config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {
    $stateProvider
      .state('app', {
        url: '/',
        views: {
          'header': {
            templateUrl: 'views/header/header.html',
            controller: 'UserInfoController',
            resolve: {
              loadUserSession: function (AuthService) {
                return AuthService.getSession();
              }
            }
          },
          'menu': {
            templateUrl: 'views/menu/menu.html',
            controller: 'MenuController'
          },
          'vertical-menu': {
            templateUrl: 'views/menu/vertical-menu.html',
            controller: 'VerticalMenuController',
          },
          'content': {
            templateUrl: 'views/search/main.html',
            controller: 'SearchController',
            resolve: {
              loadCases: function (SearchService,localStorageService) {
            	var formCriteriaCached = localStorageService.get('formCriteria');
          		if(null != formCriteriaCached) {
          			var startDate = formCriteriaCached.startDate;
              		var endDate = formCriteriaCached.endDate;
              		if(startDate != null && startDate.length > 0) {
              			var startDates = startDate.split('.');
              			startDate = new Date(startDates[2], startDates[1] - 1, startDates[0]);
              			formCriteriaCached.startDate = startDate;
              		}
              		if(endDate != null && endDate.length > 0) {
              			var endDates = endDate.split('.');
              			endDate = new Date(endDates[2], endDates[1] - 1, endDates[0]);
              			formCriteriaCached.endDate = endDate;
              		}
          			return SearchService.search(formCriteriaCached);
          		} else {
          			return SearchService.search({});
          		}
              }
            }
          },
          'footer': {
            templateUrl: 'views/footer/footer.html'
          }
        }
      })

      .state('app.questionnaire', {
        url: 'questionnaire/:caseId/:scenarioId',
        views: {
          'content@': {
            templateUrl: 'views/questionnaire/main.html',
            controller: 'QuestionnaireController',
            params: ['caseId', 'scenarioId'],
            resolve: {
              loadQuestionnaire: function (QuestionnaireResource, localStorageService) {
            	  console.log('loadQuestionnaire');
                var questionnairePromise = QuestionnaireResource.get({
                  caseId: localStorageService.get('caseId'),
                  scenarioId: localStorageService.get('scenarioId')
                });

                return questionnairePromise.$promise;
              }
            }
          }
        }
      })
      .state('app.policy', {
        url: 'policy/:caseId/:scenarioId',

        views: {
          'content@': {
            templateUrl: 'views/policy/main.html',
            controller: 'PolicyController',
            params: ['caseId', 'scenarioId'],
            resolve: {
              loadPolicy: function (PolicyResource, localStorageService) {
            	  console.log('loadPolicy');
            	  var policyPromise = PolicyResource.get({
                  scenarioId: localStorageService.get('scenarioId')
                });

                return policyPromise.$promise;
              }
            }
          }
        }
      })
      .state('app.buyerstudy', {
        url: 'buyerstudy/:caseId/:scenarioId',
        views: {
          'content@': {
            templateUrl: 'views/buyerstudy/main.html',
            controller: 'BuyerStudyController',
            params: ['caseId', 'scenarioId'],
            resolve: {
              loadBuyerStudy: function (BuyerStudyResource, localStorageService) {
                var buyerStudyPromise = BuyerStudyResource.get({
                  scenarioId: localStorageService.get('scenarioId')
                });

                return buyerStudyPromise.$promise;
              }
            }
          }
        }
      })
      .state('app.proposal', {
        url: 'proposal/:caseId/:scenarioId',
        views: {
          'content@': {
            templateUrl: 'views/proposal/main.html',
            controller: 'ProposalController',
            params: ['caseId', 'scenarioId'],
            resolve: {
              loadProposal: function (ProposalResource, localStorageService) {
                var proposalPromise = ProposalResource.get({
                  scenarioId: localStorageService.get('scenarioId')
                });

                return proposalPromise.$promise;
              }
            }
          }
        }
      })
      .state('app.finalization', {
	    	  url: 'finalization/:caseId/:scenarioId',
	    	  views: {
	    		  'content@': {
	    			  templateUrl: 'views/finalization/main.html',
	    			  controller: 'FinalizationController',
	    			  params: ['caseId', 'scenarioId'],
	    			  resolve: {
	    				  loadFinalization: function (FinalizationResource, Session, localStorageService) {
	    					  
	    					  var finalizationPromise = FinalizationResource.get({scenarioId: localStorageService.get('scenarioId')});
	    					  return finalizationPromise.$promise;
	    					  
	    				  }
	    			  }

	    		  }
	    	  }
	      });

    $urlRouterProvider.otherwise('/');

  })
  // Override Angular $exceptionHandler service.
  .factory('$exceptionHandler', ['$log', 'spinnerService', function ($log, spinnerService) {
    return function (err, cause) {
      spinnerService.hideAll();
      //$log.error.apply($log, arguments);
    };
  }])
  .factory('translationLoader', ['$http', '$q', 'NomenclatureService', function ($http, $q, NomenclatureService) {
    // return loaderFn
    return function (options) {

      if (!options || !options.url) {
        throw new Error('Couldn\'t use urlLoader since no url is given!');
      }

      var requestParams = {};

      requestParams[options.queryParameter || 'lang'] = options.key;

      return $http(angular.extend({
        url: options.url,
        params: requestParams,
        method: 'GET'
      }, options.$http))
        .then(function (result) {
          NomenclatureService.setCountries(requestParams.lang, result.data.country);
          NomenclatureService.setSectors(requestParams.lang, result.data.sector);
          NomenclatureService.setCivilities(requestParams.lang, result.data.civility);
          NomenclatureService.setServiceProviders(requestParams.lang, result.data.serviceProvider);
          NomenclatureService.setScenarioFrozenReasons(requestParams.lang, result.data.scenarioFrozenReasons);
          NomenclatureService.setNaces(requestParams.lang, result.data.nace);
          NomenclatureService.setBadDebtsYearThreshold(result.data.badDebtsYearThreshold);
          return result.data;
        }, function () {
          return $q.reject(options.key);
        });
    };
  }])

  .factory('UrlLanguageStorage', ['$location', function ($location) {
    return {
      set: function (name, value) {
      },
      get: function (name) {
        return $location.search()['lang'];
      }
    };
  }])

  .factory('AuthInterceptor', function ($rootScope, $q,
                                        AUTH_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
          //'-1' : AUTH_EVENTS.sessionTimeout, // Defect #435: Session logging out following a timeout wrongly managed
          //302: AUTH_EVENTS.sessionTimeout, // Defect #435
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized,
          405: AUTH_EVENTS.sessionTimeout,
          419: AUTH_EVENTS.sessionTimeout,
          422: AUTH_EVENTS.accessDenied,
          440: AUTH_EVENTS.sessionTimeout
        }[response.status], response);

        return $q.reject(response);
      }
    };
  })

  .controller('AccordionCtrl', ['$scope','PolicyService',  function ($scope,PolicyService) {
    $scope.PolicyService = PolicyService;
    $scope.oneAtATime = true;
    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };
  }])

  .run(['$rootScope', '$state', 'AUTH_EVENTS', 'AuthService', '$window', 'Logger', 'localStorageService', 'spinnerService', '$templateCache', 'DIVERS_EVENTS','BuyerStudyWebSocketService','Session','VerticalMenuService','ScenarioService','ScenarioDataService','$translate', function ($rootScope, $state, AUTH_EVENTS, AuthService, $window, Logger, localStorageService, spinnerService, $templateCache, DIVERS_EVENTS,BuyerStudyWebSocketService,Session,VerticalMenuService,ScenarioService,ScenarioDataService,$translate) {

    var logger = Logger.getInstance('Run');

    /**
     * Some template caches override
     */

    $templateCache.put('template/accordion/accordion-group.html',
      '<div class=\"panel panel-default\" ng-class=\"{\'panel-open\': isOpen}\">\n' +
      '  <div class="panel-heading">\n' +
      '    <h4 class="panel-title">\n' +
      "      <a href tabindex=\"0\" class=\"accordion-toggle\" ng-class=\"{'collapsed': !isOpen}\" ng-click=\"toggleOpen()\" accordion-transclude=\"heading\"><span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
      '    </h4>\n' +
      '  </div>\n' +
      '  <div class=\"panel-collapse collapse\" collapse=\"!isOpen\">\n' +
      '	  <div class=\"panel-body\" ng-transclude></div>\n' +
      '  </div>\n' +
      '</div>\n');

    $templateCache.put('templates/growl/growl.html', '<div class="growl-container" ng-class="wrapperClasses()">'
    + '<div class="growl-item alert" ng-repeat="message in growlMessages.directives[referenceId].messages" ng-class="alertClasses(message)">'
    + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="growlMessages.deleteMessage(message)" ng-show="!message.disableCloseButton"><i class="fa fa-close"></i></button>'
    + '<i class="fa fa-info-circle"></i><i class="fa fa-bug"></i><i class="fa fa-warning"></i><i class="fa fa-thumbs-o-up"></i>'
    + '<div class="growl-message" ng-bind-html="message.text | translate:message.variables"></div>'
    + '</div></div>');

    $rootScope.$state = $state;
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function (event, data) {

      logger.log('Go to the login page');
      AuthService.logout(); // Defect #435: Session logging out following a timeout wrongly managed
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function (event, data) {
        logger.log('Go to the login page');
        AuthService.logout(); // Defect #435: Session logging out following a timeout wrongly managed
     });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    	logger.log('Success Go to {0} page with params {1}', [toState.name,JSON.stringify(toParams)]);
      spinnerService.hideGroup('global');

    //defect #590 : FR feedback: Change display of scenarios
      /*
       * 5) In case of access to an inactive scenario via an URL (ex from cube, worklist, etc) :
       *  a warning box indicates " scenario {index of scenario} is inactive"  , favourite scenario will be opened : button [OK]
			After OK is clicked, switched on favourite scenario
       */
      var scenarioInactive = false;
      var scenarioNumber = false;
      var scenarioFavoriteId = null;
      angular.forEach(ScenarioDataService.getScenarioList(), function (scenario, key) {
          if (localStorageService.get('scenarioId') == scenario.scenarioId && scenario.state == 'INACTIVE') {
        	  scenarioInactive = true;
        	  scenarioNumber = scenario.scenarioNumber;
          }

          if(scenario.favorite) {
        	  scenarioFavoriteId = scenario.scenarioId;
          }
        });

      if(scenarioInactive) {
		  alert($translate.instant('current.scenario.inactive.alert.msg',{p0:scenarioNumber}));
		  $state.go(toState.name,{ caseId: localStorageService.get('caseId'),scenarioId:scenarioFavoriteId });
	  }
    });

    $rootScope.$on('$stateChangeError',
    	      function (event, toState, toParams, fromState, fromParams) {
    	spinnerService.hideGroup('global');
    });

    $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {
        logger.log('Go to {0} page with params {1}', [toState.name,JSON.stringify(toParams)]);

        spinnerService.hideGroup('global');
        spinnerService.show('loadingDataSpinner');

        /*
        if(toState.name === 'app.finalization') {
        	if(!AuthService.getSession().hasBackofficeRight) {
        		logger.log('Access denied to finalization page');
        		//Cancel the event
                event.preventDefault();
                $state.go('app');
                return;
        	}
        }
        */

    	//Reput the caseId in root if F5 is clicked
        if (angular.isUndefined($rootScope.caseId) && localStorageService.get('caseId') != null) {
          $rootScope.caseId = localStorageService.get('caseId');
        }

        if (angular.isUndefined($rootScope.scenarioId) && localStorageService.get('scenarioId') != null) {
          $rootScope.scenarioId = localStorageService.get('scenarioId');
        }

        //Store the caseId in local storage
        if (toState.name !== 'app') {
          if (!angular.isUndefined(toParams.caseId) && toParams.caseId != '' && !angular.isUndefined(toParams.scenarioId) && toParams.scenarioId != '') {
            if (localStorageService.isSupported) {
              var currentCaseId = localStorageService.get('caseId');
              var currentScenarioId = localStorageService.get('scenarioId');
              var scenarioList = ScenarioDataService.getScenarioList();
              if(currentCaseId == null || currentCaseId == '' || currentCaseId != toParams.caseId || currentScenarioId != toParams.scenarioId || scenarioList == null) {
            	  localStorageService.set('caseId', toParams.caseId);
                  localStorageService.set('scenarioId', toParams.scenarioId);
                  $rootScope.caseId = localStorageService.get('caseId');
                  $rootScope.scenarioId = localStorageService.get('scenarioId');

                  //reload bcContractRight and scenarioList
          		  VerticalMenuService.getBcContractRight(localStorageService.get('caseId')).then(function (response) {
                        ScenarioDataService.setBcContractRight(response);
                      });
          		  ScenarioService.list(localStorageService.get('caseId')).then(function (response) {
                          ScenarioDataService.setScenarioList(response);

//                          //defect #590 : FR feedback: Change display of scenarios
//                          /*
//                           * 5) In case of access to an inactive scenario via an URL (ex from cube, worklist, etc) :
//                           *  a warning box indicates " scenario {index of scenario} is inactive"  , favourite scenario will be opened : button [OK]
//								After OK is clicked, switched on favourite scenario
//                           */
//                          var scenarioInactive = false;
//                          var scenarioNumber = false;
//                          var scenarioFavoriteId = null;
//                          angular.forEach(ScenarioDataService.scenarioList, function (scenario, key) {
//                              if (localStorageService.get('scenarioId') == scenario.scenarioId && scenario.state == 'INACTIVE') {
//                            	  scenarioInactive = true;
//                            	  scenarioNumber = scenario.scenarioNumber;
//                              }
//
//                              if(scenario.favorite) {
//                            	  scenarioFavoriteId = scenario.scenarioId;
//                              }
//                            });
//
//                          if(scenarioInactive) {
//                    		  alert($translate.instant('current.scenario.inactive.alert.msg',{p0:scenarioNumber}));
//                    		  $state.go(toState.name,{ caseId: localStorageService.get('caseId'),scenarioId:scenarioFavoriteId });
//                    	  }

          		  });
              }
            }
            else {
              alert("his browser doesn't support the local storage");
            }
          }
          else if (localStorageService.get('caseId') === null) {
            //Cancel the event
            event.preventDefault();
            $state.go('app');
          }
        }

        $window.onbeforeunload = function () {
        	if(BuyerStudyWebSocketService.isConnected()) {
        		logger.log('WebSocket is opened. Disconnect websocket.');
        		BuyerStudyWebSocketService.disconnect();
        	} else {
        		logger.log('WebSocket is not opened. Nothing to do;');
        	}
        };

      });
  }]);

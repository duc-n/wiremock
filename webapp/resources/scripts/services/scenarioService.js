'use strict';
angular.module('autonomyApp.scenario', [])
  .factory('ScenarioService', ['$http', '$q', 'REST_URLS', 'DIVERS_EVENTS', '$rootScope', function ($http, $q, REST_URLS, DIVERS_EVENTS, $rootScope) {
    return {
      isReadOnly: false,
      list: function (caseId) {

        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: REST_URLS.SCENARIO_LIST_REST_URL.replace(':caseId', caseId)
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      },
      add: function (caseId, scenarioId, objectDTO) {

        var deferred = $q.defer();
        $http({
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          data: objectDTO,
          url: REST_URLS.SCENARIO_ADD_REST_URL.replace(':scenarioId', scenarioId)
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      },
      load: function (caseId, scenarioId, page) {

        var deferred = $q.defer();
        $http({
          method: 'POST',
          url: REST_URLS.SCENARIO_LOAD_REST_URL.replace(':caseId', caseId).replace(':scenarioId', scenarioId).replace(':page', page)
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      },
      markAsFavorite: function (scenarioId) {

        var deferred = $q.defer();
        $http({
          method: 'PUT',
          url: REST_URLS.SCENARIO_SET_FAVORITE_REST_URL.replace(':scenarioId', scenarioId)
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      },
      saveContractInCube: function (scenarioId) {

        var deferred = $q.defer();
        $http({
          method: 'PUT',
          url: REST_URLS.SCENARIO_SAVE_IN_CUBE_REST_URL.replace(':scenarioId', scenarioId)
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      },
      update: function (scenarioId, scenario) {

        var deferred = $q.defer();
        $http({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: scenario,
          url: REST_URLS.SCENARIO_UPDATE_REST_URL.replace(':scenarioId', scenarioId)
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
        });
        return deferred.promise;
      }
    };
  }])
  .factory('ScenarioDataService', ['ScenarioService', 'localStorageService', function (ScenarioService, localStorageService) {

    var scenarioList = null,
      bcContractRight = null,
      pricingObsolete = false,
      currentScenario = null;

    return {
      getScenarioList: getScenarioList,
      setScenarioList: setScenarioList,
      addScenarioToList: addScenarioToList,
      reloadScenarioList: reloadScenarioList,
      updateCurrentScenario : updateCurrentScenario,

      getBcContractRight: getBcContractRight,
      setBcContractRight: setBcContractRight,

      getPricingObsolete: getPricingObsolete,
      setPricingObsolete: setPricingObsolete,

      getCurrentScenario: getCurrentScenario,
      setCurrentScenario: setCurrentScenario,
      setCurrentScenarioAsFavorite: setCurrentScenarioAsFavorite,
      isCurrentScenarioFavorite: isCurrentScenarioFavorite,
      findScenarioInList: findScenarioInList
    };

    function getScenarioList() {
      return scenarioList;
    }

    function setScenarioList(scenarioList_) {
      scenarioList = scenarioList_;
      updateCurrentScenario();
     
    }

    function addScenarioToList(scenarioList_) {
      if (null === scenarioList) {
        scenarioList = [];
      }
      scenarioList.push(scenarioList_);
    }

    function findScenarioInList(scenarioId) {
      var result = null

      for (var i = 0; i < scenarioList.length; i++) {
        if (scenarioList[i].scenarioId === scenarioId) {
          result = scenarioList[i];
          break;
        }
      }
      return result;
    }

    function reloadScenarioList() {
      ScenarioService.list(localStorageService.get('caseId')).then(function (response) {
        var scenarioInList = null;
        angular.forEach(response, function (scenario, key) {
          scenarioInList = findScenarioInList(scenario.scenarioId);
          if (null !== scenarioInList) {
            angular.extend(scenarioInList, scenario);
          }
        });
      });
    }

    function getBcContractRight() {
      return bcContractRight;
    }

    function setBcContractRight(bcContractRight_) {
      bcContractRight = bcContractRight_;
    }

    function getPricingObsolete() {
      return pricingObsolete;
    }

    function setPricingObsolete(pricingObsolete_) {
      pricingObsolete = pricingObsolete_;
    }

    function getCurrentScenario() {
      return currentScenario;
    }

    function setCurrentScenario(currentScenario_) {
      currentScenario = currentScenario_;
      currentScenario.specificQuestionnaireChanged = false;
    }
    
    function updateCurrentScenario() {
    	 angular.forEach(scenarioList, function (scenario, key) {
    		 
 			if (localStorageService.get('scenarioId') && localStorageService.get('scenarioId') == scenario.scenarioId) {
 				setCurrentScenario(scenario);
 				return;
 			}
 		});
      }

    function setCurrentScenarioAsFavorite() {
      if (null != currentScenario) {
        angular.forEach(scenarioList, function (scenario, key) {
          if (currentScenario.scenarioId == scenario.scenarioId) {
            scenario.favorite = true;
          }
          else {
            scenario.favorite = false;
          }
        });
      }
    }

    function isCurrentScenarioFavorite() {
      return ( null !== currentScenario && true === currentScenario.favorite );
    }

  }])
;

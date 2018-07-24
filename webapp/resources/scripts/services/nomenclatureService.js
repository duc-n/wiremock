'use strict';
angular.module('autonomyApp.nomenclature',[])
  .service('NomenclatureService', function () {

    var countries = {};
    var countryCodes = [];
    var sectors = {};
    var civilities = {};
    var serviceProviders = {};
    var scenarioFrozenReasons = {};
    var currencies = [];
    var naces = {};
    var badDebtsYearThreshold;

    this.getCivilities = function (locale) {
      return civilities[locale];
    };

    this.setCivilities = function (locale, civility) {
      civilities[locale] = civility;
    };

    this.getServiceProviders = function (locale) {
        return serviceProviders[locale];
      };

	  this.setServiceProviders = function (locale, serviceProvider) {
		  serviceProviders[locale] = serviceProvider;
	  };

    this.getScenarioFrozenReasons = function (locale) {
      return scenarioFrozenReasons[locale];
    };

    this.setScenarioFrozenReasons = function (locale, serviceProvider) {
      scenarioFrozenReasons[locale] = serviceProvider;
    };

    this.getCountries = function (locale) {
      return countries[locale];
    };

    this.getCountryCodes = function () {
      return countryCodes;
    };

    this.setCountries = function (locale, country) {
      countries[locale] = country;
      if (countryCodes.length == 0) {
        angular.forEach(country, function(value, key) {
          countryCodes.push({"code":key,"selected":false});
        });
      }
    };

    this.getSectors = function (locale) {
      return sectors[locale];
    };

    this.setSectors = function (locale, sector) {
      sectors[locale] = sector;
    };

    this.getCurrencies = function () {
      return currencies;
    };

    this.setCurrencies = function (value) {
      currencies = value;
    };

    this.getNaces = function(locale) {
      return naces[locale];
    };

    this.setNaces = function (locale, nace) {
      naces[locale] = nace;
    };
    
    this.setBadDebtsYearThreshold = function (threshold){
    	badDebtsYearThreshold =threshold 
    };
    
    this.getBadDebtsYearThreshold = function (){
    	return badDebtsYearThreshold; 
    };

  });

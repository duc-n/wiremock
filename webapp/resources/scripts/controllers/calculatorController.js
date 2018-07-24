'use strict';

//defect #163: Affichages module de tarification dans TransLiner
angular.module('autonomyApp.calculator', [])
  .controller('CalculatorController', function ($scope, $modalInstance, policy) {
    $scope.splitPremium = policy.splitPremium;
    $scope.isReadOnly = !policy.initialScenario || policy.isReadOnly;
    $scope.ratesCalculator = policy.ratesCalculator;

    $scope.calculator = {
      //premium rate before option
      domesticRateBeforeOptions:null,
      exportRateBeforeOptions:null,
      globalRateBeforeOptions:null,
      zone1RateBeforeOptions:null,
      zone2RateBeforeOptions:null,
      //Turnover for estimation in value
      domesticTurnoverEstimation:null,
      exportTurnoverEstimation:null,
      globalTurnoverEstimation:null,
      zone1TurnoverEstimation:null,
      zone2TurnoverEstimation:null,
      //Estimation premium before options in value
      domesticEstimationBeforeOptions:null,
      exportEstimationBeforeOptions:null,
      globalEstimationBeforeOptions:null,
      zone1EstimationBeforeOptions:null,
      zone2EstimationBeforeOptions:null,
      //Options rates (as a % of premium rates)
      disputedDebtsRate:null,
      extensionMCPRate:null,
      bindingPendingOrderRate:null,
      preshipmentRate:null,
      allOptionsRate:null,
      //Estimation Options in value
      domesticEstimationOptions:null,
      exportEstimationOptions:null,
      globalEstimationOptions:null,
      zone1EstimationOptions:null,
      zone2EstimationOptions:null,
      //Premium rates after options
      domesticRateAfterOptions:null,
      exportRateAfterOptions:null,
      globalRateAfterOptions:null,
      zone1RateAfterOptions:null,
      zone2RateAfterOptions:null,
      //Total Premium + options
      totalPremiumOptDomestic:null,
      totalPremiumOptExport:null,
      totalPremiumOptGlobal:null,
      totalPremiumOptZone1:null,
      totalPremiumOptZone2:null
    };

    $scope.initCalculator = function() {
      if(null != $scope.ratesCalculator) {
        $scope.calculator.domesticRateBeforeOptions = $scope.ratesCalculator.domesticRateBeforeOptions;
        $scope.calculator.exportRateBeforeOptions = $scope.ratesCalculator.exportRateBeforeOptions;
        $scope.calculator.globalRateBeforeOptions = $scope.ratesCalculator.globalRateBeforeOptions;
        $scope.calculator.zone1RateBeforeOptions = $scope.ratesCalculator.zone1RateBeforeOptions;
        $scope.calculator.zone2RateBeforeOptions = $scope.ratesCalculator.zone2RateBeforeOptions;

        $scope.calculator.domesticTurnoverEstimation = $scope.ratesCalculator.domesticTurnoverEstimation;
        $scope.calculator.exportTurnoverEstimation = $scope.ratesCalculator.exportTurnoverEstimation;
        $scope.calculator.globalTurnoverEstimation = $scope.ratesCalculator.globalTurnoverEstimation;
        $scope.calculator.zone1TurnoverEstimation = $scope.ratesCalculator.zone1TurnoverEstimation;
        $scope.calculator.zone2TurnoverEstimation = $scope.ratesCalculator.zone2TurnoverEstimation;

        $scope.calculator.disputedDebtsRate = $scope.ratesCalculator.disputedDebtsRate;
        $scope.calculator.extensionMCPRate = $scope.ratesCalculator.extensionMCPRate;
        $scope.calculator.bindingPendingOrderRate = $scope.ratesCalculator.bindingPendingOrderRate;
        $scope.calculator.preshipmentRate = $scope.ratesCalculator.preshipmentRate;

        //calculate other fields
        $scope.domesticEstimationBeforeOptions();
        $scope.exportEstimationBeforeOptions();
        $scope.globalEstimationBeforeOptions();
        $scope.zone1EstimationBeforeOptions();
        $scope.zone2EstimationBeforeOptions();

        $scope.allOptionsRate();

        $scope.domesticRateAfterOptions();
        $scope.exportRateAfterOptions();
        $scope.globalRateAfterOptions();
        $scope.zone1RateAfterOptions();
        $scope.zone2RateAfterOptions();

        $scope.domesticEstimationOptions();
        $scope.exportEstimationOptions();
        $scope.globalEstimationOptions();
        $scope.zone1EstimationOptions();
        $scope.zone2EstimationOptions();

        $scope.totalPremiumOptDomestic();
        $scope.totalPremiumOptExport();
        $scope.totalPremiumOptGlobal();
        $scope.totalPremiumOptZone1();
        $scope.totalPremiumOptZone2();
      }
    };

    //all Options
    $scope.allOptionsRate = function() {
      $scope.calculator.allOptionsRate = $scope.calculator.disputedDebtsRate + $scope.calculator.extensionMCPRate + $scope.calculator.bindingPendingOrderRate + $scope.calculator.preshipmentRate;
    };

    //estimation premium before options in value
    $scope.domesticEstimationBeforeOptions = function() {
      if(null != $scope.calculator.domesticRateBeforeOptions && null != $scope.calculator.domesticTurnoverEstimation) {
        $scope.calculator.domesticEstimationBeforeOptions =  (($scope.calculator.domesticRateBeforeOptions * $scope.calculator.domesticTurnoverEstimation)/100).toFixed(3);
      } else {
        $scope.calculator.domesticEstimationBeforeOptions = null;
      }
    };

    $scope.exportEstimationBeforeOptions = function() {
      if(null != $scope.calculator.exportRateBeforeOptions && null != $scope.calculator.exportTurnoverEstimation) {
        $scope.calculator.exportEstimationBeforeOptions =  (($scope.calculator.exportRateBeforeOptions * $scope.calculator.exportTurnoverEstimation)/100).toFixed(3);
      } else {
        $scope.calculator.exportEstimationBeforeOptions = null;
      }
    };

    $scope.globalEstimationBeforeOptions = function() {
      if(null != $scope.calculator.globalRateBeforeOptions && null != $scope.calculator.globalTurnoverEstimation) {
        $scope.calculator.globalEstimationBeforeOptions =  (($scope.calculator.globalRateBeforeOptions * $scope.calculator.globalTurnoverEstimation)/100).toFixed(3);
      } else {
        $scope.calculator.globalEstimationBeforeOptions = null;
      }
    };

    $scope.zone1EstimationBeforeOptions = function() {
      if(null != $scope.calculator.zone1RateBeforeOptions && null != $scope.calculator.zone1TurnoverEstimation) {
        $scope.calculator.zone1EstimationBeforeOptions =  (($scope.calculator.zone1RateBeforeOptions * $scope.calculator.zone1TurnoverEstimation)/100).toFixed(3);
      } else {
        $scope.calculator.zone1EstimationBeforeOptions = null;
      }
    };

    $scope.zone2EstimationBeforeOptions = function() {
      if(null != $scope.calculator.zone2RateBeforeOptions && null != $scope.calculator.zone2TurnoverEstimation) {
        $scope.calculator.zone2EstimationBeforeOptions =  (($scope.calculator.zone2RateBeforeOptions * $scope.calculator.zone2TurnoverEstimation)/100).toFixed(3);
      } else {
        $scope.calculator.zone2EstimationBeforeOptions = null;
      }
    };

    //Premium rates after options
    $scope.domesticRateAfterOptions = function() {
      if(null != $scope.calculator.domesticRateBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.domesticRateAfterOptions = (($scope.calculator.domesticRateBeforeOptions * $scope.calculator.allOptionsRate/100) + $scope.calculator.domesticRateBeforeOptions).toFixed(3);
      } else {
        $scope.calculator.domesticRateAfterOptions = null;
      }
    };

    $scope.exportRateAfterOptions = function() {
      if(null != $scope.calculator.exportRateBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.exportRateAfterOptions = (($scope.calculator.exportRateBeforeOptions * $scope.calculator.allOptionsRate/100) + $scope.calculator.exportRateBeforeOptions).toFixed(3);
      } else {
        $scope.calculator.exportRateAfterOptions = null;
      }
    };

    $scope.globalRateAfterOptions = function() {
      if(null != $scope.calculator.globalRateBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.globalRateAfterOptions = (($scope.calculator.globalRateBeforeOptions * $scope.calculator.allOptionsRate/100) + $scope.calculator.globalRateBeforeOptions).toFixed(3);
      } else {
        $scope.calculator.globalRateAfterOptions = null;
      }
    };

    $scope.zone1RateAfterOptions = function() {
      var allOption = $scope.calculator.allOptionsRate;
      if(null != $scope.calculator.zone1RateBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.zone1RateAfterOptions = (($scope.calculator.zone1RateBeforeOptions * $scope.calculator.allOptionsRate/100) + $scope.calculator.zone1RateBeforeOptions).toFixed(3);
      } else {
        $scope.calculator.zone1RateAfterOptions = null;
      }
    };

    $scope.zone2RateAfterOptions = function() {
      if(null != $scope.calculator.zone2RateBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.zone2RateAfterOptions = (($scope.calculator.zone2RateBeforeOptions * $scope.calculator.allOptionsRate/100) + $scope.calculator.zone2RateBeforeOptions).toFixed(3);
      } else {
        $scope.calculator.zone2RateAfterOptions = null;
      }
    };

    //estimation options in value
    $scope.domesticEstimationOptions = function() {
      if(null != $scope.calculator.domesticEstimationBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.domesticEstimationOptions = ($scope.calculator.allOptionsRate * $scope.calculator.domesticEstimationBeforeOptions)/100;
      } else {
        $scope.calculator.domesticEstimationOptions = null;
      }
    };

    $scope.exportEstimationOptions = function() {
      if(null != $scope.calculator.exportEstimationBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.exportEstimationOptions = ($scope.calculator.allOptionsRate * $scope.calculator.exportEstimationBeforeOptions)/100;
      } else {
        $scope.calculator.exportEstimationOptions = null;
      }
    };

    $scope.globalEstimationOptions = function() {
      if(null != $scope.calculator.globalEstimationBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.globalEstimationOptions = ($scope.calculator.allOptionsRate * $scope.calculator.globalEstimationBeforeOptions)/100;
      } else {
        $scope.calculator.globalEstimationOptions = null;
      }
    };

    $scope.zone1EstimationOptions = function() {
      if(null != $scope.calculator.zone1EstimationBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.zone1EstimationOptions = ($scope.calculator.allOptionsRate * $scope.calculator.zone1EstimationBeforeOptions)/100;
      } else {
        $scope.calculator.zone1EstimationOptions = null;
      }
    };

    $scope.zone2EstimationOptions = function() {
      if(null != $scope.calculator.zone2EstimationBeforeOptions && null != $scope.calculator.allOptionsRate) {
        $scope.calculator.zone2EstimationOptions = ($scope.calculator.allOptionsRate * $scope.calculator.zone2EstimationBeforeOptions)/100;
      } else {
        $scope.calculator.zone2EstimationOptions = null;
      }
    };

    //Total Premium + options
    $scope.totalPremiumOptDomestic = function() {
      if(null != $scope.calculator.domesticEstimationBeforeOptions && null != $scope.calculator.domesticEstimationOptions) {
        $scope.calculator.totalPremiumOptDomestic = $scope.calculator.domesticEstimationBeforeOptions*1 + $scope.calculator.domesticEstimationOptions*1;
      } else {
        $scope.calculator.totalPremiumOptDomestic = null;
      }
    };

    $scope.totalPremiumOptExport = function() {
      if(null != $scope.calculator.exportEstimationBeforeOptions && null != $scope.calculator.exportEstimationOptions) {
        $scope.calculator.totalPremiumOptExport = $scope.calculator.exportEstimationBeforeOptions*1 + $scope.calculator.exportEstimationOptions*1;
      } else {
        $scope.calculator.totalPremiumOptExport = null;
      }
    };

    $scope.totalPremiumOptGlobal = function() {
      if(null != $scope.calculator.globalEstimationBeforeOptions && null != $scope.calculator.globalEstimationOptions) {
        $scope.calculator.totalPremiumOptGlobal = $scope.calculator.globalEstimationBeforeOptions*1 + $scope.calculator.globalEstimationOptions*1;
      } else {
        $scope.calculator.totalPremiumOptGlobal = null;
      }
    };

    $scope.totalPremiumOptZone1 = function() {
      if(null != $scope.calculator.zone1EstimationBeforeOptions && null != $scope.calculator.zone1EstimationOptions) {
        $scope.calculator.totalPremiumOptZone1 = $scope.calculator.zone1EstimationBeforeOptions*1 + $scope.calculator.zone1EstimationOptions*1;
      } else {
        $scope.calculator.totalPremiumOptZone1 = null;
      }
    };

    $scope.totalPremiumOptZone2 = function() {
      if(null != $scope.calculator.zone2EstimationBeforeOptions && null != $scope.calculator.zone2EstimationOptions) {
        $scope.calculator.totalPremiumOptZone2 = $scope.calculator.zone2EstimationBeforeOptions*1 + $scope.calculator.zone2EstimationOptions*1;
      } else {
        $scope.calculator.totalPremiumOptZone2 = null;
      }
    };

    $scope.initCalculator();

    //buttons
    $scope.validate = function () {
      returnResult();
      $modalInstance.close();
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    var returnResult = function () {
        policy.ratesCalculator.disputedDebtsRate = $scope.calculator.disputedDebtsRate;
        policy.ratesCalculator.extensionMCPRate = $scope.calculator.extensionMCPRate;
        policy.ratesCalculator.bindingPendingOrderRate = $scope.calculator.bindingPendingOrderRate;
        policy.ratesCalculator.preshipmentRate = $scope.calculator.preshipmentRate;
        if(null == policy.quotationSummary) {
        	policy.quotationSummary = {};
        }
        switch (policy.splitPremium) {
          case 'DE':
            policy.quotationSummary.historicalDomestic = $scope.calculator.domesticRateAfterOptions*1;
            policy.quotationSummary.historicalExport = $scope.calculator.exportRateAfterOptions*1;
            policy.ratesCalculator.domesticRateBeforeOptions = $scope.calculator.domesticRateBeforeOptions;
            policy.ratesCalculator.exportRateBeforeOptions = $scope.calculator.exportRateBeforeOptions;
            policy.ratesCalculator.domesticTurnoverEstimation = $scope.calculator.domesticTurnoverEstimation;
            policy.ratesCalculator.exportTurnoverEstimation = $scope.calculator.exportTurnoverEstimation;
            break;
          case 'GD':
          case 'GE':
          case 'GDE':
            policy.quotationSummary.historicalGlobalRate = $scope.calculator.globalRateAfterOptions*1;
            policy.ratesCalculator.globalRateBeforeOptions = $scope.calculator.globalRateBeforeOptions;
            policy.ratesCalculator.globalTurnoverEstimation = $scope.calculator.globalTurnoverEstimation;
            break;
          case 'Z':
            policy.quotationSummary.historicalZone1 = $scope.calculator.zone1RateAfterOptions*1;
            policy.quotationSummary.historicalZone2 = $scope.calculator.zone2RateAfterOptions*1;
            policy.ratesCalculator.zone1RateBeforeOptions = $scope.calculator.zone1RateBeforeOptions;
            policy.ratesCalculator.zone2RateBeforeOptions = $scope.calculator.zone2RateBeforeOptions;
            policy.ratesCalculator.zone1TurnoverEstimation = $scope.calculator.zone1TurnoverEstimation;
            policy.ratesCalculator.zone2TurnoverEstimation = $scope.calculator.zone2TurnoverEstimation;
            break;
          case 'THREE':
            policy.quotationSummary.historicalDomestic = $scope.calculator.domesticRateAfterOptions*1;
            policy.quotationSummary.historicalZone1 = $scope.calculator.zone1RateAfterOptions*1;
            policy.quotationSummary.historicalZone2 = $scope.calculator.zone2RateAfterOptions*1;
            policy.ratesCalculator.domesticRateBeforeOptions = $scope.calculator.domesticRateBeforeOptions;
            policy.ratesCalculator.zone1RateBeforeOptions = $scope.calculator.zone1RateBeforeOptions;
            policy.ratesCalculator.zone2RateBeforeOptions = $scope.calculator.zone2RateBeforeOptions;
            policy.ratesCalculator.domesticTurnoverEstimation = $scope.calculator.domesticTurnoverEstimation;
            policy.ratesCalculator.zone1TurnoverEstimation = $scope.calculator.zone1TurnoverEstimation;
            policy.ratesCalculator.zone2TurnoverEstimation = $scope.calculator.zone2TurnoverEstimation;
            break;
          default:
            break;
        }
    };
  });

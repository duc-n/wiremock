'use strict';

angular.module('autonomyApp.generationDocumentValidation', [])
  .controller('GenerationDocumentValidationController', ['$scope', '$modalInstance', 'ProposalService', 'spinnerService', 'proposal', 'documentType', 'ScenarioDataService', 'Session', 'SmartService' ,
    function ($scope, $modalInstance, ProposalService, spinnerService, proposal, documentType, ScenarioDataService, Session, SmartService) {

      $scope.documentType = documentType;
      $scope.availableLanguages = [];
      $scope.editionOptions = {lang: 'en'};
      $scope.proposal = proposal;
      
      $scope.generationInProgess = false;
      
      if (documentType == 'CONTRACT') {

        $scope.dateOptions = {
          formatYear: 'yy',
          startingDay: 1
        };

        $scope.adjustFirstInsPeriodTo = function () {
          var newEndDate = angular.copy($scope.proposal.firstInsPeriodFrom);
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          $scope.proposal.firstInsPeriodTo = newEndDate;
        };

        $scope.format = 'dd.MM.yyyy';

        $scope.statusDate = {
          firstInsPeriodFromOpened: false,
          firstInsPeriodToOpened: false
        };

        $scope.openFirstInsPeriodFrom = function () {
          $scope.statusDate.firstInsPeriodFromOpened = true;
        };

        $scope.openFirstInsPeriodTo = function () {
          $scope.statusDate.firstInsPeriodToOpened = true;
        };

        $scope.availableLanguages = proposal.contractEditionLanguages;
      }

      if ($scope.documentType == 'NBI') {
        $scope.availableLanguages = proposal.nbiEditionLanguages;
      }

      if ($scope.documentType == 'BUYERSTUDY') {
        $scope.availableLanguages = proposal.buyerStudyEditionLanguages;
      }

      if ($scope.availableLanguages == null) {
        $scope.availableLanguages = [];
      }

      // for contract only. Because with nbi and buyerstudy, if available
      // languages list contains only 1 element,
      // this modal will not be showed.
      if ($scope.availableLanguages.length > 0) {
        $scope.editionOptions.lang = $scope.availableLanguages[0].isoCode;
      }

      $scope.generate = function () {

        if ($scope.generationDocumentValidationForm.$valid) {

          spinnerService.show('generationDocumentSpinner');
          $scope.generationInProgess = true;
          proposal.editionCodeLang = $scope.editionOptions.lang;        
          
          if ($scope.documentType == 'NBI') {
            ProposalService.createNBIProposal(proposal)
              .then(function () {

                /**
                 * Defect #21: Interactions with SMART - Update Sales Funnel
                 */
                if (Session.getPropertiesEnvironment().updateSmart) {
                  if (proposal.smartCase && ScenarioDataService.isCurrentScenarioFavorite()) {
                    SmartService.updateSmart().then(function(data){
                      logger.debug('debug', 'Update Smart : {0}', [JSON.stringify(data)]);
                    });
                  }
                }

                $scope.close();
              })
              .finally(function () {
                spinnerService.hide('generationDocumentSpinner');
                $scope.generationInProgess = false;
              });
          } else if ($scope.documentType == 'BUYERSTUDY') {
            
        	  ProposalService.createBUYERSTUDYProposal(proposal)
              .finally(function () {
                spinnerService.hide('generationDocumentSpinner');
                $scope.generationInProgess = false;
                $scope.close();
              });
          }
        }
      };

      /**
       * For a word generation request, user must give the reason. Defect #760 :
       * Audit trail Manual Editions in Word
       */
      $scope.isWordGenerationRequest = function () {
        return (($scope.documentType === 'CONTRACT' && $scope.proposal.nbContractDownloaded > 0 && !$scope.proposal.contractWordGenerationBy && $scope.proposal.contractDocType && $scope.proposal.contractDocType === 'PDF')
        || ($scope.documentType === 'NBI' && $scope.proposal.nbNBIDownloaded > 0 && !$scope.proposal.nbiWordGenerationBy && $scope.proposal.nbiDocType && $scope.proposal.nbiDocType === 'PDF'));
      }

      $scope.close = function () {
        $modalInstance.dismiss('cancel');
      };
    }]);

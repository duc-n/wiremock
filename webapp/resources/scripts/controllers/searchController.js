'use strict';

angular.module('autonomyApp.search', [])
.controller('SearchController', ['$state', '$scope', 'SearchService', '$http', 'Session', 'loadCases', 'Logger', '$modal', '$confirm', 'spinnerService', 'growl', 'DIVERS_EVENTS','localStorageService','$filter','FileSaver','Blob',
	function ($state, $scope, SearchService, $http, Session, loadCases, Logger, $modal, $confirm, spinnerService, growl, DIVERS_EVENTS,localStorageService,$filter,FileSaver,Blob) {
	var logger = Logger.getInstance('SearchController');
	// we will store all of our form data in this object
	$scope.master = {
			caseId: '',
			salesName: '',
			startDate: '',
			endDate: '',
			companyName: '',
			derogation: '',
			status: '',
			offset: 0,
			contractNumber: ''
	};
	
	$scope.SearchService = SearchService;
	$scope.hasSupervisionRight = Session.getUserManager().hasSupervisionRight;
	$scope.localStorageService = localStorageService;

	//defect #393 : Main page - save filter settings

	$scope.formCriteria = angular.copy($scope.master);
	
	$scope.initFormCriteria = function() {
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
		
			$scope.formCriteria = angular.copy(formCriteriaCached);
		}
	};
	
	$scope.initFormCriteria();
	
	$scope.cases = loadCases.data.caseSearchResults;
	$scope.nbTotalResult = (null === loadCases.data.nbTotalResult)? $scope.nbTotalResult : loadCases.data.nbTotalResult ;
	$scope.casesSelected = [];
	$scope.buttonMoreDisable = Object.keys($scope.cases).length < Session.getPropertiesEnvironment().searchPageLength;

	if (!$scope.buttonMoreDisable) {
		$scope.formCriteriaBackup = angular.copy($scope.formCriteria);
	}
	
	/**
	 * Button "search"
	 */
	$scope.search = function () {
		logger.debug('debug', 'Call search function with params : {0}', [JSON.stringify($scope.formCriteria)]);

		$scope.formCriteriaBackup = angular.copy($scope.formCriteria);
		var formCriteriaCache = angular.copy($scope.formCriteria);
		if(null != formCriteriaCache.startDate) {
			formCriteriaCache.startDate = $filter('date')(formCriteriaCache.startDate, $scope.format);	
		}
		if(null != formCriteriaCache.endDate) {
			formCriteriaCache.endDate = $filter('date')(formCriteriaCache.endDate, $scope.format);	
		}
		
		localStorageService.set('formCriteria',formCriteriaCache);

		spinnerService.show('searchSpinner');
		SearchService.search(formCriteriaCache)
		.then(function (data) {
			$scope.cases = data.data.caseSearchResults;
			$scope.nbTotalResult = (null === data.data.nbTotalResult)? $scope.nbTotalResult : data.data.nbTotalResult ;
			$scope.buttonMoreDisable = data.data.caseSearchResults.length < Session.getPropertiesEnvironment().searchPageLength;
		}, function (error) {
			return $q.reject('Error !!!');
		})
		.finally(function () {
			spinnerService.hide('searchSpinner');
		});
	};

	/**
	 * Button "reset"
	 */
	$scope.reset = function () {
		logger.debug('debug', 'Call search function reset');
		$scope.formCriteria = angular.copy($scope.master);
		localStorageService.set('formCriteria',null);
	};

	/**
	 * Button "Create case" - open companyView to get the selected EasyNumber
	 */
	$scope.modalEeasyNumber = null;
	$scope.modalCasesExist = null;

	$scope.openCompanyView = function () {
		logger.debug('debug', 'Call open companyView function');

		$scope.modalEeasyNumber = null;
		$scope.modalCasesExist = null;

		$scope.modalCompanyViewInstance = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/search/companyViewModal.html',
			scope: $scope,
			controller: function ($scope, $sce, $modalInstance, spinnerService) {
				var companyViewUrl = Session.getPropertiesEnvironment().searchCompanyViewUrl;
				var firstTime = true;
				$scope.companyViewUrl = $sce.trustAsResourceUrl(companyViewUrl);

				$scope.stopSpinner = function () {
					if (firstTime) {
						spinnerService.hide('companyViewModalSpinner');
						angular.element('#companyViewModal').click();
						firstTime = false;
					}
				};
				$scope.close = function () {
					$modalInstance.dismiss('cancel');
				};
			},
			size: 'lg'
		});
	};

	/**
	 * Function "Create case"
	 */
	$scope.createCase = function (easyNumber, casesExist) {
		logger.debug('debug', 'Call create case, easyNumber: {0}, casesExists: {1}', [easyNumber, casesExist]);
		$scope.modalCompanyViewInstance.close();
		if (casesExist) {
			SearchService.searchCaseFromEasyNumber(easyNumber).then(function (data) {
				$scope.openCreateNewBusinessCase(easyNumber, casesExist,data.data);
			})
			.finally(function () {
			});
		} else {
			$scope.openCreateNewBusinessCase(easyNumber,casesExist);
		}
	};

	$scope.openCreateNewBusinessCase = function(easyNumber,casesExist,cases) {
		$scope.modalCreateCase = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/search/createCaseModal.html',
			scope: $scope,
			controller: function ($scope, $modalInstance, Session,cases) {

				if (casesExist === 'true') {
					$scope.message = 'search.existing.case.create.confirm';
				}
				else {
					$scope.message = 'search.case.create.confirm';
				}

				$scope.cases = cases;
				$scope.param = {contractTest:false};
				$scope.hasSupervisionRight = Session.getUserManager().hasSupervisionRight; 

				$scope.createCase = function (createCaseForm) {

					if (createCaseForm.$valid) {
						spinnerService.show('caseSpinner');
						growl.info('search.creating.case.msg');
						SearchService.createCase(easyNumber, $scope.param.contractTest)
						.then(function (data) {
							logger.debug('a debug', 'Response from create case: {0}', [data.data]);
							$state.go('app.questionnaire', {caseId: data.data.caseId, scenarioId: data.data.scenarioId});
							$modalInstance.dismiss('cancel');
						},
						function (failure) {
							spinnerService.hide('caseSpinner');
						})
						.finally(function () {
						});
					}
				};

				$scope.cancel = function () {
					$scope.message = null;
				};
				$scope.close = function () {
					$modalInstance.dismiss('cancel');
				};
			},
			resolve : {
				cases : function () {
					return cases;
				}
			}
		});
	};

	/**
	 * Button "more". Get more result
	 */
	$scope.more = function () {

		logger.debug('debug', 'Get more data, offset : {0}', [$scope.formCriteriaBackup.offset]);

		$scope.formCriteria = angular.copy($scope.formCriteriaBackup);
		$scope.formCriteria.offset = 0;
		$scope.formCriteriaBackup.offset = $scope.formCriteriaBackup.offset + Session.getPropertiesEnvironment().searchPageLength;
		
		//TODO : total is not set
//		localStorageService.set('formCriteria',$scope.formCriteriaBackup);
		
		
		var criteriaRequest  = angular.copy($scope.formCriteriaBackup);
		if(null != criteriaRequest.startDate) {
			criteriaRequest.startDate = $filter('date')(criteriaRequest.startDate, $scope.format);	
		}
		if(null != criteriaRequest.endDate) {
			criteriaRequest.endDate = $filter('date')(criteriaRequest.endDate, $scope.format);	
		}
		
		spinnerService.show('searchSpinner');
		SearchService.search(criteriaRequest)
		.then(function (data) {

			if (Object.keys($scope.cases).length > 0) {
				$scope.cases = $scope.cases.concat(data.data.caseSearchResults);
			}
			else {
				$scope.cases = data.data.caseSearchResults;
				$scope.nbTotalResult = (null === data.data.nbTotalResult)? $scope.nbTotalResult : data.data.nbTotalResult ;
			}
			$scope.buttonMoreDisable = data.data.caseSearchResults.length < Session.getPropertiesEnvironment().searchPageLength;
		})
		.finally(function () {
			spinnerService.hide('searchSpinner');
		});
	};

	/**
	 * Transform Globalliance contract
	 */
	$scope.openTransformContractDialog = function () {
		$scope.modalTransformContract = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/search/transformContractModal.html',
			scope: $scope,
			controller: 'TransformContractController',
			resolve : {
				type: function () {
					return 'TRANSF';
				}
			}
		});  
	};

	/**
	 * Transform Globalliance contract
	 */
	$scope.openCreateCLOCaseDialog = function () {
		$scope.modalCreateCloCase = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/search/transformContractModal.html',
			scope: $scope,
			controller: 'TransformContractController',
			resolve : {
				type: function () {
					return 'CLO';
				}
			}
		});
	};
	
	/**
	 * Defect #770: FR Feedback-Excel Reporting of cases
	 * Export the search result
	 */
	$scope.dynamicSearchResultPopover = function () {
		if (SearchService.isSearchExportInProgress()) {
			return 'spinner.cases.exporting.title';
		}
		else {
			return 'search.export.result';
		}
	};
	
	$scope.exportSearchResult = function () {
		logger.debug('debug', 'Call export search result function with params : {0}', [JSON.stringify($scope.formCriteria)]);

		SearchService.setSearchExportInProgress(true);
		growl.info('spinner.cases.exporting.title');
		
		var formCriteriaCopy = angular.copy($scope.formCriteria);
		if(null != formCriteriaCopy.startDate) {
			formCriteriaCopy.startDate = $filter('date')(formCriteriaCopy.startDate, $scope.format);	
		}
		if(null != formCriteriaCopy.endDate) {
			formCriteriaCopy.endDate = $filter('date')(formCriteriaCopy.endDate, $scope.format);	
		}
		
		SearchService.exportResult(formCriteriaCopy)
		.then(function (response) {

            var blob = new Blob([response],
            	  {type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'});
            
            FileSaver.saveAs(blob,'AUTONOMY_FOLLOWUP.xlsx');
        })
		.finally(function () {
			SearchService.setSearchExportInProgress(false);
		});
	};

	/**
	 * Change cases owner
	 */
	$scope.changeCasesOwner = function () {
		$scope.modalChangeCasesOwner = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/search/changeCasesOwnerModal.html',
			scope: $scope,
			controller: function ($scope, $modalInstance, caseIds, DIVERS_EVENTS) {

				$scope.account = {
						searchText : null,
						searchType : "IDENTIFIER",
						selectedAccountId : null,
						selectedAccountFullName : null,
						caseIds : caseIds
				};
				
				$scope.userInfos = null;
				
				$scope.searchAccount = function (changeCaseOwnerForm) {
					if (changeCaseOwnerForm.$valid) {
						$scope.account.selectedAccountId = null;
						SearchService.searchAccount($scope.account)
						.then(function (data) {
							logger.debug('debug', 'Response from check account: {0}', [data]);
							$scope.userInfos = data.data;
						})
						.finally(function () {
						});
					}
				};

				$scope.changeCasesOwner = function (changeCaseOwnerForm) {

					if (changeCaseOwnerForm.$valid) {

						spinnerService.show('changeCaseOwnerSpinner');
						
						growl.info('cases.owner.changing.msg');
						
						SearchService.changeCasesOwner($scope.account.selectedAccountId, caseIds)
						.then(function (data) {
							logger.debug('debug', 'Response from change cases owner : {}', [data.data]);
							$scope.userSelectedFullName = null;
							angular.forEach($scope.userInfos, function(user, key){
							     if (user.accountId === $scope.account.selectedAccountId) {
							    	 $scope.userSelectedFullName = user.info;
							     }
							});
							
							$scope.$emit(DIVERS_EVENTS.casesOwnerChanged, {
								ownerName: $scope.userSelectedFullName,
								caseIds: data.data
							});
							$scope.close();
						})
						.finally(function () {
							spinnerService.hide('changeCaseOwnerSpinner');
						});
					}
				};
				
				$scope.close = function () {
					$modalInstance.dismiss('cancel');
				};

			}, resolve: {
				caseIds: function () {
					return $scope.casesSelected;
				}
			}
		});
	};


	/**
	 * Update the endDate if the startDate is changed
	 */

	$scope.$watch('formCriteria.startDate', function (newVal, oldVal) {

		if (!newVal) {
			return;
		}

		// if the new start date is bigger than the current end date .. update the end date
		if ($scope.formCriteria.endDate) {
			if (+$scope.formCriteria.endDate < +$scope.formCriteria.startDate) {
				$scope.formCriteria.endDate = newVal;
			}
		}
	});

	$scope.dateBeginOpen = function () {
		$scope.status.dateBeginOpened = true;
	};

	$scope.dateEndOpen = function () {
		$scope.status.dateEndOpened = true;
	};

	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[2];

	$scope.status = {
			dateBeginOpened: false,
			dateEndOpened: false
	};

	$scope.selected = false;

	$scope.updateCasesSelectedList = function (caseId, selected) {
		if (selected) {
			// add/update item
			$scope.casesSelected.push(caseId);
		} else {
			// remove item
			$scope.removeSelectedCase(caseId);
		}
	};

	$scope.removeSelectedCase = function (caseId) {
		var index = $scope.casesSelected.indexOf(caseId);
		if (index >= 0) {
			$scope.casesSelected.splice(index, 1);
		}
	};

	$scope.computeSelectAll = function (selected) {
		$scope.casesSelected = [];
		for (var i = 0; i < $scope.cases.length; i++) {
			if (selected) {
				$scope.cases[i].selected = true;
				$scope.casesSelected.push($scope.cases[i].caseId);
			} else {
				$scope.cases[i].selected = false;
			}
		}

	};
	
	

	$scope.$on(DIVERS_EVENTS.casesOwnerChanged, function (event, data) {
		if (data.caseIds.length > 0) {
			for (var i = 0; i < $scope.cases.length; i++) {
				if (data.caseIds.indexOf($scope.cases[i].caseId) >= 0) {
					$scope.cases[i].salesName = data.ownerName;
					$scope.cases[i].selected = false;
					$scope.removeSelectedCase($scope.cases[i].caseId);
				}
			}
		}
	});
}]);

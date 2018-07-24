'use strict';

angular.module('autonomyApp.buyerStudy', ['ngResource', 'ngOnload', 'ngCookies'])
.controller('BuyerStudyController', ['$scope', '$rootScope', '$resource', '$timeout', 'BuyerStudyService', 'localStorageService', 'Session', 'Logger', 'REST_URLS', 'loadBuyerStudy', 'DTOptionsBuilder', 'DTColumnBuilder', '$q', '$modal', '$sce', '$compile', '$translate', 'growl', '$state', 'spinnerService', '$cookies', 'ScenarioService', '$confirm', 'BuyerStudyWebSocketService', 'ContractService', 'NomenclatureService', 'DIVERS_EVENTS', '$filter', 'renderCommentFilter','ProposalService','ScenarioDataService','SalesDiscussionsDataService',
	function ($scope, $rootScope, $resource, $timeout, BuyerStudyService, localStorageService, Session, Logger, REST_URLS, loadBuyerStudy, DTOptionsBuilder, DTColumnBuilder, $q, $modal, $sce, $compile, $translate, growl, $state, spinnerService, $cookies, ScenarioService, $confirm, BuyerStudyWebSocketService, ContractService, NomenclatureService, DIVERS_EVENTS, $filter, renderCommentFilter,ProposalService,ScenarioDataService,SalesDiscussionsDataService) {

	var logger = Logger.getInstance('BuyerStudyController');

	logger.debug('debug', 'Get Buyer Study for caseId : ' + $scope.caseId);

	$scope.buyerStudy = loadBuyerStudy;

	$scope.user = Session.getUserManager();

	ScenarioService.isReadOnly = false;

	$scope.checkCompatibilityInProgress = false;

	$scope.BuyerStudyWebSocketService = BuyerStudyWebSocketService;

	$scope.dtInstance = {};
	$scope.dtOptions = DTOptionsBuilder
	.fromFnPromise(function () {
		var deferred = $q.defer();
		var datas = $scope.buyerStudy.buyerStudyResult.portfolioLines.filter(function (item) {
			return item.statusCode != "CANCELLED";
		});
		deferred.resolve(datas);
		return deferred.promise;
	})
	// Add Bootstrap compatibility
	.withBootstrap();

	$scope.datatableLanguageSource = {};

	$scope.openCofanetInProgress = false;
	
	//Defect985 : Evolution : Create a new Discussions zone common to all scenarios of a case -
	SalesDiscussionsDataService.setCommentsCount( $scope.buyerStudy.salesDiscussionsCount);

	$scope.initDatatableLanguageSource = function () {
		$scope.datatableLanguageSource = {
				'decimal': $translate.instant('datatable.decimal.label'),
				'emptyTable': $translate.instant('datatable.emptyTable.label'),
				'info': $translate.instant('datatable.info.label'),
				'infoEmpty': $translate.instant('datatable.infoEmpty.label'),
				'infoFiltered': $translate.instant('datatable.infoFiltered.label'),
				//'infoPostFix': $translate.instant('datatable.infoPostFix.label'),
				'thousands': $translate.instant('datatable.thousands.label'),
				'lengthMenu': $translate.instant('datatable.lengthMenu.label'),
				'loadingRecords': $translate.instant('datatable.loadingRecords.label'),
				'processing': $translate.instant('datatable.processing.label'),
				'search': $translate.instant('datatable.search.label'),
				'zeroRecords': $translate.instant('datatable.zeroRecords.label'),
				'paginate': {
					'first': $translate.instant('datatable.paginate.first.label'),
					'last': $translate.instant('datatable.paginate.last.label'),
					'next': $translate.instant('datatable.paginate.next.label'),
					'previous': $translate.instant('datatable.paginate.previous.label')
				},
				'aria': {
					'sortAscending': $translate.instant('datatable.aria.sort.ascending.label'),
					'sortDescending': $translate.instant('datatable.aria.sort.descending.label')
				}
		};
	};

	$scope.initDatatableLanguageSource();

	//compile datatable cell
	$scope.dtOptions
//	.withOption('fnRowCallback',
//	function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
//	$compile(nRow)($scope);
//	})
	.withOption('initComplete',
			function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
		if($scope.buyerStudy.newBusiness || $scope.buyerStudy.clo) {
			$scope.reloadData();
		}
	})
	.withOption('language', $scope.datatableLanguageSource)
	.withOption('processing', true);

	$scope.dtColumns = [
		//Defect #76 : masquer colonne visibilité Prospect
		//DTColumnBuilder.newColumn('prospectVisible').renderWith(function (data, type, full) {
		//return '<input type="checkbox" ng-change="updateProspectVisible(buyerStudy.prospectVisible[\'' + full.easyNumber + '\'], \'' + full.easyNumber + '\')" ng-model="buyerStudy.prospectVisible[\'' + full.easyNumber + '\']" />';
		//}).notSortable().withClass('text-center'),
		DTColumnBuilder.newColumn('buyerCompatibility').withOption('type', 'product-compatibility').withClass('text-center').renderWith(function (data, type, full) {

			switch (data) {
			case 'MIGR':
				return '<i class="fa fa-check fa-lg migrable ' + data + '"></i>';
			case 'MIGR_TRANS':
				return '<i class="fa fa-check-circle fa-lg migrable-transformation ' + data + '"></i>';
			case 'NOT_MIGR':
				return '<i class="fa fa-times fa-lg not-migrable ' + data + '"></i>';
			default:
				return '';
			}
		}),
		DTColumnBuilder.newColumn('companyName').withClass('ellipsis').renderWith(function (data, type, full) {
			var countryLabel = '(' + NomenclatureService.getCountries($translate.use())[full['countryIso']] + ')';
			return '<span title="' + data + ' ' + countryLabel + '">' + data + ' ' + countryLabel + '</span>';
		}),
		DTColumnBuilder.newColumn('countryIso').withClass('text-center').renderWith(function (data, type, full) {
			var countryLabel = '(' + NomenclatureService.getCountries($translate.use())[full['countryIso']] + ')';
			return '<span title="' + countryLabel + '">' + data + '</span>';
		}),
		DTColumnBuilder.newColumn('deliveryTypeCode').withClass('text-center').renderWith(function (data, type, full) {
			switch (data) {
			case 'CREDITLIMIT':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.ccl.label') + '</span>';
			case 'ARATING':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.arating.label') + '</span>';
			case 'ARATINGLIMIT':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.aratingLimit.label') + '</span>';
			case 'ECL':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.ecl.label') + '</span>';
			case 'CCO':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.cco.label') + '</span>';
			case 'ARATINGCHMON':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.aratingchmon.label') + '</span>';
			case 'TOPLINER':
				return '<span title="' + full.deliveryTypeLabel + '">' + $translate.instant('delivery.type.topliner.label') + '</span>';
			default:
				return full.deliveryTypeLabel;
			}
		}),
		DTColumnBuilder.newColumn('dra').withClass('text-center'),
		DTColumnBuilder.newColumn('requestedAmount').withClass('text-center').renderWith(function (data, type, full) {
			if (data != null) {
				return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
			} else {
				return null;
			}
		}).withOption('type', 'number-formatted'),
		DTColumnBuilder.newColumn('agreedAmount').withClass('text-center').renderWith(function (data, type, full) {
			if (data != null) {
				return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
			} else {
				return null;
			}
		}).withOption('type', 'number-formatted'),
		DTColumnBuilder.newColumn('requestedAmountCurrency').withClass('text-center').renderWith(function (data, type, full) {
			if (data === null || '' === data) {
				return full.agreedAmountCurrency;
			}
			return data;
		}),
		DTColumnBuilder.newColumn('statusCode').withClass('text-center').renderWith(function (data, type, full) {
			if(data != 'PENDING' && data != 'POSTTAKE' && data != 'POSTNTAK') {
				return $translate.instant(data);
			} else {
				return $translate.instant('buyerstudy.pending.label');
			}

		})
		];



	if ($scope.buyerStudy.newBusiness || $scope.buyerStudy.clo) {
		$scope.dtColumns.shift();
		$scope.dtColumns.push(
				DTColumnBuilder.newColumn('comments').withClass('ellipsis').renderWith(function (data, type, full) {
					if(full.comments != null) {
						if(full.comments == 'GA01' && null != full.specificCommentLabel) {
							return '<span title="' + full.specificCommentLabel + '">' + full.specificCommentLabel + '</span>';
						} else if(null != full.commentsLabel){
							return '<span title="' + full.commentsLabel + '">' + full.commentsLabel + '</span>';
						}
					} else {
						if(null != full.specificCommentLabel) {
							return '<span title="' + full.specificCommentLabel + '">' + full.specificCommentLabel + '</span>';
						} else if(null != full.commentsLabel){
							return '<span title="' + full.commentsLabel + '">' + full.commentsLabel + '</span>';
						}
					}

					return '';
				})
		);
	} else {
		$scope.dtColumns.push(
				DTColumnBuilder.newColumn('compatibilityComments').withClass('ellipsis').renderWith(function (data, type, full) {
					if (data !== null && '' !== data) {
						return renderCommentFilter(data,full) ;
					} else {
						if(full.comments != null) {
							if(full.comments == 'GA01' && null != full.specificCommentLabel) {
								return '<span title="' + full.specificCommentLabel + '">' + full.specificCommentLabel + '</span>';
							} else if(null != full.commentsLabel){
								return '<span title="' + full.commentsLabel + '">' + full.commentsLabel + '</span>';
							}
						} else {
							if(null != full.specificCommentLabel) {
								return '<span title="' + full.specificCommentLabel + '">' + full.specificCommentLabel + '</span>';
							} else if(null != full.commentsLabel){
								return '<span title="' + full.commentsLabel + '">' + full.commentsLabel + '</span>';
							}
						}

						return '';
					}
				})
		);
	}

	$rootScope.$on('$translateChangeSuccess', function (event, args) {
		$scope.initDatatableLanguageSource();
		$scope.dtOptions.withOption('language', $scope.datatableLanguageSource);
		$scope.dtInstance.rerender();
	});


	$scope.updateProspectVisible = function (bool, easyNumber) {

		if ($scope.buyerStudy.hasQuoted) {
			$scope.buyerStudy.pricingObsolete = true;
		}
		if (bool) {
			// add/update item
			$scope.buyerStudy.prospectVisible[easyNumber] = true;
		} else {
			// remove item
			delete $scope.buyerStudy.prospectVisible[easyNumber];
		}
	};

	$scope.reloadData = function () {
		spinnerService.show('buyerStudySpinner');
		BuyerStudyService.getPortfolioLines()
		.then(function (data) {
			$scope.buyerStudy.buyerStudyResult = data;
			$scope.dtInstance.DataTable.clear().draw(false);
			var datas = $scope.buyerStudy.buyerStudyResult.portfolioLines.filter(function (item) {
				return item.statusCode != "CANCELLED";
			});
			$scope.dtInstance.DataTable.rows.add(datas).draw(false);
		})
		.finally(function () {
			spinnerService.hide('buyerStudySpinner');
		});
	};

	function callback(json) {
		//logger.debug('callback of reloadData on datatable : {0} ' + [JSON.stringify(json)]);
	}

	$scope.submitForm = function (event, page) {
		ScenarioDataService.saveInProgress = false;
		if (event) {
			event.preventDefault();
		}

		// For instance no need so save this page
		if (angular.isDefined(page)) {
			if (page === 'app') {
				$state.go(page, {}, {reload: true});
			}
			else {
				$state.go(page,{ caseId: localStorageService.get('caseId'),scenarioId:localStorageService.get('scenarioId') });
			}
		}
		return;
	};

	//button showGraphAnalysis
	$scope.showGraphAnalysis = function () {

		$scope.modalGraphViewInstance = $modal.open({
			backdrop: 'static',
			animation: true,
			templateUrl: 'views/buyerstudy/graphViewModal.html',
			controller: 'GraphController',
			resolve: {
				buyerStudyResult: function () {
					return $scope.buyerStudy.buyerStudyResult;
				}
			},
			size: 'lg'
		});

		$scope.modalGraphViewInstance.rendered.then(function () {
			//fix graph size problem in opening graph popup
			$('#bar').removeClass('hide');
			$('#pie').removeClass('hide');
		});
	};

	//button openCofanetView
	$scope.openCofanetView = function () {
		logger.debug('debug', 'Call open cofanetView function');
		if(!$scope.openCofanetInProgress) {
			if ($scope.buyerStudy.portfolioNumber != null && $scope.buyerStudy.portfolioNumber != '') {
				$scope.openCofanetInProgress = true;
				spinnerService.show('buyerStudySpinner');
				BuyerStudyService.getLoginAsTokenParam().then(function (data) {
					var token = data.data;
					spinnerService.show('buyerStudySpinner');
					BuyerStudyService.businessCaseSync().then(function (result) {
						spinnerService.hide('buyerStudySpinner');
						$scope.cofanetModalInstance = $modal.open({
							backdrop: 'static',
							animation: true,
							templateUrl: 'views/buyerstudy/cofanetViewModal.html',
							scope: $scope,
							controller: function ($scope, $sce, $modalInstance, Session, $cookies) {
								//defect #567 : Request Cover: log in by default on Cofanet on the wrong contract
								var portfolioNumber =  $scope.buyerStudy.portfolioNumber;
								var contractId = $scope.buyerStudy.contractId;
								var numberOfMissing = 9 - portfolioNumber.length;
								for(var i = 0;i<numberOfMissing;i++) {
									portfolioNumber = '%20' + portfolioNumber;
								}

								var portalViewWebUrl = Session.getPropertiesEnvironment().buyerStudyPortalViewWebUrl.replace('{0}', token);
								$scope.buyerStudyPortalViewWebUrl = $sce.trustAsResourceUrl(portalViewWebUrl);
								//$('#cofanetView').attr('src', $scope.buyerStudyPortalViewWebUrl);
								var cofanetViewUrl = Session.getPropertiesEnvironment().buyerStudyCofanetViewUrl.replace('{portfolioNumber}', portfolioNumber).replace('{contractId}', contractId);
								$scope.buyerStudyCofanetViewUrl = $sce.trustAsResourceUrl(cofanetViewUrl);
								var cofanetViewLogoutUrl = Session.getPropertiesEnvironment().buyerStudyCofanetViewLogoutUrl;
								$scope.cofanetViewLogoutUrl = $sce.trustAsResourceUrl(cofanetViewLogoutUrl);

								$scope.close = function () {
									BuyerStudyService.logoutCofanet();
									$modalInstance.dismiss('cancel');
								};

								$scope.firstTime = true;
								$scope.secondTime = true;

								$scope.switchToCofanetUrl = function () {
									if ($scope.firstTime) {
										$('#cofanetView').attr('src', $scope.buyerStudyCofanetViewUrl);
										$scope.firstTime = false;
									} else if ($scope.secondTime) {
										spinnerService.hide('cofanetViewModalSpinner');
										angular.element('#cofanetViewModal').click();
										$scope.secondTime = false;
									}
								};
							},
							size: 'cube-width'
						});


						$scope.cofanetModalInstance.result.finally(function () {

							$scope.openCofanetInProgress = false;
							//defect #777 Automatic refresh after a Cofanet call to enter new requests
							$scope.reloadData();

						});
					}).catch(function(fallback) {
						$scope.openCofanetInProgress = false;
						spinnerService.hide('buyerStudySpinner');
					});
				}).catch(function(fallback) {
					$scope.openCofanetInProgress = false;
					spinnerService.hide('buyerStudySpinner');
				});
			} else {
				alert('portfolioNumber is missing');
			}
		} else {
			logger.debug('debug', 'Open Cofanet In Progress');
		}
	};

	//button openMarketingPage
	$scope.openMarketingPage = function () {
		alert('Open Marketing Page');
	};

	$scope.messages = [];

	$scope.firstDataReceive = true;
	$scope.counter = 0;

	BuyerStudyWebSocketService.receive().then(null, null, function (result) {

		//logger.debug('debug', 'WebSocket - Message received : ' + JSON.stringify(message));
		//spinnerService.hide('buyerStudySpinner');
		$scope.messages.push(JSON.stringify(result));
		var type = result.type;
		if (type == 'END') {
			$scope.checkCompatibilityInProgress = false;
			spinnerService.hide('buyerStudySpinner');
		} else if(type == 'TOTAL') {
			$scope.buyerStudy.buyerStudyResult.portfolioTotals = result.data;
		} else {
			if($scope.firstDataReceive) {
				$scope.buyerStudy.buyerStudyResult.portfolioLines.splice(0,$scope.buyerStudy.buyerStudyResult.portfolioLines.length);
				$scope.dtInstance.DataTable.clear().draw( false );
				$scope.firstDataReceive = false;
			}
			var data = result.data;

			$scope.buyerStudy.buyerStudyResult.portfolioLines.push(data);
			if (data.statusCode != "CANCELLED") {
				$scope.dtInstance.DataTable.row.add(data).draw(false);
			}

			$scope.counter ++;
			logger.debug('debug', 'WebSocket - Total Message received : ' + $scope.counter);
		}
	});

	$scope.newDataTablePromise = function (data) {
		var deferred = $q.defer();
		deferred.resolve(data);
		return deferred.promise;
	};

	$scope.checkBuyersCompatibility = function () {
		$scope.checkCompatibilityInProgress = true;
		$scope.counter = 0;
		spinnerService.show('buyerStudySpinner');
		if ($scope.buyerStudy.checkMigration || $scope.buyerStudy.renewal) {
			growl.info('buyerstudy.check.buyers.compatibility.process.msg');
			if (BuyerStudyWebSocketService.isConnected()) {
				BuyerStudyWebSocketService.send(localStorageService.get('caseId'), localStorageService.get('sessionId'));
			} else {
				BuyerStudyWebSocketService.initialize();
			}
		} else {
			ContractService.updateContract()
			.then(function (data) {
				$scope.firstDataReceive = true;
				growl.info('buyerstudy.check.buyers.compatibility.process.msg');
				if (BuyerStudyWebSocketService.isConnected()) {
					BuyerStudyWebSocketService.send(localStorageService.get('caseId'), localStorageService.get('sessionId'));
				} else {
					BuyerStudyWebSocketService.initialize();
				}
			}, function (error) {
				spinnerService.hide('buyerStudySpinner');
				$scope.checkCompatibilityInProgress = false;
				return $q.reject('Error !!!');
			});
		}
	};

	$scope.getLength = function (obj) {
		return Object.keys(obj).length;
	};

	$scope.getCsvArray = function(){

		var csvData = [];
		var userManager = Session.getUserManager();
		//add 3 lines with N° case, scenario,
		csvData.push([	$translate.instant('buyerstudy.export.csv.case.number.label'),
			$translate.instant('buyerstudy.export.csv.scenario.number.label'),
			$translate.instant('buyerstudy.export.csv.date.label'),
			$translate.instant('buyerstudy.export.csv.user.label'),
			$translate.instant('buyerstudy.export.csv.company.label'),
			$translate.instant('buyerstudy.export.csv.easynumber.label'),
			$translate.instant('buyerstudy.export.csv.contractNumber.label'),
			$translate.instant('buyerstudy.export.csv.oldContractNumber.label'),
			'','','','','','','','','','','','','','']);
		//get scenarioSequence
		var currentScenarioId = localStorageService.get('scenarioId');
		var currentScenario = angular.copy(ScenarioDataService.getScenarioList().filter(function(item) { return (item.scenarioId == currentScenarioId); }));
		if(null != currentScenario && currentScenario.length > 0) {
			currentScenario = currentScenario[0];
		}
		csvData.push([
			localStorageService.get('caseId'),
			currentScenario.scenarioNumber,
			new Date(),
			userManager.firstName + ' ' + userManager.lastName,
			$scope.buyerStudy.companyName,
			$scope.buyerStudy.easyNumber,
			$scope.buyerStudy.contractNumber,
			$scope.buyerStudy.oldContractNumber,
			'','','','','','','','','','','','','','']);
		//add headers for portfolioLines
		csvData.push([
			$translate.instant('buyerstudy.export.csv.header.id.label'),
			$translate.instant('buyerstudy.export.csv.header.easyNumber.label'),
			$translate.instant('buyerstudy.export.csv.header.companyName.label'),
			$translate.instant('buyerstudy.export.csv.header.legalIdentifierName.label'),
			$translate.instant('buyerstudy.export.csv.header.legalIdentifierValue.label'),
			$translate.instant('buyerstudy.export.csv.header.companyType.label'),
			$translate.instant('buyerstudy.export.csv.header.countryIso.label'),
			$translate.instant('buyerstudy.export.csv.header.countryLabel.label'),
			$translate.instant('buyerstudy.export.csv.header.type.label'),
			$translate.instant('buyerstudy.export.csv.header.dra.label'),
			$translate.instant('buyerstudy.export.csv.header.requestedAmount.label'),
			$translate.instant('buyerstudy.export.csv.header.requestedAmountCurrency.label'),
			$translate.instant('buyerstudy.export.csv.header.agreedAmount.label'),
			$translate.instant('buyerstudy.export.csv.header.agreedAmountCurrency.label'),
			$translate.instant('buyerstudy.export.csv.header.statusCode.label'),
			$translate.instant('buyerstudy.export.csv.header.status.label'),
			$translate.instant('buyerstudy.export.csv.header.requestDate.label'),
			$translate.instant('buyerstudy.export.csv.header.decisionDate.label'),
			$translate.instant('buyerstudy.export.csv.header.expireDate.label'),
			$translate.instant('buyerstudy.export.csv.header.deliveryTypeCode.label'),
			$translate.instant('buyerstudy.export.csv.header.deliveryTypeLabel.label'),
			$translate.instant('buyerstudy.export.csv.header.comments.code.label'),
			$translate.instant('buyerstudy.export.csv.header.comments.label'),
			//defect #633 : CLO - Retrieve up to the last 3 comments on decision
			$translate.instant('buyerstudy.export.csv.header.commentsAdditional1.code.label'),
			$translate.instant('buyerstudy.export.csv.header.commentsAdditional1.label'),
			$translate.instant('buyerstudy.export.csv.header.commentsAdditional2.code.label'),
			$translate.instant('buyerstudy.export.csv.header.commentsAdditional2.label'),
			$translate.instant('buyerstudy.export.csv.header.buyerCompatibility.label'),
			$translate.instant('buyerstudy.export.csv.header.compatibilityComments.label'),
			$translate.instant('buyerstudy.export.csv.header.coverage.label'),
			$translate.instant('buyerstudy.export.csv.header.riskNature.label'),
			$translate.instant('buyerstudy.export.csv.header.acceptanceRate.label'),
			$translate.instant('buyerstudy.export.csv.header.countryRiskProfile.label'),
			$translate.instant('buyerstudy.export.csv.header.specificCommentId.label'),
			$translate.instant('buyerstudy.export.csv.header.specificComment.label')
			]);

		//add portfolioLines
		angular.forEach($scope.buyerStudy.buyerStudyResult.portfolioLines, function(value){
			value.compatibilityComments = renderCommentFilter(value.compatibilityComments,value);
			value.countryLabel = NomenclatureService.getCountries($translate.use())[value.countryIso];
			if(value.statusCode != 'PENDING' && value.statusCode != 'POSTTAKE' && value.statusCode != 'POSTNTAK') {
				value.status = $translate.instant(value.statusCode);
			} else {
				value.status = $translate.instant('buyerstudy.pending.label');
			}

			csvData.push(value);
		});

		return csvData;
	};

	$scope.proposal = {
				editionCodeLang : null,
				buyerStudyEditionLanguages : $scope.buyerStudy.buyerStudyEditionLanguages
				};

//	$scope.createBUYERSTUDYProposal = function() {
//		spinnerService.show('buyerStudySpinner');
//		ProposalService.createBUYERSTUDYProposal({}).then(function(){
//			$scope.buyerStudy.nbBUYERSTUDYDownloaded = $scope.buyerStudy.nbBUYERSTUDYDownloaded + 1;
//		})
//		.finally(function () {
//			spinnerService.hide('buyerStudySpinner');
//		});
//	};

	$scope.createBUYERSTUDYProposal = function () {
       if($scope.buyerStudy.buyerStudyEditionLanguages.length > 1) {
        	$scope.modalGenerationDocumentValidation = $modal.open({
	  			backdrop: 'static',
	  			animation: true,
	  			templateUrl: 'views/proposal/modalGenerationDocumentValidation.html',
	  			controller: 'GenerationDocumentValidationController',
	  			resolve: {
	  				proposal: function () {
	  					return $scope.proposal;
	  				},
	  				documentType: function() {
	  					return 'BUYERSTUDY';
	  				}
	  			}
  			});
        } else {
        	$scope.proposal.editionCodeLang = 'en';
        	 if($scope.buyerStudy.buyerStudyEditionLanguages.length == 1) {
             	$scope.proposal.editionCodeLang = $scope.buyerStudy.buyerStudyEditionLanguages[0].isoCode;
             }
        	spinnerService.show('buyerStudySpinner');
        	ProposalService.createBUYERSTUDYProposal($scope.proposal).then(function () {
        		$scope.buyerStudy.nbBUYERSTUDYDownloaded = $scope.buyerStudy.nbBUYERSTUDYDownloaded + 1;
              })
                .finally(function () {
                  spinnerService.hide('buyerStudySpinner');
                });
        }
    };

	$scope.getBUYERSTUDYProposal = function() {
		ProposalService.getBUYERSTUDYProposal($scope.buyerStudy.buyerStudyDoc);
	};

	$scope.$on('$destroy', function () {
		BuyerStudyWebSocketService.disconnect();
	});

	$scope.getProductXml = function() {
		ProposalService.getProductXml();
	};
}]);

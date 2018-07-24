'use strict';
angular.module('autonomyApp.proposal')
.factory('ProposalResource', ['$resource', 'REST_URLS', 'localStorageService', function ($resource, REST_URLS, localStorageService) {

	return $resource(REST_URLS.PROPOSAL_REST_URL, {},
			{
		'update': {method: 'PUT'}
			});
}])
.factory('ProposalService', ['$http', '$q', 'REST_URLS', 'localStorageService', 'growl', 'Session', 'Logger', 'FileSaver', 'Blob','ScenarioDataService', function ($http, $q, REST_URLS, localStorageService, growl, Session, Logger, FileSaver, Blob, ScenarioDataService) {
	var logger = Logger.getInstance('ProposalService');

	function getGeneratedDate() {
		var d = new Date();
		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1; //Months are zero based
		var curr_year = d.getFullYear();
		return curr_date + '/' + curr_month + '/' + curr_year;
	}

	return {
		isGenerateDocDisable : function (proposal,tooltip,finalizationForm) {
			if (!proposal.hasQuoted) {
				tooltip.message = "scenario.not.quoted.tooltip";
				return true;
			}
			
			if (proposal.derogationWorkflow.derogationWorkflowStopped) {
				tooltip.message = "proposal.derogation.process.stopped.tooltip";
				return true;
			}

			if (proposal.derogationPending) {
				tooltip.message = "proposal.derogation.pending.tooltip";
				return true;
			}

			// defect #749 : Derogation Workflow Management, check derogation
			// validation process
			if (!proposal.derogationWorkflow.derogationWorkflowFinished) {
				tooltip.message = "proposal.derogation.process.not.validated.tooltip";
				return true;
			}

			if (finalizationForm && finalizationForm.$invalid) {
				tooltip.message = "finalization.contract.required.fields.tooltip";
				return true;
			}
			

			return false;
		},
		createContract: function (finalization) {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_CONTRACT_REST_URL,
				data: finalization
			}).success(function (data, status, headers, config) {

				//Defect #812: Hightlight locked scenarios and cases
				ScenarioDataService.getCurrentScenario().frozenReason = 'CCT_EDIT';
				//

				var fileName = headers('fileName');

				var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				var type = 'application/pdf';
				finalization.proposal.contractDocType = finalization.proposal.contractDoc.format;
				if (extension == 'doc') {
					finalization.proposal.contractDocType = 'WORD';
					type = 'application/msword';
				}

				finalization.proposal.nbContractDownloaded = finalization.proposal.nbContractDownloaded + 1;

				var userInfo = {
						info: Session.getUserInfo()
				};

				var generatedDate = getGeneratedDate();
				finalization.proposal.docContractEditedBy = userInfo;

				finalization.proposal.docContractEditedDate = generatedDate;

				//Defect #760 - Audit trail Manual Editions in Word
				if (finalization.proposal.nbContractDownloaded > 0 && !finalization.proposal.contractWordGenerationBy && finalization.proposal.contractDocType === 'WORD') {
					finalization.proposal.contractWordGenerationBy = userInfo;
					finalization.proposal.contractWordGenerationDate = generatedDate;
				}

				var file = new Blob([data], {type: type});

				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('contract.get.error');
				deferred.reject();
			});
			return deferred.promise;

		},
		getContract: function (proposal) {
			var deferred = $q.defer();
			$http({
				method: 'GET',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_CONTRACT_DOC_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId'))
			}).success(function (data, status, headers, config) {
				var fileName = headers('fileName');

				var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				var type = 'application/pdf';
				if (extension == 'doc') {
					type = 'application/msword';
				}

				var file = new Blob([data], {type: type});

				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('contract.get.error');
				deferred.reject();
			});

			return deferred.promise;

		},
		createNBIProposal: function (proposal) {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_NBI_PROPOSAL_REST_URL,
				data: proposal
			}).success(function (data, status, headers, config) {

				//Defect #812: Hightlight locked scenarios and cases
				ScenarioDataService.getCurrentScenario().frozenReason = 'NBI_EDIT';
				//

				var fileName = headers('fileName');
				var docExcelQuestionnaireName = headers('docExcelQuestionnaireName');
				if (null != docExcelQuestionnaireName) {
					proposal.docExcelQuestionnaireName = docExcelQuestionnaireName;
				}

				var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				var type = 'application/pdf';
				proposal.nbiDocType = 'PDF';
				if (extension == 'doc') {
					proposal.nbiDocType = 'WORD';
					type = 'application/msword';
				}

				proposal.nbNBIDownloaded = proposal.nbNBIDownloaded + 1;

				var userInfo = {
						info: Session.getUserInfo()
				};

				proposal.docNbiEditedBy = userInfo;

				var generatedDate = getGeneratedDate();

				proposal.docNbiEditedDate = generatedDate;

				//Defect #760 - Audit trail Manual Editions in Word
				if (proposal.nbNBIDownloaded > 0 && !proposal.nbiWordGenerationBy && proposal.nbiDocType === 'WORD') {
					proposal.nbiWordGenerationBy = userInfo;
					proposal.nbiWordGenerationDate = generatedDate;
				}

				var file = new Blob([data], {type: type});

				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('proposal.get.error');
				deferred.reject();
			});
			return deferred.promise;

		},
		getNBIProposal: function (proposal) {
			var deferred = $q.defer();
			$http({
				method: 'GET',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_NBI_PROPOSAL_DOC_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId'))
			}).success(function (data, status, headers, config) {
				var fileName = headers('fileName');

				var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				var type = 'application/pdf';
				if (extension == 'doc') {
					type = 'application/msword';
				}

				var file = new Blob([data], {type: type});

				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('proposal.get.error');
				deferred.reject();
			});
			return deferred.promise;

		},
		createBUYERSTUDYProposal: function (proposal) {
			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_BUYERSTUDY_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId')),
				data: proposal
			}).success(function (data, status, headers, config) {
				var fileName = headers('fileName');
				var docType = 'PDF';
				var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				var type = 'application/pdf';

				if (extension == 'doc') {
					docType = 'WORD';
					type = 'application/msword';
				}

				if (angular.isDefined(proposal.buyerStudyDocType)) {
					proposal.buyerStudyDocType = docType;
				}

				if (angular.isDefined(proposal.nbBUYERSTUDYDownloaded)) {
					proposal.nbBUYERSTUDYDownloaded = proposal.nbBUYERSTUDYDownloaded + 1;
				}

				var file = new Blob([data], {type: type});

				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('proposal.get.error');
				deferred.reject();
			});
			return deferred.promise;
		},
		getBUYERSTUDYProposal: function (buyerStudyDoc) {
			var deferred = $q.defer();
			$http({
				method: 'GET',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_BUYERSTUDY_DOC_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId'))
			}).success(function (data, status, headers, config) {
				var fileName = headers('fileName');

				var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
				var type = 'application/pdf';
				if (extension == 'doc') {
					type = 'application/msword';
				}

				var file = new Blob([data], {type: type});

				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('proposal.get.error');
			});
			return deferred.promise;

		},
		getProductXml: function () {
			var deferred = $q.defer();
			$http({
				method: 'GET',
				responseType: 'arraybuffer',
				url: REST_URLS.PROPOSAL_PRODUCT_XML_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId'))

			}).success(function (data, status, headers, config) {
				var fileName = headers('fileName');
				var file = new Blob([data], {type: 'application/xml'});
				FileSaver.saveAs(file, fileName);
				deferred.resolve();
			}).error(function (msg, code) {
				growl.error('proposal.get.error');
			});
			return deferred.promise;
		}, validateDerogationProcess: function (proposal) {
			var deferred = $q.defer();
			growl.info('proposal.validation.derogation.process.msg');
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'PUT',
				url: REST_URLS.PROPOSAL_VALIDATE_DEROGATION_PROCESS_REST_URL,
				data: proposal
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		}, validateInitialScenario: function (proposal) {
			var deferred = $q.defer();
			growl.info('proposal.validate.initial.scenario.msg');
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'PUT',
				url: REST_URLS.PROPOSAL_VALIDATE_INITIAL_SCENARIO_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId')),
				data: proposal
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		}, getFileNetUrl: function (contractNumber) {
			var deferred = $q.defer();
			var fileNetWebServiceUrl = Session.getPropertiesEnvironment().fileNetWebServiceUrl;
			$http({
				headers: {
					'Content-Type': 'application/xml'
				},
				method: 'GET',
				url: fileNetWebServiceUrl.replace('{0}', contractNumber)
			}).success(function (data) {
				logger.debug('debug', data);
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		requestValidation: function (comment, isStopRequest) {

			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				data: comment,
				url: REST_URLS.PROPOSAL_REQUEST_VALIDATION_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId')).replace(':isStopRequest', isStopRequest)

			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},
		addDiscussion: function (comment,recipients,parentDiscussionId,locaton) {

			var deferred = $q.defer();
			$http({
				method: 'PUT',
				data: {"comments":comment,"sendToId":recipients,"parentDiscussionId":parentDiscussionId,"urlContext":location.href},// defect #958 : Add the ability to select the user receiving the
				// comment in the Discussion flow
				url: REST_URLS.PROPOSAL_ADD_DISCUSSION_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId'))

			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},

		requestContractEdition: function (comment) {

			var deferred = $q.defer();
			$http({
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				data: comment,
				url: REST_URLS.PROPOSAL_REQUEST_CONTRACT_EDITION_REST_URL.replace(':scenarioId', localStorageService.get('scenarioId'))
			}).success(function (data) {
				deferred.resolve(data);
			}).error(function (msg, code) {
				deferred.reject(msg);
			});
			return deferred.promise;
		},


		// defect #958 : Add the ability to select the user receiving the
		// comment in the Discussion flow

		getEligibleUsersToReceiveComments: function(proposal,currentUserId) {
			var receivers = [];
			var derogationProcesses = proposal.derogationWorkflow.derogationProcesses;
			var discussions = proposal.discussions;
			var uniqueUserIds = [currentUserId];
			angular.forEach(proposal.derogationWorkflow.derogationProcesses, function(value, key) {
				var userId = value.userInfo.accountId;
				if (value.userInfo != null && uniqueUserIds.indexOf(userId) == -1) {
					receivers.push({"userId" : userId, "fullname" :value.userInfo.fullName  });
					uniqueUserIds.push(userId);
				}
			})
			angular.forEach(proposal.discussions, function(value, key) {
				var userId = value.discussionById;
				if(uniqueUserIds.indexOf(userId) == -1){
					receivers.push({"userId" : userId, "fullname" : value.discussionBy  });
					uniqueUserIds.push(userId);
				}
			})

			return receivers;
		}


	};
}]);


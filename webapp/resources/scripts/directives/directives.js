'use strict';

angular.module('autonomyApp.directive', [])
.directive('atyderogation', ['Logger','AuthService','$translate','DerogationService', function (Logger,AuthService,$translate,DerogationService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			id: '@drgId',
			input: '=?drgInput', // <-- the '?' makes it optional
			thresholdDynamic: '=?drgThresholdDynamic',
			field:'@drgField',
			section:'@?drgSection', // Group fields by Section in order to
									// compute the number of derogations
			lower: '=?drgLower',
			visible: '=?drgVisible',
			tooltipVisible: '=?drgTooltip', // for showing tooltip, default true
			tooltipKey: '=?drgTooltipKey' // for showing tooltip with key
											// i18n, default null

		},
		controller: ['$scope','DIVERS_EVENTS', function ($scope,DIVERS_EVENTS) {
			var logger = Logger.getInstance('atyderogation/controller');
			$scope.element = null;
			
			if(angular.isUndefined($scope.lower)) {
				$scope.lower = false;
			}

			if(angular.isUndefined($scope.visible)) {
				$scope.visible = true ;
			}

			if(angular.isUndefined($scope.tooltipVisible)) {
				$scope.tooltipVisible = true ;
			}

			if(angular.isUndefined($scope.tooltipKey)) {
				$scope.tooltipKey = null ;
			}

			$scope.pending = false;
			$scope.validated = false;
			$scope.warning = false;
			
			$scope.level = '';
			$scope.threshold = null; 
			$scope.equal = null;
			$scope.derogation = null;
			
			$scope.DerogationService = DerogationService;
			

			$scope.toggleValidation = function () {

				if(DerogationService.validable) {

					if (!$scope.validated) {
						if($scope.equal && typeof($scope.input) == 'boolean') {
							$scope.derogation = $scope.input == true ? 'true' : ($scope.input == false ? 'false' : null);
						} else {
							$scope.derogation = $scope.input;
						}
					} else {
						$scope.derogation = null;
					}
					$scope.updateStatus();
					DerogationService.updateDerogation(DerogationService.policyId, $scope.field,$scope.derogation,$scope.level);
				}
			};

			$scope.updateStatus = function () {

				$scope.pending = false;
				$scope.validated = false;
				$scope.warning = false;
				
				// If the field is not existed in derogation list, disable this
				// derogation
				// This test must be in the updateStatus method in order to
				// update the value when changing a scenario
				if (DerogationService.getDerogationLevel($scope.field)) {

					$scope.threshold = DerogationService.getThreshold($scope.field);

					$scope.equal = DerogationService.getEqual($scope.field);

					if (!$scope.derogation) {
						DerogationService.getDerogation($scope.field);
					}
					
					// Defect 840 : Clarify Derogation vs Warning
					$scope.warningType = DerogationService.isWarningType($scope.field);
					
				} else {
					return;
				}
				
				// No level in the warning derogation type
				$scope.level = !$scope.warningType ? DerogationService.getLevel($scope.field,angular.isDefined($scope.thresholdDynamic) ? $scope.input - $scope.thresholdDynamic : $scope.input)
						                      :'';

				// Remove the nest derogations from section
				if (!$scope.visible || $scope.input == null ) {

					DerogationService.removeFromSection($scope.section,$scope.field);
					return;
				}

				// Boolean and Enum type
				if($scope.equal) {

					var derogation = $scope.derogation ;
					// boolean check
					if(typeof($scope.input) == 'boolean') {
						derogation = $scope.derogation == 'true' ? true : ($scope.derogation == 'false' ? false : null);
					}

					// Check if a derogation has already validated
					if($scope.threshold != null && derogation != null) {
						if($scope.input != $scope.threshold){
							if($scope.input == derogation) {
								$scope.validated = true;
								// Add the validated derogation to the
								// derogationsSection object
								DerogationService.addToSection($scope.section,$scope.field, false, $scope.level);
							} else {
								$scope.pending = DerogationService.disabled ? false : true; // defect
																							// #408
																							// :
																							// Change
																							// of
																							// Derogation
																							// values
																							// in
																							// Admin
																							// shall
																							// not
																							// impact
																							// Frozen
																							// scenarios

								if ($scope.pending) {
									// Add the pending derogation to the
									// derogationsSection object
									DerogationService.addToSection($scope.section,$scope.field, true, $scope.level);
								}else {
									// Remove the validated derogation from the
									// derogationsSection object
									DerogationService.removeFromSection($scope.section,$scope.field);
								}

							}
						} else {
							DerogationService.removeFromSection($scope.section,$scope.field);
						}
						// No derogation found in database
					}else if($scope.threshold != null) {

						// Defect #408, modifying a threshold in back-office
						// might not impact to a frozen scenario
						if($scope.input != $scope.threshold && !DerogationService.disabled) {
							$scope.pending = true;
							DerogationService.addToSection($scope.section,$scope.field, true, $scope.level);
						}else {
							DerogationService.removeFromSection($scope.section,$scope.field);
						}

					}
					// Numeric type
				} else {
					// A derogation has been stored in database
					if ($scope.threshold != null && $scope.derogation != null) {

						// If the boolean lower = true => the derogation is
						// calculated by : input < threshold
						var isValidatedForThresholdDynamic = angular.isDefined($scope.thresholdDynamic)
						&& (($scope.lower && $scope.input - $scope.thresholdDynamic < $scope.threshold && $scope.input >= $scope.derogation) ||
								(!$scope.lower && $scope.input - $scope.thresholdDynamic > $scope.threshold && $scope.input <= $scope.derogation));

						var isValidatedForThreshold = angular.isUndefined($scope.thresholdDynamic) && ($scope.lower && $scope.input < $scope.threshold && $scope.input >= $scope.derogation)
						|| (!$scope.lower && $scope.input > $scope.threshold && $scope.input <= $scope.derogation);

						// A derogation has been already validated
						if (isValidatedForThresholdDynamic || isValidatedForThreshold) {
							$scope.validated = true;
							DerogationService.addToSection($scope.section,$scope.field, false, $scope.level);
						} else {
							// A derogation has been stored in database with a
							// pending status
							var isPendingForThresholdDynamic = angular.isDefined($scope.thresholdDynamic) && (($scope.lower && $scope.input - $scope.thresholdDynamic < $scope.derogation && $scope.input - $scope.thresholdDynamic < $scope.threshold)
							|| (!$scope.lower && $scope.input - $scope.thresholdDynamic > $scope.derogation && $scope.input - $scope.thresholdDynamic > $scope.threshold));

							var isPendingForThreshold = angular.isUndefined($scope.thresholdDynamic) && (($scope.lower && $scope.input < $scope.derogation && $scope.input < $scope.threshold)
							|| (!$scope.lower && $scope.input > $scope.derogation && $scope.input > $scope.threshold));

							if (isPendingForThresholdDynamic || isPendingForThreshold) {
								$scope.pending = DerogationService.disabled ? false : true;

								if ($scope.pending) {
									DerogationService.addToSection($scope.section,$scope.field, true, $scope.level);
								}else {
									DerogationService.removeFromSection($scope.section,$scope.field);
								}

							}else {
								DerogationService.removeFromSection($scope.section,$scope.field);
							}
						}

					} else {
						if ($scope.threshold != null) {

							// Defect #408, modifying a threshold in back-office
							// might not impact to a frozen scenario

							// Regarding to the threshold dynamic, the
							// derogation detection is calculated by the
							// difference between the thresholdDynamic and the
							// input

							var isPendingForThresholdDynamic = angular.isDefined($scope.thresholdDynamic)
							&& !DerogationService.disabled && (($scope.lower && $scope.input - $scope.thresholdDynamic < $scope.threshold)
									|| (!$scope.lower && $scope.input - $scope.thresholdDynamic > $scope.threshold));

							var isPendingForThreshold = angular.isUndefined($scope.thresholdDynamic) && !DerogationService.disabled
							&& (($scope.lower && $scope.input < $scope.threshold) || (!$scope.lower && $scope.input > $scope.threshold));
							if (isPendingForThresholdDynamic || isPendingForThreshold) {
								$scope.pending = true;
							}

						}
					}
				}


				// Update the level in accordion
				if ($scope.pending) {
					DerogationService.addToSection($scope.section,$scope.field, true, $scope.level);
				}else{
					DerogationService.removeFromSection($scope.section,$scope.field);
				}

				// Add the validated derogation to the derogationsSection object
				if ($scope.validated) {
					DerogationService.addToSection($scope.section,$scope.field, false, $scope.level);
				}

				if (($scope.warningType && $scope.pending) || ($scope.warningType && $scope.validated)) {
					$scope.pending = false;
					$scope.validated = false;
					$scope.warning = true;
				}

				$scope.tooltip = $scope.getTooltip();

				$scope.derogationButtonDisable=DerogationService.disabled
				|| !DerogationService.validable
				|| AuthService.getSession().derogationLevel > $scope.level
				|| $scope.warning;

				$scope.levelLabel = $scope.warning ? "" : "L" + $scope.level;

			};

			/**
			 * Show the tooltip when a derogation is detected.
			 */
			$scope.getTooltip = function() {
				var tooltip ='';
				if($scope.tooltipVisible) {

					if ($scope.warning) {
						tooltip = $translate.instant('derogation.warning.tooltip',{p0: $scope.threshold});
						return tooltip;
					}

					// Enum and Boolean Type
					if($scope.equal) {
						// A derogation is validated
						if($scope.derogation != null && $scope.input != null) {
							tooltip = $scope.derogation == 'true' ? $translate.instant('yes.label') : ($scope.derogation == 'false' ? $translate.instant('no.label') : null);
							return   tooltip;
						}
						else {
							tooltip = ($scope.threshold) ? $translate.instant('yes.label') : $translate.instant('no.label');
							return tooltip;
						}
					}
					// Numeric type
					if($scope.derogation != null && $scope.threshold != null) {

						if((angular.isDefined($scope.thresholdDynamic) && ($scope.lower && $scope.derogation <= $scope.thresholdDynamic) || (!$scope.lower && $scope.derogation >= $scope.thresholdDynamic))
								|| ($scope.lower && $scope.derogation <= $scope.threshold) || (!$scope.lower && $scope.derogation >= $scope.threshold)) {

							return $scope.derogation;

						}

					} else if($scope.threshold != null){
						tooltip = (angular.isDefined($scope.thresholdDynamic) ? $scope.thresholdDynamic : $scope.threshold);
						return tooltip;

					}
				}

				return null;
			};

			$scope.updateStatus();
		}],
		link: function (scope, element, attributes) {
			var logger = Logger.getInstance('atyderogation/link');
			scope.element = element;
			scope.$watch(
					'input',
					function handleWatchValueChange(newValue, oldValue) {
						if(newValue != oldValue) {
							scope.updateStatus();
						}
					}
			);

			scope.$watch(
					'visible',
					function handleWatchValueChange(newValue, oldValue) {
						if(newValue != oldValue) {
							scope.updateStatus();
						}
					}
			);

			// The value of the threshold dynamic could change, add a watch on
			// it
			if (angular.isDefined(scope.thresholdDynamic)) {
				scope.$watch(
						'thresholdDynamic',
						function handleWatchValueChange(newValue, oldValue) {
							if(newValue != oldValue) {
								scope.updateStatus();
							}
						}
				);
			}

			// Only watch on the given field
			scope.$watch(function()
					{ return scope.DerogationService.getDerogations()[scope.field];},
					function(newVal, oldVal){
						scope.derogation = DerogationService.getDerogation(scope.field);
						scope.updateStatus();

					},true);

		},
		template: [
			'<span ng-show="pending || validated || warning" tooltip="{{tooltip}}">',
			'<button id="{{::id}}" ng-disabled="derogationButtonDisable" type="button" class="btn btn-derogation" ng-class="{\'warning\':warning,\'pending\':pending, \'validated\':validated,\'visible\':visible}" ng-click="toggleValidation()">',
			'<i ng-class="{\'fa fa-2x fa-exclamation-triangle\':warning}" ></i> {{levelLabel}}</button>',
			'</span>'
			].join('')
	};
}])
/**
 * The aty-derogation-section-check directive verifies all directives that are
 * inside the accordion. If a pending derogation is found, a red triangle will
 * appear
 * 
 */
.directive('atyDerogationSectionCheck', ['Logger','$translate','DerogationService', function (Logger,$translate,DerogationService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			derogationSectionId:'@drgDerogationSectionId'
		},
		controller: ['$scope', function ($scope) {
			var logger = Logger.getInstance('atyderogationAccordionCheck/controller');
			$scope.DerogationService = DerogationService;
		}],
		link: function (scope, element, attributes) {

			// Only watch on the given section
			scope.$watch(function()
					{ return scope.DerogationService.getDerogationsSection()[scope.derogationSectionId];},
					function(newVal, oldVal){

						scope.level = '';
						element.removeClass('pending');
						if (DerogationService.hasDerogations(scope.derogationSectionId)) {
							// All derogations are validated
							if ( DerogationService.hasPendingDerogations(scope.derogationSectionId) ) {
								scope.levels = DerogationService.getPendingDerogations(scope.derogationSectionId).join("-");
								element.addClass('pending');
							}
						}

					},true);

		},
		template: '<i class="fa"> {{levels}}</i>'
	};
}])
.directive('currency', function () {
	return {
		restrict: 'E',
		replace: true,
		template: '<span class="autonomy-form-text"></span>'
	};
})
.directive('percent', function () {
	return {
		restrict: 'E',
		replace: true,
		template: '<span class="autonomy-form-text">%</span>'
	};
})
.directive('day', function () {
	return {
		restrict: 'E',
		replace: true,
		template: '<span class="autonomy-form-text" translate="days.label"></span>'
	};
})
.directive('countryselect', function () {
	return {
		restrict: 'E',
		replace: true,
		controller: ['$scope','$rootScope','$translate','NomenclatureService','DerogationService', function ($scope, $rootScope, $translate, NomenclatureService) {
			$scope.countries = NomenclatureService.getCountries($translate.use());
			$scope.isOptionDisabled = function(key,excluded) {
				return key === excluded;
			};
			$rootScope.$on('$translateChangeSuccess', function () {
				$scope.countries = NomenclatureService.getCountries($translate.use());
			});
		}],
		scope: {
			excluded : '=csExcluded'
		},

		template: '<select class="form-control" ng-options="key as value disable when isOptionDisabled(key,excluded) for (key, value) in countries"></select>'
	};
})
.directive('countrymultiselect', function () {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			ngModel: '=',
			ngDisabled: '='
		},
		controller: ['$scope', '$rootScope','$translate', 'NomenclatureService', '$filter', function ($scope, $rootScope, $translate, NomenclatureService, $filter) {

			$scope.countries = NomenclatureService.getCountries($translate.use());
			$rootScope.$on('$translateChangeSuccess', function () {
				$scope.countries = NomenclatureService.getCountries($translate.use());
			});

			$scope.ngModel = (!angular.isArray($scope.ngModel))? []:$filter('atyOrderByTranslated')($scope.ngModel, 'country.');
			$scope.selectAll = function () {
				$scope.ngModel = [];
				angular.forEach($scope.countries, function(value, key) {
					$scope.ngModel.push(key);
				});
			};
			$scope.deselectAll = function() {
				$scope.ngModel=[];
			};
			$scope.setSelectedItem = function(id){
				var tmpModel = angular.copy($scope.ngModel);
				$scope.ngModel = tmpModel;
				var index = $.inArray(id,$scope.ngModel) ;
				if (index !== -1) {
					$scope.ngModel.splice(index,1);
				} else {
					$scope.ngModel.push(id);
					$scope.ngModel = $filter('atyOrderByTranslated')($scope.ngModel, 'country.');
				}
			};
			$scope.isChecked = function (id) {
				return (-1 !== $.inArray(id, $scope.ngModel));
			};
			$scope.isEmpty = function (id) {
				return (0 === $scope.ngModel.length);
			};
		}],
		template: '<div class="multi-select"><div dropdown is-open="isopen" auto-close="disabled">'+
		'<button type="button" class="btn btn-default" data-hover="dropdown" dropdown-toggle ng-disabled="ngDisabled"><span translate="multiselect.country.title" ng-show="!isopen"></span><span translate="close.title" ng-show="isopen"></span><i class="fa fa-angle-down"></i></button>'+
		'<ul class="dropdown-menu scrollable-menu pull-left" role="menu" aria-labelledby="dropdownMenu">' +
		'<li><a type="button" ng-click="selectAll()"><i class="fa fa-check-square-o"></i><span translate="multiselect.country.check.all.label"></span></a></li>' +
		'<li><a type="button" ng-click="deselectAll();"><i class="fa fa-close"></i><span translate="multiselect.country.uncheck.all.label"></span></a></li>' +
		'<li class="divider"></li>' +
		'<li ng-repeat="(key, value) in countries" ng-click="setSelectedItem(key)"><i class="{{\'flag flag-\'+key|lowercase}}"></i><span>{{value}}</span><i class="fa fa-check pull-right" ng-show="isChecked(key)"></i></li>' +
		'</ul>' +
		'<ul class="dropdown-menu scrollable-menu pull-right" ng-show="!isEmpty()" role="menu" aria-labelledby="dropdownMenu">' +
		'<li translate="multiselect.country.selected.title"></li>' +
		'<li class="divider"></li>' +
		'<li ng-repeat="key in ngModel" ng-click="setSelectedItem(key)"><i class="{{\'flag flag-\'+key|lowercase}}"></i><span translate="{{\'country.\'+key}}"></span></li>' +
		'</ul>' +
		'</div>' +
		'<div class="selected-items" ng-show="!isopen">' +
		'<ul ng-show="!isEmpty()"><li ng-repeat="key in ngModel"><i class="{{\'flag flag-\'+key|lowercase}}"></i><span translate="{{\'country.\'+key}}"></span></li></ul>' +
		'<span ng-show="isEmpty()" translate="multiselect.country.empty.label"></span>' +
		'</div>' +
		'</div>'
	};
})
.directive('sectorselect', function () {
	return {
		restrict: 'E',
		replace: true,
		controller: ['$scope','$rootScope','NomenclatureService','$translate', function ($scope,$rootScope,NomenclatureService,$translate) {
			$scope.sectors = NomenclatureService.getSectors($translate.use());
			$rootScope.$on('$translateChangeSuccess', function () {
				$scope.sectors = NomenclatureService.getSectors($translate.use());
			});
		}],
		template: '<select class="form-control" ng-options="key as value for (key, value) in sectors"></select>'
	};
})
.directive('currencyselect', function () {
	return {
		restrict: 'E',
		replace: true,
		controller: ['$scope', 'NomenclatureService', function ($scope, NomenclatureService) {
			$scope.currencies = NomenclatureService.getCurrencies();
		}],
		template: '<select class="form-control" ng-options="key as value for (key, value) in currencies"></select>'
	};
})
.directive('atyInputNumber', function () {
	return {
		restrict: 'A',
		compile: function (element, attributes) {
			if(attributes.class.indexOf('need-for-pricing') > 0) {
				element.after('<label class="form-control need-for-pricing"  for="' + attributes['id'] + '" ng-bind="' + attributes['ngModel'] + ' | atyNumber:\'' + attributes['atyInputNumber'] +'\'"></label>');
			} else {
				element.after('<label class="form-control"  for="' + attributes['id'] + '" ng-bind="' + attributes['ngModel'] + ' | atyNumber:\'' + attributes['atyInputNumber'] +'\'"></label>');
			}

			return {
				pre: function(scope, elem, attrs){
				},
				post: function(scope, elem, attrs){
					var limit = attrs.atyMaxlength;
					var subForm = elem.closest('.aty-sub-form')[0];
					var formName = angular.element(subForm).closest('.aty-form')[0].getAttribute('name');
					var model = attrs.ngModel;
					scope.$watch(attrs.ngModel, function (v) {
						if(angular.isObject(scope[formName][subForm.getAttribute('name')][attrs.name])) {
							if(v) {
								if(angular.isNumber(v)) {
									if(limit != null && angular.isNumber(limit)) {
										if((v + '').length <= limit) {
											scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits', true);
										} else {
											scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits', false);
										}
									} else {// no limit
										scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits', true);
									}
								} else {
									scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits', false);
								}
							} else {
								// null or empty value is accepted
								scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits', true);
							}
						}
					});
				}
			};
		}
	};
})
.directive('atyMaxlength', function () {
	return {
		restrict: 'A',
		link: function (scope, element, attributes) {
			var limit = attributes.atyMaxlength,
			isNumber = ('number' === attributes.type);
			element.bind('keydown', function (event) {
				if ((isNumber && !((event.which > 47 && event.which < 58) || (event.which > 95 && event.which < 106))) || (element.val().length >= limit)) {
					// Except backspace and others characters of control
					if (event.keyCode != 8 && event.keyCode != 9 && event.keyCode != 37 && event.keyCode != 39 && event.keyCode != 46) {
						event.preventDefault();
					}
				}
			});
		}
	};
})
.directive('convertToNumber', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {
			ngModel.$parsers.push(function (val) {
				return parseInt(val, 10);
			});
			ngModel.$formatters.push(function (val) {
				return '' + val;
			});
		}
	};
})
.directive('atyDecimal',function(){
	return {
		restrict: 'A',
		link:function(scope,element,attributes){
			element.bind('keydown',function(event){
				// TODO : error with firefox 45 who accept , and not . for float
				// number
// var keyCode = event.keyCode;
				// accept : 8;9;37;39;46;110;59;16;96-105;48-57
// if( keyCode == 110 || keyCode == 59 || keyCode == 16 || (keyCode >= 96 &&
// keyCode <= 105) || (keyCode >= 48 && keyCode <= 57)) {
// var newVal=$(this).val() + event.key;
// if(($(this).val().search(/([0-9]*)\.[0-9][0-9]/) === 0 &&
// newVal.length>$(this).val().length)){
// event.preventDefault();
// }
// } else {
// // Except backspace and others characters of control
// if (event.keyCode != 8 && event.keyCode != 9 && event.keyCode != 37 &&
// event.keyCode != 39 && event.keyCode != 46) {
// event.preventDefault();
// }
// }
			});
		}
	};
})



.directive('uiSelectRequired', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          scope.$watch(function () {
            return ngModel.$modelValue;
          }, function (newValue) {
            if (ngModel.$modelValue) {
              ngModel.$setValidity("required", true);
            }
            else {
              ngModel.$setValidity("required", false);
            }
          });
        }
      };
    })


.directive('scrollToBottom', function($timeout, $window) {
    return {
        scope: {
            scrollToBottom: "="
        },
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watchCollection('scrollToBottom', function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        element[0].scrollTop =  element[0].scrollHeight;
                    }, 0);
                }

            });
        }
    };
})
;
// .directive('atyDigits',['Logger','$compile',function (Logger,$compile){
// return {
// restrict: 'A',
// link: function(scope, elem, attrs) {
// var limit = attrs.atyMaxlength;
// var subForm = elem.closest('.aty-sub-form')[0];
// var formName =
// angular.element(subForm).closest('.aty-form')[0].getAttribute('name');
// var model = attrs.ngModel;
// scope.$watch(attrs.ngModel, function (v) {
// if(v) {
// if(angular.isNumber(v) && (v + '').length <= limit) {
// scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits',
// true);
// } else {
// scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits',
// false);
// }
// } else {
// //null or empty value is accepted
// scope[formName][subForm.getAttribute('name')][attrs.name].$setValidity('digits',
// true);
// }
// });
// }
// } ;
// }]
// )

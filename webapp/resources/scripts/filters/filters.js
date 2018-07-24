'use strict';

angular.module('autonomyApp.filter', [])
.filter('renderDerogation', function ($sce) {
	return function (input) {
		var result = '';
		switch (input) {
		case 'VD':
			result = '<i class="fa fa-exclamation-triangle validated" title="" />';
			break;
		case 'PD':
			result = '<i class="fa fa-exclamation-triangle pending" title="" />';
			break;
		default:
		}
		return $sce.trustAsHtml(result);
	};
})
.filter('renderStatus', function () {
	return function (input) {
		var result = '';
		switch (input) {

		case 'IP':
			result = 'Progress';
			break;//status.option.progress
		case 'PR':
			result = 'Proposal';
			break;//status.option.proposal
		case 'SI':
			result = 'Signed';
			break;//status.option.signed

		default:
		}
		return result;
	};
})
.filter('renderLinks', function ($sce) {
	return function (input) {
		return $sce.trustAsHtml(input);
	};
})
.filter('renderCurrency', function ($locale, $filter, $rootScope) {
	var formats = $locale.NUMBER_FORMATS;
	return function (amount, currency, fractionSize) {

		if (angular.isUndefined(fractionSize)) {
			//fractionSize = formats.PATTERNS[1].maxFrac;
			fractionSize = 0;
		}
		// if null or undefined pass it through
		return (amount == null)
		? amount
				: (currency == null)
				? $filter('number')(amount, fractionSize).replace(/\,/ig,' ')
						: $filter('number')(amount, fractionSize).replace(/\,/ig,' ') + ' ' + currency;
	};
})
.filter('convertAttNameToLabelCode', function () {
	return function (input) {
		var regexp = /([A-Z]{1})/g;
		regexp.test(input);
		return input.replace(regexp,'.$1').toLowerCase();
	};
})
.filter('percentage', ['$filter', function($filter) {
	return function(input) {
		if(input != null) {
			return $filter('number')(input)+'%';
		} else {
			return '';
		}
	};
}])
.filter('atyNumber', ['$filter', function($filter) {
	return function(input,suffix,rateInPercent) {
		if(input != null && (angular.isNumber(input) || angular.isNumber(parseInt(input,10)))) {
			if(typeof(suffix) == 'undefined' || suffix == null) {
				suffix = '';
			}
      if(rateInPercent != null) {
        if (rateInPercent === false) {
          input = input*10;
        }
      }

			return $filter('number')(input).replace(/\,/ig,' ') + suffix;
		} else {
			return '';
		}
	};
}])
.filter('atyToNumber', [function() {
	return function(input) {
		if (input != null && (angular.isNumber(input) || angular.isNumber(parseInt(input,10)))) {
			return parseInt(input,10);
		}
		else {
			return 0;
		}
	};
}])
.filter('renderProductCompatibility', function ($sce) {
	return function (input) {
		var result = '';
		switch (input) {
		case 'MIGR':
			result = '<i class="fa fa-check migrable ' + input + '"></i>';
			break;
		case 'MIGR_TRANS':
			result = '<i class="fa fa-check-circle migrable-transformation ' + input + '"></i>';
			break;
		case 'NOT_MIGR':
			result = '<i class="fa fa-times not-migrable ' + input + '"></i>';
			break;
		default:
		}
		return $sce.trustAsHtml(result);
	};
})
.filter('renderBusiness', function ($sce,$translate) {
	return function (input) {
		var result = '';
		switch (input) {
		case 'NEW':
			result = 'business.enum.new';
			break;
		case 'RENEWAL':
        result = 'business.enum.renewal';
        break;
		case 'TRANSF':
			result = 'business.enum.transformation';
			break;
		case 'CHECK_MIGRATION':
			result = 'business.enum.check.migration';
			break;
		case 'CLO':
			result = 'business.enum.clo';
			break;
		default:
		}
		return result;
	};
})
  .filter('renderComment', function ($sce,$translate) {
    return function (input, portfolioLine) {
      var result = '';
      switch (input) {
        case 'buyerstudy.country.not.covered.comment':
          result = $translate.instant(input, {p0:$translate.instant('country.' + portfolioLine.countryIso)});
          break;
        case 'buyerstudy.product.not.covered.comment':
          result = $translate.instant(input, {p0:portfolioLine.deliveryTypeCode});
          break;
        default:
          if (input !== null && '' !== input) {
            result = $translate.instant(input);
          }
      }
      return $sce.trustAsHtml(result);
    };
  })
  .filter('searchCountryFilter', function ($sce,$translate) {
    return function (items, search) {
      var filtered = [];

      angular.forEach(items, function(item) {
        if($translate.instant('country.' + item.code).toLowerCase().indexOf(search.toLowerCase()) !== -1){
          filtered.push(item);
        }
      });

      return filtered;

    };
  })

/**
 * orderByTranslated Filter
 * @param  {Array} array
 * @param  {String} i18nKeyPrefix
 * @return {Array}
 */
.filter('atyOrderByTranslated', ['$translate', '$filter', function($translate, $filter) {
  return function (array, prefix) {
    var result = [];
    var translated = [];
    angular.forEach(array, function(value) {
        var code = (angular.isObject(value))?  value.code:value;
        var i18nKey = prefix ? prefix + code : code;
      translated.push({
        key: value,
        label: $translate.instant(i18nKey)
      });
    });
    angular.forEach($filter('orderBy')(translated, 'label'), function(sortedObject) {
      result.push(sortedObject.key);
    });
    return result;
  };
}])
/**
 * intersection Filter
 * Defect #183
 * @param  {Array} array1
 * @param  {Array} array2
 * @return {Array} return the elements of array1 which are in the array2
 */
  .filter('atyIntersection', function() {
    return function (array1, array2) {
      var result = [];
      var isIn;
      if (null != array1 && array1.length > 0 && null != array2 && array2.length > 0) {
        angular.forEach(array1, function (item1) {
          isIn = false;
          angular.forEach(array2, function (item2) {
            if (item1.code === item2.code) {
              isIn = true;
              return;
            }
          });
          if (isIn) {
            result.push(item1);
          }
        });
      }
      return result;
    };
  })
  /**
   * intersection Filter
   * Defect #183
   * @param  {Array} arrays og object (variable number of parameters)
   * @return {Array} return the elements of array1 which are in others arrays
   */
  .filter('atyIntersections', function() {
    return function () {
      var result = [];

      if (arguments.length == 0 || null == arguments[0] || !angular.isArray(arguments[0])) {
        return result;
      }
      else if (arguments.length == 1) {
        return arguments[0];
      }
      else {
        var array1 = arguments[0];
        var includeArrays = [];
        var isIn;
        for (var i = 1; i < arguments.length; i++) {
          if (null != arguments[i] && angular.isArray(arguments[i]))
            includeArrays = includeArrays.concat(arguments[i]);
        }

        angular.forEach(array1, function (item1) {
          isIn = false;
          angular.forEach(includeArrays, function (item2) {
            if (item1.code === item2.code) {
              isIn = true;
              return;
            }
          });
          if (isIn) {
            result.push(item1);
          }
        });

        return result;
      }
    };
  })
  /**
   * exclusion Filter
   * Defect #
   * @param  {Array} arrays og object (variable number of parameters)
   * @return {Array} return the elements of array1 which are not in others arrays
   */
  .filter('atyExclusion', function() {
    return function () {
      var result = [];

      if (arguments.length == 0 || null == arguments[0] || !angular.isArray(arguments[0])) {
        return result;
      }
      else if (arguments.length == 1) {
        return arguments[0];
      }
      else {
        var array1 = arguments[0];
        var excludeArrays = [];
        var isIn;
        for (var i = 1; i < arguments.length; i++) {
          if (null != arguments[i] && angular.isArray(arguments[i]))
        	  excludeArrays = excludeArrays.concat(arguments[i]);
          }

        angular.forEach(array1, function (item1) {
          isIn = false;
          angular.forEach(excludeArrays, function (item2) {
            if (item1.code === item2.code) {
              isIn = true;
              return;
            }
          });
          if (!isIn) {
            result.push(item1);
            }
          });

        return result;
      }
    };
  })
  .filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
})
.filter('renderScenarioProgressStatus', function ($sce,$translate) {
	return function (input) {

		var result = '';
		switch (input) {
		case 'INIT':
			result = 'scenario.progress.status.enum.initialization';
			break;
    case 'QUOTE_REQ':
        result = 'scenario.progress.status.enum.quotation.request';
        break;
		case 'QUOTE_DONE':
			result = 'scenario.progress.status.enum.quoted';
			break;
		case 'DEROG_REQ':
			result = 'scenario.progress.status.enum.derogation.request';
			break;
		case 'DEROG_DONE':
			result = 'scenario.progress.status.enum.derogation.validated';
      break;
    case 'NBI_DONE':
			result = 'scenario.progress.status.enum.offer.edition';
    break;
    case 'CONTRACT_REQ':
			result = 'scenario.progress.status.enum.contract.edition.request';
    break;
    case 'CONTRACT_DONE':
			result = 'scenario.progress.status.enum.contract.edition';
    break;
    case 'TRANSFER':
    result = 'scenario.progress.status.enum.transferred';
    break;  
		default:
		}
		return result;
	};
})
.filter('renderContractStatus', function ($sce,$translate) {
	return function (input) {

		var result = '';
		switch (input) {
		case 'PROJECT':
			result = 'contract.status.enum.project';
			break;
    case 'SIGNED':
        result = 'contract.status.enum.signed';
        break;
		case 'CANCELLED':
			result = 'contract.status.enum.cancelled';
			break;
		case 'PROJECT_CANCELLED':
			result = 'contract.status.enum.project.cancelled';
			break;
		default:
		}
		return result;
	};
})
.filter('renderCancelProjectReason', function ($sce,$translate) {
	return function (input) {
		
		var result = '';
		switch (input) {
		case 'OFFER_REJECTED':
			result = 'project.cancel.reason.offer.rejected';
			break;
		case 'CONTRACT_REJECTED':
			result = 'project.cancel.reason.contract.rejected';
        break;
		case 'COFACE_DECISION':
			result = 'project.cancel.reason.contract.coface.decision';
		break;
		
		default:
		}
		return result;
	};
});

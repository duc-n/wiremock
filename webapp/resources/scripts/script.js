/*
Lp digital - v1.2 june2015
JS COFACE
required: jquery
*/

'use strict';

// Docu Ready
$(document).ready(function() {

  Chart.defaults.global.responsive = true;
  Chart.defaults.global.maintainAspectRatio = true;

  //init SHORTCUTS
  if ($('#access-shortcuts-wrapper>ul').length > 0){
    $('access-shortcuts-wrapper>ul').initShortcuts();
  }

  //Placeholder Fix (no Modernizr)
  $('.lt-ie10 [placeholder]').focus(function() {
    var input = $(this);
    if (input.val() == input.attr('placeholder')) {
      input.val('');
      input.removeClass('placeholder');
    }
  }).blur(function() {
    var input = $(this);
    if (input.val() == '' || input.val() == input.attr('placeholder')) {
      input.addClass('placeholder');
      input.val(input.attr('placeholder'));
    }
  }).blur();
  $('.lt-ie10 [placeholder]').parents('form').submit(function() {
    $(this).find('.lt-ie10 [placeholder]').each(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
      }
    });
  });

  //Printable version
  $('.btn-printer').on('click', function(e) {
    e.preventDefault();
    window.print();
  });

  //Tooltip Boostrap
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });


  //RWD table with class responsive - See CSS
  // 991px BREAKPOINt
  //MOD - based on: http://zurb.com/playground/playground/responsive-tables/responsive-tables.js
  $('table.table-responsive').tableRwd();

//END ready
});


// Window Load
$(window).load(function(){
  //


});
// End window load

//initShortcuts
$.fn.initShortcuts = function(options) {
  var obj = $(this);
  obj.find('a').focus(function(e) {obj.css('height', 'auto'); });
  obj.find('a').blur(function(e) {obj.css('height', '0px'); });

  return this;
};

//FN Table RWD
//MOD - based on: http://zurb.com/playground/playground/responsive-tables/responsive-tables.js
$.fn.tableRwd = function(opt) {
  var defaults = {
    breakpoint : 991
  };
  var options = $.extend(defaults, opt);
  var obj = $(this);

  var switched = false;
  var updateTables = function () {
    if (($(window).width() < options.breakpoint) && !switched) {
      switched = true;
      obj.each(function (i, element) {
        splitTable($(element));
      });
      return true;
    } else if (switched && ($(window).width() > options.breakpoint)) {
      switched = false;
      obj.each(function (i, element) {
        unsplitTable($(element));
      });
    }
  };

  $(window).load(updateTables);
  $(window).bind('resize', updateTables);

  function splitTable(original) {
    original.attr('data-margin',original.css('margin')).css('margin',0).wrap(
      $("<div class='table-wrapper'></div>").css({'overflow-x':'scroll', 'overflow-y':'visible', 'margin': original.attr('data-margin')})
    );
  }

  function unsplitTable(original) {
    original.css('margin','').removeAttr('data-margin');
    original.unwrap();
  }


  return this;
};

//custom sort number formatted
$.fn.dataTableExt.oSort['number-formatted-asc'] = function(a,b) {
	  if (a == null || a == '') {
          return -1;
	  }
      else if (b == null || b == '') {
          return 1;
      }
      else {
          var ia = parseInt(a.replace(' ',''));
          var ib = parseInt(b.replace(' ',''));
          return (ia<ib) ? -1 : ((ia > ib) ? 1 : 0);
      }
  };

$.fn.dataTableExt.oSort['number-formatted-desc'] = function(a,b) {
	  if (a == null || a == '') {
          return 1;
	  }
      else if (b == null || b == '') {
          return -1;
      }
      else {
          var ia = parseInt(a.replace(' ',''));
          var ib = parseInt(b.replace(' ',''));
          return (ia>ib) ? -1 : ((ia < ib) ? 1 : 0);
      }
  };

//custom product compatibility
//MIGR, MIGR_TRANS,NOT_MIGR, NONE
$.fn.dataTableExt.oSort['product-compatibility-asc'] = function(a,b) {
      var aweight = (a == null || a == '')? 4 : ((a.indexOf('NOT_MIGR') >= 0)? 1 : (a.indexOf('MIGR_TRANS') >= 0 ? 2 : 3));
      var bweight = (b == null || b == '')? 4 : ((b.indexOf('NOT_MIGR') >= 0)? 1 : (b.indexOf('MIGR_TRANS') >= 0 ? 2 : 3));
      return (aweight < bweight) ? -1 : ((aweight > bweight) ? 1 : 0);
  };

$.fn.dataTableExt.oSort['product-compatibility-desc'] = function(a,b) {
	var aweight = (a == null || a == '')? 0 : ((a.indexOf('NOT_MIGR') >= 0)? 1 : (a.indexOf('MIGR_TRANS') >= 0 ? 2 : 3));
    var bweight = (b == null || b == '')? 0 : ((b.indexOf('NOT_MIGR') >= 0)? 1 : (b.indexOf('MIGR_TRANS') >= 0 ? 2 : 3));
    return (aweight > bweight) ? -1 : ((aweight < bweight) ? 1 : 0);
};

/*
  Print div element
 */
function printElement(elem) {
  var $printSection = document.getElementById("printSection");

  if (!$printSection) {
    var $printSection = document.createElement("div");
    $printSection.id = "printSection";
    document.body.appendChild($printSection);
  }

  $printSection.innerHTML = "";
  $printSection.appendChild(elem);

  window.print();

  $printSection.innerHTML = "";
}

if (!Object.keys) {
    Object.keys = function (obj) {
        var arr = [],
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(key);
            }
        }
        return arr;
    };
}

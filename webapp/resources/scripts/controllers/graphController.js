'use strict';

angular.module('autonomyApp.graph', [])
  .controller('GraphController', function ($scope, $modalInstance, $translate, buyerStudyResult) {

    $scope.buyerStudyResult = buyerStudyResult;

    $scope.modalGraphOption = {
      headerText: $translate.instant('buyerstudy.graph.modal.title')
    };

    /* pieChartConfig */
    $scope.modalGraphOption['pieChartConfig2D'] = {
      colors: ['#5081BD', '#C04F4E', '#9BBA59', '#8063A2'],
      labels: [
        $translate.instant('buyerstudy.accepted.label'),
        $translate.instant('buyerstudy.pending.label'),
        $translate.instant('buyerstudy.partial.label'),
        $translate.instant('buyerstudy.refusal.label')
      ],
      options: {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: false,

        //String - The colour of each segment stroke
        segmentStrokeColor: '#fff',

        //Number - The width of each segment stroke
        segmentStrokeWidth: 0,

        //Number - Amount of animation steps
        animationSteps: 100,

        //String - Animation easing effect
        animationEasing: 'easeOutBounce',

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: false,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false

        //String - A legend template
        //legendTemplate : '<ul class=\'<%=name.toLowerCase()%>-legend\'><% for (var i=0; i<segments.length; i++){%><li><span style=\'background-color:<%=segments[i].fillColor%>\'></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
      }
    };

    /* barChartConfig */
    $scope.modalGraphOption['barChartConfig2D'] = {
      colors: ['#C15051', '#A6B65F'],
      series: [$translate.instant('buyerstudy.requested.label'), $translate.instant('buyerstudy.accepted.label')]
    };

    //update data in graph
    $scope.modalGraphOption.pieChartConfig2D.data = [
      $scope.buyerStudyResult.portfolioTotals.totalFullAcceptedAmount,
      $scope.buyerStudyResult.portfolioTotals.totalPendingAmount,
      $scope.buyerStudyResult.portfolioTotals.totalPartialAcceptedAmount,
      $scope.buyerStudyResult.portfolioTotals.totalRefusalAmount
    ];

    $scope.modalGraphOption.barChartConfig2D.labels = $scope.buyerStudyResult.portfolioTotals.dras;
    $scope.modalGraphOption.barChartConfig2D.data = [$scope.buyerStudyResult.portfolioTotals.requestedTotalByDra, $scope.buyerStudyResult.portfolioTotals.acceptedTotalByDra];

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

  });

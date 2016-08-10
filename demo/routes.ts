import app from './app'
import LayoutController from './layout/layout.controller'
import {ChartController} from './chart/chart.controller'

app.config(['$stateProvider', '$urlRouterProvider'], (
  stateProvider: ng.ui.IStateProvider,
  urlRouterProvider: ng.ui.IUrlRouterProvider
) => {
  urlRouterProvider.otherwise('/');

  stateProvider
    .state('layout', {
      abstract: true,
      templateUrl: 'layout/layout.html',
      controller: LayoutController,
      controllerAs: '$ctrl'
    })
    .state('layout.home', {
      url: '/',
      templateUrl: 'home/home.html',
      data: {
        label: 'Home'
      }
    })
    .state('layout.chart', {
      url: '/chart',
      templateUrl: 'chart/chart.html',
      controller: ChartController,
      controllerAs: '$ctrl',
      data: {
        label: 'Chart Directive'
      }
    })
});

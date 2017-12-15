

var statusMsgListModule = angular.module('statusMessageList', [])

statusMsgListModule.component('statusMessageList', {
    bindings: { },
    template: '<ul><li uib-alert ng-repeat="alert in $ctrl.alerts" ng-class="alert-(alert.type || warning)" close="$ctrl.closeAlert($index)">{{alert.msg}}</li></ul>',
    controller: statusMessageListController,
})


function statusMessageListController() {
    var $ctrl = this;
    this.$onInit = function () {
        $ctrl.alerts = [];
    }

    this.addMessage = function (msg) {
        msg.type = (msg.type || 'info');
        $ctrl.alerts.push(msg);
        return $ctrl.alerts.length()-1;
    }
    this.closeAlert = function (msgIdx) {
        $ctrl.alerts.splice(msgIdx, 1);
    }
    this.updateMessage = function (msg) {

    }

}


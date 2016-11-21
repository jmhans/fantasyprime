angular.module('fantasyfantasy').component('team', {
    bindings: { team: '<' },

    template: '<h4>My Team Page</h4>'+

              '<div>Name: {{$ctrl.team.name}}</div>' +
              '<div>Id: {{$ctrl.team.id}}</div>' +
              
              '<button ui-sref="teams">Close</button>'
})
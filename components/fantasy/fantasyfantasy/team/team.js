
fantasyFantasyModule.config(function ($stateProvider) {
    var states = [
        {
            name: 'ff.teams.team.detail',
            url: '/info',
            component: 'info',
            resolve: {
                team: function (teams, $rootScope, $stateParams, TeamsService) {
                    return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                        $rootScope.selectedTeam = tm;
                        return $rootScope.selectedTeam;
                    });
                }
            },
            requiresParams: false,
            menu: { name: "My Team", priority: 1000 }
        },

      {
          name: 'ff.teams',
          url: '/teams',
          component: 'teams',
          requiresParams: false,
          resolve: {
              teams: function (TeamsService) {
                  return TeamsService.getAllTeams();
              },
              fantasy_teams: function (RostersService) {
                  return RostersService.getActiveRosters();
              }

          }
      },
      {
          name: 'ff.teams.team',
          // This state takes a URL parameter called teamId
          url: '/{teamId:int}',
          component: 'team',
          // This state defines a 'person' resolve
          // It delegates to the PeopleService, passing the personId parameter
          requiresParams: true,
          resolve: {
              team: function (teams, $rootScope, $stateParams, TeamsService) {
                  return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                      $rootScope.selectedTeam = tm;
                      return $rootScope.selectedTeam;
                  });
              }
          },
          params: {
              teamId: 1
          }
      },
      {
          name: 'ff.teams.freeagents',
          // This state takes a URL parameter called teamId
          url: '/allteams',
          component: 'allteams',
          menu: { name: 'All Teams', priority: 900 },
          requiresParams: false
      }

    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});


fantasyFantasyModule.component('team', {
    bindings: { team: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/team/team.html'
})


fantasyFantasyModule.component('info', {
    bindings: { team: '<' },

    templateUrl: 'components/fantasy/fantasyfantasy/team/info.html'
})
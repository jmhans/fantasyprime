stateTreeModule.service('$stateTree', ['$state', function ($state) {
    var treeStates;

    this.nearestAncestor = function (stateName) {
        var ancestor = $state.get(stateName).$$state().parent;
        while (ancestor != '' && treeStates.indexOf(ancestor.self) == -1) {
            ancestor = ancestor.parent;
        }
        if (ancestor != '') {
            return ancestor.self;
        }
    };

    this.get = function () {
        var self = this;
        var states = $state.get();

        treeStates = states.filter(function (st) {
            return isDefined(st.tree);
        });

        treeStates.forEach(function (ts) {
            var anc = self.nearestAncestor(ts.name);
            if (isDefined(anc)) {
            ts.ancestor = anc;
            }
        });

        return treeStates;
    };




    this.getChildren = function (stateName) {
        var result;
        if (!treeStates) {this.get();}

        var result = treeStates.filter(function (ts) {
            if (isDefined(ts.ancestor)) {
                return (ts.ancestor.name == stateName);
            }
        });
        return result;
    }

}]);
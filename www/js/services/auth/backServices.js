app.factory('backService', function ($q,$rootScope) {
    return {
        getSateName: function () {
            return $q(function (resolve, reject) {
               var stateObj = $rootScope.from;
                console.log("stateName",stateObj)
               if(stateObj.stateName != 'tagFeed'){
                   resolve(stateObj.stateName);
               }
               else{
                   resolve(stateObj.stateName);
               }
            });
        }
    }
})

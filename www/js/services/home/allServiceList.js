app.factory('allServiceList', function ($q) {
    return {
        getServiceVersion: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendorServiceList/' + cityId+'/version')
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getAllServices: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendorServiceList/' + cityId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        }
    }
});
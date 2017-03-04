app.factory('homeServices', function ($q) {
    return {
        getSelectedCityBanner: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('banners/'+cityId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getDefaultBanner:function () {
            return $q(function (resolve,reject) {
                firebase.database().ref('banners/fab2u')
                    .once('value').then(function(snapshot){
                        resolve(snapshot.val());
                },function (error) {
                    reject(error);
                 });
            })
        }

    }
});
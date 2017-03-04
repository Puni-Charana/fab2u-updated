app.factory('LocationService', function ($q) {
    return {
        getAllCity: function () {
            return $q(function (resolve, reject) {
                firebase.database().ref('city')
                    .orderByChild('active').equalTo(true).once('value',function(snapshot){
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getCityLocality:function (cityId) {
            return $q(function (resolve,reject) {
                firebase.database().ref('location/'+cityId)
                    .once('value').then(function(snapshot){
                    resolve(snapshot.val());
                },function (error) {
                    reject(error);
                });
            })
        }

    }
});
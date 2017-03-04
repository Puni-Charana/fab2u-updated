app.factory('favouriteVendorsService', function ($q) {
    return {
        getFavVendors: function (uid) {
            return $q(function (resolve, reject) {
                firebase.database().ref('favourites/' + uid)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        }
    }
})

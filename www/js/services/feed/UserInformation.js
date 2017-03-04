app.factory('userInfoService', function ($q) {
    return {
        getPersonalInfo: function (uId) {
            return $q(function (resolve, reject) {
                firebase.database().ref("users/data/"+uId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        }
    }
});
app.factory('allVendorService', function ($q) {
    return {
        getVersion: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendorFilters/' + cityId+'/version')
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getAllVendors: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendorFilters/' + cityId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getVlistVersion: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendorList/' + cityId+'/version')
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getVendorsList: function (cityId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendorList/' + cityId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getVendorInfo: function (cityId,vendorId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('vendors/' + cityId +'/vendors/'+vendorId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getAllReview: function (cityId,vendorId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('reviews/'+ cityId+'/'+ vendorId+'/Reviews')
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        },
        getMenu: function (vendorId) {
            return $q(function (resolve, reject) {
                firebase.database().ref('menu/'+ vendorId)
                    .once('value').then(function (snapshot) {
                    resolve(snapshot.val());
                }, function (error) {
                    reject(error);
                });
            });
        }
    }
});
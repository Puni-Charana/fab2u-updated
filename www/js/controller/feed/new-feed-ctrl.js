app.controller("newFeedCtrl", function($scope, userServices, $http, $location, $timeout, $cordovaToast,
    $cordovaCamera, $ionicPopup, $state, $ionicLoading, $ionicPopover, $ionicModal, $cordovaImagePicker) {


    document.addEventListener("deviceready", function() {
        $scope.goBack = function() {
            history.back();
        };

        var locDetails, uid, email, name = null;

        if (localStorage.getItem("uid")) {
            uid = localStorage.getItem("uid");
        }
        if (localStorage.getItem("email")) {
            email = localStorage.getItem("email");
        }
        if (localStorage.getItem("name")) {
            name = localStorage.getItem("name");
        }
        if (localStorage.getItem('selectedLocation')) {
            locDetails = JSON.parse(localStorage.getItem('selectedLocation'));
        }

        if (!uid) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Not logged in',
                template: 'Please login/sign up to continue'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    $ionicLoading.hide();
                    $state.go('login')
                } else {
                    console.log('You are not sure');
                }
            });
        }

        /***************************************************************/
        /*
            NOTE: Croppie Version: 2.4.0 required
            And dont use croppie.min.js instead use croppie.js
        */

        // Croppie will display here
        var el = document.getElementById('image-preview');
        var feedUploader = null;
        var imgUrl = null; // User selected image
        /*
         * orientation 1 = width > height
         * orientation 2 = width < height
         *
         * Default orientation is 1
         */
        var orientation = 1;

        // Show/Hide next, rotate, and label
        $scope.show = false;

        $scope.feed = {};

        // Default option for croppie
        feedUploader = new Croppie(el, {
            viewport: {
                width: 250,
                height: 180
            },
            boundary: {
                width: 300,
                height: 300
            }
        });

        // Called when user rotate the crop orientation
        $scope.rotate = function() {
            // Destroy the old croppie object
            feedUploader.destroy();

            // Create a new croppie object based on the orientation selected
            if (orientation == 2) {
                orientation = 1;
                feedUploader = new Croppie(el, {
                    viewport: {
                        width: 250,
                        height: 180
                    },
                    boundary: {
                        width: 300,
                        height: 300
                    }
                });
            } else {
                orientation = 2;
                feedUploader = new Croppie(el, {
                    viewport: {
                        width: 180,
                        height: 250
                    },
                    boundary: {
                        width: 300,
                        height: 300
                    }
                });
            }
            addImage();
        }

        // Add/Bind image url feedUploader object to display and crop image
        function addImage() {
            if (imgUrl) {
                feedUploader.bind({
                    url: imgUrl
                });
                // Show the hidden div that contains the image to be crop
                $timeout(function() {
                    $scope.show = true;
                });
            }
        }

        // Called when user selects gallery option.
        $scope.gallery = function() {
            document.addEventListener("deviceready", function () {
                // http://ngcordova.com/docs/plugins/imagePicker/
                var options = {
                    maximumImagesCount: 1,
                    width: 0,
                    height: 0,
                    quality: 100
                };

                $cordovaImagePicker.getPictures(options)
                .then(function(result) { // NOTE: called even you cancelled the gallery
                    if(result.length>0){ // result is an array of uri
                        imgUrl = result[0]; // since max count is 1 first elem in the array works
                    }
                    addImage();
                }, function(error) {
                    alert(error);
                    // error getting photos
                });
            }, false);
        }

        // Called when user selects camera option.
        // Open camera for photo capture
        $scope.camera = function() {
            document.addEventListener("deviceready", function () {
                // $scope.modal.show();
                // return;
                // http://ngcordova.com/docs/plugins/camera/
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                };

                $cordovaCamera.getPicture(options).then(function(imageURI) {
                    imgUrl = imageURI;
                    addImage();
                }, function(error) {
                    // error
                    // NOTE : Called even when the camera is cancelled
                    addImage();
                });
            }, false);

        }

        // Create the feed-upload modal that we will use later
        $ionicModal.fromTemplateUrl('templates/feed/feed-upload-modal.html', {
            scope: $scope // allow modal to access $scope variable
        }).then(function(modal) {
            $scope.modal = modal;
        });


        // Triggered in the feed modal to close it
        $scope.closeFeedModal = function() {
            $scope.modal.hide();
        };

        $scope.crop_image = true; // by default image will be croped
        // Called when user goes full image option/ crop image option
        $scope.cropOption = function() {
            $timeout(function() {
                $scope.crop_image = $scope.crop_image ? false : true;
                if (!$scope.crop_image) {
                    $scope.nocropimage = imgUrl;
                } else {
                    // Call since croppie needs url of image
                    addImage();
                }
            });
        }

        // Called when user click next after cropping the image
        $scope.next = function() {
            $ionicLoading.show();
            if (!$scope.crop_image) {
                var img = new Image();
                img.setAttribute('crossOrigin', 'anonymous');
                img.onload = function() {
                    var canvas = document.createElement("canvas");
                    canvas.width = this.width;
                    canvas.height = this.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0);

                    var b64 = canvas.toDataURL("image/JPEG");
                    if (b64) {
                        $scope.base64ImageData = b64;
                        $scope.modal.show();
                        $ionicLoading.hide();
                    } else {
                        alert("Please try again");
                    }
                };
                img.src = imgUrl;
            } else {
                feedUploader.result({
                    type: 'base64',
                    format: 'jpeg'
                }).then(function(base64) {
                    $timeout(function() {
                        $scope.base64ImageData = base64;
                        $scope.modal.show();
                        $ionicLoading.hide();
                    });
                });
            }
        }

        function validate_link(link) {

            var patt = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
            var result = patt.exec(link);

            if (result != null) {
                return result[0];
            } else {
                return false;
            }
        }


        $scope.compressImage = function() {
            $ionicLoading.show();
            var img = new Image(); // create new image object  
            img.onload = function() { // called when image is fully loaded
                // console.log("ORIGINAL: "+this.width + 'x' + this.height);
                resize($scope.base64ImageData, this.width, this.height); // Start resizing the image
            }
            img.src = $scope.base64ImageData; // set image source (base64data/image url)
            // img.src = "https://foo.com/images/xyz.JPG"

        }
        // Resize image if image is greater then max height
        function resize(base64data, orig_w, orig_h) {
            var maxWidth = 800; // Max width for the image
            var maxHeight = 800; // Max height for the image
            var ratio = 0; // Used for aspect ratio
            var width = orig_w; // Current image width
            var height = orig_h; // Current image height


            // Check if the current width is larger than the max
            if (width > maxWidth) {
                ratio = maxWidth / width; // get ratio for scaling image
                height = height * ratio; // Reset height to match scaled image
                width = width * ratio; // Reset width to match scaled image
            }
            // Check if current height is larger than max
            if (height > maxHeight) {
                ratio = maxHeight / height; // get ratio for scaling image
                height = height * ratio; // Reset height to match scaled image
                width = width * ratio; // Reset width to match scaled image
            }


            console.log("RATIO: " + width + 'x' + height);
            var canvas = document.createElement('canvas'); // Create a new canvas t draw image into
            canvas.width = width; // Set canvas width with new calculated width
            canvas.height = height; // Set canvas height with new calculated height
            var ctx = canvas.getContext("2d"); // Create a context

            var image = new Image(); // Initialize a new image object
            image.onload = function() { // called when image is fully loaded
                ctx.drawImage(image, 0, 0, width, height); // Draw a new image
                if (this.width + this.height == 0) { //if width and height are both zero then there is an error
                    this.onerror(); // call error function
                } else { // success
                    // Do something
                    uploadFeed(canvas.toDataURL("image/jpeg", 1));
                }
            };
            image.src = base64data; // set image src
            image.onerror = function() { // called when image data is invalid
                alert("error"); // display error
            }
        }

        // Triggered in the feed modal to close it
        function uploadFeed(resizedBased64Image) {
            var feed = $scope.feed;
            // alert("Start uploading");
            if (feed.link) {
                if (validate_link(feed.link)) {
                    feed.link = validate_link(feed.link);
                } else {
                    // Not a valid link
                    alert("Please enter a valid link\neg:http://www.myblog.com/blog-id");
                    $ionicLoading.hide();
                    return;
                }
            } else {
                delete feed.link;
            }

            var re = /#(\w+)(?!\w)/g,
                hashTag, tagsValue = {};
            while (hashTag = re.exec(feed.description)) {
                tagsValue[hashTag[1]] = true;
            }


            var feed_id = firebase.database().ref().push().key;

            var feedObj = {
                active: true,
                city_id: locDetails.cityId,
                city_name: locDetails.cityName,
                created_time: firebase.database.ServerValue.TIMESTAMP,
                feed_id: feed_id,
                blog_id: feed_id,
                introduction: feed.description,
                user: {
                    user_id: uid,
                    user_name: name,
                    user_email: email
                }
            }

            if (feed.link) {
                feedObj.link = feed.link;
            }

            if (Object.keys(tagsValue).length > 0) {
                feedObj.tags = tagsValue;
            }
            var updates = {};

            updates['/users/data/' + uid + '/blogs/' + feed_id] = true;
            updates['/cityFeeds/' + locDetails.cityId + "/" + feed_id] = true;

            $ionicLoading.show();
            // Upload to server
            $http({
                method: 'POST',
                url: 'http://139.162.27.64/api/image-upload-base64',
                data: {
                    imgType: 'feeds',
                    path: feed_id,
                    img: resizedBased64Image
                }
            }).then(function successCallback(response) {
                $ionicLoading.hide();
                $timeout(function() {
                    // Upload data to firbase
                    feedObj.photoUrl = response.data.imageName;
                    updates['feeds/' + feed_id] = feedObj;

                    firebase.database().ref().update(updates).then(function(response) {
                        $ionicLoading.show();
                        $scope.closeFeedModal();
                        $location.path("/feed");
                    });
                });
            }, function errorCallback(error) {
                $ionicLoading.hide();
                alert(error.data.message + "\nPlease contact fab2u and try again later.");
            });

        };
    }, false);
});

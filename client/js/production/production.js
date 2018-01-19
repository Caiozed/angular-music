var app = angular.module("angularMusic", ["ngRoute", "ngCookies", 'ngFileUpload']);
app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl: "../templates/start.html",
        resolve:{
            init:function($cookies){
                    if($cookies.get("user_id")){
                        redirectTo("#!menu");
                    }
                }
        }
    })
    
    .when("/signup", {
        templateUrl: "../templates/signup.html"
    })
    
    .when("/login", {
        templateUrl: "../templates/login.html"
    })
    
    .when("/menu", {
        templateUrl: "../templates/menu.html"
    });
});

// Signup controller
app.controller("signupCtrl", function($scope, $rootScope, $cookies, $http){

    $scope.submitUser = function(username, password, password_confirmation){
        request($http, "POST", "/new/user", {username: username, password: password},
            function success(response){
                console.log(response);
                redirectTo("#!login");
            },
            
            function error(response){
                console.log(response);
            });
    };
    
    $scope.confirmUserData = function(username, password, password_confirmation){
        if(username &&
        password && 
        password == password_confirmation){
            $scope.submitUser(username, password, password_confirmation);
        }else{
            $scope.messages = ["Passwords must match!", "Username must have at least 3 characters"];
        }
    };
});

// Login controller
app.controller("loginCtrl", function($scope, $rootScope, $cookies, $http){
    
    $scope.login = function (username, password, remember_me){
       request($http, "POST", "/login", {username: username, password: password},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["Wrong username or password"];
                }else{
                    if(remember_me){
                        $cookies.put('user_id', response.data[0].id);
                    }
                    $scope.isLoggedIn = true;
                    $rootScope.current_user = response.data[0];
                    redirectTo("#!menu"); 
                }
            },
            
            function error(response){
                console.log(response);
            });
    };
});

// Menu controller
app.controller("mainMenuCtrl", function($scope, $rootScope, $cookies, $http, Upload){
    
    $scope.getAlbums = function(){
         request($http, "GET", "/albums", {},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["No albums"];
                }else{
                    $scope.albums = response.data; 
                    console.log(response.data);
                }
            },
            
            function error(response){
                console.log(response);
            });   
    };
    
    $scope.addAlbum = function(name, image){
        Upload.upload({
            url: '/new/album',
            data: {name: name, image: image, artist_id: $rootScope.current_user.id}
        }).then(function (resp) {
            console.log('Success ' + resp);
        });
    };
    
    $scope.getAlbums();
});

 function request($http, method, url, data, success, error){
         $http({
            method: method,
            url: url,
            data: data
            }).then(function(response){success(response)},
            function(response){error(response)}); 
    }

function redirectTo(path){
    window.location = path;
}
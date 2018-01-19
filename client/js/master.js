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
app.controller("loginCtrl", function($scope, $rootScope, $http, $window){
    
    $scope.login = function (username, password, remember_me){
       request($http, "POST", "/login", {username: username, password: password},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["Wrong username or password"];
                }else{
                    var user_info = {id: response.data[0].id, username: response.data[0].username};
                    
                    if(remember_me){
                        $window.localStorage.setItem('user_info', JSON.stringify(user_info));
                    }
                    $scope.isLoggedIn = true;
                    $window.sessionStorage.setItem('user_info', JSON.stringify(user_info));
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
    $scope.current_user = current_user();
    
    $scope.getAlbums = function(){
         request($http, "GET", "/albums", {},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["No albums"];
                }else{
                    if(!Array.isArray(response.data)){
                        $scope.albums = [response.data]; 
                    }else{
                        $scope.albums = response.data;  
                    }
                    console.log($scope.albums);
                }
            },
            
            function error(response){
                console.log(response);
            });   
    };
    
    $scope.addAlbum = function(name, image){
        Upload.upload({
            url: '/new/album',
            data: {name: name, image: image, artist_id: $scope.current_user.id}
        }).then(function (resp) {
            $scope.getAlbums();
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

function current_user(){
    return  JSON.parse(window.sessionStorage.getItem("user_info"));
}

function isLoggedIn(){
    if(current_user()){
        return true;
    }else{
        return false;
    }
}
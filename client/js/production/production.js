var app = angular.module("angularMusic", ["ngRoute", "ngCookies"]);
app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl: "../templates/start.html"
    })
    
    .when("/signup", {
        templateUrl: "../templates/signup.html"
    })
    
    .when("/login", {
        templateUrl: "../templates/login.html"
    });
});

app.controller("signupCtrl", function($scope, $rootScope, $cookies, $http){
    $scope.isLoggedIn = true;
    
    $scope.submitUser = function(username, password, password_confirmation){
        request("POST", "/new/user", {username: username, password: password},
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
    
    $scope.login = function (username, password, remember_me){
       request("POST", "/login", {username: username, password: password},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["Wrong username or password"];
                }else{
                    if(remember_me){
                        $cookies.put('user_id', response.data[0].id);
                    }
                    $rootScope.current_user = response.data[0];
                    redirectTo("#!menu"); 
                }
            },
            
            function error(response){
                console.log(response);
            });
    };
    
    function request(method, url, data, success, error){
         $http({
            method: method,
            url: url,
            data: data
            }).then(function(response){success(response)},
            function(response){error(response)}); 
    }
});

function redirectTo(path){
    window.location = path;
}
var app = angular.module("angularMusic", ["ngRoute"]);
app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl: "../templates/start.html"
    })
    
    .when("/signup", {
        templateUrl: "../templates/signup.html"
    });
});

app.controller("signupCtrl", function($scope, $http){
    $scope.isLoggedIn = true;
    
    $scope.submitUser = function(username, password, password_confirmation){
        $http({
            method: "POST",
            url: "/new/user",
            data: {username: username, password: password}
            }).then(function Success(response){
                console.log(response);
                window.location = "#!login";
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
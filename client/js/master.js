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

app.controller("myCtrl", function($scope){
    $scope.isLoggedIn = true;     
});
var interval;

var app = angular.module("angularMusic", ["ngRoute", "ngCookies", 'ngFileUpload']);
app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl: "../templates/start.html",
        resolve:{init:function(){loginRedirect()}}
    })
    
    .when("/signup", {
        templateUrl: "../templates/signup.html"
    })
    
    .when("/login", {
        templateUrl: "../templates/login.html"
    })
    
    .when("/menu", {
        templateUrl: "../templates/menu.html",
        resolve:{init:function($rootScope){
            logoutRedirect();
            $rootScope.current_user = current_user();
        }}
    })
    
    .when("/albums/:id", {
        templateUrl: "../templates/album.html",
        resolve:{init:function($rootScope){
            logoutRedirect();
            $rootScope.current_user = current_user();
        }}
    });
});

app.run(function($rootScope) {
    $rootScope.previous_albums = JSON.parse(window.localStorage.getItem("previous_albums"));
    var audio = document.getElementById('audio');
    var progress = document.getElementById('progress');
    var currentTime = document.getElementById('current-time');
    var album_name = document.getElementById('album-name');
    var song_name = document.getElementById('song-name');
    var volume = document.getElementById('volume');
    var playerImage = document.getElementById('playerbar-image');
    var fillVoluemArea = document.getElementsByClassName('fill-bar')[0];
    
    volume.oninput = function() {
        fillVoluemArea.style.width = this.value+"%";
        audio.volume = this.value/100;
    };
    
    audio.oncanplay = function(){
        audio.play();
    };
    
    audio.onended = function(){
        $rootScope.nextSong($rootScope.current_song, $rootScope.album);
    };
        
    $rootScope.paused = true;
    $rootScope.logOut = function() {
        window.localStorage.clear();
        window.sessionStorage.clear();
        redirectTo("#!");
    };
    
    $rootScope.isLoggedIn = function(){
        return isLoggedIn();
    }; 
    
    $rootScope.currentUser = function(){
        return current_user();
    }; 
    
    $rootScope.playSong = function(song, album){
        audio.setAttribute("src", song.song);
        playerImage.setAttribute("src", album.image);
        song_name.textContent = song.name;
        album_name.textContent = album.name;
        $rootScope.setPreviousAlbums(album);
        audio.load();
        $rootScope.current_song = song;
        $rootScope.current_album = album;
        $rootScope.paused = false;
        toggleTimer(audio, progress, $rootScope, currentTime);
    }; 
    
     $rootScope.playToggle = function(){
        var audio = document.getElementById('audio');
        var progress = document.getElementById('progress');
        var currentTime = document.getElementById('current-time');
        if(audio.paused){
            audio.play();
            toggleTimer(audio, progress, $rootScope, currentTime);
            $rootScope.paused = false;
        }else{
            audio.pause();
            toggleTimer(audio, progress, $rootScope, currentTime);
            $rootScope.paused = true;
        }
    };
    
    $rootScope.nextSong = function(song, album){
        $rootScope.paused = false;
        var songs = $rootScope.current_songs;
        var nextSongIndex = songs.indexOf(song)+1;
        if(nextSongIndex > songs.length-1){
            nextSongIndex = 0;
        }
        $rootScope.playSong(songs[nextSongIndex], album);
    };
    
     $rootScope.previousSong = function(song, album){
        $rootScope.paused = false;
        var songs = $rootScope.current_songs;
        var nextSongIndex = songs.indexOf(song)-1;
        if(nextSongIndex < 0){
            nextSongIndex = songs.length-1;
        }
        $rootScope.playSong(songs[nextSongIndex], album);
    };
    
    $rootScope.setPreviousAlbums = function(album){
        var previous_albums = JSON.parse(window.localStorage.getItem("previous_albums"));
        var readyToAdd = true;
        if(previous_albums == null){
            previous_albums = JSON.stringify([album]);
        }else{
            angular.forEach(previous_albums, function(prev, index){
                if(prev.id == album.id){
                    readyToAdd = false;
                }
            });
            if(readyToAdd){
                if(previous_albums.length > 5){
                    previous_albums.pop(); 
                    previous_albums.unshift(album);
                }else{
                    previous_albums.unshift(album);
                }
            }
        }
        window.localStorage.setItem("previous_albums", JSON.stringify(previous_albums));
        $rootScope.previous_albums = previous_albums;
    };
    
    $rootScope.setPreviousAlbums = function(album){
        var previous_albums = JSON.parse(window.localStorage.getItem("previous_albums"));
        var readyToAdd = true;
        if(!Array.isArray(previous_albums)){
            previous_albums = JSON.parse(previous_albums);
        }
        if(previous_albums == null){
            previous_albums = JSON.stringify([album]);
        }else{
            angular.forEach(previous_albums, function(prev, index){
                if(prev.id == album.id){
                    readyToAdd = false;
                }
            });
            if(readyToAdd){
                if(previous_albums.length > 5){
                    previous_albums.pop(); 
                    previous_albums.unshift(album);
                }else{
                    previous_albums.unshift(album);
                }
            }
        }
        window.localStorage.setItem("previous_albums", JSON.stringify(previous_albums));
        $rootScope.previous_albums = previous_albums;
    };
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
            $scope.getAlbums();
            console.log('Success' + resp);
        });
    };
    
    $scope.getAlbums();
});

// Album controller
app.controller("albumCtrl", function($scope, $rootScope, $cookies, $http, $routeParams, Upload){
    $scope.current_user = current_user();
    $scope.getAlbum = function(){
         request($http, "GET", "/albums/"+$routeParams.id, {},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["No albums"];
                }else{
                    $scope.album = response.data[0]; 
                }
            },
            
            function error(response){
                console.log(response);
            });   
    };
    
    $scope.getSongs = function(){
         request($http, "GET", "/albums/"+$routeParams.id+"/songs", {},
            function success(response){
                if(response.data.length == 0){
                    $scope.messages = ["No albums"];
                }else{
                    if(!Array.isArray(response.data)){
                        $rootScope.current_songs = $scope.songs = [response.data]; 
                        $scope.setCurrentSong(response.data);
                    }else{
                        $rootScope.current_songs = $scope.songs = response.data;  
                        $scope.setCurrentSong(response.data[0]);
                    }  
                }
            },
            
            function error(response){
                console.log(response);
            });   
    };
    
     $scope.addSong = function(name, song){
        Upload.upload({
            url: '/new/song',
            data: {name: name, song: song, album_id: $routeParams.id}
        }).then(function (resp) {
            $scope.getSongs();
            console.log('Success' + resp);
        });
    };
    
    $scope.setCurrentSong = function(data){
        if($rootScope.current_song == undefined){
            $rootScope.current_song = data;
        } 
    };
    
    $scope.getAlbum();
    $scope.getSongs();
});

// Global functions

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

function loginRedirect(){
    if(isLoggedIn()){
        redirectTo("#!menu");
    }
}

function logoutRedirect(){
    if(!isLoggedIn()){
        redirectTo("#!");
    }
}

function toggleTimer(audio, progressbar, $rootScope, currentTime){
    var totalTime = document.getElementById('total-time');
    if($rootScope.paused){
        clearInterval(interval);
    }else{
     interval = setInterval(function(){
            totalTime.textContent = formatTime(audio.duration);
            currentTime.textContent = formatTime(audio.currentTime);
            var width = audio.currentTime/audio.duration * 100; 
            progressbar.style.width = width+"%";
            },100);
    }
}

function formatTime(seconds) {
    var minutes;
    minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
}



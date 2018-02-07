// Global interval varibale
var interval;

// Set routes for app 
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
    
    .when("/edit/songs/:id", {
        templateUrl: "../templates/edit-song.html"
    })
    
    .when("/edit/albums/:id", {
        templateUrl: "../templates/edit-album.html"
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
    })
    .when("/search", {
        templateUrl: "../templates/search.html",
        resolve:{init:function($rootScope){
            logoutRedirect();
            $rootScope.current_user = current_user();
        }}
    });
});

// Initilization of variables used on app start
app.run(function($rootScope, $http) {
    $rootScope.previous_albums = JSON.parse(window.localStorage.getItem("previous_albums"));
    var audio = document.getElementById('audio');
    var progress = document.getElementById('progress');
    var currentTime = document.getElementById('current-time');
    var album_name = document.getElementById('album-name');
    var song_name = document.getElementById('song-name');
    var volume = document.getElementById('volume');
    var playerImage = document.getElementById('playerbar-image');
    var fillVoluemArea = document.getElementsByClassName('fill-bar')[0];
    
    // Event listener for volume range slider
    volume.oninput = function() {
        fillVoluemArea.style.width = this.value+"%";
        audio.volume = this.value/100;
    };
    
    // Event listener on audio tag to play audio when ready
    audio.oncanplay = function(){
        audio.play();
    };
    
     // Event listener to skip song on audio tag
    audio.onended = function(){
        $rootScope.nextSong($rootScope.current_song, $rootScope.album);
    };
    
    // Variable used to check current playe state    
    $rootScope.paused = true;
    
    // Remove session and cookies from browser and redirects to root
    $rootScope.logOut = function() {
        window.localStorage.clear();
        window.sessionStorage.clear();
        redirectTo("#!");
    };
    
    // Checks if user is logged in
    $rootScope.isLoggedIn = function(){
        return isLoggedIn();
    }; 
    
    // Returns the current user object with id and username
    $rootScope.currentUser = function(){
        return current_user();
    }; 
    
    // Play song based on parameters an update album info on page
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
        // Start song timer bar
        toggleTimer(audio, progress, $rootScope, currentTime);
    }; 
    
    // Toggle between pause an play updating elements on page 
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
    
    // Skips to next song on songs array
    $rootScope.nextSong = function(song, album){
        $rootScope.paused = false;
        var songs = $rootScope.current_songs;
        var nextSongIndex = songs.indexOf(song)+1;
        if(nextSongIndex > songs.length-1){
            nextSongIndex = 0;
        }
        $rootScope.playSong(songs[nextSongIndex], album);
    };
    
    // rewind to previous song on songs array
    $rootScope.previousSong = function(song, album){
        $rootScope.paused = false;
        var songs = $rootScope.current_songs;
        var nextSongIndex = songs.indexOf(song)-1;
        if(nextSongIndex < 0){
            nextSongIndex = songs.length-1;
        }
        $rootScope.playSong(songs[nextSongIndex], album);
    };
    
    // Set a cookie object with data of latest albums played
    $rootScope.setPreviousAlbums = function(album){
        var previous_albums = JSON.parse(window.localStorage.getItem("previous_albums"));
        var readyToAdd = true;
        // if object returned is not a array then sets object
        if(!Array.isArray(previous_albums)){
            previous_albums = JSON.parse(previous_albums);
        }
        // if object returned is null creates new object
        if(previous_albums == null){
            previous_albums = JSON.stringify([album]);
        }else{
            angular.forEach(previous_albums, function(prev, index){
                // Add only new albums not previosly played
                if(prev.id == album.id){
                    readyToAdd = false;
                }
            });
            if(readyToAdd){
                // Add a maximum o 5 albums history
                if(previous_albums.length > 5){
                    previous_albums.pop(); 
                    previous_albums.unshift(album);
                }else{
                    previous_albums.unshift(album);
                }
            }
        }
        // Sets cookie object on localStorage
        window.localStorage.setItem("previous_albums", JSON.stringify(previous_albums));
        // Set variable to be show on template
        $rootScope.previous_albums = previous_albums;
    };
    
    // Search for album
    $rootScope.search_albums = function(search){
        // reset variable on new search
        $rootScope.searched_albums = null;
        // Request to database with search parameters
        request($http, "POST", "/search", {search: search},
        function(response){
            if(response.data.length > 0){
               $rootScope.searched_albums = formatResponse(response);
               redirectTo("#!search");
            }
        });    
    };
    
    $rootScope.deleteAlbum = function(id){
         request($http, "POST", "/delete/albums/"+id, {},
            function success(response){
                if(response.data.length == 0){
                    $rootScope.messages = ["No albums"];
                }else{
                    redirectTo("!#menu");
                }
            },
            
            function error(response){
                console.log(response);
            });   
    };
});

app.controller("searchCtrl", function($scope, $rootScope, $cookies, $http){

});

// Signup controller
app.controller("signupCtrl", function($scope, $rootScope, $cookies, $http){

    $scope.submitUser = function(username, password, password_confirmation){
        request($http, "POST", "/new/user", {username: username, password: password},
            function success(response){
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
    
    $scope.deleteSong = function(id){
         request($http, "POST", "/delete/songs/"+id, {},
            function success(response){
                 $scope.songs = null;
                 $scope.getSongs();
            },
            
            function error(response){
                console.log(response);
            });   
    };
    
    $scope.getAlbum();
    $scope.getSongs();
});

// Controlle of the edit album view
app.controller("editAlbumCtrl", function($scope, $routeParams, $http){
    $scope.updateAlbum = function(name){
         request($http, "POST", "/edit/albums/"+$routeParams.id, {name: name},
            function success(response){
                redirectTo("#!menu");
            },
            
            function error(response){
                console.log(response);
            });   
    }
});

// Controlle of the edit song view
app.controller("editSongCtrl", function($scope, $routeParams, $http){
    $scope.updateSong = function(name){
         request($http, "POST", "/edit/songs/"+$routeParams.id, {name: name},
            function success(response){
                redirectTo("#!menu");
            },
            
            function error(response){
                console.log(response);
            });   
    }
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

function formatResponse(response){
    var saveVariable;
    if(!Array.isArray(response.data)){
        saveVariable = [response.data]; 
    }else{
        saveVariable = response.data;  
    }
    return saveVariable;
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



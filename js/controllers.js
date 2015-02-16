function homeController( $scope, $http, $timeout ) {
    $scope.version = '1.8'
    $scope.title = 'Secret Chat ' + $scope.version
    $scope.last_time = 0
    $scope.last_last_time = 0
    $scope.timeout = 3000
    $scope.message_id = 0
    $scope.session_id = Math.floor(Math.random()*10000000)
    $scope.help = 'Ready.'
    
    $scope.messages = []
    
    $scope.what = {}
    
    $scope.onTimeout = function() {
        $scope.update()
        $scope.timerId = $timeout($scope.onTimeout, $scope.timeout)
    }
    
    $scope.setKey = function() {
        if($scope.edit_key.length < 15) {
            alert('The key must have at least 15 characters.')    
            return
        }
        $scope.keySet = true
        $scope.reset()
        $scope.key = $scope.edit_key
        $scope.help = 'Generating HASH..'
        alert('Generating the HASH. It may take a while')
        $scope.hash = CryptoJS.SHA3($scope.key).toString(CryptoJS.enc.Hex);
        for(var i=0; i<2000; i++) {
            $scope.hash = CryptoJS.SHA3($scope.hash).toString(CryptoJS.enc.Hex);
        }
        $scope.help = 'HASH generated.'
        $scope.onTimeout()
    }
    
    $scope.reset = function() {
        $scope.messages = []
        $scope.last_time = 0
        $scope.last_last_time = 0
        $scope.message_id = 0
        $scope.session_id = Math.floor(Math.random()*10000000)
        
        if($scope.timerId != undefined) {
            $timeout.cancel($scope.timerId)
        }
    }
    
    $scope.erase = function() {
        $scope.httphit = 'app.php?k='+$scope.hash+'&t='+$scope.last_last_time+'&e=1';
        $http.get($scope.httphit).success(function(r) {
            $scope.reset();
            $scope.onTimeout();
            $scope.help = 'All the data of this conversation has been deleted.'
        });
    }
    
    $scope.update = function() {
        $scope.help = 'Retrieving messages..'
        $scope.httphit = 'app.php?k='+$scope.hash+'&t='+$scope.last_last_time;
        $http.get($scope.httphit).success(function(r) {
            if($scope.last_time != r.now) {
                $scope.last_last_time = $scope.last_time
                $scope.last_time = r.now
                $scope.updateMessages(r.messages)
                $scope.help = 'Conversation loaded.'
            }
        });
    }
    
    $scope.send = function() {
        $scope.help = 'Sending message..'
        $scope.what.id = $scope.message_id++;
        $scope.what.session_id = $scope.session_id;
        $scope.what.time = new Date().getTime() / 1000
        $scope.what.nick = $scope.nickname
        
        mex = JSON.stringify($scope.what)
        crypt = CryptoJS.AES.encrypt(mex,$scope.key, { format: JsonFormatter })
        encoded = encodeURIComponent(crypt)
        $scope.httphit = 'app.php?k='+$scope.hash+'&t='+$scope.last_last_time+'&d='+encoded;
        $http.get($scope.httphit).success(function(r) {
            $scope.what = {}
            $scope.last_last_time = $scope.last_time
            $scope.last_time = r.now
            $scope.updateMessages(r.messages)
            $scope.help = 'Message sent.'
        });
    }
    
    $scope.padTime = function(number) {
        if(number < 10) return '0' + number;
        return number;
    }
    
    $scope.orderMessages = function() {
        $scope.messages.sort(function(a,b) { if(a.time > b.time) { return 1; } else if(a.time == b.time) return 0; else return -1; })
    }
    
    $scope.formatTime = function(timestamp) {
        var date = new Date(timestamp*1000);
        
        
        var day = date.getDate()
        var month = date.getMonth() + 1
        var year = date.getFullYear()
        
        
        // hours part from the timestamp
        var hours = date.getHours();
        // minutes part from the timestamp
        var minutes = date.getMinutes();
        // seconds part from the timestamp
        var seconds = date.getSeconds();

        // will display time in 10:30:23 format
        var formattedTime = $scope.padTime(day) + '/' + $scope.padTime(month) + '/' + year + ' ' + $scope.padTime(hours) + ':' + $scope.padTime(minutes) + ':' + $scope.padTime(seconds);
        
        return formattedTime;
    }
    
    $scope.checkMessage = function(mex) {
        for(var i=0; i<$scope.messages.length; i++) {
            if(mex.id == $scope.messages[i].id && mex.session_id == $scope.messages[i].session_id) {
                return true;
            }
        }
        return false;
    }
    
    $scope.updateMessages = function(someMessages) {
        for(var i=0; i<someMessages.length; i++) {
            jsoned = decodeURIComponent(someMessages[i].d)
            decrypt = CryptoJS.AES.decrypt(jsoned,$scope.key, { format: JsonFormatter })
            mex = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8))
            mex.formatted_time = $scope.formatTime(mex.time)
            if(!$scope.checkMessage(mex)) {
                $scope.messages.push(mex)
            }
        }
        $scope.orderMessages();
    }
}

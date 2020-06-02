(function() {


    angular.module('mitmApp', [])

    .controller('mitmController', ['$scope', '$http', 'filterFilter', function ($scope, $http, filterFilter) {

        $scope.map = null;
        $scope.markersGroup = [];
        $scope.midptMarkersGroup = [];
        $scope.midptCirclesGroup = [];
        $scope.resultsGroup = [];
        $scope.midptMarkerCoords = null;
        $scope.midptCircle = null;
        var mapBounds = null;
        var infoWindow = null;

        
        $scope.submitButtonText = "Submit";
        $scope.submitButtonTextAddName = "Submit";
        $scope.addingEvent = false;
        $scope.inputError = false;
    

        $scope.inputCategories = [
            { name: 'Restaurant', selected: false, value: 'restaurant' },
            { name: 'Bar', selected: true, value: 'bar' },
            { name: 'Library', selected: false, value: 'library' },
            { name: 'Park', selected: true, value: 'park' },
            { name: 'Keyword', selected: false, value: ''}
        ];

        $scope.areaPrecision = [
            { set: 'Exact', r: 100 },
            { set: 'Tight', r: 250 },
            { set: 'Given', r: 500 },
            { set: 'Loose', r: 800 },
            { set: 'Wide', r: 1500 }
        ];

        $scope.areaPrecisionSet = $scope.areaPrecision[2];


        initMap();    


        function initMap() {
            getLocation(ipGeoKey, function cb(response) {

                console.log($scope.markersGroup,
                $scope.midptMarkersGroup,
                $scope.midptCirclesGroup,
                $scope.resultsGroup);
                if (response.status != 200) {
                    console.log('Could not load Map')
                    console.log(response.status + ': ' + 
                                response.statusText + ' - ' +
                                response.data.message)
                }
                else {
                    var myCoords = {
                        lat: parseFloat(response.data.latitude), 
                        lng: parseFloat(response.data.longitude)};
                    
                    $scope.map = new google.maps.Map(document.getElementById('mapContainer'), {
                        center: myCoords,
                        zoom: 13,
                        disableDoubleClickZoom: true
                    });
                    console.log(myCoords)
                    // Create a div to hold the control panel
                    var controlDiv = document.createElement('div');
                    var centerControl = new MidptGroupControl(controlDiv, $scope.map, myCoords);
                
                    controlDiv.index = 1;
                    controlDiv.style['paddingLeft'] = '10px';
                    $scope.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlDiv);

                    //MidptGroupControl(controlDiv, $scope.map, myCoords)

                    mapBounds = new google.maps.LatLngBounds();
                    infoWindow = new google.maps.InfoWindow();
                    initMapObjects(myCoords);
                } // from else
                
            }) //from getLocation
                
        } //from initMap




        $scope.initRemoteAddListener = function() {
            $scope.submitButtonTextAddName = "Loading...";
            $scope.addingEvent = true;

            var addName = $scope.addName;

            $http({method: 'GET', url: "/gmaps/addMe/" + addName})
            .success(function(result) {
                console.log("success! Hey ", addName, result)
                var remoteMarker = createMarker(result.coords, result.name)
                $scope.markersGroup.push(remoteMarker);
                findMiddle();
            })
            .error(function(result) {
                console.log('error: ', result)
            });

            $scope.submitButtonTextAddName = "Submit"
            $scope.addingEvent = false;
        }
    



        function getLocation(ipGeoKey, callback) {
            $http({
                method: 'GET',
                url: 'https://api.ipgeolocation.io/ipgeo?apiKey=' + ipGeoKey
                }).then(function successCallback(response) {
                    return callback(response)
                }, function errorCallback(response) {
                    console.log(response);
                    return callback(response)
                }) // then
            
        } // getLocation
        
        

        function resetObjectGroups() {
            $scope.markersGroup = [];
            $scope.midptMarkersGroup = [];
            $scope.midptCirclesGroup = [];
            $scope.resultsGroup = [];
        } // resetObjects
            
            
        
        function initMapObjects (initCoords) {
            
            resetObjectGroups(); 

            var initMarker = createMarker(initCoords, 'Your Location')
            $scope.markersGroup.push(initMarker)

            setupMapListener($scope.map);

        } // initMapObjects


        $scope.changePrecision = function() {
            if ($scope.midptCirclesGroup.length) {
                getMidptCircle();
            }
        };

        $scope.$watch('inputCategories|filter:{selected:true}', function (newV) {
            $scope.catSelect = [];
            $scope.categorySelection = newV.map(function (inputCategories) {
                $scope.catSelect.push(inputCategories.value)
            })
            if ($scope.midptCirclesGroup.length) {
                getPlaces(midptCircle);
            }
        }, true);



        $scope.addLocationForm = function () {
            var name = $scope.locName;
            var strCoords = $scope.locLatLng.split(',');

            coords = {
                lat: parseFloat(strCoords[0]),
                lng: parseFloat(strCoords[1])
            }

            $scope.submitButtonText = "Adding..."
            $scope.addingEvent = true;
            var newLocation = createMarker(coords, name);
            $scope.markersGroup.push(newLocation);
            findMiddle();
            $scope.addingEvent = false;
            $scope.submitButtonText = 'Submit';
        }



        function createMarker(markerCoords, name, icon=null, data=null) {
            var markerOptions = null;
            
            var marker = new google.maps.Marker({
                map: $scope.map,
                position: markerCoords,
                title: name,
                icon: icon,
                data: data
            });
            marker.content = '<div class="infoWindowContent>' + name + '</div>'

            setupMarkerListener(marker);

            return marker;
        }; /// createMarker

  
         
        $scope.openInfoWindow = function(e, selectedMarker){
          e.preventDefault();
          google.maps.event.trigger(selectedMarker, 'click');
        }


        // end of initialization


        // -------------------------
        // begin App execution
        // -------------------------

        function setupMapListener(map) {
            var dblTap = false;
            var tapEvent;
            var friendNum = 1;
            

            map.addListener('dblclick', function(e) {
                dblTap = true;
                var newMarker = createMarker(e.latLng, "new friend #" + friendNum);
                friendNum++;
                $scope.markersGroup.push(newMarker);
                findMiddle();
            });

            function handleTapEvent(e) {
                if (!dblTap) {
                    console.log('just a single click on: ', e)
                }
            };

            map.addListener('click', function(e) {
                tapEvent = e;
                dblTap = false;
                window.setTimeout(handleTapEvent, 400, e);
            });



        } // setupMapListener

        function setupMarkerListener(marker) {
            var mousedUp = true;
            
            google.maps.event.addListener(marker, 'click', function(){
                infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content );
                infoWindow.open($scope.map, marker);
            });

            google.maps.event.addListener(marker, 'mousedown', function(e){ 
                console.log('in mousedown', e, marker)
                mousedUp = false;
                setTimeout(function(){
                    if(mousedUp === false){
                        meetHere(marker, e.latLng);        
                    }
                }, 500);
            });
            google.maps.event.addListener(marker, 'mouseup', function(e){ 
                mousedUp = true;
            });
            
        } // setupMarkerListener



        function setupCircleListener(circle) {
            
            google.maps.event.addListener(circle, 'dragend', function(e){ 
                console.log('in circle listener', e)
                getPlaces();
            });
            
        } // setupCircleListener


        function meetHere(coords) {
            console.log('Lets meet here!!', coords);
        } // meetHere



        function findMiddle() {
    
            var x = []
            var y = []
            for (var i=0; i < $scope.markersGroup.length; i++) {
                x.push($scope.markersGroup[i].position.lng());
                y.push($scope.markersGroup[i].position.lat());

                mapBounds.extend($scope.markersGroup[i].position);
            }

            var midpt_x = x.reduce((a,b) => a+b, 0) / x.length;
            var midpt_y = y.reduce((a,b) => a+b, 0) / y.length;

            midptMarkerCoords = {
                lat: midpt_y,
                lng: midpt_x
            }
            
            if ($scope.midptMarkersGroup.length) {
                $scope.midptMarkersGroup.forEach((obj) => obj.setMap(null));
            }

            var midptMarker = new google.maps.Marker({
                    map: $scope.map,
                    position: midptMarkerCoords,
                    title: 'MitM Point',
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green.png',
                });

            $scope.midptMarkersGroup.push(midptMarker);

            $scope.map.fitBounds(mapBounds);

            getMidptCircle();
    
        }; // findMiddle



        function getMidptCircle() {

            if ($scope.midptCirclesGroup.length) {
                $scope.midptCirclesGroup.forEach((obj) => obj.setMap(null));
            }

            midptCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: $scope.map,
                center: midptMarkerCoords,
                radius: $scope.areaPrecisionSet.r,
                draggable: true
            })
            $scope.midptCirclesGroup.push(midptCircle);
            setupCircleListener(midptCircle);
            getPlaces();

        } // getMidptCircle



        function getPlaces() {
            var resultsService = new google.maps.places.PlacesService($scope.map);
            
            if ($scope.resultsGroup.length) {
                $scope.resultsGroup.forEach((obj) => obj.setMap(null));
            }
            
            //var typeInput = $scope.catSelect.join("|")
            console.log($scope.catSelect);
            var searchParams = {
                location: midptCircle.center,
                radius: midptCircle.radius,
                limit: 10,
                type: $scope.catSelect
            }

            resultsService.nearbySearch(searchParams, nearbyResultsCallback);
        }; // getPlaces



        function nearbyResultsCallback(results, status, nextPage) {
    
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(nextPage)
                console.log(results);
                for (var i = 0; i < results.length; i++) {
                    var resMarker = createMarker(results[i].geometry.location, results[i].name, results[i].icon, results[i])
                    $scope.resultsGroup.push(resMarker);
              };
            };
        }; // nearbyResultsCallback
          




        function MidptGroupControl(controlDiv, map, initCenter) {

            var control = this;
    
            control.center_ = initCenter;
            controlDiv.style.clear = 'both';
    
            var goCenterUI = document.createElement('div');
            goCenterUI.id = 'goCenterUI';
            goCenterUI.title = 'Recenter on Midpt'
            controlDiv.appendChild(goCenterUI);
    
            var goCenterText = document.createElement('div');
            goCenterText.id = 'goCenterText';
            goCenterText.innerHTML = 'Go to Midpt';
            goCenterUI.appendChild(goCenterText);
    
    
            var setCenterUI = document.createElement('div');
            setCenterUI.id = 'setCenterUI';
            setCenterUI.title = 'Click to change the center of the map';
            controlDiv.appendChild(setCenterUI);
    
            var setCenterText = document.createElement('div');
            setCenterText.id = 'setCenterText';
            setCenterText.innerHTML = 'Set Center';
            setCenterUI.appendChild(setCenterText);
            
    
            var clearMapUI = document.createElement('div');
            clearMapUI.id = 'clearMapUI';
            clearMapUI.title = 'Clear map of all objects'
            controlDiv.appendChild(clearMapUI);
    
            var clearMapTxt = document.createElement('div');
            clearMapTxt.id = 'clearMapTxt';
            clearMapTxt.innerHTML = 'Clear Map';
            clearMapUI.appendChild(clearMapTxt);


            goCenterUI.addEventListener('click', function() {
                var currentCenter = control.getCenter();
                map.setCenter(currentCenter)
            });
    
            setCenterUI.addEventListener('click', function() {
                var newCenter = map.getCenter();
                control.setCenter(newCenter);
            });

            clearMapUI.addEventListener('click', function() {
                var groupList = [
                    $scope.markersGroup,
                    $scope.midptMarkersGroup,
                    $scope.midptCirclesGroup,
                    $scope.resultsGroup]
                groupList.forEach((group) => group.forEach((obj) => obj.setMap(null)));
                initMap();
            });
    
            MidptGroupControl.prototype.center_ = null;
            MidptGroupControl.prototype.getCenter = function() {
                return this.center_;
            };
            MidptGroupControl.prototype.setCenter = function(center) {
                this.center_ = center;
            };
    
        }; // MidptControlGroup
    

    }]); // controller
})(); // app
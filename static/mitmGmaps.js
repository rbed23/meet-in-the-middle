(function() {
    'use strict';


    angular.module('mitmApp', [])

    .controller('mitmController', ['$scope', 'filterFilter', function getMidptCtrl($scope, filterFilter) {

        $scope.map = new google.maps.Map(document.getElementById('mapContainer'), {
                center: coords,
                zoom: 13,
                disableDoubleClickZoom: true
            });

        var initMarker = new google.maps.Marker ({
            position: coords,
            map: $scope.map,
            title: 'You'
        });
        initMarker.content = '<div class="infoWindowContent>' + name + '</div>'
        google.maps.event.addListener(initMarker, 'click', function(){
            infoWindow.setContent('<h2>' + initMarker.title + '</h2>' + initMarker.content);
            infoWindow.open($scope.map, initMarker);
        });

        var initMarkerGroup = [initMarker];
        var markersGroup = initMarkerGroup;
        var midptMarkersGroup = [];
        var midptCirclesGroup = [];
        var resultsGroup = [];
        var midptMarkerCoords = null;
        var midptCircle = null;


        $scope.inputCategories = [
            { name: 'restaurant', selected: false },
            { name: 'bar', selected: true },
            { name: 'library', selected: false },
            { name: 'park', selected: true },
        ];

        $scope.areaPrecision = [
            { set: 'Exact', r: 100 },
            { set: 'Tight', r: 250 },
            { set: 'Given', r: 500 },
            { set: 'Loose', r: 800 },
            { set: 'Wide', r: 1500 }
        ];

        $scope.areaPrecisionSet = $scope.areaPrecision[2];

        $scope.changePrecision = function() {
            if (midptCirclesGroup.length) {
                getMidptCircle();
            }
        };

        $scope.$watch('inputCategories|filter:{selected:true}', function (nv) {
            $scope.catSelect = [];
            $scope.categorySelection = nv.map(function (inputCategories) {
                $scope.catSelect.push(inputCategories.name)
            })
            if (midptCirclesGroup.length) {
                getPlaces(midptCircle);
            }
        }, true);

        var infoWindow = new google.maps.InfoWindow();

        var createMarker = function(markerCoords, name) {
            var marker = new google.maps.Marker({
                map: $scope.map,
                position: markerCoords,
                title: name,
            });
            marker.content = '<div class="infoWindowContent>' + name + '</div>'

            google.maps.event.addListener(marker, 'click', function(){
                infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                infoWindow.open($scope.map, marker);
            });

            addMarker(marker);
        };

        var addMarker = function(marker) {
            markersGroup.push(marker);
        }
  
         
        $scope.openInfoWindow = function(e, selectedMarker){
          e.preventDefault();
          google.maps.event.trigger(selectedMarker, 'click');
        }


        // end of initialization


        // -------------------------
        // begin App execution
        // -------------------------

        function setupClickListener(map) {
            var dblTap = false;
            var tapEvent;
            var friendNum = 1;

            map.addListener('dblclick', function(e) {
                dblTap = true;
                createMarker(e.latLng, "new friend!\nLet's find the middle!");
                findMiddle(map, e);
            });

            function handleTapEvent(e) {
                if (!dblTap) {
                    createMarker(e.latLng, 'new friend #' + friendNum);
                    friendNum++;
                }
            };

            map.addListener('click', function(e) {
                tapEvent = e;
                dblTap = false;
                window.setTimeout(handleTapEvent, 400, e);
            });

        }



        function findMiddle(map, e) {
    
            var x = []
            var y = []
            for (var i=0; i < markersGroup.length; i++) {
                x.push(markersGroup[i].position.lng());
                y.push(markersGroup[i].position.lat());
            }

            var midpt_x = x.reduce((a,b) => a+b, 0) / x.length;
            var midpt_y = y.reduce((a,b) => a+b, 0) / y.length;

            midptMarkerCoords = {
                lat: midpt_y,
                lng: midpt_x
            }
            
            if (midptMarkersGroup.length) {
                midptMarkersGroup.forEach((obj) => obj.setMap(null));
            }

            var midptMarker = new google.maps.Marker({
                    map: $scope.map,
                    position: midptMarkerCoords,
                    title: 'MitM Point',
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green.png',
                });

            midptMarkersGroup.push(midptMarker);
            getMidptCircle();
    
        };

        function getMidptCircle() {

            if (midptCirclesGroup.length) {
                midptCirclesGroup.forEach((obj) => obj.setMap(null));
            }

            midptCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: $scope.map,
                center: midptMarkerCoords,
                radius: $scope.areaPrecisionSet.r
            })
            midptCirclesGroup.push(midptCircle);
            getPlaces();

        }

        function getPlaces() {
            var resultsService = new google.maps.places.PlacesService($scope.map);
            
            if (resultsGroup.length) {
                resultsGroup.forEach((obj) => obj.setMap(null));
            }
            
            var typeInput = $scope.catSelect.join("|")
            console.log(typeInput);
            var searchParams = {
                location: midptCircle.center,
                radius: midptCircle.radius,
                limit: 10,
                type: [typeInput]
            }

            resultsService.nearbySearch(searchParams, callback);
        };

        function callback(results, status, nextPage) {
    
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(nextPage)
                console.log(results);
                for (var i = 0; i < results.length; i++) {
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        position: results[i].geometry.location,
                        title: results[i].name,
                        icon: results[i].icon
                    });
                    resultsGroup.push(marker);
              };
            };
        };
          




        function MidptGroupControl(controlDiv, map, centerCoords) {

            var control = this;
    
            control.center_ = centerCoords;
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
                    markersGroup,
                    midptMarkersGroup,
                    midptCirclesGroup,
                    resultsGroup]
                groupList.forEach((group) => group.forEach((obj) => obj.setMap(null)));
            });
    
            MidptGroupControl.prototype.center_ = null;
            MidptGroupControl.prototype.getCenter = function() {
                return this.center_;
            };
            MidptGroupControl.prototype.setCenter = function(center) {
                this.center_ = center;
            };
    
        };
    
            
        // Create a div to hold the control panel
        var controlDiv = document.createElement('div');
        var centerControl = new MidptGroupControl(controlDiv, $scope.map, coords);
      
        controlDiv.index = 1;
        controlDiv.style['paddingLeft'] = '10px';
        $scope.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlDiv);
    

        setupClickListener($scope.map);



    }]);
})();
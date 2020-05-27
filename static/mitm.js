$(document).ready(function() {

    var platform = new H.service.Platform({
        'apikey': apiKey
    });

    // Obtain the default map types from the platform object
    var maptypes = platform.createDefaultLayers();

    // Initialize a map:
    var map = new H.Map(
        document.getElementById('mapContainer'),
        maptypes.vector.normal.map,
        {
        width: 1500,
        zoom: 13,
        center: { lat: coords.lat, lng: coords.lon }, 
        title: 'this is YOU'
        }
    );

    var base_marker = new H.map.Marker({ lat: coords.lat, lng: coords.lon });

    // Add the marker to the map:
    map.addObject(base_marker);


    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map);
    var behavior = new H.mapevents.Behavior(mapEvents);
    behavior.disable(H.mapevents.Behavior.Feature.DBL_TAP_ZOOM);

    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, maptypes);

    // Create group for midpoint objects on map
    var midPtGroup = new H.map.Group();

    // sets size of circle to return places of interest
    // 0-9 see 'convertRadius' function below
    const middleAreaPrecision = null;

    var svgMarkup = '<svg width="24" height="24" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<rect stroke="white" fill="#1b468d" x="1" y="1" width="22" ' +
    'height="22" /><text x="12" y="18" font-size="12pt" ' +
    'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
    'fill="white">H</text></svg>';




    function setupClickListener(map) {

        var doubleTap = false;
        var tapEvent;

        // Add event listener:
        map.addEventListener(['dbltap'], function(event) {
            doubleTap = true;
            findMiddle(map, event);
        });

        function handleTap(evt){
            if (!doubleTap) {
                addMarker(evt);
            }
        }
        
        map.addEventListener(['tap'], function(evt) {
            tapEvent = evt;
            doubleTap = false;
            window.setTimeout(handleTap, 400, evt);
        });

    };
    


    function addMarker(event) {
        var coords = map.screenToGeo(event.currentPointer.viewportX,
            event.currentPointer.viewportY);

        var marker = new H.map.Marker({
            lat: coords.lat,
            lng: coords.lng
        });

        console.log(event.type + ' at ' + Math.abs(coords.lat.toFixed(4)) +
        ((coords.lat > 0) ? 'N' : 'S') +
        ' ' + Math.abs(coords.lng.toFixed(4)) +
        ((coords.lng > 0) ? 'E' : 'W'));

        map.addObject(marker);
    };



    function findMiddle(map, event) {
        addMarker(event);

        objects = map.getObjects().filter(function(item) {
            return item.type === H.map.Object.Type.MARKER;
        });
        var x = []
        var y = []
        for (var i=0; i < objects.length; i++) {
            x.push(objects[i].b.lng);
            y.push(objects[i].b.lat);
        }
        var midpt_x = x.reduce((a,b) => a+b, 0) / x.length;
        var midpt_y = y.reduce((a,b) => a+b, 0) / y.length;

        console.log(x.length);

        var coords = {
            lat: midpt_y,
            lng: midpt_x
        }

        var midpt_icon = new H.map.Icon(svgMarkup),
            midpt_marker = new H.map.Marker(
                coords,
                {icon: midpt_icon});

        midPtGroup.removeAll();
        var circle = getCircle(coords);
        midPtGroup.addObject(midpt_marker);
        midPtGroup.addObject(circle);
        map.addObject(midPtGroup);

        getMiddleResults(circle);

    };



    function getMiddleResults(circle) {
        var resultsService = platform.getSearchService()
        console.log(circle);

        resultsService.browse({
            in: 'circle:' + circle.b.lat + ',' + circle.b.lng + ';r=' + circle.sa,
            at: circle.b.lat + ',' + circle.b.lng,
            limit: 10,
            categories: '100-1100'
        }, console.log, console.error);
    }



    function getCircle(coords){
        var circle = new H.map.Circle(
        // The central point of the circle
        coords,
        // The radius of the circle in meters
        convertRadius(middleAreaPrecision),
        {
            style: {
            strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
            lineWidth: 2,
            fillColor: 'rgba(0, 128, 0, 0.7)'  // Color of the circle
            }
        }
        );
        return circle;
    };



    function convertRadius(input) {
        switch(input) {
            case 0:
                return 50;
            case 1:
                return 100;
            case 2:
                return 200;
            case 3:
                return 350;
            case 4:
                return 500;
            case 5:
                return 750;
            case 6:
                return 1000;
            case 7:
                return 1500;
            case 8:
                return 2000;
            case 9:
                return 2500;
            default: 
                return 400;
        }
    };



    setupClickListener(map);

});

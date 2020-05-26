$(document).ready(function() {

    // Initialize the platform object:
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
    
    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, maptypes);

    // Add event listener:
    map.addEventListener(['tap'], function(evt) {

        // Log 'tap' and 'mouse' events:
        console.log(evt.type, evt.currentPointer.type);

        if (evt.type == 'tap') {
            var coord = map.screenToGeo(evt.currentPointer.viewportX,
                evt.currentPointer.viewportY);
            console.log('Clicked at ' + Math.abs(coord.lat.toFixed(4)) +
                ((coord.lat > 0) ? 'N' : 'S') +
                ' ' + Math.abs(coord.lng.toFixed(4)) +
                ((coord.lng > 0) ? 'E' : 'W'));
            var marker = new H.map.Marker({
                lat: coord.lat,
                lng: coord.lng
            })
            map.addObject(marker);
            findMiddle(map);
        };
    });

    var findMiddle = function(map) {
        objects = map.getObjects().filter(function(item) {
            return item.type === H.map.Object.Type.MARKER;
        });
        console.log(objects);
    };

 

});

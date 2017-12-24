/**
 * Created by anujsyal on 2/29/2016.
 */

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {lat: 18.6139, lng: 79.2090}
    });
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;

    /*Reverse  Geocode*/
    function getLocationFromLatLng(latLng, infoWindow, map) {
        var latlng = new google.maps.LatLng(latLng);
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    map.setZoom(11);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    infowindow.setContent(results[1].formatted_address);
                    infowindow.open(map, marker);
                    console.log(results[1].formatted_address);
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    function convertToCoordinates(degree, minutes, seconds, direction) {
        direction.toUpperCase();
        var dd = degree + minutes / 60 + seconds / (60 * 60);
        //alert(dd);
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        } // Don't do anything for N or E
        return dd;
    }
    /*File input */
    document.getElementById("file-input").onchange = function (e) {
        /*Retrive Geotags from image*/
        EXIF.getData(e.target.files[0], function () {
            var allTags = EXIF.getAllTags(this);
            if (allTags.GPSLatitude && allTags.GPSLongitude)
                var latLng = {
                    lat: convertToCoordinates(allTags.GPSLatitude[0], allTags.GPSLatitude[1], allTags.GPSLatitude[2], allTags.GPSLatitudeRef),  //(degree, minutes, seconds, direction)
                    lng: convertToCoordinates(allTags.GPSLongitude[0], allTags.GPSLongitude[1], allTags.GPSLongitude[2], allTags.GPSLongitudeRef)
                };
            getLocationFromLatLng(latLng,infowindow,map);
        });
    }

}

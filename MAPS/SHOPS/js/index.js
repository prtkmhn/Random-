var map;
var infowindow;
var output ;

function Init()
	{
	 output = document.getElementById("map-canvas");

  

  if (!navigator.geolocation){
	
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }

  function success(position) {
 
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;

    console.log( '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>');
	initialize(latitude,longitude);

	};

  function error() {
    output.innerHTML = "Unable to retrieve your location";
  };

  output.innerHTML = "<p>Locating your location..............</p>";
  


  navigator.geolocation.getCurrentPosition(success, error);
		
	}
	




	

function initialize(lat,vlong) {
	console.log("initialize(lat,vlong)............ ");
  var myLocation = new google.maps.LatLng(lat, vlong);

  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: myLocation,
    zoom: 15
  });

   var userMarker = new google.maps.Marker({
	map:map,
	position: myLocation,
	animation:google.maps.Animation.BOUNCE


});


  var request = {
    location: myLocation,
    radius: 4000,
    types: ['department_store']
	
  };
  
 var request1 = {
    location: myLocation,
    radius: 4000,
    types: ['store']
    
	
  };
 var request2 = {
    location: myLocation,
    radius: 4000,
    types: ['grocery_or_supermarket']
	
  };

var request3 = {
    location: myLocation,
    radius: 4000,
    types: ['shopping_mall']
	
  };


  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
  service.nearbySearch(request1, callback);
  service.nearbySearch(request2, callback);
  service.nearbySearch(request3, callback); 
 
}

function callback(results, status) {
console.log("status............ "+status);

/*google.maps.places.PlacesServiceStatus
{ OK: "OK", UNKNOWN_ERROR: "UNKNOWN_ERROR", OVER_QUERY_LIMIT: "OVER_QUERY_LIMIT", REQUEST_DENIED: "REQUEST_DENIED", INVALID_REQUEST: "INVALID_REQUEST", ZERO_RESULTS: "ZERO_RESULTS", NOT_FOUND: "NOT_FOUND" }
*/
  if (status != google.maps.places.PlacesServiceStatus.OK) {
		output.innerHTML = "<p>Sorry we could not locate any stores nearby.</p> <p>Details:" + status + "</p>";
		return;
		}


    for (var i = 0; i < results.length; i++) 
	{
		
		

			var markerOptions = {position:results[i].geometry.location, map:map, _popInfo:results[i].name };

			var marker = new google.maps.Marker(markerOptions);

			google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(this._popInfo);
			infowindow.open(map, this);
			});
	  
	  
	  
	}
  
}

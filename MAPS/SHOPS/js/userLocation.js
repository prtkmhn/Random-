var myLocation;
function trackUser()
	{
	
	var userMarker;
	 var output = document.getElementById("map-canvas");
	 output.innerHTML = "<p>Locating your location..............</p>";
  
	 if (!navigator.geolocation){
			output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    		return;
  		}

  	function success(position) 
  	{
 
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;

    console.log( '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>');
    
     myLocation = new google.maps.LatLng({-34.397,150.644});
    map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: myLocation,
    zoom: 15
     });
  
     userMarker = new google.maps.Marker(
  	{
	map:map,
	position: myLocation,
	animation:google.maps.Animation.BOUNCE
	});
	
	 navigator.geolocation.watchPosition(update, error, options);
	 findStores();

	};
	
	function update(position)
	{
	
	userMarker.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
	
	
	}

  	function error()
   		{ output.innerHTML = "Unable to retrieve your location"; };

    var options = { frequency: 5000 };
    navigator.geolocation.getCurrentPosition(success,error);
   
		
	}
	




	


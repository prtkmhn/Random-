
var map;
var infowindow;

function findStores() {
	console.log("findstore"+ myLocation) ;
	
  var request = {
    location: myLocation,
    radius: 1000,
    types: ['department_store']
	
  };
  
 var request1 = {
    location: myLocation,
    radius: 1000,
    types: ['malls']
    
	
  };
 var request2 = {
    location: myLocation,
    radius: 1000,
    types: ['grocery_or_supermarket']
	
  };

var request3 = {
    location: myLocation,
    radius: 1000,
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

  if (status != google.maps.places.PlacesServiceStatus.OK) {
       var output = document.getElementById("map-canvas");

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

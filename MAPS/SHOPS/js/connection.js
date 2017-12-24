
function trackNetwork()
{

	function onOffline() 
        {
         console.log("....Internet Imekata ...... ");
        document.addEventListener("online", onOnline, false);
        }
        
	function onOnline()
        {
          console.log("....Internet Imerudi ...... ");
          trackUser();
        }
        
 document.addEventListener("offline", onOffline, false);
}




function checkNetwork()
{
	if (navigator.onLine) 
		{
		trackNetwork();
		console.log("online");
  		return true;
  		
		} 
	else
		{
		console.log("offline");
		return false;
		
		}

}



     
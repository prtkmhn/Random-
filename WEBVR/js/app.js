(function()
{
    var scene = document.querySelector('a-scene');

    if (scene.hasLoaded)
    {
      console.log("Ho caricato!");
      showStartBtn();
    }
    else
    {
      scene.addEventListener('loaded', showStartBtn);
    }

    function showStartBtn()
    {
      $("#startBtn").fadeTo(500, 1);
      //document.getElementById("startBtn").style.display = "block";
      document.getElementById("startBtn").onclick = function() { run(); };
    }

    function run()
    {
      document.querySelector("canvas").style.opacity = "0";
      $("canvas").fadeTo(1000, 1);

      document.getElementById("container").style.display = "none";

      if(window.vrMode) { customEnterVR(); }

      onSceneLoad();
    }

    function customEnterVR ()
		{
  		var scene = document.querySelector('a-scene');
  		if (scene) {
    		if (scene.hasLoaded) {
      			scene.enterVR();
    			} else {
      			scene.addEventListener('loaded', scene.enterVR);
    			}
  			}
		}

		//document.getElementById("vrBtn").addEventListener('click', customEnterVR);
})();

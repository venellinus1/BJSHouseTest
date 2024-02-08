window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var scene = new BABYLON.Scene(engine);
	var roofMesh;
    //Set up the camera to view the center of the scene
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

	camera.radius = 30;//initial zoomout
    camera.wheelPrecision = 50; //Adjust for mouse wheel sensitivity
    camera.lowerRadiusLimit = 10; //The closest the camera can get to the target
    camera.upperRadiusLimit = 150; //The furthest the camera can get from the target

    //Add a light to the scene -todo test with directional also
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    BABYLON.SceneLoader.ImportMesh("", "housemodel1/", "scene.gltf", scene, function (meshes) {
        var rootMesh = meshes[0]; 
        rootMesh.position = BABYLON.Vector3.Zero(); //Center the model
		
        //var scaleFactor = 5; // model seems to be smaller than actual by scale of ~5, enable below to scale it up if needed
        //rootMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
		
		/*var roofGroup = scene.getTransformNodeByName("roof");// knowing in advance there is such transform!
		var secondFloorCeilingGroup = scene.getTransformNodeByName("floor_ceiling");// knowing in advance there is such transform!
		if (roofGroup && secondFloorCeilingGroup) {
			// If the group is found, you can toggle the visibility of all child meshes
			document.getElementById('toggleRoof').addEventListener('click', function() {
				roofGroup.getChildMeshes().forEach((mesh) => {
					mesh.isVisible = !mesh.isVisible;
				});
				secondFloorCeilingGroup.getChildMeshes().forEach((mesh) => {
					mesh.isVisible = !mesh.isVisible;
				});
			});
		} else {
			console.log("Roof group not found");
		}*/
		SetupVisibilityMultipleGroups(["roof", "floor_ceiling"], 'toggleRoof');
		//
		//scene.getMeshByName("roof");//get a reference to the roof object of the loaded model - knowing in advance there is such object!
		
        //Set camera target to the center of the root mesh
        camera.setTarget(rootMesh.position);
		
		AnimateCameraToIsometric(camera, scene);
    });

    engine.runRenderLoop(function() {
        scene.render();
    });

    //Resize the engine on window resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
	
	document.getElementById('toggleRoof').addEventListener('click', function() {		
        if (roofMesh) {
			console.log('toggleRoof');
            roofMesh.isVisible = !roofMesh.isVisible;
        }
    });
	
	function SetupVisibilityMultipleGroups(groupNames, buttonId) {
		document.getElementById(buttonId).addEventListener('click', function() {
			groupNames.forEach((groupName) => {
				var group = scene.getTransformNodeByName(groupName);
				if (group) {
					group.getChildMeshes().forEach((mesh) => {
						mesh.isVisible = !mesh.isVisible;
					});
				} else {
					console.log(groupName + " group not found");
				}
			});
		});
	}
	
	function AnimateCameraToIsometric(camera, scene) {
		var frameRate = 60; //Define the animation speed

		//Animation keys (for alpha, beta, radius)
		var alphaAnimation = new BABYLON.Animation("alphaAnimation", "alpha", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var betaAnimation = new BABYLON.Animation("betaAnimation", "beta", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var radiusAnimation = new BABYLON.Animation("radiusAnimation", "radius", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

		//Starting values
		var startAlpha = camera.alpha;
		var startBeta = camera.beta;
		var startRadius = camera.radius;
		
		//Ending values for isometric view counter-clockwise
		var endAlpha = startAlpha + Math.PI / 2; //Adding PI/2 (90 degrees) to rotate counter-clockwise, if Math.PI / 4; it will rotate clockwise
		var endBeta = Math.PI / 3; // Adjust as needed
		var endRadius = 30; // Adjust as needed to fit the house in the view
		
		//Ensure endAlpha is within the 0-2PI range
		if (endAlpha > 2 * Math.PI) {
			endAlpha -= 2 * Math.PI;
		}

		//Animation keys for alpha
		var alphaKeys = [
			{ frame: 0, value: startAlpha },
			{ frame: 2 * frameRate, value: endAlpha }
		];
		
		//Animation keys for beta
		var betaKeys = [
			{ frame: 0, value: startBeta },
			{ frame: 2 * frameRate, value: endBeta }
		];

		//Animation keys for radius
		var radiusKeys = [
			{ frame: 0, value: startRadius },
			{ frame: 2 * frameRate, value: endRadius }
		];
		alphaAnimation.setKeys(alphaKeys);
		betaAnimation.setKeys(betaKeys);
		radiusAnimation.setKeys(radiusKeys);
		//Run the animations
		scene.beginDirectAnimation(camera, [alphaAnimation, betaAnimation, radiusAnimation], 0, 2 * frameRate, false);
	}
});
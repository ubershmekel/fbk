
if ( ! Detector.webgl ) {

    Detector.addGetWebGLMessage();
    document.getElementById( 'container' ).innerHTML = "";

}

var renderer, scene, camera;

function init3D(){
    // set the scene size
    var WIDTH = 400,
        HEIGHT = 300;

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer();
    camera =
      new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR);

    scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);
    
    var ambientLight = new THREE.AmbientLight( 0xcccccc );
    scene.add( ambientLight );
    
    var loader = new THREE.JSONLoader();
    loader.load("js/untitled.js", function(geom){ 
        console.log(geom);
        var mesh = new THREE.Mesh( geom, new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        }) );
        scene.add(mesh);
    });
    
    // create the sphere's material
    var sphereMaterial =
      new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        }); 
        
    var radius = 50,
        segments = 16,
        rings = 16;

    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphereMaterial);

    // add the sphere to the scene
    //scene.add(sphere);
    
    animate();
}

function animate() {

    requestAnimationFrame( animate );
    render();
}

function render() {
    renderer.render( scene, camera );
}

$(function() {
    
    init3D();
    
    var game = {};
    game.playerKeys = [{}, {}];
    game.taken = 't';
    game.p0 = 0;
    game.p1 = 1;
    game.currentPlayer = game.p0;
    game.playerNames = {};
    game.playerNames[game.p0]= 'Player Left';
    game.playerNames[game.p1]= 'Player Right';
    game.playerColors = {};
    game.playerColors[game.p0] = '#00f';
    game.playerColors[game.p1] = '#f00';
    
    game.pidToStr = function(pid) {
        return "p" + pid;
    }
    
    game.otherPlayer = function() {
        return (game.currentPlayer + 1) % 2;
    }
    
    game.removeKey = function(pid, key) {
        delete game.playerKeys[pid][key];
        var elemName = game.pidToStr(pid) + 'key' + key;
        $('#' + elemName).remove();
    }

    game.keyHolderElem = function(pid) {
        var holderId = '#' + game.pidToStr(pid) + 'keys';
        return $(holderId);
    }
    
    game.addKey = function(pid, key) {
        game.playerKeys[pid][key] = game.taken;
        
        var elemName = game.pidToStr(pid) + 'key' + key;
        var elem = $('<div/>', {
            text: key,
            id: elemName
            });
        
        
        game.keyHolderElem(pid).append(elem);
    }

    game.updateViz = function() {
        $('#currentPlayer').text(game.playerNames[game.currentPlayer]).css('color', game.playerColors[game.currentPlayer]);
        
    }
    
    game.nextTurn = function() {
        game.currentPlayer = game.otherPlayer();
        game.updateViz();
        
        game.queueTurn();
    }
    
    game.queueTurn = function() {
       setTimeout(game.nextTurn, 2000);
    }
    
    
    game.registerKeys = function() {
        $(window).keypress(function(e) {
            var key = e.which;
            console.log(key);
            if(game.playerKeys[game.currentPlayer][key] == game.taken) {
                // TODO: play wasted key sound
                return;
            }
            if(game.playerKeys[game.otherPlayer()][key] == game.taken) {
                // TODO: play conquer key sound
                game.removeKey(game.otherPlayer(), key);
            }
            
            game.addKey(game.currentPlayer, key);
        });
    }
    
    game.stateChange = function(stateName) {
        if (game.state != undefined) {
            game.state.css('display', 'none');
        }
        game.state = $('#' + stateName);
        game.state.css('display', 'block');
    }
    
    game.newGame = function() {
        game.stateChange('play');
        game.playerKeys = [{}, {}];
        game.currentPlayer = game.p0;
        game.keyHolderElem(game.p0).empty();
        game.keyHolderElem(game.p1).empty();
        game.round = 1;
        game.timeLeft = 5;
    }
    
    game.main = function() {
        game.stateChange('intro');
        $('#startButton').click(function(){game.newGame();});
        game.registerKeys();
        game.updateViz();
        game.queueTurn();
    }
   
    game.main();
});
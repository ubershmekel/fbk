
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
    
    game.time = function() {
        return new Date().getTime();
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
        game.playerScores[pid] += 1;
        
        var elemName = game.pidToStr(pid) + 'key' + key;
        var elem = $('<div/>', {
            text: key,
            id: elemName
            });
        
        
        game.keyHolderElem(pid).append(elem);
    }

    game.updateScore = function(pid) {
        $('#p' + pid + 'score').text(game.playerScores[pid]);
    }
    
    game.updateViz = function() {
        var curp = $('#currentPlayer');
        curp.text(game.playerNames[game.currentPlayer] + ' ' + game.roundTimeLeft);
        curp.css('color', game.playerColors[game.currentPlayer]);
        game.updateScore(game.p0);
        game.updateScore(game.p1);
    }
    
    game.update = function() {
        var time = game.time();
        game.roundTimeLeft = game.timePerRound + game.roundStartTime - time;
        if(game.roundTimeLeft <= 0) {
            // next round
            if(game.currentPlayer == game.p1) {
                game.timePerRound = game.timePerRound - 1000;
            }
            if(game.timePerRound == 0) {
                game.endGame();
            }
            game.roundStartTime = time;
            game.currentPlayer = game.otherPlayer();
        }
        
        game.updateViz();
    }
    
    
    game.registerKeys = function() {
        $(window).keypress(function(e) {
            if(game.stateName != 'play') {
                return;
            }
            var key = e.which;
            //console.log(key);
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
        if (game.stateDiv != undefined) {
            game.stateDiv.css('display', 'none');
        }
        game.stateName = stateName;
        game.stateDiv = $('#' + stateName);
        game.stateDiv.css('display', 'block');
    }
    
    game.newGame = function() {
        game.stateChange('play');
        game.playerKeys = [{}, {}];
        game.playerScores = [0, 0];
        game.currentPlayer = game.p0;
        game.keyHolderElem(game.p0).empty();
        game.keyHolderElem(game.p1).empty();
        game.round = 1;
        game.timePerRound = 5000;
        game.roundStartTime = game.time();
        game.startTime = game.time();
        game.intervalId = setInterval(game.update, 30); // 30 fps is about 30 ms delay
    }
    
    game.endGame = function() {
        game.stateChange('gameover');
        clearInterval(game.intervalId);
        game.intervalId = undefined;
        
        var timePlayed = (game.time() - game.startTime) / 1000;
        var winnerText;
        var winnerId = undefined;
        if (game.playerScores[game.p0] > game.playerScores[game.p1]) {
            winnerId = game.p0;
        } else if (game.playerScores[game.p0] < game.playerScores[game.p1]) {
            winnerId = game.p1;
            
        }
        
        if(winnerId == undefined) {
            winnerText = 'a tie';
            $('#gameover').css('color', '#000');
        } else {
            winnerText = game.playerNames[winnerId] + ' won';
            $('#gameover').css('color', game.playerColors[winnerId]);
        }
        
        var text = winnerText + ' after ' + timePlayed + ' seconds ' + 'and the scores: ' + game.playerScores;
        $('#results').text(text);
    }
    
    game.main = function() {
        game.stateChange('intro');
        $('#startButton').click(function(){game.newGame();});
        game.registerKeys();
    }
   
    game.main();
});
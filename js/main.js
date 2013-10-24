
// CONSTS
var PLAY_MODE_CLICK_TO_CAPTURE = 0;
var PLAY_MODE_HOLD_TO_CAPTURE = 1;

// FUNCS

if ( ! Detector.webgl ) {

    Detector.addGetWebGLMessage();
    document.getElementById( 'container' ).innerHTML = "";

}

var renderer, scene, camera;

function init3D(){
    // set the scene size
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

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
    
    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);
    
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };
    
    var texture = new THREE.Texture();
    
    var loader = new THREE.ImageLoader( manager );
    loader.load( 'obj/KEYBOARD_Letters.PNG', function ( image ) {

        texture.image = image;
        texture.needsUpdate = true;

    } );
    
    
    var loader = new THREE.JSONLoader( manager );
    loader.load( 'obj/keyboard.js', function ( geometry, materials ) {

        mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({map: texture}));
        
        mesh.scale.set(30, 30, 30);
        mesh.rotation.set(Math.PI / 2, 0, 0);
        
        scene.add(mesh);

    } );
    
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
    
    game.play_mode = PLAY_MODE_HOLD_TO_CAPTURE;
    
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
        curp.text(game.playerNames[game.currentPlayer] + ' ' + Math.floor(game.roundTimeLeft / 1000) + '.' + game.roundTimeLeft % 1000);
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
        $(window).keydown(function(e) {
            if(game.stateName != 'play') {
                return;
            }
            var key = e.which;
            //console.log(key);
            if(game.playerKeys[game.currentPlayer][key] == game.taken) {
                // TODO: play wasted key sound
                return;
            }
            
            if (game.playerKeys[game.otherPlayer()][key] == game.taken) {
                // TODO: play conquer key sound
                game.removeKey(game.otherPlayer(), key);
            }
                
            game.addKey(game.currentPlayer, key);
                
        });
        $(window).keyup(function(e) {
            if (game.stateName != 'play' || game.play_mode != PLAY_MODE_HOLD_TO_CAPTURE){
                return;
            }
            
            var key = e.which;
            
            game.removeKey(game.currentPlayer, key);
        });
    }
    
    game.stateChange = function(stateName) {
        if (game.stateDiv != undefined) {
            game.stateDiv.hide();
        }
        game.stateName = stateName;
        game.stateDiv = $('#' + stateName);
        game.stateDiv.show();
    }
    
    game.newGame = function() {
        game.stateChange('play');
        game.playerKeys = [{}, {}];
        game.playerScores = [0, 0];
        game.currentPlayer = game.p0;
        game.keyHolderElem(game.p0).empty();
        game.keyHolderElem(game.p1).empty();
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
        
        var strokesPerSecond = (game.playerScores[0] + game.playerScores[1]) / timePlayed;
        strokesPerSecond = Math.round(strokesPerSecond * 10) / 10;
        var text = winnerText + ' after ' + timePlayed + ' seconds ' + 'and the scores: ' + game.playerScores + " that's " + strokesPerSecond + " keys per second.";
        $('#results').text(text);
    }
    
    game.main = function() {
        game.stateChange('intro');
        $('#startButton').click(function(){game.newGame();});
        game.registerKeys();
    }
   
    game.main();
});
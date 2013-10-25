
// CONSTS
var PLAY_MODE_CLICK_TO_CAPTURE = 0;
var PLAY_MODE_HOLD_TO_CAPTURE = 1;

var KEY_TO_MAT = [
55,
56,
33,
53,
51,
52,
49,
50,
48,
57,
0, // F18
0, // F19
109,
106,
0, // F16
0, // F17
105,
27, // clear
0, // NP =
111,
54,
78,
188,
77,
190,
191,
83,
65,
20,
192,
8,
187,
189,
113,
114,
67,
27,
38,
110,
96,
107,
13,
102,
101,
100,
99,
98,
97,
116,
72,
75,
68,
71,
74,
76,
222,
70,
90,
88,
86,
16,
80,
79,
16,
13,
40,
85,
73,
115,
39,
123,
0, // eject
122,
121,
119,
120,
118,
117,
17,
37,
224,
18,
224,
32,
17,
0, // f13
17,
9,
220,
81,
219,
221,
87,
84,
89,
186,
69,
0, // F15,
0, // F14,
35,
46,
45, // Fn changed to insert
34,
112,
36,
104,
103,
66,
82
];

// FUNCS

if ( ! Detector.webgl ) {

    Detector.addGetWebGLMessage();
    document.getElementById( 'container' ).innerHTML = "";

}

var renderer, scene, camera;

function init3D(game){
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
    
        for (var i = 0; i < materials.length; i++){
            materials[i].map = texture;
        }
    
        var faceMaterial = new THREE.MeshFaceMaterial(materials);
    
        game.mesh = new THREE.Mesh(geometry, faceMaterial);
        
        game.mesh.scale.set(30, 30, 30);
        game.mesh.rotation.set(Math.PI * 0.25, 0, 0);
        
        scene.add(game.mesh);

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
    game.playerColors[game.p0] = '#E8C9AD';
    game.playerColors[game.p1] = '#9CC6C3';     
    game.playerColorsRGB = {};
    game.playerColorsRGB[game.p0] = [232/255, 201/255, 173/255];
    game.playerColorsRGB[game.p1] = [156/255, 198/255, 195/255];
    
    game.play_mode = PLAY_MODE_CLICK_TO_CAPTURE;
    
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
        //$('#' + elemName).remove();
    }

    game.keyHolderElem = function(pid) {
        var holderId = '#' + game.pidToStr(pid) + 'keys';
        return $(holderId);
    }
    
    game.addKey = function(pid, key) {
        game.playerKeys[pid][key] = game.taken;
        game.playerScores[pid] += 1;
        
        var elemName = game.pidToStr(pid) + 'key' + key;
        /*var elem = $('<div/>', {
            text: key,
            id: elemName
            });
        
        
        game.keyHolderElem(pid).append(elem);*/
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
    
    game.colorKey = function(key, color){
        console.log(key);
        game.mesh.material.materials[KEY_TO_MAT.indexOf(key)].color.setRGB(color[0], color[1], color[2]);
    }
    
    game.turnOnColor = function(player, key){
        game.colorKey(key, game.playerColorsRGB[player]);
    }
    
    game.turnOffColor = function(key){
        game.colorKey(key, [1,1,1]);
    }
    
    game.resetColorKeys = function() {
        for(var i = 0; i < KEY_TO_MAT.length; i++) {
            // TODO: maybe there's a smarter way to do this without double look up?
            game.turnOffColor(KEY_TO_MAT[i]);
        }
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
            game.turnOnColor(game.currentPlayer, key);
            
                
        });
        $(window).keyup(function(e) {
            if (game.stateName != 'play' || game.play_mode != PLAY_MODE_HOLD_TO_CAPTURE){
                return;
            }
            
            var key = e.which;
            
            game.removeKey(game.currentPlayer, key);
            game.turnOffColor(key);
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
        game.resetColorKeys();
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
        init3D(game);
        game.stateChange('intro');
        $('.startButton').click(function(){game.newGame();});
        game.registerKeys();
    }
   
    game.main();
});
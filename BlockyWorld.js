// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   varying vec2 v_UV;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  varying vec2 v_UV;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor; // Use color
    }
    else if (u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
    }
    else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV); // Use texture0
    }
    else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV); // Use texture1
    }
    else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV); // Use texture2
    }
    else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV); // Use texture3
    }
    else {
      gl_FragColor = vec4(1, .2, .2, 1); // Error, put Redish
    }
  }`



// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let g_map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,2,0,0,0,2,0,3,0,0,2,0,0,1],
  [1,2,3,0,0,2,2,0,3,0,0,2,0,2,0,1],
  [1,0,2,2,0,0,2,0,0,2,2,0,2,2,2,1],
  [1,0,2,0,3,0,2,2,2,0,0,0,0,0,0,1],
  [1,2,2,2,0,0,0,0,0,0,2,2,3,2,0,1], // Correct Path
  [1,2,0,0,0,2,2,0,2,3,2,0,0,3,2,1],
  [0,0,2,0,2,2,2,0,0,0,2,2,3,0,2,1],
  [0,0,0,0,2,0,3,0,0,0,0,0,2,0,2,1],
  [1,0,2,2,2,0,2,0,3,3,0,2,2,0,0,1],
  [1,0,2,0,0,0,0,0,0,0,2,0,2,0,0,1],
  [1,0,3,0,2,0,2,0,0,3,0,2,0,0,0,1],
  [1,0,2,0,4,4,0,0,4,3,0,2,2,0,0,1],
  [1,2,2,0,0,4,2,0,0,2,0,0,2,0,0,1],
  [1,0,2,0,0,3,0,2,0,2,0,0,2,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function drawMap() {
  for (x = 0; x < 16; x++) {
    for (y = 0; y < 16; y++) {
      if (g_map[x][y] == 1) {
        var wall = new Cube();
        wall.textureNum = 2;  // Use dirt texture (texture 2)
        wall.matrix.translate(0, -0.5, 0);
        wall.matrix.scale(0.75, 0.75, 0.75);
        wall.matrix.translate(x - 8, 0, y - 8);
        wall.renderfast();
      }
      else if (g_map[x][y] == 2) { // Sky block (replaced with leaves)
        var leaf = new Cube();
        leaf.textureNum = 3; // Use leaf texture (texture 3)
        leaf.matrix.translate(x - 8.5, 0, y - 8.5); // Adjust positioning
        leaf.renderfast();
      }
      else if (g_map[x][y] == 3) {
        var leaf = new Cube();
        leaf.textureNum = 3; // Use leaf texture (texture 3)
        leaf.matrix.translate(x - 8.5, 0, y - 8.5);
        leaf.renderfast();
      }
    }
  }
}



// Performance + Animation Globals
var g_start_time = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_start_time
var g_joint1 = 0; // Head Joint
var g_joint2 = 0; // Root Joint (torso)
var g_joint3 = 0; // Left Foot Joint
var g_joint4 = 0; // Right Foot Joint
var g_joint5 = 0; // Left Arm Joint
var g_joint6 = 0; // Right Arm Joint
var g_waddleSpeed = 0.02;
var g_camera;
var g_globalAngle = 0;

// UI
var g_Waddle_Animation = false;
var g_Hat_Animation = true;

//Colors
//var body_color = [0, 0, 0, 1];
//var belly_color = [1, 1, 1, 1];
//var beak_color = [1, 0.5, 0, 1];
//var feet_color = [1, 0.5, 0, 1];

//const textureLoader = new THREE.TextureLoader();

// Load textures
//const textures = [
    //textureLoader.load('textures/sky.png'),    // texture0
    //null,                                      // texture1
    //null,                                      // texture2 
    //textureLoader.load('textures/leaves.png')  // texture3
//];

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    g_camera = new Camera
    initTextures(gl, 0);

    document.onkeydown = keydown;
    document.onmousemove = mouseMove;

    gl.clearColor(0, 0, 0, 1);
    requestAnimationFrame(tick);
}

function tick(){
    g_seconds = performance.now()/1000.0 - g_start_time;
    updateAnimationAngles();
    // Draw everything
    renderAllShapes();
    requestAnimationFrame(tick);
  }

// Helper Functions
function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
      }
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL); // Ensures closer objects appear in front
    gl.disable(gl.BLEND); // Disable blending to avoid unwanted transparency
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
  }
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
  }
  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
      console.log('Failed to get the storage location of u_Sampler0 object');
      return;
  }
  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1){
      console.log('Failed to get the storage location of u_Sampler1 object');
      return;
  }
  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2){
      console.log('Failed to get the storage location of u_Sampler2 object');
      return;
  }
  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3){
      console.log('Failed to get the storage location of u_Sampler3 object');
      return;
  }
  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture){
      console.log('Failed to get the storage location of u_whichTexture');
      return;
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
    if (g_Waddle_Animation) {
      g_Joint1 = 10 * Math.sin(g_seconds * 3);
      g_Joint2 = -10 * Math.sin(g_seconds * 3);
    }
  }

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }

  image0.onload = function() { sendTextureToTEXTURE0(image0); };
  image0.src = 'sky.png';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  image1.onload = function() { sendTextureToTEXTURE1(image1); };
  image1.src = 'grass.png';

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  image2.onload = function() { sendTextureToTEXTURE2(image2); };
  image2.src = 'dirt.png';

  var image3 = new Image();
  if (!image3) {
    console.log('Failed to create the image3 object');
    return false;
  }
  image3.onload = function() { sendTextureToTEXTURE3(image3); };
  image3.src = 'leaves.png'; // Correctly load leaves.png

  return true;
}

function sendTextureToTEXTURE0(image){
  var texture = gl.createTexture();   // create a texture object
  if(!texture){
      console.log('Failed to create the texture0 object');
      return false;
  }

  // flip the image's Y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToTEXTURE1(image){
  var texture = gl.createTexture();   // create a texture object
  if(!texture){
      console.log('Failed to create the texture1 object');
      return false;
  }

  // flip the image's Y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image){
  var texture = gl.createTexture();   // create a texture object
  if(!texture){
      console.log('Failed to create the texture2 object');
      return false;
  }

  // flip the image's Y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image){
  var texture = gl.createTexture();   // create a texture object
  if(!texture){
      console.log('Failed to create the texture3 object');
      return false;
  }

  // flip the image's Y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE3);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler3, 3);
}


// Draw every shape that is supposed to be in the canvas
function renderAllShapes(){

    // Pass the projection matrix
    var projMat=new Matrix4();
    projMat = g_camera.projectionMatrix;
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
    // Pass the view matrix
    var viewMat=new Matrix4();
    viewMat = g_camera.viewMatrix;
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
    var startTime = performance.now();
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    drawWorld();
    drawMap();
    drawPenguin();

    // Check the time at the end of the function, and show on the web
    var duration = performance.now() - startTime;
    sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) / 10, "fps");
  }

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm) {
      console.log('Failed to get the HTML element with the specified ID');
      return;
    }
    htmlElm.innerHTML = text;
}

// set up actions for the HTML UI elements
function addActionsForHtmlUI() {
// Button Events
document.getElementById("animationJoint1OnButton").onclick = function() {
    g_waddleAnimation = true;
    renderScene();
};
document.getElementById("animationJoint1OffButton").onclick = function() {
    g_waddleAnimation = false;
};
document.getElementById('HatAnimationButton_On').onclick = function(){g_Hat_Animation = true}
document.getElementById('HatAnimationButton_Off').onclick = function(){g_Hat_Animation = false}

}

function mouseMove(ev) {
    if (ev.buttons == 1) {
      g_camera.pan(-ev.movementX, -ev.movementY);
    }
    renderAllShapes();
  }

function keydown(ev) {
  let key = ev.key.toLowerCase(); // Convert key input to lowercase

  if (key === 'a') {
    g_camera.moveLeft();
  } else if (key === 'd') {
    g_camera.moveRight();
  } else if (key === 'e') {
    g_camera.panRight();
  } else if (key === 'q') {
    g_camera.panLeft();
  } else if (key === 's') {
    g_camera.moveBackwards();
  } else if (key === 'w') {
    g_camera.moveForward();
  } else if (key === 'z') {
    g_camera.upward();
  } else if (key === 'x') {
    g_camera.downward();
  }
  
  renderAllShapes();
}

// Call function to set default values
setInitialJointValues();


function setInitialJointValues() {
  let joint5 = document.getElementById("joint5");
  let joint6 = document.getElementById("joint6");
  let cameraY = document.getElementById("Y");

  if (joint5 && joint6 && cameraY) {
      joint5.value = 180;
      joint6.value = 180;
      cameraY.value = 180;

      g_joint5 = 180;
      g_joint6 = 180;
      g_globalAngleY = 180;

      renderAllShapes();
  } else {
      console.error("One or more elements were not found in the DOM.");
  }
}


function renderScene() {
    if (g_waddleAnimation) {
        g_joint3 = 10 * Math.sin(performance.now() * g_waddleSpeed);
        g_joint4 = -10 * Math.sin(performance.now() * g_waddleSpeed);
    }
    drawPenguin();
    requestAnimationFrame(renderScene);
}

function drawWorld() {
  // Floor
  var floor = new Cube();
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.9, 0);
  floor.matrix.scale(25, 1, 25);
  floor.matrix.translate(-0.5, -.95, -0.5);
  floor.render();

  // Sky 
  var sky = new Cube();
  sky.textureNum = 0;
  sky.matrix.translate(0, 1, 0);
  sky.matrix.scale(25, 25, 25);
  sky.matrix.translate(-0.5, -.5, -0.5);
  sky.render();  
}



function drawPenguin() {
  // Body
  var body = new Cube();
  body.color = [1, 1, 1, 1]; // Greyish-white belly
  body.matrix.rotate(g_joint2, 0, 1, 0);
  body.matrix.scale(0.6, 0.85, 0.4);
  body.matrix.translate(-.4, -.66, -.25);
  body.render();
  
  // Head
  var head = new Cube();
  head.color = [0, 0, 0, 1]; // Black head
  head.matrix.translate(-.14, 0.3, -0.1);
  head.matrix.rotate(g_joint1, 0, 1, 0);
  head.matrix.scale(0.4, 0.4, 0.4);
  head.render();
  
  // Eyes & Pupils
  var leftEye = new Cube();
  leftEye.color = [1, 1, 1, 1];
  leftEye.matrix.translate(0.14, 0.5, 0.28);
  leftEye.matrix.scale(0.08, 0.08, 0.08);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [1, 1, 1, 1];
  rightEye.matrix.translate(-.11, 0.5, 0.28);
  rightEye.matrix.scale(0.08, 0.08, 0.08);
  rightEye.render();
  
  var leftPupil = new Cube();
  leftPupil.color = [0, 0, 0.5, 1]; // Dark blue pupil
  leftPupil.matrix.translate(.16, 0.52, 0.34);
  leftPupil.matrix.scale(0.04, 0.04, 0.04);
  leftPupil.render();
  
  var rightPupil = new Cube();
  rightPupil.color = [0, 0, 0.5, 1];
  rightPupil.matrix.translate(-.09, 0.52, 0.34);
  rightPupil.matrix.scale(0.04, 0.04, 0.04);
  rightPupil.render();
  
  // Beak (Using Pyramid.js)
  var beak = new Pyramid();
  beak.color = [1, 0.5, 0, 1]; // Orange
  beak.matrix.translate(.06, 0.45, 0.24);
  beak.matrix.scale(0.15, 0.15, 0.4);
  beak.render();
  
  // Arms
  var leftArm = new Cube();
  leftArm.color = [0, 0, 0, 1]; // Black arms
  leftArm.matrix.translate(-0.37, .15, .04);
  leftArm.matrix.rotate(g_joint5, 1, 0, 0);
  leftArm.matrix.scale(0.12, 0.4, 0.12);
  leftArm.render();

  var rightArm = new Cube();
  rightArm.color = [0, 0, 0, 1];
  rightArm.matrix.translate(0.37, .15, .04);
  rightArm.matrix.rotate(g_joint6, 1, 0, 0);
  rightArm.matrix.scale(0.12, 0.4, 0.12);
  rightArm.render();
  
  // Feet
  var leftFoot = new Cube();
  leftFoot.color = [1, 0.5, 0, 1];
  leftFoot.matrix.translate(-.22, -0.65, 0);
  leftFoot.matrix.rotate(g_joint3, 1, 0, 0);
  leftFoot.matrix.scale(0.15, 0.08, 0.25);
  leftFoot.render();
  
  var rightFoot = new Cube();
  rightFoot.color = [1, 0.5, 0, 1];
  rightFoot.matrix.translate(0.17, -0.65, 0);
  rightFoot.matrix.rotate(g_joint4, 1, 0, 0);
  rightFoot.matrix.scale(0.15, 0.08, 0.25);
  rightFoot.render();

  // Hat
  if (g_Hat_Animation == true) {
    // Hat (Base)
    var hatBase = new Cube();
    hatBase.color = [1, 0, 0, 1]; // Red hat base
    hatBase.matrix.translate(-0.15, 0.62, -0.15);
    hatBase.matrix.scale(0.42, 0.13, 0.48);
    hatBase.render();
    // Hat (Top)
    var hatTop = new Cube();
    hatTop.color = [1, 0, 0, 1]; // Red top
    hatTop.matrix.translate(-0.07, 0.71, -0.08);
    hatTop.matrix.scale(0.26, 0.17, 0.32);
    hatTop.render();
    // Hat Pom-Pom
    var hatPomPom = new Cube();
    hatPomPom.color = [1, 1, 1, 1]; // White pom-pom
    hatPomPom.matrix.translate(.003, 0.83, 0.04);
    hatPomPom.matrix.scale(0.12, 0.12, 0.12);
    hatPomPom.render();
  }
}

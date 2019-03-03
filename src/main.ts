import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Mesh from './geometry/Mesh';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Lsystem from'./L-systems/Lsystem';
// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'rotation_angle': 40,
  'iterations': 3,
  'Load Scene': loadScene, // A function pointer, essentially
  'Season': 'Winter',
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;

let axiom: string;
let transformations: mat4[];
let cylinderMesh: Mesh;
let bushLeavesMesh: Mesh;
let lsystem: Lsystem;

let obj0: string = readTextFile('./Cylinder.obj');
let obj1: string = readTextFile('./BushLeaves.obj');

let season: number = 1;

function loadScene() {

  square = new Square();
  square.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();

  cylinderMesh = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  cylinderMesh.create();
  bushLeavesMesh = new Mesh(obj1, vec3.fromValues(0.0, 0.0, 0.0));
  bushLeavesMesh.create();

  axiom ='FF';
  transformations = [];
  lsystem = new Lsystem(axiom, controls.iterations, controls.rotation_angle);
  console.log(lsystem.grammar);
  lsystem.expandGrammar();
  lsystem.executeDrawing();


  let branchColor:number[];
  let leavesColor:number[];
  if (controls.Season == "Winter") {
    branchColor = [142./255., 139./255., 134./255., 1.0];
    leavesColor= [247./255., 254./255., 255./255., 1.0];
    season = 1;
  } else if (controls.Season == "Summer") {
    branchColor = [109./255., 79./255., 7./255., 1.0];
    leavesColor= [84./255., 185./255., 72./255., 1.0];
    season = 2;
  } else if (controls.Season == "Fall") {
    let rand = Math.random();
    if (rand > 0.3) {
        leavesColor= [209./255., 156./255., 25./255., 1.0];
      } else {
        leavesColor= [175./255., 166./255., 36./255., 1.0];
      }
    branchColor = [109./255., 79./255., 7./255., 1.0];
    season = 3;
  }

  setTransArrays(cylinderMesh,lsystem.branch_trans_mat, branchColor);
  setTransArrays(bushLeavesMesh,lsystem.leaves_trans_mat, leavesColor);
}

function setTransArrays(mesh: Mesh, transformations: mat4[], col: number[]) {

  let colorsArray = [];
  let trans1Array = [];
  let trans2Array = [];
  let trans3Array = [];
  let trans4Array = [];

  for (let i = 0; i < transformations.length; i++) {
    let trans = transformations[i];

    trans1Array.push(trans[0]);
    trans1Array.push(trans[1]);
    trans1Array.push(trans[2]);
    trans1Array.push(trans[3]);

    trans2Array.push(trans[4]);
    trans2Array.push(trans[5]);
    trans2Array.push(trans[6]);
    trans2Array.push(trans[7]);

    trans3Array.push(trans[8]);
    trans3Array.push(trans[9]);
    trans3Array.push(trans[10]);
    trans3Array.push(trans[11]);

    trans4Array.push(trans[12]);
    trans4Array.push(trans[13]);
    trans4Array.push(trans[14]);
    trans4Array.push(trans[15]);

    colorsArray.push(col[0]);
    colorsArray.push(col[1]);
    colorsArray.push(col[2]);
    colorsArray.push(1.0);
  }

  let colors: Float32Array = new Float32Array(colorsArray);
  let trans1: Float32Array = new Float32Array(trans1Array);
  let trans2: Float32Array = new Float32Array(trans2Array);
  let trans3: Float32Array = new Float32Array(trans3Array);
  let trans4: Float32Array = new Float32Array(trans4Array);

  mesh.setInstanceVBOs(colors, trans1, trans2, trans3, trans4);
  mesh.setNumInstances(transformations.length);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'rotation_angle', 10, 90).step(1);
  gui.add(controls, 'iterations').step(1);
  gui.add(controls, 'Season', ['Winter', 'Summer', 'Fall']);
  gui.add(controls, 'Load Scene');
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  // const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 3, 0));
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    renderer.clear();
    renderer.render(camera, flat, [screenQuad], season);
    renderer.render(camera, instancedShader, [
      cylinderMesh,
      bushLeavesMesh,
    ], season);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();

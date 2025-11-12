//setting up canvas
const canvas = document.getElementById('black-hole-sim-enviorment');
if(!canvas){
    showError('Could not find HTML canvas element - check for typos, or loading JavaScript file too early');
}
const gl = canvas.getContext('webgl2');

// setting up viewport
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


//show error function
function showError(errorText) {
  const errorBoxDiv = document.getElementById('error-box');
  const errorSpan = document.createElement('p');
  errorSpan.innerText = errorText;
  errorBoxDiv.appendChild(errorSpan);
  console.error(errorText);
}

function compileShader(type, src){
    const s =  gl.createShader(type)
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog();
        showError(`Failed to compile vertex shader: ${errorMessage}`);
        return
    }
    return s
}

//COMPILE SHADERS
const vsSourceCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;

void main() {
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
    gl_PointSize = 400.0;
}`;

const whitefsSourceCode = `#version 300 es
    precision mediump float;

    out vec4 outputColor;

    void main() {
        outputColor = vec4(1.0, 1.0, 1.0, 1.0);
}`;

const blackfsSourceCode = `#version 300 es
precision mediump float;
out vec4 outputColor;

void main() {
    // Make the point circular by discarding pixels outside the radius
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
        discard;
    }
    outputColor = vec4(1.0, 0.0, 0.0, 1.0); // solid black
}`;

const vs = compileShader(gl.VERTEX_SHADER, vsSourceCode);
const wfs = compileShader(gl.FRAGMENT_SHADER, whitefsSourceCode);
const bfs = compileShader(gl.FRAGMENT_SHADER, blackfsSourceCode)

// Create white program
const whiteProgram = gl.createProgram();
gl.attachShader(whiteProgram, vs);
gl.attachShader(whiteProgram, wfs);
gl.linkProgram(whiteProgram);
if (!gl.getProgramParameter(whiteProgram, gl.LINK_STATUS)) {
    console.error("White program link error:", gl.getProgramInfoLog(whiteProgram));
}

// Create black program
const blackProgram = gl.createProgram();
gl.attachShader(blackProgram, vs);
gl.attachShader(blackProgram, bfs);
gl.linkProgram(blackProgram);
if (!gl.getProgramParameter(blackProgram, gl.LINK_STATUS)) {
    console.error("Black program link error:", gl.getProgramInfoLog(blackProgram));
}


const pointPosition = new Float32Array([0.0, 0.0]);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, pointPosition, gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(blackProgram, "vertexPosition");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(blackProgram);
gl.bindVertexArray(vao);
gl.drawArrays(gl.POINTS, 0, 1);
//PHYSICS SECTION
const scale = 2e10
const G = 6.674e-11;
const c = 299792458.0;

//setting up the blackhole object
const blackHole = {
    mass: 2e31, //kg
    pos: [0,0],
}

blackHole.r_s = (2*G*blackHole.mass) / (c**2)
console.log("The mass(kg): ", blackHole.mass)
console.log("Schwarzschild radius (m):", blackHole.r_s);
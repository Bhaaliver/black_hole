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
gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
}`;

const fsSourceCode = `#version 300 es
    precision mediump float;

    out vec4 outputColor;

    void main() {
        outputColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;
const vs = compileShader(gl.VERTEX_SHADER, vsSourceCode);
const fs = compileShader(gl.FRAGMENT_SHADER, fsSourceCode);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);


//PHYSICS SECTION
const G = 6.674e-11;
const c = 299792458.0;
const blackHole = {
    mass: 10e100,
    pos: [0,0],
}

blackHole.r_s = (2*G*blackHole.mass) / (c**2)
console.log("Schwarzschild radius (m):", blackHole.r_s);
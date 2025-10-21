const pi = Math.PI;
const canvas = document.getElementById('black-hole-sim-enviorment');
if (!canvas) {
    showError('Could not find HTML canvas element - check for typos, or loading JavaScript file too early');
}

const gl = canvas.getContext('webgl2');
if (!gl) {
    showError('WebGL is not supported on this device - try using a different device or browser');
}
gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

function showError(errorText) {
  const errorBoxDiv = document.getElementById('error-box');
  const errorSpan = document.createElement('p');
  errorSpan.innerText = errorText;
  errorBoxDiv.appendChild(errorSpan);
  console.error(errorText);
}

function drawTriangle(vertexes) {
    const triangleVertices = vertexes;
    const triangleGeoCpuBuffer = new Float32Array(triangleVertices);

    const triangleGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleGeoCpuBuffer, gl.STATIC_DRAW);

    const vertexShaderSourceCode = `#version 300 es
    precision mediump float;
    
    in vec2 vertexPosition;

    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
    }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        showError(`Failed to compile vertex shader: ${errorMessage}`);
        return;
    }

    const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;
    
    out vec4 outputColor;

    void main() {
        outputColor = vec4(0.294, 0.0, 0.51, 1.0);
    }`;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(fragmentShader);
        showError(`Failed to compile fragment shader: ${errorMessage}`);
        return;
    }

    const drawTriangleProgram = gl.createProgram();
    gl.attachShader(drawTriangleProgram, vertexShader);
    gl.attachShader(drawTriangleProgram, fragmentShader);
    gl.linkProgram(drawTriangleProgram);
    if (!gl.getProgramParameter(drawTriangleProgram, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(drawTriangleProgram);
        showError(`Failed to link GPU program: ${errorMessage}`);
        return;
    }

    const vertexPositionAttributeLocation = gl.getAttribLocation(drawTriangleProgram, 'vertexPosition');
    if (vertexPositionAttributeLocation < 0) {
        showError(`Failed to get attribute location for vertexPosition`);
        return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(drawTriangleProgram);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.vertexAttribPointer(
        vertexPositionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawCircle(res, radius, centerX=0, centerY=0) {
    try {
        for(let angle = 0; angle <= 2*pi; angle += pi/res) {
            const cos = radius*0.75*Math.cos(angle);
            const sin = radius*Math.sin(angle);
            drawTriangle([0.0+centerX, 0.0+centerY, cos+centerX, 0.0+centerY, cos+centerX, sin+centerY]);
            drawTriangle([0.0+centerX, 0.0+centerY, 0.0+centerX, sin+centerY, cos+centerx, sin+centerY]);
        }
    } catch (e){
        showError(`Uncaught JavaScript exception: ${e}`);
    }
}

try {
    drawCircle(150, 0.1);
} catch (e){
    showError(`Uncaught JavaScript exception: ${e}`);
}

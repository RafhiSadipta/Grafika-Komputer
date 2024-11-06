function main() {
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    // Buffer untuk vertex positions
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesnew), gl.STATIC_DRAW);

    // Buffer untuk colors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Buffer untuk indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Buffer untuk normals
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    var vertexShaderCode = document.getElementById("vertexShaderCode").text;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    // Fragment shader dengan pencahayaan difus
    var fragmentShaderCode = `
        precision mediump float;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform vec3 uLightPosition;
        uniform vec3 uLightColor;
        uniform vec3 uAmbientLight;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(uLightPosition - vPosition);
            float diff = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = uLightColor * diff * vColor;
            vec3 ambient = uAmbientLight * vColor;
            vec3 color = ambient + diffuse;
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Buffer untuk posisi
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var aPos = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    // Buffer untuk warna
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    // Buffer untuk normal
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    var aNormal = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // Uniforms untuk matriks transformasi
    var Pmatrix = gl.getUniformLocation(program, "uProj");
    var Vmatrix = gl.getUniformLocation(program, "uView");
    var Mmatrix = gl.getUniformLocation(program, "uModel");

    // Uniforms untuk pencahayaan
    var lightPosition = gl.getUniformLocation(program, "uLightPosition");
    var lightColor = gl.getUniformLocation(program, "uLightColor");
    var ambientLight = gl.getUniformLocation(program, "uAmbientLight");

    gl.uniform3fv(lightPosition, [1.0, 1.0, 1.0]); // Posisi cahaya
    gl.uniform3fv(lightColor, [1.0, 1.0, 1.0]); // Warna cahaya
    gl.uniform3fv(ambientLight, [0.2, 0.2, 0.2]); // Ambient light

    // Matriks perspektif dan tampilan
    var projMatrix = glMatrix.mat4.create();
    var modMatrix = glMatrix.mat4.create();
    var viewMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(projMatrix,
        glMatrix.glMatrix.toRadian(90), // FOV
        canvas.width / canvas.height, // Aspek rasio
        0.5, 10.0 // Near dan far clipping planes
    );

    glMatrix.mat4.lookAt(viewMatrix,
        [0.0, 0.0, 1.5], // Posisi kamera
        [0.0, 0.0, 0.0], // Kemana kamera menghadap
        [0.0, 1.0, 0.0]  // Up vector
    );

    var angle = glMatrix.glMatrix.toRadian(1);
    function render(time) {
        if (!freeze) {
            glMatrix.mat4.rotate(modMatrix, modMatrix, angle, [1.0, 1.0, 1.0]);
        }

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(Pmatrix, false, projMatrix);
        gl.uniformMatrix4fv(Vmatrix, false, viewMatrix);
        gl.uniformMatrix4fv(Mmatrix, false, modMatrix);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }

    render(1);
}

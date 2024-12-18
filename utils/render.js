"use strict";

function createRenderFunction(gl, meshProgramInfo, sharedUniforms, parts, objOffset, zNear, zFar, cameraPosition, cameraTarget, rotationXRef, rotationYRef) {
    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    return function render(time) {
        time *= 0.001; // convert to seconds

        // Resize canvas and set viewport
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 1.0, 1.0); // RGBA: (0, 0, 1) = blue
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        // Compute projection matrix
        const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        // Apply camera rotation
        const rotatedCameraPosition = m4.transformPoint(
            m4.yRotation(rotationYRef.value),
            m4.transformPoint(m4.xRotation(rotationXRef.value), cameraPosition)
        );

        const up = [0, 1, 0];
        const camera = m4.lookAt(rotatedCameraPosition, cameraTarget, up);
        const view = m4.inverse(camera);

        // Update shared uniforms
        sharedUniforms.u_view = view;
        sharedUniforms.u_projection = projection;

        gl.useProgram(meshProgramInfo.program);

        // Set uniforms
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

        // Compute world matrix
        let u_world = m4.yRotation(time); // Animasi rotasi objek
        u_world = m4.translate(u_world, ...objOffset);

        // Draw opaque parts
        for (const { bufferInfo, material } of parts) {
            if (material.opacity === 1.0) {
                webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
                webglUtils.setUniforms(meshProgramInfo, { u_world }, material);
                webglUtils.drawBufferInfo(gl, bufferInfo);
            }
        }

        // Enable blending and draw transparent parts
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        for (const { bufferInfo, material } of parts) {
            if (material.opacity < 1.0) {
                webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
                webglUtils.setUniforms(meshProgramInfo, { u_world }, material);
                webglUtils.drawBufferInfo(gl, bufferInfo);
            }
        }

        // Request the next frame
        requestAnimationFrame(render);
    };
}


"use strict";

// This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/

function parseMapArgs(unparsedArgs) {
    // TODO: handle options
    return unparsedArgs;
}

async function main() {
    const canvas = document.querySelector("#canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vs = await fetch('./shaders/vertexShader.glsl').then(res => res.text());
    const fs = await fetch('./shaders/fragmentShader.glsl').then(res => res.text());
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

    const objHref = './assets/FinalGelas.obj';
    const response = await fetch(objHref);
    const text = await response.text();
    const obj = parseOBJ(text);

    const baseHref = new URL(objHref, window.location.href);
    const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
        const matHref = new URL(filename, baseHref).href;
        const response = await fetch(matHref);
        return await response.text();
    }));

    const textures = {
        defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
    };

    const materials = processMaterials(parseMTL(matTexts.join('\n')), textures, baseHref, gl);

    defaultMaterial.diffuseMap = textures.defaultWhite;
    defaultMaterial.specularMap = textures.defaultWhite;

    const parts = obj.geometries.map(({ material, data }) => {
        if (data.color) {
            if (data.position.length === data.color.length) {
                data.color = { numComponents: 3, data: data.color };
            }
        } else {
            data.color = { value: [1, 1, 1, 1] };
        }

        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
        return {
            material: {
                ...defaultMaterial,
                ...materials[material],
            },
            bufferInfo,
        };
    });

    const { objOffset, cameraTarget, cameraPosition, zNear, zFar } = setupCamera(obj.geometries);

    const sharedUniforms = {
        u_lightDirection: m4.normalize([-1, 3, 5]),
        u_view: m4.identity(),
        u_projection: m4.identity(),
        u_viewWorldPosition: cameraPosition,
    };

    let rotationX = 0; // Rotasi di sekitar sumbu X
    let rotationY = 0; // Rotasi di sekitar sumbu Y
    const rotationXRef = { value: rotationX };
    const rotationYRef = { value: rotationY };

    // Panggil fungsi untuk setup event mouse
    setupMouseEvents(canvas, rotationXRef, rotationYRef);

    const render = createRenderFunction(
        gl,
        meshProgramInfo,
        sharedUniforms,
        parts,
        objOffset,
        zNear,
        zFar,
        cameraPosition,
        cameraTarget,
        rotationXRef,
        rotationYRef
    );


    requestAnimationFrame(render);
}
main();

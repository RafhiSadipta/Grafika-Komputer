"use strict";

const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: null,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    specularMap: null,
    shininess: 400,
    opacity: 1,
};

function processMaterials(materials, textures, baseHref, gl) {
    for (const material of Object.values(materials)) {
        Object.entries(material)
            .filter(([key]) => key.endsWith('Map'))
            .forEach(([key, filename]) => {
                let texture = textures[filename];
                if (!texture) {
                    const textureHref = new URL(filename, baseHref).href;
                    texture = createTexture(gl, textureHref);
                    textures[filename] = texture;
                }
                material[key] = texture;
            });
    }

    // Example modification for debugging
    Object.values(materials).forEach(m => {
        m.shininess = 25;
        m.specular = [3, 2, 1];
    });

    return materials;
}

"use strict";

function setupCamera(geometries) {
    const extents = getGeometriesExtents(geometries);
    const range = m4.subtractVectors(extents.max, extents.min);
    const objOffset = m4.scaleVector(
        m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
        -1
    );

    const cameraTarget = [0, 0, 0];
    const radius = m4.length(range) * 1.2;
    const cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]);

    const zNear = radius / 100;
    const zFar = radius * 3;

    return { objOffset, cameraTarget, cameraPosition, zNear, zFar };
}

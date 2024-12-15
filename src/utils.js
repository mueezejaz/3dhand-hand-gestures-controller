function distanceFinder(p1,p2) {
    return (
        Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    )
)};

function findMidpoint(point1, point2) {
    const midpoint = {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2,
        z: (point1.z + point2.z) / 2
    };
    return midpoint;
}

export {distanceFinder,findMidpoint}
import THREE from 'three';
var util={};

util.getDet = function(vec1, vec2) {
  return vec1.x * vec2.y - vec1.y * vec2.x;
}
util.getAngle = function(vec1, vec2) {
  return Math.acos( vec1.dot(vec2) / ( vec1.length() * vec2.length() ) );
}
util.transform3d = function(vec) {
  return new THREE.Vector3(vec.x, 0, vec.y);
}
util.findPermutation = function(a, b) {
  /* check if a in b */
  var bb = b.concat(b);
  // console.log(a,bb);
  for(var i = 0; i < bb.length; i++) {
    if(bb[i] === a[0]) {
      for(var j = 0; j < a.length; j++) {
        if( bb[ i + j ] !== a[j] ) {
          break;
        }
        if( j == a.length - 1 ) {
          return true;
        }
      }
    }
  }
  return false;
}

util.makeRectangle = function(vertices) {
  var geometry = new THREE.Geometry();
  geometry.vertices = vertices;

  geometry.faces.push(new THREE.Face3(0, 1, 2));
  geometry.faces.push(new THREE.Face3(0, 2, 3));
  geometry.computeFaceNormals();
  // geometry.computeBoundingBox();
  geometry.faceVertexUvs[0] = [];
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2( 0, 0 ),
    new THREE.Vector2( 1, 0 ),
    new THREE.Vector2( 1, 1 )
  ]);
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2( 0, 0 ),
    new THREE.Vector2( 1, 1 ),
    new THREE.Vector2( 0, 1 )
  ]);
  geometry.uvsNeedUpdate = true;

  return geometry;
}


util.makePlane = function(vertices) {

  var shape = new THREE.Shape(vertices);
  var geometry = new THREE.ShapeGeometry(shape);
  var plane = new THREE.Mesh(geometry,
    new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide
    }));
  // scope.floorPlane.visible = false;
  plane.rotation.set(Math.PI/2, 0, 0);
  plane.castShadow = true;
  plane.receiveShadow = true;

  return plane;
}
util.assignUVs = function( geometry ){

    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (var i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }
    console.log(geometry.faceVertexUvs);
    geometry.uvsNeedUpdate = true;

}


module.exports = util;

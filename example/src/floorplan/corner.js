import THREE from 'three';

var Corner = function(vector, idx, angles, adjCorners, adjVectors) {
  /*
    For each corner whose index is corner_idx, generate JSON data of
    vector, angles, adjCorners, adjVectors.

    vector:       THREE.Vector2 of itself
    angles:       We redefine 'angle' as a set of three vertices, the center of which is the corner itself.
                  The 'angle' made by three vertices and two edges should be less than 180 degree.
                  And we are gonnna find rooms(closed loops) based on these 'angle' objects.
                  If we search closed loops for each 'angle', then we can cover every room by the below fact.

                  Fact:  Every room has at least one 'angle' and an arbitrary 'angle' is contained in a unique room.

                  And accordingly, we can avoid repetition by check if an 'angle' is contained in a certain room already made.
    adjCorners:   adjacent corners of this corner. consists of indices of vertices.
    adjVectors:   adjacnet vectors from this corner. array of THREE.Vector2 's.

  */
  this.vector = vector;
  this.index = idx;
  this.angles = angles;
  this.adjCorners = adjCorners;
  this.adjVectors = adjVectors;
}

module.exports = Corner;

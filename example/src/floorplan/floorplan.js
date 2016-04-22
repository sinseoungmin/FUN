import THREE from 'three';
import Corner from './corner';
import util from '../util/util';

/*
  INPUT: data
    example:
    data = {
      corners: [0,0], [1,0], [1,1], [0,1]
      walls: [0,1], [1,2], [2,3], [3,0]
    }
  OUTPUT: Floorplan = {
    corners: Array(Corner)
    rooms: Array(Array(Corner))
    isolated_walls: Array(walls)
  }
*/

var Floorplan = function(data) {
  var scope = this;

  var corners = data.corners.map(corner => new THREE.Vector2().fromArray(corner));
  var walls = data.walls;
  var rooms = [];
  this.corners = [];
  this.isolated_walls = [];

  corners.map( (corner, corner_idx) => {
    this.corners.push(makeCorners(corner, corner_idx));
  });
  this.corners.map( corner => {
    corner.angles.map( angle => {
      let overlapped = false;
      rooms.map( room => {
        if(util.findPermutation(angle,room.map(v=>v.index))) overlapped = true;
      });
      if(!overlapped){
        let loop = findRooms(this.corners, angle);

        if(loop){
          let overlapped2 = false;
          rooms.map( (room, idx) => {
            if(util.findPermutation(room.map(v=>v.index),loop.map(v=>v.index))){
              rooms[idx] = room.length < loop.length? loop : room; 
              overlapped2 = true;
            }
          });
          if(!overlapped2)  rooms.push(loop);

        }
      }
    });
  });

  walls.map( wall => {
    let contained = false;
    rooms.map( room => {
      if(util.findPermutation(wall, room.map(v=>v.index))){
        contained = true;
      }
    });
    if(!contained) {
      this.isolated_walls.push(wall);
    }

  });

  this.rooms = rooms;

  function findRooms(corners, angle){

    var loop = [];

    findLoop(corners[angle[2]], corners[angle[1]], [corners[angle[0]], corners[angle[1]]], loop);

    loop.push(corners[angle[1]]);
    loop = loop.reverse();

    let loop_idx = loop.map(v=>v.index);


    if( loop.length > 1 ){
      var loop_angle = 0;
      loop.map( ( corner , cor_idx) => {
        let this_loop_vector = corner.vector.clone().sub(loop[(cor_idx - 1 + loop.length ) % loop.length].vector);
        let next_loop_vector = loop[(cor_idx + 1) % loop.length].vector.clone().sub(corner.vector);
        loop_angle += util.getAngle(this_loop_vector, next_loop_vector) * (util.getDet(this_loop_vector, next_loop_vector) > 0 ? 1 : -1);
      });
      if(loop_angle > 0)
        return loop;
    }
    else return false;
  }

  function findLoop(corner, prev_corner, end_vector, loop ) {
    var next_corners = findNextCorner(corner, prev_corner.index);
    if(next_corners.length == 0) {
      next_corners = [prev_corner.index];
    }
    if( corner.index == end_vector[0].index && next_corners[0] == end_vector[1].index ){
      loop.push( corner );
      return corner;
    }
    var next_corner = findLoop( scope.corners[next_corners[0]], corner, end_vector, loop);
    loop.push( corner );
    return corner;
  }


  function findNextCorner(corner, prev_corner) {
    let prev_vector;
    let next_vectors = [];
    let next_corners = [];
    for( var j = 0 ; j < corner.adjCorners.length ; j++ ) {
      if( corner.adjCorners[j] == prev_corner ) prev_vector = corner.adjVectors[j];
      else {
        next_vectors.push(corner.adjVectors[j]);
      }
    }
    next_vectors.sort( (vec1, vec2) =>
      ( prev_vector.angle() - vec1.angle() + (2 * Math.PI)) % (2 * Math.PI)
        - ( prev_vector.angle() - vec2.angle() + (2 * Math.PI)) % (2 * Math.PI) )
    next_vectors.map( next_vector => {
      next_corners.push(corner.adjCorners[ corner.adjVectors.indexOf(next_vector) ]);
    });
    return next_corners;
  }


  function makeCorners(corner, corner_idx){
    let adjWalls = walls.filter(wall => wall.indexOf(corner_idx) != -1 );

    if ( adjWalls.length < 2 ) {
      return new Corner(corner, corner_idx, [], [], []);
    }
    let adjCorners = [];
    let adjVectors = [];


    adjWalls.map(adjWall => {
      let adjCorner = adjWall.filter( adjCorner => adjCorner !== corner_idx)[0];
      adjCorners.push( adjCorner );
      let adjVector = new THREE.Vector2();
      adjVector.subVectors( corners[adjCorner], corner );
      adjVectors.push( adjVector );
    });

    adjCorners.sort( (a, b) => {
      let avec = new THREE.Vector2();
      let bvec = new THREE.Vector2();
      avec.subVectors( corners[a], corner );
      bvec.subVectors( corners[b], corner );
      return avec.angle() > bvec.angle();
    })
    adjVectors.sort( (a, b) => a.angle() > b.angle());


    let angles = [];
    adjVectors.map( (adjVector, idx) => {
      let next_adjVector = adjVectors[ (idx + 1) % adjVectors.length ];
      // console.log(adjVector, next_adjVector);
      if(util.getDet(adjVector, next_adjVector) > 0) {
        angles.push([adjCorners[ (idx + 1) % adjCorners.length ], corner_idx, adjCorners[ idx ]]);
      }
    });

    return new Corner(corner, corner_idx, angles, adjCorners, adjVectors);
  }
}

module.exports = Floorplan;

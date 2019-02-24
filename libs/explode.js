// Based on explode.js component for A-Frame https://github.com/dmarcos/a-invaders
Explode = function(scene, object3D) {

  if ( object3D instanceof THREE.Group ) {
    console.log('converting', object3D);
    if ( object3D.children && object3D.children.length === 1 &&
        object3D.children[0] instanceof THREE.Mesh ) {
      object3D = object3D.children[0];
    } else {
      console.warn('Cannot explode THREE.Group', object3D);
      return;
    }

  }

  if ( object3D.geometry instanceof THREE.BufferGeometry ) {
    console.log('converting bufferGeometry...', object3D);
    var geometry = new THREE.Geometry().fromBufferGeometry( object3D.geometry );
    object3D.geometry = geometry;
    console.log('done');
  }

  if ( object3D.geometry instanceof THREE.BufferGeometry ) {
    console.warn('Must convert BufferGeometry to Geometry before exploding', object3D);
    return;
  }

    var duration = 8000;

    // explode geometry into objects
    var pieces = explode(object3D.geometry, object3D.material);

    object3D.material.visible = false;

    // animate objects
    for ( var i = 0; i < pieces.children.length; i ++ ) {

      var object = pieces.children[ i ];

      object.geometry.computeFaceNormals();
      var normal = object.geometry.faces[0].normal.clone();
      var targetPosition = object.position.clone().add(normal.multiplyScalar(300));
      new TWEEN.Tween( object.position )
        .to( targetPosition, duration )
        .onComplete( deleteBox )
        .start();

      object.material.opacity = 0;
      new TWEEN.Tween( object.material )
        .to( { opacity: 1 }, duration )
        .start();

      var rotation = 2 * Math.PI;
      var targetRotation = { x: rotation, y: rotation, z:rotation };
      new TWEEN.Tween( object.rotation )
        .to( targetRotation, duration )
        .start();

    }

    function deleteBox() {
      object3D.remove( pieces )
      scene.remove( object3D );
    }

    object3D.add(pieces);

    function explode( geometry, material ) {
      var pieces = new THREE.Group();
      var material = material.clone();
      material.side = THREE.DoubleSide;

      for (var i = 0; i < geometry.faces.length; i ++) {
        var face = geometry.faces[ i ];

        var vertexA = geometry.vertices[ face.a ].clone();
        var vertexB = geometry.vertices[ face.b ].clone();
        var vertexC = geometry.vertices[ face.c ].clone();

        var geometry2 = new THREE.Geometry();
        geometry2.vertices.push( vertexA, vertexB, vertexC );
        geometry2.faces.push( new THREE.Face3( 0, 1, 2 ) );

        var mesh = new THREE.Mesh( geometry2, material );
        mesh.position.sub( geometry2.center() );
        pieces.add( mesh );
      }
      //sort the pieces
      pieces.children.sort( function ( a, b ) {
        return a.position.z - b.position.z;
        //return a.position.x - b.position.x;     // sort x
        //return b.position.y - a.position.y;   // sort y
      } );
      pieces.rotation.set( 0, 0, 0 )
      return pieces;
    }

};

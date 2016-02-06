'use strict'

function checkFloatTextures() {

	var ctx = document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
	return ctx.getExtension( 'OES_texture_half_float' );

}

function check() {

	checkFloatTextures();
	init();

}

if( Detector.webgl ) {
	window.addEventListener( 'load', check, false );
} else {

}

var container;

var scene, camera, light, renderer, controls;
var geometry, cube, mesh, material, shadowMaterial, plane;
var timer, start, prevTime;

var data, texture, points;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var sim;
var nOffset = new THREE.Vector3( 0, 0, 0 );
var tmpVector = new THREE.Vector3( 0, 0, 0 );

var proxy

var shadowBuffer, shadowBufferSize, shadowCamera, shadowDebug

var colors = [
	0xed6a5a,
	0xf4f1bb,
	0x9bc1bc,
	0x5ca4a9,
	0xe6ebe0,
	0xf0b67f,
	0xfe5f55,
	0xd6d1b1,
	0xc7efcf,
	0xeef5db,
	0x50514f,
	0xf25f5c,
	0xffe066,
	0x247ba0,
	0x70c1b3
];

colors = [ 0xffffff ];

var scale = 0, nScale = 1;

var params = {
	type: 2,
	spread: 4,
	factor: .1,
	evolution: .5,
	rotation: .5,
	radius: 2,
	pulsate: false,
	scaleX: .01,
	scaleY: 6.1,
	scaleZ: 10,
	scale: .6
};

var cardTexture;
var cardBackTexture;

var gui = new dat.GUI();

function init() {

	container = document.getElementById( 'container' );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xffffff );
	container.appendChild( renderer.domElement );

	var image = document.createElement( 'img' );

	image.src = "data:image/png;base64,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";

	var texture = new THREE.Texture();
	texture.image = image;
	image.onload = function() {
		cardTexture.needsUpdate = true;
		// cardBackTexture.image = true;
	};


	cardTexture = new THREE.Texture();
	cardTexture.image = image;
	cardTexture.wrapS = cardTexture.wrapT = THREE.RepeatWrapping;
	cardTexture.anisotropy = 8;
	// 419x257

	// cardBackTexture = new THREE.Texture();
	// cardBackTexture.image = image;
	// cardBackTexture.wrapS = cardBackTexture.wrapT = THREE.RepeatWrapping;
	// cardBackTexture.anisotropy = 8;

	plane = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshNormalMaterial( { side: THREE.DoubleSide, visible: true } ) );
	scene = new THREE.Scene();
	plane.material.visible = false;

	scene.add( plane );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .01, 100 );
	scene.add( camera );
	camera.position.z = 8;

	var s = 15;
	shadowCamera = new THREE.OrthographicCamera( -s, s, s, -s, .1, 20 );
	shadowCamera.position.set( 10, 4, 10 );
	shadowCamera.lookAt( scene.position );

	var light = new THREE.Mesh( new THREE.CylinderGeometry( 5, 6, 1, 36 ), new THREE.MeshBasicMaterial( { color: 0xffffff }) );
	light.position.copy( shadowCamera.position );
	scene.add( light );
	light.lookAt( scene.position );
	light.rotation.y += Math.PI / 2;
	light.rotation.z += Math.PI / 2;

	var encasing = new THREE.Mesh( new THREE.CylinderGeometry( 5.1, 6.1, .9, 36 ), new THREE.MeshBasicMaterial( { color: 0x101010 }) );
	encasing.position.copy( shadowCamera.position ).multiplyScalar( 1.01 );
	scene.add( encasing );
	encasing.lookAt( scene.position );
	encasing.rotation.y += Math.PI / 2;
	encasing.rotation.z += Math.PI / 2;

	var b = new THREE.CameraHelper( shadowCamera );
	//scene.add( b );

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	var size = parseInt( window.location.hash.substr(1) ) || 256;
	sim = new Simulation( renderer, size, size );

	shadowBufferSize = 1024;
	shadowBuffer = new THREE.WebGLRenderTarget( shadowBufferSize, shadowBufferSize, {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.LinearMipMapLinear,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		stencilBuffer: false
	} );

	var geometry = new THREE.BufferGeometry();

	var positionsLength = sim.width * sim.height * 3 * 18;
	var positions = new Float32Array( positionsLength );

	var p = 0;
	for( var j = 0; j < positionsLength; j += 3 ) {
		positions[ j ] = p;
		positions[ j + 1 ] = 0;
		positions[ j + 2 ] = 0;
		p++;
	}

	var cardsLength = sim.width * sim.height * 3 * 18;
	var cards = new Float32Array( cardsLength );

	var p = 0;
	for( var j = 0; j < cardsLength; j += 3 * 18 ) {

		var cx = Math.floor( Math.random() * 4 );
		var cy = Math.floor( Math.random() * 13 );
		var cz = Math.random() < 0.5 ? 0 : 1;

		for ( var k = 0; k < 3 * 18; k += 3 ) {

			cards[ j + k] = cx;
			cards[ j + k + 1 ] = cy;
			cards[ j + k + 2 ] = cz;

		}
		p++;
	}

	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'card', new THREE.BufferAttribute( cards, 3 ) );

	var diffuseData = new Uint8Array( size * size * 4 );
	for( var j = 0; j < size * size * 4; j += 4 ) {
		var c = new THREE.Color( colors[ ~~( Math.random() * colors.length ) ] );
		diffuseData[ j + 0 ] = c.r * 255;
		diffuseData[ j + 1 ] = c.g * 255;
		diffuseData[ j + 2 ] = c.b * 255;
	}

	var diffuseTexture = new THREE.DataTexture( diffuseData, size, size, THREE.RGBAFormat );
	diffuseTexture.minFilter = THREE.NearestFilter;
	diffuseTexture.magFilter = THREE.NearestFilter;
	diffuseTexture.needsUpdate = true;

	material = new THREE.RawShaderMaterial( {

		uniforms: {

			texture: { type: "t", value: cardTexture },
			// textureBack: { type: "t", value: cardBackTexture },
			map: { type: "t", value: sim.rtTexturePos },
			prevMap: { type: "t", value: sim.rtTexturePos },
			diffuse: { type: 't', value: diffuseTexture },
			width: { type: "f", value: sim.width },
			height: { type: "f", value: sim.height },

			timer: { type: 'f', value: 0 },
			spread: { type: 'f', value: 4 },
			boxScale: { type: 'v3', value: new THREE.Vector3() },
			meshScale: { type: 'f', value: 1 },

			depthTexture: { type: 't', value: shadowBuffer },
			shadowV: { type: 'm4', value: new THREE.Matrix4() },
			shadowP: { type: 'm4', value: new THREE.Matrix4() },
			resolution: { type: 'v2', value: new THREE.Vector2( shadowBufferSize, shadowBufferSize ) },
			lightPosition: { type: 'v3', value: new THREE.Vector3() },
			projector: { type: 't', value: THREE.ImageUtils.loadTexture( 'spotlight.jpg' ) },

			boxVertices: { type: '3fv', value: [

				-1,-1,-1,
				-1,-1, 1,
				-1, 1, 1,

				-1,-1,-1,
				-1, 1, 1,
				-1, 1,-1,

				1, 1,-1,
				1,-1,-1,
				-1,-1,-1,

				1, 1,-1,
				-1,-1,-1,
				-1, 1,-1,

				1,-1, 1,
				-1,-1, 1,
				-1,-1,-1,

				1,-1, 1,
				-1,-1,-1,
				1,-1,-1,

			] },
			boxNormals: { type: '3fv', value: [

				1, 0, 0,
				0, 0, 1,
				0, 1, 0

			] },

		},
		vertexShader: document.getElementById( 'vs-particles' ).textContent,
		fragmentShader: document.getElementById( 'fs-particles' ).textContent,
		side: THREE.DoubleSide,
		shading: THREE.FlatShading
	} );

	mesh = new THREE.Mesh( geometry, material );

	shadowMaterial = new THREE.RawShaderMaterial( {

		uniforms: {

			map: { type: "t", value: sim.rtTexturePos },
			prevMap: { type: "t", value: sim.rtTexturePos },
			width: { type: "f", value: sim.width },
			height: { type: "f", value: sim.height },

			timer: { type: 'f', value: 0 },
			boxScale: { type: 'v3', value: new THREE.Vector3() },
			meshScale: { type: 'f', value: 1 },

			shadowV: { type: 'm4', value: new THREE.Matrix4() },
			shadowP: { type: 'm4', value: new THREE.Matrix4() },
			resolution: { type: 'v2', value: new THREE.Vector2( shadowBufferSize, shadowBufferSize ) },
			lightPosition: { type: 'v3', value: new THREE.Vector3() },

			boxVertices: { type: '3fv', value: [

				-1,-1,-1,
				-1,-1, 1,
				-1, 1, 1,

				-1,-1,-1,
				-1, 1, 1,
				-1, 1,-1,

				1, 1,-1,
				1,-1,-1,
				-1,-1,-1,

				1, 1,-1,
				-1,-1,-1,
				-1, 1,-1,

				1,-1, 1,
				-1,-1, 1,
				-1,-1,-1,

				1,-1, 1,
				-1,-1,-1,
				1,-1,-1,

			] },
			boxNormals: { type: '3fv', value: [

				1, 0, 0,
				0, 0, 1,
				0, 1, 0

			] },

		},
		vertexShader: document.getElementById( 'vs-particles' ).textContent,
		fragmentShader: document.getElementById( 'fs-particles-shadow' ).textContent,
		side: THREE.DoubleSide
	} );

	scene.add( mesh );

	proxy = new THREE.Mesh( new THREE.IcosahedronGeometry( .2, 2 ), new THREE.MeshNormalMaterial() );
	//scene.add( proxy );
	proxy.material.visible = false;

	var center = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshNormalMaterial() );
	//scene.add( center );

	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	onWindowResize();

	var isIntersect = false;

	window.addEventListener( 'mousemove', function( e ) {

		mouse.x = ( e.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( e.clientY / renderer.domElement.clientHeight ) * 2 + 1;

	});

	window.addEventListener( 'mousedown', function( e ) {

		nScale = 2;

	});

	window.addEventListener( 'mouseup', function( e ) {

		nScale = .5;

	});

	window.addEventListener( 'keydown', function( e ) {

		if( e.keyCode === 32 ) {
			sim.simulationShader.uniforms.active.value = 1 - sim.simulationShader.uniforms.active.value;
		}

	});

	window.addEventListener( 'touchmove', function( e ) {

		mouse.x = ( e.touches[ 0 ].clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( e.touches[ 0 ].clientY / renderer.domElement.clientHeight ) * 2 + 1;

	});

	shadowDebug = new THREE.Mesh( new THREE.PlaneGeometry( 10,10 ), new THREE.MeshBasicMaterial( { map: shadowBuffer, side: THREE.DoubleSide } ) );
	//scene.add( shadowDebug );

	//gui.add( params, 'type', { 'none': 0, 'single': 1, 'multisample': 2, 'poisson': 3 } );
	//gui.add( params, 'spread', 0, 10 );
	gui.add( params, 'factor', 0.1, 1 );
	gui.add( params, 'evolution', 0, 1 );
	gui.add( params, 'rotation', 0, 1 );
	gui.add( params, 'radius', 0, 4 );
	gui.add( params, 'pulsate' );
	gui.add( params, 'scaleX', .0001, 10 );
	gui.add( params, 'scaleY', .1, 10 );
	gui.add( params, 'scaleZ', .1, 10 );
	gui.add( params, 'scale', .1, 2 );

	animate();

}

function animate() {

	render();
	requestAnimationFrame( animate );

}

var t = new THREE.Clock();
var m = new THREE.Matrix4();

var tmpVector = new THREE.Vector3();

function render() {

	controls.update();

	scale += ( nScale - scale ) * .01;

	plane.lookAt( camera.position );

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObject( plane );

	if( intersects.length ) {
		nOffset.copy( intersects[ 0 ].point );
		proxy.position.copy( nOffset );
	}

	var delta = t.getDelta() * 5;
	var time = t.elapsedTime;

	tmpVector.copy( nOffset );
	tmpVector.sub( sim.simulationShader.uniforms.offset.value );
	tmpVector.multiplyScalar( .1 );
	sim.simulationShader.uniforms.offset.value.add( tmpVector );
	sim.simulationShader.uniforms.factor.value = params.factor;
	sim.simulationShader.uniforms.evolution.value = params.evolution;
	sim.simulationShader.uniforms.radius.value = params.pulsate ? ( .5 + .5 * Math.cos( time ) ) * params.radius : params.radius;

	if( sim.simulationShader.uniforms.active.value ) {
		mesh.rotation.y = params.rotation * time;
	}

	m.copy( mesh.matrixWorld );
	sim.simulationShader.uniforms.inverseModelViewMatrix.value.getInverse( m );
	sim.simulationShader.uniforms.genScale.value = scale;

	if( sim.simulationShader.uniforms.active.value === 1 ) {
		sim.render( time, delta );
	}
	material.uniforms.map.value = shadowMaterial.uniforms.map.value = sim.targets[ sim.targetPos ];
	material.uniforms.prevMap.value = shadowMaterial.uniforms.prevMap.value = sim.targets[ 1 - sim.targetPos ];

	material.uniforms.spread.value = params.spread;
	material.uniforms.timer.value = shadowMaterial.uniforms.timer.value = time;
	material.uniforms.boxScale.value.set( params.scaleX, params.scaleY, params.scaleZ );
	shadowMaterial.uniforms.boxScale.value.set( params.scaleX, params.scaleY, params.scaleZ );
	material.uniforms.meshScale.value = params.scale;
	shadowMaterial.uniforms.meshScale.value = params.scale;

	renderer.setClearColor( 0 );
	mesh.material = shadowMaterial;
	renderer.render( scene, shadowCamera, shadowBuffer );

	tmpVector.copy( scene.position );
	tmpVector.sub( shadowCamera.position );
	tmpVector.normalize();

	material.uniforms.shadowP.value.copy( shadowCamera.projectionMatrix );
	material.uniforms.shadowV.value.copy( shadowCamera.matrixWorldInverse );
	material.uniforms.lightPosition.value.copy( shadowCamera.position );

	renderer.setClearColor( 0xffffff );
	mesh.material = material;
	renderer.render( scene, camera );

}

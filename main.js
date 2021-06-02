import {CMap1, CMap2, Graph} from './CMapJS/CMap/CMap.js';
import Renderer from './CMapJS/Rendering/Renderer.js';
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import Grid2D from './Grid2D.js';
import Grid3D from './Grid3D.js';
import {MCLookUpTable} from './MCLookup.js';



const scene = new THREE.Scene();
scene.background = new THREE.Color(0xAAAAAA);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000.0);
camera.position.set(0, 0, 2);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.enablePan = false;

window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

let ambientLight = new THREE.AmbientLight(0xAAAAFF, 0.5);
scene.add(ambientLight);
let pointLight0 = new THREE.PointLight(0x3137DD, 5);
pointLight0.position.set(10,8,5);
scene.add(pointLight0);

let grid = new Grid2D;
window.grid = grid;

const vertexValue = grid.addAttribute(grid.vertex, "value");
const vertexPos = grid.getAttribute(grid.vertex, "position");

const radius = 0.85;
function circleVal(pos) {
	return pos.x * pos.x + pos.y * pos.y - radius * radius;
}

function sphereVal(pos) {
	return pos.x * pos.x + pos.y * pos.y + pos.z * pos.z - radius * radius;
}

grid.foreach(grid.vertex, vd => {
	let vpos = vertexPos[grid.cell(grid.vertex, vd)];
	// vertexValue[grid.cell(grid.vertex, vd)] = circleVal(vpos);
	vertexValue[grid.cell(grid.vertex, vd)] = -1;
});

let gridRenderer = new Renderer(grid);
gridRenderer.vertices.create({size: 0.0125});
gridRenderer.vertices.addTo(scene);
gridRenderer.edges.create({size: 0.75});
gridRenderer.edges.addTo(scene);

const vertexPosColor = new THREE.Color(0x00FF00);
const vertexNegColor = new THREE.Color(0xFF0000);
const vertexIId = grid.getAttribute(grid.vertex, "instanceId");

grid.foreach(grid.vertex, vd => {
	const viid = vertexIId[grid.cell(grid.vertex, vd)];
	const val = vertexValue[grid.cell(grid.vertex, vd)];
	gridRenderer.vertices.mesh.setColorAt(viid, val > 0 ? vertexPosColor : vertexNegColor);
});
gridRenderer.vertices.mesh.instanceColor.needsUpdate = true;


function toggleVertexVal(vd) {
	vertexValue[grid.cell(grid.vertex, vd)] *= -1;
	const viid = vertexIId[grid.cell(grid.vertex, vd)];
	gridRenderer.vertices.mesh.setColorAt(viid, vertexValue[grid.cell(grid.vertex, vd)] > 0 ? vertexPosColor : vertexNegColor);
	gridRenderer.vertices.mesh.instanceColor.needsUpdate = true;
}

const raycaster = new THREE.Raycaster;
const mouse = new THREE.Vector2;
function setMouse(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

const selectMouseDown = function(event) {
	setMouse(event);
	if(event.button == 2){
		raycaster.setFromCamera(mouse, camera);
		const inter = raycaster.intersectObject(gridRenderer.vertices.mesh)[0];
		console.log(inter);
		if(inter) {
			let viid = inter.instanceId;
			let vd = gridRenderer.vertices.mesh.vd[viid];
			toggleVertexVal(vd);
		}
	}
}
window.addEventListener( 'pointerdown', selectMouseDown );


function update ()
{

}

function render()
{
	renderer.render(scene, camera);
}

function mainloop()
{
    update();
    render();
    requestAnimationFrame(mainloop);
}

mainloop();


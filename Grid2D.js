import { CMap2 } from './CMapJS/CMap/CMap.js';
import * as THREE from './CMapJS/Libs/three.module.js';

/// grid cell :
///		vertices		edges
///		3 ------ 2		--- 2 ---
///     |        |		|		|
///		|	     |		3		1
///		|	     |		|		|
///		0 ------ 1		--- 0 --- 


export default function Grid2D (params = {}) {
	let { xmin = -1, xmax = 1, 
		ymin = -1, ymax = 1,
		xdivs = 10,	ydivs = 10 } = params;

	CMap2.call(this);

	const grid = new Array(xdivs * ydivs);
	this.createEmbedding(this.face);
	const cellVertices = this.addAttribute(this.face, "cellVertices");

	const hash = (i, j) =>  {return i + j * ydivs};

	this.getCell = function (i, j) {
		return grid[hash(i, j)];
	};

	this.getVertex = function (i, j, v) {
		return this.cellVertex(this.getCell(i, j), v);
	};

	this.cellVertex = function(fd, v) {
		return cellVertices[this.cell(this.face, fd)][v];
	};

	this.getEdge = this.getVertex;
	this.cellEdge = this.cellVertex;

	(() => {
		const xstep = (xmax - xmin) / xdivs;
		const ystep = (ymax - ymin) / ydivs;

		for(let j = 0; j < ydivs; ++j) {
			for(let i = 0; i < xdivs; ++i) {
				const fd00 = this.addFace1(4);
				grid[i + j * xdivs] = fd00;

				const vertices = [fd00];
				vertices[1] = this.phi1[fd00];
				vertices[2] = this.phi1[vertices[1]];
				vertices[3] = this.phi_1[fd00];
				cellVertices[this.cell(this.face, fd00)] = vertices;

				if(i > 0) {
					const ed00 = this.getEdge(i, j, 3);
					const ed10 = this.getEdge(i - 1, j, 1);
					this.sewPhi2(ed00, ed10);
				}
				if(j > 0) {
					const ed00 = this.getEdge(i, j, 0);
					const ed10 = this.getEdge(i, j - 1, 2);
					this.sewPhi2(ed00, ed10);
				}
			}
		}

		this.close(true);
		this.setEmbeddings(this.vertex);
		const position = this.addAttribute(this.vertex, "position");

		let vd = this.getVertex(0, 0, 0);
		position[this.cell(this.vertex, vd)] = new THREE.Vector3(xmin, ymin, 0);

		for(let i = 0; i < xdivs; ++i) {
			const pos1 = new THREE.Vector3(xmin + xstep * (i + 1), ymin, 0);
			position[this.cell(this.vertex, this.getVertex(i, 0, 1))] = pos1;
		}

		for(let j = 0; j < ydivs; ++j) {
			position[this.cell(this.vertex, this.getVertex(0, j, 3))] = new THREE.Vector3(xmin, ymin + ystep * (j+1), 0);
			for(let i = 0; i < xdivs; ++i) {
				const pos2 = new THREE.Vector3(xmin + xstep * (i + 1), ymin + xstep * (j + 1), 0);
				position[this.cell(this.vertex, this.getVertex(i, j, 2))] = pos2;
			}
		}
	})();

	return this;
}
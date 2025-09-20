"use strict";

// type 1 = stdout, type 2 = stderr
function showDevMessage(message = "", type = 2) {
	let globalContainer = document.getElementById("message-log");

	if (!globalContainer) {
		globalContainer = document.createElement("div");
		globalContainer.id = "message-log";
		globalContainer.style.cssText = "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; max-width: 100vw; padding: 1rem; overflow: auto; pointer-events: none;";
		document.body.appendChild(globalContainer);
	}

	const fg = type === 2 ? "#ff0000" : "#d4d4d4";
	const bg = type === 2 ? "#1e0000" : "#1e1e1e";

	const messageContainer = document.createElement("pre");
	messageContainer.textContent = message;
	messageContainer.style.cssText = `padding: 1rem; border: 0.0625rem solid ${fg}; font-family: Consolas, ui-monospace, monospace; font-size: 0.875rem; line-height: 1.1875rem; color: ${fg}; background-color: ${bg}; white-space: pre-wrap; word-break: break-all; pointer-events: auto;`;

	const closeMessageButton = document.createElement("button");
	closeMessageButton.textContent = "Dismiss";
	closeMessageButton.style.cssText = `display: block; padding: 0.5rem; border: 0.0625rem solid ${fg}; margin-top: 1rem; font-family: Consolas, ui-monospace, monospace; font-size: 0.875rem; line-height: 1; color: ${fg}; background-color: transparent; cursor: pointer;`;

	closeMessageButton.addEventListener("click", () => {
		closeMessageButton.remove();
		messageContainer.remove();
	});

	messageContainer.appendChild(closeMessageButton);
	globalContainer.appendChild(messageContainer);
	messageContainer.scrollIntoView();
}

window.addEventListener("error", (e) => {
	const msg = `${e.message}\n    at ${e.filename}:${e.lineno}:${e.colno}`;
	showDevMessage(msg, 2);
	setTimeout(() => console.error(msg), 2000);
});

const bg = new Image();
bg.src = "assets/backgrounds/background_000.png";
const floor = new Image();
floor.src = "assets/floors/floor_000.png";
const floorLine = new Image();
floorLine.src = "assets/lines/line_000.png";
const playerImg = new Image();
playerImg.src = "assets/cube_000.png";
const spritesheet0 = new Image();
spritesheet0.src = "assets/spritesheets/spritesheet_000.png";

const blockSpritesheet = new Image();
blockSpritesheet.src = "assets/spritesheets/block_spritesheet.png";

const blockSpritesheetOffsets = {
	"1": {
		x: 0,
		y: 0,
		width: 122,
		height: 122
	},
	"2": {
		x: 128,
		y: 0,
		width: 122,
		height: 122
	},
	"3": {
		x: 256,
		y: 0,
		width: 122,
		height: 122
	},
	"4": {
		x: 384,
		y: 0,
		width: 122,
		height: 122
	},
	"5": {
		x: 512,
		y: 0,
		width: 122,
		height: 122
	},
	"6": {
		x: 640,
		y: 0,
		width: 122,
		height: 122
	},
	"7": {
		x: 768,
		y: 0,
		width: 122,
		height: 122
	},
	"8": {
		x: 896,
		y: 0,
		width: 122,
		height: 122
	},
	"9": {
		x: 0,
		y: 128,
		width: 122,
		height: 122
	},
	"10": {
		x: 128,
		y: 128,
		width: 122,
		height: 56
	}
};

const spike0Img = new Image();
spike0Img.src = "assets/spikes/spike_000.png";
const spike1Img = new Image();
spike1Img.src = "assets/spikes/spike_001.png";
const spike2Img = new Image();
spike2Img.src = "assets/spikes/spike_002.png";
const spike3Img = new Image();
spike3Img.src = "assets/spikes/spike_003.png";

const pit0Img = new Image();
pit0Img.src = "assets/spikes/pit_000.webp";

function aabbCollision(a, b) {
	const aHWidth = a.width * 0.5;
	const bHWidth = b.width * 0.5;
	const aHHeight = a.height * 0.5;
	const bHHeight = b.height * 0.5;

	return (
		a.x - aHWidth < b.x + bHWidth &&
		a.x + aHWidth > b.x - bHWidth &&
		a.y - aHHeight < b.y + bHHeight &&
		a.y + aHHeight > b.y - bHHeight
	);
}

function pointToAABBCollision(point, aabb) {
	const aabbHWidth = aabb.width * 0.5;
	const aabbHHeight = aabb.height * 0.5;

	return (
		point.x < aabb.x + aabbHWidth &&
		point.x > aabb.x - aabbHWidth &&
		point.y < aabb.y + aabbHHeight &&
		point.y > aabb.y - aabbHHeight
	);
}

class Camera {
	constructor(x, y, zoom) {
		this.x = x;
		this.y = y;
		this.zoom = zoom;
	}

	applyToContext(context, width, height) {
		context.translate(width * 0.5, height * 0.5);
		context.scale(this.zoom, this.zoom);
		context.translate(-this.x, -this.y);
	}
}

let currentObjType = 0;
let currentObjRotation = 0;

const selectorValues = [
	{ id: 1, name: "Block 000" },
	{ id: 2, name: "Spike" },
	{ id: 3, name: "Short Spike" },
	// { id: 4, name: "Small Spike" },
	// { id: 5, name: "Smallest Spike" },
	{ id: 6, name: "Pit Spikes" },
	{ id: 7, name: "Grid Block" },
	{ id: 8, name: "Grid Block Corner" },
	{ id: 9, name: "Grid Block Side" },
	{ id: 10, name: "Grid Block Corner Fill" },
	{ id: 11, name: "Grid Block Corner Hollow" },
	{ id: 12, name: "Grid Block Hollow" },
	{ id: 13, name: "Grid Block Pillar" },
	{ id: 14, name: "Grid Block Pillar Cap" },
	{ id: 16, name: "Cube Portal" },
	{ id: 17, name: "Ship Portal" },
	{ id: 15, name: "Block Platform" }
];

const objectSelector = document.createElement("select");

objectSelector.addEventListener("input", function () {
	currentObjType = parseInt(objectSelector.value);
});

for (let i = 0; i < selectorValues.length; i++) {
	const value = selectorValues[i];
	const option = document.createElement("option");
	option.value = i;
	option.textContent = value.name;
	objectSelector.appendChild(option);
}

objectSelector.style.position = "fixed";
objectSelector.style.bottom = "1rem";
objectSelector.style.left = "1rem";

document.body.appendChild(objectSelector);

const exportButton = document.createElement("button");
exportButton.textContent = "Export Level";
exportButton.style.position = "fixed";
exportButton.style.bottom = "1rem";
exportButton.style.right = "1rem";

document.body.appendChild(exportButton);

const importButton = document.createElement("button");
importButton.textContent = "Import Level";
importButton.style.position = "fixed";
importButton.style.top = "1rem";
importButton.style.right = "1rem";

document.body.appendChild(importButton);

/**
 * @type { HTMLCanvasElement }
 */
const scene = document.getElementById("scene");
const ctx = scene.getContext("2d");

let vWidth = window.innerWidth;
let vHeight = window.innerHeight;
let hVWidth = vWidth * 0.5;
let hVHeight = vHeight * 0.5;

let dpr = window.devicePixelRatio;

const GRID_SIZE = 32;
const HALF_GRID_SIZE = GRID_SIZE * 0.5;
const INV_GRID_SIZE = 1 / GRID_SIZE;

const tau = 2 * Math.PI;
const halfPi = 0.5 * Math.PI;
const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;

function snapNumberToGrid(num, gridSize) {
	return Math.floor(num / gridSize) * gridSize;
}

let rAFIdx = -1;

const keysDown = {};

function resizeCanvas() {
	vWidth = Math.floor(window.innerWidth);
	vHeight = Math.floor(window.innerHeight);
	hVWidth = vWidth * 0.5;
	hVHeight = vHeight * 0.5;
	dpr = window.devicePixelRatio;
	scene.width = Math.floor(vWidth * dpr);
	scene.height = Math.floor(vHeight * dpr);
	scene.style.width = vWidth + "px";
	scene.style.height = vHeight + "px";
	// ctx.imageSmoothingEnabled = false;
}

resizeCanvas();

const camera = new Camera(256, -64, 1);

const mouse = {
	x: 0,
	y: 0,
	down: false,
	rightDown: false
};

const level = {
	blocks: [],
	spikes: [],
	portals: []
};

const defaultValues = {
	width: GRID_SIZE,
	height: GRID_SIZE,
	type: 1,
	rotation: 0,
	hitbox: true
};

const sectionParent = {
	b: "blocks",
	s: "spikes",
	p: "portals"
};

function importLevel(str = "v1!") {
	try {
		level.blocks = [];
		level.spikes = [];

		const content = str.split("!");
		const data = content[1];
		if (!data) return;

		const sections = data.split("|");
		for (let i = 0; i < sections.length; i++) {
			const section = sections[i];
			if (!section) continue;

			const innerContent = section.split(":");
			if (!innerContent[1]) continue;

			const target = level[sectionParent[innerContent[0]]];
			if (!target) continue;
			const objects = innerContent[1].split(";");
			for (let j = 0; j < objects.length; j++) {
				if (!objects[j]) continue;
				const props = objects[j].split(",");
				target.push({
					x: parseFloat(props[0] || 0),
					y: parseFloat(props[1] || 0),
					width: (isNaN(props[2]) || props[2] === "") ? defaultValues.width : parseFloat(props[2]),
					height: (isNaN(props[3]) || props[3] === "") ? defaultValues.height : parseFloat(props[3]),
					type: (isNaN(props[4]) || props[4] === "") ? defaultValues.type : parseFloat(props[4]),
					rotation: (isNaN(props[5]) || props[5] === "") ? defaultValues.rotation : parseFloat(props[5]),
					hitbox: (isNaN(props[6]) || props[6] === "") ? defaultValues.hitbox : !!(+props[6])
				});
			}
		}
	} catch (err) {
		console.error(err);
		showDevMessage(err, 2);
	}
}

function serializeObj(obj) {
	const width = obj.width === defaultValues.width ? "" : obj.width;
	const height = obj.height === defaultValues.height ? "" : obj.height;
	const type = obj.type === defaultValues.type ? "" : obj.type;
	const rotation = obj.rotation === defaultValues.rotation ? "" : obj.rotation;
	const hitbox = (obj.hitbox ?? defaultValues.hitbox) == true ? "" : "0";

	return `${obj.x},${obj.y},${width},${height},${type},${rotation},${hitbox}`.replace(/,+$/g, "");
}

function exportLevel() {
	const str = ["v1!"];
	const hasBlocks = level.blocks.length > 0;
	const hasSpikes = level.spikes.length > 0;
	const hasPortals = level.portals.length > 0;

	// Avoid .map() overhead
	if (hasBlocks) {
		const blockArr = [];
		for (let i = 0; i < level.blocks.length; i++) {
			blockArr.push(serializeObj(level.blocks[i]));
		}
		str.push("b:" + blockArr.join(";"));
	}

	if (hasSpikes) {
		if (hasBlocks) str.push("|");

		const spikeArr = [];
		for (let i = 0; i < level.spikes.length; i++) {
			spikeArr.push(serializeObj(level.spikes[i]));
		}
		str.push("s:" + spikeArr.join(";"));
	}

	if (hasPortals) {
		if (hasBlocks || hasSpikes) str.push("|");

		const portalArr = [];
		for (let i = 0; i < level.portals.length; i++) {
			portalArr.push(serializeObj(level.portals[i]));
		}
		str.push("p:" + portalArr.join(";"));
	}

	showDevMessage(str.join(""), 1);
}

exportButton.addEventListener("click", exportLevel, false);
importButton.addEventListener("click", (e) => {
	const str = prompt("Paste Level Here");
	if (str && str.trim()) importLevel(str.trim());
});

let floorPosition = 0;

function rotatePoint(x, y, cx, cy, angle) {
	const dx = x - cx;
	const dy = y - cy;

	return {
		x: dx * Math.cos(angle) - dy * Math.sin(angle) + cx,
		y: dx * Math.sin(angle) + dy * Math.cos(angle) + cy
	};
}

let selecting = false;
const selectedObjects = [];
const selectionStart = { x: 0, y: 0 };
const selectionEnd = { x: 0, y: 0 };

function update(time) {
	const increment = 8 / camera.zoom;
	if (keysDown["w"]) camera.y -= increment;
	if (keysDown["a"]) camera.x -= increment;
	if (keysDown["s"]) camera.y += increment;
	if (keysDown["d"]) camera.x += increment;

	camera.x = Math.max(camera.x, 0);
	camera.y = Math.min(camera.y, 192);
}

function draw(time) {
	ctx.save();
	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, vWidth, vHeight);
	ctx.fillStyle = "#287dff";
	ctx.fillRect(0, 0, vWidth, vHeight);

	const invZoom = 1 / camera.zoom;

	const cameraLeft = camera.x - hVWidth * invZoom;
	const cameraRight = camera.x + hVWidth * invZoom;
	const cameraTop = camera.y - hVHeight * invZoom;
	const cameraBottom = camera.y + hVHeight * invZoom;
	const parallaxFactor = 0.25;
	const bgWidth = vHeight * 2.0;
	const bgHeight = vHeight * 2.0;
	const cameraVWidth = vWidth * invZoom;
	const cameraVHeight = vHeight * invZoom;

	const bgOffsetX = -(camera.x * parallaxFactor) % bgWidth;
	const numBgs = Math.ceil(vWidth / bgWidth);

	ctx.save();
	ctx.globalCompositeOperation = "multiply";
	for (let i = 0; i < numBgs; i++) {
		ctx.drawImage(bg, bgOffsetX + i * bgWidth, -vHeight, bgWidth, bgHeight);
	}
	ctx.restore();

	camera.applyToContext(ctx, vWidth, vHeight);

	if (camera.zoom > 0.125) {
		const gridX = Math.floor(Math.max(cameraLeft, -GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
		const gridY = Math.floor(cameraTop / GRID_SIZE) * GRID_SIZE;
		const gridW = (Math.ceil(cameraVWidth / GRID_SIZE) + 1) * GRID_SIZE;
		const gridH = (Math.ceil(cameraVHeight / GRID_SIZE) + 1) * GRID_SIZE;

		const endX = gridX + gridW;
		const endY = Math.min(gridY + gridH, floorPosition);

		ctx.lineWidth = Math.min(1, 1 * invZoom);
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		for (let x = gridX; x <= endX; x += GRID_SIZE) {
			ctx.moveTo(x, gridY);
			ctx.lineTo(x, endY);
		}
		for (let y = gridY; y <= endY; y += GRID_SIZE) {
			ctx.moveTo(gridX, y);
			ctx.lineTo(endX, y);
		}
		ctx.stroke();
		ctx.closePath();
	}

	for (let i = 0; i < level.blocks.length; i++) {
		const block = level.blocks[i];
		if (block.x + block.width * 0.5 < cameraLeft || block.x - block.width * 0.5 > cameraRight) continue;

		const doRotation = (block.rotation || 0) !== 0;
		let posX = -block.width * 0.5;
		let posY = -block.height * 0.5;

		if (doRotation) {
			ctx.save();
			ctx.translate(block.x, block.y);
			ctx.rotate((block.rotation || 0) * halfPi);
		} else {
			posX += block.x;
			posY += block.y;
		}

		let spritesheetOffsets = blockSpritesheetOffsets[block.type];
		ctx.drawImage(blockSpritesheet, spritesheetOffsets.x, spritesheetOffsets.y, spritesheetOffsets.width, spritesheetOffsets.height, posX, posY, block.width, block.height);

		if (doRotation) ctx.restore();
	}

	for (let i = 0; i < level.spikes.length; i++) {
		const spike = level.spikes[i];

		const doRotation = (spike.rotation || 0) !== 0;
		let posX = -spike.width * 0.5;
		let posY = -spike.height * 0.5;

		if (doRotation) {
			ctx.save();
			ctx.translate(spike.x, spike.y);
			ctx.rotate((spike.rotation || 0) * halfPi);
		} else {
			posX += spike.x;
			posY += spike.y;
		}

		if (spike.type === 1) {
			ctx.drawImage(spike0Img, posX, posY, spike.width, spike.height);
		} else if (spike.type === 2) {
			ctx.drawImage(spike1Img, posX, posY, spike.width, spike.height);
		} else if (spike.type === 5) {
			ctx.drawImage(pit0Img, posX, posY, spike.width, spike.height);
		}

		if (doRotation) ctx.restore();
	}

	for (let i = 0; i < level.portals.length; i++) {
		const portal = level.portals[i];

		const doRotation = (portal.rotation || 0) !== 0;
		let posX = -portal.width * 0.5;
		let posY = -portal.height * 0.5;

		if (doRotation) {
			ctx.save();
			ctx.translate(portal.x, portal.y);
			ctx.rotate((portal.rotation || 0) * halfPi);
		} else {
			posX += portal.x;
			posY += portal.y;
		}

		if (portal.type === 1) {
			ctx.fillStyle = "#7dff00";
			ctx.fillRect(posX, posY, portal.width, portal.height);
		} else if (portal.type === 2) {
			ctx.fillStyle = "#ff007d";
			ctx.fillRect(posX, posY, portal.width, portal.height);
		}

		if (doRotation) ctx.restore();
	}

	const tileSize = 160;
	const numTiles = Math.min(Math.ceil(cameraVWidth / tileSize) + 1, 64);
	const startX = Math.floor(cameraLeft / tileSize) * tileSize;

	ctx.fillStyle = "#0066ff";
	ctx.fillRect(cameraLeft, floorPosition, cameraVWidth, 160);

	ctx.save();
	ctx.globalCompositeOperation = "multiply";
	for (let i = 0; i < numTiles; i++) {
		const x = startX + i * tileSize;
		ctx.drawImage(floor, x, floorPosition, tileSize, tileSize);
	}
	ctx.restore();

	ctx.lineWidth = 1;
	ctx.strokeStyle = "#ffffff";
	ctx.beginPath();
	ctx.moveTo(cameraLeft, floorPosition);
	ctx.lineTo(cameraLeft + cameraVWidth, floorPosition);
	ctx.stroke();
	ctx.closePath();

	ctx.save();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#00ff00";
	ctx.fillStyle = "#00ff00";
	ctx.globalCompositeOperation = "multiply";
	for (let i = 0; i < selectedObjects.length; i++) {
		const ref = selectedObjects[i].ref;
		ctx.beginPath();
		ctx.rect(ref.x - ref.width * 0.5, ref.y - ref.height * 0.5, ref.width, ref.height);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}
	ctx.restore();

	ctx.lineWidth = Math.ceil(2 * invZoom);
	ctx.strokeStyle = "#ffffff";
	ctx.beginPath();
	ctx.moveTo(0, cameraTop);
	ctx.lineTo(0, cameraBottom);
	ctx.stroke();
	ctx.closePath();

	const mx = snapNumberToGrid(mouse.x, GRID_SIZE);
	const my = snapNumberToGrid(mouse.y, GRID_SIZE);
	ctx.fillStyle = "#ffffff80";
	ctx.fillRect(mx, my, GRID_SIZE, GRID_SIZE);

	const x0 = 0;
	const y0 = GRID_SIZE * 0.25;
	const x1 = x0;
	const y1 = -y0;
	const x2 = -GRID_SIZE * 0.125;
	const y2 = x2;
	const x3 = -x2;
	const y3 = x2;

	ctx.save();
	ctx.lineWidth = 2;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.strokeStyle = "#000000";
	ctx.translate(mx + HALF_GRID_SIZE, my + HALF_GRID_SIZE);
	ctx.rotate(currentObjRotation * halfPi);
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.moveTo(x2, y2);
	ctx.lineTo(x1, y1);
	ctx.lineTo(x3, y3);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	if (selecting) {
		const startX = Math.min(selectionStart.x, selectionEnd.x);
		const startY = Math.min(selectionStart.y, selectionEnd.y);
		const width = Math.abs(selectionEnd.x - selectionStart.x);
		const height = Math.abs(selectionEnd.y - selectionStart.y);

		ctx.lineWidth = 1 * invZoom;
		ctx.strokeStyle = "#00ff00";
		ctx.beginPath();
		ctx.rect(startX + 0.5, startY + 0.5, width - 1, height - 1);
		ctx.closePath();
		ctx.stroke();
	}

	ctx.restore();

	ctx.save();
	ctx.scale(dpr, dpr);
	ctx.font = "bold 14px monospace";
	ctx.textBaseline = "top";

	let xPosText = "x: " + (mx * INV_GRID_SIZE).toString() + " (" + (mx + 16) + ")";
	let yPosText = "y: " + (-my * INV_GRID_SIZE - 1).toString() + " (" + (my + 16) + ")";
	let rotText = "rotation: " + currentObjRotation * halfPi * radToDeg + "\u00b0";

	const boxWidth = Math.ceil(Math.max(
		ctx.measureText(xPosText).width,
		ctx.measureText(yPosText).width,
		ctx.measureText(rotText).width
	)) + 16;
	const boxHeight = 14 * 3 + 16;

	ctx.fillStyle = "#00000080";
	ctx.fillRect(16, 16, boxWidth, boxHeight);

	ctx.fillStyle = "#ffffff";
	ctx.fillText(xPosText, 24, 24);
	ctx.fillText(yPosText, 24, 40);
	ctx.fillText(rotText, 24, 54);
	ctx.restore();
}

let currTime = 0;
let dt = 0;
let prevTime = 0;

function main() {
	currTime = performance.now();
	dt = (currTime - prevTime) / 1000;
	prevTime = currTime;

	// Overwrite
	// dt = 1 / 480;

	update(dt);
	draw(dt);

	rAFIdx = requestAnimationFrame(main);
}

scene.addEventListener("wheel", (e) => {
	if (e.deltaY < 0) {
		camera.zoom *= 1.02040816;
	} else {
		camera.zoom *= 0.98;
	}
});

window.addEventListener("load", () => {
	prevTime = performance.now();
	rAFIdx = requestAnimationFrame(main);
});

function deleteSelection() {
	for (let i = 0; i < selectedObjects.length; i++) {
		const obj = selectedObjects[i];

		const idx = obj.parent.indexOf(obj.ref);
		if (idx !== -1) {
			obj.parent.splice(idx, 1);
			continue;
		}
	}

	selectedObjects.length = 0;
}

window.addEventListener("keydown", (e) => {
	keysDown[e.key.toLowerCase()] = true;

	if (e.key === "q") {
		currentObjType = (currentObjType - 1 + selectorValues.length) % selectorValues.length;
		objectSelector.value = currentObjType;
	}

	if (e.key === "e") {
		currentObjType = (currentObjType + 1) % selectorValues.length;
		objectSelector.value = currentObjType;
	}

	if (e.key === "Q") currentObjRotation = (currentObjRotation - 1 + 4) % 4;
	if (e.key === "E") currentObjRotation = (currentObjRotation + 1) % 4;

	if (e.key === "1" || e.key === "0" || e.key === "5") currentObjRotation = 0;
	if (e.key === "2") currentObjRotation = 1;
	if (e.key === "3") currentObjRotation = 2;
	if (e.key === "4") currentObjRotation = 3;

	if (selectedObjects.length > 0) {
		if (e.key === "Backspace" || e.key === "Delete") {
			deleteSelection();
			return;
		}

		const offset = { x: 0, y: 0 };

		let dist = GRID_SIZE;
		if (e.shiftKey) {
			dist = HALF_GRID_SIZE;
		} else if (e.altKey) {
			e.preventDefault();
			dist = GRID_SIZE * 0.03125;
		}

		if (e.key === "ArrowUp") offset.y -= dist;
		if (e.key === "ArrowLeft") offset.x -= dist;
		if (e.key === "ArrowDown") offset.y += dist;
		if (e.key === "ArrowRight") offset.x += dist;

		if (offset.x !== 0 || offset.y !== 0) {
			for (let i = 0; i < selectedObjects.length; i++) {
				selectedObjects[i].ref.x += offset.x;
				selectedObjects[i].ref.y += offset.y;
			}
		}
	}
});

window.addEventListener("keyup", (e) => {
	keysDown[e.key.toLowerCase()] = false;
});

function placeObj() {
	const selectedObj = selectorValues[currentObjType].id;
	if (selectedObj < 1 || selectedObj > 17) return;

	const mouseGridX = snapNumberToGrid(mouse.x, GRID_SIZE) + HALF_GRID_SIZE;
	const mouseGridY = snapNumberToGrid(mouse.y, GRID_SIZE) + HALF_GRID_SIZE;

	const obj = {
		x: mouseGridX,
		y: mouseGridY,
		width: GRID_SIZE,
		height: GRID_SIZE,
		type: 1,
		rotation: currentObjRotation
	};

	let type = "block";

	if (selectedObj === 1) {
	} else if (selectedObj === 2) {
		type = "spike";
	} else if (selectedObj === 3) {
		type = "spike";
		const frac = 28 / 61;
		const finalPos = rotatePoint(mouseGridX, mouseGridY + HALF_GRID_SIZE - HALF_GRID_SIZE * frac, mouseGridX, mouseGridY, currentObjRotation * halfPi);
		obj.x = finalPos.x;
		obj.y = finalPos.y;
		obj.height *= frac;
		obj.type = 2;
	} else if (selectedObj === 6) {
		type = "spike";
		const finalPos = rotatePoint(mouseGridX, mouseGridY + HALF_GRID_SIZE * 0.8125, mouseGridX, mouseGridY, currentObjRotation * halfPi);
		obj.x = finalPos.x;
		obj.y = finalPos.y;
		obj.height /= 1.22;
		obj.type = 5;
	} else if (selectedObj === 7) {
		obj.type = 2;
	} else if (selectedObj === 8) {
		obj.type = 3;
	} else if (selectedObj === 9) {
		obj.type = 4;
	} else if (selectedObj === 10) {
		obj.type = 5;
	} else if (selectedObj === 11) {
		obj.type = 6;
		obj.hitbox = false;
	} else if (selectedObj === 12) {
		obj.type = 7;
		obj.hitbox = false;
	} else if (selectedObj === 13) {
		obj.type = 8;
	} else if (selectedObj === 14) {
		obj.type = 9;
	} else if (selectedObj === 15) {
		const frac = 28 / 61;
		const finalPos = rotatePoint(mouseGridX, mouseGridY + (keysDown["alt"] ? HALF_GRID_SIZE - HALF_GRID_SIZE * frac : -HALF_GRID_SIZE + HALF_GRID_SIZE * frac), mouseGridX, mouseGridY, currentObjRotation * halfPi);
		obj.x = finalPos.x;
		obj.y = finalPos.y;
		obj.height *= frac;
		obj.type = 10;
	} else if (selectedObj === 16) {
		type = "portal";
		obj.height *= 3;
		obj.type = 1;
	} else if (selectedObj === 17) {
		type = "portal";
		obj.height *= 3;
		obj.type = 2;
	}

	if (type === "block") {
		level.blocks.push(obj);
	} else if (type === "spike") {
		level.spikes.push(obj);
	} else if (type === "portal") {
		level.portals.push(obj);
	}
}

function deleteObj() {
	for (let i = 0; i < level.blocks.length; i++) {
		if (pointToAABBCollision(mouse, level.blocks[i])) {
			level.blocks.splice(i, 1);
			return;
		}
	}

	for (let i = 0; i < level.spikes.length; i++) {
		if (pointToAABBCollision(mouse, level.spikes[i])) {
			level.spikes.splice(i, 1);
			return;
		}
	}

	for (let i = 0; i < level.portals.length; i++) {
		if (pointToAABBCollision(mouse, level.portals[i])) {
			level.portals.splice(i, 1);
			return;
		}
	}
}

let lastGridX = 0;
let lastGridY = 0;

scene.addEventListener("mousedown", (e) => {
	const invZoom = 1 / camera.zoom;
	mouse.x = camera.x + (e.clientX - hVWidth) * invZoom;
	mouse.y = camera.y + (e.clientY - hVHeight) * invZoom;

	if (e.button === 2) {
		mouse.rightDown = true;
	} else {
		mouse.down = true;
	}

	if (mouse.down && keysDown["f"]) {
		selecting = true;
		selectedObjects.length = 0;
		selectionStart.x = mouse.x;
		selectionStart.y = mouse.y;
		selectionEnd.x = mouse.x;
		selectionEnd.y = mouse.y;
		return;
	}

	if (mouse.down && selectedObjects.length === 0 && mouse.x >= -GRID_SIZE && mouse.y <= floorPosition) {
		placeObj();
		lastGridX = snapNumberToGrid(mouse.x, GRID_SIZE) + HALF_GRID_SIZE;
		lastGridY = snapNumberToGrid(mouse.y, GRID_SIZE) + HALF_GRID_SIZE;
	}

	if (mouse.rightDown && selectedObjects.length === 0) deleteObj();

	if (selectedObjects.length !== 0) {
		selectedObjects.length = 0;
		selecting = false;
	}
});

scene.addEventListener("mousemove", (e) => {
	const invZoom = 1 / camera.zoom;
	mouse.x = camera.x + (e.clientX - hVWidth) * invZoom;
	mouse.y = camera.y + (e.clientY - hVHeight) * invZoom;

	if (selecting) {
		selectionEnd.x = mouse.x;
		selectionEnd.y = mouse.y;
	} else if (mouse.down || mouse.rightDown) {
		const gridX = snapNumberToGrid(mouse.x, GRID_SIZE) + HALF_GRID_SIZE;
		const gridY = snapNumberToGrid(mouse.y, GRID_SIZE) + HALF_GRID_SIZE;

		if ((gridX !== lastGridX || gridY !== lastGridY) && selectedObjects.length === 0 && mouse.x >= -GRID_SIZE && mouse.y <= floorPosition) {
			if (mouse.down) {
				placeObj();
			} else {
				deleteObj();
			}

			lastGridX = gridX;
			lastGridY = gridY;
		}
	}
});

window.addEventListener("mouseup", () => {
	if (selecting) {
		const selectAABB = {
			x: (selectionStart.x + selectionEnd.x) * 0.5,
			y: (selectionStart.y + selectionEnd.y) * 0.5,
			width: Math.abs(selectionEnd.x - selectionStart.x),
			height: Math.abs(selectionEnd.y - selectionStart.y)
		};

		for (let i = 0; i < level.blocks.length; i++) {
			if (aabbCollision(selectAABB, level.blocks[i])) {
				selectedObjects.push({ parent: level.blocks, ref: level.blocks[i] });
			}
		}

		for (let i = 0; i < level.spikes.length; i++) {
			if (aabbCollision(selectAABB, level.spikes[i])) {
				selectedObjects.push({ parent: level.spikes, ref: level.spikes[i] });
			}
		}

		for (let i = 0; i < level.portals.length; i++) {
			if (aabbCollision(selectAABB, level.portals[i])) {
				selectedObjects.push({ parent: level.portals, ref: level.portals[i] });
			}
		}
	}

	mouse.down = false;
	mouse.rightDown = false;
	selecting = false;
});

scene.addEventListener("contextmenu", (e) => {
	e.preventDefault();
});

document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		cancelAnimationFrame(rAFIdx);
	} else {
		prevTime = performance.now();
		rAFIdx = requestAnimationFrame(main);
	}
});

window.addEventListener("resize", resizeCanvas, false);
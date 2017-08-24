


let canvas = document.getElementById('app');
let ctx = canvas.getContext('2d');
let appWidth = window.innerWidth;
let appHeight = 460;

canvas.style.display = 'block';
canvas.style.background = "#f0f0f0";
canvas.width = appWidth;
canvas.height = appHeight;

let zeros = Array.apply(null, Array(5)).map(() => appHeight + 20);
let arr1 = [100,150,220,180,270];
let arr2 = [300,280,200,180,120];
let arr3 = [200,380,300,280,320];



class Chart {
	constructor(name, coords, color = '#000') {
		this.step = 100;
		this.shadowHeight = 100;
		this.offsetX = 100;

		this.name = name;
		this.coords = coords;
		this.color = color;

		this.dots = this.coords.map(item => appHeight - item);
		this.startDots = zeros;
		this.currentDots = this.startDots;
		this.finishDots = this.dots;
		this.movingDirs = Array.apply(null, Array(this.coords.length)).map(() => 'stop');
		this.movingSteps = Array.apply(null, Array(this.coords.length)).map(() => 0);
	}
	drawLine() {
		for(let i = 0; i < this.currentDots.length; i++) {

			let startX = this.step + this.step * i;
			let middleX = startX + this.step / 2;
			let endX = startX + this.step;
			let startY = this.currentDots[i];
			let endY = this.currentDots[i + 1];

			if(endY !== undefined) {

				// curves
				ctx.beginPath();
				ctx.moveTo(startX, startY);
				ctx.bezierCurveTo(middleX, startY, middleX, endY, endX, endY);
				ctx.strokeStyle = this.color;
				ctx.stroke();
				ctx.closePath();

				// shadows
				let totalLines = this.step * 2;
				for(let z = 0; z < totalLines; z++) {
					let y = z / totalLines;
					let points = bezierCubicXY(
						{x: startX, y: startY},
						{x: middleX, y: startY},
						{x: middleX, y: endY},
						{x: endX, y: endY},
						y
					);
					let gradient = ctx.createLinearGradient(points.x,points.y,points.x,points.y + this.shadowHeight);
					gradient.addColorStop(0,this.color);
					gradient.addColorStop(1,'rgba(255,255,255,0');
					ctx.fillStyle = gradient;
					ctx.fillRect(points.x,points.y,1,this.shadowHeight);
				}

			}

			// texts
			ctx.font = '12px serif';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#000';
			ctx.fillText(this.coords[i], startX, startY - 5);

			// dots
			let x = i === 0 ? 0 : i;
			ctx.beginPath();
			ctx.fillStyle = '#000';
			ctx.arc(startX, this.currentDots[x], 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}
	}
	calcMovingSteps() {
		this.movingSteps = this.finishDots.map((dot,i) => {
			if(this.startDots[i] > dot) {
				return (this.startDots[i] - dot) / 10;
			} else if(this.startDots[i] < dot) {
				return (dot - this.startDots[i]) / 10;
			} else {
				return 0;
			}
		});
	}
	calcMovingDirections() {
		this.movingDirs = this.finishDots.map((dot,i) => {
			if(this.startDots[i] > dot) {
				return 'up';
			} else if(this.startDots[i] < dot) {
				return 'down';
			} else {
				return 'stop';
			}
		});
	}
	calcNextMovingDots() {
		this.currentDots = this.currentDots.map((dot,i) => {
			if(this.movingDirs[i] === 'up') {
				if(dot - this.movingSteps[i] > this.finishDots[i]) {
					return dot - this.movingSteps[i];
				} else {
					return this.finishDots[i];
				}
			} else if(this.movingDirs[i] === 'down') {
				if(dot + this.movingSteps[i] < this.finishDots[i]) {
					return dot + this.movingSteps[i];
				} else {
					return this.finishDots[i];
				}
			} else {
				return dot;
			}
		});
	}
	checkMovingDirections(currentDots, movingDirs, endDots) {
		this.movingDirs = this.movingDirs.map((dir,i) => {
			if((dir === 'up' && this.currentDots[i] <= this.finishDots[i]) || (dir === 'down' && this.currentDots[i] >= this.finishDots[i])) {
				return 'stop';
			} else {
				return dir;
			}
		});
	}
}



function bezierCubicXY(p0, p1, p2, p3, t) {
	// Points are objects with x and y properties
	// p0: start point
	// p1: handle of start point
	// p2: handle of end point
	// p3: end point
	// t: progression along curve 0..1
	// returns an object containing x and y values for the given t
	let ret = {};
	let coords = ['x', 'y'];
	let i, k;
	for (i in coords) {
		k = coords[i];
		ret[k] = Math.pow(1 - t, 3) * p0[k] + 3 * Math.pow(1 - t, 2) * t * p1[k] + 3 * (1 - t) * Math.pow(t, 2) * p2[k] + Math.pow(t, 3) * p3[k];
	}
	return ret;
}



let activeChart = null;
let nextActiveChart = null;
let activeChartDots = null;

function show(index) {
	// before moving
	let allCharts = [chart1, chart2, chart3];
	if(index !== undefined && index > allCharts.length - 1) index = allCharts.length - 1;
	let charts = allCharts;

	// all -> all
	if(activeChart === 'all' && index === undefined) {
		charts.forEach(chart => {
			chart.currentDots = chart.startDots = chart.finishDots;
		});
		nextActiveChart = 'all';
	}
	// all -> one
	if(activeChart === 'all' && index !== undefined) {
		charts.forEach((chart,i) => {
			if(i !== index) {
				chart.currentDots = chart.startDots = chart.finishDots;
				chart.finishDots = zeros;
			} else {
				activeChartDots = chart.finishDots;
			}
		});
		nextActiveChart = charts[index].name;
	}
	// one -> all
	if(activeChart !== 'all' && index === undefined) {
		charts.forEach(chart => {
			if(chart.name !== activeChart) {
				chart.currentDots = chart.startDots = zeros;
			}
		});
		nextActiveChart = 'all';
	}
	// one -> one
	if(activeChart !== 'all' && index !== undefined) {
		charts = allCharts.filter((item,i) => i === index);
		if(activeChartDots !== null) {
			charts[0].currentDots = charts[0].startDots = activeChartDots;
		}
		nextActiveChart = charts[0].name;
	}

	activeChart = nextActiveChart;

	// moving
	move(charts);
}



function move(charts) {
	ctx.clearRect(0, 0, appWidth, appHeight);
	let stopped = [];
	charts.forEach(chart => {

		chart.calcMovingSteps();
		chart.calcMovingDirections();
		chart.calcNextMovingDots();
		chart.drawLine();
		chart.checkMovingDirections();

		stopped.push(chart.movingDirs.some(item => item !== 'stop'));

	});

	if(stopped.some(item => item)) {
		window.requestAnimationFrame(() => move(charts));
	} else {
		// after moving
		charts.forEach(chart => {
			if(activeChart !== 'all') {
				if(chart.name === activeChart) {
					activeChartDots = chart.finishDots;
				} else {
					chart.currentDots = chart.startDots = zeros;
					chart.finishDots = chart.dots;
				}
			} else {
				activeChartDots = chart.finishDots;
			}
		});
	}
}



var chart1 = new Chart('blue', arr1, 'rgba(0,0,255,0.2)');
var chart2 = new Chart('red', arr2, 'rgba(255,0,0,0.2)');
var chart3 = new Chart('green', arr3, 'rgba(0,255,0,0.2)');



document.querySelector('.blue').onclick = () => {window.requestAnimationFrame(() => show(0)); return false;};
document.querySelector('.red').onclick = () => {window.requestAnimationFrame(() => show(1)); return false;};
document.querySelector('.green').onclick = () => {window.requestAnimationFrame(() => show(2)); return false;};
document.querySelector('.all').onclick = () => {window.requestAnimationFrame(() => show()); return false;};



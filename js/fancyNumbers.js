/*var width = 640;
var height = 400;

//var color = d3.scaleSequential().domain([0, 8]).range(d3.schemeSet3);

var boxSize = [ 6, 8 ];
var boxMargin = [ 1, 2 ];
var numBoxes = [3*8, 3];
width = boxSize[1]*numBoxes[0];
height = (boxSize[0]*numBoxes[1]);
*/
const boxShapeByNumber = {
	"1": [ 1,1 ],
	"5": [ 1,2 ],
	"10": [ 3,1 ],
	"50": [ 1,3 ],
	"100": [ 2,3 ],
	"500": [ 3,2 ],
	"1000": [ 3,1 ]
};

function splitNumber(number) {
	var x = number;
	var numberAsBoxes = [];
	var classes = [];
	var sizes = Object.keys(boxShapeByNumber);
	for (var i = sizes.length-1; i >= 0; i--) {
		while ( x - (0+sizes[i]) >=  0) {
			numberAsBoxes.push(boxShapeByNumber[sizes[i]]);
			classes.push(sizes[i]);
			x = x - (0+sizes[i]);
		}
	}
	return { 'numberAsBoxes': numberAsBoxes, 'classes': classes };
}

function computeDensePacking(numberAsBoxes, options) {
	var hu = options.numBoxes[1];  // three units height
	var wu = options.numBoxes[0];  // ten of those
	var occupyMask = new Array(hu).fill(0).map(function(x) { return new Array(wu).fill(0); });
	var placements = [];
	
	// pack from largest to smallest, left to right
	for (var i = 0; i < numberAsBoxes.length; i++) {
		var s = numberAsBoxes[i];
		// find the first place in occupyMask where we can fit in this mask
		// brute force
		// we need to keep at the smallest x,y that is empty
		var w = 0;
		var h = 0;	
		for (var w = 0; w < wu; w++) {
			for (var h = 0; h < hu; h++) {
				var potentiallyFree = true;
				var freeLocation = [];
				for (var h2 = 0; h2 < s[0]; h2++) {
					for (var w2 = s[1]-1; w2 >= 0; w2--) {
						if (h+h2 >= hu || w + w2 >= wu) {
							potentiallyFree = false;
							break;
						}
						if (occupyMask[h+h2][w+w2] != 0) {
							potentiallyFree = false;
							break;
						}
					}
					if (!potentiallyFree)
					break;
				}
				if (potentiallyFree) {
					// place here and continue
					placements.push([h, w]);
					for (var h2 = 0; h2 < s[0]; h2++) {
						for (var w2 = 0; w2 < s[1]; w2++) {
							occupyMask[h+h2][w+w2] = 1;
						}
					}
				}
				// look for the next location
				if (placements.length == i+1) {
					break; // already placed
				}
			}
			if (placements.length == i+1) {
				break; // already placed
			}
		}
	}
	return placements;
}

function defaultOptions(options) {
	if (typeof options == "undefined") {
		options = {}
	}
	options.boxSize = options.boxSize ?? [6, 8];
	options.boxMargin = options.boxMargin ?? [ 1, 2 ];
	options.numBoxes = options.numBoxes ?? [ 3*8, 3 ];
	options.color = options.color ?? d3.scaleSequential().domain([0, 8]).range(d3.schemePastel2);
	return options;
}

function addSize(container, number, options ) {
	options = defaultOptions(options);
	
	var width = options.boxSize[1]*options.numBoxes[0];
	var height = (options.boxSize[0]*options.numBoxes[1]);
	
	if (typeof container == "undefined")
	return; // ignore those
	
	({ numberAsBoxes, classes } = splitNumber(number));
	var packing = computeDensePacking(numberAsBoxes, options);
	var data = [];
	for (var i = 0; i < packing.length; i++) {
		data.push({ location: packing[i], size: numberAsBoxes[i], classes: +classes[i] });
	}
	
	// Create the SVG container.
	const svg = d3.create("svg")
	.attr("width", width)
	.attr("height", height);
	
	var g = svg.selectAll('.boxes').data(data);
	
	function highlightIn(dset, iset) {
		svg.selectAll('.box').transition()
		.duration('400')
		.attr("stroke-width", '3')
		.on('end', highlightOut)
	}
	function highlightOut(d,i) {
		svg.selectAll('.box').transition()
		.duration('400')
		.attr("stroke-width", '1')
		.on('end', highlightIn)
	}
	
	
	var bb = g.enter().append('g')
	.attr('class', function(d) {
		return 'box-'+(d.classes);
	})
	.append('rect')
	.attr('fill', function(d) {
		return options.color(+d.classes);
	})
	.attr('class', 'box')
	.attr('stroke', 'rgba(255,255,255,0.5)')
	.attr('height', function(d) {
		return options.boxSize[0] * d.size[0] - options.boxMargin[0];
	})
	.attr('width', function(d) {
		return options.boxSize[1] * d.size[1] - options.boxMargin[1];
	})
	.on('mouseover', function(d,i) {
		highlightIn(d,i);
		/*svg.selectAll('.box').transition()
		.duration('200')
		.attr("stroke-width", '3') */
	})
	.on('mouseout', function (d, i) {
		svg.selectAll('.box').transition()
		.duration('200')
		.attr("stroke-width", '1')
	});;
	
	bb.merge(g).attr('transform', function(d) {
		return 'translate(' + ((options.boxMargin[1]/2.0) + (options.boxSize[1]) * d.location[1]) + ',' + ((options.boxMargin[0]/2.0) + (options.boxSize[0]) * d.location[0]) + ')';
	});
	
	// Append the SVG element.
	container.append(svg.node());
}

/*
// demo for counting up
var x = 1;
setInterval(function() {
	document.getElementById('container').innerHTML = '';
	addSize(container, x++);
}, 100);
*/

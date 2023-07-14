var width = 640;
var height = 400;

var color = d3.scaleSequential().domain([0, 6]).range(d3.schemePastel1);

var boxSize = [ 20, 20 ];
var boxMargin = [ 2, 2 ];
var numBoxes = [3*10, 3];
width = boxSize[0]*numBoxes[0];
height = boxSize[1]*numBoxes[1];

const boxShapeByNumber = {
    "1": [ 1,1 ],
    "5": [ 1,2 ],
    "10": [ 3,1 ],
    "50": [ 1,3 ],
    "100": [ 2,3 ],
    "500": [ 3,2 ],
    "1000": [ 3,3 ]
};

function splitNumber(number) {
    var x = number;
    var res = [];
    var sizes = Object.keys(boxShapeByNumber);
    for (var i = sizes.length-1; i >= 0; i--) {
	while ( x - (0+sizes[i]) >=  0) {
	    res.push(boxShapeByNumber[sizes[i]]);
	    x = x - (0+sizes[i]);
	}
    }
    return res;
}

function computeDensePacking(numberAsBoxes) {
    var hu = numBoxes[1];  // three units height
    var wu = numBoxes[0];  // ten of those
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
		    for (var w2 = 0; w2 < s[1]; w2++) {
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

function addSize(container, number ) {
    
    var numberAsBoxes = splitNumber(number);
    var packing = computeDensePacking(numberAsBoxes);
    var data = [];
    for (var i = 0; i < packing.length; i++) {
	data.push({location: packing[i], size: numberAsBoxes[i]});
    }
    
    // Create the SVG container.
    const svg = d3.create("svg")
	  .attr("width", width)
	  .attr("height", height);
    
    var g = svg.selectAll('.boxes').data(data);
    
    var bb = g.enter().append('g')
	.attr('class', function(d) {
	    return 'box-'+(d.size[0]*d.size[1]);
	})
	.append('rect')
	.attr('fill', function(d) {
	    return color(d.size[0]*d.size[1]);
	})
	.attr('stroke', 'white')
	.attr('height', function(d) {
	    return boxSize[0] * d.size[0] - boxMargin[0];
	})
	.attr('width', function(d) {
	    return boxSize[1] * d.size[1] - boxMargin[1];
	})
	.on('mouseover', function(d,i) {
	    d3.select(this).transition()
		.duration('200')
		.attr("stroke-width", '6')
	})
	.on('mouseout', function (d, i) {
	    d3.select(this).transition()
		.duration('200')
		.attr("stroke-width", '1')
	});;
    
    bb.merge(g).attr('transform', function(d) {
	return 'translate(' + ((boxMargin[1]/2.0) + (boxSize[1]) * d.location[1]) + ',' + ((boxMargin[0]/2.0) + (boxSize[0]) * d.location[0]) + ')';
    });
    
    // Append the SVG element.
    container.append(svg.node());
}

var x = 1;
setInterval(function() {
    document.getElementById('container').innerHTML = '';
    addSize(container, x++);
}, 100);

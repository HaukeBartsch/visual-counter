
var x = 1;
setInterval(function() {
    document.getElementById('container').innerHTML = '';
	var options = defaultOptions({ boxSize: [24, 32], boxMargin: [4, 4] });
    addSize(container, x++, options);
}, 100);

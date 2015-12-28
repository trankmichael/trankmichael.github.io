
var points = [],
    width = 1200, 
    height = 800;

function Point( x, y ){
    this.x = x;
    this.y = y;
}

// approximately normal random http://jsfiddle.net/Guffa/tvt5K/
function pnormal_rnd() {
    return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
}


function add_random_point() {
        x = Math.floor((pnormal_rnd() * width) + (width / 2));
        y = Math.floor((pnormal_rnd() * height) + (height / 2));
        add_point(x, y, radius, height, width);
}

function setup() {
    background(255);
    width = document.getElementById("oja-sketch").offsetWidth - 100; 
    console.log(width);
    height = screen.height / 1.4;
    radius = 7;
    console.log(height);
    var cnv = createCanvas(width, height);
    cnv.parent("oja-sketch")
    node_color = color(0, 146, 204);
    stroke_color = color(3, 65, 89);
    center_color = color(227, 34, 34)
    fill(node_color);
    for (var i = 100; i >= 0; i--) {
        add_random_point();
    }
    redraw_points(points, radius);
}

function force_bounds( x, min, max ) {
    var len = max - min;
    if (x < min) {
        return (min + ((min - x) % len));
    }
    if (x > max) {
        return (max - ((x - max) % len));
    }
    return x;
}

function already_exists(mouseX, mouseY) {
    for (var i = points.length - 1; i >= 0; i--) {
        p = points[i];
        if ((p.x == mouseX) && (p.y == mouseY)) {
            return true;
        }
    }
    return false;
}

function add_point( mouseX, mouseY, radius, height, width){
    mouseX = force_bounds(mouseX, 0, width);
    mouseY = force_bounds(mouseY, 0, height);
    if (!already_exists(mouseX, mouseY)) {
        ellipse(mouseX, mouseY, radius, radius);
        points.push(new Point(mouseX, mouseY));
    }
}

function redraw_points(datapoints, radius)
{
    if( typeof datapoints != "undefined" ) {
        for (var i = datapoints.length - 1; i >= 0; i--) {
            p = datapoints[i];
            ellipse(p.x, p.y, radius, radius);
        }
    }
}

function mousePressed() {
    fill(node_color);
    redraw_points(points, radius);
    add_point(mouseX, mouseY, radius, height, width);
}

function x_max( datapoints ){
    var max = new Point(-10000, 0);
    var index, tmp;
    for ( var i = 0; i < datapoints.length; i++ ) {
        tmp = datapoints[i]
        if (tmp.x > max.x){
            max = tmp;
            index = i;
        }
    }
    return index;
}

function euclidean_distance(p, q) {
    return Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2) 
}

function left_turn(p, q, r) {
    var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x);
    if (val >= 0) {
        return false;
    }
    return true;
}

function next_hull_point(datapoints, p) {
    var distance_difference;
    var index = -1;
    var q = p;
    for (var i = datapoints.length - 1; i >= 0; i--) {
        r = datapoints[i];
        distance_difference = euclidean_distance(p, r) - euclidean_distance(p, q);
        if (!left_turn(p, q, r) && (distance_difference > 0)) {
            q = r;
            index = i;
        }
    }
    return index;
}

function connect_points( datapoints, indices ) {
    stroke(stroke_color);
    strokeWeight(1.5);
    for (var i = indices.length - 1; i >= 0; i--) {
        p = datapoints[indices[i]];
        q = datapoints[indices[(i + 1) % indices.length]];
        line(p.x, p.y, q.x, q.y);
    }
}

function strip_indices(original, indices) {
    for (var i = indices.length - 1; i >= 0; i--) {
        original[indices[i]] = -1;
    }
    var index = original.indexOf(-1);
    while (index >= 0) {
        original.splice(index, 1);
        index = original.indexOf(-1);
    }
    return original;
}

function fill_center(datapoints) {
    fill(center_color);
    redraw_points(datapoints, radius)
}

function draw_hulls(datapoints, spacing) {
    var temp = datapoints.slice();
    var temp2; 
    var hull = new ConvexHull();
    var i = 0;
    while(temp.length > 2) {
        hull.compute(temp);
        var indices = hull.getIndices();
        if (i % spacing == 0) connect_points(temp, indices);
        temp2 = temp.slice(); 
        temp = strip_indices(temp, indices);
        i++;
    }
    fill_center(temp2);

}

function find_oja_median(datapoints) {
    var oja_values = calculate_oja_depth(datapoints)
    var min = Math.infinity    
}

$('#clear_canvas').on('click', function(event) {
    points = [];
    clear();
});

$('#find_center').on('click', function(event) {
    clear();
    fill(node_color);
    redraw_points(points, radius);
    draw_hulls(points, 1);
});

$('#add_points').on('click', function(event) {
    var n = $("#number_of_points").val();
    n = parseInt(n, 10);
    n = Math.floor(n);
    fill(node_color);
    for( var i = 0; i < n; i++ ) {
        add_random_point();
    }
    clear();
    redraw_points(points, radius);
    draw_hulls(points, 1);
    $("#number_of_points").val("");
});
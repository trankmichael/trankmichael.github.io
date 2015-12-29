
var points = [],
    width = 1200, 
    height = 800;

function Point( x, y ){
    this.x = x;
    this.y = y;
}

function Line(p, q){
    this.p = p;
    this.q = q;
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



function draw_line_segments( points ) {
    stroke(60);
    for (var i = 0; i < points.length; i++) {
        p = points[i];
        for (var j = i + 1; j < points.length; j++) {
            q = points[j]; 
            line(p.x, p.y, q.x, q.y);
            lines.push(new Line(p, q));
        }   
    }
    line_state = true;
}

function setup() {
    lines = [];
    background(255);
    width = document.getElementById("oja-sketch").offsetWidth / 2; 
    height = screen.height / 1.7;
    radius = 10;
    line_state = true;
    var cnv = createCanvas(width, height);
    cnv.parent("oja-sketch")
    node_color = color(0, 146, 204);
    stroke_color = color(3, 65, 89);
    center_color = color(227, 34, 34)
    fill(node_color);
    for (var i = 20; i >= 0; i--) {
        add_random_point();
    }
    draw_line_segments(points);
    stroke(node_color);
    redraw_points(points, radius);
}

function force_bounds( x, min, max ) {
    var len = max - min;
    if (x < min) {
        return false;
    }
    if (x > max) {
        return false;
    }
    return true;
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
    var in_bounds = force_bounds(mouseX, 0, width) && force_bounds(mouseY, 0, height);
    if (!already_exists(mouseX, mouseY) && in_bounds) {
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

function calculate_oja_depth(datapoints) {
    for (var i = datapoints.length - 1; i >= 0; i--) {
        var s = datapoints[i];

    };
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


$('#line_segments').on('click', function(event) {
    if (!line_state) {
        draw_line_segments(points);
    } else {
        clear();
        line_state = false;
    }
    redraw_points(points, radius);
});

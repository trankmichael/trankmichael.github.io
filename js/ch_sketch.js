/** Class for computing a 2D convex hull for the given vertices. */
ConvexHullPoint = function(i, a, d) {
    this.index = i;
    this.angle = a;
    this.distance = d;
    
    this.compare=function(p) {
        if (this.angle<p.angle)
            return -1;
        else if (this.angle>p.angle)
            return 1;
        else {
            if (this.distance<p.distance)
                return -1;
            else if (this.distance>p.distance)
                return 1;
        }
        return 0;
    }
}

ConvexHull = function() {
    this.points = null;
    this.indices = null;
    
    this.getIndices=function() {
        return this.indices;
    }
    
    this.clear=function() {
        this.indices=null;
        this.points=null;
    }
    
    this.ccw=function(p1, p2, p3) {
        first_term = (this.points[p2].x - this.points[p1].x)*(this.points[p3].y - this.points[p1].y);
        second_term = (this.points[p2].y - this.points[p1].y)*(this.points[p3].x - this.points[p1].x);
        return first_term - second_term;
    }
    
    this.angle=function(o, a) {
        return Math.atan((this.points[a].y-this.points[o].y) / (this.points[a].x - this.points[o].x));
    }
    
    this.distance=function(a, b) {
        return ((this.points[b].x-this.points[a].x)*(this.points[b].x-this.points[a].x)+(this.points[b].y-this.points[a].y)*(this.points[b].y-this.points[a].y));
    }
    
    this.compute=function(_points) {
        this.indices=null;
        if (_points.length<3)
            return;
        this.points=_points;
            
        // Find the lowest point
        var min = 0;
        for (var i = 1; i < this.points.length; i++) {
            if (this.points[i].y==this.points[min].y) {
                if (this.points[i].x<this.points[min].x)
                    min = i;
            }
            else if (this.points[i].y<this.points[min].y)
                min = i;
        }
        
        // Calculate angle and distance from base
        var al = new Array();
        var ang = 0.0;
        var dist = 0.0;
        for (i = 0; i<this.points.length; i++) {
            if (i==min)
                continue;
            ang = this.angle(min, i);
            if (ang<0)
                ang += Math.PI;
            dist = this.distance(min, i);
            al.push(new ConvexHullPoint(i, ang, dist));
        }
        
        al.sort(function (a, b) { return a.compare(b); });
        
        // Create stack
        var stack = new Array(this.points.length+1);
        var j = 2;
        for (i = 0; i<this.points.length; i++) {
            if (i==min)
                continue;
            stack[j] = al[j-2].index;
            j++;
        }
        stack[0] = stack[this.points.length];
        stack[1] = min;
        
        var tmp;
        var M = 2;
        for (i = 3; i<=this.points.length; i++) {
            while(this.ccw(stack[M-1], stack[M], stack[i]) <= 0)
                M--;
            M++;
            tmp = stack[i];
            stack[i] = stack[M];
            stack[M] = tmp;
        }
        
        this.indices = new Array(M);
        for (i = 0; i<M; i++) {
            this.indices[i]=stack[i+1];
        }
    }
}


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
    width = document.getElementById("ch-sketch").offsetWidth - 100; 
    console.log(width);
    height = screen.height / 1.4;
    radius = 7;
    console.log(height);
    var cnv = createCanvas(width, height);
    cnv.parent("ch-sketch")
    node_color = color(0, 146, 204);
    stroke_color = color(0, 146, 204);
    center_color = color(227, 34, 34)
    stroke(stroke_color);
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
    redraw_points(datapoints, radius);
    fill(node_color);
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
    redraw_points(points);
    fill_center(temp2);
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
    redraw_points(points, radius);
    $("#number_of_points").val("");

});


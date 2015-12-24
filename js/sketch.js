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
        return (this.points[p2].x - this.points[p1].x)*(this.points[p3].y - this.points[p1].y) - (this.points[p2].y - this.points[p1].y)*(this.points[p3].x - this.points[p1].x);
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

// Example 1-1: stroke and fill

var points = [];

function Point( x, y ){
    this.x = x;
    this.y = y;
}

function setup() {
    createCanvas(800, 480);
}


function add_point( mouseX, mouseY, radius ){
    ellipse(mouseX, mouseY, radius, radius);
    points.push(new Point(mouseX, mouseY));
}

function redraw_points(datapoints, radius)
{
    for (var i = datapoints.length - 1; i >= 0; i--) {
        p = datapoints[i];
        ellipse(p.x, p.y, radius, radius);
    };
}

function mousePressed() {
    var radius = 5
    background(255);
    redraw_points(points, radius)
    fill(0);
    add_point(mouseX, mouseY, radius);
    draw_hulls(points);
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


// // returns the points not on the hull
// function jarvis_march( datapoints ) {
//     var hull_indices = [];
//     var anchor_index = x_max(datapoints);
//     var trimmed_points;
//     do {
//         hull_indices.push(anchor_index)
//         p = datapoints[anchor_index];
//         anchor_index = next_hull_point(datapoints, p);
//         console.log('anchor_index: ' + anchor_index)
//         console.log('hull_point: ' + hull_indices[0])
//     } while ((anchor_index != -1) && (anchor_index != hull_indices[0]))
//     connect_points(points, hull_indices)
//     return 0;
// }
function connect_points( datapoints, indices ) {
    console.log(points.length)
    for (var i = indices.length - 1; i >= 0; i--) {
        p = datapoints[indices[i]];
        q = datapoints[indices[(i + 1) % indices.length]];
        line(p.x, p.y, q.x, q.y);
        stroke(126);
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

function draw_hulls(datapoints) {
    var temp = datapoints.slice();
    // if ( temp.length > 2 ) {
    //     temp = jarvis_march(temp);
    // }
    var hull = new ConvexHull();
    while(temp.length > 2) {
        hull.compute(temp);
        var indices = hull.getIndices();
        connect_points(temp, indices);
        temp = strip_indices(temp, indices);
    }

}
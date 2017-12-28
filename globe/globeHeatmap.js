/**
 * Created by vision on 16/5/12.
 */

function latLongTo2dCoordinate(latitude, longitude, mapWidth, mapHeight) {


    var pos = {};

    // Get X value
    pos.x = (mapWidth * (longitude) / 360) % mapWidth + (mapWidth / 2);
    // pos.x = (longitude+180)*(mapWidth/360);

    // Convert from degrees to radians
    var latRad = latitude * Math.PI / 180;

    // Get Y value
    var mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2))) * Math.cos(latRad / Math.PI * 2); // Close enough
    pos.y = (mapHeight / 2) - (mapWidth * mercN / (2 * Math.PI));
    // var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
    // pos.y  = (mapHeight/2)-(mapWidth*mercN/(2*Math.PI));

    if (isNaN(pos.y) || isNaN(pos.x)) {
        throw new Error('Failed to calculate position for ' + latitude + ',' + longitude);
    }
    return pos;
}

function buildHeatmap(globe) {

    var buffer = globe.world.geoMetry.grid.buffer;
    var elementsCount = globe.world.geoMetry.grid.elementsCount;
    var elements = globe.world.geoMetry.grid.elements;
    var context = globe.context;
    var camera = globe.camera;

    var canvas = document.createElement("canvas");

    canvas.width = 1440;    //地球平铺后的宽度
    canvas.height = 720;    //地球平铺后的高度
   
    globe.heatmap = createWebGLHeatmap({
        canvas: canvas,
        intensityToAlpha: true,
        width: canvas.width,
        height: canvas.height
    });


    var program = getProgram(context, "heatmap");
    var texture = globe.heatmap.texture = createTexture2D(context);

    globe.bind("render.end", function () {

        var gridProgram = program.use();
        context.enable(context.DEPTH_TEST);
        context.enable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.ONE);
        context.depthMask(false);

        gridProgram.uniformMatrix4fv("mvp", camera.mvp);
        gridProgram.uniformSampler2D("texture", texture);
        gridProgram.uniform1f("blend", camera.blend);
        context.bindBuffer(context.ARRAY_BUFFER, buffer);
        gridProgram.vertexAttribPointer("position", 3, context.FLOAT, false, 56, 0);
        gridProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, 56, 24);
        gridProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, false, 56, 48);

        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, elements);
        context.drawElements(context.TRIANGLES, elementsCount, context.UNSIGNED_SHORT, 0);

        // context.depthMask(true);
        // context.disable(context.BLEND);

    });
    globe.bind("resize", function () {
        this.heatmap.adjustSize();
    });
}
Globe.prototype.addPoint = function (x, y, size, value) {
    if (!this.heatmap) {
        buildHeatmap(this);
        return this;
    }
    var canvas = this.heatmap.canvas;
    var context = this.context;
    var texture = this.heatmap.texture;
    var pos = latLongTo2dCoordinate(x, y, canvas.width, canvas.height);

    this.heatmap.addPoint(pos.x, pos.y, size, value);
    this.heatmap.update();
    this.heatmap.display();
    context.bindTexture(context.TEXTURE_2D, texture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 0);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, canvas);
    return this;
};

var shaderText = 'attribute vec3 position;\nattribute vec3 position2;\n' +
    'attribute vec2 texcoord;\n' +
    'varying vec2 v_texcoord;\n' +
    'uniform mat4 mvp;\n' +
    'uniform sampler2D texture;\n' +
    'uniform float blend;' +
    "\n\n" +
    'void main() {\n' +
    '   vec3 P = mix(position, position2, blend);\n' +
    '   gl_Position = mvp * vec4(P, 1.0);\n' +
    '   v_texcoord = texcoord;\n' +
    '}' +
    "\n\n" +
    'void main() {\n' +
    '   gl_FragColor.rgb = texture2D(texture, v_texcoord).rgb;\n' +
    '   gl_FragColor.a = 1.0;\n' +
    '}\n';

var shader = shaderText.split("\n\n");

registerShaders("heatmap", shader[0], shader[1], shader[2]);


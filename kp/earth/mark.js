/**
 * Created by vision on 16/4/13.
 */

var markShaders = {
    mark: {
        main: "attribute vec2 coord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform mat4 mat;\nuniform vec3 pos;\nuniform sampler2D t_sharp;\nuniform sampler2D t_fuzzy;\nuniform vec4 color;\nuniform float scale;\nuniform float fuzz;\n",
        vertex: "void main() {\n    v_texcoord = vec2(coord.x, 1.0 - coord.y);\n    vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        fragment: "void main() {\n    vec4 C = mix(texture2D(t_sharp, v_texcoord), texture2D(t_fuzzy, v_texcoord), fuzz);\n    float alpha = C.x;\n    gl_FragColor = vec4(color.xyz, alpha);\n}",
    },
    mark_pick: {
        main: "attribute vec2 coord;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform mat3 bill;\n uniform vec3 pos;\n uniform float color;\n uniform float scale;",
        vertex: "void main() {\n   v_texcoord = vec2(coord.x, 1.0 - coord.y);\n   vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n   gl_Position = mvp * vec4(P, 1.0);\n  }",
        fragment: "void main() {\n   gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n }"
    },
    connector: {
        main: "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        vertex: "void main() {\n    vec3 P = position.xyz;\n    float side = position.w;\n    if (side > 0.5)\n        gl_Position = mvp * vec4(P, 1.0);\n    else\n        gl_Position = vec4(P, 1.0);\n}\n",
        fragment: "void main() {\n    gl_FragColor = color;\n}\n\n\n"

    }
};
each(markShaders, function (shader, name) {
    registerShaders(name, shader.main, shader.vertex, shader.fragment);
});

function Mark(controller, marks) {
    var self = this,
        context;

    context = self.context = controller.context;
    self.container = controller.element;
    self.camera = controller.camera;

    //顶点数组,2矩阵
    self.buffer = makeVertexBuffer(context, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]));

    //默认纹理
    self.texture = loadTexture2D(context, resource("textures/logo.png"), {mipmap: false});

    self.markProgram = getProgram(context, "mark");
    self.pickProgram = getProgram(context, "mark_pick");

    self.marks = [];

    self.hoveredMark = -1;

    self.shownMark = null;

    each(marks, function (mark) {
        self.addMark(mark);
    });

    self.connector = new Connector(context, self.camera);

    self.element = document.createElement("div");
    each({
            display: "inline-block",
            position: "absolute",
            backgroundColor: "#FFFFFF",
            color: "#19241e",
            overflow: "hidden",
            zIndex: 10,
            opacity: 0,
            top: "260px",
            left: "150px",
            width: "236px",
            marginLeft: " -117px",
            marginTop: "-124px",
            height: "200px"
        },
        function (value, key) {
            self.element.style[key] = value;
        }
    )
    ;
    controller.element.appendChild(self.element);

    return self;
}

Mark.prototype = {
    /**
     * 添加一个标记
     * @param mark
     * @returns {Mark}
     */
    addMark: function (mark) {
        var self = this,
            context = self.context;

        if (isArray(mark.coord) && mark.coord.length >= 2) {
            vec3.fromValues(mark.coord[0], mark.coord[1], pick(mark.coord[2], 0));

            //回调函数
            if (isFunction(mark.texture)) {

                mark.texture = caller(mark.texture, context, mark, self);
                //图片链接
            } else if (isString(mark.texture)) {

                mark.texture = loadTexture2D(context, mark.texture, {mipmap: false});
                //使用默认纹理
            } else {
                mark.texture = self.texture;
            }
            //尺寸比例
            mark.scale = pick(mark.scale, .05);

            self.marks.push(mark);
        }
        return self;
    },
    /**
     * 渲染
     * @returns {Mark}
     */
    render: function () {
        var self = this,
            camera = self.camera,
            context = self.context;

        context.enable(context.DEPTH_TEST);
        context.enable(context.BLEND);
        context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);
        context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        bindVertexBuffer(context, self.buffer);
        var program = self.markProgram.use();

        program.uniformMatrix3fv("bill", camera.bill);
        program.uniformMatrix4fv("mvp", camera.mvp);

        program.vertexAttribPointer("coord", 2, context.FLOAT, false, 0, 0);

        each(self.marks, function (mark) {

            var pos = vec3.create();

            program.uniform1f("scale", mark.scale);

            program.uniformSampler2D("t_sharp", mark.texture);
            camera.projection(pos, mark.coord);

            program.uniform3fv("pos", pos);

            context.drawArrays(context.TRIANGLE_STRIP, 0, 4);

        });
        self.connector.render();
        return self;
    },
    /**
     * 高亮一个标记
     * @param index
     * @returns {*}
     */
    hoverMark: function (index) {
        var self = this,
            mark = self.marks[index],
            context = self.context;

        if (!mark) {
            self.hoveredMark = -1;
            return false;
        }
        if (isFunction(mark.hover)) {
            caller(mark.hover, context, mark, self);
        }

        self.hoveredMark = index;
        console.log("mark: " + mark.name + " hovered!");
        return self;
    },
    /**
     * 显示标记弹窗
     * @param markIndex
     */
    showMark: function (markIndex) {
        var self = this,
            mark = self.marks[markIndex];
        self.element.style.opacity = 1;
        self.connector.clear();
        self.shownMark = mark;
        self.connector.addLine(self.element, mark.coord);
    },
    /**
     * 隐藏mark
     */
    hideMark: function () {
        var self = this;
        this.connector.clear();
        this.shownMark = null;

        var clear = setInterval(function () {
            self.element.style.opacity -= .06;
            if (self.element.style.opacity <= 0) {
                clearInterval(clear);
            }
        }, 20);
    },
    /**
     * 根据鼠标的平面左边计算出投影到哪个标记
     * @param mouseX
     * @param mouseY
     * @param range
     * @returns {boolean}
     */
    pick: function (mouseX, mouseY, range) {
        var self = this,
            context = self.context,
            camera = self.camera,
            data = new Uint8Array(range * range << 2),
            viewport = camera.viewport,
            mvp = mat4.create();

        range = pick(range, 2);

        mat4.identity(mvp);
        mat4.translate(mvp, mvp, [
            (viewport[2] - 2 * (mouseX - viewport[0])) / range,
            -(viewport[3] - 2 * (mouseY - viewport[1])) / range,
            0
        ]);

        mat4.scale(mvp, mvp, [viewport[2] / range, viewport[3] / range, 1]);
        mat4.multiply(mvp, mvp, camera.mvp);

        if (!self.framebuffer) {
            self.framebuffer = getFrameBuffer(context, range);
        }

        context.viewport(0, 0, range, range);
        context.bindFramebuffer(context.FRAMEBUFFER, self.framebuffer);
        context.clearColor(0, 0, 1, 0);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.disable(context.BLEND);
        context.enable(context.CULL_FACE);
        context.cullFace(context.BACK);
        context.enable(context.DEPTH_TEST);

        bindVertexBuffer(context, self.buffer);

        var program = self.pickProgram.use();

        program.uniformMatrix4fv("mvp", mvp);
        program.uniformMatrix3fv("bill", camera.bill);
        program.vertexAttribPointer("coord", 2, context.FLOAT, false, 0, 0);

        each(self.marks, function (mark, index) {
            var pos = vec3.create();
            camera.projection(pos, mark.coord);
            program.uniform3fv("pos", pos);
            program.uniform1f("scale", mark.scale);
            program.uniform1f("color", index / 255);
            context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        });

        context.disable(context.CULL_FACE);
        context.disable(context.DEPTH_TEST);
        context.readPixels(0, 0, range, range, context.RGBA, context.UNSIGNED_BYTE, data);

        context.bindFramebuffer(context.FRAMEBUFFER, null);
        context.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);

        var index = -1,
            m = 0,
            d = {};

        for (var b = 0; b < data.length; b += 4) {
            if (data[b + 3]) {
                var y = data[b + 1] << 8 | data[b + 0],
                    T = d[y] || 0;
                d[y] = ++T;
                T > m && (index = y, m = T)
            }
        }

        return index;
    }
};

function Connector(context, camera) {
    var self = this;

    self.context = context;

    self.camera = camera;

    self.verts = new Float32Array(8 * 20);

    self.buffer = makeVertexBuffer(context, self.verts);

    self.program = getProgram(context, "connector");

    self.lines = 0;

}

Connector.prototype = {
    addLine: function (element, coord) {
        var context = this.context,
            verts = this.verts,
            canvas = context.canvas,
            elementRect = element.getBoundingClientRect(),
            canvasRect = canvas.getBoundingClientRect(),
            left = elementRect.left + .5 * elementRect.width,
            top = elementRect.top + .5 * elementRect.height;

        left -= canvasRect.left;
        top -= canvasRect.top;
        var from = vec3.create(),
            to = vec3.create();

        from[0] = 2 * (left / canvas.width - .5);
        from[1] = -2 * (top / canvas.height - .5);
        this.camera.projection(to, coord);

        var r = 8 * this.lines;
        vec3.save(from, verts, r + 0);
        verts[r + 3] = 0;
        vec3.save(to, verts, r + 4);
        verts[r + 7] = 1;
        ++this.lines;
        bindVertexBuffer(context, this.buffer);
        context.bufferSubData(context.ARRAY_BUFFER, 0, verts)
    },
    clear: function () {
        this.lines = 0;
    },
    render: function () {
        var self = this,
            gl = self.context,
            camera = self.camera,
            r = 1;

        gl.disable(gl.DEPTH_TEST);
        var program = self.program.use();

        program.uniformMatrix4fv("mvp", camera.mvp);
        program.uniform4f("color", r, r, r, 1);
        bindVertexBuffer(gl, self.buffer);
        program.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0);
        if (self.lines > 0) {
            gl.drawArrays(gl.LINES, 0, 2 * self.lines)
        }
    }
};
/**
 * Created by vision on 16/4/13.
 */
import Connector from './Connector';

import {
    makeVertexBuffer,
    loadTexture2D,
    isString,
    isFunction,
    caller,
    pick,
    isArray,
    vec3,
    bindVertexBuffer,
    each,
    mat4,
    resource,
    getProgram,
    getFrameBuffer
} from './helper';

export default class Mark {
    constructor(controller, marks) {
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

    /**
     * 添加一个标记
     * @param mark
     * @returns {Mark}
     */
    addMark(mark) {
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
    }

    /**
     * 渲染
     * @returns {Mark}
     */
    render() {
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
    }

    /**
     * 高亮一个标记
     * @param index
     * @returns {*}
     */
    hoverMark(index) {
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
    }

    /**
     * 显示标记弹窗
     * @param markIndex
     */
    showMark(markIndex) {
        var self = this,
            mark = self.marks[markIndex];
        self.element.style.opacity = 1;
        self.connector.clear();
        self.shownMark = mark;
        self.connector.addLine(self.element, mark.coord);
    }

    /**
     * 隐藏mark
     */
    hideMark() {
        var self = this;
        this.connector.clear();
        this.shownMark = null;

        var clear = setInterval(function () {
            self.element.style.opacity -= .06;
            if (self.element.style.opacity <= 0) {
                clearInterval(clear);
            }
        }, 20);
    }

    /**
     * 根据鼠标的平面左边计算出投影到哪个标记
     * @param mouseX
     * @param mouseY
     * @param range
     * @returns {boolean}
     */
    pick(mouseX, mouseY, range) {
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

}


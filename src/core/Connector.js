import {
    vec3,
    bindVertexBuffer,
    makeVertexBuffer,
    getProgram
} from './helper';

export default class Connector {
    constructor(context, camera) {
        var self = this;

        self.context = context;

        self.camera = camera;

        self.verts = new Float32Array(8 * 20);

        self.buffer = makeVertexBuffer(context, self.verts);

        self.program = getProgram(context, "connector");

        self.lines = 0;
    }

    addLine(element, coord) {
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
    }

    clear() {
        this.lines = 0;
    }

    render() {
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
}

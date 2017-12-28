/**
 * 着色器的Program
 * @param e
 * @param gl
 * @constructor
 */
export default class Program {
    constructor(e, gl) {
        this.gl = gl;
        this.name = e;
        this.program = null;
        this.attribs = {};
        this.uniforms = {};
        this.enabledMask = 0;
        this.maxEnabledIndex = -1;
    }

    setProgram(program) {
        var self = this,
            gl = self.gl;

        function t(e) {
            if (e.type == gl.SAMPLER_2D || e.type == gl.SAMPLER_CUBE) {
                var t = a;
                return a += e.size, t
            }
            return -1
        }

        self.program = program;
        var r = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (var n = 0; r > n; ++n) {
            var o = gl.getActiveAttrib(program, n);
            self.attribs[o.name] = {
                index: gl.getAttribLocation(program, o.name),
                name: o.name,
                size: o.size,
                type: o.type
            }
        }
        for (var a = 0, i = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS), n = 0; i > n; ++n) {
            var u = gl.getActiveUniform(program, n);
            this.uniforms[u.name] = {
                location: gl.getUniformLocation(program, u.name),
                name: u.name,
                size: u.size,
                type: u.type,
                texUnit: t(u)
            }
        }
    }

    disableAll() {
        for (var e = 0; e <= this.maxEnabledIndex; ++e) {
            var t = 1 << e;
            t & this.enabledMask && this.gl.disableVertexAttribArray(e)
        }
        this.enabledMask = 0;
        this.maxEnabledIndex = -1;
        return this;
    }

    enable(e) {
        var t = 1 << e;
        if (!(t & this.enabledMask)) {
            this.gl.enableVertexAttribArray(e);
            this.enabledMask |= t;
            this.maxEnabledIndex = Math.max(this.maxEnabledIndex, e);
        }
        return this;
    }

    disable(e) {
        var t = 1 << e;
        t & this.enabledMask && (this.gl.disableVertexAttribArray(e), this.enabledMask &= ~t)
        return this;
    }

    use() {
        this.gl.useProgram(this.program);
        return this.disableAll();
    }

    getUniformLocation(e) {
        var t = this.uniforms[e];
        return t ? t.location : null
    }

    getAttribIndex(e) {
        var t = this.attribs[e];
        return t ? t.index : -1
    }

    uniform1i(e, t) {
        var r = this.getUniformLocation(e);
        r && this.gl.uniform1i(r, t)
    }

    uniform1f(e, t) {
        var r = this.getUniformLocation(e);
        r && this.gl.uniform1f(r, t)
    }

    uniform2f(e, t, r) {
        var n = this.getUniformLocation(e);
        n && this.gl.uniform2f(n, t, r)
    }

    uniform3f(e, t, r, n) {
        var o = this.getUniformLocation(e);
        o && this.gl.uniform3f(o, t, r, n)
    }

    uniform4f(e, t, r, n, o) {
        var a = this.getUniformLocation(e);
        a && this.gl.uniform4f(a, t, r, n, o)
    }

    uniform1fv(e, t) {
        var r = this.getUniformLocation(e);
        r && this.gl.uniform1fv(r, t)
    }

    uniform2fv(e, t) {
        var r = this.getUniformLocation(e);
        r && this.gl.uniform2fv(r, t)
    }

    uniform3fv(e, t) {
        var r = this.getUniformLocation(e);
        r && this.gl.uniform3fv(r, t)
    }

    uniform4fv(e, t) {
        var r = this.getUniformLocation(e);
        r && this.gl.uniform4fv(r, t)
    }

    uniformMatrix3fv(e, t, r) {
        var n = this.getUniformLocation(e);
        n && (r = r || !1, this.gl.uniformMatrix3fv(n, r, t))
    }

    uniformMatrix4fv(e, t, r) {
        var n = this.getUniformLocation(e);
        n && (r = r || false, this.gl.uniformMatrix4fv(n, r, t))
    }

    uniformSampler(e, t, r) {
        var n = this.uniforms[e];
        n && (this.gl.activeTexture(this.gl.TEXTURE0 + n.texUnit), this.gl.bindTexture(t, r), this.gl.uniform1i(n.location, n.texUnit))
    }

    uniformSampler2D(e, t) {
        this.uniformSampler(e, this.gl.TEXTURE_2D, t)
    }

    uniformSamplerCube(e, t) {
        this.uniformSampler(e, this.gl.TEXTURE_CUBE_MAP, t)
    }

    enableVertexAttribArray(e) {
        var t = this.attribs[e];
        t && this.enable(t.index)
    }

    disableVertexAttribArray(e) {
        var t = this.attribs[e];
        t && this.disable(t.index)
    }

    vertexAttribPointer(e, t, r, n, o, i) {
        var u = this.attribs[e];
        if (u) {
            this.enable(u.index);
            this.gl.vertexAttribPointer(u.index, t, r, n, o, i)
        }
    }

}

/**
 * Created by vision on 16/4/12.
 */

var worldShaders = {
    map_pick: {
        main: "attribute vec3 position;\nuniform mat4 mvp;\nuniform float color;\n",
        vertex: "void main() {\n    vec3 P = position;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        fragment: "void main() {\n    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n}\n"
    },
    map_main: {
        main: "attribute vec3 position;\nattribute vec3 normal;\nattribute vec3 position2;\nattribute vec3 normal2;\nattribute vec2 texcoord;\nvarying vec3 v_normal;\nvarying vec2 v_texcoord;\nvarying vec3 v_light_vec;\nvarying vec3 v_view_vec;\nuniform mat4 mvp;\nuniform float offset_x;\n\nuniform sampler2D t_blur;\nuniform float blend;\nuniform vec3 light_pos;\nuniform vec3 view_pos;\n\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float tone;\nuniform float alpha;\nuniform float height;\n",
        vertex: "void main() {\n    vec3 P = mix(position, position2, blend);\n    P.x += offset_x;\n\n    v_normal = mix(normal, normal2, blend);\n    P += height * v_normal;\n\n    gl_Position = mvp * vec4(P, 1.0);\n\n    v_texcoord = texcoord;\n    v_light_vec = light_pos - P;\n    v_view_vec = view_pos - P;\n}\n",
        fragment: "void main() {\n    vec3 N = normalize(-v_normal);\n    vec3 V = normalize(v_view_vec);\n    vec3 L = normalize(v_light_vec);\n    vec3 H = normalize(L + V);\n    float NdotL = max(0.0, dot(N, L));\n    float NdotH = max(0.0, dot(N, H));\n\n    float blur = texture2D(t_blur, v_texcoord).r;\n    blur = 1.0*pow(blur, 2.0);\n\n    float diffuse = 0.5 + 0.5*NdotL;\n    float specular = 0.75 * pow(NdotH, 15.0);\n\n    gl_FragColor.rgb = diffuse * mix(color0, color1, tone) + vec3(specular);\n    gl_FragColor.a = alpha;\n}\n"
    },
    map_grid: {
        main: "attribute vec3 position;\nattribute vec3 position2;\nattribute vec2 texcoord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform vec2 pattern_scale;\nuniform sampler2D t_blur;\nuniform sampler2D t_pattern;\nuniform float blend;\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float offset_x;\n",
        vertex: "void main() {\n    vec3 P = mix(position, position2, blend);\n    P.x += offset_x;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = texcoord;\n}\n",
        fragment: "void main() {\n    float pattern = texture2D(t_pattern, pattern_scale * v_texcoord).r;\n    float blur = texture2D(t_blur, v_texcoord).r;\n\n    gl_FragColor.rgb = mix(color0, color1, blur) + vec3(pattern);\n    gl_FragColor.a = 1.0;\n}\n"
    },
    map_line: {
        main: "attribute vec3 position;\nattribute vec3 normal;\nattribute vec3 position2;\nattribute vec3 normal2;\nuniform mat4 mvp;\nuniform vec4 color;\nuniform float blend;\nuniform float height;\n",
        vertex: "void main() {\n    vec3 P = mix(position, position2, blend);\n    vec3 N = mix(normal, normal2, blend);\n    P += height * N;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        fragment: "void main() {\n    gl_FragColor = color;\n}\n\n"
    },
    map_label: {
        main: "attribute vec3 position;\n attribute vec2 texcoord;\n varying float v_alpha;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform vec4 color;\nuniform vec4 circle_of_interest;\n uniform bool inside;\n uniform sampler2D t_color;",
        vertex: "void main() {\n    gl_Position = mvp * vec4(position, 1.0);\n    v_alpha = max(0.0, 1.0 - distance(position, circle_of_interest.xyz)/circle_of_interest.a);\n    if (!inside)\n        v_alpha = pow(1.0 - v_alpha, 6.0);\n    v_texcoord = texcoord;\n}\n",
        fragment: "void main() {\n    gl_FragColor = texture2D(t_color, v_texcoord);\n    gl_FragColor.a = 0.7 * v_alpha;\n}"
    },
    stars: {
        main: "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        vertex: "void main() {\n    gl_PointSize = position.w;\n    gl_Position = mvp * vec4(position.xyz, 1.0);\n}\n",
        fragment: "void main() {\n    gl_FragColor = color;\n}\n"
    },
    corona: {
        main: "attribute vec4 vertex;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform sampler2D t_smoke;\nuniform float time;\nuniform vec4 color;\n",
        vertex: "void main() {\n    float s = 10.0 + (10.0 * vertex.w);\n    vec3 P = vec3(s * vertex.xy, 0);\n    P = bill * P;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = vertex.zw;\n}\n",
        fragment: "void main() {\n    vec2 uv = vec2(5.0*v_texcoord.x + 0.01*time, 0.8 - 1.5*v_texcoord.y);\n    float smoke = texture2D(t_smoke, uv).r;\n    uv = vec2(3.0*v_texcoord.x - 0.007*time, 0.9 - 0.5*v_texcoord.y);\n vec3 color1 = vec3(0,0,0);\n   smoke *= 1.5*texture2D(t_smoke, uv).r;\n\n    float t = pow(v_texcoord.y, 0.25);\n    gl_FragColor.rgb = mix(color.rgb,color1, t) + 0.3*smoke;\ngl_FragColor.a = color.a;\n}\n",

    }
};
each(worldShaders, function (shader, name) {
    registerShaders(name, shader.main, shader.vertex, shader.fragment);
});

function World(controller) {
    var self = this,
        context = self.context = controller.context;

    self.controller = controller;

    //国家列表
    self.countries = [];
    self.countriesByCode = {};

    each(Countries.countries, function (country, index) {
        //国家索引
        country.index = index;
        //解密国家边界线
        country.border = Base64.decode(country.border, Uint16Array);

        country.center = vec3.fromValues(country.center[0], country.center[1], country.center[2] || 0);

        country.tone = country.tone || MATH_RANDOM();

        self.countries.push(country);
        self.countriesByCode[country.code] = country;
    });

    //geo信息
    self.geom = Countries.geom;

    /**
     * 地球背景图比例
     * @type {number[]}
     */
    self.pattern_scale = [1440, 720];

    /**
     * 海岸线高度
     * @type {number}
     */
    self.coastHeight = pick(controller.options.coast.height, .014);

    self.labelSize = 2048;

    /**
     * 已有缓冲区
     * @type {{map: {vert: null, face: null, line: null}, grid: {vert: null, elem: null}, labels: {vert: null, label: *}}}
     */
    self.buffers = {
        map: {
            vert: null,
            face: null,
            line: null
        },
        grid: {
            vert: null,
            elem: null
        },
        labels: {
            vert: null
        },
        stars: {
            vert: null
        },
        corona: {
            vert: null
        }
    };
    self.border = {
        buffer: context.createBuffer(),
        count: 0
    };
    self.buildGrid();
    self.programs = {
        main: getProgram(context, "map_main"),
        grid: getProgram(context, "map_grid"),
        line: getProgram(context, "map_line"),
        pick: getProgram(context, "map_pick"),
        label: getProgram(context, "map_label"),
        stars: getProgram(context, "stars"),
        corona: getProgram(context, "corona")
    };
    self.textures = {
        blur: loadTexture2D(context, resource("texture/map_blur.jpg")),
        pattern: loadTexture2D(context, resource("texture/pattern.png"), {
            mipmap: true,
            wrap: context.REPEAT,
            aniso: 4
        }),
        labels: createTexture2D(context, {
            size: self.labelSize,
            mipmap: true,
            min: context.LINEAR_MIPMAP_LINEAR,
            aniso: 4,
            format: context.LUMINANCE
        }),
        corona: loadTexture2D(context, resource("texture/smoke.jpg"), {
            mipmap: true,
            wrapS: context.REPEAT,
            wrapT: context.CLAMP_TO_EDGE
        })
    };

    context.generateMipmap(context.TEXTURE_2D);

    /**
     * 已渲染hover效果的国家索引
     * @type {number}
     */
    self.borderedCountry = -1;

    /**
     * 当前高亮的国家索引
     * @type {number}
     */
    self.hoveredCountry = -1;
    self.buildCorona();
    self.buildStars();
    self.buildMetry();

    self.buildLabels();
}

World.prototype = {
    /**
     * 构造背景星星
     * @returns {World}
     */
    buildStars: function () {
        var self = this,
            context = self.context,
            count = self.controller.options.stars.count;

        var e = vec3.create(),
            r = new FLOAT_ARRAY(count << 2);
        for (var n = 0; n < r.length; n += 4) {
            Random.unitVec3(e);
            vec3.scale(e, e, 50);
            r[n + 0] = e[0];
            r[n + 1] = e[1];
            r[n + 2] = e[2];
            r[n + 3] = lerp(.1, 2.5, MATH_POW(MATH_RANDOM(), 10));
        }
        self.buffers.stars.vert = makeVertexBuffer(context, r);
        return self;
    },
    /**
     * 画星星
     */
    drawStars: function () {
        var self = this,
            context = self.context,
            camera = self.controller.camera,
            mvp = mat4.create(),
            options = self.controller.options.stars;

        mat4.copy(mvp, camera.view);
        mvp[12] = 0;
        mvp[13] = 0;
        mvp[14] = 0;

        mat4.multiply(mvp, camera.proj, mvp);

        context.disable(context.DEPTH_TEST);
        context.enable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.ONE);
        var program = self.programs.stars.use();

        program.uniformMatrix4fv("mvp", mvp);
        var color = color2vec3(options.color);
        program.uniform4f("color", color[0], color[1], color[2], pick(options.alpha, .5));

        bindVertexBuffer(context, self.buffers.stars.vert);
        program.vertexAttribPointer("position", 4, context.FLOAT, false, 0, 0);
        context.drawArrays(context.POINTS, 0, options.count);
        return self;
    },
    /**
     * 构造日日冕
     */
    buildCorona: function () {
        var self = this,
            context = self.context,
            e = [],
            r = 128;
        for (var n = 0; r + 1 > n; ++n) {
            var o = 2 * MATH_PI * n / r,
                a = n / (r + 1),
                i = MATH_COS(o),
                u = MATH_SIN(o);
            e.push(i, u, a, 0, i, u, a, 1)
        }

        self.coronaVertexCount = e.length / 4;
        self.buffers.corona.vert = makeVertexBuffer(context, new Float32Array(e));
        return self;
    },
    /**
     * 画日冕
     * @returns {World}
     */
    drawCorona: function () {
        var self = this,
            context = self.context,
            camera = self.controller.camera,
            coronaProgram = self.programs.corona.use(),
            options = self.controller.options.corona;

        coronaProgram.uniformMatrix4fv("mvp", camera.mvp);
        coronaProgram.uniformMatrix3fv("bill", camera.bill);
        coronaProgram.uniformSampler2D("t_smoke", self.textures.corona);

        context.disable(context.CULL_FACE);
        context.enable(context.BLEND);

        context.blendFunc(context.SRC_ALPHA, context.ONE);
        var color = color2vec3(options.color);

        coronaProgram.uniform4f("color", color[0], color[1], color[2], pick(options.alpha, 1));

        bindVertexBuffer(context, self.buffers.corona.vert);

        coronaProgram.vertexAttribPointer("vertex", 4, context.FLOAT, !1, 0, 0);
        context.drawArrays(context.TRIANGLE_STRIP, 0, self.coronaVertexCount);
        context.disable(context.BLEND);
        return self;
    },
    /**
     * 构造地球背景网格
     */
    buildGrid: function () {
        var self = this,
            context = self.context;

        function t(e, t) {
            return 181 * e + t
        }

        var n = [],
            o = [],
            a = vec3.create();
        a[2] = -self.coastHeight;
        var i = vec3.create(),
            u = vec3.create(),
            c = vec2.create();

        for (var l = -180; 180 >= l; l += 1) {
            for (var s = -90; 90 >= s; s += 1) {
                vec2.set(a, l, s);
                vec2.set(c, (l + 180) / 360, 1 - (s + 90) / 180);
                project_mercator(i, a);
                vec3.set(u, 0, 0, -1);
                arrayPush(n, i, u);
                project_ecef(i, a);
                vec3.normalize(u, i);
                arrayPush(n, i, u);
                arrayPush(n, c);

            }
        }
        for (var f = 0; 360 > f; ++f) {
            for (var v = 0; 180 > v; ++v) {
                o.push(t(f, v), t(f + 1, v), t(f + 1, v + 1), t(f + 1, v + 1), t(f, v + 1), t(f, v));
            }
        }
        self.buffers.grid.vert = makeVertexBuffer(context, new Float32Array(n));
        self.buffers.grid.elem = makeElementBuffer(context, new Uint16Array(o));
        self.grid_elem_count = o.length;
        self.grid_vert_stride_bytes = 56
    },
    /**
     * 画地球背景网格
     * @returns {World}
     */
    drawGrid: function () {
        var self = this,
            context = self.context,
            camera = self.controller.camera,
            options = self.controller.options.grid,
            grid_stride_bytes = self.grid_vert_stride_bytes,
            gridProgram = self.programs.grid.use();

        gridProgram.uniformMatrix4fv("mvp", camera.mvp);
        gridProgram.uniformSampler2D("t_blur", self.textures.blur);
        gridProgram.uniformSampler2D("t_pattern", self.textures.pattern);
        gridProgram.uniform2fv("pattern_scale", self.pattern_scale);
        gridProgram.uniform1f("blend", self.blend);
        var color0 = color2vec3(options.color0);
        var color1 = color2vec3(options.color1);
        gridProgram.uniform3f("color0", color0[0], color0[1], color0[2]);
        gridProgram.uniform3f("color1", color1[0], color1[1], color1[2]);

        bindVertexBuffer(context, self.buffers.grid.vert);
        gridProgram.vertexAttribPointer("position", 3, context.FLOAT, false, grid_stride_bytes, 0);
        gridProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, grid_stride_bytes, 24);
        gridProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, false, grid_stride_bytes, 48);
        gridProgram.uniform4f("color", 1, 1, 1, 1);
        bindElementBuffer(context, self.buffers.grid.elem);
        gridProgram.uniform1f("offset_x", 0);
        context.drawElements(context.TRIANGLES, self.grid_elem_count, context.UNSIGNED_SHORT, 0);

        if (self.blend < .25) {
            gridProgram.uniform1f("offset_x", -20);
            context.drawElements(context.TRIANGLES, self.grid_elem_count, context.UNSIGNED_SHORT, 0);
            gridProgram.uniform1f("offset_x", 20);
            context.drawElements(context.TRIANGLES, self.grid_elem_count, context.UNSIGNED_SHORT, 0);
        }

        return self;
    },
    /**
     * 构造地球模型
     */
    buildMetry: function () {
        var self = this,
            context = self.context,
            vertexs = [],
            geom = {
                faces: Base64.decode(self.geom.faces, Uint16Array),
                lines: Base64.decode(self.geom.lines, Uint16Array),
                coast: Base64.decode(self.geom.coast, Uint16Array),
                verts: Base64.decode(self.geom.verts, Int16Array)
            },
            vertsLength = geom.verts.length,
            faces = Array.apply([], geom.faces),
            i = vec3.create(),
            _ = vec3.create(),
            b = vec3.create(),
            y = 14,
            addVert = function () {
                var a = vec3.create(),
                    u = vec2.create();
                return function (e, t) {
                    a[0] = 180 * geom.verts[2 * e + 0] / 32768;
                    a[1] = 90 * geom.verts[2 * e + 1] / 32768;
                    a[2] = t;
                    u[0] = .5 + a[0] / 360;
                    u[1] = .5 - a[1] / 180;
                    var r = vertexs.length / 14;
                    project_mercator(i, a);
                    vertexs.push(i[0], i[1], i[2]);
                    vertexs.push(0, 0, 0);
                    project_ecef(i, a);
                    vertexs.push(i[0], i[1], i[2]);
                    vertexs.push(0, 0, 0);
                    vertexs.push(u[0], u[1]);
                    return r
                }
            }();

        for (var l = 0; vertsLength > l; ++l) {
            addVert(l, 0);
        }

        faces.length = geom.faces.length;
        faces.constructor = Array;

        self.coast_start = faces.length;

        for (var l = 0; l < geom.coast.length; l += 2) {
            var coast0 = geom.coast[l + 0],
                coast1 = geom.coast[l + 1],
                p = addVert(coast0, -self.coastHeight),
                g = addVert(coast1, -self.coastHeight),
                f = addVert(coast0, 0),
                v = addVert(coast1, 0);

            faces.push(f, v, p);
            faces.push(v, g, p)
        }

        for (var l = 0; l < faces.length; l += 3) {
            var f = faces[l + 0],
                v = faces[l + 1],
                T = faces[l + 2];
            for (var w = 0; 2 > w; ++w) {
                var E = 6 * w;
                for (var x = 0; 3 > x; ++x) {
                    _[x] = vertexs[y * v + E + x] - vertexs[y * f + E + x];
                    b[x] = vertexs[y * T + E + x] - vertexs[y * f + E + x];
                }
                vec3.cross(i, _, b);
                vec3.normalize(i, i);
                for (var x = 0; 3 > x; ++x) {
                    vertexs[y * f + E + 3 + x] += i[x];
                    vertexs[y * v + E + 3 + x] += i[x];
                    vertexs[y * T + E + 3 + x] += i[x]
                }
            }
        }
        vec3.forEach(vertexs, y, 3, 0, function (e) {
            vec3.normalize(e, e)
        });
        vec3.forEach(vertexs, y, 9, 0, function (e) {
            vec3.normalize(e, e)
        });
        self.coast_count = faces.length - self.coast_start;
        self.buffers.map.vert = makeVertexBuffer(context, new Float32Array(vertexs));
        self.buffers.map.face = makeElementBuffer(context, new Uint16Array(faces));
        self.buffers.map.line = makeElementBuffer(context, new Uint16Array(geom.lines));
        self.face_count = geom.faces.length;
        self.line_count = geom.lines.length;
        self.map_vert_stride_bytes = 56
    },
    /**
     * 绘制地球
     */
    render: function () {
        var self = this,
            context = self.context,
            options = self.controller.options,
            camera = self.controller.camera,
            blend = self.blend = smoothstep(camera.projectionBlend),
            showOffset = .25 > blend,
            countries = self.countries,
            map_stride_bytes = self.map_vert_stride_bytes,
            hoverCountry = (self.hoveredCountry in countries) ? countries[self.hoveredCountry] : false;

        if (options.stars.show) {
            self.drawStars();
        }
        //平面模式不画日冕
        if (camera.globe && options.corona.show) {
            self.drawCorona();
        }
        context.disable(context.BLEND);
        context.enable(context.CULL_FACE);
        context.cullFace(context.BACK);
        context.enable(context.DEPTH_TEST);

        //绘制地球背景网格
        if (options.grid.show) {
            self.drawGrid();
        }

        //画国家
        var mainProgram = self.programs.main.use();
        mainProgram.uniformMatrix4fv("mvp", camera.mvp);
        mainProgram.uniformSampler2D("t_blur", self.textures.blur);
        mainProgram.uniform1f("blend", blend);
        mainProgram.uniform3fv("view_pos", camera.viewPos);
        mainProgram.uniform3fv("light_pos", options.light.position);

        bindVertexBuffer(context, self.buffers.map.vert);
        mainProgram.vertexAttribPointer("position", 3, context.FLOAT, false, map_stride_bytes, 0);
        mainProgram.vertexAttribPointer("normal", 3, context.FLOAT, false, map_stride_bytes, 12);
        mainProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, map_stride_bytes, 24);
        mainProgram.vertexAttribPointer("normal2", 3, context.FLOAT, false, map_stride_bytes, 36);
        mainProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, false, map_stride_bytes, 48);
        mainProgram.uniform1f("alpha", pick(options.country.alpha, 1));
        var color0 = color2vec3(options.country.color0);
        var color1 = color2vec3(options.country.color1);
        mainProgram.uniform3f("color0", color0[0], color0[1], color0[2]);
        mainProgram.uniform3f("color1", color1[0], color1[1], color1[2]);

        bindElementBuffer(context, self.buffers.map.face);

        each(countries, function (country) {
            mainProgram.uniform1f("height", 0);
            mainProgram.uniform1f("tone", country.tone);
            mainProgram.uniform1f("offset_x", 0);
            context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);
            if (showOffset) {
                mainProgram.uniform1f("offset_x", -20);
                context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);
                mainProgram.uniform1f("offset_x", 20);
                context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);
            }
        });

        context.depthFunc(context.LESS);
        /**
         * 画海岸线
         */
        if (options.coast.show) {
            context.disable(context.CULL_FACE);
            mainProgram.uniform1f("tone", .5);
            mainProgram.uniform1f("offset_x", 0);
            context.drawElements(context.TRIANGLES, self.coast_count, context.UNSIGNED_SHORT, self.coast_start << 1);

            if (showOffset) {
                mainProgram.uniform1f("offset_x", -20);
                context.drawElements(context.TRIANGLES, self.coast_count, context.UNSIGNED_SHORT, self.coast_start << 1);
                mainProgram.uniform1f("offset_x", 20);
                context.drawElements(context.TRIANGLES, self.coast_count, context.UNSIGNED_SHORT, self.coast_start << 1);
            }
        }

        context.enable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.ONE);
        context.disable(context.DEPTH_TEST);
        context.enable(context.CULL_FACE);

        if (hoverCountry) {
            mainProgram.uniform1f("tone", 1);
            mainProgram.uniform1f("alpha", .5);
            mainProgram.uniform1f("offset_x", 0);
            mainProgram.uniform1f("height", 0);
            context.drawElements(context.TRIANGLES, hoverCountry.faceCount, context.UNSIGNED_SHORT, hoverCountry.faceOffset << 1)
        }

        context.disable(context.CULL_FACE);

        //画国家边界线
        if (options.boundary.show) {
            context.enable(context.DEPTH_TEST);
            context.depthMask(false);
            var lineProgram = self.programs.line.use();
            var color = color2vec3(options.boundary.color);
            lineProgram.uniformMatrix4fv("mvp", camera.mvp);
            lineProgram.vertexAttribPointer("position", 3, context.FLOAT, false, map_stride_bytes, 0);
            lineProgram.vertexAttribPointer("normal", 3, context.FLOAT, false, map_stride_bytes, 12);
            lineProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, map_stride_bytes, 24);
            lineProgram.vertexAttribPointer("normal2", 3, context.FLOAT, false, map_stride_bytes, 36);
            lineProgram.uniform1f("blend", blend);
            lineProgram.uniform4f("color", color[0], color[1], color[2], 1);
            lineProgram.uniform1f("height", 0);
            bindElementBuffer(context, self.buffers.map.line);
            context.lineWidth(pick(options.boundary.width, 1));
            context.drawElements(context.LINES, self.line_count, context.UNSIGNED_SHORT, 0);
            context.lineWidth(1);
            context.depthMask(true);

            //画高亮国家的边界线
            if (hoverCountry) {
                if (self.borderedCountry !== hoverCountry.index) {
                    var r = [],
                        borders = hoverCountry.border,
                        o = -1;
                    for (var a = 0; a < borders.length; ++a) {
                        var i = borders[a];
                        if (65535 != i) {
                            if (o >= 0) {
                                r.push(o, i);
                            }
                            o = i
                        } else {
                            o = -1;
                        }

                    }
                    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, self.border.buffer);
                    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(r), context.STATIC_DRAW);
                    self.border.count = r.length;
                    self.borderedCountry = hoverCountry.index;
                }
                if (self.border.count) {
                    var f = self.programs.line.use();
                    var hoverColor = color2vec3(options.boundary.hover.color);
                    f.uniformMatrix4fv("mvp", camera.mvp);
                    f.vertexAttribPointer("position", 3, context.FLOAT, false, map_stride_bytes, 0);
                    f.vertexAttribPointer("normal", 3, context.FLOAT, false, map_stride_bytes, 12);
                    f.vertexAttribPointer("position2", 3, context.FLOAT, false, map_stride_bytes, 24);
                    f.vertexAttribPointer("normal2", 3, context.FLOAT, false, map_stride_bytes, 36);
                    f.uniform1f("blend", blend);
                    f.uniform1f("height", 0);
                    f.uniform4f("color", hoverColor[0], hoverColor[1], hoverColor[2], 1);
                    bindElementBuffer(context, self.border.buffer);
                    context.lineWidth(pick(options.boundary.hover.width, 1));
                    context.drawElements(context.LINES, self.border.count, context.UNSIGNED_SHORT, 0);
                    context.lineWidth(1)
                }
            }
        }

        context.disable(context.DEPTH_TEST);
        context.disable(context.CULL_FACE);

        if (options.label.show) {
            self.drawLabels();
        }

    },
    /**
     * 设置高亮国家
     * @param index
     * @returns {World}
     */
    hoverCountry: function (index) {
        this.hoveredCountry = index;
        return this;
    },
    /**
     * 根据鼠标平面坐标计算出鼠标放在地球上的哪个国家
     * @param mouseX
     * @param mouseY
     * @returns {number}
     */
    pick: function (mouseX, mouseY) {
        var self = this,
            context = self.context,
            camera = self.controller.camera,
            countries = self.countries,
            r = 4,
            data = new Uint8Array(r * r << 2),
            viewport = camera.viewport,
            mvp = mat4.create(),
            map_stride_bytes = self.map_vert_stride_bytes,
            blend = camera.projectionBlend < .5 ? 0 : 24;

        function getFrameBuffer() {
            if (!self.framebuffer) {
                self.framebuffer = context.createFramebuffer();
                context.bindFramebuffer(context.FRAMEBUFFER, self.framebuffer);
                var e = createTexture2D(context, {
                    size: r
                });
                context.bindTexture(context.TEXTURE_2D, e);
                context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, e, 0);
                var n = context.createRenderbuffer();
                context.bindRenderbuffer(context.RENDERBUFFER, n);
                context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT16, r, r);
                context.framebufferRenderbuffer(context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, n);
                context.bindRenderbuffer(context.RENDERBUFFER, null);
                context.bindFramebuffer(context.FRAMEBUFFER, null);
            }
            return self.framebuffer;
        }

        mat4.identity(mvp);
        mat4.translate(mvp, mvp, [
            (viewport[2] - 2 * (mouseX - viewport[0])) / r,
            -(viewport[3] - 2 * (mouseY - viewport[1])) / r,
            0
        ]);

        mat4.scale(mvp, mvp, [viewport[2] / r, viewport[3] / r, 1]);
        mat4.multiply(mvp, mvp, camera.mvp);

        context.viewport(0, 0, r, r);
        context.bindFramebuffer(context.FRAMEBUFFER, getFrameBuffer());
        context.clearColor(0, 0, 1, 0);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.disable(context.BLEND);
        context.enable(context.CULL_FACE);
        context.cullFace(context.BACK);
        context.enable(context.DEPTH_TEST);
        var pickProgram = self.programs.pick.use();
        pickProgram.uniformMatrix4fv("mvp", mvp);

        bindVertexBuffer(context, self.buffers.map.vert);

        pickProgram.vertexAttribPointer("position", 3, context.FLOAT, !1, map_stride_bytes, blend);

        bindElementBuffer(context, self.buffers.map.face);

        each(countries, function (country) {
            pickProgram.uniform1f("color", country.index / 255);
            context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);

        });
        context.disable(context.CULL_FACE);
        context.disable(context.DEPTH_TEST);
        context.readPixels(0, 0, r, r, context.RGBA, context.UNSIGNED_BYTE, data);

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

    },
    /**
     * 构造国家和城市名称
     */
    buildLabels: function () {
        var self = this,
            context = self.context,
            countries = self.countries,
            cities = [],
            canvas = document.createElement("canvas");

        self.labels = [];

        each(countries, function (country) {
            var label = country.label;
            //地球小的时候,只显示fontSize大于5的国家名
            if (label.fontSize > 5) {
                self.labels.push(new Label({
                    name: label.name.toUpperCase(),
                    coord: label.coordinate,
                    fontSize: label.fontSize
                }));
            } else {
                cities.push(label);
            }
            each(country.cities, function (city) {
                cities.push(city);
            });
        });

        //大字国家数量
        self.largeLabelCount = self.labels.length;

        each(cities, function (city) {
            self.labels.push(new Label({
                name: city.name,
                coord: city.coordinate,
                fontSize: city.fontSize
            }));
        });

        self.buffers.labels = makeVertexBuffer(context, new Float32Array(self.labels.length * 30));

        canvas.width = canvas.height = self.labelSize;

        var context2d = canvas.getContext("2d");
        context2d.fillStyle = "#000";
        context2d.fillRect(0, 0, canvas.width, canvas.height);
        context2d.font = "30px Ubuntu Mono";
        context2d.fillStyle = "white";
        context2d.textBaseline = "top";
        var pos = [0, 0],
            minSize = 35;
        each(self.labels, function (label) {
            var name = label.name,
                width = context2d.measureText(name).width;
            if (pos[0] + width >= canvas.width) {
                pos[0] = 0;
                pos[1] += minSize;
            }
            context2d.fillText(name, pos[0], pos[1] - 0);

            vec4.set(label.box, pos[0], pos[1], pos[0] + width, pos[1] + minSize);
            vec4.scale(label.box, label.box, 1 / self.labelSize);
            pos[0] += width;

        });
        context.bindTexture(context.TEXTURE_2D, self.textures.labels);
        context.texSubImage2D(context.TEXTURE_2D, 0, 0, 0, context.LUMINANCE, context.UNSIGNED_BYTE, canvas);
        context.generateMipmap(context.TEXTURE_2D);

        self.controller.bind("display", proxy(self.setupLabels, self));
        self.setupLabels();
        return self;
    },
    /**
     * 画国家和城市名称
     * @returns {World}
     */
    drawLabels: function () {
        var self = this,
            context = self.context,
            camera = self.controller.camera;

        context.enable(context.DEPTH_TEST);
        context.enable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.ONE);
        context.depthMask(!1);

        var project = vec3.create();
        camera.projection(project, camera.coordinate);
        var labelProgram = self.programs.label.use();
        labelProgram.uniformMatrix4fv("mvp", camera.mvp);
        labelProgram.uniform4f("circle_of_interest", project[0], project[1], project[2], lerp(3, 10, self.blend));
        labelProgram.uniformSampler2D("t_color", self.textures.labels);
        bindVertexBuffer(context, self.buffers.labels);
        labelProgram.vertexAttribPointer("position", 3, context.FLOAT, !1, 20, 0);
        labelProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, !1, 20, 12);
        labelProgram.uniform1i("inside", 0);
        context.drawArrays(context.TRIANGLES, 0, 6 * self.largeLabelCount);
        labelProgram.uniform1i("inside", 1);
        context.drawArrays(context.TRIANGLES, 6 * self.largeLabelCount, 6 * (self.labels.length - self.largeLabelCount));
        context.depthMask(!0);
        context.disable(context.BLEND)
        return self;
    },
    /**
     * 切换显示模式时需要重新构造labels
     */
    setupLabels: function () {
        var self = this,
            camera = self.controller.camera,
            context = self.context,
            labels = self.labels;

        if (labels.length) {
            var n = vec3.create(),
                o = vec3.create(),
                a = vec3.create(),
                i = [],
                u = vec3.create(),
                data = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
            each(labels, function (label) {

                camera.projection(label.pos, label.coord);

                var fontSize = 1 * label.fontSize;
                mat4.identity(label.mat);

                if (camera.globe) {
                    vec3.normalize(n, label.pos);
                    vec3.set(o, 0, 1, 0);
                    vec3.cross(o, n, o);
                    vec3.normalize(o, o);
                    vec3.cross(a, o, n);
                    label.mat[0] = o[0];
                    label.mat[1] = o[1];
                    label.mat[2] = o[2];
                    label.mat[4] = n[0];
                    label.mat[5] = n[1];
                    label.mat[6] = n[2];
                    label.mat[8] = a[0];
                    label.mat[9] = a[1];
                    label.mat[10] = a[2];
                    mat4.rotateX(label.mat, label.mat, MATH_PI / 2);
                }

                mat4.scale(label.mat, label.mat, [
                    fontSize * (label.box[2] - label.box[0]),
                    fontSize * (label.box[3] - label.box[1]), 1
                ]);
                label.mat[12] = label.pos[0];
                label.mat[13] = label.pos[1];
                label.mat[14] = label.pos[2];

                for (var index = 0; index < data.length; index += 2) {
                    u[0] = data[index + 0];
                    u[1] = data[index + 1];
                    u[2] = 0;
                    vec3.transformMat4(u, u, label.mat);
                    i.push(u[0], u[1], u[2]);
                    u[0] = .5 * (1 + data[index + 0]);
                    u[1] = .5 * (1 + data[index + 1]);
                    u[0] = lerp(label.box[2], label.box[0], u[0]);
                    u[1] = lerp(label.box[3], label.box[1], u[1]);
                    i.push(u[0], u[1])
                }
            });
            bindVertexBuffer(context, self.buffers.labels);
            context.bufferSubData(context.ARRAY_BUFFER, 0, new Float32Array(i))
        }
        return self;
    }
};

/**
 *
 * @constructor
 */
function Label(label) {
    this.coord = vec3.fromValues(label.coord[0], label.coord[1], .0002);
    this.pos = vec3.create();
    this.mat = mat4.create();
    this.box = vec4.create();
    this.name = label.name || "";
    this.fontSize = label.fontSize || 3
}

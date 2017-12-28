/**
 * Created by vision on 16/3/25.
 */
var GTW = {};
(function (window) {
    GTW = {
        resource_url: function (path) {
            return "assets/map/" + path;
        },
        create_gradient_texture: function (e) {
            var t = document.createElement("canvas");
            t.width = 1024, t.height = 1;
            var r = t.getContext("2d"),
                n = r.createLinearGradient(0, 0, t.width, 0);
            _.each(e, function (e, t) {
                n.addColorStop(parseFloat(t), e)
            }), r.fillStyle = n, r.fillRect(0, 0, t.width, t.height);
            var o = webgl.createTexture2D({
                filter: gl.LINEAR
            });
            return gl.bindTexture(gl.TEXTURE_2D, o), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t), o
        },
        load_resources: function (options, callback) {
            function onload(name, ret) {
                n[name] = ret;
                0 === --o && callback(n)
            }

            var n = {},
                o = _.keys(options).length;

            _.each(options, function (url, name) {
                if (/\.(jpg|png)$/i.test(url)) {
                    var n = new Image;
                    n.src = url;
                    n.onload = function () {
                        onload(name, n)
                    }
                } else {
                    $.getJSON(url, function (e) {
                        onload(name, e)
                    })
                }
            })
        },
        get_country_name: function (countryName) {
            return window.lang ? lang.getText("MAP_COUNTRY_" + countryName.iso3) : countryName.name.en
        }
    };

    /**
     * GTW Camera
     * 照相机参数
     */
    (function () {
        /**
         * WebGL摄像机
         * 大部分参数未知
         * @TODO 待完善文档和变量名的翻译
         * @constructor
         */

        function Camera() {
            this.fov = 60;
            this.near = .01;
            this.far = 200;
            this.viewport = vec4.create();
            this.proj = mat4.create();
            this.view = mat4.create();
            this.bill = mat3.create();
            this.mvp = mat4.create();
            this.mvpInv = mat4.create();
            this.viewInv = mat4.create();
            this.viewPos = vec3.create();
            this.viewDir = vec3.create();

            this.t = vec3.fromValues(0, 1, 0);
            this.r = vec3.create();
            this.n = mat4.create();

            return this;
        }

        Camera.prototype = {
            /**
             * 更新投影
             * @private
             * @returns {Camera}
             */
            _update_projection: function () {
                var e = this.viewport[2] / this.viewport[3];
                mat4.perspective(this.proj, deg2rad(this.fov), e, this.near, this.far);
                return this;
            },
            _update_mvp: function () {
                var e = this.bill,
                    t = this.view;
                e[0] = t[0];
                e[1] = t[4];
                e[2] = t[8];
                e[3] = t[1];
                e[4] = t[5];
                e[5] = t[9];
                e[6] = t[2];
                e[7] = t[6];
                e[8] = t[10];
                mat4.multiply(this.mvp, this.proj, this.view);
                mat4.invert(this.mvpInv, this.mvp);
                mat4.invert(this.viewInv, this.view);
                vec3.transformMat4(this.viewPos, [0, 0, 0], this.viewInv);
                vec3.set(this.viewDir, -this.viewInv[8], -this.viewInv[9], -this.viewInv[10])

            },
            update: function (e, n) {
                this._update_projection();
                vec3.add(this.r, e, n);
                mat4.lookAt(this.view, e, this.r, this.t);
                this._update_mvp();
            },
            update_quat: function (e, t, r) {
                this._update_projection();
                mat4.fromRotationTranslation(this.n, t, e);
                mat4.invert(this.n, this.n);
                if (r) {
                    var o = this.n,
                        a = this.view,
                        i = r,
                        u = 1 - r,
                        c = 0;
                    for (; 16 > c; ++c) {
                        a[c] = i * a[c] + u * o[c];
                    }
                } else {
                    mat4.copy(this.view, this.n);
                }
                this._update_mvp()
            },
            unproject: function (e, t) {
                var r = vec4.create();
                r[0] = 2 * (t[0] / this.viewport[2]) - 1;
                r[1] = 2 * (t[1] / this.viewport[3]) - 1;
                r[1] = 1 - r[1];
                r[2] = 0;
                r[3] = 1;
                vec4.transformMat4(r, r, this.mvpInv);
                e[0] = r[0] / r[3];
                e[1] = r[1] / r[3];

            }
        };
        GTW.Camera = Camera;
    })();

    /**
     * GTW Simulator
     * @TODO 未知作用
     */
    (function () {
        var n = 6e4,
            o = 60 * n,
            a = 24 * o;

        function e(e) {
            return -e * Math.log(1 - MersenneTwister.random())
        }

        function t() {
            this.key = 0;
            this.count = 0;
            this.remaining = 0;
            this.end_time = 0;
            this.next_event_time = 0;
            this.coords = null;
            this.angle = 0
        }

        t.prototype.next_event = function () {
            var t = Math.max(0, this.end_time - this.next_event_time),
                r = t / this.remaining,
                n = e(r);
            this.next_event_time += n;
            this.angle += Math.PI / 5
        };

        function Simulator() {
            this.next_fetch_time = 0;
            this.kevents = []
        }

        Simulator.prototype = {

            clear_events: function () {
                this.kevents = []
            },
            add_events: function (e, r) {
                for (var n = 0; n < e.length; n += 2) {
                    var a = e[n + 0],
                        i = e[n + 1],
                        u = new t;
                    u.key = a;
                    u.remaining = u.count = i;
                    u.next_event_time = r;
                    u.end_time = r + o;
                    u.next_event();
                    this.kevents.push(u);
                }
            },
            add_ddos_events: function (e, r) {
                function n(e) {
                    return e = 65535 & e, e >= 32768 && (e = -(65536 - e)), e / 32768
                }

                function a(e, t) {
                    var r = n(t >> 0),
                        o = n(t >> 16);
                    e[0] = 180 * r, e[1] = 90 * o
                }

                for (var i = o / 100, u = 0, c = vec2.create(), l = vec2.create(); u < e.length;) {
                    var s = e[u++],
                        f = s >> 16 & 255;
                    for (console.assert(8 == f), a(c, e[u++]), a(l, e[u++]); ;) {
                        var v = e[u++],
                            p = 65535 & v,
                            g = v >> 16;
                        if (console.assert(p >= 0 && 100 > p), 0 == g) break;
                        var h = r + i * p,
                            m = 30,
                            d = 500;
                        g = Math.min(g * m, d);
                        var _ = new t;
                        _.key = s, _.remaining = _.count = g, _.next_event_time = h, _.end_time = h + i, _.coords = vec4.fromValues(c[0], c[1], l[0], l[1]), _.next_event(), this.kevents.push(_)
                    }
                }
            },
            fetch: function (e) {
                function t(t) {
                    var i = Base64.decode(t.events, Uint32Array),
                        u = Base64.decode(t.totals, Uint32Array);
                    if (GTW.reset_counters(), GTW.update_counters(u), t.totals8) {
                        var c = Base64.decode(t.totals8, Uint32Array);
                        GTW.update_counters(c)
                    }
                    var l = Math.floor(e / a) * a + r * o;
                    if (n.clear_events(), n.add_events(i, l), t.events8) {
                        var s = Base64.decode(t.events8, Uint32Array);
                        n.add_ddos_events(s, l)
                    }
                    if (t.counts8) {
                        var f = Base64.decode(t.counts8, Uint32Array);
                        n.add_events(f, l)
                    }
                    var v = n.poll_events(e);
                    _.each(v, function (e) {
                        var t = e.key,
                            r = t >> 16 & 255,
                            n = t >> 8 & 255,
                            o = !0;
                        if (8 == r && e.coords && (o = !1), 8 == r && 0 == n && (o = !1), o) {
                            var a = GTW.systems[r];
                            ++a.count, ++a.target_count[n], ++GTW.total_target_count[n]
                        }
                    })
                }

                var r = Math.floor(e / o % 24);
                this.next_fetch_time = (1 + Math.floor(e / o)) * o;
                var n = this,
                    i = "assets/data/events/1.json";
                $.getJSON(i, t)
            },
            poll_events: function (time_now) {
                this.next_fetch_time < time_now && this.fetch(time_now);
                var t = [];
                _.each(this.kevents, function (r) {
                    for (; r.next_event_time <= time_now;) {
                        t.push(r);
                        if (0 == --r.remaining) {
                            r.next_event_time = 1 / 0;
                            break
                        }
                        r.next_event()
                    }
                });
                return t;
            }
        };

        GTW.Simulator = Simulator
    })();

    /**
     * GTW MissileSystem
     * @TODO
     */
    (function () {
        var p = 1e3,
            g = 100,
            h = 8 * g;

        function e(e) {
            function t(t) {
                return parseInt(e.substr(2 * t, 2), 16) / 255
            }

            "#" == e[0] && (e = e.substr(1));
            var r = vec3.create();
            return r[0] = t(0), r[1] = t(1), r[2] = t(2), r
        }

        function System(t, r, n, o, a) {
            function i(t) {
                return {
                    f: e(t),
                    css: "#" + t
                }
            }

            this.id = t;
            this.name = r;
            this.description = n;
            var o = o.split(" ");
            1 === o.length && o.push(o[0]), this.color = {
                dark: i(o[0]),
                light: i(o[1])
            };
            this.n_sides = a;
            this.enabled = !0;
            this.enabled_graph = !0;
            this.count = 0;
            this.target_count = new Int32Array(256);
            this.target_rank = new Int32Array(256);
            this.graph = new Int32Array(60);
            this.el_count_selector = ".type-icons .symbol." + r.toLowerCase() + " .count";
            this.el_popcount_selector = "#" + r.toLowerCase() + "-popcount";
            this.el_popcount = $("#" + r.toLowerCase() + "-popcount")
        }

        System.prototype.compute_target_rank = function () {
            r(this.target_count, this.target_rank)
        };

        function r(e, t) {
            s.sort(function (t, r) {
                return e[r] - e[t]
            });
            _.each(s, function (e, r) {
                t[e] = 1 + r
            })
        }

        function reset_counters() {
            GTW.systems_foreach(function (e) {
                e.count = 0;
                for (var t = 0; 256 > t; ++t) {
                    e.target_count[t] = 0
                }
            });
            for (var e = 0; 256 > e; ++e) {
                GTW.total_target_count[e] = 0
            }
        }

        function update_counters(e) {
            if (e) for (var t = 0; t < e.length; t += 2) {
                var r = e[t + 0],
                    n = e[t + 1],
                    o = r >> 16 & 255,
                    a = r >> 8 & 255,
                    i = GTW.systems[o];
                0 === a ? i.count = n : (i.target_count[a] = n, GTW.total_target_count[a] += n)
            }
        }

        function a(e, t) {
            for (var r = null, n = 0, o = 0; o < t.length; ++o) {
                var a = t[o];
                if (!a.alive) return a;
                var i = e - a.start_time;
                i > n && (n = i, r = a)
            }
            return r ? r : _.sample(t)
        }

        function MissileSystem(e) {
            var t = this;
            this.programs = {
                missile: webgl.getProgram("missile"),
                impact: webgl.getProgram("impact"),
                icon: webgl.getProgram("icon"),
                cone: webgl.getProgram("cone")
            }, this.buffers = {
                missile: null,
                icon: null,
                cone: null,
                quad: webgl.makeVertexBuffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]))
            }, this.textures = {
                impact: webgl.loadTexture2D(GTW.resource_url("textures/impact-512.jpg"), {
                    mipmap: !1
                })
            }, function () {
                for (var e = [], r = 32, n = 0; r > n; ++n) {
                    var o = TWO_PI * n / (r - 1),
                        a = Math.cos(o),
                        i = Math.sin(o);
                    e.push(a, 0, i, a, 1, i)
                }
                e = new Float32Array(e), t.buffers.cone = webgl.makeVertexBuffer(e), t.n_cone_verts = e.length / 3
            }(), this.init_missiles(e), this.init_icons()
        }

        var u = {
                use_missiles: !0,
                use_impacts: !0,
                use_cones: !0,
                use_icons: !0,
                scale: 1,
                width: .1,
                height: .005,
                ff_impacts: !1
            },
            c = _.assign(_.clone(u), {
                use_impacts: !1,
                scale: 30,
                width: 10,
                height: .1,
                ff_impacts: !0
            }),
            l = u;

        for (var s = [], f = 0; 256 > f; ++f) {
            s.push(f);
        }

        MissileSystem.prototype = {
            init_missiles: function (e) {
                var self = this,
                    bufferData = new Float32Array(p * h);

                function Missile(t) {
                    this.index = t;
                    this.verts = bufferData.subarray(this.index * h, (this.index + 1) * h);
                    this.source_coord = vec3.create();
                    this.target_coord = vec3.create();
                    this.source_mat = mat4.create();
                    this.target_mat = mat4.create();
                    this.start_time = 0;
                    this.alive = !1;
                    this.style = 1;
                    this.color = GTW.systems[this.style].color[e.palette].f;
                    this.has_source = !0;
                    this.has_target = !0;
                    this.draw_source_impact = !0
                }

                function projection(e, t, r, n) {
                    var o = vec3.create(),
                        a = vec3.create(),
                        l = vec3.create(),
                        f = vec3.create();
                    n.project(f, t);

                    if (n.projection.blend > .5) {
                        vec3.normalize(l, f);
                        vec3.set(o, 0, 1, 0);
                        vec3.cross(o, l, o);
                        vec3.normalize(o, o);
                        vec3.cross(a, o, l);
                        e[0] = o[0];
                        e[1] = o[1];
                        e[2] = o[2];
                        e[4] = l[0];
                        e[5] = l[1];
                        e[6] = l[2];
                        e[8] = a[0];
                        e[9] = a[1];
                        e[10] = a[2]
                    } else {
                        mat4.identity(e);
                        mat4.rotateX(e, e, -.5 * Math.PI)
                    }
                    if (r) {
                        mat4.scale(e, e, [r, r, r]);
                    }
                    e[12] = f[0];
                    e[13] = f[1];
                    e[14] = f[2]
                }

                Missile.prototype.launch = function (e, t, c, s, f, v) {
                    this.style = t;
                    this.shape = self.shapes[this.style];
                    this.color = GTW.systems[this.style].color[e.palette].f;
                    this.has_source = !!s;
                    this.start_time = e.time;
                    this.alive = !0;
                    this.has_source && vec3.copy(this.source_coord, s);
                    vec3.copy(this.target_coord, c);

                    if (this.has_source) {
                        v = v || 0;
                        var p = vec2.distance(s, c),
                            m = l.height * p,
                            d = (c[0] - s[0]) / p,
                            _ = (c[1] - s[1]) / p,
                            b = 200,
                            y = b * -_,
                            T = b * d,
                            w = Math.cos(v),
                            E = Math.sin(v),
                            x = this.index * h,
                            A = vec3.create(),
                            M = vec3.create();

                        for (var R = 0; g > R; ++R) {
                            var P = R / (g - 1);
                            vec3.lerp(M, s, c, P);
                            var L = m * Math.sin(P * Math.PI) * .15;
                            M[0] += E * L * y;
                            M[1] += E * L * T;
                            M[2] += w * L;
                            e.project(A, M);
                            bufferData[x + 0] = A[0];
                            bufferData[x + 1] = A[1];
                            bufferData[x + 2] = A[2];
                            bufferData[x + 3] = -P;
                            bufferData[x + 4] = A[0];
                            bufferData[x + 5] = A[1];
                            bufferData[x + 6] = A[2];
                            bufferData[x + 7] = P;
                            x += 8;
                        }
                        var D = 4 * this.index * h;
                        webgl.bindVertexBuffer(self.buffers.missile);
                        gl.bufferSubData(gl.ARRAY_BUFFER, D, this.verts)
                    }

                    if (this.has_source) {
                        if (this.source_coord[2] < .015) {
                            projection(this.source_mat, this.source_coord, f, e);
                            this.draw_source_impact = true;
                        } else {
                            this.draw_source_impact = false;
                        }
                    }
                    projection(this.target_mat, this.target_coord, f, e)

                };
                this.missiles = [];
                for (var f = 0; p > f; ++f) {
                    this.missiles.push(new Missile(f));
                }
                this.buffers.missile = webgl.makeVertexBuffer(bufferData)
            },
            init_icons: function () {
                function e(e, t) {
                    n.push(Math.cos(e), Math.sin(e), t)
                }

                function t() {
                    this.offset = 0, this.count = 0
                }

                function r(r) {
                    var o = new t;
                    o.offset = n.length / 3;
                    var a = 0 > r;
                    r = Math.abs(r);
                    var i;
                    i = a ? Math.PI / r : TWO_PI / r;
                    for (var u = 5, c = 0; u > c; ++c) {
                        for (var l = 0, s = 0; r > s; ++s) {
                            e(l, c), e(l + i, c), l += i;
                        }
                        a && (e(l, c), e(0, c)), 31 == r && (l = .8, e(l, c), e(l + Math.PI, c))
                    }
                    return o.count = n.length / 3 - o.offset, o
                }

                var n = [],
                    o = [];
                t.prototype.draw = function () {
                    gl.drawArrays(gl.LINES, this.offset, this.count)
                }, GTW.systems_foreach(function (e) {
                    var t = r(e.n_sides);
                    o[e.id] = t
                }), this.shapes = o, n = new Float32Array(n), this.buffers.icon = webgl.makeVertexBuffer(n)
            },
            draw: function (e) {
                var t = this,
                    r = {
                        active: 0,
                        curves: 0
                    };
                if (gl.enable(gl.DEPTH_TEST), gl.depthMask(!1), l.use_missiles) {
                    gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    var n = this.programs.missile.use();
                    n.uniformMatrix4fv("mvp", e.camera.mvp), n.uniform3fv("view_position", e.camera.viewPos), n.uniform1f("width", l.width), webgl.bindVertexBuffer(this.buffers.missile), n.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0), _.each(this.missiles, function (t) {
                        if (t.alive && t.has_source) {
                            ++r.curves;
                            var o = e.time - t.start_time;
                            if (2 > o) {
                                n.uniform1f("time", .5 * o), n.uniform3fv("color", t.color);
                                var a = 2 * g,
                                    i = a * t.index;
                                gl.drawArrays(gl.TRIANGLE_STRIP, i, a)
                            }
                        }
                    })
                }
                if (gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE), l.use_impacts && e.high_quality) {
                    var n = this.programs.impact.use();
                    n.uniformMatrix4fv("mvp", e.camera.mvp), n.uniformSampler2D("t_color", this.textures.impact), webgl.bindVertexBuffer(this.buffers.quad), n.vertexAttribPointer("position", 2, gl.FLOAT, !1, 0, 0), _.each(this.missiles, function (t) {
                        if (t.alive) {
                            ++r.active;
                            var o = e.time - t.start_time;
                            if (o > 4) return void(t.alive = !1);
                            n.uniform3fv("color", t.color), t.has_source && t.draw_source_impact && 1 > o && (n.uniformMatrix4fv("mat", t.source_mat), n.uniform1f("time", o), gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)), t.has_target && o >= 1 && (n.uniformMatrix4fv("mat", t.target_mat), n.uniform1f("time", (o - 1) / 3), gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4))
                        }
                    })
                }
                if (l.use_cones && e.high_quality) {
                    var n = this.programs.cone.use();
                    n.uniformMatrix4fv("mvp", e.camera.mvp), webgl.bindVertexBuffer(this.buffers.cone), n.vertexAttribPointer("position", 3, gl.FLOAT, !1, 0, 0), _.each(this.missiles, function (r) {
                        if (r.alive) {
                            var o = e.time - r.start_time;
                            r.has_target && o >= 1 && 2 > o && (n.uniform3fv("color", r.color), n.uniformMatrix4fv("mat", r.target_mat), n.uniform1f("time", o - 1), gl.drawArrays(gl.TRIANGLE_STRIP, 0, t.n_cone_verts))
                        }
                    })
                }
                if (l.use_icons) {
                    var n = this.programs.icon.use();
                    n.uniformMatrix4fv("mvp", e.camera.mvp), n.uniform1f("scale", .05), webgl.bindVertexBuffer(this.buffers.icon), n.vertexAttribPointer("vertex", 3, gl.FLOAT, !1, 0, 0), gl.lineWidth(2), _.each(this.missiles, function (t) {
                        if (t.alive) {
                            var r = e.time - t.start_time;
                            r >= 1 && 2 > r && (n.uniformMatrix4fv("mat", t.target_mat), n.uniform3fv("color", t.color), n.uniform1f("time", r - 1), t.shape.draw())
                        }
                    }), gl.lineWidth(1)
                }
                gl.depthMask(!0)
            },
            launch: function (e, t, r, n, o) {
                var i = a(e.time, this.missiles);
                return i.launch(e, t, r, n, l.scale, o), i
            },
            set_mode: function (e) {
                switch (e) {
                    case "world":
                        l = u;
                        break;
                    case "scape":
                        l = c
                }
                this.clear()
            },
            clear: function () {
                _.each(this.missiles, function (e) {
                    e.alive = !1
                })
            }
        };

        GTW.MissileSystem = MissileSystem;
        GTW.reset_counters = reset_counters;
        GTW.update_counters = update_counters;

        GTW.systems = {
            1: new System(1, "OAS", "On-Access Scanner", "38b349", 5),
            2: new System(2, "ODS", "On-Demand Scanner", "ed1c24", 4),
            3: new System(3, "MAV", "Mail Anti-Virus", "f26522", 3),
            4: new System(4, "WAV", "Web Anti-Virus", "0087f4 0000f4", 32),
            5: new System(5, "IDS", "Intrusion Detection System", "ec008c ff00b4", 6),
            6: new System(6, "VUL", "Vulnerability Scanner", "fbf267", 8),
            7: new System(7, "KAS", "Kaspersky Anti-Spam", "855ff4", -16),
            8: new System(8, "BAD", "Botnet Activity Detection", "00d1a9", 31)
        };
        var v = 8;
        GTW.systems_foreach = function (e) {
            for (var t = 1; v >= t; ++t) {
                var r = GTW.systems[t];
                e(r, t)
            }
        };
        GTW.total_target_count = new Int32Array(256);
        GTW.total_target_rank = new Int32Array(256);
        GTW.top_infected = new Int32Array(10);
        GTW.compute_total_target_rank = function () {
            r(GTW.total_target_count, GTW.total_target_rank);
            for (var e = 0; e < GTW.top_infected.length; ++e) {
                GTW.top_infected[e] = s[e]
            }
        };
    })();

    /**
     * GTW project
     */
    (function () {
        (function () {

            GTW.project_mercator = function (r, n) {
                var o = n[0],
                    a = n[1],
                    i = Math.PI * a / 180,
                    u = 90 / Math.PI * Math.log(Math.tan(.25 * Math.PI + .5 * i));
                r[0] = -o / 180;
                r[1] = clamp(u / 90, -1, 1);
                r[2] = -1 * n[2];
                vec3.scale(r, r, 10)
            };
            GTW.project_ecef = function (r, n) {
                var o = deg2rad(n[0]),
                    a = deg2rad(n[1]),
                    i = 1 * n[2],
                    u = Math.cos(a),
                    c = Math.sin(a),
                    l = 1,
                    s = 1;
                r[0] = -(l + i) * u * Math.cos(o);
                r[2] = (l + i) * u * Math.sin(o);
                r[1] = (s + i) * c;
                vec3.scale(r, r, 10)
            }
        })();
    })();

    /**
     * GTW Stars
     * 绘制背景星星
     */
    (function () {

        function Stars() {

            var t = 1e4;
            this.count = t;
            this.buffers = {
                vert: this.getVert()
            };
            this.programs = {
                main: webgl.getProgram("stars")
            };
            this.mvp = mat4.create();
            window.stars = this;
        }

        Stars.prototype.getVert = function () {
            var t = this.count;

            var e = vec3.create(),
                r = new Float32Array(t << 2);
            for (var n = 0; n < r.length; n += 4) {
                Random.unitVec3(e);
                vec3.scale(e, e, 50);
                r[n + 0] = e[0];
                r[n + 1] = e[1];
                r[n + 2] = e[2];
                r[n + 3] = lerp(.1, 2.5, Math.pow(Math.random(), 10));
            }

            return webgl.makeVertexBuffer(r)
        };
        Stars.prototype.draw = function (e) {
            gl.disable(gl.DEPTH_TEST), gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            var t = this.programs.main.use(),
                r = this.mvp;

            mat4.copy(r, e.camera.view),
                r[12] = 0, r[13] = 0, r[14] = 0;

            mat4.multiply(r, e.camera.proj, r);

            t.uniformMatrix4fv("mvp", r);

            t.uniform4f("color", 1, 1, 1, .5);
            webgl.bindVertexBuffer(this.buffers.vert);
            t.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0);
            gl.drawArrays(gl.POINTS, 0, this.count);

        };

        GTW.Stars = Stars;
    })();

    /**
     * GTW Corona
     * 应该是绘制地球周围的烟雾的
     */
    (function () {

        function Corona() {
            function getVert() {
                for (var e = [], r = 128, n = 0; r + 1 > n; ++n) {
                    var o = TWO_PI * n / r,
                        a = n / (r + 1),
                        i = Math.cos(o),
                        u = Math.sin(o);
                    e.push(i, u, a, 0, i, u, a, 1)
                }
                t = e.length / 4;
                return webgl.makeVertexBuffer(new Float32Array(e))
            }

            var t = 0;
            this.buffers = {
                vert: getVert()
            };
            this.vertex_count = t, this.programs = {
                main: webgl.getProgram("corona")
            };
            this.textures = {
                smoke: webgl.loadTexture2D(GTW.resource_url("textures/smoke.jpg"), {
                    mipmap: !0,
                    wrapS: gl.REPEAT,
                    wrapT: gl.CLAMP_TO_EDGE
                })
            }
        }

        Corona.prototype.draw = function (e, t) {
            var r = this.programs.main.use();
            r.uniformMatrix4fv("mvp", e.camera.mvp);
            r.uniformMatrix3fv("bill", e.camera.bill);
            r.uniformSampler2D("t_smoke", this.textures.smoke);
            r.uniform1f("time", e.time);
            r.uniform1f("zoff", t || 0);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);

            if ("dark" === e.palette) {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                r.uniform3f("color0", .07, .25, .16);
                r.uniform3f("color1", 0, 0, 0);
            } else {
                gl.blendFunc(gl.DST_COLOR, gl.ZERO);
                r.uniform3f("color0", .07, .25, .16);
                r.uniform3f("color1", 1, 1, 1);
            }

            webgl.bindVertexBuffer(this.buffers.vert);

            r.vertexAttribPointer("vertex", 4, gl.FLOAT, !1, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertex_count);
            gl.disable(gl.BLEND)
        };

        GTW.Corona = Corona;
    })();

    /**
     * GTW World
     * 绘制世界
     */
    (function () {
        var global_t = [1440, 720],
            global_r = .014,
            global_n = 10 * global_r;

        function World() {
            this.buffers = {
                map: {
                    vert: null,
                    face: null,
                    line: null
                },
                grid: {
                    vert: null,
                    elem: null
                }
            };
            this.border = {
                buffer: gl.createBuffer(),
                count: 0
            };
            this.build_grid();
            this.programs = {
                main: webgl.getProgram("map_main"),
                grid: webgl.getProgram("map_grid"),
                line: webgl.getProgram("map_line"),
                pick: webgl.getProgram("map_pick")
            };
            this.textures = {
                blur: webgl.loadTexture2D(GTW.resource_url("textures/map_blur.jpg")),
                pattern: webgl.loadTexture2D(GTW.resource_url("textures/pattern.png"), {
                    mipmap: !0,
                    wrap: gl.REPEAT,
                    aniso: 4
                })
            };
            this.countries = [];
            var self = this;
            this.key_to_country = {};

            var mapJson = GTW.resource_url("data/map.json"),
                geoipJson = GTW.resource_url("data/geoip.json");

            this.extruded_country_index = -1;
            this.bordered_country_index = -1;

            GTW.load_resources({
                map: mapJson,
                geoip: geoipJson
            }, function (ret) {
                self.countries = ret.map.countries;
                self.geoip = function () {
                    if (!ret.geoip) return null;
                    var n = ret.geoip.country,
                        o = ret.geoip.coord,
                        a = _.find(self.countries, function (e) {
                            return e.iso2 == n
                        });
                    return a ? {
                        country: a,
                        country_index: self.countries.indexOf(a),
                        coord: vec3.fromValues(o[1], o[0], global_r)
                    } : null
                }();

                self.geoip && (self.extruded_country_index = self.geoip.country_index);

                _.each(self.countries, function (t) {
                    var n = Base64.decode(t.cities, Int16Array),
                        o = t.cities = new Float32Array(n.length);

                    t.tone = Math.random();
                    for (var a = 0; a < o.length; a += 3) {
                        o[a + 0] = n[a + 0] / 32768;
                        o[a + 1] = 180 * n[a + 1] / 32768;
                        o[a + 2] = 90 * n[a + 2] / 32768;
                    }
                    self.key_to_country[t.key] = t;
                    var i = self.geoip ? self.geoip.country : null;
                    t.borders = Base64.decode(t.borders, Uint16Array);
                    t.center = vec3.fromValues(t.center[0], t.center[1], t == i ? global_r : 0)
                });
                self.build_geometry(ret.map);
                self.emit("loaded")
            })
        }

        World.prototype = {
            /**
             * 画地球背景
             */
            build_grid: function () {
                function t(e, t) {
                    return 181 * e + t
                }

                var n = [],
                    o = [],
                    a = vec3.create();
                a[2] = -global_r;
                var i = vec3.create(),
                    u = vec3.create(),
                    c = vec2.create();
                for (var l = -180; 180 >= l; l += 1) {
                    for (var s = -90; 90 >= s; s += 1) {
                        vec2.set(a, l, s);
                        vec2.set(c, (l + 180) / 360, 1 - (s + 90) / 180);
                        GTW.project_mercator(i, a);
                        vec3.set(u, 0, 0, -1);
                        array_push(n, i, u);
                        GTW.project_ecef(i, a);
                        vec3.normalize(u, i);
                        array_push(n, i, u);
                        array_push(n, c);
                    }
                }
                for (var f = 0; 360 > f; ++f) {
                    for (var v = 0; 180 > v; ++v) {
                        o.push(t(f, v), t(f + 1, v), t(f + 1, v + 1), t(f + 1, v + 1), t(f, v + 1), t(f, v));
                    }
                }
                this.buffers.grid.vert = webgl.makeVertexBuffer(new Float32Array(n));
                this.buffers.grid.elem = webgl.makeElementBuffer(new Uint16Array(o));
                this.grid_elem_count = o.length;
                this.grid_vert_stride_bytes = 56
            },
            build_geometry: function (map) {
                var n = [],
                    geom = map.geom,
                    a = vec3.create(),
                    i = vec3.create(),
                    u = vec2.create();

                function t(e, t) {
                    a[0] = 180 * geom.verts[2 * e + 0] / 32768;
                    a[1] = 90 * geom.verts[2 * e + 1] / 32768;
                    a[2] = t;
                    u[0] = .5 + a[0] / 360;
                    u[1] = .5 - a[1] / 180;
                    var r = n.length / 14;
                    GTW.project_mercator(i, a);
                    n.push(i[0], i[1], i[2]);
                    n.push(0, 0, 0);
                    GTW.project_ecef(i, a);
                    n.push(i[0], i[1], i[2]);
                    n.push(0, 0, 0);
                    n.push(u[0], u[1]);
                    return r
                }

                geom.faces = Base64.decode(geom.faces, Uint16Array);
                geom.lines = Base64.decode(geom.lines, Uint16Array);
                geom.coast = Base64.decode(geom.coast, Uint16Array);
                geom.verts = Base64.decode(geom.verts, Int16Array);
                var vertsLength = geom.verts.length;

                for (var l = 0; vertsLength > l; ++l) {
                    t(l, 0);
                }
                var s = Array.apply([], geom.faces);

                s.length = geom.faces.length;
                s.constructor = Array;
                this.coast_start = s.length;

                for (var l = 0; l < geom.coast.length; l += 2) {
                    var f = geom.coast[l + 0],
                        v = geom.coast[l + 1],
                        p = t(f, -global_r),
                        g = t(v, -global_r),
                        f = t(f, 0),
                        v = t(v, 0);

                    s.push(f, v, p);
                    s.push(v, g, p)
                }
                if (this.geoip) {
                    var h = this.geoip.country.borders,
                        m = 65535;
                    for (var l = 0; l < h.length; ++l) {
                        var d = h[l];
                        if (65535 != d) {
                            if (65535 != m) {
                                var p = t(m, 0),
                                    g = t(d, 0),
                                    f = t(m, 1.02 * global_r),
                                    v = t(d, 1.02 * global_r);

                                s.push(f, v, p);
                                s.push(v, g, p)
                            }
                            m = d
                        } else {
                            m = 65535
                        }
                    }
                }
                this.coast_count = s.length - this.coast_start;
                var _ = vec3.create(),
                    b = vec3.create(),
                    y = 14;
                for (var l = 0; l < s.length; l += 3) {
                    var f = s[l + 0],
                        v = s[l + 1],
                        T = s[l + 2];
                    for (var w = 0; 2 > w; ++w) {
                        var E = 6 * w;
                        for (var x = 0; 3 > x; ++x) {
                            _[x] = n[y * v + E + x] - n[y * f + E + x];
                            b[x] = n[y * T + E + x] - n[y * f + E + x];
                        }
                        vec3.cross(i, _, b);
                        vec3.normalize(i, i);
                        for (var x = 0; 3 > x; ++x) {
                            n[y * f + E + 3 + x] += i[x];
                            n[y * v + E + 3 + x] += i[x];
                            n[y * T + E + 3 + x] += i[x]
                        }
                    }
                }
                vec3.forEach(n, y, 3, 0, function (e) {
                    vec3.normalize(e, e)
                });
                vec3.forEach(n, y, 9, 0, function (e) {
                    vec3.normalize(e, e)
                });
                this.buffers.map.vert = webgl.makeVertexBuffer(new Float32Array(n));
                this.buffers.map.face = webgl.makeElementBuffer(new Uint16Array(s));
                this.buffers.map.line = webgl.makeElementBuffer(new Uint16Array(geom.lines));
                this.face_count = geom.faces.length;
                this.line_count = geom.lines.length;
                this.map_vert_stride_bytes = 56
                window.world = this;
            },
            draw: function (params) {
                if (this.buffers.map.vert) {
                    var drawGrid = true,
                        drawCountry = true,
                        drawCountryLine = true,
                        i = true,
                        drawHoverBorder = true,
                        c = smoothstep(params.projection.blend),
                        l = .25 > c,
                        self = this;

                    gl.disable(gl.BLEND);
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.BACK);
                    gl.enable(gl.DEPTH_TEST);
                    /**
                     * 画地球的球体背景
                     */
                    if (drawGrid) {
                        var f = this.programs.grid.use();
                        f.uniformMatrix4fv("mvp", params.camera.mvp);
                        f.uniformSampler2D("t_blur", this.textures.blur);
                        f.uniformSampler2D("t_pattern", this.textures.pattern);
                        f.uniform2fv("pattern_scale", global_t);
                        f.uniform1f("blend", c);
                        if ("dark" === params.palette) {
                            f.uniform3f("color0", .07, .09, .07);
                            f.uniform3f("color1", .36, .41, .36)
                        } else {
                            f.uniform3f("color0", .93, .95, .93);
                            f.uniform3f("color1", .42, .48, .42)
                        }

                        var v = this.grid_vert_stride_bytes;
                        webgl.bindVertexBuffer(this.buffers.grid.vert);
                        f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                        f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                        f.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, v, 48);
                        f.uniform4f("color", 1, 1, 1, 1);
                        webgl.bindElementBuffer(this.buffers.grid.elem);
                        f.uniform1f("offset_x", 0);
                        gl.drawElements(gl.TRIANGLES, this.grid_elem_count, gl.UNSIGNED_SHORT, 0);

                        if (l) {
                            f.uniform1f("offset_x", -20);
                            gl.drawElements(gl.TRIANGLES, this.grid_elem_count, gl.UNSIGNED_SHORT, 0);
                            f.uniform1f("offset_x", 20);
                            gl.drawElements(gl.TRIANGLES, this.grid_elem_count, gl.UNSIGNED_SHORT, 0);
                        }
                    }
                    /**
                     * 画国家
                     */
                    if (drawCountry) {
                        var f = this.programs.main.use();
                        f.uniformMatrix4fv("mvp", params.camera.mvp);
                        f.uniformSampler2D("t_blur", this.textures.blur);
                        f.uniform1f("blend", c);
                        f.uniform3fv("view_pos", params.camera.viewPos);
                        f.uniform3fv("light_pos", params.light.position);
                        var v = this.map_vert_stride_bytes;
                        webgl.bindVertexBuffer(this.buffers.map.vert);
                        f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                        f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                        f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                        f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                        f.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, v, 48);
                        f.uniform1f("alpha", 1);
                        if ("dark" === params.palette) {
                            f.uniform3f("color0", .1, .12, .11);
                            f.uniform3f("color1", .2, .23, .21);
                        } else {
                            f.uniform3f("color0", .41, .61, .48);
                            f.uniform3f("color1", .51, .69, .53);
                        }
                        gl.disable(gl.BLEND);
                        gl.enable(gl.CULL_FACE);
                        gl.cullFace(gl.BACK);
                        gl.enable(gl.DEPTH_TEST);
                        webgl.bindElementBuffer(this.buffers.map.face);
                        _.each(this.countries, function (e, t) {
                            f.uniform1f("height", t == self.extruded_country_index ? global_n : 0);
                            f.uniform1f("tone", e.tone);
                            f.uniform1f("offset_x", 0);
                            gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);
                            if (l) {
                                f.uniform1f("offset_x", -20);
                                gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);
                                f.uniform1f("offset_x", 20);
                                gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);
                            }
                        });
                        gl.depthFunc(gl.LESS);
                        if (i) {
                            gl.disable(gl.CULL_FACE);
                            f.uniform1f("tone", .5);
                            f.uniform1f("offset_x", 0);
                            gl.drawElements(gl.TRIANGLES, this.coast_count, gl.UNSIGNED_SHORT, this.coast_start << 1);
                            if (l) {
                                f.uniform1f("offset_x", -20);
                                gl.drawElements(gl.TRIANGLES, this.coast_count, gl.UNSIGNED_SHORT, this.coast_start << 1);
                                f.uniform1f("offset_x", 20);
                                gl.drawElements(gl.TRIANGLES, this.coast_count, gl.UNSIGNED_SHORT, this.coast_start << 1);
                            }
                        }

                        gl.enable(gl.BLEND);
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                        gl.disable(gl.DEPTH_TEST);
                        gl.enable(gl.CULL_FACE);
                        if (params.pick_index >= 0) {
                            var p = this.countries[params.pick_index];
                            f.uniform1f("tone", 1);
                            f.uniform1f("alpha", .5);
                            f.uniform1f("offset_x", 0);
                            f.uniform1f("height", params.pick_index == self.extruded_country_index ? global_n : 0);
                            gl.drawElements(gl.TRIANGLES, p.face_count, gl.UNSIGNED_SHORT, p.face_offset << 1)
                        }
                        gl.disable(gl.CULL_FACE)
                    }
                    /**
                     * 画国家边界线
                     */
                    if (drawCountryLine) {
                        gl.enable(gl.DEPTH_TEST);
                        gl.depthMask(!1);
                        var f = this.programs.line.use();
                        f.uniformMatrix4fv("mvp", params.camera.mvp);
                        f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                        f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                        f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                        f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                        f.uniform1f("blend", c);
                        f.uniform4f("color", 1, 1, 1, .125);
                        f.uniform1f("height", 0);
                        webgl.bindElementBuffer(this.buffers.map.line);
                        gl.drawElements(gl.LINES, this.line_count, gl.UNSIGNED_SHORT, 0);
                        gl.depthMask(!0)
                    }

                    /**
                     * 画国家的hover效果
                     */
                    if (drawHoverBorder) {

                        if (params.pick_index !== this.bordered_country_index) {
                            this.set_border(params.pick_index);
                        }
                        if (this.border.count) {
                            var f = this.programs.line.use();
                            f.uniformMatrix4fv("mvp", params.camera.mvp);
                            f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                            f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                            f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                            f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                            f.uniform1f("blend", c);
                            f.uniform1f("height", this.bordered_country_index == this.extruded_country_index ? global_n : 0);
                            f.uniform4f("color", 1, 1, 1, .5);
                            webgl.bindElementBuffer(this.border.buffer);
                            gl.lineWidth(2);
                            gl.drawElements(gl.LINES, this.border.count, gl.UNSIGNED_SHORT, 0);
                            gl.lineWidth(1)
                        }
                    }
                    gl.disable(gl.DEPTH_TEST);
                    gl.disable(gl.CULL_FACE)
                }
            },
            /**
             * 检查鼠标在哪个国家上
             */
            pick: function () {
                function e(params, mouseX, mouseY) {
                    var viewport = params.camera.viewport,
                        c = t,
                        l = r,
                        s = r;
                    mat4.identity(c);
                    mat4.translate(c, c, [
                        (viewport[2] - 2 * (mouseX - viewport[0])) / l, -(viewport[3] - 2 * (mouseY - viewport[1])) / s,
                        0
                    ]);
                    mat4.scale(c, c, [viewport[2] / l, viewport[3] / s, 1]);
                    mat4.multiply(c, c, params.camera.mvp);
                    var f = o();
                    gl.viewport(0, 0, r, r);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
                    gl.clearColor(0, 0, 1, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.disable(gl.BLEND);
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.BACK);
                    gl.enable(gl.DEPTH_TEST);
                    var v = this.programs.pick.use();
                    v.uniformMatrix4fv("mvp", c);
                    webgl.bindVertexBuffer(this.buffers.map.vert);
                    var p = this.map_vert_stride_bytes,
                        g = params.projection.blend < .5 ? 0 : 24;
                    v.vertexAttribPointer("position", 3, gl.FLOAT, !1, p, g);

                    webgl.bindElementBuffer(this.buffers.map.face);

                    _.each(this.countries, function (e, t) {
                        v.uniform1f("color", t / 255);
                        gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1)
                    });
                    gl.disable(gl.CULL_FACE);
                    gl.disable(gl.DEPTH_TEST);
                    gl.readPixels(0, 0, r, r, gl.RGBA, gl.UNSIGNED_BYTE, n);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);

                    for (var h = -1, m = 0, d = {}, b = 0; b < n.length; b += 4) {
                        if (n[b + 3]) {
                            var y = n[b + 1] << 8 | n[b + 0],
                                T = d[y] || 0;
                            d[y] = ++T;
                            T > m && (h = y, m = T)
                        }
                    }
                    return h
                }

                var t = mat4.create(),
                    r = 4,
                    n = new Uint8Array(r * r << 2),
                    o = function () {
                        function getFrameBuffer() {
                            t = gl.createFramebuffer();
                            gl.bindFramebuffer(gl.FRAMEBUFFER, t);
                            var e = webgl.createTexture2D({
                                size: r
                            });
                            gl.bindTexture(gl.TEXTURE_2D, e);
                            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, e, 0);
                            var n = gl.createRenderbuffer();
                            gl.bindRenderbuffer(gl.RENDERBUFFER, n);
                            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, r, r);
                            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, n);
                            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
                        }

                        var t = null;
                        return function () {
                            t || getFrameBuffer();
                            return t
                        }
                    }();
                return e
            }(),
            /**
             * hover时高亮国家的边线
             * @param countryIndex
             */
            set_border: function (countryIndex) {

                if (0 > countryIndex) {
                    this.border.count = 0;
                    this.bordered_country_index = -1;
                    return;
                }
                var country = this.countries[countryIndex],
                    r = [],
                    borders = country.borders,
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
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.border.buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(r), gl.STATIC_DRAW);
                this.border.count = r.length;
                this.bordered_country_index = countryIndex
            }
        };
        //支持事件机制
        make_event_emitter(World.prototype);

        GTW.World = World;
    })();

    /**
     * GTW Labels
     * 绘制国家的名称
     */
    (function () {

        function Labels() {
            this.size = 2048;
            this.r = vec3.create();
            this.buffers = {
                vert: null
            };
            this.programs = {
                label: webgl.getProgram("label")
            };
            this.texture = webgl.createTexture2D({
                size: this.size,
                mipmap: !0,
                min: gl.LINEAR_MIPMAP_LINEAR,
                aniso: 4,
                format: gl.LUMINANCE
            });
            gl.generateMipmap(gl.TEXTURE_2D);
            this.country_count = 0;
            this.labels = [];
            this.geoip_iso2 = null;
            var e = this;
            this.load_label_data(function () {
                e.render_labels("en");
                e.project_labels("ecef")
            })
        }

        Labels.prototype = {
            load_label_data: function (callback) {
                var self = this;
                $.getJSON(GTW.resource_url("data/labels.json"), function (r) {

                    function o() {
                        this.coord = vec3.create();
                        this.coord[2] = 1e-4;
                        this.pos = vec3.create();
                        this.mat = mat4.create();
                        this.box = vec4.create();
                        this.name = "";
                        this.font_size = 0
                    }

                    function a(cities, upperCase, n) {
                        _.each(cities, function (city) {
                            if (upperCase) {
                                if ((n && city.font_size < 5) || (!n && city.font_size > 5)) {
                                    return
                                }
                            }
                            var a = new o;
                            vec2.copy(a.coord, city.coord);
                            a.coord[2] *= 2;
                            a.name = city.name;
                            a.font_size = city.font_size;
                            upperCase ? a.name = a.name.toUpperCase() : a.font_size = 3;
                            self.labels.push(a);
                        })
                    }

                    a(r.countries, true, true);
                    self.country_count = self.labels.length;
                    a(r.cities, false, false);
                    a(r.countries, true, false);
                    self.city_count = self.labels.length - self.country_count;
                    var i = 30 * self.labels.length;
                    self.buffers.vert = webgl.makeVertexBuffer(new Float32Array(i));
                    callback()
                })
            },
            render_labels: function (e) {
                var self = this;
                var r = document.createElement("canvas");
                r.width = r.height = self.size;
                var n = r.getContext("2d");
                n.fillStyle = "#000";
                n.fillRect(0, 0, r.width, r.height);
                n.font = "30px Ubuntu Mono";
                n.fillStyle = "white";
                n.textBaseline = "top";
                var o = [0, 0],
                    a = 35;
                _.each(this.labels, function (e) {
                    var i = e.name,
                        u = n.measureText(i).width;
                    o[0] + u >= r.width && (o[0] = 0, o[1] += a);
                    n.fillText(i, o[0], o[1] - 0);
                    vec4.set(e.box, o[0], o[1], o[0] + u, o[1] + a);
                    vec4.scale(e.box, e.box, 1 / self.size);
                    o[0] += u
                });
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, r);
                gl.generateMipmap(gl.TEXTURE_2D)
            },
            project_labels: function (e) {
                function t(t, r, i, u) {
                    mat4.identity(t);
                    if ("ecef" == e) {
                        vec3.normalize(n, r);
                        vec3.set(o, 0, 1, 0);
                        vec3.cross(o, n, o);
                        vec3.normalize(o, o);
                        vec3.cross(a, o, n);
                        t[0] = o[0];
                        t[1] = o[1];
                        t[2] = o[2];
                        t[4] = n[0];
                        t[5] = n[1];
                        t[6] = n[2];
                        t[8] = a[0];
                        t[9] = a[1];
                        t[10] = a[2];
                        mat4.rotateX(t, t, HALF_PI);
                    }
                    mat4.scale(t, t, [i, u, 1]);
                    t[12] = r[0], t[13] = r[1], t[14] = r[2]
                }

                if (this.labels.length) {
                    var r = "ecef" == e ? GTW.project_ecef : GTW.project_mercator,
                        n = vec3.create(),
                        o = vec3.create(),
                        a = vec3.create(),
                        i = [],
                        u = vec3.create(),
                        c = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1],
                        l = this;
                    _.each(this.labels, function (e) {
                        e.iso2 == l.geoip_iso2 ? e.coord[2] = .015 : e.coord[2] = .001, r(e.pos, e.coord);
                        var n = 1 * e.font_size;
                        t(e.mat, e.pos, n * (e.box[2] - e.box[0]), n * (e.box[3] - e.box[1]));
                        for (var o = 0; o < c.length; o += 2) {
                            u[0] = c[o + 0];
                            u[1] = c[o + 1];
                            u[2] = 0;
                            vec3.transformMat4(u, u, e.mat);
                            i.push(u[0], u[1], u[2]);
                            u[0] = .5 * (1 + c[o + 0]);
                            u[1] = .5 * (1 + c[o + 1]);
                            u[0] = lerp(e.box[2], e.box[0], u[0]);
                            u[1] = lerp(e.box[3], e.box[1], u[1]);
                            i.push(u[0], u[1])
                        }
                    });
                    webgl.bindVertexBuffer(this.buffers.vert);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(i))
                }
            },
            draw: function (e) {
                var self = this;
                if (0 != this.labels.length) {
                    gl.enable(gl.DEPTH_TEST);
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    gl.depthMask(!1);
                    e.project(self.r, e.geocam.coord);
                    var t = 3,
                        n = 10,
                        o = lerp(t, n, e.projection.blend),
                        a = this.programs.label.use();
                    a.uniformMatrix4fv("mvp", e.camera.mvp);
                    a.uniform4f("circle_of_interest", self.r[0], self.r[1], self.r[2], o);
                    a.uniformSampler2D("t_color", this.texture);
                    webgl.bindVertexBuffer(this.buffers.vert);
                    a.vertexAttribPointer("position", 3, gl.FLOAT, !1, 20, 0);
                    a.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, 20, 12);
                    a.uniform1i("inside", 0);
                    gl.drawArrays(gl.TRIANGLES, 0, 6 * this.country_count);
                    a.uniform1i("inside", 1);
                    gl.drawArrays(gl.TRIANGLES, 6 * this.country_count, 6 * this.city_count);
                    gl.depthMask(!0);
                    gl.disable(gl.BLEND)
                }
            }
        };

        GTW.Labels = Labels;
    })();

    /**
     * GTW init_scape
     * @TODO 未知作用
     */
    (function () {
        GTW.init_scape = function (e, t) {
            function r(e, t) {
                e += I[0], t += I[1];
                for (var r = 16, n = 0, o = .5; r--;) {
                    n += o * noise.perlin2(e, t), o *= .5, e *= 2, t *= 2;
                }
                return n
            }

            function n(e) {
                return .5 + .5 * noise.perlin2(B * e + I[0], I[1])
            }

            function o(t, r, n, o) {
                W(t, r, n, o), e.project(t, t)
            }

            function a() {
                I[0] = 100 * Math.random(), I[1] = 100 * Math.random(), U = lerp(1.5, 5.5, Math.random()), N = lerp(2, 3, Math.random()), B = lerp(1, 7, Math.random());
                for (var e = 0, t = 0; d > t; ++t) {
                    for (var r = 0; b > r; ++r) {
                        var n = r / (b - 1),
                            a = t / (d - 1);
                        o(D, n, a), y[e + 0] = D[0], y[e + 1] = D[1], y[e + 2] = D[2], e += 4
                    }
                }
                webgl.bindVertexBuffer(Y.verts), gl.bufferSubData(gl.ARRAY_BUFFER, 0, y)
            }

            function draw() {
                vec3.lerp(ie, ie, ue, .05), vec3.lerp(ne, ne, oe, .05), vec3.lerp(ue, ue, ae, .05), vec3.lerp(oe, oe, re, .05);
                var t = Q.scape.use();
                t.uniformMatrix4fv("mvp", e.camera.mvp), t.uniform4fv("color", ne), t.uniform3fv("fog_color", ie), t.uniformSampler2D("pattern", K.pattern), webgl.bindVertexBuffer(Y.verts), t.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0), webgl.bindVertexBuffer(Y.texcoords), t.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, 0, 0), webgl.bindElementBuffer(Y.quads), gl.disable(gl.BLEND), gl.enable(gl.DEPTH_TEST), gl.enable(gl.POLYGON_OFFSET_FILL), gl.polygonOffset(1, 1), gl.drawElements(gl.TRIANGLE_STRIP, H, gl.UNSIGNED_SHORT, 0), gl.disable(gl.POLYGON_OFFSET_FILL), gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                var t = Q.scape_lines.use();
                t.uniformMatrix4fv("mvp", e.camera.mvp), t.uniform4f("color", 140 / 255, 160 / 255, 138 / 255, .5), webgl.bindVertexBuffer(Y.verts), t.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0), webgl.bindElementBuffer(Y.lines), gl.drawElements(gl.LINES, $, gl.UNSIGNED_SHORT, 0)
            }

            function u(e) {
                return -e * Math.log(1 - MersenneTwister.random())
            }

            function reset() {
                fe = 0;
                a();
                ve = u(pe);
                he = !0
            }

            function l() {
                var e = [];
                return GTW.systems_foreach(function (t, r) {
                    t.enabled && e.push(r)
                }), _.sample(e)
            }

            function update() {
                var r = fe / se;
                r *= .8, fe += 1 / 60;
                var a = n(r);
                if (o(Z, r, a, 0), o(J, r + .01, a, 0), vec3.sub(le, J, Z), vec3.normalize(le, le), vec3.normalize(S, Z), o(Z, r, a), vec3.scaleAndAdd(Z, Z, S, .5), he ? (vec3.copy(ce, Z), g.move_to(ce, le, S), vec3.copy(p.pos, g.pos), vec3.copy(p.rot, g.rot), he = !1) : (vec3.lerp(ce, ce, Z, .1), g.move_to(ce, null, S), p.follow(g.pos, g.rot, .1, .05)), p.roll(.01 * noise.perlin2(e.time, .934)), fe > ve) {
                    ve = fe + u(pe);
                    var i = l();
                    if (Math.random() < .3) {
                        var c = Z,
                            s = null,
                            f = Math.random(),
                            v = r + lerp(.01, .2, f),
                            h = n(v) + Random.gauss(0, .1);
                        W(c, v, h);
                        var m = t.launch(e, i, c, s);
                        vec3.scaleAndAdd(ue, ue, m.color, .5 * f), vec3.scaleAndAdd(oe, oe, m.color, .5 * (1 - f)), .1 > f && (e.flash(m.color), ge = 1)
                    } else {
                        var s = Z,
                            c = J,
                            v = Random.uniform(r + .2, 1),
                            h = n(v) + Random.gauss(0, .1),
                            d = Random.uniform(0, 1),
                            _ = Random.uniform(0, 1);
                        W(c, v, h), W(s, d, _), t.launch(e, i, c, s, 30)
                    }
                }
            }

            function update_camera() {
                if (vec3.copy(Z, p.pos), e.camera.update_quat(Z, p.rot), ge > .001) {
                    var t = 5 * e.time,
                        n = 3 * Math.sin(Math.PI * ge);
                    e.camera.mvp[12] += .2 * n * r(t, .3123123), e.camera.mvp[13] += 1.5 * n * (r(t, .9123123) - .125), mat4.invert(e.camera.mvpInv, e.camera.mvp), ge *= .85
                }
            }

            var v = function () {
                    function e() {
                        this.pos = vec3.create(), this.rot = quat.create(), this.tan = vec3.create(), this.forward = vec3.fromValues(0, 0, -1), this.up = vec3.fromValues(0, 1, 0)
                    }

                    var t = vec3.create(),
                        r = vec3.create(),
                        n = vec3.create(),
                        o = vec3.create(),
                        a = quat.create(),
                        i = quat.create(),
                        u = vec3.create(),
                        c = vec3.create();
                    return e.prototype.move_to = function (e, l, s) {
                        if (vec3.copy(t, e), vec3.copy(r, this.pos), vec3.copy(o, this.tan), vec3.sub(n, t, r), vec3.normalize(n, n), quat.copy(i, this.rot), s) {
                            vec3.transformQuat(u, this.up, this.rot), vec3.copy(c, s);
                            var f = vec3.dot(u, c);
                            .999999 > f && (vec3.cross(a, u, c), a[3] = 1 + f, quat.normalize(a, a), quat.multiply(a, a, i), quat.dot(i, a) < 0 && quat.scale(a, a, -1)), quat.copy(this.rot, a), quat.copy(i, a)
                        }
                        if (l) vec3.normalize(this.tan, l), quat.rotationTo(this.rot, this.forward, this.tan);
                        else {
                            var f = vec3.dot(o, n);
                            .999999 > f && (vec3.cross(a, o, n), a[3] = 1 + f, quat.normalize(a, a), quat.multiply(a, a, i), quat.dot(i, a) < 0 && quat.scale(a, a, -1)), vec3.copy(this.tan, n), quat.copy(this.rot, a)
                        }
                        vec3.copy(this.pos, t)
                    }, e.prototype.follow = function (e, t, r, n) {
                        vec3.lerp(this.pos, this.pos, e, r || .05), vec4.lerp(this.rot, this.rot, t, n || .02), quat.normalize(this.rot, this.rot)
                    }, e.prototype.roll = function (e) {
                        var t = this.rot;
                        quat.rotateZ(t, t, e)
                    }, e
                }(),
                p = new v,
                g = new v,
                h = [-180, 0, 0],
                m = [
                    180, 0, 0
                ],
                d = 128,
                b = 512,
                y = [],
                T = [],
                w = [],
                E = [],
                x = vec3.fromValues(h[0], h[1], 0),
                A = vec3.fromValues(m[0], m[1], 0),
                M = vec3.create(),
                R = vec3.create();
            vec3.sub(M, A, x);
            vec2.normalize(M, M);
            vec2.perp(R, M);
            var P = 360,
                L = .2 * P;
            vec2.scale(M, M, P);
            vec2.scale(R, R, L);
            var D = vec4.create(),
                S = vec3.create(),
                F = 3,
                k = Math.pow,
                G = Math.abs,
                I = vec2.create(),
                U = 2.5,
                N = 3,
                B = 2,
                W = function () {
                    var e = vec3.create();
                    return function (t, o, a, i) {
                        "undefined" == typeof i && (i = 1), vec3.set(e, 0, 0, 0), vec3.scaleAndAdd(e, A, M, o), vec3.scaleAndAdd(e, e, R, 2 * (a - .5));
                        var u = n(o),
                            c = G(a - u),
                            l = .05 + .95 * smoothstep(clamp(U * c, 0, 1)),
                            s = i * (r(8 * F * o, F * a) + 1);
                        l *= k(s, N), l -= .075, 0 > l ? l = 0 : l *= 2;
                        var f = .25 * (1 + noise.perlin2(8 * o, 1 * a)) + .05 * r(8 * o, a);
                        l += f, e[2] = .5 * l, vec3.copy(t, e)
                    }
                }();

            for (var O = 0; d > O; ++O) {
                for (var C = 0; b > C; ++C) {
                    var j = C / (b - 1),
                        q = O / (d - 1);
                    o(D, j, q);
                    y.push(D[0], D[1], D[2], 0);
                    T.push(C, O);
                    var V = O * b + C,
                        X = V + 1,
                        z = V + b;
                    b - 1 > C && E.push(V, X);
                    d - 1 > O && E.push(V, z);
                    d - 1 > O && (O && !C && w.push(V), w.push(V, z), d - 2 > O && C == b - 1 && w.push(z))
                }
            }
            y = new Float32Array(y);
            y.length / 4;
            w = new Uint16Array(w);
            var H = w.length;
            E = new Uint16Array(E);
            var $ = E.length;
            T = new Float32Array(T);
            var Y = {
                    verts: webgl.makeVertexBuffer(y),
                    quads: webgl.makeElementBuffer(w),
                    lines: webgl.makeElementBuffer(E),
                    texcoords: webgl.makeVertexBuffer(T)
                },
                K = {
                    pattern: webgl.loadTexture2D(GTW.resource_url("textures/pattern2.png"), {
                        mipmap: !0,
                        wrap: gl.REPEAT,
                        aniso: 4
                    })
                },
                Q = {
                    scape: webgl.getProgram("scape"),
                    scape_lines: webgl.getProgram("scape_lines")
                },
                Z = vec3.create();
            vec3.copy(Z, A);
            var J = vec3.clone(Z);
            vec3.scaleAndAdd(J, Z, M, 1);
            e.project(Z, Z);
            e.project(J, J);
            var ee = (vec3.create(), vec3.create());
            vec3.sub(ee, J, Z);
            var te = vec3.create();
            vec3.add(te, Z, J);
            vec3.normalize(te, te);
            var re = function () {
                    var e = vec4.fromValues(.1, .12, .11, 1),
                        t = vec4.fromValues(.2, .23, .21, 1),
                        r = .1,
                        n = vec4.create();
                    return vec4.lerp(n, e, t, r), n
                }(),
                ne = vec4.clone(re),
                oe = vec4.clone(re),
                ae = vec3.fromValues(.01, .05, .02),
                ie = vec3.clone(ae),
                ue = vec3.clone(ae),
                Z = vec3.create(),
                J = vec3.create(),
                ce = vec3.create(),
                le = vec3.create(),
                S = vec3.create(),
                se = 10,
                fe = se + 1,
                ve = 0,
                pe = .3,
                ge = 0,
                he = !0;

            return {
                reset: reset,
                draw: draw,
                update: update,
                update_camera: update_camera,
                shake: function () {
                    ge = 1
                }
            }
        };
    })();

    /**
     * GTW init_demo
     * @TODO 未知作用
     */
    (function () {
        GTW.init_demo = function (params, missileSystem) {
            function r(e) {
                var t = 16;
                return _.times(t, e.create)
            }

            function n(t, r, n, o) {
                function a(e) {
                    gl.enable(gl.DEPTH_TEST), gl.depthMask(!1), gl.lineWidth(5), gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    var t = k.rings.use();
                    t.uniformMatrix4fv("mvp", e.camera.mvp), t.uniform3fv("color", n), webgl.bindVertexBuffer(F.ring_verts), t.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0), gl.drawArrays(gl.TRIANGLE_STRIP, 0, D), gl.lineWidth(1), gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    var t = k.missile.use();
                    t.uniformMatrix4fv("mvp", e.camera.mvp), t.uniform3fv("color", n);
                    var r = clamp(e.demo_time / 5, 0, 2);
                    t.uniform1f("time", r), webgl.bindVertexBuffer(F.tube_verts), t.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0), gl.drawArrays(gl.TRIANGLE_STRIP, 0, S), gl.depthMask(!0), gl.disable(gl.BLEND), gl.disable(gl.DEPTH_TEST);
                    var o = Math.max(0, e.demo_time);
                    o /= 5, o -= ~~o;
                    var a = o * (h - 1),
                        i = ~~a;
                    a -= i;
                    var u = 6 * i;
                    vec3.set(I, 0, 0, 0), vec3.set(U, 0, 0, 0);
                    for (var c = 0; 2 > c; ++c) {
                        a = 1 - a;
                        for (var l = 0; 3 > l; ++l) {
                            I[l] += a * y[u + l], U[l] += a * y[u + 3 + l];
                        }
                        u += 6
                    }
                    G.look(I, U, I)
                }

                for (var t = vec3.clone(t), r = vec3.clone(r), i = vec2.distance(t, r), u = .005 * i, c = vec3.create(), l = vec3.create(), s = 0, f = c, g = l, h = 103, m = new Float32Array(4 * h * 8), d = 0; h > d; ++d) {
                    var _ = d / (h - 1);
                    vec3.lerp(g, t, r, _);
                    var b = u * Math.sin(_ * Math.PI) * .85;
                    g[2] += b, params.project(f, g), vec3.save(f, m, s + 0), m[s + 3] = -_, vec3.save(f, m, s + 4), m[s + 7] = _, s += 8
                }
                for (var y = [], T = 0, w = c, E = l, x = vec3.create(), d = 0; h > d; ++d) {
                    vec3.load(w, m, T), y.push(w[0], w[1], w[2]), h - 1 > d && (vec3.load(E, m, T + 8), vec3.sub(x, E, w)), y.push(x[0], x[1], x[2]), T += 8;
                }
                for (var A = function () {
                    function e() {
                        this.P = vec3.create(), this.T = vec3.create(), this.Q = quat.create()
                    }

                    return e.prototype.update = function () {
                        vec3.normalize(this.T, this.T), quat.rotationTo(this.Q, [0, 0, 1], this.T)
                    }, e.prototype.transform = function (e, t) {
                        vec3.transformQuat(e, t, this.Q), vec3.add(e, e, this.P)
                    }, e
                }(), M = [], T = 0; T < y.length; T += 6) {
                    var R = new A;
                    vec3.load(R.P, y, T + 0), vec3.load(R.T, y, T + 3), R.update(), quat.rotateZ(R.Q, R.Q, TWO_PI * d / h), M.push(R)
                }
                var P = [],
                    L = [];
                !
                    function () {
                        function e(e, t, n, o, a) {
                            r[0] = Math.cos(n) * o, r[1] = Math.sin(n) * o, r[2] = 0, t.transform(r, r), e.push(r[0], r[1], r[2], a)
                        }

                        function t(e) {
                            var t = e.length - 4;
                            e.push(e[t + 0], e[t + 1], e[t + 2], e[t + 3])
                        }

                        var r = vec3.create(),
                            n = (vec3.create(), 0 > o);
                        o = Math.abs(o);
                        for (var a = 0; a < M.length; ++a) {
                            for (var i = M[a], u = M[a + 1], c = a / (h - 1), l = lerp(.02, .07, c), s = (n ? Math.PI : TWO_PI) / o, f = 0, v = 15e-5 / l, p = 0; o >= p; ++p) {
                                var g = a && !p;
                                n && p == o && (f = 0), g && t(L), e(L, i, f, l - v, -c), g && t(L), e(L, i, f, l + v, c), u && (g && t(P), e(P, i, f, l, c), g && t(P), e(P, u, f, l, c)), f += s
                            }
                        }
                    }(), L = new Float32Array(L), P = new Float32Array(P);
                var D = L.length / 4,
                    S = P.length / 4,
                    F = {
                        verts: webgl.makeVertexBuffer(m),
                        ring_verts: webgl.makeVertexBuffer(L),
                        tube_verts: webgl.makeVertexBuffer(P)
                    },
                    k = {
                        missile: webgl.getProgram("missile_tube"),
                        simple: webgl.getProgram("simple"),
                        rings: webgl.getProgram("rings")
                    },
                    G = new v;
                p.missile = G;
                var I = vec3.create(),
                    U = vec3.create();
                vec3.create();
                return {
                    draw: a
                }
            }

            function o() {
                var r, n = p.player,
                    o = params.camera;
                if (params.demo_time < 5) {
                    g = 0, o.near = .01, o.far = 1e3, r = p.missile;
                    var a = params.demo_time / 5;
                    n.follow(r.pos, r.rot, .01 + .5 * a, a * a), n.roll(.1 * noise.perlin2(1 * params.demo_time, 0))
                } else if (params.demo_time < 15) 0 == g && (g = 1, params.flash(f), l.reset(), missileSystem.set_mode("scape"), params.draw_world = !1);
                else if (params.demo_time < 20) {
                    1 == g && (g = 2, params.flash(f), missileSystem.set_mode("world"), params.draw_world = !0), o.near = .01, o.far = 500, r = p.orbit;
                    var a = (params.demo_time - 15) / 5;
                    return n.follow(r.pos, r.rot, 5e-5 + .5 * Math.pow(a, 3), .2), void o.update_quat(n.pos, n.rot, a)
                }
                o.update_quat(n.pos, n.rot)
            }

            function update(e) {
                o(), e.draw_world || (l.update(), l.update_camera())
            }

            function draw(e) {
                e.draw_world ? s && e.demo_time < 5 && s.draw(e) : (l.draw(e), missileSystem.draw(e))
            }

            function setup(e, t, r) {
                var o = GTW.systems[e.solo_system_id],
                    a = o.color[e.palette].f;
                vec3.copy(f, a), s = n(t, r, a, o.n_sides);
                var i = p.player;
                vec3.copy(i.pos, e.camera.viewPos), quat.rotationTo(i.rot, [0, 0, -1], e.camera.viewDir);
                var u = [r[0], r[1], 1.6];
                e.project(p.orbit.pos, u);
                var c = vec3.clone(p.orbit.pos);
                vec3.normalize(c, c), vec3.negate(c, c), quat.rotationTo(p.orbit.rot, [0, 0, -1], c)
            }

            function exit() {
                if (!params.draw_world) {
                    missileSystem.set_mode("world");
                    params.draw_world = true;
                }
            }

            var l = GTW.init_scape(params, missileSystem),
                s = null,
                f = vec3.create(),
                v = function () {
                    function e() {
                        this.pos = vec3.create();
                        this.rot = quat.create()
                    }

                    var t = vec3.create(),
                        r = vec3.fromValues(0, 1, 0),
                        n = (vec3.create(), vec3.create(), vec3.create(), vec3.fromValues(0, 0, 1), mat4.create()),
                        o = mat3.create(),
                        a = vec3.create(),
                        i = vec3.create();

                    e.prototype = {
                        look: function (e, t, i) {
                            i = i || r;
                            vec3.copy(this.pos, e);
                            vec3.add(a, e, t);
                            mat4.lookAt(n, e, a, i);
                            mat3.fromMat4(o, n);
                            mat3.invert(o, o);
                            var u = this.rot;
                            quat.fromMat3(u, o);
                            quat.normalize(u, u)
                        },

                        look_at: function (e, n, o) {
                            n = n || t, o = o || r, vec3.sub(i, n, e), this.look(e, i, o)
                        },
                        move_forward: function () {
                            vec3.set(i, 0, 0, 1), vec3.transformQuat(i, i, this.rot);
                            var e = .1;
                            vec3.scaleAndAdd(this.pos, this.pos, i, e)
                        },
                        follow: function (e, t, r, n) {
                            vec3.lerp(this.pos, this.pos, e, r || .05), vec4.lerp(this.rot, this.rot, t, n || .02), quat.normalize(this.rot, this.rot)
                        },
                        roll: function (e) {
                            var t = this.rot;
                            quat.rotateZ(t, t, e)
                        }
                    };

                    return e
                }(),
                p = ({
                    vec3: r(vec3),
                    vec4: r(vec4),
                    quat: r(quat),
                    mat4: r(mat4),
                    mat3: r(mat3)
                }, {
                    missile: new v,
                    player: new v,
                    orbit: new v
                }),
                g = 0;
            return {
                draw: draw,
                setup: setup,
                update: update,
                exit: exit
            }
        };
    })();

    /**
     * GTW init_hedgehog
     * 显示国家的弹窗
     */
    (function () {
        GTW.init_hedgehog = function (e) {
            function Hedgehog() {
                this.position = vec3.create();
                var e = 2;
                this.scale = vec2.fromValues(1 * e, .25 * e);
                this.texture = null
            }

            Hedgehog.prototype.destroy = function () {
                gl.deleteTexture(this.texture);
                this.texture = null
            };

            function setup(e, r) {
                _.each(hedgehogs, function (e) {
                    e.destroy()
                });
                hedgehogs = [];
                for (var n = [], o = 0; 10 > o; ++o) {
                    var a = GTW.top_infected[o],
                        i = r.key_to_country[a];
                    if (i) {
                        var u = o + 1,
                            c = i.center,
                            s = new Hedgehog,
                            g = s.position,
                            h = .5;
                        vec3.set(g, c[0], c[1], h);
                        e.project(g, g);
                        var m = vec3.create();
                        vec3.set(m, c[0], c[1], 0);
                        e.project(m, m);
                        n.push(g[0], g[1], g[2]);
                        n.push(m[0], m[1], m[2]);
                        var d = MAP.lang;
                        context.fillStyle = "rgb(255,255,255)";
                        context.alpha = 0;
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        context.fillStyle = "#000";
                        context.font = 'bold 32px "Ubuntu Mono"';
                        context.fillText(GTW.get_country_name(i).toUpperCase(), 30, 60);
                        context.font = 'bold 20px "Ubuntu Mono"';
                        window.lang ? context.fillText(window.lang.getText("NUMBER_SYMBOL") + u + " " + window.lang.getText("MOST_ATTACKED_COUNTRY"), 30, 90) : "ru" == d ? context.fillText("№" + u + " в мире по числу атак", 30, 90) : context.fillText("#" + u + " MOST-ATTACKED COUNTRY", 30, 90);
                        var b = s.texture = gl.createTexture();
                        gl.bindTexture(gl.TEXTURE_2D, b);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.generateMipmap(gl.TEXTURE_2D);
                        hedgehogs.push(s)
                    }
                }
                buffers.lines && (gl.deleteBuffer(buffers.lines), buffers.lines = null), buffers.lines = webgl.makeVertexBuffer(new Float32Array(n))
            }

            function n(e) {
                var t = programs.simple.use();
                t.uniformMatrix4fv("mvp", e.camera.mvp);
                t.uniform4f("color", 1, 1, 1, .5 * fade);
                webgl.bindVertexBuffer(buffers.lines);
                t.vertexAttribPointer("position", 3, gl.FLOAT, !1, 0, 0);
                gl.drawArrays(gl.LINES, 0, 2 * hedgehogs.length)
            }

            function o(e) {
                var t = programs.hedgehog.use();
                t.uniformMatrix4fv("mvp", e.camera.mvp);
                t.uniformMatrix3fv("bill", e.camera.bill);
                t.uniform4f("color", 1, 1, 1, 0);
                webgl.bindVertexBuffer(buffers.verts);
                t.vertexAttribPointer("coord", 2, gl.FLOAT, !1, 0, 0);
                _.each(hedgehogs, function (e) {
                    t.uniform3fv("position", e.position);
                    t.uniform2fv("scale", e.scale);
                    t.uniformSampler2D("t_color", e.texture);
                    t.uniform1f("fade", fade);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
                })
            }

            function draw(e) {
                fade = canShow ? Math.min(1, fade + h) : Math.max(0, fade - h), 0 != fade && (gl.enable(gl.DEPTH_TEST), gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA), o(e), n(e), gl.disable(gl.BLEND), gl.disable(gl.DEPTH_TEST))
            }

            function show() {
                canShow = !0
            }

            function hide() {
                canShow = !1
            }

            var buffer = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
                buffers = {
                    verts: webgl.makeVertexBuffer(buffer),
                    lines: null
                },
                programs = {
                    simple: webgl.getProgram("simple"),
                    hedgehog: webgl.getProgram("hedgehog")
                },
                canvas = document.createElement("canvas");
            canvas.width = 512, canvas.height = 128;
            var context = canvas.getContext("2d");

            var hedgehogs = [],
                fade = 0,
                h = .02,
                canShow = false;
            return {
                show: show,
                hide: hide,
                draw: draw,
                setup: setup
            }
        };
    })();

    /**
     * GTW init_connectors
     * 画连接线
     */
    (function () {
        GTW.init_connectors = function () {
            var o = new Float32Array(8 * 20),
                lines = 0,
                buffers = {
                    verts: webgl.makeVertexBuffer(o)
                },
                program = {
                    connector: webgl.getProgram("connector")
                };

            function draw(params) {
                gl.disable(gl.DEPTH_TEST);
                var t = program.connector.use();
                t.uniformMatrix4fv("mvp", params.camera.mvp);
                var r = 1;
                t.uniform4f("color", r, r, r, 1);
                webgl.bindVertexBuffer(buffers.verts);
                t.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0);
                if (lines > 0) {
                    gl.drawArrays(gl.LINES, 0, 2 * lines)
                }

            }

            function addLine(e, t) {
                console.log(e, t);
                var r = 8 * lines;
                vec3.save(e, o, r + 0);
                o[r + 3] = 0;
                vec3.save(t, o, r + 4);
                o[r + 7] = 1;
                ++lines;
                webgl.bindVertexBuffer(buffers.verts);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, o)
            }

            function clear() {
                lines = 0
            }

            return {
                draw: draw,
                add_line: addLine,
                clear: clear
            }
        };
    })();

    /**
     * GTW init_marker
     * 显示坐标标志
     */
    (function () {
        GTW.init_marker = function (params) {
            var n = [0, 0, 1, 0, 0, 1, 1, 1],
                o = {
                    verts: webgl.makeVertexBuffer(new Float32Array(n))
                },
                a = {
                    pin_sharp: webgl.loadTexture2D(GTW.resource_url("textures/pin-sharp.png"), {
                        mipmap: !0
                    }),
                    pin_fuzzy: webgl.loadTexture2D(GTW.resource_url("textures/pin-fuzzy.png"), {
                        mipmap: !0
                    })
                },
                i = {
                    marker: webgl.getProgram("marker")
                },
                u = mat4.create(),
                c = vec3.create(),
                l = vec3.create(),
                s = vec3.create(),
                f = 0,
                v = !0,
                p = false;

            /**
             * 设置坐标标记的位置
             * @param center
             */

            function set_coord(center) {
                var r = vec3.create();
                params.project(r, center);
                mat4.identity(u);
                mat4.translate(u, u, r);
                vec3.copy(l, r);
                vec3.copy(s, r);
                var n = vec3.create(),
                    o = vec3.create(),
                    a = vec3.create();
                vec3.normalize(n, l);
                vec3.set(o, 0, 1, 0);
                vec3.cross(a, n, o);
                vec3.normalize(a, a);
                vec3.cross(o, a, n);
                vec3.scaleAndAdd(s, s, o, 10);
                f = 0;
                v = !1
            }

            /**
             * 画出坐标标记
             * @param params
             */

            function draw(params) {
                if (!v) {
                    f += .01;
                    if (f > 1) {
                        f = 1;
                        v = !0;
                        var t = .7;
                        p || params.flash([t, t, t])
                    }
                    vec3.lerp(c, s, l, Math.pow(f, .75))
                }
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                var r = i.marker.use();
                r.uniformMatrix3fv("bill", params.camera.bill);
                r.uniformMatrix4fv("mvp", params.camera.mvp);
                r.uniform3fv("pos", c);
                r.uniformSampler2D("t_sharp", a.pin_sharp);
                r.uniformSampler2D("t_fuzzy", a.pin_fuzzy);
                var n = .7;
                r.uniform4f("color", n, n, n, 1);
                r.uniform1f("scale", .1);
                r.uniform1f("fuzz", 0);
                webgl.bindVertexBuffer(o.verts);
                r.vertexAttribPointer("coord", 2, gl.FLOAT, !1, 0, 0);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            }

            return {
                draw: draw,
                set_coord: set_coord,
                cancel_flash: function () {
                    p = true
                }
            }
        };
    })();

    /**
     * GTW init_flash
     * 地球刚加载完以后,会出现一个闪光
     */
    (function () {
        GTW.init_flash = function () {
            function draw() {
                if (!(i[3] < .001)) {
                    i[3] *= .97;
                    var t = o.simple.use();
                    t.uniformMatrix4fv("mvp", a);
                    t.uniform4fv("color", i);
                    webgl.bindVertexBuffer(n.verts);
                    t.vertexAttribPointer("position", 2, gl.FLOAT, !1, 0, 0);
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    gl.disable(gl.BLEND);
                }
            }

            var r = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
                n = {
                    verts: webgl.makeVertexBuffer(r)
                },
                o = {
                    simple: webgl.getProgram("simple")
                },
                a = mat4.create();
            mat4.translate(a, a, [-1, -1, 0, 0]);
            mat4.scale(a, a, [2, 2, 2]);
            var i = vec4.create();

            return {
                draw: draw,
                flash: function (e) {
                    vec3.copy(i, e);
                    i[3] = 2
                }
            }
        };
    })();
})(window);
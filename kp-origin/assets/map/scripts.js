var MAP = {
    lange: "en"
};
MAP.init = function (options) {

    function n() {
        if (selectedCountry) {
            var a = Ve(selectedCountry.center, 90);
            if (!a) {
                functions.hide_country_popup();
                GTWConnector.clear();
            }
        }
    }

    function projection() {
        var dir = params.projection.dir > 0,
            coord = params.geocam.coord,
            coord_target = params.geocam.coord_target,
            coord_delta = params.geocam.coord_delta;

        vec3.add(coord_target, coord_target, coord_delta);
        coord_target[1] = clamp(coord_target[1], -80, 80);

        var projectionType;

        projectionType = dir ? [.35, 4.5] : [0.15, 1];
        coord_target[2] = clamp(coord_target[2], projectionType[0], projectionType[1]);

        if (dir) {
            if (coord[0] < -180) {
                coord[0] += 360;
                coord_target[0] += 360;
            } else if (coord[0] > 180) {
                coord[0] -= 360;
                coord_target[0] -= 360
            }
        } else {
            coord_target[0] = clamp(coord_target[0], -180, 180)
        }
        vec3.lerp(coord, coord, coord_target, params.geocam.lerp_speed);
        vec3.scale(coord_delta, coord_delta, .9);

        GTW.project_mercator(K, [coord[0], coord[1], 0]);
        GTW.project_mercator(Q, coord);
        Q[1] -= 2;
        vec3.sub(Z, K, Q);
        vec3.normalize(Z, Z);
        vec3.copy(K, Q);
        var u = [0, 0, 0];
        GTW.project_ecef(u, [coord[0], coord[1], 0]);
        GTW.project_ecef(Q, coord);
        var c = clamp(2 * (earthDefaultSize - coord[2]), 0, 1);

        c = lerp(0, 2, c);
        Q[1] -= c;
        vec3.sub(J, u, Q);
        vec3.normalize(J, J);
        var l = smoothstep(params.projection.blend);
        vec3.lerp(K, K, Q, l);
        vec3.lerp(Z, Z, J, l);

        params.camera.update(K, Z);

        params.projection.blend = clamp(params.projection.blend + params.projection.dir / 120, 0, 1)
    }

    function f(e, t) {
        var r = t.length / 3,
            n = Math.random(),
            o = r - 1,
            a = 0;
        for (var i = 0; o >= a;) {
            var u = a + o >> 1,
                c = t[3 * u + 0];
            c > n ? o = u - 1 : a = u + 1
        }
        i = o;
        var l = 3 * i,
            s = t[l + 1],
            f = t[l + 2];
        f += Random.gauss(0, .01);
        s += Random.gauss(0, .01);
        e[0] = s;
        e[1] = f
    }

    function v(e, countryIndex) {

        if (0 === countryIndex) {
            return false;
        }
        var country = GTWWorld.key_to_country[countryIndex];
        if (country) {
            f(e, country.cities);
            if (GTWWorld.geoip) {
                country == GTWWorld.geoip.country ? e[2] = .014 : e[2] = 0;
            }
            return true;
        }
        return false;
    }

    function p(e, country, r, n, o) {
        if (n) {

            Re[0] = n[0];
            Re[1] = n[1];
            Re[2] = 0;

            if (GTWWorld.geoip && country == GTWWorld.geoip.country) {
                Re[2] += .014;
            }

            if (r) {
                Pe[0] = n[2];
                Pe[1] = n[3];
                Pe[2] = 0;
                GTWWorld.geoip && r == GTWWorld.geoip.country && (Re[2] += .014);
                o = (Math.random() - .5) * Math.PI;
                GTWMissileSystem.launch(params, e, Re, Pe, o);
            } else {
                vec3.copy(Pe, Re);
                var a = o,
                    i = .5 * lerp(5, 6, Math.random());
                Pe[0] += i * Math.cos(a);
                Pe[1] += i * Math.sin(a);
                Pe[2] += lerp(.15, .2, Math.random());
                GTWMissileSystem.launch(params, e, Re, Pe)
            }
        } else {
            if (!v(Re, country))return;
            if (r) {
                v(Pe, r);
                GTWMissileSystem.launch(params, e, Re, Pe)
            } else {
                GTWMissileSystem.launch(params, e, Re, null)
            }
        }
    }

    function g(e) {

        if (Le) {
            return void(Le = false);
        }

        if (GTWWorld.countries.length) {

            _.each(e, function (e) {
                var t = e.key,
                    r = t >> 16 & 255,
                    country = t >> 8 & 255,
                    o = t >> 0 & 255,
                    a = GTW.systems[r],
                    i = !0;
                if (8 == r) {
                    e.coords && (i = !1);
                    0 == country && (i = !1);
                }

                if (i) {
                    ++a.count;
                    ++a.graph[ue];
                    ++a.target_count[country]
                }

                ++GTW.total_target_count[country];

                if (params.draw_world && a.enabled) {

                    p(r, country, o, e.coords, e.angle)
                }

            });

            if (selectedCountry && Ee < params.time) {
                var t = selectedCountry.key;
                GTW.compute_total_target_rank();
                $ranking.text(GTW.total_target_rank[t]);
                Ee = params.time + 2
            }
            if (xe < params.time) {
                GTW.compute_total_target_rank();
                for (var r = [], n = 0; 5 > n; ++n) {
                    var t = GTW.top_infected[n],
                        o = GTWWorld.key_to_country[t];
                    o && r.push('<li data-key="' + t + '">' + GTW.get_country_name(o) + "</li>")
                }
                xe = params.time + 5;
                GTWhedgehog.setup(params, GTWWorld);
                if (Xe) {
                    var a = GTW.top_infected[0],
                        i = GTWWorld.key_to_country[a];

                    i && (showLocation(i), Xe = !1)
                }
            }
            if (we < params.time) {
                GTW.systems_foreach(function (e) {
                    $(e.el_count_selector).text(e.count);
                    if (selectedCountry) {
                        var t = selectedCountry.key,
                            r = e.target_count[t];
                        $(e.el_popcount_selector + " h4").text(r)
                    }
                });
                we = params.time + Random.uniform(.1, .5)
            }
        }
    }

    function h(modelName, t) {
        Fe = params.time + t;
        ke = modelName
    }

    /**
     * 仅仅让地球静止
     */
    function staticableOnly() {
        if (showingCountryPop) {
            clearTimeout(showingCountryPop);
            showingCountryPop = null;
            vec3.copy(params.geocam.coord_target, params.geocam.coord);
            GTWmarker.cancel_flash();
        }
    }

    /**
     * 隐藏国家弹窗,并使地球静止
     */
    function hidePopAndStaticAble() {
        showCountryPop(null);
        staticable()
    }

    /**
     *  退出demo模式
     *  让地球静止,不再动
     */
    function staticable() {
        switchModel("idle", true);
        GTWdemo.exit();
        GTWhedgehog.hide();
        staticableOnly()
    }

    /**
     * 当鼠标拖拽完毕
     * @param length  鼠标拖拽了多少像素
     */
    function onDropend(length) {
        var minLength = 5;
        if (!(length > minLength)) {
            if (params.pick_index < 0) {
                showCountryPop(null);
                return void resetEarth();
            }

            staticableOnly();
            var n = GTWWorld.countries[params.pick_index];
            if (n === selectedCountry) {
                showCountryPop(null);
                resetEarth();
            } else {
                vec3.set(params.geocam.coord_target, n.center[0], n.center[1], U);
                showCountryPop(n);
            }
            showSystemPop(null)
        }
    }

    /**
     * 切换显示模式
     * @param modelName
     * @param r
     * @returns {*}
     */
    function switchModel(modelName, r) {
        if ((r || modelName !== currentModel) && !$("body").hasClass("scroll")) {
            switch (modelName) {
                case"idle":
                    functions.set_demo_state(false);
                    params.geocam.lerp_speed = .2;
                    high_quality && h("spin_1", 30);
                    break;
                case"spin_1":
                    if (params.projection.dir < 0) {
                        MAP.set_view("globe");
                    }
                    if (!MAP.is_bad_mode) {

                        functions.set_demo_state(!0);
                        staticableOnly();
                        GTWhedgehog.setup(params, GTWWorld);
                        GTWhedgehog.show();
                        h("solo", 20);
                    }
                    params.geocam.lerp_speed = .015;

                    resetEarth();
                    showCountryPop(null);
                    break;
                case"solo":
                    GTWhedgehog.hide();
                    var n = [];
                    GTW.systems_foreach(function (e, t) {
                        e.enabled && n.push(t)
                    });
                    if (n.length > 0) {
                        params.solo_system_id = _.sample(n);
                        showSystemPop(params.solo_system_id);
                        h("spin_2", 15)
                    }
                    break;
                case"spin_2":
                    showSystemPop(null);
                    h("demo", 5);
                    break;
                //DEMO模式
                case"demo":
                    params.demo_time_start = params.time;
                    var i = false;
                    (function () {
                        var samples = _.filter(GTWWorld.countries, function (country) {
                                return Ve(country.center, 30) == true
                            }),
                            e = _.sample(samples),
                            top_infected = _.sample(GTW.top_infected),
                            t = GTWWorld.key_to_country[top_infected];
                        console.log(e, t);
                        if (!e || !t) {
                            return void console.log("BAD DEMO");
                        }
                        var r = vec3.create();
                        v(r, t.key);
                        GTWdemo.setup(params, e.center, r);
                        vec2.copy(params.geocam.coord_target, r);
                        vec2.copy(params.geocam.coord, r);
                        setTimeout(function () {
                            showCountryPop(t);
                            showSystemPop(null)
                        }, 5e3);
                        setTimeout(function () {
                            showCountryPop(null)
                        }, 15e3);
                        i = true
                    }());
                    if (!i) {
                        return void switchModel("spin_2", 0);
                    }
                    h("spin_1", 20)
            }
            currentModel = modelName
        }
    }

    /**
     * 显示坐标标记
     * @param country
     * @param t
     */
    function showLocation(country, t) {
        if (country) {
            hidePopAndStaticAble();
            var r = country.center;
            params.geocam.lerp_speed = .015;
            vec3.set(params.geocam.coord_target, r[0], r[1], U);
            t = t || r;
            setTimeout(function () {
                //设置坐标标记的坐标点
                GTWmarker.set_coord(t)
            }, 3e3);
            if (high_quality) {
                showingCountryPop = setTimeout(function () {
                    showCountryPop(country)
                }, 5e3);
            }
        }
    }

    /**
     * 国家被点击的时候出发
     * @param Country
     */
    function showCountryPop(Country) {
        if (Country !== selectedCountry) {
            if (Country) {
                functions.show_country_popup(GTW.get_country_name(Country));
                we = 0;
                Ee = 0
            } else {
                functions.hide_country_popup()
            }
            selectedCountry = Country;

            showCountryPopLine($("#countrypop")[0], Country)
        }

    }

    /**
     * 给国家弹窗画连接线
     * @param element
     * @param countryName
     */
    function showCountryPopLine(element, countryName) {
        GTWConnector.clear();
        if (element && countryName) {
            var elementRect = element.getBoundingClientRect(),
                canvasRect = canvas.getBoundingClientRect(),
                left = elementRect.left + .5 * elementRect.width,
                top = elementRect.top + .5 * elementRect.height;

            left -= canvasRect.left;
            top -= canvasRect.top;
            var i = vec3.create();

            i[0] = 2 * (left / canvas.width - .5);
            i[1] = -2 * (top / canvas.height - .5);
            var u = vec3.create(),
                c = vec3.create(),
                l = {
                    NO: [9.787, 61.391],
                    SE: [15.179, 60.131],
                    FI: [26.199, 63.0149]
                },
                s = l[countryName.iso2];
            s ? vec2.copy(c, s) : vec3.copy(c, countryName.center);
            params.project(u, c);

            GTWConnector.add_line(i, u)
        }
    }

    /**
     * 显示System弹窗
     * @param systemIndex
     */
    function showSystemPop(systemIndex) {
        var names = function () {
            var e = [];
            GTW.systems_foreach(function (t) {
                e.push(t.name.toLowerCase())
            });
            return e.join(" ")
        }();
        if (systemIndex) {
            var system = GTW.systems[systemIndex],
                sysName = system.name.toLowerCase(),
                description = sysName + " description",
                $icon = $("<i>").addClass("icon"),
                $pop = $("<div>");

            $pop.html(description);
            $("img", $pop).remove();
            $pop.prepend($icon);

            $("#systempop").removeClass(names).empty().html("");
            $("#systempop").addClass(sysName).append($pop).fadeIn()

        } else {
            $("#systempop").fadeOut(400, function () {
                $("#systempop").removeClass(names).empty().html("")
            });
        }
        showSystemPopLine(systemIndex)
    }

    /**
     * system弹窗画线
     * @param systemIndex
     * @returns {*}
     */
    function showSystemPopLine(systemIndex) {
        if (!MAP.is_bad_mode) {
            if (systemIndex) {

                var system = GTW.systems[systemIndex],
                    sysName = system.name.toLowerCase(),
                    position = {
                        top: Math.round(.7 * $(window).height()),
                        left: Math.round(.2 * $(window).width())
                    },
                    sysOffset = $(".type-icons .symbol." + sysName).offset();

                sysOffset.top = sysOffset.top - 35;

                var a = 0,
                    i = Math.round(sysOffset.top - position.top),
                    u = $("#systempop_line")[0];
                if (!u) {
                    return void console.log("solo_system_line: no canvas");
                }
                var c = u.getContext("2d");
                sysOffset.left = sysOffset.left + parseInt($(".type-icons .symbol." + sysName).outerWidth()) / 2;
                a = sysOffset.left > position.left ? Math.round(sysOffset.left - position.left) : sysOffset.left < position.left ? Math.round(position.left - sysOffset.left) : 1;

                $("#systempop_line").attr("width", a).attr("height", i).css({
                    width: a,
                    height: i,
                    top: position.top
                });

                sysOffset.left > position.left ? $("#systempop_line").css({left: position.left}) : sysOffset.left < position.left ? $("#systempop_line").css({left: sysOffset.left}) : $("#systempop_line").css({left: position.left});
                c.beginPath();
                sysOffset.left > position.left ? (c.moveTo(.5, 0), c.lineTo(.5, Math.floor(i / 2) + .5), c.lineTo(a - .5, Math.floor(i / 2) + .5), c.lineTo(a - .5, i)) : sysOffset.left < position.left ? (c.moveTo(a - .5, 0), c.lineTo(a - .5, Math.floor(i / 2) + .5), c.lineTo(.5, Math.floor(i / 2) + .5), c.lineTo(.5, i)) : (c.moveTo(.5, 0), c.lineTo(.5, i));
                c.lineWidth = 1;
                c.strokeStyle = "#FFFFFF";
                c.stroke();
                $("#systempop_line").fadeIn()
            } else {
                $("#systempop_line").fadeOut()
            }
        }
    }

    /**
     * 给canvas绑定基本事件
     */
    function bindEvents() {
        var CanvasBindEvents = {
            mousedown: function (e) {
                staticable();
                OldMousePos = Be = getMouseEventOffset(e);
                TurnModel = e.button;
                e.preventDefault();
                return !1
            },
            mouseup: function (e) {
                var t = getMouseEventOffset(e),
                    r = vec2.dist(t, Be);
                onDropend(r);
                TurnModel = -1;
                return !1
            },
            mousemove: function (e) {
                var //取当前鼠标坐标
                    mousePos = getMouseEventOffset(e),
                //横向移动距离
                    xdiff = mousePos[0] - OldMousePos[0],
                //纵向移动距离
                    ydiff = mousePos[1] - OldMousePos[1];

                OldMousePos = mousePos;

                /**
                 * TurnModel用来标记当鼠标移动时地球的转动方式
                 * -1  不转动
                 * 0  正常转动,仅在鼠标拖拽时有效
                 * 1  跟随模式
                 * 2  缩放模式
                 *
                 * @type {number}
                 */

                //console.log(MouseIsDown);
                /**
                 * camea_mode定义了鼠标转动地球时的模式
                 * orbit:  根据数据移动距离精确转动,没有缓动效果
                 * geocam: 根据鼠标移动距离和速度,展现缓动效果
                 */
                if ("orbit" == params.camera_mode) {
                    switch (TurnModel) {
                        case 0:
                            params.orbit.rotate[0] += .0025 * ydiff;
                            params.orbit.rotate[1] += .0025 * xdiff;
                            break;
                        case 1:
                            params.orbit.translate[0] += .01 * xdiff;
                            params.orbit.translate[1] += .01 * ydiff;
                            break;
                        case 2:
                            var o = Math.abs(xdiff) > Math.abs(ydiff) ? xdiff : -ydiff;
                            params.orbit.translate[2] += .05 * o;
                            break;
                        default:
                            params.pick_required = !0
                    }
                } else if ("geocam" == params.camera_mode) {
                    var coord_delta = params.geocam.coord_delta;
                    switch (TurnModel) {
                        case 0:
                            coord_delta[0] -= .03 * xdiff;
                            coord_delta[1] += .03 * ydiff;
                            break;
                        case 2:
                            var o = Math.abs(xdiff) > Math.abs(ydiff) ? xdiff : -ydiff;
                            coord_delta[2] = -.01 * o;
                            break;
                        default:
                            params.pick_required = !0
                    }
                }
                return !1
            },
            mousewheel: function (e) {
                hidePopAndStaticAble();
                e.preventDefault();
                var t = .9,
                    r = e.wheelDelta / 120;

                "orbit" == params.camera_mode ? params.orbit.translate[2] *= 0 > r ? t : 1 / t : "geocam" == params.camera_mode && (params.geocam.coord_delta[2] -= .01 * r);
                return !1
            },
            DOMMouseScroll: function (e) {
                e.wheelDelta = -120 * e.detail;
                return CanvasBindEvents.mousewheel(e);
            }
        };
        _.each(CanvasBindEvents, function (callback, eventName) {
            canvas.addEventListener(eventName, callback, false)
        });
        /**
         * 无论鼠标在任何地方,只要松开,就标记下来
         * 不然会出现鼠标按下,拖拽,但是在窗口外面松开,出现bug
         */
        document.addEventListener("mouseup", function (e) {
            TurnModel = -1
        }, false)
    }

    /**
     * 绑定手持设备的触摸事件
     * @constructor
     */
    function BindCanvasTouchEvents() {
        function e(e, t) {
            var r = t.touches[0] || t.changedTouches[0], n = canvas.getBoundingClientRect(), o = r.clientX - n.left, a = r.clientY - n.top;
            e[0] = o, e[1] = a
        }

        function t(e) {
            if (2 !== e.touches.length)return 0;
            var t = canvas.getBoundingClientRect(), r = e.touches[0], n = e.touches[1];
            return vec2.set(a, r.clientX - t.left, r.clientY - t.top), vec2.set(i, n.clientX - t.left, n.clientY - t.top), vec2.dist(a, i)
        }

        var r = 0, n = "none", o = vec2.create(), a = vec2.create(), i = vec2.create();
        canvas.addEventListener("touchstart", function (i) {
            var u = i.touches.length;
            2 == u ? (r = t(i), n = "pinch") : 1 == u && (e(a, i), vec2.copy(o, a), params.pick_required = !0, vec2.copy(OldMousePos, o), n = "drag"), i.preventDefault(), i.stopPropagation()
        }, !1), canvas.addEventListener("touchend", function (t) {
            if ("drag" == n) {
                e(i, t);
                var r = vec2.dist(o, i);
                onDropend(r)
            }
            return n = "none", !1
        }, !1);
        canvas.addEventListener("touchmove", function (o) {
            if ("drag" == n) {
                e(i, o);
                var u = i[0] - a[0], c = i[1] - a[1];
                vec2.copy(a, i);
                var l = params.geocam.coord_delta;
                l[0] -= .03 * u, l[1] += .03 * c
            } else if ("pinch" == n) {
                var s = t(o), f = s / r, l = params.geocam.coord_delta;
                l[2] = 1 > f ? .02 / f : -.02 * f
            }
            return !1
        }, !1)
    }

    /**
     * 渲染
     */
    function render() {
        params.time = 1 * (timeNow() - NOW);

        params.dt = 1 / 60;

        g(GTWSimulator.poll_events(Ie()));

        if (params.time > Fe) {
            switchModel(ke);
        }
        switch (currentModel) {
            case"spin_1":
            case"spin_2":
            case"solo":
                if (params.projection.dir > 0) {
                    var t1 = params.dt,
                        r1 = 6 * t1,
                        n1 = Math.min(1, .2 * params.time),
                        o1 = lerp(10, 2, n1);
                    params.geocam.coord_delta[0] = o1 * r1
                }
        }
        projection();
        if (currentModel == "demo") {
            GTWdemo.update(params)
        }

        if (params.pick_required) {
            var r = GTWWorld.pick(params, OldMousePos[0], OldMousePos[1]);
            if (r !== params.pick_index) {
                canvas.style.cursor = 0 > r ? "default" : "pointer";
                params.pick_index = r;
                re = r >= 0 ? GTWWorld.countries[r] : null;
            }
            params.pick_required = !1
        }

        /**
         * 背景颜色
         * @type {number}
         */
        var n = "dark" === params.palette ? 0 : .9;

        gl.clearColor(n, n, n, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (params.projection.blend > .5) {
            GTWStars.draw(params);
            if (params.draw_world) {
                GTWCorona.draw(params)
            } else {
                GTWCorona.draw(params, -1)
            }
        }
        if (params.draw_world) {
            GTWWorld.draw(params);
            GTWLabels.draw(params);
            GTWMissileSystem.draw(params);
            GTWmarker.draw(params)
        }
        if ("demo" == currentModel) {
            params.demo_time = params.time - params.demo_time_start;
            GTWdemo.draw(params)
        }
        GTWhedgehog.draw(params);
        if ("idle" == currentModel) {
            GTWConnector.draw(params);
        }

        //画那个闪光
        GTWflash.draw(params);

        /**
         * 不停的渲染
         */
        requestAnimationFrame(render);
    }

    /**
     * 刷新尺寸
     */
    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = parseInt($(window).innerHeight());
        var e = canvas.width / canvas.height;
        1 > e ? params.camera.fov = 60 / e : params.camera.fov = 60;
        gl.viewport(0, 0, canvas.width, canvas.height);
        vec4.copy(params.camera.viewport, gl.getParameter(gl.VIEWPORT))
    }

    /**
     * 重置地球大小和转动速度
     */
    function resetEarth() {
        params.geocam.coord_target[2] = earthDefaultSize;
        params.geocam.lerp_speed = .2
    }

    var
    //地球默认尺寸
        earthDefaultSize = 1.6,
        U = 1,
        functions = options.functions,
        high_quality = "high" == options.quality,
        selectedCountry = null,
    //timeout后显示国家弹窗
        showingCountryPop = null,
        canvas = $("#webgl-canvas")[0];

    /**
     * 一直去检查是否该关闭国家弹窗了
     */
    setInterval(n, 500);

    $("#countrypop").on("click", ".popclose", function () {
        showCountryPop(null)
    });

    window.gl = webgl.setupCanvas(canvas, {
        antialias: high_quality ? !0 : !1,
        extensions: high_quality ? ["WEBKIT_EXT_texture_filter_anisotropic"] : [],
        shaderSources: [
            "assets/map/shaders/all-shaders.glsl"
        ]
    });

    var params = {
        camera: new GTW.Camera,
        flash: function (e) {
            GTWflash.flash(e)
        },
        high_quality: high_quality,
        orbit: {
            rotate: vec3.fromValues(deg2rad(15), 0, 0),
            translate: vec3.fromValues(0, 0, -20),
            pos: vec3.create(),
            dir: vec3.create()
        },
        geocam: {
            coord: vec3.fromValues(-90, 30.0444, 5),
            coord_target: vec3.fromValues(-90, 30.0444, 2),
            coord_delta: vec3.create(),
            lerp_speed: .2
        },
        camera_mode: "geocam",
        time: timeNow(),
        demo_time_start: 0,
        demo_time: 0,
        pickRay: null,
        light: {
            position: vec3.fromValues(20, 20, -20),
            position2: vec3.fromValues(20, -25, -20)
        },
        project: function (e, t) {
            this.projection.blend < .5 ? GTW.project_mercator(e, t) : GTW.project_ecef(e, t)
        },
        projection: {blend: 1, dir: 1},
        pick_required: !1,
        pick_index: -1,
        palette: "dark",
        solo_system_id: 1,
        draw_world: true
    };

    params.camera.near = .01;
    params.camera.far = 200;
    MAP._env = params;

    var K = vec3.create(),
        Q = vec3.create(),
        Z = vec3.create(),
        J = vec3.create(),
        ee = {
            mercator: [.15, 1],
            ecef: [.35, 4.5]
        },
        NOW = timeNow(),
        re = null,
        ue = 0,
        GTWSimulator = window.GTWSimulator = new GTW.Simulator,
        GTWMissileSystem = window.GTWMissileSystem = new GTW.MissileSystem(params),
        GTWStars = new GTW.Stars,
        GTWCorona = new GTW.Corona,
        GTWWorld = window.GTWWorld = new GTW.World,
        GTWLabels = window.GTWLabels = new GTW.Labels,
        GTWdemo = window.GTWdemo = GTW.init_demo(params, GTWMissileSystem),
        GTWmarker = window.GTWmarker = GTW.init_marker(params),
        GTWhedgehog = window.GTWhedgehog = GTW.init_hedgehog(),
        GTWConnector = GTW.init_connectors(),
        GTWflash = window.GTWflash = GTW.init_flash(),
        we = 0,
        Ee = 0,
        xe = 0,
        $ranking = $("#countrypop #ranking"),
        Re = vec3.create(),
        Pe = vec3.create(),
        Le = window.Le = false,
        currentModel = "idle",
        Fe = 0,
        ke = "idle",
        getTimeNow = function () {
            return Date.now() + 0;
        },
        Ie = function () {
            var oldTime = getTimeNow();

            return function () {
                var nowTime = getTimeNow();
                if (nowTime - oldTime > 1e3) {
                    Le = true
                }
                oldTime = nowTime;
                return nowTime
            }
        }(),
        OldMousePos = [0, 0],
        Be = [0, 0],
        TurnModel = -1;
    switchModel("idle");
    window.Ie = Ie;

    canvas.oncontextmenu = function () {
        return false
    };

    if ("ontouchstart" in document.documentElement) {
        BindCanvasTouchEvents()
    } else {
        bindEvents()
    }

    render();

    _.assign(MAP, {
        zoom_in: function () {
            params.geocam.coord_delta[2] -= .025
        },
        zoom_out: function () {
            params.geocam.coord_delta[2] += .025
        },
        set_view: function (view) {
            if (view == "flat") {
                params.projection.dir = -1;
                GTWLabels.project_labels("mercator");
                resetEarth();
                showCountryPop(null);
                this.set_demo(false);
            } else if (view == "globe") {
                params.projection.dir = 1;
                GTWLabels.project_labels("ecef");
                resetEarth();
                showCountryPop(null);
            }
        },
        set_language: function (lang) {
            if (MAP.lang !== lang) {
                MAP.lang = lang;
                GTWLabels.render_labels(lang);
                GTWLabels.project_labels(params.projection.blend < .5 ? "mercator" : "ecef");
                GTWhedgehog.setup(params, GTWWorld);
            }
        },
        set_palette: function (palette) {
            palette !== params.palette && (params.palette = palette)
        },
        toggle_palette: function () {
            this.set_palette("dark" === params.palette ? "light" : "dark")
        },
        toggle_map: function (sysName, enabled) {
            sysName = sysName.toUpperCase();
            var system = _.where(GTW.systems, {name: sysName})[0];
            return "undefined" == typeof enabled ? system.enabled = !system.enabled : system.enabled = enabled;
        },
        set_demo: function (e) {
            if (high_quality) {
                functions.hide_country_popup();
                if (e) {
                    switchModel("spin_1")
                } else {
                    switchModel("idle");
                    params.draw_world = true;
                    GTWMissileSystem.set_mode("world");
                    GTWhedgehog.hide();
                    showCountryPop(null)
                }
            }
        },
        get_demo: function () {
            return "idle" != currentModel
        }
    });
    var Ve = function (center, o) {
            if (params.projection.blend < .5)
                return true;
            var e = vec3.create(),
                t = vec3.create(),
                r = vec3.create();

            var a = Math.cos(deg2rad(o || 90));

            vec2.copy(r, center);

            params.project(e, r);

            vec3.normalize(t, e);
            // console.log(t, a);
            return vec3.dot(t, params.camera.viewDir) < -a
        },
        Xe = !1;
    GTWWorld.on("loaded", function () {
        function e() {
            var e = GTWWorld.geoip;
            showLocation(e.country, e.coord)
        }

        if (!MAP.is_bad_mode) {
            if (GTWWorld.geoip) {
                setTimeout(e, 1e3);
                var t = GTWWorld.geoip;
                GTWLabels.geoip_iso2 = t.country.iso2;
                GTWLabels.project_labels("ecef");
                functions.got_geoip_data(t.country.key)
            } else {
                Xe = !0;
                functions.got_geoip_data(-1)
            }
        }
    });

    $(window).resize(function () {
        var e = false;
        GTW.systems_foreach(function (t, r) {
            if (t.enabled && $("#systempop").is(":visible")) {
                showSystemPopLine(+r);
                e = true;
            }

        });
        e || showSystemPopLine(null)
        resize();
    });
    resize();
    if (MAP.is_bad_mode) {
        GTW.systems_foreach(function (system) {
            system.enabled = "BAD" == system.name;
            switchModel("spin_1")
        })
    }

};
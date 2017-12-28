/**
 * Created by vision on 16/3/24.
 */

(function (window, document) {

    var THEMES = {
        default: {
            //webgl的设置参数
            webgl: {
                //开启抗锯齿模式,默认手持设备关闭
                antialias: !Agent.isMobile(),
                alpha: true,
                depth: true,
                stencil: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false
            },
            //canvas背景
            background: {
                //canvas背景颜色
                color: "#000",
                //canvas背景透明度
                alpha: 0
            },
            //是否显示为3D模式
            globe: true,
            //地球背景网格
            grid: {
                //是否显示网格
                show: true,
                //颜色1
                color0: "#131713",
                //颜色2
                color1: "#5C695C"
            },
            //海岸线
            coast: {
                //是否显示
                show: true,
                //海岸线高度
                height: .014
            },
            //边界线
            boundary: {
                //显示边界线
                show: true,
                //边界线颜色
                color: "#333",
                //线宽
                width: 1,
                //高亮效果
                hover: {
                    //高亮时边界线颜色
                    color: "#aaa",
                    //线宽
                    width: 2
                }
            },
            //文字标记
            label: {
                //是否显示国家和城市名
                show: true
            },
            //背景星星
            stars: {
                //启用
                show: true,
                //背景星星的数量
                count: 2,
                //星星透明度
                alpha: .5,
                //星星颜色
                color: "#fff"
            },
            //日冕颜色
            corona: {
                show: true,
                //日冕颜色
                color: "#124029"
            },
            //国家样式
            country: {
                //透明度
                alpha: 1,
                //国家颜色范围1
                color0: [26, 31, 28],
                //国家颜色范围2
                color1: [51, 59, 54]
            },
            //聚光灯灯光位置
            light: {
                position: [20, 20, -20]
            },
            //点击模式,支持标记点mark和国家country
            clickMode: "mark",
            //默认地球朝向
            coordinate: [-103, 36, 5],
            //默认地球目标朝向
            targetCoordinate: [103, 36, 1.5],
            //默认地球旋转到目标朝向的速度
            lerpSpeed: .02,
            //默认缩放级别
            zoomLevel: .1,
            //自动刷新尺寸
            autoResize: true,
            //地理标记
            marks: [
                {
                    name: "BeiJing",
                    coord: [115.2529, 39.542, .01],
                    texture: "http://earth.com/earth1/map/textures/logo.png"
                }
            ]
        }
    };

    function Controller(element, options, theme) {

        var self = this;

        if (!(element instanceof HTMLElement)) {
            throw new Error("第一个参数必须是一个HTMLElement对象");
        }

        self.element = element;

        //用户设置的参数
        self.origin = options || {};

        //主题样式
        self.theme = theme || "default";

        //合并默认参数
        options = self.options = extend(true, {}, THEMES[self.theme], options);

        //创建canvas
        var canvas = self.canvas = document.createElement("canvas");

        /**
         * 获取WebGLRenderingContext
         */
        try {

            //兼容处于实验阶段的WebGL标准
            self.context = canvas.getContext("webgl", options.webgl)
                || canvas.getContext("experimental-webgl", options.webgl);

        } catch (n) {

            throw new Error("抱歉,您的浏览器可能不支持WebGL");
        }

        //将canvas添加到容器中
        element.appendChild(canvas);

        //初始化canvas照相机
        self.camera = new Camera({
            coordinate: options.coordinate,
            targetCoordinate: options.targetCoordinate,
            lerpSpeed: options.lerpSpeed,
            globe: !!options.globe
        });

        //标记当前是否可以处于hover状态
        self.canHover = false;

        //绑定的事件
        self._events = {};

        //绑定canvas事件
        bindCanvasEvents(canvas, self);

        //自动刷新尺寸
        if (options.autoResize) {
            window.addEventListener("resize", proxy(self.resize, self));
        }

        self.resize();

        self.world = new World(self);

        self.mark = new Mark(self, options.marks || []);

        //绑定点击事件
        self.bind("click", function () {
            if (self.options.clickMode == "country") {
                var hoveredCountry = self.world.hoveredCountry;
                if (hoveredCountry > -1) {
                    self.dispatch("country.click", self.world.countries[hoveredCountry]);
                    self.lookAtCountry(hoveredCountry);
                }
            } else if (self.options.clickMode == "mark") {
                var hoveredMark = self.mark.hoveredMark;
                if (hoveredMark > -1) {
                    self.dispatch("mark.click", self.mark.marks[hoveredMark]);
                    self.lookAtMark(hoveredMark);
                    self.mark.showMark(hoveredMark);
                }
            }

        }).bind("dragging", function (e) {

            var //取当前鼠标坐标
                mousePos = getMouseEventOffset(e),
            //横向移动距离
                xdiff = mousePos[0] - MOUSE_POS[0],
            //纵向移动距离
                ydiff = mousePos[1] - MOUSE_POS[1],
                coord_delta = self.camera.coordinateDelta;

            //缓动旋转
            coord_delta[0] -= .03 * xdiff;
            coord_delta[1] += .03 * ydiff;

            var mark = self.mark.shownMark;

            if (mark && !self.camera.inView(mark.coord)) {

                self.mark.hideMark();
            }

        }).bind("mousemove", function (e) {
            var mousePos = getMouseEventOffset(e),
                hover = -1;
            if (self.options.clickMode == "country") {
                //根据鼠标当前的平面坐标,计算出投影到3D地球上的哪个国家
                hover = self.world.pick(mousePos[0], mousePos[1]);

                if (hover !== self.world.hoveredCountry) {
                    //给鼠标放置的国家高亮效果
                    self.world.hoverCountry(hover);
                    if (hover > -1) {
                        self.dispatch("country.hover", self.world.countries[hover]);
                    }
                }

            } else if (self.options.clickMode == "mark") {

                hover = self.mark.pick(mousePos[0], mousePos[1], 2);
                if (hover !== self.mark.hoveredMark) {
                    self.mark.hoverMark(hover);
                    if (hover > -1) {
                        self.dispatch("mark.hover", self.mark.marks[hover]);
                    }
                }
            }

            //设置鼠标样式为手指
            self.canvas.style.cursor = hover > -1 ? "pointer" : "default";

        }).bind("mousedown", function () {

            //鼠标按下时,调整地球的缓冲速度,优化体验
            self.camera.lerpSpeed = .2;

        }).bind("mousewheel", function (e) {
            console.log(e);
            self.camera.coordinateDelta[2] -= e.wheelDelta / 10000;
        });

        //记录当前渲染的帧数
        self.frames = 0;
        //上一帧渲染完成花费的毫秒数
        self.frameTime = 0;
    }

    Controller.prototype = {
        /**
         * 渲染
         * @returns {Controller}
         */
        render: function () {
            var self = this,
                context = self.context,
                backgroundColor = color2vec3(self.options.background.color),
                startTime = new Date() - 0;

            self.dispatch("render.start", startTime);

            //更新摄像机视角
            self.camera.update();

            self.dispatch("render");

            //清空画布
            context.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], pick(self.options.background.alpha, 1));
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

            //画地球
            self.world.render();

            //画标记
            self.mark.render();

            var endTime = new Date() - 0;

            self.frameTime = endTime - startTime;
            self.frames++;
            self.dispatch("render.end", endTime);
            /**
             * 不停的渲染,实现动画效果
             * @type {Number}
             */
            self.animationFrame = requestAnimationFrame(proxy(self.render, self));

            return self;
        },
        /**
         * 暂停动画
         * @returns {Controller}
         */
        pause: function () {

            this.animationFrame && cancelAnimationFrame(this.animationFrame);

            this.dispatch("pause");
            return this;
        },
        /**
         * 刷新尺寸
         * @param width     宽度
         * @param height    高度
         * @returns {Controller}
         */
        resize: function (width, height) {
            var self = this,
                canvas = self.canvas,
                context = self.context;

            //设置canvas宽高,默认为外层容器宽高
            canvas.width = width > 0 ? width : self.element.clientWidth;
            canvas.height = height > 0 ? height : self.element.clientHeight;
            //宽高比
            var scale = canvas.width / canvas.height;

            1 > scale ? self.camera.fov = 60 / scale : self.camera.fov = 60;

            //设置视口
            context.viewport(0, 0, canvas.width, canvas.height);

            vec4.copy(self.camera.viewport, context.getParameter(context.VIEWPORT));

            self.dispatch("resize", canvas.width, canvas.height);
            return self;
        },
        /**
         * 设置地球朝向
         * @param long  经度
         * @param lat   维度
         * @param speed 旋转速度,默认0.2
         * @param zoomLevel 放大等级
         * @returns {Controller}
         */
        lookAt: function (long, lat, speed, zoomLevel) {
            //经度
            this.camera.targetCoordinate[0] = long;
            //维度
            this.camera.targetCoordinate[1] = lat;
            //旋转速度
            this.camera.lerpSpeed = speed || .2;
            //缩放等级
            zoomLevel && (this.camera.targetCoordinate[0] = zoomLevel);

            this.dispatch("lookAt", long, lat, speed, zoomLevel);
            return this;
        },
        /**
         * 使地球转向到某个国家的中心位置
         * @param codeOrID
         * @param speed
         * @param zoomLevel
         * @returns {Controller}
         */
        lookAtCountry: function (codeOrID, speed, zoomLevel) {
            //获取country
            var country = this.getCountry(codeOrID);
            if (country) {
                this.lookAt(country.center[0], country.center[1], speed, zoomLevel);
            }
            return this;
        },
        /**
         *  使地球转向到某个标记的位置
         */
        lookAtMark: function (index, speed, zoomLevel) {
            var mark = this.mark.marks[index];
            if (mark && mark.coord) {
                this.lookAt(mark.coord[0], mark.coord[1], speed, zoomLevel);
            }
            return self;
        },
        /**
         * 地球放大
         * @param level
         * @returns {Controller}
         */
        zoomIn: function (level) {
            level = level || this.options.zoomLevel;
            this.camera.coordinateDelta[2] -= level;
            this.dispatch("zoomIn", level);
            return this;
        },
        /**
         * 地球缩小
         * @param level
         * @returns {Controller}
         */
        zoomOut: function (level) {
            level = level || this.options.zoomLevel;
            this.camera.coordinateDelta[2] += level;
            this.dispatch("zoomOut", level);
            return this;
        },
        /**
         * 显示模式,globe或true为3D模式,其他值为平面模式
         * @param globe
         * @returns {Controller}
         */
        display: function (globe) {
            globe = (globe === "globe" || globe === true);
            this.camera.globe = globe;
            this.dispatch("display", globe);
            return this;
        },
        /**
         * 切换显示类型
         * @returns {*|Controller}
         */
        toggleDisplay: function () {
            return this.display(!this.camera.globe);
        },
        /**
         * 设置主题样式
         * @param name
         * @returns {*|Controller}
         */
        setTheme: function (name) {
            var options = THEMES[name] || {};
            this.options = {};
            this.theme = name;
            extend(true, this.options, options, this.origin);
            this.dispatch("setTheme", name);
            return this;
        },
        /**
         * 切换主题
         * @returns {*|Controller}
         */
        toggleTheme: function () {
            var themes = keys(THEMES);
            var next = themes.indexOf(this.theme) + 1;
            if (next >= themes.length) {
                next = 0;
            }
            return this.setTheme(themes[next]);
        },
        /**
         * 根据索引或国家代码获取国家
         * @param indexOrCode
         * @returns {*}
         */
        getCountry: function (indexOrCode) {

            return this.world.countries[indexOrCode] || this.world.countriesByCode[indexOrCode];
        },
        /**
         * 获取参数
         * @returns {*|{}|*}
         */
        getOptions: function () {
            return this.options;
        },
        /**
         * 设置参数
         * @param options
         * @returns {Controller}
         */
        setOptions: function (options) {
            extend(true, this.options, options);
            this.dispatch("setOptions", options);
            extend(true, this.origin, options);
            return this;
        },
        /**
         * 绑定一个事件
         * @param event 事件名
         * @param handler 回调函数
         * @param once 是否只触发1次
         * @returns {Controller}
         */
        bind: function (event, handler, once) {
            var _h = this._events = this._events || {};
            if (isFunction(event)) {
                once = handler;
                handler = event;
                event = "*";
            }
            if (!isFunction(handler) || !event) {
                return this;
            }
            _h[event] = _h[event] || [];

            _h[event].push({
                h: handler,
                once: !!once
            });

            return this;
        },
        /**
         * 解绑事件
         * @param eventName 事件名,为空时全部解绑
         * @param handler 要解绑哪个具体的事件,为空时解绑所有eventName事件
         * @returns {Controller}
         */
        unbind: function (eventName, handler) {
            var self = this,
                _h = self._events || {};

            if (!eventName) {
                self._events = {};
                return self;
            }

            if (handler) {
                if (_h[eventName]) {
                    var newList = [];
                    for (var i = 0, l = _h[eventName].length; i < l; i++) {
                        if (_h[eventName][i]["h"] != handler) {
                            newList.push(_h[eventName][i]);
                        }
                    }
                    _h[eventName] = newList;
                }

                if (_h[eventName] && _h[eventName].length === 0) {
                    delete _h[eventName];
                }
            }
            else {
                delete _h[eventName];
            }

            return self;
        },
        /**
         * 触发事件
         * @returns {Controller}
         */
        dispatch: function () {
            ARRAY_PROTOTYPE.push.call(arguments, this);
            return this.dispatchWithContext.apply(this, arguments);
        },
        /**
         * 自定义context并触发事件,最后一个参数为context
         * @param type
         * @returns {Controller}
         */
        dispatchWithContext: function (type) {
            var self = this,
                args = arguments,
                argLength = args.length - 1,
                paramArgs = ARRAY_PROTOTYPE.slice.call(args, 1, argLength),
                events = self._events || {},
                context = args[argLength];

            each(events[type] || {}, function (event, index) {

                event.h.apply(context, paramArgs);

                if (event.once) {

                    delete self._events[type][index];
                }
            });
            ARRAY_PROTOTYPE.unshift.call(paramArgs, type);
            each(events["*"] || [], function (event, index) {

                event.h.apply(context, paramArgs);

                if (event.once) {
                    delete self._events["*"][index];
                }
            });

            return self;
        }
    };

    Controller.themes = THEMES;
    /**
     * 注册主题
     * @param name
     * @param option
     * @param inherit
     */
    Controller.registerTheme = function (name, option, inherit) {
        var base = THEMES[inherit || "default"];
        THEMES[name] = {};
        extend(true, THEMES[name], base, option);
    };

    window.Earth = Controller;
})(window, document);
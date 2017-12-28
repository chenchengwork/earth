(function () {

    var heatmapVertexShader = document.getElementById("heatmap").innerText.split("\n\n\n");

    registerShaders("heatmap", heatmapVertexShader[0], heatmapVertexShader[1], heatmapVertexShader[2]);

    var heightsVertexShader = document.getElementById("heights").innerText.split("\n\n\n");
    registerShaders("heatmap_heights", heightsVertexShader[0], heightsVertexShader[1], heightsVertexShader[2]);

    var textureFloatShims = function () {
        var checkColorBuffer;
        var checkFloatLinear;
        var checkSupport;
        var checkTexture;
        var createSourceCanvas;
        var getExtension;
        var getSupportedExtensions;
        var name;
        var shimExtensions;
        var shimLookup;
        var unshimExtensions;
        var unshimLookup;
        var _i;
        var _len;
        createSourceCanvas = function () {
            var canvas;
            var ctx;
            var imageData;
            canvas = document.createElement('canvas');
            canvas.width = 2;
            canvas.height = 2;
            ctx = canvas.getContext('2d');
            imageData = ctx.getImageData(0, 0, 2, 2);
            imageData.data.set(new Uint8ClampedArray([
                0,
                0,
                0,
                0,
                255,
                255,
                255,
                255,
                0,
                0,
                0,
                0,
                255,
                255,
                255,
                255
            ]));
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        };
        createSourceCanvas();
        checkFloatLinear = function (gl, sourceType) {
            var buffer;
            var cleanup;
            var fragmentShader;
            var framebuffer;
            var positionLoc;
            var program;
            var readBuffer;
            var result;
            var source;
            var sourceCanvas;
            var sourceLoc;
            var target;
            var vertexShader;
            var vertices;
            program = gl.createProgram();
            vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.attachShader(program, vertexShader);
            gl.shaderSource(vertexShader, 'attribute vec2 position;\nvoid main(){\n    gl_Position = vec4(position, 0.0, 1.0);\n}');
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                throw gl.getShaderInfoLog(vertexShader);
            }

            fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.attachShader(program, fragmentShader);
            gl.shaderSource(fragmentShader, 'uniform sampler2D source;\nvoid main(){\n    gl_FragColor = texture2D(source, vec2(1.0, 1.0));\n}');
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                throw gl.getShaderInfoLog(fragmentShader);
            }

            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw gl.getProgramInfoLog(program);
            }

            gl.useProgram(program);
            cleanup = function () {
                gl.deleteShader(fragmentShader);
                gl.deleteShader(vertexShader);
                gl.deleteProgram(program);
                gl.deleteBuffer(buffer);
                gl.deleteTexture(source);
                gl.deleteTexture(target);
                gl.deleteFramebuffer(framebuffer);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.useProgram(null);
                gl.bindTexture(gl.TEXTURE_2D, null);
                return gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            };
            target = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, target);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
            sourceCanvas = createSourceCanvas();
            source = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, source);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, sourceType, sourceCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            vertices = new Float32Array([
                1,
                1,
                -1,
                1,
                -1,
                -1,
                1,
                1,
                -1,
                -1,
                1,
                -1
            ]);
            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            positionLoc = gl.getAttribLocation(program, 'position');
            sourceLoc = gl.getUniformLocation(program, 'source');
            gl.enableVertexAttribArray(positionLoc);
            gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1i(sourceLoc, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            readBuffer = new Uint8Array(4 * 4);
            gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, readBuffer);
            result = Math.abs(readBuffer[0] - 127) < 10;
            cleanup();
            return result;
        };
        checkTexture = function (gl, targetType) {
            var target;
            target = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, target);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, targetType, null);
            if (gl.getError() === 0) {
                gl.deleteTexture(target);
                return true;
            }

            gl.deleteTexture(target);
            return false;

        };
        checkColorBuffer = function (gl, targetType) {
            var check;
            var framebuffer;
            var target;
            target = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, target);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, targetType, null);
            framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
            check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            gl.deleteTexture(target);
            gl.deleteFramebuffer(framebuffer);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            if (check === gl.FRAMEBUFFER_COMPLETE) {
                return true;
            }

            return false;

        };
        shimExtensions = [];
        shimLookup = {};
        unshimExtensions = [];
        checkSupport = function () {
            var canvas;
            var extobj;
            var gl;
            var halfFloatExt;
            var halfFloatTexturing;
            var singleFloatExt;
            var singleFloatTexturing;
            canvas = document.createElement('canvas');
            gl = null;
            try {
                gl = canvas.getContext('experimental-webgl');
                if (gl === null) {
                    gl = canvas.getContext('webgl');
                }

            }
            catch (_error) {
            }
            if (gl != null) {
                singleFloatExt = gl.getExtension('OES_texture_float');
                if (singleFloatExt === null) {
                    if (checkTexture(gl, gl.FLOAT)) {
                        singleFloatTexturing = true;
                        shimExtensions.push('OES_texture_float');
                        shimLookup.OES_texture_float = {
                            shim: true
                        };
                    }
                    else {
                        singleFloatTexturing = false;
                        unshimExtensions.push('OES_texture_float');
                    }
                }
                else {
                    if (checkTexture(gl, gl.FLOAT)) {
                        singleFloatTexturing = true;
                        shimExtensions.push('OES_texture_float');
                    }
                    else {
                        singleFloatTexturing = false;
                        unshimExtensions.push('OES_texture_float');
                    }
                }
                if (singleFloatTexturing) {
                    extobj = gl.getExtension('WEBGL_color_buffer_float');
                    if (extobj === null) {
                        if (checkColorBuffer(gl, gl.FLOAT)) {
                            shimExtensions.push('WEBGL_color_buffer_float');
                            shimLookup.WEBGL_color_buffer_float = {
                                shim: true,
                                RGBA32F_EXT: 0x8814,
                                RGB32F_EXT: 0x8815,
                                FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
                                UNSIGNED_NORMALIZED_EXT: 0x8C17
                            };
                        }
                        else {
                            unshimExtensions.push('WEBGL_color_buffer_float');
                        }
                    }
                    else {
                        if (checkColorBuffer(gl, gl.FLOAT)) {
                            shimExtensions.push('WEBGL_color_buffer_float');
                        }
                        else {
                            unshimExtensions.push('WEBGL_color_buffer_float');
                        }
                    }
                    extobj = gl.getExtension('OES_texture_float_linear');
                    if (extobj === null) {
                        if (checkFloatLinear(gl, gl.FLOAT)) {
                            shimExtensions.push('OES_texture_float_linear');
                            shimLookup.OES_texture_float_linear = {
                                shim: true
                            };
                        }
                        else {
                            unshimExtensions.push('OES_texture_float_linear');
                        }
                    }
                    else {
                        if (checkFloatLinear(gl, gl.FLOAT)) {
                            shimExtensions.push('OES_texture_float_linear');
                        }
                        else {
                            unshimExtensions.push('OES_texture_float_linear');
                        }
                    }
                }

                halfFloatExt = gl.getExtension('OES_texture_half_float');
                if (halfFloatExt === null) {
                    if (checkTexture(gl, 0x8D61)) {
                        halfFloatTexturing = true;
                        shimExtensions.push('OES_texture_half_float');
                        halfFloatExt = shimLookup.OES_texture_half_float = {
                            HALF_FLOAT_OES: 0x8D61,
                            shim: true
                        };
                    }
                    else {
                        halfFloatTexturing = false;
                        unshimExtensions.push('OES_texture_half_float');
                    }
                }
                else {
                    if (checkTexture(gl, halfFloatExt.HALF_FLOAT_OES)) {
                        halfFloatTexturing = true;
                        shimExtensions.push('OES_texture_half_float');
                    }
                    else {
                        halfFloatTexturing = false;
                        unshimExtensions.push('OES_texture_half_float');
                    }
                }
                if (halfFloatTexturing) {
                    extobj = gl.getExtension('EXT_color_buffer_half_float');
                    if (extobj === null) {
                        if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
                            shimExtensions.push('EXT_color_buffer_half_float');
                            shimLookup.EXT_color_buffer_half_float = {
                                shim: true,
                                RGBA16F_EXT: 0x881A,
                                RGB16F_EXT: 0x881B,
                                FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
                                UNSIGNED_NORMALIZED_EXT: 0x8C17
                            };
                        }
                        else {
                            unshimExtensions.push('EXT_color_buffer_half_float');
                        }
                    }
                    else {
                        if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
                            shimExtensions.push('EXT_color_buffer_half_float');
                        }
                        else {
                            unshimExtensions.push('EXT_color_buffer_half_float');
                        }
                    }
                    extobj = gl.getExtension('OES_texture_half_float_linear');
                    if (extobj === null) {
                        if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
                            shimExtensions.push('OES_texture_half_float_linear');
                            return shimLookup.OES_texture_half_float_linear = {
                                shim: true
                            };
                        }

                        return unshimExtensions.push('OES_texture_half_float_linear');
                    }

                    if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
                        return shimExtensions.push('OES_texture_half_float_linear');
                    }

                    return unshimExtensions.push('OES_texture_half_float_linear');
                }
            }

        };
        if (window.WebGLRenderingContext != null) {
            checkSupport();
            unshimLookup = {};
            for (_i = 0, _len = unshimExtensions.length; _i < _len; _i++) {
                name = unshimExtensions[_i];
                unshimLookup[name] = true;
            }
            getExtension = WebGLRenderingContext.prototype.getExtension;
            WebGLRenderingContext.prototype.getExtension = function (name) {
                var extobj;
                extobj = shimLookup[name];
                if (extobj === void 0) {
                    if (unshimLookup[name]) {
                        return null;
                    }

                    return getExtension.call(this, name);
                }

                return extobj;

            };
            getSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions;
            WebGLRenderingContext.prototype.getSupportedExtensions = function () {
                var extension;
                var result;
                var supported;
                var _j;
                var _k;
                var _len1;
                var _len2;
                supported = getSupportedExtensions.call(this);
                result = [];
                for (_j = 0, _len1 = supported.length; _j < _len1; _j++) {
                    extension = supported[_j];
                    if (unshimLookup[extension] === void 0) {
                        result.push(extension);
                    }

                }
                for (_k = 0, _len2 = shimExtensions.length; _k < _len2; _k++) {
                    extension = shimExtensions[_k];
                    if (__indexOf.call(result, extension) < 0) {
                        result.push(extension);
                    }

                }
                return result;
            };
            return WebGLRenderingContext.prototype.getFloatExtension = function (spec) {
                var candidate;
                var candidates;
                var half;
                var halfFramebuffer;
                var halfLinear;
                var halfTexture;
                var i;
                var importance;
                var preference;
                var result;
                var single;
                var singleFramebuffer;
                var singleLinear;
                var singleTexture;
                var use;
                var _j;
                var _k;
                var _l;
                var _len1;
                var _len2;
                var _len3;
                var _len4;
                var _m;
                var _ref;
                var _ref1;
                var _ref2;
                if (spec.prefer == null) {
                    spec.prefer = [
                        'half'
                    ];
                }

                if (spec.require == null) {
                    spec.require = [];
                }

                if (spec.throws == null) {
                    spec.throws = true;
                }

                singleTexture = this.getExtension('OES_texture_float');
                halfTexture = this.getExtension('OES_texture_half_float');
                singleFramebuffer = this.getExtension('WEBGL_color_buffer_float');
                halfFramebuffer = this.getExtension('EXT_color_buffer_half_float');
                singleLinear = this.getExtension('OES_texture_float_linear');
                halfLinear = this.getExtension('OES_texture_half_float_linear');
                single = {
                    texture: singleTexture !== null,
                    filterable: singleLinear !== null,
                    renderable: singleFramebuffer !== null,
                    score: 0,
                    precision: 'single',
                    half: false,
                    single: true,
                    type: this.FLOAT
                };
                half = {
                    texture: halfTexture !== null,
                    filterable: halfLinear !== null,
                    renderable: halfFramebuffer !== null,
                    score: 0,
                    precision: 'half',
                    half: true,
                    single: false,
                    type: (_ref = halfTexture != null ? halfTexture.HALF_FLOAT_OES : void 0) != null ? _ref : null
                };
                candidates = [];
                if (single.texture) {
                    candidates.push(single);
                }

                if (half.texture) {
                    candidates.push(half);
                }

                result = [];
                for (_j = 0, _len1 = candidates.length; _j < _len1; _j++) {
                    candidate = candidates[_j];
                    use = true;
                    _ref1 = spec.require;
                    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                        name = _ref1[_k];
                        if (candidate[name] === false) {
                            use = false;
                        }

                    }
                    if (use) {
                        result.push(candidate);
                    }

                }
                for (_l = 0, _len3 = result.length; _l < _len3; _l++) {
                    candidate = result[_l];
                    _ref2 = spec.prefer;
                    for (i = _m = 0, _len4 = _ref2.length; _m < _len4; i = ++_m) {
                        preference = _ref2[i];
                        importance = Math.pow(2, spec.prefer.length - i - 1);
                        if (candidate[preference]) {
                            candidate.score += importance;
                        }

                    }
                }
                result.sort(function (a, b) {
                    if (a.score === b.score) {
                        return 0;
                    }

                    if (a.score < b.score) {
                        return 1;
                    }
                    else if (a.score > b.score) {
                        return -1;
                    }

                });
                if (result.length === 0) {
                    if (spec.throws) {
                        throw 'No floating point texture support that is ' + spec.require.join(', ');
                    }
                    else {
                        return null;
                    }
                }
                else {
                    result = result[0];
                    return {
                        filterable: result.filterable,
                        renderable: result.renderable,
                        type: result.type,
                        precision: result.precision
                    };
                }
            };
        }

    };

    textureFloatShims();


    var Framebuffer = (function () {
        function Framebuffer(gl) {
            this.gl = gl;
            this.buffer = this.gl.createFramebuffer();
        }

        Framebuffer.prototype.destroy = function () {
            return this.gl.deleteFRamebuffer(this.buffer);
        };

        Framebuffer.prototype.bind = function () {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
            return this;
        };

        Framebuffer.prototype.unbind = function () {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            return this;
        };

        Framebuffer.prototype.check = function () {
            var result;
            result = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
            switch (result) {
                case this.gl.FRAMEBUFFER_UNSUPPORTED:
                    throw 'Framebuffer is unsupported';
                    break;
                case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    throw 'Framebuffer incomplete attachment';
                    break;
                case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    throw 'Framebuffer incomplete dimensions';
                    break;
                case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    throw 'Framebuffer incomplete missing attachment';
            }
            return this;
        };

        Framebuffer.prototype.color = function (texture) {
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, texture.target, texture.handle, 0);
            this.check();
            return this;
        };

        Framebuffer.prototype.depth = function (buffer) {
            this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, buffer.id);
            this.check();
            return this;
        };

        Framebuffer.prototype.destroy = function () {
            return this.gl.deleteFramebuffer(this.buffer);
        };

        return Framebuffer;

    })();

    var Texture = (function () {
        function Texture(gl, params) {
            var _ref;
            var _ref1;
            this.gl = gl;
            if (params == null) {
                params = {};
            }

            this.channels = this.gl[((_ref = params.channels) != null ? _ref : 'rgba').toUpperCase()];
            if (typeof params.type === 'number') {
                this.type = params.type;
            }
            else {
                this.type = this.gl[((_ref1 = params.type) != null ? _ref1 : 'unsigned_byte').toUpperCase()];
            }
            switch (this.channels) {
                case this.gl.RGBA:
                    this.chancount = 4;
                    break;
                case this.gl.RGB:
                    this.chancount = 3;
                    break;
                case this.gl.LUMINANCE_ALPHA:
                    this.chancount = 2;
                    break;
                default:
                    this.chancount = 1;
            }
            this.target = this.gl.TEXTURE_2D;
            this.handle = this.gl.createTexture();
        }

        Texture.prototype.destroy = function () {
            return this.gl.deleteTexture(this.handle);
        };

        Texture.prototype.bind = function (unit) {
            if (unit == null) {
                unit = 0;
            }

            if (unit > 15) {
                throw 'Texture unit too large: ' + unit;
            }

            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.gl.bindTexture(this.target, this.handle);
            return this;
        };

        Texture.prototype.setSize = function (width, height) {
            this.width = width;
            this.height = height;
            this.gl.texImage2D(this.target, 0, this.channels, this.width, this.height, 0, this.channels, this.type, null);
            return this;
        };

        Texture.prototype.upload = function (data) {
            this.width = data.width;
            this.height = data.height;
            this.gl.texImage2D(this.target, 0, this.channels, this.channels, this.type, data);
            return this;
        };

        Texture.prototype.linear = function () {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            return this;
        };

        Texture.prototype.nearest = function () {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            return this;
        };

        Texture.prototype.clampToEdge = function () {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            return this;
        };

        Texture.prototype.repeat = function () {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
            return this;
        };

        return Texture;

    })();

    var Node = (function () {
        function Node(gl, width, height) {
            var floatExt;
            this.gl = gl;
            this.width = width;
            this.height = height;
            floatExt = this.gl.getFloatExtension({
                require: [
                    'renderable'
                ]
            });

            // this.texture = createTexture2D(this.gl,{
            //     width:this.width,
            //     height:this.height
            // });
            // this.gl.activeTexture(this.gl.TEXTURE00);
            // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

            this.texture = new Texture(this.gl, {
                type: floatExt.type
            }).bind(0).setSize(this.width, this.height).nearest().clampToEdge();

            this.fbo = new Framebuffer(this.gl).bind().color(this.texture).unbind();
        }

        Node.prototype.use = function () {
            return this.fbo.bind();
        };

        Node.prototype.bind = function (unit) {
            return this.texture.bind(unit);
        };

        Node.prototype.end = function () {
            return this.fbo.unbind();
        };

        Node.prototype.resize = function (width, height) {
            this.width = width;
            this.height = height;
            return this.texture.bind(0).setSize(this.width, this.height);
        };

        return Node;

    })();


    var WebGLHeatmap = (function () {
        function WebGLHeatmap(_arg) {

            this.camera = _arg.camera;
            this.gl = _arg.context;
            this.canvas = this.gl.canvas;

            this.width = this.canvas.offsetWidth;
            this.height = this.canvas.offsetHeight;

            this.program = getProgram(this.gl, "heatmap");

            this.quad = makeVertexBuffer(this.gl, new Float32Array([
                -1, -1, 0,
                1, 1, -1,
                0, 1, -1,
                1, 0, 1,
                -1, 1, 0,
                1, 1, -1,
                0, 1, 1,
                1, 0, 1]), this.gl.STATIC_DRAW);


            // Heights

            this.heightsProgram = getProgram(this.gl, 'heatmap_heights');

            this.nodeBack = new Node(this.gl, this.width, this.height);
            this.nodeFront = new Node(this.gl, this.width, this.height);
            this.vertexBuffer = this.gl.createBuffer();
            this.vertexSize = 8;
            this.maxPointCount = 1024 * 10;
            this.vertexBufferData = new Float32Array(this.maxPointCount * this.vertexSize * 6);
            this.vertexBufferViews = [];


            for (var i = 0; i < this.maxPointCount; i++) {
                this.vertexBufferViews.push(new Float32Array(this.vertexBufferData.buffer, 0, i * this.vertexSize * 6));
            }

            this.bufferIndex = 0;
            this.pointCount = 0;


        }

        WebGLHeatmap.prototype.resize = function () {
            var canvasHeight;
            var canvasWidth;
            canvasWidth = this.canvas.offsetWidth || 2;
            canvasHeight = this.canvas.offsetHeight || 2;
            if (this.width !== canvasWidth || this.height !== canvasHeight) {
                this.canvas.width = canvasWidth;
                this.canvas.height = canvasHeight;
                this.width = canvasWidth;
                this.height = canvasHeight;

                this.nodeBack.resize(this.width, this.height);
                return this.nodeFront.resize(this.width, this.height);
            }

        };
        WebGLHeatmap.prototype.update = function () {
            if (this.pointCount > 0) {

                this.gl.enable(this.gl.BLEND);
                this.nodeFront.use();

                bindVertexBuffer(this.gl, this.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexBufferViews[this.pointCount], this.gl.STREAM_DRAW);

                this.gl.enableVertexAttribArray(1);

                var program = this.heightsProgram.use();
                program.vertexAttribPointer('position', 4, this.gl.FLOAT, false, 8 * 4, 0);
                program.vertexAttribPointer('intensity', 4, this.gl.FLOAT, false, 8 * 4, 4 * 4);
                program.uniform2f('viewport', this.width, this.height);
                program.uniformMatrix4fv('mvp', this.camera.mvp);

                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.pointCount * 6);
                this.gl.disableVertexAttribArray(1);

                this.pointCount = 0;
                this.bufferIndex = 0;
                this.nodeFront.end();
                return this.gl.disable(this.gl.BLEND);
            }
        }
        WebGLHeatmap.prototype.render = function () {


            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
            this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
            this.nodeFront.bind(0);
            if (this.gradientTexture) {
                this.gradientTexture.bind(1);
            }
            var program = this.program.use();
            program.uniform1i('source', 0);
            program.uniform1i('gradientTexture', 1);
            program.uniformMatrix4fv('mvp', this.camera.mvp);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
            return this;
        };

        WebGLHeatmap.prototype.clear = function () {
            this.nodeFront.use();
            this.gl.clearColor(0, 0, 0, 1);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            return this.nodeFront.end();
        };
        WebGLHeatmap.prototype.addVertex = function (x, y, xs, ys, intensity) {
            this.vertexBufferData[this.bufferIndex++] = x;
            this.vertexBufferData[this.bufferIndex++] = y;
            this.vertexBufferData[this.bufferIndex++] = xs;
            this.vertexBufferData[this.bufferIndex++] = ys;
            this.vertexBufferData[this.bufferIndex++] = intensity;
            this.vertexBufferData[this.bufferIndex++] = intensity;
            this.vertexBufferData[this.bufferIndex++] = intensity;
            return this.vertexBufferData[this.bufferIndex++] = intensity;
        };
        WebGLHeatmap.prototype.addPoint = function (x, y, size, intensity) {
            var s;
            if (size == null) {
                size = 50;
            }

            if (intensity == null) {
                intensity = 0.2;
            }

            y = this.height - y;
            s = size / 2;
            this.addVertex(x, y, -s, -s, intensity);
            this.addVertex(x, y, +s, -s, intensity);
            this.addVertex(x, y, -s, +s, intensity);
            this.addVertex(x, y, -s, +s, intensity);
            this.addVertex(x, y, +s, -s, intensity);
            this.addVertex(x, y, +s, +s, intensity);
            this.pointCount += 1;
            this.update();
            return this.pointCount;
        };

        WebGLHeatmap.prototype.addPoints = function (items) {
            var item;
            var _i;
            var _len;
            var _results;
            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
                item = items[_i];
                _results.push(this.addPoint(item.x, item.y, item.size, item.intensity));
            }
            return _results;
        };

        return WebGLHeatmap;

    })();

    window.createWebGLHeatmap = function (params) {
        return new WebGLHeatmap(params);
    };

}).call(this);
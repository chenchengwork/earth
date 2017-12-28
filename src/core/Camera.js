import {
    vec3,
    vec4,
    mat3,
    mat4,
    deg2rad,
    project_ecef,
    project_mercator,
    clamp,
    lerp,
    smoothstep,
} from './helper';

/**
 * WebGL摄像机
 * @constructor
 */
export default class Camera {
    constructor(options) {
        var self = this;

        options = options || {};

        //视角
        self.fov = 60;
        self.near = .01;
        self.far = 200;
        /**
         * canvas视口
         * 左边距
         * 右边距
         * 宽度
         * 高度
         */
        self.viewport = vec4.create();
        self.proj = mat4.create();
        self.view = mat4.create();
        self.bill = mat3.create();
        self.mvp = mat4.create();
        self.mvpInv = mat4.create();
        self.viewInv = mat4.create();
        self.viewPos = vec3.create();
        self.viewDir = vec3.create();

        //地球当前朝向(GEO坐标)
        self.coordinate = [];

        /**
         * 地球目标朝向(GEO坐标)
         * 0   经度
         * 1   维度
         * 2   地球放大等级
         */
        self.targetCoordinate = [];

        vec3.copy(self.coordinate, options.coordinate);

        vec3.copy(self.targetCoordinate, options.targetCoordinate);

        //地球旋转到目标朝向的速度
        self.lerpSpeed = options.lerpSpeed || .02;
        /**
         * 地球旋转角度
         * 0 水平角度
         * 1 纵向角度
         * 2 地球放大等级
         */
        self.coordinateDelta = vec3.create();

        /**
         * 地球显示类型,通过修改此值可以使地球切换显示类型
         * 1    3D模式
         * -1   平面模式
         * @type {bool}
         */
        self.globe = !!options.globe;

        /**
         * 地球转换显示类型的过程
         * @type {number}
         */
        self.projectionBlend = self.globe ? 1 : 0;

        //地球默认大小
        self.earthDefaultSize = 1.6;

        // return self;
    }

    /**
     * 更新投影
     * @private
     * @returns {Camera}
     */
    _update_projection() {
        var self = this;
        var e = self.viewport[2] / self.viewport[3];
        mat4.perspective(self.proj, deg2rad(self.fov), e, self.near, self.far);
        return self;
    }

    _update_mvp() {
        var self = this;
        var e = self.bill,
            t = self.view;
        e[0] = t[0];
        e[1] = t[4];
        e[2] = t[8];
        e[3] = t[1];
        e[4] = t[5];
        e[5] = t[9];
        e[6] = t[2];
        e[7] = t[6];
        e[8] = t[10];
        mat4.multiply(self.mvp, self.proj, self.view);
        mat4.invert(self.mvpInv, self.mvp);
        mat4.invert(self.viewInv, self.view);
        vec3.transformMat4(self.viewPos, [0, 0, 0], self.viewInv);
        vec3.set(self.viewDir, -self.viewInv[8], -self.viewInv[9], -self.viewInv[10])

    }

    update() {
        var self = this,
            globe = self.globe,
            coord = self.coordinate,
            coord_target = self.targetCoordinate,
            coord_delta = self.coordinateDelta,
            K = vec3.create(),
            Q = vec3.create(),
            Z = vec3.create(),
            J = vec3.create(),
            R = vec3.create();

        vec3.add(coord_target, coord_target, coord_delta);
        coord_target[1] = clamp(coord_target[1], -80, 80);

        var projectionType;

        projectionType = globe ? [.35, 4.5] : [0.15, 1];
        coord_target[2] = clamp(coord_target[2], projectionType[0], projectionType[1]);

        if (globe) {
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
        vec3.lerp(coord, coord, coord_target, self.lerpSpeed);
        vec3.scale(coord_delta, coord_delta, .9);

        project_mercator(K, [coord[0], coord[1], 0]);
        project_mercator(Q, coord);
        Q[1] -= 2;
        vec3.sub(Z, K, Q);
        vec3.normalize(Z, Z);
        vec3.copy(K, Q);
        var u = [0, 0, 0];
        project_ecef(u, [coord[0], coord[1], 0]);
        project_ecef(Q, coord);
        var c = clamp(2 * (self.earthDefaultSize - coord[2]), 0, 1);

        c = lerp(0, 2, c);
        Q[1] -= c;
        vec3.sub(J, u, Q);
        vec3.normalize(J, J);
        var l = smoothstep(self.projectionBlend);
        vec3.lerp(K, K, Q, l);
        vec3.lerp(Z, Z, J, l);

        self._update_projection();
        vec3.add(R, K, Z);
        mat4.lookAt(self.view, K, R, vec3.fromValues(0, 1, 0));
        self._update_mvp();

        self.projectionBlend = clamp(self.projectionBlend + (globe ? 1 : -1) / 120, 0, 1)
    }

    update_quat(e, t, r) {
        var self = this,
            view = mat4.create();
        self._update_projection();
        mat4.fromRotationTranslation(view, t, e);
        mat4.invert(view, view);
        if (r) {
            for (var i = 0; 16 > i; ++i) {
                self.view[i] = r * self.view[i] + (1 - r) * view[i];
            }
        } else {
            mat4.copy(self.view, view);
        }
        self._update_mvp()
    }

    unproject(e, t) {

        var self = this;
        var r = vec4.create();
        r[0] = 2 * (t[0] / self.viewport[2]) - 1;
        r[1] = 2 * (t[1] / self.viewport[3]) - 1;
        r[1] = 1 - r[1];
        r[2] = 0;
        r[3] = 1;
        vec4.transformMat4(r, r, self.mvpInv);
        e[0] = r[0] / r[3];
        e[1] = r[1] / r[3];

    }

    /**
     * 根据显示模式计算投影坐标
     * @param target
     * @param coord
     * @returns {*}
     */
    projection(target, coord) {
        if (this.globe === true) {
            return project_ecef(target, coord);
        }
        return project_mercator(target, coord);
    }

    /**
     * 判断一个坐标是否在视野内
     * @param coord
     * @param deg
     * @returns {boolean}
     */
    inView(coord, deg) {
        if (this.globe !== true) {
            return true;
        }

        var proj = vec3.create(),
            t = vec3.create();

        this.projection(proj, coord);

        vec3.normalize(t, proj);

        return vec3.dot(t, this.viewDir) < -Math.cos(deg2rad(deg || 90))
    }
}


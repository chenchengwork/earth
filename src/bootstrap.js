import {
    each,
    registerShaders
} from './core/helper';

var markShaders = {
    mark: {
        main: `
            attribute vec2 coord;
            varying vec2 v_texcoord;
            uniform mat4 mvp;
            uniform mat3 bill;
            uniform mat4 mat;
            uniform vec3 pos;
            uniform sampler2D t_sharp;
            uniform sampler2D t_fuzzy;
            uniform vec4 color;
            uniform float scale;
            uniform float fuzz;
        `,
        vertex: `
            void main() {
                v_texcoord = vec2(coord.x, 1.0 - coord.y);
                vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;
                gl_Position = mvp * vec4(P, 1.0);
            }
        `,
        fragment: `
            void main() {
                vec4 C = mix(texture2D(t_sharp, v_texcoord), texture2D(t_fuzzy, v_texcoord), fuzz);
                float alpha = C.x;
                gl_FragColor = vec4(color.xyz, alpha);
            }
        `,
    },
    mark_pick: {
        main: `
            attribute vec2 coord;
            varying vec2 v_texcoord;
            uniform mat4 mvp;
            uniform mat3 bill;
            uniform vec3 pos;
            uniform float color;
            uniform float scale;
        `,
        vertex: `
            void main() {
                v_texcoord = vec2(coord.x, 1.0 - coord.y);
                vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;
                gl_Position = mvp * vec4(P, 1.0);
            }
        `,
        fragment: `
            void main() {
                gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
            }
        `
    },
    connector: {
        main: `
            attribute vec4 position;
            uniform mat4 mvp;
            uniform vec4 color;
        `,
        vertex: `
            void main() {
                vec3 P = position.xyz;
                float side = position.w;
                if (side > 0.5) 
                    gl_Position = mvp * vec4(P, 1.0);
                else
                    gl_Position = vec4(P, 1.0);
            }
        `,
        fragment: `
            void main() {
                gl_FragColor = color;
            }
        `

    }
};

each(markShaders, function (shader, name) {
    registerShaders(name, shader.main, shader.vertex, shader.fragment);
});


var worldShaders = {
    map_pick: {
        main: `
            attribute vec3 position;
            uniform mat4 mvp;
            uniform float color;
        `,
        vertex: `
            void main() {
                vec3 P = position;
                gl_Position = mvp * vec4(P, 1.0);
            }
        `,
        fragment: `
            void main() {
                gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
            }
        `
    },
    map_main: {
        main: `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec3 position2;
            attribute vec3 normal2;
            attribute vec2 texcoord;
            varying vec3 v_normal;
            varying vec2 v_texcoord;
            varying vec3 v_light_vec;
            varying vec3 v_view_vec;
            uniform mat4 mvp;
            uniform float offset_x;
            uniform sampler2D t_blur;
            uniform float blend;
            uniform vec3 light_pos;
            uniform vec3 view_pos;
            uniform vec3 color0;
            uniform vec3 color1;
            uniform float tone;
            uniform float alpha;
            uniform float height;
        `,
        vertex: `void main() {
               vec3 P = mix(position, position2, blend);
               P.x += offset_x;
               v_normal = mix(normal, normal2, blend);
               P += height * v_normal;
               gl_Position = mvp * vec4(P, 1.0);
               v_texcoord = texcoord;
               v_light_vec = light_pos - P;
               v_view_vec = view_pos - P;
            }
        `,
        fragment: `
            void main() {
                vec3 N = normalize(-v_normal);
                vec3 V = normalize(v_view_vec);
                vec3 L = normalize(v_light_vec);vec3 H = normalize(L + V);
                float NdotL = max(0.0, dot(N, L));
                float NdotH = max(0.0, dot(N, H));
                float blur = texture2D(t_blur, v_texcoord).r;
                blur = 1.0*pow(blur, 2.0);
                float diffuse = 0.5 + 0.5*NdotL;
                float specular = 0.75 * pow(NdotH, 15.0);
                gl_FragColor.rgb = diffuse * mix(color0, color1, tone) + vec3(specular);
                gl_FragColor.a = alpha;
            }
        `
    },
    map_grid: {
        main: `
            attribute vec3 position;
            attribute vec3 position2;
            attribute vec2 texcoord;
            varying vec2 v_texcoord;
            uniform mat4 mvp;
            uniform vec2 pattern_scale;
            uniform sampler2D t_blur;
            uniform sampler2D t_pattern;
            uniform float blend;
            uniform vec3 color0;
            uniform vec3 color1;
            uniform float offset_x;
        `,
        vertex: `
            void main() {
                vec3 P = mix(position, position2, blend);
                P.x += offset_x;
                gl_Position = mvp * vec4(P, 1.0);
                v_texcoord = texcoord;
            }
        `,
        fragment: `
            void main() {
                float pattern = texture2D(t_pattern, pattern_scale * v_texcoord).r;
                float blur = texture2D(t_blur, v_texcoord).r;
                gl_FragColor.rgb = mix(color0, color1, blur) + vec3(pattern);
                gl_FragColor.a = 1.0;
            }
        `
    },
    map_line: {
        main: `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec3 position2;
            attribute vec3 normal2;
            uniform mat4 mvp;
            uniform vec4 color;
            uniform float blend;
            uniform float height;
        `,
        vertex: `
            void main() {
                vec3 P = mix(position, position2, blend);
                vec3 N = mix(normal, normal2, blend);
                P += height * N;
                gl_Position = mvp * vec4(P, 1.0);
            }
        `,
        fragment: `
            void main() {
                gl_FragColor = color;
            }
        `
    },
    map_label: {
        main: `
         attribute vec3 position;
         attribute vec2 texcoord;
         varying float v_alpha;
         varying vec2 v_texcoord;
         uniform mat4 mvp;
         uniform vec4 color;
         uniform vec4 circle_of_interest;
         uniform bool inside;
          uniform sampler2D t_color;
        `,
        vertex: `
            void main() {
                gl_Position = mvp * vec4(position, 1.0);
                v_alpha = max(0.0, 1.0 - distance(position, circle_of_interest.xyz)/circle_of_interest.a);
                if (!inside) v_alpha = pow(1.0 - v_alpha, 6.0);
                v_texcoord = texcoord;
            }
        `,
        fragment: `
            void main() {
                gl_FragColor = texture2D(t_color, v_texcoord);
                gl_FragColor.a = 0.7 * v_alpha;
            }
        `
    },
    stars: {
        main: `
            attribute vec4 position;
            uniform mat4 mvp;
            uniform vec4 color;
        `,
        vertex: `
            void main() {
                gl_PointSize = position.w;
                gl_Position = mvp * vec4(position.xyz, 1.0);
            }
        `,
        fragment: `
            void main() {
                gl_FragColor = color;
            }
        `
    },
    corona: {
        main: `
            attribute vec4 vertex;
            varying vec2 v_texcoord;
            uniform mat4 mvp;
            uniform mat3 bill;
            uniform sampler2D t_smoke;
            uniform float time;
            uniform vec4 color;
        `,
        vertex: `
            void main() {
                float s = 10.0 + (10.0 * vertex.w);
                vec3 P = vec3(s * vertex.xy, 0);
                P = bill * P;
                gl_Position = mvp * vec4(P, 1.0);
                v_texcoord = vertex.zw;
            }
        `,
        fragment: `
            void main() {
                vec2 uv = vec2(5.0*v_texcoord.x + 0.01*time, 0.8 - 1.5*v_texcoord.y);
                float smoke = texture2D(t_smoke, uv).r;
                uv = vec2(3.0*v_texcoord.x - 0.007*time, 0.9 - 0.5*v_texcoord.y);
                vec3 color1 = vec3(0,0,0);
                smoke *= 1.5*texture2D(t_smoke, uv).r;
                float t = pow(v_texcoord.y, 0.25);
                gl_FragColor.rgb = mix(color.rgb,color1, t) + 0.3*smoke;
                gl_FragColor.a = color.a;
            }
        `,

    }
};

each(worldShaders, function (shader, name) {
    registerShaders(name, shader.main, shader.vertex, shader.fragment);
});

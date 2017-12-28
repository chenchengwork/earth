import {
    each,
    registerShaders
} from './core/helper';

var markShaders = {
    mark: {
        main: "attribute vec2 coord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform mat4 mat;\nuniform vec3 pos;\nuniform sampler2D t_sharp;\nuniform sampler2D t_fuzzy;\nuniform vec4 color;\nuniform float scale;\nuniform float fuzz;\n",
        vertex: "void main() {\n    v_texcoord = vec2(coord.x, 1.0 - coord.y);\n    vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        fragment: "void main() {\n    vec4 C = mix(texture2D(t_sharp, v_texcoord), texture2D(t_fuzzy, v_texcoord), fuzz);\n    float alpha = C.x;\n    gl_FragColor = vec4(color.xyz, alpha);\n}",
    },
    mark_pick: {
        main: "attribute vec2 coord;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform mat3 bill;\n uniform vec3 pos;\n uniform float color;\n uniform float scale;",
        vertex: "void main() {\n   v_texcoord = vec2(coord.x, 1.0 - coord.y);\n   vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n   gl_Position = mvp * vec4(P, 1.0);\n  }",
        fragment: "void main() {\n   gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n }"
    },
    connector: {
        main: "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        vertex: "void main() {\n    vec3 P = position.xyz;\n    float side = position.w;\n    if (side > 0.5)\n        gl_Position = mvp * vec4(P, 1.0);\n    else\n        gl_Position = vec4(P, 1.0);\n}\n",
        fragment: "void main() {\n    gl_FragColor = color;\n}\n\n\n"

    }
};

each(markShaders, function (shader, name) {
    registerShaders(name, shader.main, shader.vertex, shader.fragment);
});


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

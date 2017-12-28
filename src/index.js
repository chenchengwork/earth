/**
 * Created by vision on 16/4/12.
 */
import "./assets/scss/main.scss";
import "./bootstrap";
import Earth from './core/Earth';

Earth.registerTheme("blue", {
    grid: {
        color0: [15, 113, 152],
        color1: [16, 81, 128]
    },
    corona: {
        color: [89, 178, 236]
    },
    country: {
        color0: [15, 133, 152],
        color1: [16, 100, 150]
    },
    boundary: {
        color: [32, 134, 224]
    }
});

//实例化地球
const EARTH = window.EARTH = new Earth($(".earth")[0], {}, "blue");

//渲染地球
EARTH.render();

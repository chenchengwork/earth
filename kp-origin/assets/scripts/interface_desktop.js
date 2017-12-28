var
    /**
     * 初始化控制器按钮事件
     */
    initControls = function () {

        /**
         * 绑定控制按钮的鼠标移动和离开效果
         */
        $("div#controls ul#control_btns li[data-label-en] a").each(function () {
            var $li = $(this).closest("li");
            $(this).on("mouseenter", function (e) {
                var $label = $(".label", $li).length ? $(".label", $li) : $("<div>").addClass("label"),
                    label = $li.attr("data-label-en") ,
                    $label_text = $(".label_text", $li).length ? $(".label_text", $li).text(label) : $("<div>").addClass("label_text").text(label),
                    $label_arrow = $(".label_arrow", $li).length ? $(".label_arrow", $li) : $("<div>").addClass("label_arrow").hide();

                $li.append($label_arrow);
                $label.append($label_text);
                $li.append($label);
                $label_arrow.fadeIn(250);
                $label.stop(!0, !0);
                $label_arrow.stop(!0, !0);
                $label.animate({
                    width: parseInt($label_text.innerWidth()) + "px",
                    left: -1 * parseInt($label_text.innerWidth()) + "px"
                }, {duration: 250});
            });
            $(this).on("mouseleave", function () {
                $(".label", $li).animate({width: "0px", left: "0px"}, {});
                $(".label_arrow", $li).fadeOut(250, function () {
                })
            })
        });
        /**
         * 绑定3D和屏幕切换按钮事件
         */
        $(".controls ul.control_btns .map_type_globe").on("click", function () {
            MAP.get_demo() && MAP.set_demo(!1);
            $(".controls ul.control_btns .map_type_globe").hide();
            $(".controls ul.control_btns .map_type_plane").show();
            MAP.set_view("flat"), mapModus = 1;
            return !1
        });
        $(".controls ul.control_btns .map_type_plane").on("click", function () {
            MAP.get_demo() && MAP.set_demo(!1);
            $(".controls ul.control_btns .map_type_globe").show();
            $(".controls ul.control_btns .map_type_plane").hide();
            MAP.set_view("globe"), mapModus = 0;
            return !1;
        });

        /**
         * 绑定demo模式按钮事件
         */
        $(".controls ul.control_btns .demo_on_btn").on("click", function () {
            MAP.set_demo(!0);
            setUIDemoState(!0);
            return !1;
        });
        $(".controls ul.control_btns .demo_off_btn").on("click", function () {
            MAP.set_demo(!1);
            setUIDemoState(!1);
            return !1;
        });

        /**
         * 绑定切换颜色按钮事件
         */
        $(".controls ul.control_btns .map_color_1").on("click", function () {
            $(".controls ul.control_btns .map_color_1").hide();
            $(".controls ul.control_btns .map_color_2").show();
            MAP.set_palette("light");
            mapColor = 1;
            return !1
        });
        $(".controls ul.control_btns .map_color_2").on("click", function () {
            $(".controls ul.control_btns .map_color_1").show();
            $(".controls ul.control_btns .map_color_2").hide();
            MAP.set_palette("dark");
            mapColor = 0;
            return !1
        });

        /**
         * 绑定缩放按钮事件
         */
        $(".controls ul.control_btns .map_zoom_in").on("click", function () {
            MAP.get_demo() && MAP.set_demo(!1);
            MAP.zoom_in();
            return !1
        });
        $(".controls ul.control_btns .map_zoom_out").on("click", function () {
            MAP.get_demo() && MAP.set_demo(!1);
            MAP.zoom_out();
            return !1
        })
    },
    mapDetectionTypesScrollSize = 5,
    mapDetectionTypesScrollInterval,
    mapDetectionTypesScrollStop = function (e) {
        return clearInterval(mapDetectionTypesScrollInterval), platformDetection.isMobile ? $("body").off("touchend", mapDetectionTypesScrollStop) : $("body").off("mouseup", mapDetectionTypesScrollStop), mapDetectionTypesScrollSize = 1, e.preventDefault(), e.stopPropagation(), !1
    },
    addBasicDetectionTypeEvents = function () {
        $(".detection_types ul.type-icons li[data-detectiontype]").on("click", detectionTypeClick);
    };

$(document).ready(function () {
    loadCountries();
    initControls();
    addBasicDetectionTypeEvents();
});

$(window).resize(function () {
    setTimeout(function () {

        var e = $(".site .detection_types_container .detection_types .type-icons"),
            t = $(".site .detection_types_container .detection_types");
        parseInt(e.css("marginLeft")) > 0 && e.css({marginLeft: "0px"});
        e.width() > t.width() ? parseInt(e.css("marginLeft")) < -1 * (e.width() - t.width()) && e.css({marginLeft: -1 * (e.width() - t.width()) + "px"}) : e.css({marginLeft: "0px"})

    }, 50)
});
var CYBERMAP_IS_DEVELOPMENT = false,
    CYBERMAP_IS_PRODUCTION = !CYBERMAP_IS_DEVELOPMENT,
    detectedCountryId = -1,
    logToConsole = !1,
    activeLang = 0,
    activeLangClass = ".english",
    langUrlPrefix = "",
    mapModus = 0,
    demoModeActive = 0,
    mapColor = 0,
    currPageId = 1,
    lastScrollTop = 0,
    lastScrollDir = 0,
    currWorldStatisticsTimePeriod = 0,
    currWorldStatisticsDetectionType = "oas",
    nextWorldStatisticsContentPane = "stats_content_one",
    currCountryStatisticsTimePeriod = 0,
    currCountryStatisticsDetectionType = "oas",
    nextCountryStatisticsContentPane = "stats_content_one",
    currCountryStatisticsCountry = 1,
    countries = [],
    webgl_countries_data = [],
    countriesObjs = [],
    waitingForAllCountryData,
    lastTop5Data,
    detectionTypes = [
        {
            id: "oas",
            name_en: window.lang.getText("STATISTICS_LOCAL_INFECTIONS"),
            name_ru: window.lang.getText("STATISTICS_LOCAL_INFECTIONS"),
            active: 1
        }, {
            id: "wav",
            name_en: window.lang.getText("STATISTICS_WEB_THREATS"),
            name_ru: window.lang.getText("STATISTICS_WEB_THREATS"),
            active: 1
        }, {
            id: "ids",
            name_en: window.lang.getText("STATISTICS_NETWORK_ATTACKS"),
            name_ru: window.lang.getText("STATISTICS_NETWORK_ATTACKS"),
            active: 1
        }, {
            id: "vul",
            name_en: window.lang.getText("STATISTICS_VULNERABILITIES"),
            name_ru: window.lang.getText("STATISTICS_VULNERABILITIES"),
            active: 1
        }, {
            id: "kas",
            name_en: window.lang.getText("STATISTICS_SPAM"),
            name_ru: window.lang.getText("STATISTICS_SPAM"),
            active: 1
        }, {
            id: "mav",
            name_en: window.lang.getText("STATISTICS_INFECTED_MAIL"),
            name_ru: window.lang.getText("STATISTICS_INFECTED_MAIL"),
            active: 1
        }, {
            id: "ods",
            name_en: window.lang.getText("STATISTICS_ON_DEMAND_SCAN"),
            name_ru: window.lang.getText("STATISTICS_ON_DEMAND_SCAN"),
            active: 1
        }, {
            id: "bad",
            name_en: window.lang.getText("STATISTICS_BOTNET_ACTIVITY"),
            name_ru: window.lang.getText("STATISTICS_BOTNET_ACTIVITY"),
            active: 1
        }
    ],
    continents = [
        {
            name_en: window.lang.getText("CONTINENT_NORTH_AMERICA"),
            name_ru: "Северная Америка",
            countries: [109, 70, 111, 167, 136, 90, 193, 108, 161, 118, 142, 82, 12, 173, 38, 178, 72]
        }, {
            name_en: window.lang.getText("CONTINENT_SOUTH_AMERICA"),
            name_ru: "Южная Америка",
            countries: [149, 100, 112, 117, 124, 148, 160, 184, 215, 222, 227, 35, 4, 56, 6]
        }, {
            name_en: window.lang.getText("CONTINENT_ASIA"),
            name_ru: "Азия",
            countries: [
                159, 10, 105, 122, 123, 13, 131, 34, 137, 140, 144, 147, 150, 152, 154, 159, 179, 182, 185, 186, 192,
                197,
                199, 202, 206, 213, 219, 226, 229, 23, 237, 240, 241, 33, 34, 37, 39, 42, 45, 50, 52, 55, 58, 60, 67, 92
            ]
        }, {
            name_en: window.lang.getText("CONTINENT_EUROPE"),
            name_ru: "Европа",
            countries: [
                1, 103, 113, 117, 120, 125, 146, 15, 166, 17, 171, 187, 19, 194, 197, 203, 207, 211, 218, 221, 223, 233,
                235, 253, 26, 27, 28, 29, 46, 48, 49, 59, 66, 69, 75, 81, 86, 91
            ]
        }, {
            name_en: window.lang.getText("CONTINENT_AFRIKA"),
            name_ru: "Африка",
            countries: [
                209, 104, 107, 110, 114, 115, 121, 129, 138, 141, 143, 151, 155, 156, 157, 163, 170, 172, 175, 180, 183,
                188, 190, 191, 195, 198, 20, 200, 208, 21, 210, 220, 224, 234, 24, 243, 248, 3, 31, 36, 43, 5, 51, 61,
                74,
                84, 87, 99
            ]
        },
        {
            name_en: window.lang.getText("CONTINENT_OCEANIA"),
            name_ru: "Океания",
            countries: [30, 62, 22, 83, 16, 176, 127]
        }
    ];

var
    dataLoader = function (t, e) {
        var o, s = "bad" == t.detection_type;
        if (s || CYBERMAP_IS_PRODUCTION) {
            if (t.list_countries) {
                o = "assets/data/countries.json";
            } else {
                var a = t.data_type + "_" + t.detection_type + "_" + t.time_period + ("country" == t.data_type ? "" : "_" + t.country_id) + ".json";
                o = "assets/data/securelist/" + a
            }
        } else {
            o = "/assets/lib/data_loader.php?" + $.param(t);
        }
        $.getJSON(o, function (t) {
            e(t)
        })
    },
    loadCountriesHelper = function (t) {
        $.isEmptyObject(webgl_countries_data) || (clearInterval(waitingForAllCountryData), $.each(t, function (t, e) {
            isSet(webgl_countries_data[e.key]) && (96 != parseInt(e.key) ? (countries[e.key] = {
                en: webgl_countries_data[e.key].name[window.lang.lang()],
                ru: webgl_countries_data[e.key].name.ru
            }, countriesObjs.push({
                id: e.key,
                value_en: webgl_countries_data[e.key].name[window.lang.lang()],
                value_ru: webgl_countries_data[e.key].name.ru
            })) : (countries[e.key] = {en: e.name, ru: "Кот-д’Ивуар"}, countriesObjs.push({
                id: e.key,
                value_en: e.name,
                value_ru: "Кот-д’Ивуар"
            })))
        }))
    },
    loadCountries = function () {
        dataLoader({list_countries: 1}, function (t) {
            waitingForAllCountryData = setInterval(function () {
                loadCountriesHelper(t)
            }, 100)
        })
    },
    buildStatisticsGraph2 = function (t, e, o, s) {
        var a = $("<div>").addClass("stats_block wide"), n = "", i = "", r = "", c = "";
        "world" == e ? (n = 0 == currWorldStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), i = 0 == currWorldStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), $.each(detectionTypes, function (t, e) {
            e.id == currWorldStatisticsDetectionType && (r = e.name_en, c = e.name_ru)
        })) : (n = 0 == currCountryStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), i = 0 == currCountryStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), $.each(detectionTypes, function (t, e) {
            e.id == currCountryStatisticsDetectionType && (r = e.name_en, c = e.name_ru)
        }));
        var l = $("<h2>").addClass("english").html(window.lang.getText("STATISTICS_TOP") + " - " + r + " " + window.lang.getText("STATISTICS_IN_THE_LAST") + " " + n), d = $("<h2>").addClass("russian").html(window.lang.getText("STATISTICS_TOP") + " - " + r + " " + window.lang.getText("STATISTICS_IN_THE_LAST") + " " + n), p = $("<div>").addClass("canvas_holder"), u = $("<div>").addClass("inner_canvas_holder"), _ = $("<canvas>").addClass("statistics_canvas_2");
        a.append(l), a.append(d), u.append(_), p.append(u), a.append(p), "world" == e ? ("bad" == currWorldStatisticsDetectionType && a.css({
            position: "relative",
            left: "50%",
            transform: "translateX(-50%)",
            clear: "both"
        }), $(".stats_overview.one .stats_content ." + nextWorldStatisticsContentPane).append(a)) : $(".stats_overview.two .stats_content ." + nextCountryStatisticsContentPane).append(a);
        var g = !1, v = [], w = [];
        if (isSet(t.data_loader_error)) {
            var T = $("<span>").addClass("english").css({
                position: "absolute",
                left: "0px",
                top: "49%",
                textAlign: "center",
                width: "100%",
                color: "#000000",
                zIndex: 5
            }).text(window.lang.getText("STATISTICS_NO_DATA")), y = $("<span>").addClass("russian").css({
                position: "absolute",
                left: "0px",
                top: "49%",
                textAlign: "center",
                width: "100%",
                color: "#000000",
                zIndex: 5
            }).text(window.lang.getText("STATISTICS_NO_DATA"));
            p.append(T), p.append(y), "world" == e && 1 == currWorldStatisticsTimePeriod || "world" != e && 1 == currCountryStatisticsTimePeriod ? (v = [
                "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
                "",
                "", "", ""
            ], w = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) : (v = [
                "", "", "", "", "", "", ""
            ], w = [0, 0, 0, 0, 0, 0, 0]), o.apply(this, s)
        } else g = !0, $.each(t, function (e, a) {
            var n = a.date;
            e == t.length - 1 && o.apply(this, s), t.length - 1 > 7 && platformDetection.isMobile && (e > 0 && 5 > e && (n = ""), e > 5 && 10 > e && (n = ""), e > 10 && 15 > e && (n = ""), e > 15 && 20 > e && (n = ""), e > 20 && 25 > e && (n = ""), e > 25 && e < t.length - 1 && (n = "")), v.push(n), w.push(a.count)
        });
        var S = {
                labels: v,
                datasets: [
                    {
                        label: "",
                        fillColor: "rgba(213,43,30,0.two)",
                        strokeColor: "rgba(213,43,30,1)",
                        pointColor: "rgba(213,43,30,1)",
                        pointStrokeColor: "#d52b1e",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(213,43,30,1)",
                        data: w
                    }
                ]
            },
            m = {
                animation: !0,
                animationSteps: 60,
                animationEasing: "easeOutQuart",
                scaleShowGridLines: !0,
                scaleGridLineColor: "rgba(0,0,0,.05)",
                scaleGridLineWidth: 1,
                scaleShowHorizontalLines: !0,
                scaleShowVerticalLines: !1,
                bezierCurve: !0,
                bezierCurveTension: .4,
                pointDot: !0,
                pointDotRadius: 5,
                pointDotStrokeWidth: 1,
                pointHitDetectionRadius: 5,
                datasetStroke: !0,
                datasetStrokeWidth: 1,
                datasetFill: !1,
                responsive: !0,
                maintainAspectRatio: !1,
                showTooltips: g,
                customTooltips: !1,
                tooltipEvents: ["mousemove", "touchstart", "touchmove"],
                tooltipFillColor: "#006d55",
                tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                tooltipFontSize: 14,
                tooltipFontStyle: "normal",
                tooltipFontColor: "#fff",
                tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                tooltipTitleFontSize: 14,
                tooltipTitleFontStyle: "bold",
                tooltipTitleFontColor: "#fff",
                tooltipYPadding: 15,
                tooltipXPadding: 10,
                tooltipCaretSize: 6,
                tooltipCornerRadius: 0,
                tooltipXOffset: 10,
                tooltipTemplate: "<%= value %>",
                multiTooltipTemplate: "<%= value %>",
                legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
                onAnimationProgress: function () {
                },
                onAnimationComplete: function () {
                }
            };
        new Chart(_[0].getContext("2d")).Line(S, m)
    },
    clickCountry = function (t) {
        currCountryStatisticsCountry = $(t.target).closest("a").attr("data-country-id");
        t.stopPropagation();
        return !1
    },
    buildStatisticLists = function (t, e, o, s, a) {
        var n;
        n = "world" == e ? $(".stats_overview.one .stats_content ." + nextWorldStatisticsContentPane) : $(".stats_overview.two .stats_content ." + nextCountryStatisticsContentPane);
        var i = $("<div>").addClass("stats_block " + o), r = $("<h2>"), c = $("<ul>").addClass("list"), l = $("<li>"), d = $("<a>"), p = $("<span>");
        $.each(t, function (e, o) {
            var u = i.clone(), _ = r.clone().addClass("english").html(o.name_en), g = r.clone().addClass("russian").html(o.name_ru), v = c.clone();
            if (isSet(o.items))$.each(o.items, function (t, e) {
                var o = e.value;
                "bad" !== currWorldStatisticsDetectionType && (o += " %");
                var s = l.clone(), a = d.clone().attr("href", "").on("click", function (t) {
                    return t.stopPropagation(), t.preventDefault(), !1
                }), n = p.clone().addClass("num").text(t + 1 + "."), i = p.clone().addClass("name"), r = p.clone().addClass("english").html(e.name_en), c = p.clone().addClass("russian").html(e.name_ru), u = p.clone().addClass("percentage").html(o), _ = p.clone().addClass("info"), g = p.clone().addClass("english").html("See data"), w = p.clone().addClass("russian").html("Показать данные");
                i.append(r), i.append(c), isSet(e.country_id) && "bad" !== currWorldStatisticsDetectionType ? (a.attr("data-country-id", e.country_id).on("click", clickCountry), _.append(g), _.append(w)) : _.html(o), a.append(n), a.append(i), a.append(u), a.append(_), s.append(a), v.append(s)
            }); else {
                var w = $("<div>").addClass("nodata_list"),
                    T = $("<span>").addClass("english").css({
                        position: "absolute",
                        left: "0px",
                        top: "49%",
                        textAlign: "center",
                        width: "100%",
                        color: "#000000"
                    }).text("NO DATA"),
                    y = $("<span>").addClass("russian").css({
                        position: "absolute",
                        left: "0px",
                        top: "49%",
                        textAlign: "center",
                        width: "100%",
                        color: "#000000"
                    }).text("НЕТ ДАННЫХ");
                w.append(T), w.append(y), v.append(w)
            }
            u.append(_);
            u.append(g);
            u.append(v);
            $(n).append(u);
            e == t.length - 1 && s.apply(this, a)
        })
    },
    secureListDataLoaded = function (t, e, o, s, a) {
        switch (t.data_type) {
            case"country":
                var n = [], i = [];
                $.each(continents, function (t, o) {
                    var s = {};
                    s.name_en = o.name_en, s.name_ru = o.name_ru;
                    var a = [];
                    $.each(o.countries, function (t, o) {
                        if (isSet(countries[o]) && isSet(e[o])) {
                            var s = {country_id: o, name_en: countries[o].en, name_ru: countries[o].ru, value: e[o]};
                            i.push(s), a.push(s)
                        }
                    }), a.sort(function (t, e) {
                        return t.value == e.value ? 0 : t.value > e.value ? -1 : 1
                    }), s.items = a.slice(0, 5), n.push(s)
                });
                var r = {};
                r.name_en = window.lang.getText("CONTINENT_WORLD"), r.name_ru = window.lang.getText("CONTINENT_WORLD"), i.sort(function (t, e) {
                    return t.value == e.value ? 0 : t.value > e.value ? -1 : 1
                }), r.items = i.slice(0, 15), n.unshift(r), buildStatisticLists(n, o, "", s, a);
                break;
            case"graph":
                buildStatisticsGraph2(e, o, s, a);
                break;
            case"top10":
                var n = [], c = {}, l = "", d = "", p = "", u = "";
                if ("world" == o ? (l = 0 == currWorldStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), d = 0 == currWorldStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), $.each(detectionTypes, function (t, e) {
                        e.id == currWorldStatisticsDetectionType && (p = e.name_en, u = e.name_ru)
                    }), c.name_en = window.lang.getText("STATISTICS_TOP") + " - " + p + " " + window.lang.getText("STATISTICS_IN_THE_LAST") + " " + l, c.name_en = window.lang.getText("STATISTICS_TOP") + " - " + p + " " + window.lang.getText("STATISTICS_IN_THE_LAST") + " " + l) : (l = 0 == currCountryStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), d = 0 == currCountryStatisticsTimePeriod ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH"), $.each(detectionTypes, function (t, e) {
                        e.id == currCountryStatisticsDetectionType && (p = e.name_en, u = e.name_ru)
                    }), c.name_en = c.name_en = window.lang.getText("STATISTICS_TOP") + " - " + p + " " + window.lang.getText("STATISTICS_IN_THE_LAST") + " " + l, c.name_ru = c.name_en = window.lang.getText("STATISTICS_TOP") + " - " + p + " " + window.lang.getText("STATISTICS_IN_THE_LAST") + " " + l), !isSet(e.data_loader_error)) {
                    var _ = [];
                    $.each(e, function (t, e) {
                        var o = {name_en: e.name, name_ru: e.name, value: e.percent};
                        _.push(o)
                    })
                }
                c.items = _, n.push(c), "world" == o ? buildStatisticLists(n, o, "wide", s, a) : buildStatisticLists(n, o, "wide", s, a)
        }
    },
    loadSecureListData = function (t, e, o, s) {
        logToConsole && console.log("loading securelist data"), void 0 === o && (o = function () {
            logToConsole && console.log("no callback!")
        }), void 0 === s && (s = []);
        var a = {
            securelist_data: 1,
            country_id: 0,
            data_type: "country",
            detection_type: "oas",
            time_period: "d"
        }, n = [], i = $.extend({}, a, t);
        dataLoader(i, function (t) {
            $.each(t, function (t, e) {
                n[t] = e
            }), secureListDataLoaded(i, n, e, o, s)
        })
    },
    isSet = function (t) {
        return "undefined" != typeof t && null !== t ? !0 : !1
    },
    setUIDemoState = function (t) {
        t ? ($(".controls ul.control_btns .demo_on_btn").hide(), $(".controls ul.control_btns .demo_off_btn").show(), demoModeActive = 1) : ($(".controls ul.control_btns .demo_on_btn").show(), $(".controls ul.control_btns .demo_off_btn").hide(), demoModeActive = 0)
    },
    setUIViewState = function (t) {
        $(".controls ul.control_btns .map_type_globe").toggle("globe" == t);
        $(".controls ul.control_btns .map_type_plane").toggle("globe" != t)
    },
    /**
     * 检测类型点击事件
     * @param event
     */
    detectionTypeClick = function (event) {
        var type = $(event.target).closest("li").attr("data-detectiontype");

        $.each(detectionTypes, function (index, detection) {
            if (detection.id == type) {
                detection.active = detection.active == 1 ? 0 : 1;
            }
        });

        $("ul.type-icons li[data-detectiontype='" + type + "']").toggleClass("disabled");
        MAP.toggle_map(type);
       // MAP.toggle_graph(type);

    };
function make_event_emitter(clazz) {
    function getEvents(obj) {
        return obj._listeners || (obj._listeners = {})
    }

    _.assign(clazz, {
        on: function (eventName, callback) {
            var events = getEvents(this),
                event = events[eventName];
            event || (event = events[eventName] = []);
            event.push(callback)
        },
        off: function (eventName, cakkback) {
            var events = getEvents(this),
                event = events[eventName];
            event && (events[eventName] = _.without(event, cakkback))
        },
        emit: function (e) {
            var r = getEvents(this), n = r[e];
            if (n) {
                var o = Array.prototype.slice.call(arguments, 1);
                n.forEach(function (e) {
                    e.apply(null, o)
                })
            }
        }
    })
}

(function () {
    function e(e, t, r) {
        for (var n = (r || 0) - 1, o = e ? e.length : 0; ++n < o;) {
            if (e[n] === t)return n;
        }
        return -1
    }

    function t(t, r) {
        var n = typeof r;
        if (t = t.cache, "boolean" == n || null == r)return t[r] ? 0 : -1;
        "number" != n && "string" != n && (n = "object");
        var o = "number" == n ? r : d + r;
        return t = (t = t[n]) && t[o], "object" == n ? t && e(t, r) > -1 ? 0 : -1 : t ? 0 : -1
    }

    function r(e) {
        var t = this.cache, r = typeof e;
        if ("boolean" == r || null == e)t[e] = !0; else {
            "number" != r && "string" != r && (r = "object");
            var n = "number" == r ? e : d + e, o = t[r] || (t[r] = {});
            "object" == r ? (o[n] || (o[n] = [])).push(e) : o[n] = !0
        }
    }

    function n(e) {
        return e.charCodeAt(0)
    }

    function o(e, t) {
        for (var r = e.criteria, n = t.criteria, o = -1, a = r.length; ++o < a;) {
            var i = r[o], u = n[o];
            if (i !== u) {
                if (i > u || "undefined" == typeof i)return 1;
                if (u > i || "undefined" == typeof u)return -1
            }
        }
        return e.index - t.index
    }

    function a(e) {
        var t = -1, n = e.length, o = e[0], a = e[n / 2 | 0], i = e[n - 1];
        if (o && "object" == typeof o && a && "object" == typeof a && i && "object" == typeof i)return !1;
        var u = c();
        u["false"] = u["null"] = u["true"] = u.undefined = !1;
        var l = c();
        for (l.array = e, l.cache = u, l.push = r; ++t < n;) {
            l.push(e[t]);
        }
        return l
    }

    function i(e) {
        return "\\" + H[e]
    }

    function u() {
        return g.pop() || []
    }

    function c() {
        return h.pop() || {
                array: null,
                cache: null,
                criteria: null,
                "false": !1,
                index: 0,
                "null": !1,
                number: null,
                object: null,
                push: null,
                string: null,
                "true": !1,
                undefined: !1,
                value: null
            }
    }

    function l(e) {
        e.length = 0, g.length < b && g.push(e)
    }

    function s(e) {
        var t = e.cache;
        t && s(t), e.array = e.cache = e.criteria = e.object = e.number = e.string = e.value = null, h.length < b && h.push(e)
    }

    function f(e, t, r) {
        t || (t = 0), "undefined" == typeof r && (r = e ? e.length : 0);
        for (var n = -1, o = r - t || 0, a = Array(0 > o ? 0 : o); ++n < o;) {
            a[n] = e[t + n];
        }
        return a
    }

    function v(r) {
        function g(e) {
            return e && "object" == typeof e && !Qr(e) && kr.call(e, "__wrapped__") ? e : new h(e)
        }

        function h(e, t) {
            this.__chain__ = !!t, this.__wrapped__ = e
        }

        function b(e) {
            function t() {
                if (n) {
                    var e = f(n);
                    Gr.apply(e, arguments)
                }
                if (this instanceof t) {
                    var a = Y(r.prototype), i = r.apply(a, e || arguments);
                    return De(i) ? i : a
                }
                return r.apply(o, e || arguments)
            }

            var r = e[0], n = e[2], o = e[4];
            return Kr(t, e), t
        }

        function H(e, t, r, n, o) {
            if (r) {
                var a = r(e);
                if ("undefined" != typeof a)return a
            }
            var i = De(e);
            if (!i)return e;
            var c = Mr.call(e);
            if (!q[c])return e;
            var s = $r[c];
            switch (c) {
                case U:
                case N:
                    return new s(+e);
                case W:
                case j:
                    return new s(e);
                case C:
                    return a = s(e.source, A.exec(e)), a.lastIndex = e.lastIndex, a
            }
            var v = Qr(e);
            if (t) {
                var p = !n;
                n || (n = u()), o || (o = u());
                for (var g = n.length; g--;) {
                    if (n[g] == e)return o[g];
                }
                a = v ? s(e.length) : {}
            } else a = v ? f(e) : on({}, e);
            return v && (kr.call(e, "index") && (a.index = e.index), kr.call(e, "input") && (a.input = e.input)), t ? (n.push(e), o.push(a), (v ? Ke : cn)(e, function (e, i) {
                a[i] = H(e, t, r, n, o)
            }), p && (l(n), l(o)), a) : a
        }

        function Y(e, t) {
            return De(e) ? Wr(e) : {}
        }

        function K(e, t, r) {
            if ("function" != typeof e)return Qt;
            if ("undefined" == typeof t || !("prototype" in e))return e;
            var n = e.__bindData__;
            if ("undefined" == typeof n && (Yr.funcNames && (n = !e.name), n = n || !Yr.funcDecomp, !n)) {
                var o = Sr.call(e);
                Yr.funcNames || (n = !M.test(o)), n || (n = D.test(o), Kr(e, n))
            }
            if (n === !1 || n !== !0 && 1 & n[1])return e;
            switch (r) {
                case 1:
                    return function (r) {
                        return e.call(t, r)
                    };
                case 2:
                    return function (r, n) {
                        return e.call(t, r, n)
                    };
                case 3:
                    return function (r, n, o) {
                        return e.call(t, r, n, o)
                    };
                case 4:
                    return function (r, n, o, a) {
                        return e.call(t, r, n, o, a)
                    }
            }
            return Gt(e, t)
        }

        function Q(e) {
            function t() {
                var e = c ? i : this;
                if (o) {
                    var g = f(o);
                    Gr.apply(g, arguments)
                }
                if ((a || s) && (g || (g = f(arguments)), a && Gr.apply(g, a), s && g.length < u))return n |= 16, Q([
                    r, v ? n : -4 & n, g, null, i, u
                ]);
                if (g || (g = arguments), l && (r = e[p]), this instanceof t) {
                    e = Y(r.prototype);
                    var h = r.apply(e, g);
                    return De(h) ? h : e
                }
                return r.apply(e, g)
            }

            var r = e[0], n = e[1], o = e[2], a = e[3], i = e[4], u = e[5], c = 1 & n, l = 2 & n, s = 4 & n, v = 8 & n, p = r;
            return Kr(t, e), t
        }

        function Z(r, n) {
            var o = -1, i = ce(), u = r ? r.length : 0, c = u >= _ && i === e, l = [];
            if (c) {
                var f = a(n);
                f ? (i = t, n = f) : c = !1
            }
            for (; ++o < u;) {
                var v = r[o];
                i(n, v) < 0 && l.push(v)
            }
            return c && s(n), l
        }

        function ee(e, t, r, n) {
            for (var o = (n || 0) - 1, a = e ? e.length : 0, i = []; ++o < a;) {
                var u = e[o];
                if (u && "object" == typeof u && "number" == typeof u.length && (Qr(u) || ve(u))) {
                    t || (u = ee(u, t, r));
                    var c = -1, l = u.length, s = i.length;
                    for (i.length += l; ++c < l;) {
                        i[s++] = u[c]
                    }
                } else r || i.push(u)
            }
            return i
        }

        function te(e, t, r, n, o, a) {
            if (r) {
                var i = r(e, t);
                if ("undefined" != typeof i)return !!i
            }
            if (e === t)return 0 !== e || 1 / e == 1 / t;
            var c = typeof e, s = typeof t;
            if (!(e !== e || e && z[c] || t && z[s]))return !1;
            if (null == e || null == t)return e === t;
            var f = Mr.call(e), v = Mr.call(t);
            if (f == G && (f = O), v == G && (v = O), f != v)return !1;
            switch (f) {
                case U:
                case N:
                    return +e == +t;
                case W:
                    return e != +e ? t != +t : 0 == e ? 1 / e == 1 / t : e == +t;
                case C:
                case j:
                    return e == Tr(t)
            }
            var p = f == I;
            if (!p) {
                var g = kr.call(e, "__wrapped__"), h = kr.call(t, "__wrapped__");
                if (g || h)return te(g ? e.__wrapped__ : e, h ? t.__wrapped__ : t, r, n, o, a);
                if (f != O)return !1;
                var m = e.constructor, d = t.constructor;
                if (m != d && !(Le(m) && m instanceof m && Le(d) && d instanceof d) && "constructor" in e && "constructor" in t)return !1
            }
            var _ = !o;
            o || (o = u()), a || (a = u());
            for (var b = o.length; b--;) {
                if (o[b] == e)return a[b] == t;
            }
            var y = 0;
            if (i = !0, o.push(e), a.push(t), p) {
                if (b = e.length, y = t.length, i = y == b, i || n)for (; y--;) {
                    var T = b, w = t[y];
                    if (n)for (; T-- && !(i = te(e[T], w, r, n, o, a));) {
                        ;
                    } else if (!(i = te(e[y], w, r, n, o, a)))break
                }
            } else un(t, function (t, u, c) {
                return kr.call(c, u) ? (y++, i = kr.call(e, u) && te(e[u], t, r, n, o, a)) : void 0
            }), i && !n && un(e, function (e, t, r) {
                return kr.call(r, t) ? i = --y > -1 : void 0
            });
            return o.pop(), a.pop(), _ && (l(o), l(a)), i
        }

        function re(e, t, r, n, o) {
            (Qr(t) ? Ke : cn)(t, function (t, a) {
                var i, u, c = t, l = e[a];
                if (t && ((u = Qr(t)) || ln(t))) {
                    for (var s = n.length; s--;) {
                        if (i = n[s] == t) {
                            l = o[s];
                            break
                        }
                    }
                    if (!i) {
                        var f;
                        r && (c = r(l, t), (f = "undefined" != typeof c) && (l = c)), f || (l = u ? Qr(l) ? l : [] : ln(l) ? l : {}), n.push(t), o.push(l), f || re(l, t, r, n, o)
                    }
                } else r && (c = r(l, t), "undefined" == typeof c && (c = t)), "undefined" != typeof c && (l = c);
                e[a] = l
            })
        }

        function ne(e, t) {
            return e + Dr(Hr() * (t - e + 1))
        }

        function oe(r, n, o) {
            var i = -1, c = ce(), f = r ? r.length : 0, v = [], p = !n && f >= _ && c === e, g = o || p ? u() : v;
            if (p) {
                var h = a(g);
                c = t, g = h
            }
            for (; ++i < f;) {
                var m = r[i], d = o ? o(m, i, r) : m;
                (n ? !i || g[g.length - 1] !== d : c(g, d) < 0) && ((o || p) && g.push(d), v.push(m))
            }
            return p ? (l(g.array), s(g)) : o && l(g), v
        }

        function ae(e) {
            return function (t, r, n) {
                var o = {};
                r = g.createCallback(r, n, 3);
                var a = -1, i = t ? t.length : 0;
                if ("number" == typeof i)for (; ++a < i;) {
                    var u = t[a];
                    e(o, u, r(u, a, t), t)
                } else cn(t, function (t, n, a) {
                    e(o, t, r(t, n, a), a)
                });
                return o
            }
        }

        function ie(e, t, r, n, o, a) {
            var i = 1 & t, u = 2 & t, c = 4 & t, l = 16 & t, s = 32 & t;
            if (!u && !Le(e))throw new wr;
            l && !r.length && (t &= -17, l = r = !1), s && !n.length && (t &= -33, s = n = !1);
            var v = e && e.__bindData__;
            if (v && v !== !0)return v = f(v), v[2] && (v[2] = f(v[2])), v[3] && (v[3] = f(v[3])), !i || 1 & v[1] || (v[4] = o), !i && 1 & v[1] && (t |= 8), !c || 4 & v[1] || (v[5] = a), l && Gr.apply(v[2] || (v[2] = []), r), s && Nr.apply(v[3] || (v[3] = []), n), v[1] |= t, ie.apply(null, v);
            var p = 1 == t || 17 === t ? b : Q;
            return p([e, t, r, n, o, a])
        }

        function ue(e) {
            return en[e]
        }

        function ce() {
            var t = (t = g.indexOf) === dt ? e : t;
            return t
        }

        function le(e) {
            return "function" == typeof e && Rr.test(e)
        }

        function se(e) {
            var t, r;
            return e && Mr.call(e) == O && (t = e.constructor, !Le(t) || t instanceof t) ? (un(e, function (e, t) {
                r = t
            }), "undefined" == typeof r || kr.call(e, r)) : !1
        }

        function fe(e) {
            return tn[e]
        }

        function ve(e) {
            return e && "object" == typeof e && "number" == typeof e.length && Mr.call(e) == G || !1
        }

        function pe(e, t, r, n) {
            return "boolean" != typeof t && null != t && (n = r, r = t, t = !1), H(e, t, "function" == typeof r && K(r, n, 1))
        }

        function ge(e, t, r) {
            return H(e, !0, "function" == typeof t && K(t, r, 1))
        }

        function he(e, t) {
            var r = Y(e);
            return t ? on(r, t) : r
        }

        function me(e, t, r) {
            var n;
            return t = g.createCallback(t, r, 3), cn(e, function (e, r, o) {
                return t(e, r, o) ? (n = r, !1) : void 0
            }), n
        }

        function de(e, t, r) {
            var n;
            return t = g.createCallback(t, r, 3), be(e, function (e, r, o) {
                return t(e, r, o) ? (n = r, !1) : void 0
            }), n
        }

        function _e(e, t, r) {
            var n = [];
            un(e, function (e, t) {
                n.push(t, e)
            });
            var o = n.length;
            for (t = K(t, r, 3); o-- && t(n[o--], n[o], e) !== !1;) {
                ;
            }
            return e
        }

        function be(e, t, r) {
            var n = Jr(e), o = n.length;
            for (t = K(t, r, 3); o--;) {
                var a = n[o];
                if (t(e[a], a, e) === !1)break
            }
            return e
        }

        function ye(e) {
            var t = [];
            return un(e, function (e, r) {
                Le(e) && t.push(r)
            }), t.sort()
        }

        function Te(e, t) {
            return e ? kr.call(e, t) : !1
        }

        function we(e) {
            for (var t = -1, r = Jr(e), n = r.length, o = {}; ++t < n;) {
                var a = r[t];
                o[e[a]] = a
            }
            return o
        }

        function Ee(e) {
            return e === !0 || e === !1 || e && "object" == typeof e && Mr.call(e) == U || !1
        }

        function xe(e) {
            return e && "object" == typeof e && Mr.call(e) == N || !1
        }

        function Ae(e) {
            return e && 1 === e.nodeType || !1
        }

        function Me(e) {
            var t = !0;
            if (!e)return t;
            var r = Mr.call(e), n = e.length;
            return r == I || r == j || r == G || r == O && "number" == typeof n && Le(e.splice) ? !n : (cn(e, function () {
                return t = !1
            }), t)
        }

        function Re(e, t, r, n) {
            return te(e, t, "function" == typeof r && K(r, n, 2))
        }

        function Pe(e) {
            return Cr(e) && !jr(parseFloat(e))
        }

        function Le(e) {
            return "function" == typeof e
        }

        function De(e) {
            return !(!e || !z[typeof e])
        }

        function Se(e) {
            return ke(e) && e != +e
        }

        function Fe(e) {
            return null === e
        }

        function ke(e) {
            return "number" == typeof e || e && "object" == typeof e && Mr.call(e) == W || !1
        }

        function Ge(e) {
            return e && "object" == typeof e && Mr.call(e) == C || !1
        }

        function Ie(e) {
            return "string" == typeof e || e && "object" == typeof e && Mr.call(e) == j || !1
        }

        function Ue(e) {
            return "undefined" == typeof e
        }

        function Ne(e, t, r) {
            var n = {};
            return t = g.createCallback(t, r, 3), cn(e, function (e, r, o) {
                n[r] = t(e, r, o)
            }), n
        }

        function Be(e) {
            var t = arguments, r = 2;
            if (!De(e))return e;
            if ("number" != typeof t[2] && (r = t.length), r > 3 && "function" == typeof t[r - 2])var n = K(t[--r - 1], t[r--], 2); else r > 2 && "function" == typeof t[r - 1] && (n = t[--r]);
            for (var o = f(arguments, 1, r), a = -1, i = u(), c = u(); ++a < r;) {
                re(e, o[a], n, i, c);
            }
            return l(i), l(c), e
        }

        function We(e, t, r) {
            var n = {};
            if ("function" != typeof t) {
                var o = [];
                un(e, function (e, t) {
                    o.push(t)
                }), o = Z(o, ee(arguments, !0, !1, 1));
                for (var a = -1, i = o.length; ++a < i;) {
                    var u = o[a];
                    n[u] = e[u]
                }
            } else t = g.createCallback(t, r, 3), un(e, function (e, r, o) {
                t(e, r, o) || (n[r] = e)
            });
            return n
        }

        function Oe(e) {
            for (var t = -1, r = Jr(e), n = r.length, o = pr(n); ++t < n;) {
                var a = r[t];
                o[t] = [a, e[a]]
            }
            return o
        }

        function Ce(e, t, r) {
            var n = {};
            if ("function" != typeof t)for (var o = -1, a = ee(arguments, !0, !1, 1), i = De(e) ? a.length : 0; ++o < i;) {
                var u = a[o];
                u in e && (n[u] = e[u])
            } else t = g.createCallback(t, r, 3), un(e, function (e, r, o) {
                t(e, r, o) && (n[r] = e)
            });
            return n
        }

        function je(e, t, r, n) {
            var o = Qr(e);
            if (null == r)if (o)r = []; else {
                var a = e && e.constructor, i = a && a.prototype;
                r = Y(i)
            }
            return t && (t = g.createCallback(t, n, 4), (o ? Ke : cn)(e, function (e, n, o) {
                return t(r, e, n, o)
            })), r
        }

        function qe(e) {
            for (var t = -1, r = Jr(e), n = r.length, o = pr(n); ++t < n;) {
                o[t] = e[r[t]];
            }
            return o
        }

        function Ve(e) {
            for (var t = arguments, r = -1, n = ee(t, !0, !1, 1), o = t[2] && t[2][t[1]] === e ? 1 : n.length, a = pr(o); ++r < o;) {
                a[r] = e[n[r]];
            }
            return a
        }

        function Xe(e, t, r) {
            var n = -1, o = ce(), a = e ? e.length : 0, i = !1;
            return r = (0 > r ? Vr(0, a + r) : r) || 0, Qr(e) ? i = o(e, t, r) > -1 : "number" == typeof a ? i = (Ie(e) ? e.indexOf(t, r) : o(e, t, r)) > -1 : cn(e, function (e) {
                return ++n >= r ? !(i = e === t) : void 0
            }), i
        }

        function ze(e, t, r) {
            var n = !0;
            t = g.createCallback(t, r, 3);
            var o = -1, a = e ? e.length : 0;
            if ("number" == typeof a)for (; ++o < a && (n = !!t(e[o], o, e));) {
                ;
            } else cn(e, function (e, r, o) {
                return n = !!t(e, r, o)
            });
            return n
        }

        function He(e, t, r) {
            var n = [];
            t = g.createCallback(t, r, 3);
            var o = -1, a = e ? e.length : 0;
            if ("number" == typeof a)for (; ++o < a;) {
                var i = e[o];
                t(i, o, e) && n.push(i)
            } else cn(e, function (e, r, o) {
                t(e, r, o) && n.push(e)
            });
            return n
        }

        function $e(e, t, r) {
            t = g.createCallback(t, r, 3);
            var n = -1, o = e ? e.length : 0;
            if ("number" != typeof o) {
                var a;
                return cn(e, function (e, r, n) {
                    return t(e, r, n) ? (a = e, !1) : void 0
                }), a
            }
            for (; ++n < o;) {
                var i = e[n];
                if (t(i, n, e))return i
            }
        }

        function Ye(e, t, r) {
            var n;
            return t = g.createCallback(t, r, 3), Qe(e, function (e, r, o) {
                return t(e, r, o) ? (n = e, !1) : void 0
            }), n
        }

        function Ke(e, t, r) {
            var n = -1, o = e ? e.length : 0;
            if (t = t && "undefined" == typeof r ? t : K(t, r, 3), "number" == typeof o)for (; ++n < o && t(e[n], n, e) !== !1;) {
                ;
            } else cn(e, t);
            return e
        }

        function Qe(e, t, r) {
            var n = e ? e.length : 0;
            if (t = t && "undefined" == typeof r ? t : K(t, r, 3), "number" == typeof n)for (; n-- && t(e[n], n, e) !== !1;) {
                ;
            } else {
                var o = Jr(e);
                n = o.length, cn(e, function (e, r, a) {
                    return r = o ? o[--n] : --n, t(a[r], r, a)
                })
            }
            return e
        }

        function Ze(e, t) {
            var r = f(arguments, 2), n = -1, o = "function" == typeof t, a = e ? e.length : 0, i = pr("number" == typeof a ? a : 0);
            return Ke(e, function (e) {
                i[++n] = (o ? t : e[t]).apply(e, r)
            }), i
        }

        function Je(e, t, r) {
            var n = -1, o = e ? e.length : 0;
            if (t = g.createCallback(t, r, 3), "number" == typeof o)for (var a = pr(o); ++n < o;) {
                a[n] = t(e[n], n, e);
            } else a = [], cn(e, function (e, r, o) {
                a[++n] = t(e, r, o)
            });
            return a
        }

        function et(e, t, r) {
            var o = -(1 / 0), a = o;
            if ("function" != typeof t && r && r[t] === e && (t = null), null == t && Qr(e))for (var i = -1, u = e.length; ++i < u;) {
                var c = e[i];
                c > a && (a = c)
            } else t = null == t && Ie(e) ? n : g.createCallback(t, r, 3), Ke(e, function (e, r, n) {
                var i = t(e, r, n);
                i > o && (o = i, a = e)
            });
            return a
        }

        function tt(e, t, r) {
            var o = 1 / 0, a = o;
            if ("function" != typeof t && r && r[t] === e && (t = null), null == t && Qr(e))for (var i = -1, u = e.length; ++i < u;) {
                var c = e[i];
                a > c && (a = c)
            } else t = null == t && Ie(e) ? n : g.createCallback(t, r, 3), Ke(e, function (e, r, n) {
                var i = t(e, r, n);
                o > i && (o = i, a = e)
            });
            return a
        }

        function rt(e, t, r, n) {
            if (!e)return r;
            var o = arguments.length < 3;
            t = g.createCallback(t, n, 4);
            var a = -1, i = e.length;
            if ("number" == typeof i)for (o && (r = e[++a]); ++a < i;) {
                r = t(r, e[a], a, e);
            } else cn(e, function (e, n, a) {
                r = o ? (o = !1, e) : t(r, e, n, a)
            });
            return r
        }

        function nt(e, t, r, n) {
            var o = arguments.length < 3;
            return t = g.createCallback(t, n, 4), Qe(e, function (e, n, a) {
                r = o ? (o = !1, e) : t(r, e, n, a)
            }), r
        }

        function ot(e, t, r) {
            return t = g.createCallback(t, r, 3), He(e, function (e, r, n) {
                return !t(e, r, n)
            })
        }

        function at(e, t, r) {
            if (e && "number" != typeof e.length && (e = qe(e)), null == t || r)return e ? e[ne(0, e.length - 1)] : p;
            var n = it(e);
            return n.length = Xr(Vr(0, t), n.length), n
        }

        function it(e) {
            var t = -1, r = e ? e.length : 0, n = pr("number" == typeof r ? r : 0);
            return Ke(e, function (e) {
                var r = ne(0, ++t);
                n[t] = n[r], n[r] = e
            }), n
        }

        function ut(e) {
            var t = e ? e.length : 0;
            return "number" == typeof t ? t : Jr(e).length
        }

        function ct(e, t, r) {
            var n;
            t = g.createCallback(t, r, 3);
            var o = -1, a = e ? e.length : 0;
            if ("number" == typeof a)for (; ++o < a && !(n = t(e[o], o, e));) {
                ;
            } else cn(e, function (e, r, o) {
                return !(n = t(e, r, o))
            });
            return !!n
        }

        function lt(e, t, r) {
            var n = -1, a = Qr(t), i = e ? e.length : 0, f = pr("number" == typeof i ? i : 0);
            for (a || (t = g.createCallback(t, r, 3)), Ke(e, function (e, r, o) {
                var i = f[++n] = c();
                a ? i.criteria = Je(t, function (t) {
                    return e[t]
                }) : (i.criteria = u())[0] = t(e, r, o), i.index = n, i.value = e
            }), i = f.length, f.sort(o); i--;) {
                var v = f[i];
                f[i] = v.value, a || l(v.criteria), s(v)
            }
            return f
        }

        function st(e) {
            return e && "number" == typeof e.length ? f(e) : qe(e)
        }

        function ft(e) {
            for (var t = -1, r = e ? e.length : 0, n = []; ++t < r;) {
                var o = e[t];
                o && n.push(o)
            }
            return n
        }

        function vt(e) {
            return Z(e, ee(arguments, !0, !0, 1))
        }

        function pt(e, t, r) {
            var n = -1, o = e ? e.length : 0;
            for (t = g.createCallback(t, r, 3); ++n < o;) {
                if (t(e[n], n, e))return n;
            }
            return -1
        }

        function gt(e, t, r) {
            var n = e ? e.length : 0;
            for (t = g.createCallback(t, r, 3); n--;) {
                if (t(e[n], n, e))return n;
            }
            return -1
        }

        function ht(e, t, r) {
            var n = 0, o = e ? e.length : 0;
            if ("number" != typeof t && null != t) {
                var a = -1;
                for (t = g.createCallback(t, r, 3); ++a < o && t(e[a], a, e);) {
                    n++
                }
            } else if (n = t, null == n || r)return e ? e[0] : p;
            return f(e, 0, Xr(Vr(0, n), o))
        }

        function mt(e, t, r, n) {
            return "boolean" != typeof t && null != t && (n = r, r = "function" != typeof t && n && n[t] === e ? null : t, t = !1), null != r && (e = Je(e, r, n)), ee(e, t)
        }

        function dt(t, r, n) {
            if ("number" == typeof n) {
                var o = t ? t.length : 0;
                n = 0 > n ? Vr(0, o + n) : n || 0
            } else if (n) {
                var a = Mt(t, r);
                return t[a] === r ? a : -1
            }
            return e(t, r, n)
        }

        function _t(e, t, r) {
            var n = 0, o = e ? e.length : 0;
            if ("number" != typeof t && null != t) {
                var a = o;
                for (t = g.createCallback(t, r, 3); a-- && t(e[a], a, e);) {
                    n++
                }
            } else n = null == t || r ? 1 : t || n;
            return f(e, 0, Xr(Vr(0, o - n), o))
        }

        function bt() {
            for (var r = [], n = -1, o = arguments.length, i = u(), c = ce(), f = c === e, v = u(); ++n < o;) {
                var p = arguments[n];
                (Qr(p) || ve(p)) && (r.push(p), i.push(f && p.length >= _ && a(n ? r[n] : v)))
            }
            var g = r[0], h = -1, m = g ? g.length : 0, d = [];
            e:for (; ++h < m;) {
                var b = i[0];
                if (p = g[h], (b ? t(b, p) : c(v, p)) < 0) {
                    for (n = o, (b || v).push(p); --n;) {
                        if (b = i[n], (b ? t(b, p) : c(r[n], p)) < 0)continue e;
                    }
                    d.push(p)
                }
            }
            for (; o--;) {
                b = i[o], b && s(b);
            }
            return l(i), l(v), d
        }

        function yt(e, t, r) {
            var n = 0, o = e ? e.length : 0;
            if ("number" != typeof t && null != t) {
                var a = o;
                for (t = g.createCallback(t, r, 3); a-- && t(e[a], a, e);) {
                    n++
                }
            } else if (n = t, null == n || r)return e ? e[o - 1] : p;
            return f(e, Vr(0, o - n))
        }

        function Tt(e, t, r) {
            var n = e ? e.length : 0;
            for ("number" == typeof r && (n = (0 > r ? Vr(0, n + r) : Xr(r, n - 1)) + 1); n--;) {
                if (e[n] === t)return n;
            }
            return -1
        }

        function wt(e) {
            for (var t = arguments, r = 0, n = t.length, o = e ? e.length : 0; ++r < n;) {
                for (var a = -1, i = t[r]; ++a < o;) {
                    e[a] === i && (Ur.call(e, a--, 1), o--);
                }
            }
            return e
        }

        function Et(e, t, r) {
            e = +e || 0, r = "number" == typeof r ? r : +r || 1, null == t && (t = e, e = 0);
            for (var n = -1, o = Vr(0, Pr((t - e) / (r || 1))), a = pr(o); ++n < o;) {
                a[n] = e, e += r;
            }
            return a
        }

        function xt(e, t, r) {
            var n = -1, o = e ? e.length : 0, a = [];
            for (t = g.createCallback(t, r, 3); ++n < o;) {
                var i = e[n];
                t(i, n, e) && (a.push(i), Ur.call(e, n--, 1), o--)
            }
            return a
        }

        function At(e, t, r) {
            if ("number" != typeof t && null != t) {
                var n = 0, o = -1, a = e ? e.length : 0;
                for (t = g.createCallback(t, r, 3); ++o < a && t(e[o], o, e);) {
                    n++
                }
            } else n = null == t || r ? 1 : Vr(0, t);
            return f(e, n)
        }

        function Mt(e, t, r, n) {
            var o = 0, a = e ? e.length : o;
            for (r = r ? g.createCallback(r, n, 1) : Qt, t = r(t); a > o;) {
                var i = o + a >>> 1;
                r(e[i]) < t ? o = i + 1 : a = i
            }
            return o
        }

        function Rt() {
            return oe(ee(arguments, !0, !0))
        }

        function Pt(e, t, r, n) {
            return "boolean" != typeof t && null != t && (n = r, r = "function" != typeof t && n && n[t] === e ? null : t, t = !1), null != r && (r = g.createCallback(r, n, 3)), oe(e, t, r)
        }

        function Lt(e) {
            return Z(e, f(arguments, 1))
        }

        function Dt() {
            for (var e = -1, t = arguments.length; ++e < t;) {
                var r = arguments[e];
                if (Qr(r) || ve(r))var n = n ? oe(Z(n, r).concat(Z(r, n))) : r
            }
            return n || []
        }

        function St() {
            for (var e = arguments.length > 1 ? arguments : arguments[0], t = -1, r = e ? et(pn(e, "length")) : 0, n = pr(0 > r ? 0 : r); ++t < r;) {
                n[t] = pn(e, t);
            }
            return n
        }

        function Ft(e, t) {
            var r = -1, n = e ? e.length : 0, o = {};
            for (t || !n || Qr(e[0]) || (t = []); ++r < n;) {
                var a = e[r];
                t ? o[a] = t[r] : a && (o[a[0]] = a[1])
            }
            return o
        }

        function kt(e, t) {
            if (!Le(t))throw new wr;
            return function () {
                return --e < 1 ? t.apply(this, arguments) : void 0
            }
        }

        function Gt(e, t) {
            return arguments.length > 2 ? ie(e, 17, f(arguments, 2), null, t) : ie(e, 1, null, null, t)
        }

        function It(e) {
            for (var t = arguments.length > 1 ? ee(arguments, !0, !1, 1) : ye(e), r = -1, n = t.length; ++r < n;) {
                var o = t[r];
                e[o] = ie(e[o], 1, null, null, e)
            }
            return e
        }

        function Ut(e, t) {
            return arguments.length > 2 ? ie(t, 19, f(arguments, 2), null, e) : ie(t, 3, null, null, e)
        }

        function Nt() {
            for (var e = arguments, t = e.length; t--;) {
                if (!Le(e[t]))throw new wr;
            }
            return function () {
                for (var t = arguments, r = e.length; r--;) {
                    t = [e[r].apply(this, t)];
                }
                return t[0]
            }
        }

        function Bt(e, t) {
            return t = "number" == typeof t ? t : +t || e.length, ie(e, 4, null, null, null, t)
        }

        function Wt(e, t, r) {
            var n, o, a, i, u, c, l, s = 0, f = !1, v = !0;
            if (!Le(e))throw new wr;
            if (t = Vr(0, t) || 0, r === !0) {
                var g = !0;
                v = !1
            } else De(r) && (g = r.leading, f = "maxWait" in r && (Vr(t, r.maxWait) || 0), v = "trailing" in r ? r.trailing : v);
            var h = function () {
                var r = t - (hn() - i);
                if (0 >= r) {
                    o && Lr(o);
                    var f = l;
                    o = c = l = p, f && (s = hn(), a = e.apply(u, n), c || o || (n = u = null))
                } else c = Ir(h, r)
            }, m = function () {
                c && Lr(c), o = c = l = p, (v || f !== t) && (s = hn(), a = e.apply(u, n), c || o || (n = u = null))
            };
            return function () {
                if (n = arguments, i = hn(), u = this, l = v && (c || !g), f === !1)var r = g && !c; else {
                    o || g || (s = i);
                    var p = f - (i - s), d = 0 >= p;
                    d ? (o && (o = Lr(o)), s = i, a = e.apply(u, n)) : o || (o = Ir(m, p))
                }
                return d && c ? c = Lr(c) : c || t === f || (c = Ir(h, t)), r && (d = !0, a = e.apply(u, n)), !d || c || o || (n = u = null), a
            }
        }

        function Ot(e) {
            if (!Le(e))throw new wr;
            var t = f(arguments, 1);
            return Ir(function () {
                e.apply(p, t)
            }, 1)
        }

        function Ct(e, t) {
            if (!Le(e))throw new wr;
            var r = f(arguments, 2);
            return Ir(function () {
                e.apply(p, r)
            }, t)
        }

        function jt(e, t) {
            if (!Le(e))throw new wr;
            var r = function () {
                var n = r.cache, o = t ? t.apply(this, arguments) : d + arguments[0];
                return kr.call(n, o) ? n[o] : n[o] = e.apply(this, arguments)
            };
            return r.cache = {}, r
        }

        function qt(e) {
            var t, r;
            if (!Le(e))throw new wr;
            return function () {
                return t ? r : (t = !0, r = e.apply(this, arguments), e = null, r)
            }
        }

        function Vt(e) {
            return ie(e, 16, f(arguments, 1))
        }

        function Xt(e) {
            return ie(e, 32, null, f(arguments, 1))
        }

        function zt(e, t, r) {
            var n = !0, o = !0;
            if (!Le(e))throw new wr;
            return r === !1 ? n = !1 : De(r) && (n = "leading" in r ? r.leading : n, o = "trailing" in r ? r.trailing : o), V.leading = n, V.maxWait = t, V.trailing = o, Wt(e, t, V)
        }

        function Ht(e, t) {
            return ie(t, 16, [e])
        }

        function $t(e) {
            return function () {
                return e
            }
        }

        function Yt(e, t, r) {
            var n = typeof e;
            if (null == e || "function" == n)return K(e, t, r);
            if ("object" != n)return tr(e);
            var o = Jr(e), a = o[0], i = e[a];
            return 1 != o.length || i !== i || De(i) ? function (t) {
                for (var r = o.length, n = !1; r-- && (n = te(t[o[r]], e[o[r]], null, !0));) {
                    ;
                }
                return n
            } : function (e) {
                var t = e[a];
                return i === t && (0 !== i || 1 / i == 1 / t)
            }
        }

        function Kt(e) {
            return null == e ? "" : Tr(e).replace(nn, ue)
        }

        function Qt(e) {
            return e
        }

        function Zt(e, t, r) {
            var n = !0, o = t && ye(t);
            t && (r || o.length) || (null == r && (r = t), a = h, t = e, e = g, o = ye(t)), r === !1 ? n = !1 : De(r) && "chain" in r && (n = r.chain);
            var a = e, i = Le(a);
            Ke(o, function (r) {
                var o = e[r] = t[r];
                i && (a.prototype[r] = function () {
                    var t = this.__chain__, r = this.__wrapped__, i = [r];
                    Gr.apply(i, arguments);
                    var u = o.apply(e, i);
                    if (n || t) {
                        if (r === u && De(u))return this;
                        u = new a(u), u.__chain__ = t
                    }
                    return u
                })
            })
        }

        function Jt() {
            return r._ = Ar, this
        }

        function er() {
        }

        function tr(e) {
            return function (t) {
                return t[e]
            }
        }

        function rr(e, t, r) {
            var n = null == e, o = null == t;
            if (null == r && ("boolean" == typeof e && o ? (r = e, e = 1) : o || "boolean" != typeof t || (r = t, o = !0)), n && o && (t = 1), e = +e || 0, o ? (t = e, e = 0) : t = +t || 0, r || e % 1 || t % 1) {
                var a = Hr();
                return Xr(e + a * (t - e + parseFloat("1e-" + ((a + "").length - 1))), t)
            }
            return ne(e, t)
        }

        function nr(e, t) {
            if (e) {
                var r = e[t];
                return Le(r) ? e[t]() : r
            }
        }

        function or(e, t, r) {
            var n = g.templateSettings;
            e = Tr(e || ""), r = an({}, r, n);
            var o, a = an({}, r.imports, n.imports), u = Jr(a), c = qe(a), l = 0, s = r.interpolate || L, f = "__p += '", v = yr((r.escape || L).source + "|" + s.source + "|" + (s === R ? x : L).source + "|" + (r.evaluate || L).source + "|$", "g");
            e.replace(v, function (t, r, n, a, u, c) {
                return n || (n = a), f += e.slice(l, c).replace(S, i), r && (f += "' +\n__e(" + r + ") +\n'"), u && (o = !0, f += "';\n" + u + ";\n__p += '"), n && (f += "' +\n((__t = (" + n + ")) == null ? '' : __t) +\n'"), l = c + t.length, t
            }), f += "';\n";
            var h = r.variable, m = h;
            m || (h = "obj", f = "with (" + h + ") {\n" + f + "\n}\n"), f = (o ? f.replace(T, "") : f).replace(w, "$1").replace(E, "$1;"), f = "function(" + h + ") {\n" + (m ? "" : h + " || (" + h + " = {});\n") + "var __t, __p = '', __e = _.escape" + (o ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + f + "return __p\n}";
            var d = "\n/*\n//# sourceURL=" + (r.sourceURL || "/lodash/template/source[" + k++ + "]") + "\n*/";
            try {
                var _ = mr(u, "return " + f + d).apply(p, c)
            } catch (b) {
                throw b.source = f, b
            }
            return t ? _(t) : (_.source = f, _)
        }

        function ar(e, t, r) {
            e = (e = +e) > -1 ? e : 0;
            var n = -1, o = pr(e);
            for (t = K(t, r, 1); ++n < e;) {
                o[n] = t(n);
            }
            return o
        }

        function ir(e) {
            return null == e ? "" : Tr(e).replace(rn, fe)
        }

        function ur(e) {
            var t = ++m;
            return Tr(null == e ? "" : e) + t
        }

        function cr(e) {
            return e = new h(e), e.__chain__ = !0, e
        }

        function lr(e, t) {
            return t(e), e
        }

        function sr() {
            return this.__chain__ = !0, this
        }

        function fr() {
            return Tr(this.__wrapped__)
        }

        function vr() {
            return this.__wrapped__
        }

        r = r ? J.defaults($.Object(), r, J.pick($, F)) : $;
        var pr = r.Array, gr = r.Boolean, hr = r.Date, mr = r.Function, dr = r.Math, _r = r.Number, br = r.Object, yr = r.RegExp, Tr = r.String, wr = r.TypeError, Er = [], xr = br.prototype, Ar = r._, Mr = xr.toString, Rr = yr("^" + Tr(Mr).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$"), Pr = dr.ceil, Lr = r.clearTimeout, Dr = dr.floor, Sr = mr.prototype.toString, Fr = le(Fr = br.getPrototypeOf) && Fr, kr = xr.hasOwnProperty, Gr = Er.push, Ir = r.setTimeout, Ur = Er.splice, Nr = Er.unshift, Br = function () {
            try {
                var e = {}, t = le(t = br.defineProperty) && t, r = t(e, e, e) && t
            } catch (n) {
            }
            return r
        }(), Wr = le(Wr = br.create) && Wr, Or = le(Or = pr.isArray) && Or, Cr = r.isFinite, jr = r.isNaN, qr = le(qr = br.keys) && qr, Vr = dr.max, Xr = dr.min, zr = r.parseInt, Hr = dr.random, $r = {};
        $r[I] = pr, $r[U] = gr, $r[N] = hr, $r[B] = mr, $r[O] = br, $r[W] = _r, $r[C] = yr, $r[j] = Tr, h.prototype = g.prototype;
        var Yr = g.support = {};
        Yr.funcDecomp = !le(r.WinRTError) && D.test(v), Yr.funcNames = "string" == typeof mr.name, g.templateSettings = {
            escape: /<%-([\s\S]+?)%>/g,
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: R,
            variable: "",
            imports: {_: g}
        }, Wr || (Y = function () {
            function e() {
            }

            return function (t) {
                if (De(t)) {
                    e.prototype = t;
                    var n = new e;
                    e.prototype = null
                }
                return n || r.Object()
            }
        }());
        var Kr = Br ? function (e, t) {
            X.value = t, Br(e, "__bindData__", X)
        } : er, Qr = Or || function (e) {
                return e && "object" == typeof e && "number" == typeof e.length && Mr.call(e) == I || !1
            }, Zr = function (e) {
            var t, r = e, n = [];
            if (!r)return n;
            if (!z[typeof e])return n;
            for (t in r) {
                kr.call(r, t) && n.push(t);
            }
            return n
        }, Jr = qr ? function (e) {
            return De(e) ? qr(e) : []
        } : Zr, en = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }, tn = we(en), rn = yr("(" + Jr(tn).join("|") + ")", "g"), nn = yr("[" + Jr(en).join("") + "]", "g"), on = function (e, t, r) {
            var n, o = e, a = o;
            if (!o)return a;
            var i = arguments, u = 0, c = "number" == typeof r ? 2 : i.length;
            if (c > 3 && "function" == typeof i[c - 2])var l = K(i[--c - 1], i[c--], 2); else c > 2 && "function" == typeof i[c - 1] && (l = i[--c]);
            for (; ++u < c;) {
                if (o = i[u], o && z[typeof o])for (var s = -1, f = z[typeof o] && Jr(o), v = f ? f.length : 0; ++s < v;) {
                    n = f[s], a[n] = l ? l(a[n], o[n]) : o[n];
                }
            }
            return a
        }, an = function (e, t, r) {
            var n, o = e, a = o;
            if (!o)return a;
            for (var i = arguments, u = 0, c = "number" == typeof r ? 2 : i.length; ++u < c;) {
                if (o = i[u], o && z[typeof o])for (var l = -1, s = z[typeof o] && Jr(o), f = s ? s.length : 0; ++l < f;) {
                    n = s[l], "undefined" == typeof a[n] && (a[n] = o[n]);
                }
            }
            return a
        }, un = function (e, t, r) {
            var n, o = e, a = o;
            if (!o)return a;
            if (!z[typeof o])return a;
            t = t && "undefined" == typeof r ? t : K(t, r, 3);
            for (n in o) {
                if (t(o[n], n, e) === !1)return a;
            }
            return a
        }, cn = function (e, t, r) {
            var n, o = e, a = o;
            if (!o)return a;
            if (!z[typeof o])return a;
            t = t && "undefined" == typeof r ? t : K(t, r, 3);
            for (var i = -1, u = z[typeof o] && Jr(o), c = u ? u.length : 0; ++i < c;) {
                if (n = u[i], t(o[n], n, e) === !1)return a;
            }
            return a
        }, ln = Fr ? function (e) {
            if (!e || Mr.call(e) != O)return !1;
            var t = e.valueOf, r = le(t) && (r = Fr(t)) && Fr(r);
            return r ? e == r || Fr(e) == r : se(e)
        } : se, sn = ae(function (e, t, r) {
            kr.call(e, r) ? e[r]++ : e[r] = 1
        }), fn = ae(function (e, t, r) {
            (kr.call(e, r) ? e[r] : e[r] = []).push(t)
        }), vn = ae(function (e, t, r) {
            e[r] = t
        }), pn = Je, gn = He, hn = le(hn = hr.now) && hn || function () {
                return (new hr).getTime()
            }, mn = 8 == zr(y + "08") ? zr : function (e, t) {
            return zr(Ie(e) ? e.replace(P, "") : e, t || 0)
        };
        return g.after = kt, g.assign = on, g.at = Ve, g.bind = Gt, g.bindAll = It, g.bindKey = Ut, g.chain = cr, g.compact = ft, g.compose = Nt, g.constant = $t, g.countBy = sn, g.create = he, g.createCallback = Yt, g.curry = Bt, g.debounce = Wt, g.defaults = an, g.defer = Ot, g.delay = Ct, g.difference = vt, g.filter = He, g.flatten = mt, g.forEach = Ke, g.forEachRight = Qe, g.forIn = un, g.forInRight = _e, g.forOwn = cn, g.forOwnRight = be, g.functions = ye, g.groupBy = fn, g.indexBy = vn, g.initial = _t, g.intersection = bt, g.invert = we, g.invoke = Ze, g.keys = Jr, g.map = Je, g.mapValues = Ne, g.max = et, g.memoize = jt, g.merge = Be, g.min = tt, g.omit = We, g.once = qt, g.pairs = Oe, g.partial = Vt, g.partialRight = Xt, g.pick = Ce, g.pluck = pn, g.property = tr, g.pull = wt, g.range = Et, g.reject = ot, g.remove = xt, g.rest = At, g.shuffle = it, g.sortBy = lt, g.tap = lr, g.throttle = zt, g.times = ar, g.toArray = st, g.transform = je, g.union = Rt, g.uniq = Pt, g.values = qe, g.where = gn, g.without = Lt, g.wrap = Ht, g.xor = Dt, g.zip = St, g.zipObject = Ft, g.collect = Je, g.drop = At, g.each = Ke, g.eachRight = Qe, g.extend = on, g.methods = ye, g.object = Ft, g.select = He, g.tail = At, g.unique = Pt, g.unzip = St, Zt(g), g.clone = pe, g.cloneDeep = ge, g.contains = Xe, g.escape = Kt, g.every = ze, g.find = $e, g.findIndex = pt, g.findKey = me, g.findLast = Ye, g.findLastIndex = gt, g.findLastKey = de, g.has = Te, g.identity = Qt, g.indexOf = dt, g.isArguments = ve, g.isArray = Qr, g.isBoolean = Ee, g.isDate = xe, g.isElement = Ae,g.isEmpty = Me,g.isEqual = Re,g.isFinite = Pe,g.isFunction = Le,g.isNaN = Se,g.isNull = Fe,g.isNumber = ke,g.isObject = De,g.isPlainObject = ln,g.isRegExp = Ge,g.isString = Ie,g.isUndefined = Ue,g.lastIndexOf = Tt,g.mixin = Zt,g.noConflict = Jt,g.noop = er,g.now = hn,g.parseInt = mn,g.random = rr,g.reduce = rt,g.reduceRight = nt,g.result = nr,g.runInContext = v,g.size = ut,g.some = ct,g.sortedIndex = Mt,g.template = or,g.unescape = ir,g.uniqueId = ur,g.all = ze,g.any = ct,g.detect = $e,g.findWhere = $e,g.foldl = rt,g.foldr = nt,g.include = Xe,g.inject = rt,Zt(function () {
            var e = {};
            return cn(g, function (t, r) {
                g.prototype[r] || (e[r] = t)
            }), e
        }(), !1),g.first = ht,g.last = yt,g.sample = at,g.take = ht,g.head = ht,cn(g, function (e, t) {
            var r = "sample" !== t;
            g.prototype[t] || (g.prototype[t] = function (t, n) {
                var o = this.__chain__, a = e(this.__wrapped__, t, n);
                return o || null != t && (!n || r && "function" == typeof t) ? new h(a, o) : a
            })
        }),g.VERSION = "2.4.1",g.prototype.chain = sr,g.prototype.toString = fr,g.prototype.value = vr,g.prototype.valueOf = vr,Ke([
            "join", "pop", "shift"
        ], function (e) {
            var t = Er[e];
            g.prototype[e] = function () {
                var e = this.__chain__, r = t.apply(this.__wrapped__, arguments);
                return e ? new h(r, e) : r
            }
        }),Ke(["push", "reverse", "sort", "unshift"], function (e) {
            var t = Er[e];
            g.prototype[e] = function () {
                return t.apply(this.__wrapped__, arguments), this
            }
        }),Ke(["concat", "slice", "splice"], function (e) {
            var t = Er[e];
            g.prototype[e] = function () {
                return new h(t.apply(this.__wrapped__, arguments), this.__chain__)
            }
        }),g
    }

    var p,
        g = [],
        h = [],
        m = 0,
        d = +new Date + "",
        _ = 75,
        b = 40,
        y = " 	\f \ufeff\n\r\u2028\u2029 ᠎             　",
        T = /\b__p \+= '';/g,
        w = /\b(__p \+=) '' \+/g,
        E = /(__e\(.*?\)|\b__t\)) \+\n'';/g,
        x = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,
        A = /\w*$/,
        M = /^\s*function[ \n\r\t]+\w/,
        R = /<%=([\s\S]+?)%>/g,
        P = RegExp("^[" + y + "]*0+(?=.$)"),
        L = /($^)/,
        D = /\bthis\b/,
        S = /['\n\r\t\u2028\u2029\\]/g,
        F = [
            "Array", "Boolean", "Date", "Function", "Math", "Number", "Object", "RegExp", "String", "_", "attachEvent",
            "clearTimeout", "isFinite", "isNaN", "parseInt", "setTimeout"
        ],
        k = 0,
        G = "[object Arguments]",
        I = "[object Array]",
        U = "[object Boolean]",
        N = "[object Date]",
        B = "[object Function]",
        W = "[object Number]",
        O = "[object Object]",
        C = "[object RegExp]",
        j = "[object String]",
        q = {};
    q[B] = !1;
    q[G] = q[I] = q[U] = q[N] = q[W] = q[O] = q[C] = q[j] = !0;

    var V = {
            leading: !1, maxWait: 0, trailing: !1
        },
        X = {
            configurable: !1,
            enumerable: !1,
            value: null,
            writable: !1
        },
        z = {"boolean": !1, "function": !0, object: !0, number: !1, string: !1, undefined: !1},
        H = {
            "\\": "\\",
            "'": "'",
            "\n": "n",
            "\r": "r",
            "	": "t",
            "\u2028": "u2028",
            "\u2029": "u2029"
        }, $ = z[typeof window] && window || this, Y = z[typeof exports] && exports && !exports.nodeType && exports, K = z[typeof module] && module && !module.nodeType && module, Q = K && K.exports === Y && Y, Z = z[typeof global] && global;
    !Z || Z.global !== Z && Z.window !== Z || ($ = Z);
    var J = v();
    "function" == typeof define && "object" == typeof define.amd && define.amd ? ($._ = J, define(function () {
        return J
    })) : Y && K ? Q ? (K.exports = J)._ = J : Y._ = J : $._ = J
}).call(this),

    function (e) {
        function t(e, t) {
            for (var r = e.length; r--;) {
                if (e[r] === t)return r;
            }
            return -1
        }

        function r(e, t) {
            if (e.length != t.length)return !1;
            for (var r = 0; r < e.length; r++) {
                if (e[r] !== t[r])return !1;
            }
            return !0
        }

        function n(e) {
            for (b in T) {
                T[b] = e[R[b]]
            }
        }

        function o(e) {
            var r, o, a, i, c, l;
            if (r = e.keyCode, -1 == t(M, r) && M.push(r), (93 == r || 224 == r) && (r = 91), r in T) {
                T[r] = !0;
                for (a in E) {
                    E[a] == r && (u[a] = !0)
                }
            } else if (n(e), u.filter.call(this, e) && r in y)for (l = p(), i = 0; i < y[r].length; i++) {
                if (o = y[r][i], o.scope == l || "all" == o.scope) {
                    c = o.mods.length > 0;
                    for (a in T) {
                        (!T[a] && t(o.mods, +a) > -1 || T[a] && -1 == t(o.mods, +a)) && (c = !1);
                    }
                    (0 != o.mods.length || T[16] || T[18] || T[17] || T[91]) && !c || o.method(e, o) === !1 && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, e.stopPropagation && e.stopPropagation(), e.cancelBubble && (e.cancelBubble = !0))
                }
            }
        }

        function a(e) {
            var r, n = e.keyCode, o = t(M, n);
            if (o >= 0 && M.splice(o, 1), (93 == n || 224 == n) && (n = 91), n in T) {
                T[n] = !1;
                for (r in E) {
                    E[r] == n && (u[r] = !1)
                }
            }
        }

        function i() {
            for (b in T) {
                T[b] = !1;
            }
            for (b in E) {
                u[b] = !1
            }
        }

        function u(e, t, r) {
            var n, o;
            n = h(e), void 0 === r && (r = t, t = "all");
            for (var a = 0; a < n.length; a++) {
                o = [], e = n[a].split("+"), e.length > 1 && (o = m(e), e = [e[e.length - 1]]), e = e[0], e = A(e), e in y || (y[e] = []), y[e].push({
                    shortcut: n[a],
                    scope: t,
                    method: r,
                    key: n[a],
                    mods: o
                })
            }
        }

        function c(e, t) {
            var n, o, a, i, u, c = [];
            for (n = h(e), i = 0; i < n.length; i++) {
                if (o = n[i].split("+"), o.length > 1 && (c = m(o), e = o[o.length - 1]), e = A(e), void 0 === t && (t = p()), !y[e])return;
                for (a in y[e]) {
                    u = y[e][a], u.scope === t && r(u.mods, c) && (y[e][a] = {})
                }
            }
        }

        function l(e) {
            return "string" == typeof e && (e = A(e)), -1 != t(M, e)
        }

        function s() {
            return M.slice(0)
        }

        function f(e) {
            var t = (e.target || e.srcElement).tagName;
            return !("INPUT" == t || "SELECT" == t || "TEXTAREA" == t)
        }

        function v(e) {
            w = e || "all"
        }

        function p() {
            return w || "all"
        }

        function g(e) {
            var t, r, n;
            for (t in y) {
                for (r = y[t], n = 0; n < r.length;) {
                    r[n].scope === e ? r.splice(n, 1) : n++
                }
            }
        }

        function h(e) {
            var t;
            return e = e.replace(/\s/g, ""), t = e.split(","), "" == t[t.length - 1] && (t[t.length - 2] += ","), t
        }

        function m(e) {
            for (var t = e.slice(0, e.length - 1), r = 0; r < t.length; r++) {
                t[r] = E[t[r]];
            }
            return t
        }

        function d(e, t, r) {
            e.addEventListener ? e.addEventListener(t, r, !1) : e.attachEvent && e.attachEvent("on" + t, function () {
                r(window.event)
            })
        }

        function _() {
            var t = e.key;
            return e.key = P, t
        }

        var b, y = {}, T = {16: !1, 18: !1, 17: !1, 91: !1}, w = "all", E = {
            "⇧": 16,
            shift: 16,
            "⌥": 18,
            alt: 18,
            option: 18,
            "⌃": 17,
            ctrl: 17,
            control: 17,
            "⌘": 91,
            command: 91
        }, x = {
            backspace: 8,
            tab: 9,
            clear: 12,
            enter: 13,
            "return": 13,
            esc: 27,
            escape: 27,
            space: 32,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            del: 46,
            "delete": 46,
            home: 36,
            end: 35,
            pageup: 33,
            pagedown: 34,
            ",": 188,
            ".": 190,
            "/": 191,
            "`": 192,
            "-": 189,
            "=": 187,
            ";": 186,
            "'": 222,
            "[": 219,
            "]": 221,
            "\\": 220
        }, A = function (e) {
            return x[e] || e.toUpperCase().charCodeAt(0)
        }, M = [];
        for (b = 1; 20 > b; b++) {
            x["f" + b] = 111 + b;
        }
        var R = {16: "shiftKey", 18: "altKey", 17: "ctrlKey", 91: "metaKey"};
        for (b in E) {
            u[b] = !1;
        }
        d(document, "keydown", function (e) {
            o(e)
        }), d(document, "keyup", a), d(window, "focus", i);
        var P = e.key;
        e.key = u,
            e.key.setScope = v,
            e.key.getScope = p,
            e.key.deleteScope = g,
            e.key.filter = f,
            e.key.isPressed = l,
            e.key.getPressedKeyCodes = s,
            e.key.noConflict = _,
            e.key.unbind = c,
        "undefined" != typeof module && (module.exports = key)
    }(this),
    function (e) {
        "use strict";
        var t = {};
        "undefined" == typeof exports ? "function" == typeof define && "object" == typeof define.amd && define.amd ? (t.exports = {},
            define(function () {
                return t.exports
            })) : t.exports = "undefined" != typeof window ? window : e : t.exports = exports, function (e) {
            if (!t)var t = 1e-6;
            if (!r)var r = "undefined" != typeof Float32Array ? Float32Array : Array;
            if (!n)var n = Math.random;
            var o = {};
            o.setMatrixArrayType = function (e) {
                r = e
            }, "undefined" != typeof e && (e.glMatrix = o);
            var a = Math.PI / 180;
            o.toRadian = function (e) {
                return e * a
            };
            var i = {};
            i.create = function () {
                var e = new r(2);
                return e[0] = 0, e[1] = 0, e
            }, i.clone = function (e) {
                var t = new r(2);
                return t[0] = e[0], t[1] = e[1], t
            }, i.fromValues = function (e, t) {
                var n = new r(2);
                return n[0] = e, n[1] = t, n
            }, i.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e
            }, i.set = function (e, t, r) {
                return e[0] = t, e[1] = r, e
            }, i.add = function (e, t, r) {
                return e[0] = t[0] + r[0], e[1] = t[1] + r[1], e
            }, i.subtract = function (e, t, r) {
                return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e
            }, i.sub = i.subtract, i.multiply = function (e, t, r) {
                return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e
            }, i.mul = i.multiply, i.divide = function (e, t, r) {
                return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e
            }, i.div = i.divide, i.min = function (e, t, r) {
                return e[0] = Math.min(t[0], r[0]), e[1] = Math.min(t[1], r[1]), e
            }, i.max = function (e, t, r) {
                return e[0] = Math.max(t[0], r[0]), e[1] = Math.max(t[1], r[1]), e
            }, i.scale = function (e, t, r) {
                return e[0] = t[0] * r, e[1] = t[1] * r, e
            }, i.scaleAndAdd = function (e, t, r, n) {
                return e[0] = t[0] + r[0] * n, e[1] = t[1] + r[1] * n, e
            }, i.distance = function (e, t) {
                var r = t[0] - e[0], n = t[1] - e[1];
                return Math.sqrt(r * r + n * n)
            }, i.dist = i.distance, i.squaredDistance = function (e, t) {
                var r = t[0] - e[0], n = t[1] - e[1];
                return r * r + n * n
            }, i.sqrDist = i.squaredDistance, i.length = function (e) {
                var t = e[0], r = e[1];
                return Math.sqrt(t * t + r * r)
            }, i.len = i.length, i.squaredLength = function (e) {
                var t = e[0], r = e[1];
                return t * t + r * r
            }, i.sqrLen = i.squaredLength, i.negate = function (e, t) {
                return e[0] = -t[0], e[1] = -t[1], e
            }, i.inverse = function (e, t) {
                return e[0] = 1 / t[0], e[1] = 1 / t[1], e
            }, i.normalize = function (e, t) {
                var r = t[0], n = t[1], o = r * r + n * n;
                return o > 0 && (o = 1 / Math.sqrt(o), e[0] = t[0] * o, e[1] = t[1] * o), e
            }, i.dot = function (e, t) {
                return e[0] * t[0] + e[1] * t[1]
            }, i.cross = function (e, t, r) {
                var n = t[0] * r[1] - t[1] * r[0];
                return e[0] = e[1] = 0, e[2] = n, e
            }, i.lerp = function (e, t, r, n) {
                var o = t[0], a = t[1];
                return e[0] = o + n * (r[0] - o), e[1] = a + n * (r[1] - a), e
            }, i.random = function (e, t) {
                t = t || 1;
                var r = 2 * n() * Math.PI;
                return e[0] = Math.cos(r) * t, e[1] = Math.sin(r) * t, e
            }, i.transformMat2 = function (e, t, r) {
                var n = t[0], o = t[1];
                return e[0] = r[0] * n + r[2] * o, e[1] = r[1] * n + r[3] * o, e
            }, i.transformMat2d = function (e, t, r) {
                var n = t[0], o = t[1];
                return e[0] = r[0] * n + r[2] * o + r[4], e[1] = r[1] * n + r[3] * o + r[5], e
            }, i.transformMat3 = function (e, t, r) {
                var n = t[0], o = t[1];
                return e[0] = r[0] * n + r[3] * o + r[6], e[1] = r[1] * n + r[4] * o + r[7], e
            }, i.transformMat4 = function (e, t, r) {
                var n = t[0], o = t[1];
                return e[0] = r[0] * n + r[4] * o + r[12], e[1] = r[1] * n + r[5] * o + r[13], e
            }, i.forEach = function () {
                var e = i.create();
                return function (t, r, n, o, a, i) {
                    var u, c;
                    for (r || (r = 2), n || (n = 0), c = o ? Math.min(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                        e[0] = t[u], e[1] = t[u + 1], a(e, e, i), t[u] = e[0], t[u + 1] = e[1];
                    }
                    return t
                }
            }(), i.str = function (e) {
                return "vec2(" + e[0] + ", " + e[1] + ")"
            }, "undefined" != typeof e && (e.vec2 = i);
            var u = {};
            u.create = function () {
                var e = new r(3);
                return e[0] = 0, e[1] = 0, e[2] = 0, e
            }, u.clone = function (e) {
                var t = new r(3);
                return t[0] = e[0], t[1] = e[1], t[2] = e[2], t
            }, u.fromValues = function (e, t, n) {
                var o = new r(3);
                return o[0] = e, o[1] = t, o[2] = n, o
            }, u.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e
            }, u.set = function (e, t, r, n) {
                return e[0] = t, e[1] = r, e[2] = n, e
            }, u.add = function (e, t, r) {
                return e[0] = t[0] + r[0], e[1] = t[1] + r[1], e[2] = t[2] + r[2], e
            }, u.subtract = function (e, t, r) {
                return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e[2] = t[2] - r[2], e
            }, u.sub = u.subtract, u.multiply = function (e, t, r) {
                return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e
            }, u.mul = u.multiply, u.divide = function (e, t, r) {
                return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e[2] = t[2] / r[2], e
            }, u.div = u.divide, u.min = function (e, t, r) {
                return e[0] = Math.min(t[0], r[0]), e[1] = Math.min(t[1], r[1]), e[2] = Math.min(t[2], r[2]), e
            }, u.max = function (e, t, r) {
                return e[0] = Math.max(t[0], r[0]), e[1] = Math.max(t[1], r[1]), e[2] = Math.max(t[2], r[2]), e
            }, u.scale = function (e, t, r) {
                return e[0] = t[0] * r, e[1] = t[1] * r, e[2] = t[2] * r, e
            }, u.scaleAndAdd = function (e, t, r, n) {
                return e[0] = t[0] + r[0] * n, e[1] = t[1] + r[1] * n, e[2] = t[2] + r[2] * n, e
            }, u.distance = function (e, t) {
                var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2];
                return Math.sqrt(r * r + n * n + o * o)
            }, u.dist = u.distance, u.squaredDistance = function (e, t) {
                var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2];
                return r * r + n * n + o * o
            }, u.sqrDist = u.squaredDistance, u.length = function (e) {
                var t = e[0], r = e[1], n = e[2];
                return Math.sqrt(t * t + r * r + n * n)
            }, u.len = u.length, u.squaredLength = function (e) {
                var t = e[0], r = e[1], n = e[2];
                return t * t + r * r + n * n
            }, u.sqrLen = u.squaredLength, u.negate = function (e, t) {
                return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e
            }, u.inverse = function (e, t) {
                return e[0] = 1 / t[0], e[1] = 1 / t[1], e[2] = 1 / t[2], e
            }, u.normalize = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = r * r + n * n + o * o;
                return a > 0 && (a = 1 / Math.sqrt(a), e[0] = t[0] * a, e[1] = t[1] * a, e[2] = t[2] * a), e
            }, u.dot = function (e, t) {
                return e[0] * t[0] + e[1] * t[1] + e[2] * t[2]
            }, u.cross = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = r[0], u = r[1], c = r[2];
                return e[0] = o * c - a * u, e[1] = a * i - n * c, e[2] = n * u - o * i, e
            }, u.lerp = function (e, t, r, n) {
                var o = t[0], a = t[1], i = t[2];
                return e[0] = o + n * (r[0] - o), e[1] = a + n * (r[1] - a), e[2] = i + n * (r[2] - i), e
            }, u.random = function (e, t) {
                t = t || 1;
                var r = 2 * n() * Math.PI, o = 2 * n() - 1, a = Math.sqrt(1 - o * o) * t;
                return e[0] = Math.cos(r) * a, e[1] = Math.sin(r) * a, e[2] = o * t, e
            }, u.transformMat4 = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = r[3] * n + r[7] * o + r[11] * a + r[15];
                return i = i || 1, e[0] = (r[0] * n + r[4] * o + r[8] * a + r[12]) / i, e[1] = (r[1] * n + r[5] * o + r[9] * a + r[13]) / i, e[2] = (r[2] * n + r[6] * o + r[10] * a + r[14]) / i, e
            }, u.transformMat3 = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2];
                return e[0] = n * r[0] + o * r[3] + a * r[6], e[1] = n * r[1] + o * r[4] + a * r[7], e[2] = n * r[2] + o * r[5] + a * r[8], e
            }, u.transformQuat = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = r[0], u = r[1], c = r[2], l = r[3], s = l * n + u * a - c * o, f = l * o + c * n - i * a, v = l * a + i * o - u * n, p = -i * n - u * o - c * a;
                return e[0] = s * l + p * -i + f * -c - v * -u, e[1] = f * l + p * -u + v * -i - s * -c, e[2] = v * l + p * -c + s * -u - f * -i, e
            }, u.rotateX = function (e, t, r, n) {
                var o = [], a = [];
                return o[0] = t[0] - r[0], o[1] = t[1] - r[1], o[2] = t[2] - r[2], a[0] = o[0], a[1] = o[1] * Math.cos(n) - o[2] * Math.sin(n), a[2] = o[1] * Math.sin(n) + o[2] * Math.cos(n), e[0] = a[0] + r[0], e[1] = a[1] + r[1], e[2] = a[2] + r[2], e
            }, u.rotateY = function (e, t, r, n) {
                var o = [], a = [];
                return o[0] = t[0] - r[0], o[1] = t[1] - r[1], o[2] = t[2] - r[2], a[0] = o[2] * Math.sin(n) + o[0] * Math.cos(n), a[1] = o[1], a[2] = o[2] * Math.cos(n) - o[0] * Math.sin(n), e[0] = a[0] + r[0], e[1] = a[1] + r[1], e[2] = a[2] + r[2], e
            }, u.rotateZ = function (e, t, r, n) {
                var o = [], a = [];
                return o[0] = t[0] - r[0], o[1] = t[1] - r[1], o[2] = t[2] - r[2], a[0] = o[0] * Math.cos(n) - o[1] * Math.sin(n), a[1] = o[0] * Math.sin(n) + o[1] * Math.cos(n), a[2] = o[2], e[0] = a[0] + r[0], e[1] = a[1] + r[1], e[2] = a[2] + r[2], e
            }, u.forEach = function () {
                var e = u.create();
                return function (t, r, n, o, a, i) {
                    var u, c;
                    for (r || (r = 3), n || (n = 0), c = o ? Math.min(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                        e[0] = t[u], e[1] = t[u + 1], e[2] = t[u + 2], a(e, e, i), t[u] = e[0], t[u + 1] = e[1], t[u + 2] = e[2];
                    }
                    return t
                }
            }(), u.str = function (e) {
                return "vec3(" + e[0] + ", " + e[1] + ", " + e[2] + ")"
            }, "undefined" != typeof e && (e.vec3 = u);
            var c = {};
            c.create = function () {
                var e = new r(4);
                return e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0, e
            }, c.clone = function (e) {
                var t = new r(4);
                return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t
            }, c.fromValues = function (e, t, n, o) {
                var a = new r(4);
                return a[0] = e, a[1] = t, a[2] = n, a[3] = o, a
            }, c.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e
            }, c.set = function (e, t, r, n, o) {
                return e[0] = t, e[1] = r, e[2] = n, e[3] = o, e
            }, c.add = function (e, t, r) {
                return e[0] = t[0] + r[0], e[1] = t[1] + r[1], e[2] = t[2] + r[2], e[3] = t[3] + r[3], e
            }, c.subtract = function (e, t, r) {
                return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e[2] = t[2] - r[2], e[3] = t[3] - r[3], e
            }, c.sub = c.subtract, c.multiply = function (e, t, r) {
                return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e[3] = t[3] * r[3], e
            }, c.mul = c.multiply, c.divide = function (e, t, r) {
                return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e[2] = t[2] / r[2], e[3] = t[3] / r[3], e
            }, c.div = c.divide, c.min = function (e, t, r) {
                return e[0] = Math.min(t[0], r[0]), e[1] = Math.min(t[1], r[1]), e[2] = Math.min(t[2], r[2]), e[3] = Math.min(t[3], r[3]), e
            }, c.max = function (e, t, r) {
                return e[0] = Math.max(t[0], r[0]), e[1] = Math.max(t[1], r[1]), e[2] = Math.max(t[2], r[2]), e[3] = Math.max(t[3], r[3]), e
            }, c.scale = function (e, t, r) {
                return e[0] = t[0] * r, e[1] = t[1] * r, e[2] = t[2] * r, e[3] = t[3] * r, e
            }, c.scaleAndAdd = function (e, t, r, n) {
                return e[0] = t[0] + r[0] * n, e[1] = t[1] + r[1] * n, e[2] = t[2] + r[2] * n, e[3] = t[3] + r[3] * n, e
            }, c.distance = function (e, t) {
                var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2], a = t[3] - e[3];
                return Math.sqrt(r * r + n * n + o * o + a * a)
            }, c.dist = c.distance, c.squaredDistance = function (e, t) {
                var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2], a = t[3] - e[3];
                return r * r + n * n + o * o + a * a
            }, c.sqrDist = c.squaredDistance, c.length = function (e) {
                var t = e[0], r = e[1], n = e[2], o = e[3];
                return Math.sqrt(t * t + r * r + n * n + o * o)
            }, c.len = c.length, c.squaredLength = function (e) {
                var t = e[0], r = e[1], n = e[2], o = e[3];
                return t * t + r * r + n * n + o * o
            }, c.sqrLen = c.squaredLength, c.negate = function (e, t) {
                return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e[3] = -t[3], e
            }, c.inverse = function (e, t) {
                return e[0] = 1 / t[0], e[1] = 1 / t[1], e[2] = 1 / t[2], e[3] = 1 / t[3], e
            }, c.normalize = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = r * r + n * n + o * o + a * a;
                return i > 0 && (i = 1 / Math.sqrt(i), e[0] = t[0] * i, e[1] = t[1] * i, e[2] = t[2] * i, e[3] = t[3] * i), e
            }, c.dot = function (e, t) {
                return e[0] * t[0] + e[1] * t[1] + e[2] * t[2] + e[3] * t[3]
            }, c.lerp = function (e, t, r, n) {
                var o = t[0], a = t[1], i = t[2], u = t[3];
                return e[0] = o + n * (r[0] - o), e[1] = a + n * (r[1] - a), e[2] = i + n * (r[2] - i), e[3] = u + n * (r[3] - u), e
            }, c.random = function (e, t) {
                return t = t || 1, e[0] = n(), e[1] = n(), e[2] = n(), e[3] = n(), c.normalize(e, e), c.scale(e, e, t), e
            }, c.transformMat4 = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3];
                return e[0] = r[0] * n + r[4] * o + r[8] * a + r[12] * i, e[1] = r[1] * n + r[5] * o + r[9] * a + r[13] * i, e[2] = r[2] * n + r[6] * o + r[10] * a + r[14] * i, e[3] = r[3] * n + r[7] * o + r[11] * a + r[15] * i, e
            }, c.transformQuat = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = r[0], u = r[1], c = r[2], l = r[3], s = l * n + u * a - c * o, f = l * o + c * n - i * a, v = l * a + i * o - u * n, p = -i * n - u * o - c * a;
                return e[0] = s * l + p * -i + f * -c - v * -u, e[1] = f * l + p * -u + v * -i - s * -c, e[2] = v * l + p * -c + s * -u - f * -i, e
            }, c.forEach = function () {
                var e = c.create();
                return function (t, r, n, o, a, i) {
                    var u, c;
                    for (r || (r = 4), n || (n = 0), c = o ? Math.min(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                        e[0] = t[u], e[1] = t[u + 1], e[2] = t[u + 2], e[3] = t[u + 3], a(e, e, i), t[u] = e[0], t[u + 1] = e[1], t[u + 2] = e[2], t[u + 3] = e[3];
                    }
                    return t
                }
            }(), c.str = function (e) {
                return "vec4(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ")"
            }, "undefined" != typeof e && (e.vec4 = c);
            var l = {};
            l.create = function () {
                var e = new r(4);
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e
            }, l.clone = function (e) {
                var t = new r(4);
                return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t
            }, l.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e
            }, l.identity = function (e) {
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e
            }, l.transpose = function (e, t) {
                if (e === t) {
                    var r = t[1];
                    e[1] = t[2], e[2] = r
                } else e[0] = t[0], e[1] = t[2], e[2] = t[1], e[3] = t[3];
                return e
            }, l.invert = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = r * a - o * n;
                return i ? (i = 1 / i, e[0] = a * i, e[1] = -n * i, e[2] = -o * i, e[3] = r * i, e) : null
            }, l.adjoint = function (e, t) {
                var r = t[0];
                return e[0] = t[3], e[1] = -t[1], e[2] = -t[2], e[3] = r, e
            }, l.determinant = function (e) {
                return e[0] * e[3] - e[2] * e[1]
            }, l.multiply = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = r[0], c = r[1], l = r[2], s = r[3];
                return e[0] = n * u + a * c, e[1] = o * u + i * c, e[2] = n * l + a * s, e[3] = o * l + i * s, e
            }, l.mul = l.multiply, l.rotate = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = Math.sin(r), c = Math.cos(r);
                return e[0] = n * c + a * u, e[1] = o * c + i * u, e[2] = n * -u + a * c, e[3] = o * -u + i * c, e
            }, l.scale = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = r[0], c = r[1];
                return e[0] = n * u, e[1] = o * u, e[2] = a * c, e[3] = i * c, e
            }, l.str = function (e) {
                return "mat2(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ")"
            }, l.frob = function (e) {
                return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2) + Math.pow(e[3], 2))
            }, l.LDU = function (e, t, r, n) {
                return e[2] = n[2] / n[0], r[0] = n[0], r[1] = n[1], r[3] = n[3] - e[2] * r[1], [e, t, r]
            }, "undefined" != typeof e && (e.mat2 = l);
            var s = {};
            s.create = function () {
                var e = new r(6);
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e[4] = 0, e[5] = 0, e
            }, s.clone = function (e) {
                var t = new r(6);
                return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t
            }, s.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e
            }, s.identity = function (e) {
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e[4] = 0, e[5] = 0, e
            }, s.invert = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = r * a - n * o;
                return c ? (c = 1 / c, e[0] = a * c, e[1] = -n * c, e[2] = -o * c, e[3] = r * c, e[4] = (o * u - a * i) * c, e[5] = (n * i - r * u) * c, e) : null
            }, s.determinant = function (e) {
                return e[0] * e[3] - e[1] * e[2]
            }, s.multiply = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = r[0], s = r[1], f = r[2], v = r[3], p = r[4], g = r[5];
                return e[0] = n * l + a * s, e[1] = o * l + i * s, e[2] = n * f + a * v, e[3] = o * f + i * v, e[4] = n * p + a * g + u, e[5] = o * p + i * g + c, e
            }, s.mul = s.multiply, s.rotate = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = Math.sin(r), s = Math.cos(r);
                return e[0] = n * s + a * l, e[1] = o * s + i * l, e[2] = n * -l + a * s, e[3] = o * -l + i * s, e[4] = u, e[5] = c, e
            }, s.scale = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = r[0], s = r[1];
                return e[0] = n * l, e[1] = o * l, e[2] = a * s, e[3] = i * s, e[4] = u, e[5] = c, e
            }, s.translate = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = r[0], s = r[1];
                return e[0] = n, e[1] = o, e[2] = a, e[3] = i, e[4] = n * l + a * s + u, e[5] = o * l + i * s + c, e
            }, s.str = function (e) {
                return "mat2d(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ")"
            }, s.frob = function (e) {
                return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2) + Math.pow(e[3], 2) + Math.pow(e[4], 2) + Math.pow(e[5], 2) + 1)
            }, "undefined" != typeof e && (e.mat2d = s);
            var f = {};
            f.create = function () {
                var e = new r(9);
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 1, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 1, e
            }, f.fromMat4 = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[4], e[4] = t[5], e[5] = t[6], e[6] = t[8], e[7] = t[9], e[8] = t[10], e
            }, f.clone = function (e) {
                var t = new r(9);
                return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t[6] = e[6], t[7] = e[7], t[8] = e[8], t
            }, f.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[8] = t[8], e
            }, f.identity = function (e) {
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 1, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 1, e
            }, f.transpose = function (e, t) {
                if (e === t) {
                    var r = t[1], n = t[2], o = t[5];
                    e[1] = t[3], e[2] = t[6], e[3] = r, e[5] = t[7], e[6] = n, e[7] = o
                } else e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8];
                return e
            }, f.invert = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = s * i - u * l, v = -s * a + u * c, p = l * a - i * c, g = r * f + n * v + o * p;
                return g ? (g = 1 / g, e[0] = f * g, e[1] = (-s * n + o * l) * g, e[2] = (u * n - o * i) * g, e[3] = v * g, e[4] = (s * r - o * c) * g, e[5] = (-u * r + o * a) * g, e[6] = p * g, e[7] = (-l * r + n * c) * g, e[8] = (i * r - n * a) * g, e) : null
            }, f.adjoint = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8];
                return e[0] = i * s - u * l, e[1] = o * l - n * s, e[2] = n * u - o * i, e[3] = u * c - a * s, e[4] = r * s - o * c, e[5] = o * a - r * u, e[6] = a * l - i * c, e[7] = n * c - r * l, e[8] = r * i - n * a, e
            }, f.determinant = function (e) {
                var t = e[0], r = e[1], n = e[2], o = e[3], a = e[4], i = e[5], u = e[6], c = e[7], l = e[8];
                return t * (l * a - i * c) + r * (-l * o + i * u) + n * (c * o - a * u)
            }, f.multiply = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = r[0], p = r[1], g = r[2], h = r[3], m = r[4], d = r[5], _ = r[6], b = r[7], y = r[8];
                return e[0] = v * n + p * i + g * l, e[1] = v * o + p * u + g * s, e[2] = v * a + p * c + g * f, e[3] = h * n + m * i + d * l, e[4] = h * o + m * u + d * s, e[5] = h * a + m * c + d * f, e[6] = _ * n + b * i + y * l, e[7] = _ * o + b * u + y * s, e[8] = _ * a + b * c + y * f, e
            }, f.mul = f.multiply, f.translate = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = r[0], p = r[1];
                return e[0] = n, e[1] = o, e[2] = a, e[3] = i, e[4] = u, e[5] = c, e[6] = v * n + p * i + l, e[7] = v * o + p * u + s, e[8] = v * a + p * c + f, e
            }, f.rotate = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = Math.sin(r), p = Math.cos(r);
                return e[0] = p * n + v * i, e[1] = p * o + v * u, e[2] = p * a + v * c, e[3] = p * i - v * n, e[4] = p * u - v * o, e[5] = p * c - v * a, e[6] = l, e[7] = s, e[8] = f, e
            }, f.scale = function (e, t, r) {
                var n = r[0], o = r[1];
                return e[0] = n * t[0], e[1] = n * t[1], e[2] = n * t[2], e[3] = o * t[3], e[4] = o * t[4], e[5] = o * t[5], e[6] = t[6], e[7] = t[7], e[8] = t[8], e
            }, f.fromMat2d = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = 0, e[3] = t[2], e[4] = t[3], e[5] = 0, e[6] = t[4], e[7] = t[5], e[8] = 1, e
            }, f.fromQuat = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = r + r, u = n + n, c = o + o, l = r * i, s = n * i, f = n * u, v = o * i, p = o * u, g = o * c, h = a * i, m = a * u, d = a * c;
                return e[0] = 1 - f - g, e[3] = s - d, e[6] = v + m, e[1] = s + d, e[4] = 1 - l - g, e[7] = p - h, e[2] = v - m, e[5] = p + h, e[8] = 1 - l - f, e
            }, f.normalFromMat4 = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = t[9], v = t[10], p = t[11], g = t[12], h = t[13], m = t[14], d = t[15], _ = r * u - n * i, b = r * c - o * i, y = r * l - a * i, T = n * c - o * u, w = n * l - a * u, E = o * l - a * c, x = s * h - f * g, A = s * m - v * g, M = s * d - p * g, R = f * m - v * h, P = f * d - p * h, L = v * d - p * m, D = _ * L - b * P + y * R + T * M - w * A + E * x;
                return D ? (D = 1 / D, e[0] = (u * L - c * P + l * R) * D, e[1] = (c * M - i * L - l * A) * D, e[2] = (i * P - u * M + l * x) * D, e[3] = (o * P - n * L - a * R) * D, e[4] = (r * L - o * M + a * A) * D, e[5] = (n * M - r * P - a * x) * D, e[6] = (h * E - m * w + d * T) * D, e[7] = (m * y - g * E - d * b) * D, e[8] = (g * w - h * y + d * _) * D, e) : null
            }, f.str = function (e) {
                return "mat3(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ", " + e[6] + ", " + e[7] + ", " + e[8] + ")"
            }, f.frob = function (e) {
                return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2) + Math.pow(e[3], 2) + Math.pow(e[4], 2) + Math.pow(e[5], 2) + Math.pow(e[6], 2) + Math.pow(e[7], 2) + Math.pow(e[8], 2))
            }, "undefined" != typeof e && (e.mat3 = f);
            var v = {};
            v.create = function () {
                var e = new r(16);
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
            }, v.clone = function (e) {
                var t = new r(16);
                return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t[6] = e[6], t[7] = e[7], t[8] = e[8], t[9] = e[9], t[10] = e[10], t[11] = e[11], t[12] = e[12], t[13] = e[13], t[14] = e[14], t[15] = e[15], t
            }, v.copy = function (e, t) {
                return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[8] = t[8], e[9] = t[9], e[10] = t[10], e[11] = t[11], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15], e
            }, v.identity = function (e) {
                return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
            }, v.transpose = function (e, t) {
                if (e === t) {
                    var r = t[1], n = t[2], o = t[3], a = t[6], i = t[7], u = t[11];
                    e[1] = t[4], e[2] = t[8], e[3] = t[12], e[4] = r, e[6] = t[9], e[7] = t[13], e[8] = n, e[9] = a, e[11] = t[14], e[12] = o, e[13] = i, e[14] = u
                } else e[0] = t[0], e[1] = t[4], e[2] = t[8], e[3] = t[12], e[4] = t[1], e[5] = t[5], e[6] = t[9], e[7] = t[13], e[8] = t[2], e[9] = t[6], e[10] = t[10], e[11] = t[14], e[12] = t[3], e[13] = t[7], e[14] = t[11], e[15] = t[15];
                return e
            }, v.invert = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = t[9], v = t[10], p = t[11], g = t[12], h = t[13], m = t[14], d = t[15], _ = r * u - n * i, b = r * c - o * i, y = r * l - a * i, T = n * c - o * u, w = n * l - a * u, E = o * l - a * c, x = s * h - f * g, A = s * m - v * g, M = s * d - p * g, R = f * m - v * h, P = f * d - p * h, L = v * d - p * m, D = _ * L - b * P + y * R + T * M - w * A + E * x;
                return D ? (D = 1 / D, e[0] = (u * L - c * P + l * R) * D, e[1] = (o * P - n * L - a * R) * D, e[2] = (h * E - m * w + d * T) * D, e[3] = (v * w - f * E - p * T) * D, e[4] = (c * M - i * L - l * A) * D, e[5] = (r * L - o * M + a * A) * D, e[6] = (m * y - g * E - d * b) * D, e[7] = (s * E - v * y + p * b) * D, e[8] = (i * P - u * M + l * x) * D, e[9] = (n * M - r * P - a * x) * D, e[10] = (g * w - h * y + d * _) * D, e[11] = (f * y - s * w - p * _) * D, e[12] = (u * A - i * R - c * x) * D, e[13] = (r * R - n * A + o * x) * D, e[14] = (h * b - g * T - m * _) * D, e[15] = (s * T - f * b + v * _) * D, e) : null
            }, v.adjoint = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = t[9], v = t[10], p = t[11], g = t[12], h = t[13], m = t[14], d = t[15];
                return e[0] = u * (v * d - p * m) - f * (c * d - l * m) + h * (c * p - l * v), e[1] = -(n * (v * d - p * m) - f * (o * d - a * m) + h * (o * p - a * v)), e[2] = n * (c * d - l * m) - u * (o * d - a * m) + h * (o * l - a * c), e[3] = -(n * (c * p - l * v) - u * (o * p - a * v) + f * (o * l - a * c)), e[4] = -(i * (v * d - p * m) - s * (c * d - l * m) + g * (c * p - l * v)), e[5] = r * (v * d - p * m) - s * (o * d - a * m) + g * (o * p - a * v), e[6] = -(r * (c * d - l * m) - i * (o * d - a * m) + g * (o * l - a * c)), e[7] = r * (c * p - l * v) - i * (o * p - a * v) + s * (o * l - a * c), e[8] = i * (f * d - p * h) - s * (u * d - l * h) + g * (u * p - l * f), e[9] = -(r * (f * d - p * h) - s * (n * d - a * h) + g * (n * p - a * f)), e[10] = r * (u * d - l * h) - i * (n * d - a * h) + g * (n * l - a * u), e[11] = -(r * (u * p - l * f) - i * (n * p - a * f) + s * (n * l - a * u)), e[12] = -(i * (f * m - v * h) - s * (u * m - c * h) + g * (u * v - c * f)), e[13] = r * (f * m - v * h) - s * (n * m - o * h) + g * (n * v - o * f), e[14] = -(r * (u * m - c * h) - i * (n * m - o * h) + g * (n * c - o * u)), e[15] = r * (u * v - c * f) - i * (n * v - o * f) + s * (n * c - o * u), e
            }, v.determinant = function (e) {
                var t = e[0], r = e[1], n = e[2], o = e[3], a = e[4], i = e[5], u = e[6], c = e[7], l = e[8], s = e[9], f = e[10], v = e[11], p = e[12], g = e[13], h = e[14], m = e[15], d = t * i - r * a, _ = t * u - n * a, b = t * c - o * a, y = r * u - n * i, T = r * c - o * i, w = n * c - o * u, E = l * g - s * p, x = l * h - f * p, A = l * m - v * p, M = s * h - f * g, R = s * m - v * g, P = f * m - v * h;
                return d * P - _ * R + b * M + y * A - T * x + w * E
            }, v.multiply = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = t[9], p = t[10], g = t[11], h = t[12], m = t[13], d = t[14], _ = t[15], b = r[0], y = r[1], T = r[2], w = r[3];
                return e[0] = b * n + y * u + T * f + w * h, e[1] = b * o + y * c + T * v + w * m, e[2] = b * a + y * l + T * p + w * d, e[3] = b * i + y * s + T * g + w * _, b = r[4], y = r[5], T = r[6], w = r[7], e[4] = b * n + y * u + T * f + w * h, e[5] = b * o + y * c + T * v + w * m, e[6] = b * a + y * l + T * p + w * d, e[7] = b * i + y * s + T * g + w * _, b = r[8], y = r[9], T = r[10], w = r[11], e[8] = b * n + y * u + T * f + w * h, e[9] = b * o + y * c + T * v + w * m, e[10] = b * a + y * l + T * p + w * d, e[11] = b * i + y * s + T * g + w * _, b = r[12], y = r[13], T = r[14], w = r[15], e[12] = b * n + y * u + T * f + w * h, e[13] = b * o + y * c + T * v + w * m, e[14] = b * a + y * l + T * p + w * d, e[15] = b * i + y * s + T * g + w * _, e
            }, v.mul = v.multiply, v.translate = function (e, t, r) {
                var n, o, a, i, u, c, l, s, f, v, p, g, h = r[0], m = r[1], d = r[2];
                return t === e ? (e[12] = t[0] * h + t[4] * m + t[8] * d + t[12], e[13] = t[1] * h + t[5] * m + t[9] * d + t[13], e[14] = t[2] * h + t[6] * m + t[10] * d + t[14], e[15] = t[3] * h + t[7] * m + t[11] * d + t[15]) : (n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = t[9], p = t[10], g = t[11], e[0] = n, e[1] = o, e[2] = a, e[3] = i, e[4] = u, e[5] = c, e[6] = l, e[7] = s, e[8] = f, e[9] = v, e[10] = p, e[11] = g, e[12] = n * h + u * m + f * d + t[12], e[13] = o * h + c * m + v * d + t[13], e[14] = a * h + l * m + p * d + t[14], e[15] = i * h + s * m + g * d + t[15]), e
            }, v.scale = function (e, t, r) {
                var n = r[0], o = r[1], a = r[2];
                return e[0] = t[0] * n, e[1] = t[1] * n, e[2] = t[2] * n, e[3] = t[3] * n, e[4] = t[4] * o, e[5] = t[5] * o, e[6] = t[6] * o, e[7] = t[7] * o, e[8] = t[8] * a, e[9] = t[9] * a, e[10] = t[10] * a, e[11] = t[11] * a, e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15], e
            }, v.rotate = function (e, r, n, o) {
                var a, i, u, c, l, s, f, v, p, g, h, m, d, _, b, y, T, w, E, x, A, M, R, P, L = o[0], D = o[1], S = o[2], F = Math.sqrt(L * L + D * D + S * S);
                return Math.abs(F) < t ? null : (F = 1 / F, L *= F, D *= F, S *= F, a = Math.sin(n), i = Math.cos(n), u = 1 - i, c = r[0], l = r[1], s = r[2], f = r[3], v = r[4], p = r[5], g = r[6], h = r[7], m = r[8], d = r[9], _ = r[10], b = r[11], y = L * L * u + i, T = D * L * u + S * a, w = S * L * u - D * a, E = L * D * u - S * a, x = D * D * u + i, A = S * D * u + L * a, M = L * S * u + D * a, R = D * S * u - L * a, P = S * S * u + i, e[0] = c * y + v * T + m * w, e[1] = l * y + p * T + d * w, e[2] = s * y + g * T + _ * w, e[3] = f * y + h * T + b * w, e[4] = c * E + v * x + m * A, e[5] = l * E + p * x + d * A, e[6] = s * E + g * x + _ * A, e[7] = f * E + h * x + b * A, e[8] = c * M + v * R + m * P, e[9] = l * M + p * R + d * P, e[10] = s * M + g * R + _ * P, e[11] = f * M + h * R + b * P, r !== e && (e[12] = r[12], e[13] = r[13], e[14] = r[14], e[15] = r[15]), e)
            }, v.rotateX = function (e, t, r) {
                var n = Math.sin(r), o = Math.cos(r), a = t[4], i = t[5], u = t[6], c = t[7], l = t[8], s = t[9], f = t[10], v = t[11];
                return t !== e && (e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[4] = a * o + l * n, e[5] = i * o + s * n, e[6] = u * o + f * n, e[7] = c * o + v * n, e[8] = l * o - a * n, e[9] = s * o - i * n, e[10] = f * o - u * n, e[11] = v * o - c * n, e
            }, v.rotateY = function (e, t, r) {
                var n = Math.sin(r), o = Math.cos(r), a = t[0], i = t[1], u = t[2], c = t[3], l = t[8], s = t[9], f = t[10], v = t[11];
                return t !== e && (e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[0] = a * o - l * n, e[1] = i * o - s * n, e[2] = u * o - f * n, e[3] = c * o - v * n, e[8] = a * n + l * o, e[9] = i * n + s * o, e[10] = u * n + f * o, e[11] = c * n + v * o, e
            }, v.rotateZ = function (e, t, r) {
                var n = Math.sin(r), o = Math.cos(r), a = t[0], i = t[1], u = t[2], c = t[3], l = t[4], s = t[5], f = t[6], v = t[7];
                return t !== e && (e[8] = t[8], e[9] = t[9], e[10] = t[10], e[11] = t[11], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[0] = a * o + l * n, e[1] = i * o + s * n, e[2] = u * o + f * n, e[3] = c * o + v * n, e[4] = l * o - a * n, e[5] = s * o - i * n, e[6] = f * o - u * n, e[7] = v * o - c * n, e
            }, v.fromRotationTranslation = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = n + n, c = o + o, l = a + a, s = n * u, f = n * c, v = n * l, p = o * c, g = o * l, h = a * l, m = i * u, d = i * c, _ = i * l;
                return e[0] = 1 - (p + h), e[1] = f + _, e[2] = v - d, e[3] = 0, e[4] = f - _, e[5] = 1 - (s + h), e[6] = g + m, e[7] = 0, e[8] = v + d, e[9] = g - m, e[10] = 1 - (s + p), e[11] = 0, e[12] = r[0], e[13] = r[1], e[14] = r[2], e[15] = 1, e
            }, v.fromQuat = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = r + r, u = n + n, c = o + o, l = r * i, s = n * i, f = n * u, v = o * i, p = o * u, g = o * c, h = a * i, m = a * u, d = a * c;
                return e[0] = 1 - f - g, e[1] = s + d, e[2] = v - m, e[3] = 0, e[4] = s - d, e[5] = 1 - l - g, e[6] = p + h, e[7] = 0, e[8] = v + m, e[9] = p - h, e[10] = 1 - l - f, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
            }, v.frustum = function (e, t, r, n, o, a, i) {
                var u = 1 / (r - t), c = 1 / (o - n), l = 1 / (a - i);
                return e[0] = 2 * a * u, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 2 * a * c, e[6] = 0, e[7] = 0, e[8] = (r + t) * u, e[9] = (o + n) * c, e[10] = (i + a) * l, e[11] = -1, e[12] = 0, e[13] = 0, e[14] = i * a * 2 * l, e[15] = 0, e
            }, v.perspective = function (e, t, r, n, o) {
                var a = 1 / Math.tan(t / 2), i = 1 / (n - o);
                return e[0] = a / r, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = a, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = (o + n) * i, e[11] = -1, e[12] = 0, e[13] = 0, e[14] = 2 * o * n * i, e[15] = 0, e
            }, v.ortho = function (e, t, r, n, o, a, i) {
                var u = 1 / (t - r), c = 1 / (n - o), l = 1 / (a - i);
                return e[0] = -2 * u, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = -2 * c, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 2 * l, e[11] = 0, e[12] = (t + r) * u, e[13] = (o + n) * c, e[14] = (i + a) * l, e[15] = 1, e
            }, v.lookAt = function (e, r, n, o) {
                var a, i, u, c, l, s, f, p, g, h, m = r[0], d = r[1], _ = r[2], b = o[0], y = o[1], T = o[2], w = n[0], E = n[1], x = n[2];
                return Math.abs(m - w) < t && Math.abs(d - E) < t && Math.abs(_ - x) < t ? v.identity(e) : (f = m - w, p = d - E, g = _ - x, h = 1 / Math.sqrt(f * f + p * p + g * g), f *= h, p *= h, g *= h, a = y * g - T * p, i = T * f - b * g, u = b * p - y * f, h = Math.sqrt(a * a + i * i + u * u), h ? (h = 1 / h, a *= h, i *= h, u *= h) : (a = 0, i = 0, u = 0), c = p * u - g * i, l = g * a - f * u, s = f * i - p * a, h = Math.sqrt(c * c + l * l + s * s), h ? (h = 1 / h, c *= h, l *= h, s *= h) : (c = 0, l = 0, s = 0), e[0] = a, e[1] = c, e[2] = f, e[3] = 0, e[4] = i, e[5] = l, e[6] = p, e[7] = 0, e[8] = u, e[9] = s, e[10] = g, e[11] = 0, e[12] = -(a * m + i * d + u * _), e[13] = -(c * m + l * d + s * _), e[14] = -(f * m + p * d + g * _), e[15] = 1, e)
            }, v.str = function (e) {
                return "mat4(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ", " + e[6] + ", " + e[7] + ", " + e[8] + ", " + e[9] + ", " + e[10] + ", " + e[11] + ", " + e[12] + ", " + e[13] + ", " + e[14] + ", " + e[15] + ")"
            }, v.frob = function (e) {
                return Math.sqrt(Math.pow(e[0], 2) + Math.pow(e[1], 2) + Math.pow(e[2], 2) + Math.pow(e[3], 2) + Math.pow(e[4], 2) + Math.pow(e[5], 2) + Math.pow(e[6], 2) + Math.pow(e[7], 2) + Math.pow(e[8], 2) + Math.pow(e[9], 2) + Math.pow(e[10], 2) + Math.pow(e[11], 2) + Math.pow(e[12], 2) + Math.pow(e[13], 2) + Math.pow(e[14], 2) + Math.pow(e[15], 2))
            }, "undefined" != typeof e && (e.mat4 = v);
            var p = {};
            p.create = function () {
                var e = new r(4);
                return e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 1, e
            }, p.rotationTo = function () {
                var e = u.create(), t = u.fromValues(1, 0, 0), r = u.fromValues(0, 1, 0);
                return function (n, o, a) {
                    var i = u.dot(o, a);
                    return -.999999 > i ? (u.cross(e, t, o), u.length(e) < 1e-6 && u.cross(e, r, o), u.normalize(e, e), p.setAxisAngle(n, e, Math.PI), n) : i > .999999 ? (n[0] = 0, n[1] = 0, n[2] = 0, n[3] = 1, n) : (u.cross(e, o, a), n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = 1 + i, p.normalize(n, n))
                }
            }(), p.setAxes = function () {
                var e = f.create();
                return function (t, r, n, o) {
                    return e[0] = n[0], e[3] = n[1], e[6] = n[2], e[1] = o[0], e[4] = o[1], e[7] = o[2], e[2] = -r[0], e[5] = -r[1], e[8] = -r[2], p.normalize(t, p.fromMat3(t, e))
                }
            }(), p.clone = c.clone, p.fromValues = c.fromValues, p.copy = c.copy, p.set = c.set, p.identity = function (e) {
                return e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 1, e
            }, p.setAxisAngle = function (e, t, r) {
                r = .5 * r;
                var n = Math.sin(r);
                return e[0] = n * t[0], e[1] = n * t[1], e[2] = n * t[2], e[3] = Math.cos(r), e
            }, p.add = c.add, p.multiply = function (e, t, r) {
                var n = t[0], o = t[1], a = t[2], i = t[3], u = r[0], c = r[1], l = r[2], s = r[3];
                return e[0] = n * s + i * u + o * l - a * c, e[1] = o * s + i * c + a * u - n * l, e[2] = a * s + i * l + n * c - o * u, e[3] = i * s - n * u - o * c - a * l, e
            }, p.mul = p.multiply, p.scale = c.scale, p.rotateX = function (e, t, r) {
                r *= .5;
                var n = t[0], o = t[1], a = t[2], i = t[3], u = Math.sin(r), c = Math.cos(r);
                return e[0] = n * c + i * u, e[1] = o * c + a * u, e[2] = a * c - o * u, e[3] = i * c - n * u, e
            }, p.rotateY = function (e, t, r) {
                r *= .5;
                var n = t[0], o = t[1], a = t[2], i = t[3], u = Math.sin(r), c = Math.cos(r);
                return e[0] = n * c - a * u, e[1] = o * c + i * u, e[2] = a * c + n * u, e[3] = i * c - o * u, e
            }, p.rotateZ = function (e, t, r) {
                r *= .5;
                var n = t[0], o = t[1], a = t[2], i = t[3], u = Math.sin(r), c = Math.cos(r);
                return e[0] = n * c + o * u, e[1] = o * c - n * u, e[2] = a * c + i * u, e[3] = i * c - a * u, e
            }, p.calculateW = function (e, t) {
                var r = t[0], n = t[1], o = t[2];
                return e[0] = r, e[1] = n, e[2] = o, e[3] = Math.sqrt(Math.abs(1 - r * r - n * n - o * o)), e
            }, p.dot = c.dot, p.lerp = c.lerp, p.slerp = function (e, t, r, n) {
                var o, a, i, u, c, l = t[0], s = t[1], f = t[2], v = t[3], p = r[0], g = r[1], h = r[2], m = r[3];
                return a = l * p + s * g + f * h + v * m, 0 > a && (a = -a, p = -p, g = -g, h = -h, m = -m), 1 - a > 1e-6 ? (o = Math.acos(a), i = Math.sin(o), u = Math.sin((1 - n) * o) / i, c = Math.sin(n * o) / i) : (u = 1 - n, c = n), e[0] = u * l + c * p, e[1] = u * s + c * g, e[2] = u * f + c * h, e[3] = u * v + c * m, e
            }, p.invert = function (e, t) {
                var r = t[0], n = t[1], o = t[2], a = t[3], i = r * r + n * n + o * o + a * a, u = i ? 1 / i : 0;
                return e[0] = -r * u, e[1] = -n * u, e[2] = -o * u, e[3] = a * u, e
            }, p.conjugate = function (e, t) {
                return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e[3] = t[3], e
            }, p.length = c.length, p.len = p.length, p.squaredLength = c.squaredLength, p.sqrLen = p.squaredLength, p.normalize = c.normalize, p.fromMat3 = function (e, t) {
                var r, n = t[0] + t[4] + t[8];
                if (n > 0)r = Math.sqrt(n + 1), e[3] = .5 * r, r = .5 / r, e[0] = (t[5] - t[7]) * r, e[1] = (t[6] - t[2]) * r, e[2] = (t[1] - t[3]) * r; else {
                    var o = 0;
                    t[4] > t[0] && (o = 1), t[8] > t[3 * o + o] && (o = 2);
                    var a = (o + 1) % 3, i = (o + 2) % 3;
                    r = Math.sqrt(t[3 * o + o] - t[3 * a + a] - t[3 * i + i] + 1), e[o] = .5 * r, r = .5 / r, e[3] = (t[3 * a + i] - t[3 * i + a]) * r, e[a] = (t[3 * a + o] + t[3 * o + a]) * r, e[i] = (t[3 * i + o] + t[3 * o + i]) * r
                }
                return e
            }, p.str = function (e) {
                return "quat(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ")"
            }, "undefined" != typeof e && (e.quat = p)
        }(t.exports)
    }(this),
    function (e, t) {
        "use strict";
        "object" == typeof exports ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.MersenneTwister = t()
    }(this, function () {
        "use strict";
        var e = 4294967296, t = 624, r = 397, n = 2147483648, o = 2147483647, a = 2567483615, i = function (e) {
            "undefined" == typeof e && (e = (new Date).getTime()), this.mt = new Array(t), this.mti = t + 1, this.seed(e)
        };
        i.prototype.seed = function (e) {
            var r;
            for (this.mt[0] = e >>> 0, this.mti = 1; this.mti < t; this.mti++) {
                r = this.mt[this.mti - 1] ^ this.mt[this.mti - 1] >>> 30, this.mt[this.mti] = (1812433253 * ((4294901760 & r) >>> 16) << 16) + 1812433253 * (65535 & r) + this.mti, this.mt[this.mti] >>>= 0
            }
        }, i.prototype.seedArray = function (e) {
            var r, n = 1, o = 0, a = t > e.length ? t : e.length;
            for (this.seed(19650218); a > 0; a--) {
                r = this.mt[n - 1] ^ this.mt[n - 1] >>> 30, this.mt[n] = (this.mt[n] ^ (1664525 * ((4294901760 & r) >>> 16) << 16) + 1664525 * (65535 & r)) + e[o] + o, this.mt[n] >>>= 0, n++, o++, n >= t && (this.mt[0] = this.mt[t - 1], n = 1), o >= e.length && (o = 0);
            }
            for (a = t - 1; a; a--) {
                r = this.mt[n - 1] ^ this.mt[n - 1] >>> 30, this.mt[n] = (this.mt[n] ^ (1566083941 * ((4294901760 & r) >>> 16) << 16) + 1566083941 * (65535 & r)) - n, this.mt[n] >>>= 0, n++, n >= t && (this.mt[0] = this.mt[t - 1], n = 1);
            }
            this.mt[0] = 2147483648
        }, i.prototype["int"] = function () {
            var e, i, u = new Array(0, a);
            if (this.mti >= t) {
                for (this.mti === t + 1 && this.seed(5489), i = 0; t - r > i; i++) {
                    e = this.mt[i] & n | this.mt[i + 1] & o, this.mt[i] = this.mt[i + r] ^ e >>> 1 ^ u[1 & e];
                }
                for (; t - 1 > i; i++) {
                    e = this.mt[i] & n | this.mt[i + 1] & o, this.mt[i] = this.mt[i + (r - t)] ^ e >>> 1 ^ u[1 & e];
                }
                e = this.mt[t - 1] & n | this.mt[0] & o, this.mt[t - 1] = this.mt[r - 1] ^ e >>> 1 ^ u[1 & e], this.mti = 0
            }
            return e = this.mt[this.mti++], e ^= e >>> 11, e ^= e << 7 & 2636928640, e ^= e << 15 & 4022730752, e ^= e >>> 18, e >>> 0
        }, i.prototype.int31 = function () {
            return this["int"]() >>> 1
        }, i.prototype.real = function () {
            return this["int"]() * (1 / (e - 1))
        }, i.prototype.realx = function () {
            return (this["int"]() + .5) * (1 / e)
        }, i.prototype.rnd = function () {
            return this["int"]() * (1 / e)
        }, i.prototype.rndHiRes = function () {
            var e = this["int"]() >>> 5, t = this["int"]() >>> 6;
            return (67108864 * e + t) * (1 / 9007199254740992)
        };
        var u = new i;
        return i.random = function () {
            return u.rnd()
        }, i
    }),
    function (e) {
        function t(e, t, r) {
            this.x = e, this.y = t, this.z = r
        }

        function r(e) {
            return e * e * e * (e * (6 * e - 15) + 10)
        }

        function n(e, t, r) {
            return (1 - r) * e + r * t
        }

        var o = e.noise = {};
        t.prototype.dot2 = function (e, t) {
            return this.x * e + this.y * t
        }, t.prototype.dot3 = function (e, t, r) {
            return this.x * e + this.y * t + this.z * r
        };
        var a = [
            new t(1, 1, 0), new t(-1, 1, 0), new t(1, -1, 0), new t(-1, -1, 0), new t(1, 0, 1), new t(-1, 0, 1),
            new t(1, 0, -1), new t(-1, 0, -1), new t(0, 1, 1), new t(0, -1, 1), new t(0, 1, -1), new t(0, -1, -1)
        ], i = [
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37,
            240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57,
            177,
            33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146,
            158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65,
            25,
            63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164,
            100,
            109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207,
            206,
            59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153,
            101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
            246,
            97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49,
            192,
            214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222,
            114,
            67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ], u = new Array(512), c = new Array(512);
        o.seed = function (e) {
            e > 0 && 1 > e && (e *= 65536), e = Math.floor(e), 256 > e && (e |= e << 8);
            for (var t = 0; 256 > t; t++) {
                var r;
                r = 1 & t ? i[t] ^ 255 & e : i[t] ^ e >> 8 & 255, u[t] = u[t + 256] = r, c[t] = c[t + 256] = a[r % 12]
            }
        }, o.seed(0);
        var l = .5 * (Math.sqrt(3) - 1), s = (3 - Math.sqrt(3)) / 6, f = 1 / 3, v = 1 / 6;
        o.simplex2 = function (e, t) {
            var r, n, o, a, i, f = (e + t) * l, v = Math.floor(e + f), p = Math.floor(t + f), g = (v + p) * s, h = e - v + g, m = t - p + g;
            h > m ? (a = 1, i = 0) : (a = 0, i = 1);
            var d = h - a + s, _ = m - i + s, b = h - 1 + 2 * s, y = m - 1 + 2 * s;
            v &= 255, p &= 255;
            var T = c[v + u[p]], w = c[v + a + u[p + i]], E = c[v + 1 + u[p + 1]], x = .5 - h * h - m * m;
            0 > x ? r = 0 : (x *= x, r = x * x * T.dot2(h, m));
            var A = .5 - d * d - _ * _;
            0 > A ? n = 0 : (A *= A, n = A * A * w.dot2(d, _));
            var M = .5 - b * b - y * y;
            return 0 > M ? o = 0 : (M *= M, o = M * M * E.dot2(b, y)), 70 * (r + n + o)
        }, o.simplex3 = function (e, t, r) {
            var n, o, a, i, l, s, p, g, h, m, d = (e + t + r) * f, _ = Math.floor(e + d), b = Math.floor(t + d), y = Math.floor(r + d), T = (_ + b + y) * v, w = e - _ + T, E = t - b + T, x = r - y + T;
            w >= E ? E >= x ? (l = 1, s = 0, p = 0, g = 1, h = 1, m = 0) : w >= x ? (l = 1, s = 0, p = 0, g = 1, h = 0, m = 1) : (l = 0, s = 0, p = 1, g = 1, h = 0, m = 1) : x > E ? (l = 0, s = 0, p = 1, g = 0, h = 1, m = 1) : x > w ? (l = 0, s = 1, p = 0, g = 0, h = 1, m = 1) : (l = 0,
                s = 1, p = 0, g = 1, h = 1, m = 0);
            var A = w - l + v, M = E - s + v, R = x - p + v, P = w - g + 2 * v, L = E - h + 2 * v, D = x - m + 2 * v, S = w - 1 + 3 * v, F = E - 1 + 3 * v, k = x - 1 + 3 * v;
            _ &= 255, b &= 255, y &= 255;
            var G = c[_ + u[b + u[y]]], I = c[_ + l + u[b + s + u[y + p]]], U = c[_ + g + u[b + h + u[y + m]]], N = c[_ + 1 + u[b + 1 + u[y + 1]]], B = .6 - w * w - E * E - x * x;
            0 > B ? n = 0 : (B *= B, n = B * B * G.dot3(w, E, x));
            var W = .6 - A * A - M * M - R * R;
            0 > W ? o = 0 : (W *= W, o = W * W * I.dot3(A, M, R));
            var O = .6 - P * P - L * L - D * D;
            0 > O ? a = 0 : (O *= O, a = O * O * U.dot3(P, L, D));
            var C = .6 - S * S - F * F - k * k;
            return 0 > C ? i = 0 : (C *= C, i = C * C * N.dot3(S, F, k)), 32 * (n + o + a + i)
        }, o.perlin2 = function (e, t) {
            var o = Math.floor(e), a = Math.floor(t);
            e -= o, t -= a, o = 255 & o, a = 255 & a;
            var i = c[o + u[a]].dot2(e, t), l = c[o + u[a + 1]].dot2(e, t - 1), s = c[o + 1 + u[a]].dot2(e - 1, t), f = c[o + 1 + u[a + 1]].dot2(e - 1, t - 1), v = r(e);
            return n(n(i, s, v), n(l, f, v), r(t))
        }, o.perlin3 = function (e, t, o) {
            var a = Math.floor(e), i = Math.floor(t), l = Math.floor(o);
            e -= a, t -= i, o -= l, a = 255 & a, i = 255 & i, l = 255 & l;
            var s = c[a + u[i + u[l]]].dot3(e, t, o), f = c[a + u[i + u[l + 1]]].dot3(e, t, o - 1), v = c[a + u[i + 1 + u[l]]].dot3(e, t - 1, o), p = c[a + u[i + 1 + u[l + 1]]].dot3(e, t - 1, o - 1), g = c[a + 1 + u[i + u[l]]].dot3(e - 1, t, o), h = c[a + 1 + u[i + u[l + 1]]].dot3(e - 1, t, o - 1), m = c[a + 1 + u[i + 1 + u[l]]].dot3(e - 1, t - 1, o), d = c[a + 1 + u[i + 1 + u[l + 1]]].dot3(e - 1, t - 1, o - 1), _ = r(e), b = r(t), y = r(o);
            return n(n(n(s, g, _), n(f, h, _), y), n(n(v, m, _), n(p, d, _), y), b)
        }
    }(this);

(function () {
    function deg2rad(e) {
        return Math.PI * e / 180
    }

    function rad2deg(e) {
        return 180 * e / Math.PI
    }

    function lerp(e, t, r) {
        return (1 - r) * e + r * t
    }

    function clamp(e, t, r) {
        return t > e ? t : e > r ? r : e
    }

    function smoothstep(e) {
        return 3 * e * e - 2 * e * e * e
    }

    function modulo(e, t) {
        return (e % t + t) % t
    }

    function sign(e) {
        return 0 > e ? -1 : e > 0 ? 1 : 0
    }

    function toggleProperty(e, t) {
        return e[t] = !e[t]
    }

    function hashDJB2(e) {
        for (var t = 5381, r = e.length - 1; r >= 0; --r) {
            t = (t << 5) + t + e.charCodeAt(r);
        }
        return t
    }

    function makeUuid(e) {
        function t(e) {
            e = e || 1;
            for (var t = ""; e--;) {
                t += (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
            }
            return t
        }

        return _.isUndefined(e) && (e = "-"), _.map([2, 1, 1, 1, 3], function (e) {
            return t(e)
        }).join(e)
    }

    function miniball(e, t) {
        for (var t = t || 1, r = [], n = 0; n < e.length; ++n) {
            r.push(n);
        }
        for (var o = vec3.create(), a = vec3.create(), i = 0, u = 1 / 0, c = vec3.create(), l = 0; t > l; ++l) {
            l > 0 && Random.shuffle(r);
            for (var n = 0; n < r.length; ++n) {
                var s = r[n], f = e[s];
                if (0 !== n) {
                    if (!(vec3.dist(o, f) < i) && (vec3.sub(c, o, f), vec3.normalize(c, c), vec3.scale(c, c, i), vec3.add(c, c, o), vec3.lerp(o, f, c, .5), i = .5 * vec3.dist(f, c), i > u))break
                } else vec3.copy(o, f), i = 0
            }
            i && u > i && (vec3.copy(a, o), u = i)
        }
        return {center: a, radius: u}
    }

    function forEachLine(e, t) {
        for (var r = 0, n = 0; r < e.length;) {
            var o = e.indexOf("\n", r);
            -1 == o && (o = e.length);
            var a = e.substr(r, o - r);
            r = o + 1, t(a, n++)
        }
    }

    function getMouseEventOffset(e) {
        return _.isUndefined(e.offsetX) ? [e.layerX, e.layerY] : [e.offsetX, e.offsetY]
    }

    var timeNow,
        PI = Math.PI,
        HALF_PI = PI / 2,
        TWO_PI = 2 * PI,
        d = 0,
        b = Math.random,
        Random = {
            cardinal: function (e) {
                return Math.floor(e * b())
            },
            integer: function (e, t) {
                return e + Math.floor((t - e) * b())
            },
            uniform: function (e, t) {
                return lerp(e, t, Math.random())
            },
            gauss: function (e, t) {
                var r = d;
                if (d = 0, 0 === r) {
                    var n = TWO_PI * b(), o = Math.sqrt(-2 * Math.log(1 - b()));
                    r = Math.cos(n) * o, d = Math.sin(n) * o
                }
                return e + r * t
            },
            choose: function (e) {
                var t = Random.cardinal(e.length);
                return e[t]
            },
            uniformVec3: function (e, t) {
                return e[0] = 2 * t * (b() - .5), e[1] = 2 * t * (b() - .5), e[2] = 2 * t * (b() - .5), e
            },
            unitVec3: function (e) {
                return Random.uniformVec3(e, 1), vec3.normalize(e, e), e
            },
            shuffle: function (e) {
                for (var t = e.length - 1; t >= 0; --t) {
                    var r = Random.cardinal(t + 1), n = e[t];
                    e[t] = e[r], e[r] = n
                }
            },
            distribute: function (e, t, n) {
                return lerp(e, t, Math.pow(b(), n))
            }
        }, Base64 = {
            decode: function (e, t) {
                for (var r = atob(e), n = r.length, o = new ArrayBuffer(n), a = new Uint8Array(o), i = 0; n > i; ++i) {
                    a[i] = r.charCodeAt(i);
                }
                return t ? new t(o) : o
            },
            encode: function (e) {
                for (var e = new Uint8Array(e.buffer, e.byteOffset, e.byteLength), t = e.length, r = "", n = 0; t > n; ++n) {
                    r += String.fromCharCode(e[n]);
                }
                return btoa(r)
            }
        };
    timeNow = window.performance && performance.now ? function () {
        return .001 * performance.now()
    } : function () {
        return .001 * Date.now()
    };
    _.extend(window, {
        PI: PI,
        HALF_PI: HALF_PI,
        TWO_PI: TWO_PI,
        deg2rad: deg2rad,
        rad2deg: rad2deg,
        lerp: lerp,
        clamp: clamp,
        smoothstep: smoothstep,
        modulo: modulo,
        sign: sign,
        toggleProperty: toggleProperty,
        hashDJB2: hashDJB2,
        makeUuid: makeUuid,
        Random: Random,
        miniball: miniball,
        Base64: Base64,
        timeNow: timeNow,
        forEachLine: forEachLine,
        getMouseEventOffset: getMouseEventOffset
    });
    window.requestAnimationFrame || (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (e) {
            setTimeout(e, 1e3 / 60)
        });
    window.saveFileAs = function (e, t, r) {
        r = r || "application/octet-binary";
        var n = new Blob([e], {type: r}), o = URL.createObjectURL(n), a = document.createElement("a");
        a.setAttribute("href", o), a.setAttribute("download", t), a.click(), URL.revokeObjectURL(n)
    }
})(window)

vec2.load = function (e, t, r) {
    e[0] = t[r + 0], e[1] = t[r + 1]
};
vec2.save = function (e, t, r) {
    t[r + 0] = e[0], t[r + 1] = e[1]
};
vec3.load = function (e, t, r) {
    e[0] = t[r + 0], e[1] = t[r + 1], e[2] = t[r + 2]
};
vec3.save = function (e, t, r) {
    t[r + 0] = e[0], t[r + 1] = e[1], t[r + 2] = e[2]
};
vec4.load = function (e, t, r) {
    e[0] = t[r + 0], e[1] = t[r + 1], e[2] = t[r + 2], e[3] = t[r + 3]
};
vec4.save = function (e, t, r) {
    t[r + 0] = e[0], t[r + 1] = e[1], t[r + 2] = e[2], t[r + 3] = e[3]
};
vec2.perp = function (e, t) {
    var r = t[0];
    e[0] = -t[1], e[1] = r
};
mat4.lerp = function (e, t, r, n) {
    for (var o = 0; 16 > o; ++o) {
        e[o] = (1 - n) * t[o] + n * r[o];
    }
    return e
};

function onGLSLError(e) {
    console.log("GLSL error:", e);
    var t = {};
    switch (forEachLine(e.log, function (e, r) {
        var n = e.match(/^ERROR: \d+:(\d+):(.*)$/);
        if (n) {
            var o = parseInt(n[1]), a = n[2];
            t[o] || (t[o] = []), t[o].push(a)
        }
    }), console.log(t), e.type) {
        case"COMPILE":
            html = '<div class="description">GLSL compile error in ' + e.shaderType.toLowerCase() + ' shader "' + e.name + '":</div>', forEachLine(e.source, function (e, r) {
                var n = t[r + 1];
                n ? (n = _.map(n, function (e) {
                    return "<div class='description'>" + e + "</div>"
                }).join(""), html += "<span class='highlight'>" + e + "</span> " + n) : html += e + "\n"
            });
            break;
        case"LINK":
            html = '<div class="description">GLSL link error in program "' + e.name + '":<br/>\n' + e.log + "\n</div>"
    }
    $(".glsl-error").html("<code>" + html + "</code>").show()
}
var shaders = {};
var webgl = function () {
    function Program(e) {
        this.name = e;
        this.program = null;
        this.attribs = {};
        this.uniforms = {};
        this.enabledMask= 0;
            this.maxEnabledIndex= -1;
    }

    Program.prototype = {
        setProgram: function (e) {
            function t(e) {
                if (e.type == gl.SAMPLER_2D || e.type == gl.SAMPLER_CUBE) {
                    var t = a;
                    return a += e.size, t
                }
                return -1
            }

            this.program = e;
            for (var r = gl.getProgramParameter(e, gl.ACTIVE_ATTRIBUTES), n = 0; r > n; ++n) {
                var o = gl.getActiveAttrib(e, n);
                this.attribs[o.name] = {
                    index: gl.getAttribLocation(e, o.name),
                    name: o.name,
                    size: o.size,
                    type: o.type
                }
            }
            for (var a = 0, i = gl.getProgramParameter(e, gl.ACTIVE_UNIFORMS), n = 0; i > n; ++n) {
                var u = gl.getActiveUniform(e, n);
                this.uniforms[u.name] = {
                    location: gl.getUniformLocation(e, u.name),
                    name: u.name,
                    size: u.size,
                    type: u.type,
                    texUnit: t(u)
                }
            }
        },
        use: function () {
            return gl.useProgram(this.program), this.disableAll(), this
        },
        getUniformLocation: function (e) {
            var t = this.uniforms[e];
            return t ? t.location : null
        },
        getAttribIndex: function (e) {
            var t = this.attribs[e];
            return t ? t.index : -1
        },
        uniform1i: function (e, t) {
            var r = this.getUniformLocation(e);
            r && gl.uniform1i(r, t)
        },
        uniform1f: function (e, t) {
            var r = this.getUniformLocation(e);
            r && gl.uniform1f(r, t)
        },
        uniform2f: function (e, t, r) {
            var n = this.getUniformLocation(e);
            n && gl.uniform2f(n, t, r)
        },
        uniform3f: function (e, t, r, n) {
            var o = this.getUniformLocation(e);
            o && gl.uniform3f(o, t, r, n)
        },
        uniform4f: function (e, t, r, n, o) {
            var a = this.getUniformLocation(e);
            a && gl.uniform4f(a, t, r, n, o)
        },
        uniform1fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && gl.uniform1fv(r, t)
        },
        uniform2fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && gl.uniform2fv(r, t)
        },
        uniform3fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && gl.uniform3fv(r, t)
        },
        uniform4fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && gl.uniform4fv(r, t)
        },
        uniformMatrix3fv: function (e, t, r) {
            var n = this.getUniformLocation(e);
            n && (r = r || !1, gl.uniformMatrix3fv(n, r, t))
        },
        uniformMatrix4fv: function (e, t, r) {
            var n = this.getUniformLocation(e);
            n && (r = r || !1, gl.uniformMatrix4fv(n, r, t))
        },
        uniformSampler: function (e, t, r) {
            var n = this.uniforms[e];
            n && (gl.activeTexture(gl.TEXTURE0 + n.texUnit), gl.bindTexture(t, r), gl.uniform1i(n.location, n.texUnit))
        },
        uniformSampler2D: function (e, t) {
            this.uniformSampler(e, gl.TEXTURE_2D, t)
        },
        uniformSamplerCube: function (e, t) {
            this.uniformSampler(e, gl.TEXTURE_CUBE_MAP, t)
        },
        enableVertexAttribArray: function (e) {
            var t = this.attribs[e];
            t && this.enable(t.index)
        },
        disableVertexAttribArray: function (e) {
            var t = this.attribs[e];
            t && this.disable(t.index)
        },
        vertexAttribPointer: function (e, t, r, n, o, i) {
            var u = this.attribs[e];
            if (u) {
                this.enable(u.index);
                gl.vertexAttribPointer(u.index, t, r, n, o, i)
            }
        },
        disableAll: function () {
            for (var e = 0; e <= this.maxEnabledIndex; ++e) {
                var t = 1 << e;
                t & this.enabledMask && gl.disableVertexAttribArray(e)
            }
            this.enabledMask = 0, this.maxEnabledIndex = -1
        },
        enable: function (e) {
            var t = 1 << e;
            t & this.enabledMask || (gl.enableVertexAttribArray(e), this.enabledMask |= t, this.maxEnabledIndex = Math.max(this.maxEnabledIndex, e))
        },
        disable: function (e) {
            var t = 1 << e;
            t & this.enabledMask && (gl.disableVertexAttribArray(e), this.enabledMask &= ~t)
        }
    };

    function registerShaders(shaderSources) {
        function t(e) {
            var t = /^\/\/\s*(\w+(?:.(vertex|fragment))?)\s*\/\//, r = [];
            forEachLine(e, function (e) {
                var n = t.exec(e);
                if (n) {
                    var o = n[1];
                    shaders[o] = r = []
                } else r.push(e)
            })
        }

        _.each(shaderSources, function (e) {
            if(_.isObject(e)){
                _.extend(shaders, e);
            }else{
                $.ajax({url: e, async: false, cache: false, success: t})
            }
        });
        _.each(shaders, function (e, t) {
            _.isArray(e) && (shaders[t] = e.join("\n"))
        })
    }

    function onShaderError(e, t, r) {
        var n = gl.createShader(e);
        gl.shaderSource(n, t);
        gl.compileShader(n);

        if (gl.getShaderParameter(n, gl.COMPILE_STATUS)) {
            return n;
        }
        gl.getShaderInfoLog(n);
        console.log("Shader: " + r);
        console.log("Type: " + (e == gl.VERTEX_SHADER ? "vertex" : "fragment"));
        forEachLine(t, function (e, t) {
            var r = ("  " + (t + 1)).slice(-3);
            console.log(r + ": " + e)
        });
        throw  {
            type: "COMPILE",
            shaderType: e == gl.VERTEX_SHADER ? "vertex" : "fragment",
            name: r,
            shader: n,
            source: gl.getShaderSource(n),
            log: gl.getShaderInfoLog(n)
        }
    }

    function r(e) {
        var r = "precision highp float;\n",
            program = gl.createProgram();
        gl.attachShader(program, onShaderError(gl.VERTEX_SHADER, e.vertexSource, e.name));
        gl.attachShader(program, onShaderError(gl.FRAGMENT_SHADER, r + e.fragmentSource, e.name));
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        }
        throw {
            type: "LINK",
            name: e.name,
            program: program,
            log: gl.getProgramInfoLog(program)
        }
    }

    function RenderTexture(e, t, r, n) {
        switch (this.width = e, this.height = t, this.framebuffer = gl.createFramebuffer(), gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer), this.texture = gl.createTexture(), gl.bindTexture(gl.TEXTURE_2D, this.texture), this.dataType = n ? gl.FLOAT : gl.UNSIGNED_BYTE, gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, e, t, 0, gl.RGBA, this.dataType, null), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0), this.depthTexture = null, this.depthRenderbuffer = null, r = r ? "TEXTURE" : "NONE", r = "RENDERBUFFER") {
            case"TEXTURE":
                this.depthTexture = gl.createTexture(), gl.bindTexture(gl.TEXTURE_2D, this.depthTexture), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, e, t, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null), gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
                break;
            case"RENDERBUFFER":
                this.depthRenderbuffer = gl.createRenderbuffer(), gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer), gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, e, t), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderbuffer), gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    RenderTexture.prototype = {
        render: function (e) {
            var t = gl.getParameter(gl.VIEWPORT);
            gl.viewport(0, 0, this.width, this.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            e();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(t[0], t[1], t[2], t[3]);
        },
        resize: function (e, t) {
            this.width = e;
            this.height = t;
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, e, t, 0, gl.RGBA, this.dataType, null);
            this.depthTexture &&
            (gl.bindTexture(gl.TEXTURE_2D, this.depthTexture), gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, e, t, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null)), this.depthRenderbuffer && (gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer), gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, e, t), gl.bindRenderbuffer(gl.RENDERBUFFER, null))

        }
    };


    var webgl = {
            /**
             * 生成缓冲区
             * @param target        数据类型
             * @param bufferData    数据
             * @param bufferType    缓冲类型
             * @returns {*}
             */
            makeBuffer: function (target, bufferData, bufferType) {

                bufferType = bufferType || gl.STATIC_DRAW;
                var buffer = gl.createBuffer();
                gl.bindBuffer(target, buffer);
                gl.bufferData(target, bufferData, bufferType);

                return buffer
            },
            /**
             * 生成顶点缓冲区
             * @param bufferData
             * @param bufferType
             * @returns {*}
             */
            makeVertexBuffer: function (bufferData, bufferType) {
                return this.makeBuffer(gl.ARRAY_BUFFER, bufferData, bufferType)
            },
            /**
             * 生成元素缓冲区
             * @param bufferData
             * @param bufferType
             * @returns {*}
             */
            makeElementBuffer: function (bufferData, bufferType) {
                return this.makeBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferData, bufferType)
            },
            /**
             * 绑定顶点缓冲区
             * @param buffer
             */
            bindVertexBuffer: function (buffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                return this;
            },
            /**
             * 绑定元素缓冲区
             * @param buffer
             */
            bindElementBuffer: function (buffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
            },
            setupCanvas: function (e, t) {

                function r(r) {
                    try {
                        return e.getContext(r, t)
                    } catch (n) {
                        return null
                    }
                }

                t = t || {};
                t = _.defaults(t, {
                    antialias: !1,
                    preserveDrawingBuffer: !0,
                    extensions: [],
                    shaderSources: ["shaders/all-shaders.glsl"]
                });

                var o = r("webgl") || r("experimental-webgl");
                if (o) {
                    var a = this.extensions = {};

                    _.each(t.extensions, function (e) {
                        a[e] = o.getExtension(e)
                    });
                    registerShaders(t.shaderSources)
                }
                return o
            },
            getProgram: function () {
                function t(shaderName) {
                    var t = !!shaders[shaderName];
                    console.assert(t, shaderName + " not found.");
                    return t
                }

                function getShader(shaderName, o) {
                    if (t(shaderName) && t(shaderName + ".vertex") && t(shaderName + ".fragment")) {
                        o = o || {};
                        var a = "";
                        o.defines && _.each(o.defines, function (e, t) {
                            a += "#define " + t + " " + e + "\n"
                        });
                        var u = a + (shaders[shaderName] || ""),
                            c = _.reject(u.split("\n"), function (e) {
                                return e.match(/attribute/)
                            }).join("\n");

                        try {
                            var l = new Program(shaderName);
                            l.setProgram(r({
                                name: shaderName,
                                vertexSource: u + shaders[shaderName + ".vertex"],
                                fragmentSource: c + shaders[shaderName + ".fragment"]
                            }));
                            return l
                        } catch (s) {
                            onGLSLError(s);
                            return null
                        }
                    }
                }

                function getCacheName(shaderName, t) {
                    var shader = [];
                    t && t.defines && _.each(t.defines, function (e, t) {
                        shader.push(t + "=" + e)
                    });
                    return shaderName + " " + shader.join(" ")
                }

                return _.memoize(getShader, getCacheName)
            }(),
            /**
             * 创建Texture2D
             * @param option
             * @returns {*}
             */
            createTexture2D: function (option) {

                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                option = option || {};
                option.width = option.width || option.size || 4;
                option.height = option.height || option.width;
                option.format = option.format || gl.RGBA;
                option.type = option.type || gl.UNSIGNED_BYTE;
                option.mag = option.mag || option.filter || gl.NEAREST;
                option.min = option.min || option.mag;
                option.wrapS = option.wrapS || option.wrap || gl.CLAMP_TO_EDGE;
                option.wrapT = option.wrapT || option.wrapS;
                option.dataFormat = option.dataFormat || option.format;
                option.data = option.data || null;
                var r = 0, n = 0;
                gl.texImage2D(gl.TEXTURE_2D, r, option.format, option.width, option.height, n, option.dataFormat, option.type, option.data);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, option.min);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, option.mag);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, option.wrapS);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, option.wrapT);

                if (option.aniso) {
                    var o = webgl.extensions.WEBKIT_EXT_texture_filter_anisotropic;
                    o && gl.texParameteri(gl.TEXTURE_2D, o.TEXTURE_MAX_ANISOTROPY_EXT, option.aniso)
                }
                return texture;
            },
            /**
             * 加载Texture
             * @param url
             * @param options
             * @returns {*}
             */
            loadTexture2D: function (url, options) {

                options = _.defaults(options || {}, {mipmap: !1, flip: !1, callback: null, filter: gl.LINEAR});

                var texture = this.createTexture2D(options),
                    image = new Image;
                image.src = url;
                image.onload = function () {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flip ? 1 : 0);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    if (options.mipmap) {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        gl.generateMipmap(gl.TEXTURE_2D);
                    }
                    options.callback && options.callback(texture)
                };
                return texture;
            },
            /**
             * 渲染Texture
             */
            RenderTexture: RenderTexture
        };
    return webgl;
}();

function array_push(array) {
    for (var t = 1; t < arguments.length; ++t) {
        array.push.apply(array, arguments[t])
    }
}
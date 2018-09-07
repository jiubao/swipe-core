define("zebra-pages/chaoshi-good-item/top-slide/index", ["mui/h2-toast/", "mui/h2-lazyload/", "./index.css", "mui/h2-tabs/index.css", "mui/zepto/event", "mui/crossimage/", "mui/hybrid/", "mui/mtop/index", "mui/chaoshi-sync/price-inventory", "mui/chaoshi-ald/index", "./item.tpl"], function(e, i, t) {
    function a(e) {
        return e && e.__esModule ? e : {
            "default": e
        }
    }
    function o(e, i) {
        if (!(e instanceof i))
            throw new TypeError("Cannot call a class as a function")
    }
    function n(e, i, t, a) {
        var o = Math.abs(e - t)
          , n = Math.abs(i - a);
        return {
            "x": o,
            "y": n,
            "z": Math.sqrt(Math.pow(o, 2) + Math.pow(n, 2))
        }
    }
    function r(e) {
        var i = e.y / e.z
          , t = Math.acos(i);
        return 180 / (Math.PI / t)
    }
    var s = function() {
        function e(e, i) {
            for (var t = 0; t < i.length; t++) {
                var a = i[t];
                a.enumerable = a.enumerable || !1,
                a.configurable = !0,
                "value"in a && (a.writable = !0),
                Object.defineProperty(e, a.key, a)
            }
        }
        return function(i, t, a) {
            return t && e(i.prototype, t),
            a && e(i, a),
            i
        }
    }()
      , u = e("mui/h2-toast/")
      , c = a(u)
      , m = e("mui/h2-lazyload/")
      , l = a(m);
    e("./index.css"),
    e("mui/h2-tabs/index.css");
    var d = e("mui/zepto/event")
      , p = e("mui/crossimage/")
      , h = e("mui/hybrid/")
      , g = e("mui/mtop/index")
      , b = e("mui/chaoshi-sync/price-inventory")
      , f = e("mui/chaoshi-ald/index")
      , x = e("./item.tpl")
      , y = (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform),
    function(e) {
        var i = e.replace("%", "");
        return i /= 100
    }
    )
      , v = 5
      , z = 55
      , q = function() {
        function e() {
            var i = this;
            o(this, e),
            this.el = d(".banner-slider .container"),
            this.opts = {
                "autoAnim": 1e5,
                "interval": "6000"
            },
            new f({
                "data": {
                    "appId": "201704249"
                }
            }).request().then(function(e) {
                var t = e.data.data;
                if (!t)
                    return i.el.html("");
                t && t.length && t.forEach(function(e) {
                    e.url || (e.url = "https://detail.m.tmall.com/item.htm?id=" + e.id),
                    "string" == typeof e.id && (e.id = e.id.trim())
                }),
                i.el.html(x({
                    "data": t
                })),
                i.init()
            }, function(e) {
                i.el.html("")
            })["catch"](function(e) {})
        }
        return s(e, [{
            "key": "init",
            "value": function() {
                this.itemWrappers = d(".item-wrapper", this.el),
                this.bgWrappers = d(".back-image", this.el),
                this.itemDescs = d(".item-desc", this.el),
                this.headWrapper = d(".head-wrapper", this.el),
                this.maxLen = this.itemWrappers.length - 1,
                this._initView(),
                this.initEvent(),
                this.initAutoAnim(),
                this.initSync(),
                new l["default"](".banner-slider",{
                    "processor": function(e, i) {
                        return p.getFitUrl(e, i.width, i.height)
                    }
                })
            }
        }, {
            "key": "_initView",
            "value": function() {
                this.distance = 80,
                this.curIndex = 0,
                this.itemWrappers.removeClass("hidden"),
                this.el.find(".slider-nav").show(),
                this._move(this.maxLen),
                this._initMainPic()
            }
        }, {
            "key": "_initMainPic",
            "value": function() {
                var e = this;
                this.itemWrappers.each(function(i, t) {
                    var a = d(t).find("img");
                    a.removeClass("animated zoomIn"),
                    i == e.curIndex && a.addClass("animated zoomIn")
                })
            }
        }, {
            "key": "initEvent",
            "value": function() {
                var e = this;
                this.el.on("click", ".slider-nav i", function(i) {
                    i.stopPropagation(),
                    i.preventDefault(),
                    clearTimeout(e.moveNext),
                    e.go(Number(d(i.target).attr("data-index")))
                }),
                this.el.on("tap", ".get-coupon", function(e) {
                    e.preventDefault();
                    var i = d(e.currentTarget).attr("data-activityid")
                      , t = d(e.currentTarget).attr("data-sellerId");
                    g.request({
                        "api": "mtop.tmw.tmcs.coupon.apply",
                        "v": "1.0",
                        "ecode": 0,
                        "data": {
                            "sellerId": t,
                            "activityId": i
                        }
                    }).then(function(e) {
                        if ("-407" == e.data.code)
                            return void (location.href = "//login.tmall.com?redirectURL=" + encodeURIComponent(location.href));
                        0 == e.data.code ? c["default"].show("\u9886\u53d6\u6210\u529f", 2e3) : c["default"].show(e.data.msg, 2e3)
                    })
                }).on("touchend", ".get-coupon", function(e) {
                    e.preventDefault()
                }),
                this.el.on("oTransitionEnd transitionEnd webkitTransitionEnd", ".item-wrapper", function(e) {
                    e.stopPropagation(),
                    e.preventDefault()
                });
                var i = .8377 * window.innerWidth;
                this.el.click(function() {
                    e.moveReady = !1,
                    e.scrolling = !1
                }),
                this.el.on("touchstart mousedown", function(t) {
                    if (!e.scrolling) {
                        e.itemWrappers.forEach(function(e) {
                            d(e).removeClass("transition")
                        }),
                        e.moveReady = !1,
                        e.scrolling = !0,
                        e.startPageX = e.constructor.getPage(t, "pageX"),
                        e.startPageY = e.constructor.getPage(t, "pageY");
                        var a = e.itemWrappers.filter(function(i, t) {
                            if (i === e.curIndex)
                                return !0;
                            if (e.curIndex === e.maxLen) {
                                if (i === e.curIndex - 1)
                                    return !0;
                                if (0 === i)
                                    return !0
                            } else if (0 === e.curIndex) {
                                if (i === e.curIndex + 1)
                                    return !0;
                                if (i === e.maxLen)
                                    return !0
                            } else {
                                if (i === e.curIndex + 1)
                                    return !0;
                                if (i === e.curIndex - 1)
                                    return !0
                            }
                        })
                          , o = function(t) {
                            var o = e.constructor.getPage(t, "pageX")
                              , s = e.constructor.getPage(t, "pageY");
                            if (e.scrolling)
                                if (e.moveReady) {
                                    t.preventDefault();
                                    var u = o - e.startPageX;
                                    e.scrolling = !0,
                                    a.each(function(e, t, a) {
                                        if (!t._offsetX) {
                                            var o = d(t).css("transform")
                                              , n = o.match(/\(([^)]*)\)/g)
                                              , r = n[0].replace(/px/, "").replace(/[\(\)]/g, "")
                                              , s = n[1].replace(/px/, "").replace(/[\(\)]/g, "");
                                            r.indexOf("%") > -1 && (r = i * y(r),
                                            t._offsetY = s),
                                            t._offsetX = r
                                        }
                                        var c = Math.abs(u) / (1.2 * i)
                                          , m = void 0;
                                        m = t._offsetY ? +t._offsetY * (1 - c) : -130 * c;
                                        var l = "translateX(" + (+t._offsetX + u) + "px) translateZ(" + m + "px) translate3d(0,0,0)";
                                        d(t).css({
                                            "-webkit-transform": l,
                                            "transform": l
                                        })
                                    })
                                } else {
                                    var c = n(e.startPageX, e.startPageY, o, s);
                                    c.z > v && (r(c) > z ? (t.preventDefault(),
                                    e.moveReady = !0) : e.scrolling = !1)
                                }
                        }
                          , s = function(i) {
                            if (e.scrolling = !1,
                            e.itemWrappers.each(function(e, i, t) {
                                d(i).addClass("transition"),
                                i._offsetX && (i._offsetX = null,
                                i._offsetY = null)
                            }),
                            e.moveReady) {
                                e.constructor.getPage(i, "pageX") - e.startPageX > 0 ? e.goPrev() : e.goNext(),
                                e.moveReady = !1
                            }
                        };
                        e.el.on("touchmove mousemove", o).on("touchend", s);
                        var u = function i() {
                            e.el.off("touchmove mousemove", o),
                            e.el.off("touchend", s),
                            d(document).off("touchend mouseup", i),
                            e.pending = !1
                        };
                        d(document).on("touchend mouseup", u)
                    }
                })
            }
        }, {
            "key": "initSync",
            "value": function() {
                b({
                    "el": ".slider-wrapper",
                    "syncPrice": !0,
                    "itemEl": ".item-wrapper",
                    "useWmPrice": !1,
                    "priceEl": ".price-info",
                    "syncInventory": !0,
                    "soldOutClass": "soldout",
                    "formatPrice": function(e) {
                        return e = e.split("."),
                        e[0] + "." + (e[1] || 0)
                    }
                })
            }
        }, {
            "key": "initAutoAnim",
            "value": function() {
                var e = this;
                this.delay = Number(this.opts.autoAnim),
                this.animInterval = "",
                this.delay && h.ready(function() {
                    e.startAnimation()
                })
            }
        }, {
            "key": "startAnimation",
            "value": function() {
                var e = this;
                this.delay = Number(this.opts.autoAnim),
                function i() {
                    clearTimeout(e.animInterval),
                    e.animInterval = setTimeout(function() {
                        clearTimeout(e.moveNext),
                        e.pending || e.goPrev(),
                        i()
                    }, e.delay)
                }()
            }
        }, {
            "key": "stopAnimation",
            "value": function() {
                clearTimeout(this.animInterval),
                clearTimeout(this.moveNext),
                this.itemWrappers.each(function(e, i, t) {
                    d(i).removeClass("transition")
                })
            }
        }, {
            "key": "go",
            "value": function(e, i) {
                var t = this;
                if (e > this.curIndex)
                    i || e - this.curIndex <= this.maxLen >> 1 ? this.goNext() : this.goPrev();
                else {
                    if (!(e < this.curIndex))
                        return;
                    i || this.curIndex - e <= this.maxLen >> 1 ? this.goPrev() : this.goNext()
                }
                clearTimeout(this.moveNext),
                this.moveNext = setTimeout(function() {
                    t.go(e, i)
                }, 280)
            }
        }, {
            "key": "goNext",
            "value": function() {
                this.curIndex === this.maxLen ? this._move(0) : this._move(this.curIndex + 1)
            }
        }, {
            "key": "goPrev",
            "value": function() {
                0 === this.curIndex ? this._move(this.maxLen) : this._move(this.curIndex - 1)
            }
        }, {
            "key": "_move",
            "value": function(e) {
                var i = this;
                this.curIndex = e,
                this.itemDescs.css({
                    "opacity": 0
                }),
                d(this.itemDescs[e]).css({
                    "opacity": 1
                }),
                d(this.bgWrappers).css("opacity", 0),
                d(this.bgWrappers[e]).addClass("active").css("opacity", 1),
                this.curIndex !== this.maxLen ? this.headWrapper.find("span").text("\u5f80\u671f") : this.headWrapper.find("span").text("\u4eca\u65e5");
                var t = (this.distance,
                0 === e ? this.maxLen : e - 1)
                  , a = e === this.maxLen ? 0 : e + 1;
                d(".slider-nav i", this.el).each(function(t, a) {
                    t === e ? (d(a).addClass("current"),
                    i.curIndex == i.maxLen ? d(a).text("\u672c\u671f") : d(a).text(d(a).data("date"))) : (d(a).removeClass("current"),
                    d(a).text(""))
                }),
                this.itemWrappers.each(function(o, n) {
                    o === e ? i.moveImgWrapper(n, 0, 0, !1) : o === a ? i.moveImgWrapper(n, "120%", "-130px", !1) : o === t ? i.moveImgWrapper(n, "-120%", "-130px", !1) : i.moveImgWrapper(n, 0, "-100px", !0)
                }),
                this._initMainPic()
            }
        }, {
            "key": "moveImgWrapper",
            "value": function(e, i, t, a) {
                var o = "translateX(" + i + ") translateZ(" + t + ") translate3d(0,0,0)";
                d(e).css({
                    "opacity": a ? 0 : 0 === i ? 1 : .6,
                    "visibility": a ? "hidden" : "visible",
                    "-webkit-transform": o,
                    "-moz-transform": o,
                    "-ms-transform": o,
                    "-o-transform": o,
                    "transform": o,
                    "z-index": 0 === i ? 200 : 100
                })
            }
        }], [{
            "key": "getPage",
            "value": function(e, i) {
                return e.changedTouches ? e.changedTouches[0][i] : e[i]
            }
        }]),
        e
    }();
    t.exports = q
});

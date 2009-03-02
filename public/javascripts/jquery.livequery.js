/* Copyright (c) 2008 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.0.3
 * Requires jQuery 1.1.3+
 * Docs: http://docs.jquery.com/Plugins/livequery
 */
(function(A) {
    A.extend(A.fn, {livequery:function(F, E, D) {
        var C = this,G;
        if (A.isFunction(F)) {
            D = E,E = F,F = undefined
        }
        A.each(A.livequery.queries, function(H, I) {
            if (C.selector == I.selector && C.context == I.context && F == I.type && (!E || E.$lqguid == I.fn.$lqguid) && (!D || D.$lqguid == I.fn2.$lqguid)) {
                return(G = I) && false
            }
        });
        G = G || new A.livequery(this.selector, this.context, F, E, D);
        G.stopped = false;
        G.run();
        return this
    },expire:function(F, E, D) {
        var C = this;
        if (A.isFunction(F)) {
            D = E,E = F,F = undefined
        }
        A.each(A.livequery.queries, function(G, H) {
            if (C.selector == H.selector && C.context == H.context && (!F || F == H.type) && (!E || E.$lqguid == H.fn.$lqguid) && (!D || D.$lqguid == H.fn2.$lqguid) && !this.stopped) {
                A.livequery.stop(H.id)
            }
        });
        return this
    }});
    A.livequery = function(C, E, G, F, D) {
        this.selector = C;
        this.context = E || document;
        this.type = G;
        this.fn = F;
        this.fn2 = D;
        this.elements = [];
        this.stopped = false;
        this.id = A.livequery.queries.push(this) - 1;
        F.$lqguid = F.$lqguid || A.livequery.guid++;
        if (D) {
            D.$lqguid = D.$lqguid || A.livequery.guid++
        }
        return this
    };
    A.livequery.prototype = {stop:function() {
        var C = this;
        if (this.type) {
            this.elements.unbind(this.type, this.fn)
        } else {
            if (this.fn2) {
                this.elements.each(function(D, E) {
                    C.fn2.apply(E)
                })
            }
        }
        this.elements = [];
        this.stopped = true
    },run:function() {
        if (this.stopped) {
            return
        }
        var E = this;
        var F = this.elements,D = A(this.selector, this.context),C = D.not(F);
        this.elements = D;
        if (this.type) {
            C.bind(this.type, this.fn);
            if (F.length > 0) {
                A.each(F, function(G, H) {
                    if (A.inArray(H, D) < 0) {
                        A.event.remove(H, E.type, E.fn)
                    }
                })
            }
        } else {
            C.each(function() {
                E.fn.apply(this)
            });
            if (this.fn2 && F.length > 0) {
                A.each(F, function(G, H) {
                    if (A.inArray(H, D) < 0) {
                        E.fn2.apply(H)
                    }
                })
            }
        }
    }};
    A.extend(A.livequery, {guid:0,queries:[],queue:[],running:false,timeout:null,checkQueue:function() {
        if (A.livequery.running && A.livequery.queue.length) {
            var C = A.livequery.queue.length;
            while (C--) {
                A.livequery.queries[A.livequery.queue.shift()].run()
            }
        }
    },pause:function() {
        A.livequery.running = false
    },play:function() {
        A.livequery.running = true;
        A.livequery.run()
    },registerPlugin:function() {
        A.each(arguments, function(D, E) {
            if (!A.fn[E]) {
                return
            }
            var C = A.fn[E];
            A.fn[E] = function() {
                var F = C.apply(this, arguments);
                A.livequery.run();
                return F
            }
        })
    },run:function(C) {
        if (C != undefined) {
            if (A.inArray(C, A.livequery.queue) < 0) {
                A.livequery.queue.push(C)
            }
        } else {
            A.each(A.livequery.queries, function(D) {
                if (A.inArray(D, A.livequery.queue) < 0) {
                    A.livequery.queue.push(D)
                }
            })
        }
        if (A.livequery.timeout) {
            clearTimeout(A.livequery.timeout)
        }
        A.livequery.timeout = setTimeout(A.livequery.checkQueue, 20)
    },stop:function(C) {
        if (C != undefined) {
            A.livequery.queries[C].stop()
        } else {
            A.each(A.livequery.queries, function(D) {
                A.livequery.queries[D].stop()
            })
        }
    }});
    A.livequery.registerPlugin("append", "prepend", "after", "before", "wrap", "attr", "removeAttr", "addClass", "removeClass", "toggleClass", "empty", "remove");
    A(function() {
        A.livequery.play()
    });
    var B = A.prototype.init;
    A.prototype.init = function(C, E) {
        var D = B.apply(this, arguments);
        if (C && C.selector) {
            D.context = C.context,D.selector = C.selector
        }
        if (typeof C == "string") {
            D.context = E || document,D.selector = C
        }
        return D
    };
    A.prototype.init.prototype = A.prototype
})(jQuery);
if (!window.console || !console.firebug) {
    var names = ["log","debug","info","warn","error","assert","dir","dirxml","group","groupEnd","time","timeEnd","count","trace","profile","profileEnd"];
    window.console = {};
    for (var i = 0; i < names.length; ++i) {
        window.console[names[i]] = function() {
        }
    }
}
function _(C, A) {
    if (twttr.i18n) {
        var B = twttr.i18n[C];
        if (B) {
            C = B
        }
    }
    if (A) {
        for (var D in A) {
            C = C.replace(new RegExp("\\#\\{" + D + "\\}", "gi"), A[D])
        }
    }
    return C
}
(function() {
    if (document.all) {
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            var A = new Number(RegExp.$1);
            if (A >= 8) {
                $.browser.msie8 = true
            } else {
                if (A >= 7) {
                    $.browser.msie7 = true
                } else {
                    $.browser.msie6 = true
                }
            }
        }
    }
})();
$.fn.isSidebarTab = function() {
    return this.each(function() {
        var A = $(this);
        A.click(function() {
            var B = A.attr("href");
            twttr.googleAnalytics(B + "/refresh");
            $.ajax({type:"GET",url:B,data:{twttr:true},dataType:"json",beforeSend:twttr.loading,success:function(C) {
                twttr.processJson(C);
                $.initializeTimeline()
            },complete:twttr.loaded});
            return false
        })
    })
};
$.fn.isDeviceUpdateOption = function() {
    return this.each(function() {
        var A = $(this);
        A.click(function() {
            $.ajax({type:"POST",dataType:"json",url:"/account/update_send_via",data:{authenticity_token:twttr.form_authenticity_token,"current_user[send_via]":A.attr("value"),twttr:true},beforeSend:twttr.loading,complete:twttr.loaded})
        })
    })
};
$.fn.isExampleField = function(A, B, C) {
    if (!C) {
        C = "focus"
    }
    return this.each(function() {
        var D = $(this);
        if (B) {
            D.val(B)
        } else {
            B = D.val()
        }
        D.attr("title", B);
        D.bind(C, function() {
            if (D.val() == D.attr("title")) {
                D.val("").css("color", "#000").select()
            }
        });
        D.blur(function() {
            if (D.val() == "") {
                D.val(D.attr("title")).css("color", "")
            }
        });
        if (A) {
            $(A).mousedown(function() {
                if (D.val() == D.attr("title")) {
                    D.val("")
                }
                return true
            })
        }
    })
};
$.fn.isUpdateForm = function() {
    return this.each(function() {
        var I = $(this);
        var F = I.find("textarea").isCharCounter();
        var A = I.find("input[type=submit]");
        var B = I.find("label.doing");
        var E = /^\s*@(\w+)\W+/;
        var D = /^\s*[dD][mM]?\s+(?:(\w+)\W+)?/;
        function H() {
            var J = F.val();
            if (J.length > 140) {
                alert(_("That update is over 140 characters!"));
                return false
            } else {
                if (J.replace(/s\*/g, "") == "") {
                    return false
                } else {
                    A.attr("disabled", "disabled");
                    return true
                }
            }
        }
        function G(J) {
            A.removeAttr("disabled", "disabled");
            var K = J.text;
            if (J.flash) {
                $("#flash").html(J.flash).fadeIn(200)
            } else {
                $("#timeline tr.hentry:first").removeClass("latest-status");
                if (J.status_tr && $("body").attr("id") == "home") {
                    $("#timeline tbody").prepend(J.status_tr);
                    $.initializeTimeline()
                }
                $("#update_count").fadeOut("medium", function() {
                    $("#update_count").html(J.status_count).fadeIn("medium")
                });
                if (J.latest_status) {
                    $("#latest_status").html(J.latest_status).isCurrentStatus(true)
                }
            }
            F.val("").focusEnd();
            $("#in_reply_to_status_id").val("");
            $("#in_reply_to").val("");
            C("");
            F.trigger("change")
        }
        function C(K) {
            var J;
            if (J = K.match(D)) {
                B.html(_("Direct message") + (J[1] ? " " + J[1] : "") + ":");
                A.val(_("send"))
            } else {
                if (J = K.match(E)) {
                    B.html(_("Reply to #{screen_name}:", {screen_name:J[1]}));
                    A.val(_("reply"))
                } else {
                    B.html(_("What are you doing?"));
                    A.val(_("update"))
                }
            }
        }
        F.bind("keyup blur focus", function() {
            C($(this).val())
        });
        I.submit(function() {
            if (H()) {
                twttr.googleAnalytics("/status/update/refresh");
                var O = F.val();
                var N = {authenticity_token:twttr.form_authenticity_token,status:O,twttr:true};
                var K = window.location.href;
                if ($("body").attr("id") == "home" && ((K.indexOf("page=") == -1) || K.match(/page=1(?!\d)/))) {
                    N.return_rendered_status = true
                }
                var J = $("#in_reply_to_status_id").val();
                var M;
                if (J && (M = O.match(E))) {
                    if (M[1] == $("#in_reply_to").val()) {
                        N.in_reply_to_status_id = J
                    }
                }
                var L = $("#source").val();
                if (L) {
                    N.source = L
                }
                $.ajax({type:"POST",dataType:"json",url:"/status/update",data:N,success:G,beforeSend:twttr.loading,complete:twttr.loaded})
            }
            return false
        });
        F.focusEnd()
    })
};
$.fn.isDirectMessageForm = function() {
    return this.each(function() {
        var A = $(this);
        var B = A.find("textarea").isCharCounter();
        B.find("input[type=submit]").attr("disabled", "disabled").addClass("disabled");
        B.focusEnd();
        A.find("select").change(function(C) {
            B.trigger("update", C)
        })
    })
};
$.fn.isCharCounter = function() {
    return this.each(function() {
        var H = $(this);
        var B = H.parents("form");
        var D = B.find(".char-counter");
        var F = B.find("input[type=submit]");
        var A = B.find("select");
        function G() {
            F.attr("disabled", "disabled").addClass("disabled")
        }
        function E() {
            F.removeAttr("disabled").removeClass("disabled")
        }
        function C() {
            var J = H.val();
            var I = J.length;
            D.html("" + (140 - I));
            if (I <= 0) {
                D.css("color", "#cccccc");
                G()
            } else {
                if (A.length == 0 || A.val()) {
                    E()
                } else {
                    G()
                }
                if (I > 130) {
                    D.css("color", "#d40d12")
                } else {
                    if (I > 120) {
                        D.css("color", "#5c0002")
                    } else {
                        D.css("color", "#cccccc")
                    }
                }
            }
        }
        H.bind("keyup blur focus change paste input", function(I) {
            C()
        });
        H.focus()
    })
};
$.fn.isCurrentStatus = function(A) {
    return this.each(function() {
        var D = $(this);
        var B = D.find("#latest_text");
        var C = B.find(".status-text");
        var G = B.find(".entry-meta");
        $("#latest_text_full, #latest_text").click(function() {
            $("#latest_text_full, #latest_text").toggle()
        });
        B.css("visibility", "hidden");
        twttr.boxTruncate($("#latest_text_full .status-text").text(), "#currently #latest_text .status-text", "#currently #latest_text", {height:40,minlength:60});
        B.css("visibility", "visible");
        if (A) {
            var F = C.css("color");
            var E = G.css("color");
            if (!$.browser.msie) {
                B.css("opacity", 0)
            }
            C.css("color", "#000");
            G.css("color", "#000");
            if (!$.browser.msie) {
                B.animate({opacity:1}, 1000)
            }
            if (twttr.timeouts.updateLatestStatus) {
                clearTimeout(twttr.timeouts.updateLatestStatus)
            }
            twttr.timeouts.updateLatestStatus = setTimeout(function() {
                C.animate({color:F}, 3000);
                G.animate({color:E}, 3000)
            }, 5000)
        }
    })
};
$.fn.isNotificationSetting = function() {
    return this.each(function() {
        var B = $(this);
        var A = B.attr("id").replace("notify_on_", "").replace("notify_off_", "");
        B.click(function() {
            var C = B.attr("value");
            $.ajax({type:"POST",dataType:"text",url:"/friends/" + C + "/" + A,data:{authenticity_token:twttr.form_authenticity_token,twttr:true},success:function(D) {
                if (D.match(/success/)) {
                    $(".follow-control").trigger("refresh", ["notify_" + (C == "follow" ? "on" : "off")])
                } else {
                    twttr.error()
                }
            },beforeSend:twttr.loading,complete:twttr.loaded})
        })
    })
};
$.fn.isNudgable = function() {
    return this.each(function() {
        var A = $(this);
        A.click(function() {
            var B = A.parents("form");
            B.find("input[name=authenticity_token]").val(twttr.form_authenticity_token);
            B.submit();
            return false
        })
    })
};
$.fn.isSelectAll = function(A) {
    return this.each(function() {
        var B = $(this);
        var C = $(A);
        var E = C.find("input[type=checkbox]");
        function D() {
            var F = true;
            E.each(function() {
                if (!this.checked) {
                    F = false;
                    return false
                }
            });
            B.get(0).checked = F
        }
        B.click(function() {
            var F = B.get(0).checked;
            E.each(function() {
                this.checked = F
            })
        });
        E.click(function() {
            D()
        })
    })
};
$.fn.isFollowControl = function() {
    return this.each(function() {
        var E = $(this);
        var F = E.parents(".follow-actions");
        var H = E.find(".follow-button");
        var C = F.attr("class").split(" ").pop();
        var B = F.attr("id").replace("follow_actions_", "");
        var G = F.find("#follow-toggle");
        var A = F.find(".remove-button");
        F.find(".notify-input").isNotificationSetting();
        function D(I) {
            $.ajax({type:"GET",dataType:"json",url:"/account/refresh_follow_control/" + B,data:{action_taken:I},success:function(J) {
                twttr.processJson(J);
                $(".follow-control").isFollowControl()
            },beforeSend:twttr.loading,complete:twttr.loaded})
        }
        H.click(function() {
            $.ajax({type:"POST",dataType:"text",url:"/friendships/create/" + B,data:{authenticity_token:twttr.form_authenticity_token,twttr:true},success:function(I) {
                if (I.match(/Bring/)) {
                    twttr.error()
                } else {
                    if (I.match(/success/)) {
                        E.trigger("refresh", ["followed"])
                    } else {
                        if (I.match(/242/)) {
                        } else {
                            twttr.error(I)
                        }
                    }
                }
            },beforeSend:twttr.loading,complete:twttr.loaded});
            return false
        });
        E.bind("refresh", function(I, J) {
            D(J)
        });
        G.click(function() {
            var I = F.find("#follow-details").toggle();
            if (I.css("display") == "block") {
                G.removeClass("closed").addClass("opened")
            } else {
                G.removeClass("opened").addClass("closed")
            }
            return false
        });
        A.click(function() {
            $.ajax({type:"POST",dataType:"text",url:"/friendships/destroy/" + B,data:{authenticity_token:twttr.form_authenticity_token,twttr:true},success:function(I) {
                if (I.match(/success/)) {
                    E.trigger("refresh", ["removed"])
                } else {
                    twttr.error()
                }
            },beforeSend:twttr.loading,complete:twttr.loaded});
            return false
        })
    })
};
$.fn.isFollowRequestLinks = function() {
    return this.each(function() {
        var B = $(this);
        var D = B.hasClass("ifr-profile");
        var F = D ? B.attr("id").replace("ifr_", "") : "";
        var A = B.find("#accept_all_requests");
        var C = B.find("#deny_all_requests");
        function E(G) {
            var H = {decision:G,authenticity_token:twttr.form_authenticity_token};
            if (D) {
                H.id = F;
                H.source = "profile"
            }
            $.ajax({type:"POST",url:"/friend_requests/" + (D ? "decision" : "all"),dataType:"text",data:H,cache:false,success:function(I) {
                if (I == "fail") {
                    alert(_("Whoops! Something went wrong. Please refresh the page and try again!"))
                } else {
                    if (D) {
                        B.fadeOut("medium", function() {
                            B.html(I)
                        });
                        B.fadeIn("medium")
                    } else {
                        var J = window.location;
                        uri = J.protocol + "//" + J.host + "/";
                        window.location = uri
                    }
                }
            },beforeSend:twttr.loading,complete:twttr.loaded})
        }
        A.click(function() {
            E("accept");
            return false
        });
        C.click(function() {
            E("deny");
            return false
        })
    })
};
$.fn.isTabMenu = function() {
    return this.each(function() {
        var B = $(this);
        if ($this.id == "networktab") {
            return true
        }
        function A(C) {
            B.find("li a").each(function() {
                var E = $(this);
                var F = E.parent();
                var D = "";
                if (((D = E.attr("class")) == C) && !F.hasClass("active")) {
                    F.addClass("active");
                    $("#" + D).show()
                } else {
                    F.removeClass("active");
                    $("#" + D).hide()
                }
            })
        }
        B.find("li a").each(function() {
            var C = $(this);
            C.click(function() {
                A(C.attr("class"));
                return false
            })
        })
    })
};
$.fn.focusEnd = function() {
    var A;
    var B;
    return this.each(function() {
        A = this;
        A.focus();
        if ($.browser.msie) {
            B = A.createTextRange();
            B.collapse(false);
            B.select()
        } else {
            A.selectionStart = A.value.length;
            A.selectionEnd = A.value.length
        }
    })
};
$.fn.focusFirstTextField = function() {
    return this.find("input[type=text]:visible:enabled:first").focus().length > 0
},$.fn.focusFirstTextArea = function() {
    return this.find("textarea:visible:enabled:first").focus().length > 0
};
$.fn.focusFirstTextElement = function() {
    return this.focusFirstTextField() || this.focusFirstTextArea()
},$.fn.isWrapped = function(E) {
    if (!E) {
        return
    }
    $this = $(this);
    $this.hide();
    var C = $this.html();
    var G = C.length;
    var B = "";
    var H = $this.width();
    var F = H / E;
    var A = G / F;
    for (var D = 0; D <= F; D += 1) {
        B += (C.substr(A * D, A) + "\n")
    }
    $this.html(B).show()
};
if (!window.twttr) {
    var _tmp = {};
    var twttr = (function() {
        var rtn = {timeouts:{},processJson:function(json) {
            if (typeof (json) == "object") {
                var evals = [];
                $.each(json, function(selector, content) {
                    if (selector.charAt(0) == "$") {
                        evals.push(content)
                    } else {
                        var contentPadded = "<div>" + content + "</div>";
                        var $content = $(selector, $(contentPadded));
                        if ($content.length == 1) {
                            $(selector).replaceWith($content)
                        } else {
                            $(selector).html(content)
                        }
                    }
                });
                $.each(evals, function(index, js) {
                    if (js) {
                        eval(js)
                    }
                })
            }
        },boxTruncate:function(txt, textContainer, container, opts) {
            if (!opts) {
                opts = {}
            }
            if (opts.minlength && (txt.length < opts.minlength)) {
                $(textContainer).text(txt);
                if (!opts.width || $(container).width() <= opts.width) {
                    return txt
                }
            }
            var curr = "";
            for (var i = 0; i < txt.length; i++) {
                curr += txt.charAt(i);
                if (opts.minlength > curr.length) {
                    continue
                }
                $(textContainer).text(curr + "...");
                if (opts.height && $(container).height() > opts.height) {
                    $(textContainer).text(curr = curr.substring(0, curr.length - 1) + "...");
                    return curr
                }
                if (opts.width && $(container).width() > opts.width) {
                    if (/\s/gi.test(txt.charAt(i))) {
                        $(textContainer).text(curr = curr.substring(0, curr.length - 1) + "-")
                    } else {
                        $(textContainer).text(curr = curr.substring(0, curr.length - 1) + "-" + txt.charAt(i))
                    }
                }
            }
            $(textContainer).text(curr);
            return curr
        },googleAnalytics:function(trackid) {
            if (window.pageTracker) {
                window.pageTracker._trackEvent("Ajax", "refresh", trackid, null)
            }
        },fadeAndReplace:function(selector, content) {
            $(selector).fadeOut("medium", function() {
                $(selector).html(content)
            });
            $(selector).fadeIn("medium")
        },error:function(msg) {
            alert(msg ? msg : _("Whoops! Something went wrong. Please refresh the page and try again!"))
        },loading:function() {
            $("#loader").fadeIn(200)
        },loaded:function() {
            $("#loader").fadeOut(200)
        }};
        return rtn
    })()
}
;
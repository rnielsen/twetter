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
            C = C.replace(new RegExp("\\%\\{" + D + "\\}", "gi"), A[D])
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
                twttr.processJson(C)
            },complete:function() {
                initializeTimeline();
                twttr.loaded()
            }});
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
        if (B && D.val() == "") {
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
                if (J.status_li && $("body").attr("id") == "home") {
                    $.Timeline.prepend(J.status_li)
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
                B.html(J[1] ? _("Direct message %{person}:", {person:J[1]}) : _("Direct message:"));
                A.val(_("send"))
            } else {
                if (J = K.match(E)) {
                    B.html(_("Reply to %{screen_name}:", {screen_name:J[1]}));
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
        var B = $(this);
        var C = B.find("textarea").isCharCounter();
        var A = /^\s*[dD][mM]?\s+([A-Za-z0-9]{1,20})[^A-Za-z0-9]/;
        var D = B.find("select");
        var F = B.find("#update-submit");
        var G = "";
        C.find("input[type=submit]").attr("disabled", "disabled").addClass("disabled");
        C.focusEnd();
        function E(I) {
            if (D.val()) {
                return
            }
            if ((matches = I.match(A)) && matches[1] && (G != matches[1])) {
                var H = true;
                D.find("option").each(function() {
                    if (this.innerHTML.toLowerCase() == matches[1].toLowerCase()) {
                        D.val(this.value);
                        H = false;
                        return false
                    }
                });
                if (H) {
                    D.append(_('<option value="%{screen_name}">%{screen_name}</option>', {screen_name:matches[1]}));
                    D.val(matches[1])
                }
                G = matches[1]
            }
        }

        F.click(function(H) {
            var K = C.val();
            var I = K.match(A);
            var J = D.find("option[value=" + D.val() + "]");
            if (I && I[1] && I[1].toLowerCase() == J.text().toLowerCase()) {
                C.val(K.replace(A, ""))
            }
            return true
        });
        D.change(function(H) {
            C.trigger("update", H)
        });
        C.bind("keyup blur focus", function(H) {
            E($(this).val());
            C.trigger("update", H)
        })
    })
};
$.fn.isCharCounter = function() {
    return this.each(function() {
        var A = true;
        var E = $(this);
        var J = E.parents("form");
        var D = J.find(".char-counter");
        var H = J.find("input[type=submit]");
        var C = J.find("select");

        function B() {
            H.attr("disabled", "disabled").addClass("disabled");
            A = true
        }

        function G() {
            if (A) {
                H.removeAttr("disabled").removeClass("disabled");
                A = false
            }
        }

        function F() {
            var L = E.val();
            var K = L.length;
            D.html("" + (140 - K));
            if (K <= 0) {
                D.css("color", "#cccccc");
                B()
            } else {
                if (K <= 140 && (C.length == 0 || C.val())) {
                    G()
                } else {
                    B()
                }
                if (K > 130) {
                    D.css("color", "#d40d12")
                } else {
                    if (K > 120) {
                        D.css("color", "#5c0002")
                    } else {
                        D.css("color", "#cccccc")
                    }
                }
            }
        }

        var I = "blur focus change " + ($.browser.mozilla ? "paste input" : "keyup");
        E.bind(I, function(K) {
            F()
        });
        C.change(function(K) {
            F()
        });
        E.focus()
    })
};
$.fn.isCurrentStatus = function(A) {
    return this.each(function() {
        var E = $(this);
        var B = E.find("#latest_text");
        var D = B.find(".status-text");
        var H = B.find(".entry-meta");
        var C = $(this).parent("#currently");
        $("#latest_text_full, #latest_text").click(function() {
            $("#latest_text_full, #latest_text").toggle()
        });
        B.css("visibility", "hidden");
        twttr.boxTruncate($("#latest_text_full .status-text").text(), "#currently #latest_text .status-text", "#currently #latest_text", {height:40,minlength:60});
        B.css("visibility", "visible");
        if (A) {
            if (C.css("visibility") == "hidden") {
                C.css("visibility", "visible")
            }
            var G = D.css("color");
            var F = H.css("color");
            if (!$.browser.msie) {
                B.css("opacity", 0)
            }
            D.css("color", "#000");
            H.css("color", "#000");
            if (!$.browser.msie) {
                B.animate({opacity:1}, 1000)
            }
            if (twttr.timeouts.updateLatestStatus) {
                clearTimeout(twttr.timeouts.updateLatestStatus)
            }
            twttr.timeouts.updateLatestStatus = setTimeout(function() {
                D.animate({color:G}, 3000);
                H.animate({color:F}, 3000)
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
        if (typeof (A) == "string") {
            var D = $(A).find("input[type=checkbox]")
        } else {
            var D = A
        }
        function C() {
            var E = true;
            D.each(function() {
                if (!this.checked) {
                    E = false;
                    return false
                }
            });
            B.get(0).checked = E
        }

        B.click(function() {
            var E = B.get(0).checked;
            D.each(function() {
                this.checked = E
            });
            $(this).trigger("select-all-changed", E)
        });
        D.click(function() {
            C();
            $(this).trigger("checkbox-changed", this.checked)
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
$.fn.isLinkMenu = function() {
    $(this).one("click", B);
    function B() {
        var C = $(this);
        var D = C.siblings(":hidden");
        $("body, a").one("click", {link:C,menu:D}, A);
        D.click(function(E) {
            E.stopPropagation()
        }).show();
        return false
    }

    function A(C) {
        C.data.menu.hide();
        C.data.link.one("click", B);
        if ($(C.target).attr("id") == C.data.link.attr("id")) {
            return false
        }
    }
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
(function(A) {
    A.fn.isPasswordStrengthField = function(B, C) {
        return this.each(function() {
            if (!B) {
                return
            }
            if (!C) {
                C = {}
            }
            var I = A(this);
            var K = A(B);
            K.append('<span class="pstrength-text"></span>');
            var G = K.find(".pstrength-text");

            function F(L) {
                K.children().each(function() {
                    var M = A(this);
                    if (M.hasClass("pstrength-text")) {
                        if (L) {
                            M.show()
                        } else {
                            M.hide()
                        }
                    } else {
                        if (L) {
                            M.hide()
                        } else {
                            M.show()
                        }
                    }
                })
            }

            function J(L) {
                var N = 0;
                var M = C.minlength ? C.minlength : 6;
                if (L.length < M) {
                    return{score:L.length,message:_("Too short"),className:"password-invalid"}
                }
                if (C.username) {
                    var O = (typeof (C.username) == "function") ? C.username() : C.username;
                    if (O && (L.toLowerCase() == O.toLowerCase())) {
                        return{score:0,message:_("Too obvious"),className:"password-invalid"}
                    }
                }
                if (A.inArray(L.toLowerCase(), ["password","password1","password12","password123","qwerty","asdfgh","123456","abcdef","abc123","monkey","letmein"]) != -1) {
                    return{score:0,message:_("Too obvious"),className:"password-invalid"}
                }
                N += L.length * 4;
                N += (E(1, L).length - L.length) * 1;
                N += (E(2, L).length - L.length) * 1;
                N += (E(3, L).length - L.length) * 1;
                N += (E(4, L).length - L.length) * 1;
                if (L.match(/(.*[0-9].*[0-9].*[0-9])/)) {
                    N += 5
                }
                if (L.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
                    N += 5
                }
                if (L.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
                    N += 10
                }
                if (L.match(/([a-zA-Z])/) && L.match(/([0-9])/)) {
                    N += 15
                }
                if (L.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && L.match(/([0-9])/)) {
                    N += 15
                }
                if (L.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && L.match(/([a-zA-Z])/)) {
                    N += 15
                }
                if (L.match(/^\w+$/) || L.match(/^\d+$/)) {
                    N -= 10
                }
                if (N < 0) {
                    N = 0
                }
                if (N > 100) {
                    N = 100
                }
                if (N < 34) {
                    return{score:N,message:_("Weak"),className:"password-weak"}
                }
                if (N < 50) {
                    return{score:N,message:_("Good"),className:"password-good"}
                }
                if (N < 75) {
                    return{score:N,message:_("Strong"),className:"password-strong"}
                }
                return{score:N,message:_("Very Strong"),className:"password-verystrong"}
            }

            function E(M, P) {
                var L = "";
                for (var O = 0; O < P.length; O++) {
                    var Q = true;
                    for (var N = 0; N < M && (N + O + M) < P.length; N++) {
                        Q = Q && (P.charAt(N + O) == P.charAt(N + O + M))
                    }
                    if (N < M) {
                        Q = false
                    }
                    if (Q) {
                        O += M - 1;
                        Q = false
                    } else {
                        L += P.charAt(O)
                    }
                }
                return L
            }

            function D(L) {
                if (L && K.hasClass(L)) {
                    return false
                }
                K.removeClass("password-weak").removeClass("password-good").removeClass("password-strong").removeClass("password-verystrong").removeClass("password-invalid");
                return true
            }

            function H() {
                var M = I.val();
                if (M.length == 0) {
                    D();
                    F(false)
                } else {
                    if (M.length) {
                        F(true)
                    }
                }
                if (M.length > 0) {
                    var L = J(M);
                    G.html(L.message);
                    if (D(L.className)) {
                        K.addClass(L.className)
                    }
                }
            }

            I.bind("show-password-meter", function() {
                K.show()
            });
            I.bind("hide-password-meter", function() {
                K.hide()
            });
            I.keyup(function() {
                H()
            });
            I.blur(function() {
                if (this.value.length == 0) {
                    D();
                    I.trigger("hide-password-meter")
                }
            });
            if (I.val()) {
                H();
                K.show()
            }
        })
    }
})(jQuery);
$.fn.focusFirstTextField = function() {
    return this.find("input[type=text]:visible:enabled:first").focus().length > 0
},$.fn.focusFirstTextArea = function() {
    return this.find("textarea:visible:enabled:first").focus().length > 0
};
$.fn.focusFirstTextElement = function() {
    return this.focusFirstTextField() || this.focusFirstTextArea()
};
$.fn.isWrapped = function(B) {
    if (!B) {
        return
    }
    var F = $(this);
    F.hide();
    var D = F.html();
    var G = D.length;
    var H = "";
    var C = F.width();
    var A = C / B;
    var E = G / A;
    for (var I = 0; I <= A; I += 1) {
        H += (D.substr(E * I, E) + "\n")
    }
    F.html(H).show()
};
(function(A) {
    A.fn.isOAuthApplication = function() {
        return this.each(function() {
            var D = A(this);
            var C = D.attr("id").replace("oauth_application_", "");
            var B = D.find(".revoke-access");
            B.click(function() {
                A.ajax({type:"POST",dataType:"json",url:"/oauth/revoke",data:{authenticity_token:twttr.form_authenticity_token,token:C,twttr:true},success:function(E) {
                    if (E.revoked) {
                        D.addClass("revoked")
                    } else {
                        D.removeClass("revoked")
                    }
                    B.text(E.label)
                },beforeSend:twttr.loading,complete:twttr.loaded});
                return false
            })
        })
    }
})(jQuery);
$.fn.isLoading = function() {
    $(this).addClass("loading")
};
$.fn.isLoaded = function() {
    $(this).removeClass("loading")
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
$.fn.occasionally = function(H, I) {
    var B = this;
    var F = $.extend({interval:10000,max:null,maxed:function() {
    },decay:2}, I);
    var D = 0;
    var A;
    var G = F.decay;
    var C = F.interval;

    function E() {
        if (F.max && D > F.max) {
            clearInterval(A);
            C = F.interval;
            F.maxed(B);
            return
        }
        D += 1;
        if (H(B)) {
            C = F.interval
        } else {
            C = C * G
        }
        A = setTimeout(function() {
            E()
        }, C)
    }

    A = setTimeout(function() {
        E()
    }, C)
};
(function(A) {
    A.ajaxSetup({beforeSend:twttr.loading,complete:twttr.loaded})
})(jQuery);
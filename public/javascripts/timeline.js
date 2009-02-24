var DEBUG = false;
$.log = function(A) {
    if (window.console) {
        console.log(A)
    }
};
$.debug = function(A) {
    if (DEBUG) {
        $.log(A)
    }
};
(function() {
    function A() {
        var B = $('meta[name="session-loggedin"][content="y"]').get(0);
        var F = $("body.replyable").get(0);
        var C;
        var E;
        if (C = $('meta[name="session-user-screen_name"]:first').get(0)) {
            C = C.content
        }
        if (E = $('meta[name="page-user-screen_name"]:first').get(0)) {
            E = E.content
        }
        var D = C && E && C == E;
        $("body.ie .hentry").isHoverable();
        if (B) {
            $("#timeline .fav,.non-fav").isFavoriteable({hideUnfavorited:D});
            if (F) {
                $("#timeline .repl").isReplyable()
            }
            $("#timeline .del").isDeleteable()
        }
        $("#status").each(function() {
            $(this).focusEnd()
        })
    }
    $.initializeTimeline = function() {
        A()
    };
    $(document).ready(A)
})();
$.fn.isHoverable = function() {
    return this.each(function() {
        var A = $(this);
        A.hover(function() {
            A.addClass("hover")
        }, function() {
            A.removeClass("hover")
        })
    })
};
$.fn.isTimeline = function() {
    return this.each(function() {
        var A = $(this)
    })
};
$.fn.isDeviceFailNotice = function() {
    return this.each(function() {
        var A = $(this);
        var B = A.find("a.hide-fail-notice");
        var C = B.attr("id").replace("hide_device_", "");
        B.click(function() {
            $.ajax({type:"POST",dataType:"text",url:"/devices/update/" + C,data:{authenticity_token:twttr.form_authenticity_token,"device[fail_alert]":"0",twttr:true},success:function(D) {
                if (D.match(/success/)) {
                    A.fadeOut(200)
                } else {
                    twttr.error()
                }
            },beforeSend:twttr.loading,complete:twttr.loaded});
            return false
        })
    })
};
$.fn.isDeleteable = function(A) {
    this.unbind("click");
    this.click(function() {
        var E = $(this);
        var B = E.parents(".hentry:first");
        var G = B.attr("id").split("_").last();
        var F = B.hasClass("latest-status");
        var D;
        var C = "update";
        if (B.hasClass("status")) {
            D = "/status/destroy"
        } else {
            if (B.hasClass("direct_message")) {
                D = "/direct_messages/destroy";
                C = "direct message"
            }
        }
        if (confirm("Sure you want to delete this " + C + "? There is NO undo!")) {
            gaTrack(D + "/refresh/" + G);
            $.ajax({type:"POST",url:D + "/" + G,data:{authenticity_token:twttr.form_authenticity_token},dataType:(D == "/status/destroy" ? "json" : null),beforeSend:function() {
                E.attr("title", "").removeClass("del").addClass("del-throb")
            },success:function(H) {
                var I = B.parents(".conversation");
                var J = I.get(0) ? I : B;
                J.fadeOut(500, function() {
                    J.remove();
                    if (D == "/status/destroy") {
                        processJson(H);
                        updateLatest(F)
                    }
                })
            }})
        }
    })
};
$.fn.isFavoriteable = function(A) {
    this.unbind("click");
    this.click(function() {
        var D = $(this);
        var B = D.parents(".hentry:first");
        var F = B.attr("id").replace(/status_/, "");
        var E = D.hasClass("fav");
        var C = E ? "destroy" : "create";
        twttr.googleAnalytics("/favorites/" + C + "/refresh/" + F);
        $.ajax({type:"POST",url:"/favorites/" + C + "/" + F,data:{authenticity_token:twttr.form_authenticity_token},beforeSend:function() {
            D.attr("title", "").removeClass(E ? "fav" : "non-fav").addClass("fav-throb")
        },success:function() {
            if ($("body#favourings").hasClass("favourings") && A.hideUnfavorited) {
                B.fadeOut(500, function() {
                    B.remove()
                })
            } else {
                D.attr("title", (E ? "favorite" : "un-favorite") + " this update").removeClass("fav-throb").addClass(E ? "non-fav" : "fav")
            }
        }});
        return false
    })
};
$.fn.isReplyable = function() {
    this.unbind("click");
    this.click(function() {
        var E = $(this);
        var C = E.parents(".hentry:first");
        var G = C.attr("id").replace(/status_/, "");
        var A = C.attr("class").match(/u-([A-Za-z0-9_]+)/);
        var B = A[1];
        if (!B) {
            alert(_("Whoops! Something went wrong. Please refresh the page and try again!"));
            return
        }
        var F = $("#status,#text");
        if (C.hasClass("status")) {
            F.val("@" + B + " " + F.val().replace(RegExp("@" + B + " ?", "i"), "")).trigger("update").focusEnd();
            $("#in_reply_to_status_id").val(G);
            $("#in_reply_to").val(B);
            window.scroll(0, 0)
        } else {
            if (C.hasClass("direct_message")) {
                var D = $("#direct_message_user_id");
                if (!D.find("option[@text='" + B + "']").attr("selected", true).length) {
                    D.append('<option value="' + B + '" selected="selected">' + B + "</option>")
                }
                F.trigger("update").focusEnd()
            }
        }
        window.scroll(0, 0);
        return false
    })
};
$.fn.isDeleteable = function(A) {
    this.unbind("click");
    this.click(function() {
        var D = $(this);
        var B = D.parents(".hentry:first");
        var F;
        var E = B.hasClass("latest-status");
        var C;
        if (B.hasClass("status")) {
            C = "/status/destroy";
            F = B.attr("id").replace(/status_/, "")
        } else {
            if (B.hasClass("direct_message")) {
                F = B.attr("id").replace(/direct_message_/, "");
                C = "/direct_messages/destroy"
            }
        }
        if (confirm("Sure you want to delete this update? There is NO undo!")) {
            twttr.googleAnalytics(C + "/refresh/" + F);
            $.ajax({type:"POST",url:C + "/" + F,data:{authenticity_token:twttr.form_authenticity_token,latest_status:E},dataType:(C == "/status/destroy" ? "json" : null),beforeSend:function() {
                D.attr("title", "").removeClass("del").addClass("del-throb")
            },success:function(G) {
                var H = B.parents(".conversation");
                var I = H.get(0) ? H : B;
                I.fadeOut(500, function() {
                    I.remove();
                    if (C == "/status/destroy") {
                        if (E) {
                            twttr.processJson(G);
                            updateLatest()
                        }
                    }
                })
            }})
        }
        return false
    })
};
function updateLatest() {
    var A = $("#latest_status");
    if (A.length) {
        $.debug("updating latest status.");
        A.isCurrentStatus(true)
    }
    $.debug("class-ifying latest status.");
    $("#timeline tr.hentry:first").addClass("latest-status")
}
;
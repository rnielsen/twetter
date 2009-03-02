function initializeTimeline() {
    $("#timeline").Timeline($.Page)
}
(function() {
    $(document).ready(function() {
        $().Page();
        initializeTimeline();
        $("#pagination .more").isMoreButton()
    });
    $.fn.Page = function() {
        var A = $('meta[name="session-user-screen_name"]:first').get(0);
        var C = $('meta[name="page-user-screen_name"]:first').get(0);
        var B = A && C && A.content == C.content;
        $.Page = $.extend($.Page || {}, {timeline:null,sessionUserScreenName:(A ? A.content : null),pageUserScreenName:(C ? C.content : null),loggedIn:$('meta[name="session-loggedin"][content="y"]').length > 0,replyable:$("body.replyable").get(0),hideUnfavorited:B})
    };
    $.fn.Timeline = function(A) {
        $.Page.timeline = $(this);
        return this.each(function() {
            var B = $(this);
            var C = {};
            $.Timeline.settings = settings = $.extend({}, $.Timeline.defaults, A);
            var D = B.find(".hentry");
            if (settings.loggedIn) {
                $.each($.Timeline.actions.tweet, function() {
                    this.apply(D, [settings])
                })
            }
        })
    };
    $.Timeline = {defaults:{timeline:$("#timeline")},prepend:function(A) {
        $.Timeline.settings.timeline.prepend(A)
    },append:function(A) {
        $.Timeline.settings.timeline.append(A)
    },actions:{tweet:{isHoverable:function(A) {
        if ($("body.ie,body.ie6").get(0)) {
            return this.livequery(function() {
                var B = $(this);
                B.hover(function() {
                    console.log(B);
                    B.addClass("hover")
                }, function() {
                    B.removeClass("hover")
                })
            })
        }
    },isFavoriteable:function(A) {
        return this.find(".fav-action").livequery(function() {
            var B = $(this);
            B.click(function() {
                var C = B.parents(".hentry:first");
                var F = C.attr("id").replace(/status_/, "");
                var E = B.hasClass("fav");
                var D = E ? "destroy" : "create";
                twttr.googleAnalytics("/favorites/" + D + "/refresh/" + F);
                $.ajax({type:"POST",url:"/favorites/" + D + "/" + F,data:{authenticity_token:twttr.form_authenticity_token},beforeSend:function() {
                    B.attr("title", "").removeClass(E ? "fav" : "non-fav").addClass("fav-throb");
                    twttr.loading()
                },success:function() {
                    if ($("body#favourings").hasClass("favourings") && A.hideUnfavorited) {
                        C.fadeOut(500, function() {
                            C.remove()
                        })
                    } else {
                        B.attr("title", (E ? "favorite" : "un-favorite") + " this update").removeClass("fav-throb").addClass(E ? "non-fav" : "fav")
                    }
                }});
                return false
            })
        })
    },isReplyable:function(A) {
        if (A.replyable) {
            return this.find(".reply").livequery(function() {
                var B = $(this);
                B.click(function() {
                    var E = B.parents(".hentry:first");
                    var H = E.attr("id").replace(/status_/, "");
                    var C = E.attr("class").match(/u-([A-Za-z0-9_]+)/);
                    var D = C[1];
                    if (!D) {
                        alert(_("Whoops! Something went wrong. Please refresh the page and try again!"));
                        return
                    }
                    var G = $("#status,#text");
                    if (E.hasClass("status")) {
                        twttr.googleAnalytics("/reply/" + D + "/" + H);
                        G.val("@" + D + " " + G.val().replace(RegExp("@" + D + " ?", "i"), "")).trigger("update").focusEnd();
                        $("#in_reply_to_status_id").val(H);
                        $("#in_reply_to").val(D);
                        window.scroll(0, 0)
                    } else {
                        if (E.hasClass("direct_message")) {
                            twttr.googleAnalytics("/direct_messages/reply/" + D + "/" + H);
                            var F = $("#direct_message_user_id");
                            if (!F.find("option[text='" + D + "']").attr("selected", true).length) {
                                F.append('<option value="' + D + '" selected="selected">' + D + "</option>")
                            }
                            G.trigger("update").focusEnd()
                        }
                    }
                    window.scroll(0, 0);
                    return false
                })
            })
        }
    },isDeleteable:function(A) {
        return this.find(".del").livequery(function() {
            var B = $(this);
            B.click(function() {
                var C = B.parents(".hentry:first");
                var F;
                var E = C.hasClass("latest-status");
                var D;
                if (C.hasClass("status")) {
                    D = "/status/destroy";
                    F = C.attr("id").replace(/status_/, "")
                } else {
                    if (C.hasClass("direct_message")) {
                        F = C.attr("id").replace(/direct_message_/, "");
                        D = "/direct_messages/destroy"
                    }
                }
                if (confirm("Sure you want to delete this update? There is NO undo!")) {
                    twttr.googleAnalytics(D + "/refresh/" + F);
                    $.ajax({type:"POST",url:D + "/" + F,data:{authenticity_token:twttr.form_authenticity_token,latest_status:E},dataType:(D == "/status/destroy" ? "json" : null),beforeSend:function() {
                        B.attr("title", "").removeClass("del").addClass("del-throb")
                    },success:function(G) {
                        var H = C.parents(".conversation");
                        var I = H.get(0) ? H : C;
                        I.fadeOut(500, function() {
                            I.remove();
                            if (D == "/status/destroy") {
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
        })
    }}}}
})();
(function() {
    $.fn.isMoreButton = function() {
        return this.livequery(function() {
            var A = $(this);
            A.click(function() {
                var C = $(this);
                C.blur();
                var B = C.parents("form").attr("action");
                twttr.googleAnalytics(B.split(/\?/)[0] + "/refresh");
                $.ajax({type:"GET",url:B,dataType:"json",beforeSend:function() {
                    $("#pagination").addClass("loading");
                    A.attr("disabled", "disabled").css("visibility", "hidden")
                },success:function(D) {
                    $("#timeline").append($(D["#timeline"]).find(".hentry"));
                    $("#pagination").html(D["#pagination"])
                },error:function() {
                    alert(_("Whoops! Something went wrong. Please try refreshing the page."))
                }});
                return false
            })
        })
    }
})();
(function() {
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
    }
})();
function updateLatest() {
    var A = $("#latest_status");
    if (A.length) {
        A.isCurrentStatus(true)
    }
    $("#timeline li:first").addClass("latest-status")
}
$.fn.isLoading = function() {
    $(this).addClass("loading");
    twttr.loading()
};
$.fn.isLoaded = function() {
    $(this).removeClass("loading");
    twttr.loaded()
};
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
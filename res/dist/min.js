"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    var TextEditor = function () {
        /**
         * Setup of object.
         */
        function TextEditor(editor) {
            _classCallCheck(this, TextEditor);

            document.execCommand("styleWithCSS", null, true);

            // HTML element.
            this.editor = editor;

            // For switching mode WYSIWYG / HTML.
            this.mode_wysiwyg = true;

            // For the selection.
            this.global_range = null;

            // Call Command.
            this.commands = {
                // Basic formatage.
                "bold": "bold",
                "italic": "italic",
                "underline": "underline",
                "strikethrough": "strikethrough",
                "clear": "removeFormat",
                // Alignement.
                "justifyleft": "justifyleft",
                "justifyright": "justifyright",
                "justifycenter": "justifycenter",
                "justifyfull": "justifyfull",
                "outdent": "outdent",
                "indent": "indent",
                // List.
                "unorderedlist": "insertunorderedlist",
                "orderedlist": "insertorderedlist",
                // Externe.
                "link": "createLink"
            };

            // Reset textarea.
            this.editor.find("textarea.content").val("");

            // If there is a save, it's loaded.
            if (this.editor.find("input[name='load_content']").val() == 1) {
                this.editor.find("div.content").html(localStorage.getItem("editor_save"));
            }

            this.handle_event();

            this.handle_save();
        }

        _createClass(TextEditor, [{
            key: "command",
            value: function command(name, arg) {
                if (name === "createLink") {
                    arg = prompt("Quelle est l'adresse du lien ?");
                    if (!arg) {
                        return false;
                    }
                }
                if (typeof arg === "undefined" || !arg) {
                    arg = "";
                }
                document.execCommand(name, false, arg);
            }
        }, {
            key: "show_panel",
            value: function show_panel(button) {
                button.parent().parent().toggleClass("visible");
                button.parent().children().toggleClass("visible");
            }
        }, {
            key: "toggle_toolkit",
            value: function toggle_toolkit(button, class_css) {
                var show = !button.hasClass("active");
                // Reset other toolkit.
                this.editor.find(".toolkit").hide();
                this.editor.find(".button").removeClass("active");
                // Show toolkit.
                if (show) {
                    button.addClass("active");
                    button.next().show();
                    return true;
                } else {
                    button.removeClass("active");
                    return false;
                }
            }
        }, {
            key: "span_command",
            value: function span_command(style, value) {
                var selection = document.getSelection();
                var begin_node = selection.anchorNode;
                var end_node = selection.focusNode;
                if (begin_node !== end_node || selection.anchorOffset !== selection.focusOffset) {
                    // If there is a selection.
                    var id = Date.now();
                    if (begin_node.nodeName.toLowerCase() === "#text" && begin_node.parentNode.nodeName.toLowerCase() === "span" && begin_node.parentNode.childNodes.length === 1) {
                        begin_node = begin_node.parentElement;
                    }
                    if (begin_node.nodeName && begin_node.nodeName.toLowerCase() === "span" && begin_node.childNodes.length === 1) {
                        begin_node.style[style] = value;
                        begin_node.setAttribute("data-id", id);
                    } else {
                        var text = selection.toString();
                        text = text.replace(/\n/g, "<br/>");
                        this.command("insertHTML", "<span data-id='" + id + "' style='" + style + ":" + value + "px'>" + text + "</span>");
                    }
                    // Get element and set selection on it.
                    var span = this.editor.find("div.content span[data-id='" + id + "']");
                    span = span.first();
                    span.attr("data-id", null);
                    var range = document.createRange();
                    range.selectNode(span.node().childNodes[0]);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }, {
            key: "handle_event",
            value: function handle_event() {
                var that = this;

                var _loop = function _loop(name) {
                    that.editor.find(".button." + name).on("click", function () {
                        if (!this.parent().hasClass("disabled")) {
                            that.command(that.commands[name]);
                        }
                        return false;
                    });
                };

                for (var name in this.commands) {
                    _loop(name);
                }

                var _loop2 = function _loop2(i) {
                    that.editor.find(".button.h" + i).on("click", function () {
                        if (!this.parent().hasClass("disabled")) {
                            that.command("formatBlock", "<h" + i + ">");
                        }
                        return false;
                    });
                };

                for (var i = 1; i <= 4; i++) {
                    _loop2(i);
                }

                // Image Toolkit.
                that.editor.find(".button.image + .toolkit").hide();
                that.editor.find(".button.image").on("click", function () {
                    if (!this.parent().hasClass("disabled")) {
                        that.toggle_toolkit(this, "image");

                        // Sauvegarde de la sélection.
                        that.global_range = document.getSelection().getRangeAt(0);
                    }
                    return false;
                });

                // Insert image from computer (file to base64).
                that.editor.find(".button.image + .toolkit input[type='file']").on("change", function () {
                    if (this.element.files && this.element.files[0]) {
                        var fr = new FileReader();
                        fr.onload = function (e) {
                            var sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(that.global_range);
                            that.command("insertImage", e.target.result);
                            that.editor.find(".button.image").removeClass("active");
                            that.editor.find(".button.image + .toolkit").hide();
                        };
                        fr.readAsDataURL(this.element.files[0]);
                    }
                });

                // Insert image from url (url to base64).
                that.editor.find(".button.image + .toolkit input[type='text'] + button").on("click", function () {
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(that.global_range);
                    that.command("insertImage", this.prev().val());
                    that.editor.find(".button.image").removeClass("active");
                    that.editor.find(".button.image + .toolkit").hide();
                    return false;
                });

                // Size Toolkit.
                that.editor.find(".button.size + .toolkit").hide();
                that.editor.find(".button.size").on("click", function () {
                    if (!this.parent().hasClass("disabled")) {
                        that.toggle_toolkit(this, "size");
                    }
                    return false;
                });
                that.editor.find(".button.size + .toolkit input").on("input", function () {
                    this.next().element.innerText = this.val();
                    that.span_command("font-size", this.val() + "px");
                });

                // Color Toolkit.
                that.editor.find(".button.color + .toolkit").hide();
                that.editor.find(".button.color").on("click", function () {
                    if (!this.parent().hasClass("disabled")) {
                        if (that.toggle_toolkit(this, "color")) {
                            var div = that.editor.find(".button.color + .toolkit .palette button");
                            for (var i = 0; i < div.size(); i++) {
                                var d = div.eq(i);
                                d.element.style.backgroundColor = d.get("data-color");
                            }
                        }
                    }
                    return false;
                });

                that.editor.find(".button.color + .toolkit .palette button").on("click", function () {
                    that.span_command("color", this.get("data-color"));
                    that.editor.find(".button.color").toggleClass("active");
                    that.editor.find(".button.color + .toolkit").toggle();
                    return false;
                });

                // Smiley toolkit.
                that.editor.find(".button.emoticone + .toolkit").hide();
                that.editor.find(".button.emoticone").on("click", function () {
                    if (!this.parent().hasClass("disabled")) {
                        that.toggle_toolkit(this, "emoticone");
                    }
                    return false;
                });
                that.editor.find(".button.emoticone + .toolkit img").on("click", function () {
                    that.command("insertImage", this.get("src"));
                    return false;
                });

                // HTML Editing.
                that.editor.find(".button.code").on("click", function () {
                    var div = that.editor.find("div.content");
                    var textarea = that.editor.find("textarea.content");
                    if (that.mode_wysiwyg) {
                        textarea.val(div.html());
                        that.editor.find("input[name='wysiwyg']").val(0);
                        div.html("");
                    } else {
                        div.html(textarea.val());
                        that.editor.find("input[name='wysiwyg']").val(1);
                        textarea.val("");
                    }
                    that.mode_wysiwyg = !that.mode_wysiwyg;
                    that.editor.find(".mode_wysiwyg").toggleClass("disabled");
                    div.toggleClass("hide");
                    textarea.toggleClass("hide");
                    return false;
                });
            }
        }, {
            key: "handle_save",
            value: function handle_save() {
                var _this = this;

                this.interval_save = setInterval(function () {
                    if (_this.mode_wysiwyg) {
                        localStorage.setItem("editor_save", _this.editor.find("div.content").html());
                    } else {
                        localStorage.setItem("editor_save", _this.editor.find("textarea.content").val());
                    }
                    var date = new Date();
                    var h = date.getHours();
                    if (h < 10) {
                        h = "0" + h;
                    }
                    var i = date.getMinutes();
                    if (i < 10) {
                        i = "0" + i;
                    }
                    var s = date.getSeconds();
                    if (s < 10) {
                        s = "0" + s;
                    }
                    var d = date.getDate();
                    if (d < 10) {
                        d = "0" + d;
                    }
                    var m = date.getMonth() + 1;
                    if (m < 10) {
                        m = "0" + m;
                    }
                    var y = date.getFullYear();
                    _this.editor.find(".save_info").html("Dernière sauvegarde : " + d + "/" + m + "/" + y + " à " + h + ":" + i + ":" + s);
                }, 10000);
            }
        }]);

        return TextEditor;
    }();

    fire.ready(function () {
        fire.get(".editor").each(function () {
            var editor = new TextEditor(this);
        });
    });
})();
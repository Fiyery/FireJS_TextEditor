'use strict';
var TextEditor = (function () {
    /**
     * Setup of object.
     */
    function TextEditor() {
        document.execCommand("styleWithCSS", null, true);
    }
    TextEditor.prototype.command = function (name, arg) {
        switch (name) {
            case 'createLink':
                arg = prompt("Quelle est l'adresse du lien ?");
                if (!arg) {
                    return false;
                }
                break;
        }
        if (typeof arg === 'undefined' || !arg) {
            arg = '';
        }
        document.execCommand(name, false, arg);
    };
    TextEditor.prototype.show_panel = function (button) {
        button.parentNode.parentNode.classList.toggle('visible');
        [].forEach.call(button.parentNode.children, function (item) {
            item.classList.toggle('visible');
        });
    };
    return TextEditor;
}());
var editor = new TextEditor();
fire.ready(function () {
    var content = fire.get('.editor .content')[0];
    var global_range = null;
    // Call Command.
    // Basic formatage.
    fire.get('.editor .button.bold').on('click', function () {
        editor.command('bold');
    });
    fire.get('.editor .button.italic').on('click', function () {
        editor.command('italic');
    });
    fire.get('.editor .button.underline').on('click', function () {
        editor.command('underline');
    });
    fire.get('.editor .button.strikethrough').on('click', function () {
        editor.command('strikethrough');
    });
    fire.get('.editor .button.clear').on('click', function () {
        editor.command('removeFormat');
    });
    // Alignement.
    fire.get('.editor .button.justifyleft').on('click', function () {
        editor.command('justifyleft');
    });
    fire.get('.editor .button.justifyright').on('click', function () {
        editor.command('justifyright');
    });
    fire.get('.editor .button.justifycenter').on('click', function () {
        editor.command('justifycenter');
    });
    fire.get('.editor .button.justifyfull').on('click', function () {
        editor.command('justifyfull');
    });
    fire.get('.editor .button.indent').on('click', function () {
        editor.command('indent');
    });
    fire.get('.editor .button.outdent').on('click', function () {
        editor.command('outdent');
    });
    // Heading.
    fire.get('.editor .button.h1').on('click', function () {
        editor.command('heading', 'h1');
    });
    fire.get('.editor .button.h2').on('click', function () {
        editor.command('heading', 'h2');
    });
    fire.get('.editor .button.h3').on('click', function () {
        editor.command('heading', 'h3');
    });
    fire.get('.editor .button.h4').on('click', function () {
        editor.command('heading', 'h4');
    });
    // List.
    fire.get('.editor .button.unorderedlist').on('click', function () {
        editor.command('insertunorderedlist');
    });
    fire.get('.editor .button.orderedlist').on('click', function () {
        editor.command('insertorderedlist');
    });
    // Externe.
    fire.get('.editor .button.link').on('click', function () {
        editor.command('createLink');
    });
    fire.get('.group:last-child .button').on('click', function () {
        editor.show_panel(this);
    });
    // Image Toolkit.
    fire.get('.editor .button.image + .toolkit').hide();
    fire.get('.editor .button.image').on('click', function () {
        var show = (!this.hasClass('active'));
        // Reset other toolkit.
        fire.get('.editor .toolkit').hide();
        fire.get('.editor .button').removeClass('active');
        // Show toolkit.
        if (show) {
            this.addClass('active');
            fire.get('.editor .button.image + .toolkit').show();
        }
        else {
            this.removeClass('active');
        }
        // Sauvegarde de la sélection.
        global_range = document.getSelection().getRangeAt(0);
    });
    fire.get('.editor .button.image + .toolkit input[type="file"]').on('change', function () {
        if (this.element.files && this.element.files[0]) {
            var fr = new FileReader();
            fr.onload = function (e) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(global_range);
                editor.command('insertImage', e.target.result);
                fire.get('.editor .button.image').removeClass('active');
                fire.get('.editor .button.image + .toolkit').hide();
            };
            fr.readAsDataURL(this.element.files[0]);
        }
    });
    fire.get('.editor .button.image + .toolkit input[type="text"] + button').on('click', function () {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(global_range);
        editor.command('insertImage', this.prev().val());
        fire.get('.editor .button.image').removeClass('active');
        fire.get('.editor .button.image + .toolkit').hide();
    });
    // Size Toolkit.
    fire.get('.editor .button.size + .toolkit').hide();
    fire.get('.editor .button.size').on('click', function () {
        var show = (!this.hasClass('active'));
        // Reset other toolkit.
        fire.get('.editor .toolkit').hide();
        fire.get('.editor .button').removeClass('active');
        // Show toolkit.
        if (show) {
            this.addClass('active');
            fire.get('.editor .button.size + .toolkit').show();
        }
        else {
            this.removeClass('active');
        }
    });
    fire.get('.editor .button.size + .toolkit input').on('input', function () {
        this.next().element.innerText = this.val();
        var selection = document.getSelection();
        var begin_node = selection.anchorNode;
        var end_node = selection.focusNode;
        if (begin_node !== end_node || selection.anchorOffset !== selection.focusOffset) {
            var id = Date.now();
            if (begin_node.nodeName.toLowerCase() === '#text' && begin_node.parentNode.nodeName.toLowerCase() === 'span' && begin_node.parentNode.childNodes.length === 1) {
                begin_node = begin_node.parentElement;
            }
            if (begin_node.nodeName && begin_node.nodeName.toLowerCase() === 'span' && begin_node.childNodes.length === 1) {
                begin_node.style['font-size'] = this.val() + 'px';
                begin_node.setAttribute('data-id', id);
            }
            else {
                var text = selection.toString();
                text = text.replace(/\n/g, '<br/>');
                editor.command('insertHTML', "<span data-id='" + id + "' style='font-size:" + this.val() + "px'>" + text + '</span>');
            }
            // Get element and set selection on it.
            var span = fire.get('.editor .content span[data-id="' + id + '"]');
            span = span[0];
            span.set('data-id', null);
            var range = document.createRange();
            range.selectNode(span.element.childNodes[0]);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });
    // Color Toolkit.
    fire.get('.editor .button.color + .toolkit').hide();
    fire.get('.editor .button.color').on('click', function () {
        var show = (!this.hasClass('active'));
        // Reset other toolkit.
        fire.get('.editor .toolkit').hide();
        fire.get('.editor .button').removeClass('active');
        // Show toolkit.
        if (show) {
            this.addClass('active');
            fire.get('.editor .button.color + .toolkit').show();
            var div = fire.get('.editor .button.color + .toolkit .palette button');
            for (var i = 0; i < div.length; i++) {
                var d = div[i];
                d.element.style.backgroundColor = d.get('data-color');
            }
        }
        else {
            this.removeClass('active');
        }
    });
    fire.get('.editor .button.color + .toolkit .palette button').on('click', function () {
        var selection = document.getSelection();
        var begin_node = selection.anchorNode;
        var end_node = selection.focusNode;
        if (begin_node !== end_node || selection.anchorOffset !== selection.focusOffset) {
            var id = Date.now();
            if (begin_node.nodeName.toLowerCase() === '#text' && begin_node.parentNode.nodeName.toLowerCase() === 'span' && begin_node.parentNode.childNodes.length === 1) {
                begin_node = begin_node.parentElement;
            }
            if (begin_node.nodeName && begin_node.nodeName.toLowerCase() === 'span' && begin_node.childNodes.length === 1) {
                begin_node.style['color'] = this.get('data-color');
                begin_node.setAttribute('data-id', id);
            }
            else {
                var text = selection.toString();
                text = text.replace(/\n/g, '<br/>');
                editor.command('insertHTML', "<span data-id='" + id + "' style='color:" + this.get('data-color') + "'>" + text + '</span>');
            }
            // Get element and set selection on it.
            var span = fire.get('.editor .content span[data-id="' + id + '"]');
            span = span[0];
            span.set('data-id', null);
            var range = document.createRange();
            range.selectNode(span.element);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            fire.get('.editor .button.color').toggleClass('active');
            fire.get('.editor .button.color + .toolkit').toggle();
        }
    });
});

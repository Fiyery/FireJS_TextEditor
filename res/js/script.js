'use strict';

class TextEditor {
    /**
     * Setup of object.
     */
    constructor(editor) {
        document.execCommand("styleWithCSS", null, true);

        // HTML element.
        this.editor = editor;
        this.content = this.editor.find(".content");

        // For the selection.
        this.global_range = null;

        // Call Command.
        this.commands = {
            // Basic formatage.
            'bold' : 'bold',
            'italic' : 'italic',
            'underline' : 'underline',
            'strikethrough' : 'strikethrough',
            'clear' : 'removeFormat',
            // Alignement.
            'justifyleft' : 'justifyleft',
            'justifyright' : 'justifyright',
            'justifycenter' : 'justifycenter',
            'justifyfull' : 'justifyfull',
            'outdent' : 'outdent',
            'indent' : 'indent',
            // List.
            'unorderedlist' : 'insertunorderedlist',
            'orderedlist' : 'insertorderedlist',
            // Externe.
            'link' : 'createLink',
        };

        this.handle_event();
    }

    command(name, arg) {
        if (name === 'createLink') {
            arg = prompt("Quelle est l'adresse du lien ?");
            if (!arg) {
                return false;
            }
        }
        if (typeof arg === 'undefined' || !arg) {
            arg = '';
        }
        document.execCommand(name, false, arg);
    }

    show_panel(button) {
        button.parent().parent().toggleClass('visible');
        button.parent().children().toggleClass('visible');
    }

    toggle_toolkit(button, class_css) {
        let show = (!button.hasClass('active'));
        // Reset other toolkit.
        this.editor.find('.toolkit').hide();
        this.editor.find('.button').removeClass('active');
        // Show toolkit.
        if (show) {
            button.addClass('active');
            button.next().show();
            return true;
        } else {
            button.removeClass('active');
            return false;
        }
    }

    span_command(style, value) {
        let selection = document.getSelection();
        let begin_node = selection.anchorNode;
        let end_node = selection.focusNode;
        if (begin_node !== end_node || selection.anchorOffset !== selection.focusOffset) { // If there is a selection.
            let id = Date.now();
            if (begin_node.nodeName.toLowerCase() === '#text' && begin_node.parentNode.nodeName.toLowerCase() === 'span' && begin_node.parentNode.childNodes.length === 1) {
                begin_node = begin_node.parentElement;
            }
            if (begin_node.nodeName && begin_node.nodeName.toLowerCase() === 'span' && begin_node.childNodes.length === 1) {
                begin_node.style[style] = value;
                begin_node.setAttribute('data-id', id);
            } else {
                let text = selection.toString();
                text = text.replace(/\n/g, '<br/>');
                this.command('insertHTML', "<span data-id='"+id+"' style='"+style+":" + value + "px'>" + text + '</span>');
            }
            // Get element and set selection on it.
            let span = this.content.find('span[data-id="'+id+'"]');
            span = span[0];
            span.set('data-id', null);
            let range = document.createRange();
            range.selectNode(span.element.childNodes[0]);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    handle_event() {
        let that = this;

        for(let name in this.commands) {
            that.editor.find('.button.'+name).on('click', function(){
                that.command(that.commands[name]);
            });
        }

        for(let i = 1; i <= 4; i++) {
            that.editor.find('.button.h'+i).on('click', function(){
                that.command('formatBlock', '<h'+i+'>');
            });
        }

        fire.get('.group .button.extend_panel').on('click', function(){
            that.show_panel(this);
        });

        // Image Toolkit.
        that.editor.find('.button.image + .toolkit').hide();
        that.editor.find('.button.image').on('click', function(){
            that.toggle_toolkit(this, 'image');

            // Sauvegarde de la sélection.
            that.global_range = document.getSelection().getRangeAt(0);
        });

        // Insert image from computer (file to base64).
        that.editor.find('.button.image + .toolkit input[type="file"]').on('change', function(){
            if (this.element.files && this.element.files[0]) {
                let fr = new FileReader();
                fr.onload = function(e) {
                    let sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(that.global_range);
                    that.command('insertImage', e.target.result);
                    that.editor.find('.button.image').removeClass('active');
                    that.editor.find('.button.image + .toolkit').hide();
                };       
                fr.readAsDataURL( this.element.files[0]);
            }
        });
        // Insert image from url (url to base64).
        that.editor.find('.button.image + .toolkit input[type="text"] + button').on('click', function(){
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(that.global_range);
            that.command('insertImage', this.prev().val());
            that.editor.find('.button.image').removeClass('active');
            that.editor.find('.button.image + .toolkit').hide();
        });


        // Size Toolkit.
        that.editor.find('.button.size + .toolkit').hide();
        that.editor.find('.button.size').on('click', function(){
            that.toggle_toolkit(this, 'size');
        });
        that.editor.find('.button.size + .toolkit input').on('input', function() {
            this.next().element.innerText = this.val();
            that.span_command('font-size', this.val()+'px');
        });

        // Color Toolkit.
        that.editor.find('.button.color + .toolkit').hide();
        that.editor.find('.button.color').on('click', function(){
            if (editor.toggle_toolkit(this, 'color')) {
                let div = that.editor.find('.button.color + .toolkit .palette button');
                for (let i = 0; i < div.length; i++) {
                    let d = div[i];
                    d.element.style.backgroundColor = d.get('data-color');
                }
            }
        });
        that.editor.find('.button.color + .toolkit .palette button').on('click', function(){
            that.span_command('color', this.get('data-color'));
            that.editor.find('.button.color').toggleClass('active');
            that.editor.find('.button.color + .toolkit').toggle();
        });

        // Smiley toolkit.
        that.editor.find('.button.emoticone + .toolkit').hide();
        that.editor.find('.button.emoticone').on('click', function(){
            that.toggle_toolkit(this, 'emoticone');
        });
        that.editor.find('.button.emoticone + .toolkit img').on('click', function(){
            that.command('insertImage', this.get('src'));
        });
    }
}


fire.ready(function(){
    let content = fire.get('.editor').each(function(){
        let editor = new TextEditor(this);
    });
});

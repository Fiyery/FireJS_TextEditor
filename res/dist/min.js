'use strict';
var TextEditor = (function () {
    function TextEditor() {
    }
    TextEditor.prototype.command = function (name, arg) {
        switch (name) {
            case 'createLink':
                arg = prompt("Quelle est l'adresse du lien ?");
                if (!arg) {
                    return false;
                }
                break;
            case 'insertImage':
                arg = prompt("Quelle est l'adresse de l'image ?");
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
    fire.get('.editor .button.image').on('click', function () {
        editor.command('insertImage');
    });
    fire.get('.group:last-child .button').on('click', function () {
        editor.show_panel(this);
    });
    // Toolkit.
    fire.get('.editor .button.size').on('click', function () {
        fire.get('.editor .button.size + .toolkit').toggle();
    });
});

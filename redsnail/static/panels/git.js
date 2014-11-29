define(['jquery', 'phosphor'], function($, p) {
    "use strict";
    
    function GitPanel(src) {
        this.reporoot_elm = document.createElement('span');
        this.stage_elm = document.createElement('div');
        this.wd_elm = document.createElement('div');
        p.Widget.call(this);
    }

    p.inherits(GitPanel, p.Widget);
  
    GitPanel.prototype.createDOMNode = function() {
        return $('<div/>').append(
            $('<h2/>')
                .append($('<img/>').attr('src', '/static/git-logo.png')
                    .addClass('header-logo')
                )
                .append(' ').append(this.reporoot_elm)
            ).append(this.stage_elm)
            .append(this.wd_elm)
            [0];
    };
    
    var status_to_tile_class = {
        added: 'minitile-green',
        deleted: 'minitile-red',
    };
    var status_to_fa_icon = {
        added: 'fa-plus-circle',
        deleted: 'fa-minus-circle',
        modified: 'fa-circle-o',
        unknown: 'fa-question',
    };
    
    function item_to_tile(item) {
        var tile = $('<div/>').addClass('minitile')
            .append($('<i/>').addClass('fa ' + status_to_fa_icon[item.status]))
            .append($('<span/>').addClass('tiletext').text(item.path));
        
        var tile_class = status_to_tile_class[item.status];
        if (tile_class)  tile.addClass(tile_class);
        return tile;
    }

    GitPanel.prototype.on_update = function(data) {
        $(this.reporoot_elm).text(data.reporoot);
        var stage = $(this.stage_elm);
        stage.empty();
        console.log(data);
        for (var i=0; i < data.stage.length; i++) {
            stage.append(item_to_tile(data.stage[i]));
        }
        var wd = $(this.wd_elm);
        wd.empty();
        data.wd.forEach(function(item) {
            wd.append(item_to_tile(item));
        });
    };
    
    return GitPanel;
});

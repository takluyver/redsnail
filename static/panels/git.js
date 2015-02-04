define(['jquery', 'phosphor'], function($, p) {
    "use strict";
    
    function GitPanel(src) {
        this.reporoot_elm = document.createElement('span');
        this.stage_elm = document.createElement('div');
        this.wd_elm = document.createElement('div');
        this.branch_name = document.createElement('span');
        this.last_commit_msg = document.createElement('span');
        this.last_commit_hash = document.createElement('span');
        this.last_commit_time = document.createElement('span');
        p.Widget.call(this);
    }

    p.inherits(GitPanel, p.Widget);
  
    GitPanel.prototype.createDOMNode = function() {
        return $('<div/>').addClass('git-panel')
            .append($('<h2/>')
                .append($('<img/>').attr('src', '/static/git-logo.png')
                    .addClass('header-logo')
                )
                .append(' ').append(this.reporoot_elm)
            ).append(
                $('<div/>').addClass('info-bar')
                    .append($('<div/>').css('float', 'right')
                        // Branch name
                        .append($('<i/>').addClass('fa fa-code-fork fa-lg'))
                        .append(' ')
                        .append(this.branch_name)
                    )
                    // Last commit info
                    .append(' Last commit: ')
                    .append($(this.last_commit_msg)
                        .css('font-style','italic')
                    )
                    .append(' · ')
                    .append(this.last_commit_time)
                    .append(' · ')
                    .append($(this.last_commit_hash)
                        .css('vertical-align','middle')
                        .css('font-family','mono')
                        .css('font-size','8pt')
                    )
            ).append(
                // Staged changes
                $('<div/>').addClass('stage-container')
                    .append($('<div/>').text('Stage')
                        .css('float', 'right').css('padding','5px')
                        .css('font-size', '15pt').css('color','#888')
                    ).append(this.stage_elm)
                    .append($('<div/>').css('clear', 'right')) // Ensure 'stage' stays inside the box
            ).append(
                // Hints for staging and unstaging
                $('<div/>').addClass('transitions')
                .append($('<div/>').addClass('transition-tile')
                    .append($('<i/>').addClass('fa fa-arrow-up'))
                    .append(' git add <i>file</i>'))
                .append($('<div/>').addClass('transition-tile')
                    .append($('<i/>').addClass('fa fa-arrow-down'))
                    .append(' git reset HEAD <i>file</i>'))
            ).append(
                // Unstaged changes
                $('<div/>').addClass('wd-container')
                .append(this.wd_elm)
            ).append(
                // Hint for discarding changes
                $('<div/>').addClass('transitions')
                .append($('<div/>').addClass('transition-tile')
                    .append($('<i/>').addClass('fa fa-arrow-down'))
                    .append(' git checkout -- <i>file</i>'))
            )[0];
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
        $(this.branch_name).text(data.branch);
        $(this.last_commit_msg).text(data.commit.message);
        $(this.last_commit_hash).text(data.commit.shorthash);
        $(this.last_commit_time).text(data.commit.reltime);
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

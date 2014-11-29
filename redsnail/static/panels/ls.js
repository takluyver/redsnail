define(['jquery', 'phosphor'], function($, p) {
    
  function LsPanel(src) {
    this.path_elm = document.createElement('span');
    this.contents_elm = document.createElement('div');
    p.Widget.call(this);
  }

  p.inherits(LsPanel, p.Widget);
  
  LsPanel.prototype.createDOMNode = function() {
    return $('<div/>').append(
        $('<h2/>').append($('<i/>').addClass('fa fa-folder-open-o'))
            .append(' ').append(this.path_elm)
        ).append(this.contents_elm)
        [0];
    };

    LsPanel.prototype.on_update = function(data) {
        $(this.path_elm).text(data.path);
        contents = $(this.contents_elm);
        contents.empty();
        var dir, file, tile;
        for (var i=0; i < data.dirs.length; i++) {
            dir = data.dirs[i];
            tile = $('<div/>').addClass('minitile')
                .append($('<i/>').addClass('fa fa-folder-open'))
                .append($('<span/>').addClass('tiletext').text(dir));
            contents.append(tile);
        }
        for (var i=0; i < data.files.length; i++) {
            file = data.files[i];
            tile = $('<div/>').addClass('minitile')
                .append($('<i/>').addClass('fa fa-file-o'))
                .append($('<span/>').addClass('tiletext').text(file));
            contents.append(tile);
        }
    };
    
    return LsPanel;
});

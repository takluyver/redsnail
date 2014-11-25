window.onload = function() {
    var protocol = (window.location.protocol.indexOf("https") === 0) ? "wss" : "ws";
    var ws_url = protocol+"://"+window.location.host+ document.body.dataset.wsUrlPath;

    var ws = new WebSocket(ws_url);

    var panel_widget = new phosphor.Widget();
    //var git_widget = new phosphor.Widget()

    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        var panel = $(panel_widget.domNode());
        panel.empty();
        panel.append($('<h2/>')
            .append($('<i/>').addClass('fa fa-folder-open-o'))
            .append(' ' + msg.data.path)
        )
        var dir, file, tile;
        for (var i=0; i < msg.data.dirs.length; i++) {
            dir = msg.data.dirs[i];
            tile = $('<div/>').addClass('minitile')
                .append($('<i/>').addClass('fa fa-folder-open'))
                .append($('<span/>').addClass('tiletext').text(dir));
            panel.append(tile);
        }
        for (var i=0; i < msg.data.files.length; i++) {
            file = msg.data.files[i];
            tile = $('<div/>').addClass('minitile')
                .append($('<i/>').addClass('fa fa-file-o'))
                .append($('<span/>').addClass('tiletext').text(file));
            panel.append(tile);
        }
    };
    
  function tabBarFactory() {
    var tabBar = new phosphor.TabBar();
    tabBar.setTabOverlap(-1);
    tabBar.setTabWidth(130);
    return tabBar;
  }

  var area = new phosphor.DockArea(tabBarFactory);

  area.insertWidget('Files', panel_widget, phosphor.DockMode.TabBefore);
  //area.insertWidget('Git', git_widget, phosphor.DockMode.TabBefore);

  area.mount(document.body);

  window.onresize = function() {
    area.resize();
  };
};

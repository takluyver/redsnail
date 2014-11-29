require(['jquery', 'phosphor', 'panels/ls'], function($, phosphor, LsPanel) {
    var protocol = (window.location.protocol.indexOf("https") === 0) ? "wss" : "ws";
    var ws_url = protocol+"://"+window.location.host+ document.body.dataset.wsUrlPath;

    var ws = new WebSocket(ws_url);

    var ls_panel = new LsPanel();
    //var git_widget = new phosphor.Widget()

    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg.kind === 'update') {
            if (msg.panel === 'ls') {
                ls_panel.on_update(msg.data);
            }
        }
    };
    
  function tabBarFactory() {
    var tabBar = new phosphor.TabBar();
    tabBar.setTabOverlap(-1);
    tabBar.setTabWidth(130);
    return tabBar;
  }

  var area = new phosphor.DockArea(tabBarFactory);

  area.insertWidget('Files', ls_panel, phosphor.DockMode.TabBefore);
  //area.insertWidget('Git', git_widget, phosphor.DockMode.TabBefore);

  area.mount(document.body);

  window.onresize = function() {
    area.resize();
  };
});

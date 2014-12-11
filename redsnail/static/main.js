require(['jquery',
'phosphor', 
'panels/ls',
'panels/git',
],
function($, phosphor,
LsPanel,
GitPanel
) {
    var protocol = (window.location.protocol.indexOf("https") === 0) ? "wss" : "ws";
    var ws_url = protocol+"://"+window.location.host+ document.body.dataset.wsUrlPath;

    var ws = new WebSocket(ws_url);

    var panels = {
        'ls': new LsPanel(),
        'git': new GitPanel(),
    };
    var panel_titles = {
        'ls': 'Files',
        'git': 'Git',
    };

    var area = new phosphor.DockArea(tabBarFactory);

    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg.kind === 'update') {
            panel = panels[msg.panel];
            if (msg.relevance > 0) {
                panel.on_update(msg.data);
                title = panel_titles[msg.panel];
                area.insertWidget(title, panel, phosphor.DockMode.SplitBottom);
            } else {
                area.removeWidget(panel);
            }
        }
    };
    
  function tabBarFactory() {
    var tabBar = new phosphor.TabBar();
    tabBar.setTabOverlap(-1);
    tabBar.setTabWidth(130);
    return tabBar;
  }

  area.mount(document.body);

  window.onresize = function() {
    area.resize();
  };
});

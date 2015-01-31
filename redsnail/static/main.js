require(['jquery',
'phosphor', 
'termwidget',
'panels/ls',
'panels/git',
],
function($, phosphor,
termwidget,
LsPanel,
GitPanel
) {
    var protocol = (window.location.protocol.indexOf("https") === 0) ? "wss" : "ws";
    var ws_url = protocol+"://"+window.location.host+ document.body.dataset.wsUrlPath;
    var term_url = protocol+"://"+window.location.host+ document.body.dataset.termUrlPath;

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
    
    var terminal = new termwidget.TerminalWidget(term_url, {
        cols: 80,
        rows: 30,
    });
    area.insertWidget('Terminal', terminal, phosphor.DockMode.SplitBottom);
    area.insertWidget(panel_titles['ls'], panels['ls'], phosphor.DockMode.SplitRight);

    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg.kind === 'update') {
            panel = panels[msg.panel];
            if (msg.relevance > 0) {
                panel.on_update(msg.data);
                title = panel_titles[msg.panel];
                // Assume ls will always be there, and insert below it
                area.insertWidget(title, panel, phosphor.DockMode.SplitBottom, panels['ls']);
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

  // For debugging
  window.dockarea = area;
});

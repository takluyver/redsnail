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

    ws.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg.kind === 'update') {
            if (panels[msg.panel]) {
                panels[msg.panel].on_update(msg.data);
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

  area.insertWidget('Files', panels['ls'], phosphor.DockMode.TabBefore);
  area.insertWidget('Git', panels['git'], phosphor.DockMode.TabBefore);

  area.mount(document.body);

  window.onresize = function() {
    area.resize();
  };
});

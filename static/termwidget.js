define(['jquery', 'phosphor', 'termjs'], function($, p, termjs) {
    "use strict";

function TerminalWidget(ws_url, options) {
    p.Widget.call(this);
    this.addClass('terminal-widget');
    this._m_opts = options;
    this._m_term = null;
    this._m_socket = new WebSocket(ws_url);
    this._m_socket.onopen = this._connect.bind(this);
    this._m_socket.onclose = this._disconnect.bind(this);
}

p.inherits(TerminalWidget, p.Widget);

// Test size: 25x80
function termRowHeight(){ return 1.00 * $("#dummy-screen")[0].offsetHeight / 25;};
    // 1.02 here arrived at by trial and error to make the spacing look right
function termColWidth() { return 1.02 * $("#dummy-screen-rows")[0].offsetWidth / 80;};

TerminalWidget.prototype._connect = function() {
    var term = this._m_term = new Terminal(this._m_opts);
    var socket = this._m_socket;
    socket.send(JSON.stringify(["set_size", this._m_opts.rows, this._m_opts.cols,
                                    window.innerHeight, window.innerWidth]));
    term.on('data', function(data) {
        socket.send(JSON.stringify(['stdin', data]));
    });
    
    term.on('title', function(title) {
        document.title = title;
    });
    
    term.open(this.domNode());
    
    socket.onmessage = function(event) {
        var json_msg = JSON.parse(event.data);
        switch(json_msg[0]) {
            case "stdout":
                term.write(json_msg[1]);
                break;
            case "disconnect":
                term.write("\r\n\r\n[CLOSED]\r\n");
                break;
        }
    };
};

TerminalWidget.prototype._disconnect = function() {
    this._m_term.destroy();
    this._m_term = null;
};

TerminalWidget.prototype.requiresResize = true;

TerminalWidget.prototype.computeResize = function() {
    var e = this.domNode();
    var r = this._m_opts.rows = Math.min(1000, Math.max(20,
                            Math.floor(e.clientHeight/termRowHeight())-1));
    var c = this._m_opts.cols = Math.min(1000, Math.max(40,
                            Math.floor(e.clientWidth/termColWidth())-1));
    console.log("resize terminal to :", r , 'rows by ', c, 'columns');
};

TerminalWidget.prototype.applyResize = function() {
    if (this._m_term === null) {
        return
    }
    this._m_term.resize(this._m_opts.cols, this._m_opts.rows);
    this._m_socket.send(JSON.stringify(["set_size",
                                    this._m_opts.rows, this._m_opts.cols]));
};

return {TerminalWidget: TerminalWidget};

});

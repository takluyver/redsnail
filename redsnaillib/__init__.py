import os
import json
import re
import tornado.ioloop
import tornado.httpserver
import tornado.netutil
import tornado.web
from tornado.websocket import WebSocketHandler
import terminado
import webbrowser

from os.path import dirname, join as pjoin

from .panels.ls import LsPanel
from .panels.git import GitPanel

import logging
log = logging.getLogger(__name__)

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")

class PanelsSocket(WebSocketHandler):
    def open(self):
        self.application.settings['coordinator'].websockets.append(self)

    def on_close(self):
        self.application.settings['coordinator'].websockets.remove(self)

class PageHandler(tornado.web.RequestHandler):
    def get(self):
        return self.render("eg.html", static=self.static_url,
                           ws_url_path="/websocket",
                           term_url_path="/terminalsocket",
                          )

bash_hist_line_re = re.compile(r'\s*(\d+)\s+(.*)$')

class Coordinator:
    def __init__(self, loop):
        self.pipebuffer = b''
        self.websockets = []
        self.panels = [LsPanel(self), GitPanel(self)]
        self.currentdir = None
        self.last_hist_number = None
        pipe_path = os.path.join(os.environ['XDG_RUNTIME_DIR'], 'redsnail_pipe')
        try:
            os.mkfifo(pipe_path, 0o644)
        except FileExistsError:
            pass
        self.pipefd = os.open(pipe_path, os.O_RDWR)
        loop.add_handler(self.pipefd, self.read_data, loop.READ)

    def read_data(self, fd, events):
        while True:
            newdata = os.read(self.pipefd, 1024)
            self.pipebuffer += newdata
            if len(newdata) < 1024:
                break

        if b'\x1e' in self.pipebuffer:  # Record separator
            *_, line, self.pipebuffer = self.pipebuffer.split(b'\x1e')
            self.got_prompt_data(line.decode('utf-8'))
        else:
            print(len(self.pipebuffer))

    def broadcast_json(self, data):
        for ws in self.websockets:
            ws.write_message(json.dumps(data))

    def got_prompt_data(self, data):
        units = data.split('\x1f')  # Unit separator
        event = {'last_command': ''}
        for unit in units:
            kind, data = unit.split(':', 1)
            if kind == 'PWD':
                event['pwd'] = data
                event['changed_directory'] = (data != self.currentdir)
                self.currentdir = data
            elif kind == 'HIST1':
                num, line = bash_hist_line_re.match(data).groups()
                if num != self.last_hist_number:
                    event['last_command'] = line
                    self.last_hist_number = num

        #print(event)

        for panel in self.panels:
            panel.on_prompt(event)

def bind_to_random_port(app):
    sockets = tornado.netutil.bind_sockets(0, 'localhost')
    server = tornado.httpserver.HTTPServer(app)
    server.add_sockets(sockets)

    for s in sockets:
        log.info('Listening on %s, port %d', *s.getsockname()[:2])

    return sockets[0].getsockname()[1]

def main(argv=None):
    logging.basicConfig(level=logging.INFO)
    loop = tornado.ioloop.IOLoop.instance()
    redsnail_dir = dirname(__file__)
    term_manager = terminado.SingleTermManager(shell_command=['bash',
                                  '--rcfile', pjoin(redsnail_dir, 'bashrc.sh')])
    handlers = [
                (r"/websocket", PanelsSocket),
                (r"/terminalsocket", terminado.TermSocket,
                     {'term_manager': term_manager}),
                (r"/", PageHandler),
               ]
    app = tornado.web.Application(handlers, static_path=STATIC_DIR,
                      template_path=TEMPLATE_DIR,
                      coordinator = Coordinator(loop),
                      )
    port = bind_to_random_port(app)
    loop.add_callback(webbrowser.open, "http://localhost:%d/" % port)
    try:
        loop.start()
    except KeyboardInterrupt:
        print(" Shutting down on SIGINT")

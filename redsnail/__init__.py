import os
import json
import re
import tornado.web
from tornado.websocket import WebSocketHandler
import tornado_xstatic
import webbrowser

from .panels.ls import LsPanel

STATIC_DIR = os.path.join(os.path.dirname(__file__), "_static")
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")

class PanelsSocket(WebSocketHandler):
    def open(self):
        self.application.settings['coordinator'].websockets.append(self)

    def on_close(self):
        self.application.settings['coordinator'].websockets.remove(self)

class PageHandler(tornado.web.RequestHandler):
    def get(self):
        return self.render("eg.html", static=self.static_url,
                           xstatic=self.application.settings['xstatic_url'],
                           ws_url_path="/websocket")

bash_hist_line_re = re.compile(r'\s*(\d+)\s+(.*)$')

class Coordinator:
    def __init__(self, loop):
        self.pipebuffer = b''
        self.websockets = []
        self.panels = [LsPanel(self)]
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


def main(argv=None):
    loop = tornado.ioloop.IOLoop.instance()
    handlers = [
                (r"/websocket", PanelsSocket),
                (r"/", PageHandler),
                (r"/xstatic/(.*)", tornado_xstatic.XStaticFileHandler,
                     {'allowed_modules': ['jquery', 'requirejs']})
               ]
    app = tornado.web.Application(handlers, static_path=STATIC_DIR,
                      template_path=TEMPLATE_DIR,
                      coordinator = Coordinator(loop),
                      xstatic_url = tornado_xstatic.url_maker('/xstatic/'),
                      )
    app.listen(8765)
    loop.add_callback(webbrowser.open, "http://localhost:8765/")
    try:
        loop.start()
    except KeyboardInterrupt:
        raise
        print(" Shutting down on SIGINT")

import os
import json
import tornado.web
from tornado.websocket import WebSocketHandler
import webbrowser

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
                           ws_url_path="/websocket")

def filter_and_sort(filelist):
    return [f for f in sorted(filelist, key=str.lower)
                if not f.startswith(('.', '__'))]

class Coordinator:
    def __init__(self, loop):
        self.pipebuffer = b''
        self.websockets = []
        self.currentdir = None
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
            print('read:', repr(newdata))
            self.pipebuffer += newdata
            if len(newdata) < 1024:
                break

        if b'\n' in self.pipebuffer:
            *_, line, self.pipebuffer = self.pipebuffer.split(b'\n')
            self.got_cwd(line.decode('utf-8'))
        else:
            print(len(self.pipebuffer))

    def got_cwd(self, path):
        print('cwd is:', path)
        if path != self.currentdir:
            self.currentdir = path

            _, dirs, files = next(os.walk(path))
            for ws in self.websockets:
                ws.write_message(json.dumps({'kind': 'update',
                                             'panel': 'ls',
                                             'data': {'dirs': filter_and_sort(dirs),
                                                      'files': filter_and_sort(files)}
                                            }))

def main(argv=None):
    loop = tornado.ioloop.IOLoop.instance()
    handlers = [
                (r"/websocket", PanelsSocket),
                (r"/", PageHandler),
               ]
    app = tornado.web.Application(handlers, static_path=STATIC_DIR,
                      template_path=TEMPLATE_DIR,
                      coordinator = Coordinator(loop)
                      )
    app.listen(8765)
    loop.add_callback(webbrowser.open, "http://localhost:8765/")
    try:
        loop.start()
    except KeyboardInterrupt:
        raise
        print(" Shutting down on SIGINT")

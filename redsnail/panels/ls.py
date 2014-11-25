import os
from . import PanelBase

def filter_and_sort(filelist):
    return [f for f in sorted(filelist, key=str.lower)
                if not f.startswith(('.', '__'))]


_userdir = os.path.expanduser('~')
def compress_user(path):
    if path.startswith(_userdir):
        return "~" + path[len(_userdir):]
    return path

class LsPanel(PanelBase):
    def on_prompt(self, event):
        _, dirs, files = next(os.walk(event['pwd']))
        self.send({'kind': 'update',
                   'panel': 'ls',
                   'data': {'dirs': filter_and_sort(dirs),
                            'files': filter_and_sort(files),
                            'path': compress_user(event['pwd']),
                           }
                  })

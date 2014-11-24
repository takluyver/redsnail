import os
from . import PanelBase

def filter_and_sort(filelist):
    return [f for f in sorted(filelist, key=str.lower)
                if not f.startswith(('.', '__'))]

class LsPanel(PanelBase):
    def on_prompt(self, event):
        _, dirs, files = next(os.walk(event['pwd']))
        self.send({'kind': 'update',
                   'panel': 'ls',
                   'data': {'dirs': filter_and_sort(dirs),
                            'files': filter_and_sort(files)}
                  })

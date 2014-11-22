import subprocess
from . import PanelBase

status_map = {'A': 'added',
              'M': 'modified',
              'D': 'deleted',
              '?': 'unknown',
             }

class GitPanel(PanelBase):
    def on_cmd(self, cmd):
        out = subprocess.check_output(['git', 'status', '--porcelain'],
                                      universal_newlines=True)
        data = []
        for line in out.splitlines():
            stagestatus = line[0]
            wdstatus = line[1]
            path = line[3:]
            
            data.append({'path': path,
                         'stage': status_map[stagestatus],
                         'wd': status_map[wdstatus]})
        
        self.send({'kind': 'update',
                   'panel': 'git',
                   'data': data
                  })

import subprocess
from . import PanelBase

status_map = {'A': 'added',
              'M': 'modified',
              'D': 'deleted',
              '?': 'unknown',
             }

class GitPanel(PanelBase):
    def on_cmd(self, event):
        try:
            reporoot = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'],
                                               cwd=event['pwd'])
        except subprocess.CalledProcessError:
            return
            
        out = subprocess.check_output(['git', 'status', '--porcelain'],
                                      cwd=reporoot.strip(),
                                      universal_newlines=True)
        data = {'stage': [], 'wd': []}
        for line in out.splitlines():
            stagestatus = line[0]
            wdstatus = line[1]
            path = line[3:]
            
            if stagestatus in 'AMD':
                data['stage'].append({'path': path,
                                      'status': status_map[stagestatus],
                                     })
            if wdstatus in 'MD?':
                data['wd'].append({'path': path,
                                   'status': status_map[stagestatus], 
                                  })
        
        self.send({'kind': 'update',
                   'panel': 'git',
                   'data': data
                  })

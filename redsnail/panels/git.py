import os.path
import subprocess
from . import PanelBase

status_map = {'A': 'added',
              'M': 'modified',
              'D': 'deleted',
              '?': 'unknown',
             }

class GitPanel(PanelBase):
    def on_prompt(self, event):
        try:
            reporoot = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'],
                                               universal_newlines=True,
                                               cwd=event['pwd']).strip()
        except subprocess.CalledProcessError as e:
            print(e)
            return
            
        out = subprocess.check_output(['git', 'status', '--porcelain'],
                                      cwd=reporoot,
                                      universal_newlines=True)
        data = {'stage': [], 'wd': [], 'reporoot': os.path.basename(reporoot)}
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
                                   'status': status_map[wdstatus], 
                                  })
        
        self.send({'kind': 'update',
                   'panel': 'git',
                   'data': data
                  })

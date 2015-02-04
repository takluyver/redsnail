import os.path
import re
import subprocess
from . import PanelBase

status_map = {'A': 'added',
              'M': 'modified',
              'D': 'deleted',
              '?': 'unknown',
             }
# TODO: R for renamed

head_branch_re = re.compile(r'ref: refs/heads/(.*)')

class GitPanel(PanelBase):
    def on_prompt(self, event):
        try:
            reporoot = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'],
                                               universal_newlines=True,
                                               cwd=event['pwd']).strip()
        except subprocess.CalledProcessError as e:
            self.send({'kind': 'update', 'panel': 'git', 'relevance': 0})
            return

        data = {'stage': [], 'wd': [], 'branch': None, 'commit': None,
                'reporoot': os.path.basename(reporoot)}

        # Get the branch we're on. This is easy enough without shelling out
        with open(os.path.join(reporoot, '.git', 'HEAD')) as f:
            m = head_branch_re.match(f.read().strip())
            if m:
                data['branch'] = m.group(1)

        # Describe the latest commit
        commit_info = subprocess.check_output(['git', 'log', '-n', '1',
                                               '--format=format:%h\x1f%cr\x1f%s'],
                                              cwd=reporoot,
                                              universal_newlines=True)
        c = data['commit'] = {}
        c['shorthash'], c['reltime'], c['message'] = commit_info.split('\x1f', 2)

        status = subprocess.check_output(['git', 'status', '--porcelain'],
                                      cwd=reporoot,
                                      universal_newlines=True)
        for line in status.splitlines():
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
                   'relevance': 60,
                   'data': data
                  })

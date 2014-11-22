import os

def filter_and_sort(filelist):
    return [f for f in sorted(filelist, key=str.lower)
                if not f.startswith(('.', '__'))]

class LsPanel:
    def __init__(self, coordinator):
        self.coordinator = coordinator
    
    def on_cd(self, path):
        _, dirs, files = next(os.walk(path))
        self.coordinator.broadcast_json({'kind': 'update',
                                         'panel': 'ls',
                                         'data': {'dirs': filter_and_sort(dirs),
                                                  'files': filter_and_sort(files)}
                                        })
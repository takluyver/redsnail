class PanelBase:
    def __init__(self, coordinator):
        self.coordinator = coordinator
    
    def send(self, data):
        self.coordinator.broadcast_json(data)
    
    def on_cmd(self, command):
        pass
    
    def on_cd(self, path):
        pass

class PanelBase:
    def __init__(self, coordinator):
        self.coordinator = coordinator
    
    def send(self, data):
        self.coordinator.broadcast_json(data)
    
    def on_prompt(self, command):
        pass

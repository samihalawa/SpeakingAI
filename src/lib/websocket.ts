let ws: WebSocket | null = null;
const listeners = new Set<(data: any) => void>();

export function connectWebSocket() {
  if (ws) return;

  ws = new WebSocket(`ws://${window.location.host}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    listeners.forEach((listener) => listener(data));
  };

  ws.onclose = () => {
    ws = null;
    setTimeout(connectWebSocket, 1000);
  };
}

export function addWebSocketListener(listener: (data: any) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function sendWebSocketMessage(data: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

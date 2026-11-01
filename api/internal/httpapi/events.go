package httpapi

import "sync"

type eventHub struct {
	mu      sync.RWMutex
	clients map[chan struct{}]struct{}
}

func newEventHub() *eventHub {
	return &eventHub{clients: make(map[chan struct{}]struct{})}
}

func (hub *eventHub) subscribe() (<-chan struct{}, func()) {
	channel := make(chan struct{}, 1)
	hub.mu.Lock()
	hub.clients[channel] = struct{}{}
	hub.mu.Unlock()

	return channel, func() {
		hub.mu.Lock()
		delete(hub.clients, channel)
		close(channel)
		hub.mu.Unlock()
	}
}

func (hub *eventHub) publish() {
	hub.mu.RLock()
	defer hub.mu.RUnlock()
	for channel := range hub.clients {
		select {
		case channel <- struct{}{}:
		default:
		}
	}
}

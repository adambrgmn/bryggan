'use client';

import { Component } from 'react';

export class UnregisterServiceWorkers extends Component {
  componentDidMount(): void {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then((workers) => {
        if (workers.length > 0) console.log(`Unregistered ${workers.length} service worker(s)`);
      })
      .catch((error) => {
        console.log('Service Worker unregistration failed');
        console.error(error);
      });
  }

  render() {
    return null;
  }
}

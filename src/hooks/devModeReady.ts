Hooks.once('devModeReady', (): void => {
  const src = `http://${
    (location.host ?? 'localhost').split(':')[0]
  }:35730/livereload.js?snipver=1`;
  const script = document.createElement('script');
  script.src = src;

  document.body.appendChild(script);
});

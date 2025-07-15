if (import.meta.hot) {
  import.meta.hot.on('shopify:section:load', (data) => {
    console.log('shopify:section:load', data);
  });
}



new EventSource('/esbuild').addEventListener('change', e => {
    console.log('reload')
    location.reload();
});
// esbuild server-sent event - live reload CSS
new EventSource('/esbuild').addEventListener('change', e => {

    const { added, removed, updated } = JSON.parse(e.data);
    console.log(added);
    // reload when CSS files are added or removed
    if (added.length || removed.length) {
        location.reload();
        return;
    }

    // replace updated CSS files
    Array.from(document.getElementsByTagName('link')).forEach(link => {

        const url = new URL(link.href), path = url.pathname;

        if (updated.includes(path) && url.host === location.host) {

            const css = link.cloneNode();
            css.onload = () => link.remove();
            css.href = `${path}?${+new Date()}`;
            link.after(css);

        }

    })

});
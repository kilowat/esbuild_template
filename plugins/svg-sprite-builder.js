// plugins/svg-sprite-builder.js
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export const svgSpriteBuilder = () => ({
    name: 'svg-sprite-builder',
    setup(build) {
        let spriteContent = '';

        build.onStart(async () => {
            // Очищаем контент при каждой сборке
            spriteContent = '';
            const svgFiles = await glob('src/icons/**/*.svg');

            // Собираем все SVG в один спрайт
            const symbols = await Promise.all(svgFiles.map(async file => {
                const content = await fs.readFile(file, 'utf-8');
                const name = path.basename(file, '.svg');

                // Извлекаем содержимое SVG и создаем symbol
                const match = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
                if (match) {
                    // Получаем viewBox из оригинального SVG
                    const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
                    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

                    return `<symbol id="${name}" viewBox="${viewBox}">${match[1].trim()}</symbol>`;
                }
                return '';
            }));

            spriteContent = `\
<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
  ${symbols.join('\n  ')}
</svg>`;

            // Сохраняем спрайт в dist
            await fs.writeFile(
                path.join(build.initialOptions.outdir, 'sprite.svg'),
                spriteContent
            );
        });
    },
});
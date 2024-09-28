// @ts-ignore
import * as icons from '../icons/**/*';
import { defineSvgIcon } from './components/svg-icon';

const { default: iconsArr, filenames } = icons;

for (let index = 0; index < iconsArr.length; index++) {
    const svgContent = iconsArr[index].default;
    const fileName = filenames[index];
    const iconName = fileName.replace('../icons/', '').replace('.svg', '-icon');
    defineSvgIcon(iconName, svgContent);
}

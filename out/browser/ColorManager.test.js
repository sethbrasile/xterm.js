"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom = require("jsdom");
const chai_1 = require("chai");
const ColorManager_1 = require("browser/ColorManager");
describe('ColorManager', () => {
    let cm;
    let dom;
    let document;
    let window;
    beforeEach(() => {
        dom = new jsdom.JSDOM('');
        window = dom.window;
        document = window.document;
        window.HTMLCanvasElement.prototype.getContext = () => ({
            createLinearGradient() {
                return null;
            },
            fillRect() { },
            getImageData() {
                return { data: [0, 0, 0, 0xFF] };
            }
        });
        cm = new ColorManager_1.ColorManager(document, false);
    });
    describe('constructor', () => {
        it('should fill all colors with values', () => {
            for (const key of Object.keys(cm.colors)) {
                if (key !== 'ansi' && key !== 'contrastCache' && key !== 'selectionForeground') {
                    chai_1.assert.ok(cm.colors[key].css.length >= 7);
                }
            }
            chai_1.assert.equal(cm.colors.ansi.length, 256);
        });
        it('should fill 240 colors with expected values', () => {
            chai_1.assert.equal(cm.colors.ansi[16].css, '#000000');
            chai_1.assert.equal(cm.colors.ansi[17].css, '#00005f');
            chai_1.assert.equal(cm.colors.ansi[18].css, '#000087');
            chai_1.assert.equal(cm.colors.ansi[19].css, '#0000af');
            chai_1.assert.equal(cm.colors.ansi[20].css, '#0000d7');
            chai_1.assert.equal(cm.colors.ansi[21].css, '#0000ff');
            chai_1.assert.equal(cm.colors.ansi[22].css, '#005f00');
            chai_1.assert.equal(cm.colors.ansi[23].css, '#005f5f');
            chai_1.assert.equal(cm.colors.ansi[24].css, '#005f87');
            chai_1.assert.equal(cm.colors.ansi[25].css, '#005faf');
            chai_1.assert.equal(cm.colors.ansi[26].css, '#005fd7');
            chai_1.assert.equal(cm.colors.ansi[27].css, '#005fff');
            chai_1.assert.equal(cm.colors.ansi[28].css, '#008700');
            chai_1.assert.equal(cm.colors.ansi[29].css, '#00875f');
            chai_1.assert.equal(cm.colors.ansi[30].css, '#008787');
            chai_1.assert.equal(cm.colors.ansi[31].css, '#0087af');
            chai_1.assert.equal(cm.colors.ansi[32].css, '#0087d7');
            chai_1.assert.equal(cm.colors.ansi[33].css, '#0087ff');
            chai_1.assert.equal(cm.colors.ansi[34].css, '#00af00');
            chai_1.assert.equal(cm.colors.ansi[35].css, '#00af5f');
            chai_1.assert.equal(cm.colors.ansi[36].css, '#00af87');
            chai_1.assert.equal(cm.colors.ansi[37].css, '#00afaf');
            chai_1.assert.equal(cm.colors.ansi[38].css, '#00afd7');
            chai_1.assert.equal(cm.colors.ansi[39].css, '#00afff');
            chai_1.assert.equal(cm.colors.ansi[40].css, '#00d700');
            chai_1.assert.equal(cm.colors.ansi[41].css, '#00d75f');
            chai_1.assert.equal(cm.colors.ansi[42].css, '#00d787');
            chai_1.assert.equal(cm.colors.ansi[43].css, '#00d7af');
            chai_1.assert.equal(cm.colors.ansi[44].css, '#00d7d7');
            chai_1.assert.equal(cm.colors.ansi[45].css, '#00d7ff');
            chai_1.assert.equal(cm.colors.ansi[46].css, '#00ff00');
            chai_1.assert.equal(cm.colors.ansi[47].css, '#00ff5f');
            chai_1.assert.equal(cm.colors.ansi[48].css, '#00ff87');
            chai_1.assert.equal(cm.colors.ansi[49].css, '#00ffaf');
            chai_1.assert.equal(cm.colors.ansi[50].css, '#00ffd7');
            chai_1.assert.equal(cm.colors.ansi[51].css, '#00ffff');
            chai_1.assert.equal(cm.colors.ansi[52].css, '#5f0000');
            chai_1.assert.equal(cm.colors.ansi[53].css, '#5f005f');
            chai_1.assert.equal(cm.colors.ansi[54].css, '#5f0087');
            chai_1.assert.equal(cm.colors.ansi[55].css, '#5f00af');
            chai_1.assert.equal(cm.colors.ansi[56].css, '#5f00d7');
            chai_1.assert.equal(cm.colors.ansi[57].css, '#5f00ff');
            chai_1.assert.equal(cm.colors.ansi[58].css, '#5f5f00');
            chai_1.assert.equal(cm.colors.ansi[59].css, '#5f5f5f');
            chai_1.assert.equal(cm.colors.ansi[60].css, '#5f5f87');
            chai_1.assert.equal(cm.colors.ansi[61].css, '#5f5faf');
            chai_1.assert.equal(cm.colors.ansi[62].css, '#5f5fd7');
            chai_1.assert.equal(cm.colors.ansi[63].css, '#5f5fff');
            chai_1.assert.equal(cm.colors.ansi[64].css, '#5f8700');
            chai_1.assert.equal(cm.colors.ansi[65].css, '#5f875f');
            chai_1.assert.equal(cm.colors.ansi[66].css, '#5f8787');
            chai_1.assert.equal(cm.colors.ansi[67].css, '#5f87af');
            chai_1.assert.equal(cm.colors.ansi[68].css, '#5f87d7');
            chai_1.assert.equal(cm.colors.ansi[69].css, '#5f87ff');
            chai_1.assert.equal(cm.colors.ansi[70].css, '#5faf00');
            chai_1.assert.equal(cm.colors.ansi[71].css, '#5faf5f');
            chai_1.assert.equal(cm.colors.ansi[72].css, '#5faf87');
            chai_1.assert.equal(cm.colors.ansi[73].css, '#5fafaf');
            chai_1.assert.equal(cm.colors.ansi[74].css, '#5fafd7');
            chai_1.assert.equal(cm.colors.ansi[75].css, '#5fafff');
            chai_1.assert.equal(cm.colors.ansi[76].css, '#5fd700');
            chai_1.assert.equal(cm.colors.ansi[77].css, '#5fd75f');
            chai_1.assert.equal(cm.colors.ansi[78].css, '#5fd787');
            chai_1.assert.equal(cm.colors.ansi[79].css, '#5fd7af');
            chai_1.assert.equal(cm.colors.ansi[80].css, '#5fd7d7');
            chai_1.assert.equal(cm.colors.ansi[81].css, '#5fd7ff');
            chai_1.assert.equal(cm.colors.ansi[82].css, '#5fff00');
            chai_1.assert.equal(cm.colors.ansi[83].css, '#5fff5f');
            chai_1.assert.equal(cm.colors.ansi[84].css, '#5fff87');
            chai_1.assert.equal(cm.colors.ansi[85].css, '#5fffaf');
            chai_1.assert.equal(cm.colors.ansi[86].css, '#5fffd7');
            chai_1.assert.equal(cm.colors.ansi[87].css, '#5fffff');
            chai_1.assert.equal(cm.colors.ansi[88].css, '#870000');
            chai_1.assert.equal(cm.colors.ansi[89].css, '#87005f');
            chai_1.assert.equal(cm.colors.ansi[90].css, '#870087');
            chai_1.assert.equal(cm.colors.ansi[91].css, '#8700af');
            chai_1.assert.equal(cm.colors.ansi[92].css, '#8700d7');
            chai_1.assert.equal(cm.colors.ansi[93].css, '#8700ff');
            chai_1.assert.equal(cm.colors.ansi[94].css, '#875f00');
            chai_1.assert.equal(cm.colors.ansi[95].css, '#875f5f');
            chai_1.assert.equal(cm.colors.ansi[96].css, '#875f87');
            chai_1.assert.equal(cm.colors.ansi[97].css, '#875faf');
            chai_1.assert.equal(cm.colors.ansi[98].css, '#875fd7');
            chai_1.assert.equal(cm.colors.ansi[99].css, '#875fff');
            chai_1.assert.equal(cm.colors.ansi[100].css, '#878700');
            chai_1.assert.equal(cm.colors.ansi[101].css, '#87875f');
            chai_1.assert.equal(cm.colors.ansi[102].css, '#878787');
            chai_1.assert.equal(cm.colors.ansi[103].css, '#8787af');
            chai_1.assert.equal(cm.colors.ansi[104].css, '#8787d7');
            chai_1.assert.equal(cm.colors.ansi[105].css, '#8787ff');
            chai_1.assert.equal(cm.colors.ansi[106].css, '#87af00');
            chai_1.assert.equal(cm.colors.ansi[107].css, '#87af5f');
            chai_1.assert.equal(cm.colors.ansi[108].css, '#87af87');
            chai_1.assert.equal(cm.colors.ansi[109].css, '#87afaf');
            chai_1.assert.equal(cm.colors.ansi[110].css, '#87afd7');
            chai_1.assert.equal(cm.colors.ansi[111].css, '#87afff');
            chai_1.assert.equal(cm.colors.ansi[112].css, '#87d700');
            chai_1.assert.equal(cm.colors.ansi[113].css, '#87d75f');
            chai_1.assert.equal(cm.colors.ansi[114].css, '#87d787');
            chai_1.assert.equal(cm.colors.ansi[115].css, '#87d7af');
            chai_1.assert.equal(cm.colors.ansi[116].css, '#87d7d7');
            chai_1.assert.equal(cm.colors.ansi[117].css, '#87d7ff');
            chai_1.assert.equal(cm.colors.ansi[118].css, '#87ff00');
            chai_1.assert.equal(cm.colors.ansi[119].css, '#87ff5f');
            chai_1.assert.equal(cm.colors.ansi[120].css, '#87ff87');
            chai_1.assert.equal(cm.colors.ansi[121].css, '#87ffaf');
            chai_1.assert.equal(cm.colors.ansi[122].css, '#87ffd7');
            chai_1.assert.equal(cm.colors.ansi[123].css, '#87ffff');
            chai_1.assert.equal(cm.colors.ansi[124].css, '#af0000');
            chai_1.assert.equal(cm.colors.ansi[125].css, '#af005f');
            chai_1.assert.equal(cm.colors.ansi[126].css, '#af0087');
            chai_1.assert.equal(cm.colors.ansi[127].css, '#af00af');
            chai_1.assert.equal(cm.colors.ansi[128].css, '#af00d7');
            chai_1.assert.equal(cm.colors.ansi[129].css, '#af00ff');
            chai_1.assert.equal(cm.colors.ansi[130].css, '#af5f00');
            chai_1.assert.equal(cm.colors.ansi[131].css, '#af5f5f');
            chai_1.assert.equal(cm.colors.ansi[132].css, '#af5f87');
            chai_1.assert.equal(cm.colors.ansi[133].css, '#af5faf');
            chai_1.assert.equal(cm.colors.ansi[134].css, '#af5fd7');
            chai_1.assert.equal(cm.colors.ansi[135].css, '#af5fff');
            chai_1.assert.equal(cm.colors.ansi[136].css, '#af8700');
            chai_1.assert.equal(cm.colors.ansi[137].css, '#af875f');
            chai_1.assert.equal(cm.colors.ansi[138].css, '#af8787');
            chai_1.assert.equal(cm.colors.ansi[139].css, '#af87af');
            chai_1.assert.equal(cm.colors.ansi[140].css, '#af87d7');
            chai_1.assert.equal(cm.colors.ansi[141].css, '#af87ff');
            chai_1.assert.equal(cm.colors.ansi[142].css, '#afaf00');
            chai_1.assert.equal(cm.colors.ansi[143].css, '#afaf5f');
            chai_1.assert.equal(cm.colors.ansi[144].css, '#afaf87');
            chai_1.assert.equal(cm.colors.ansi[145].css, '#afafaf');
            chai_1.assert.equal(cm.colors.ansi[146].css, '#afafd7');
            chai_1.assert.equal(cm.colors.ansi[147].css, '#afafff');
            chai_1.assert.equal(cm.colors.ansi[148].css, '#afd700');
            chai_1.assert.equal(cm.colors.ansi[149].css, '#afd75f');
            chai_1.assert.equal(cm.colors.ansi[150].css, '#afd787');
            chai_1.assert.equal(cm.colors.ansi[151].css, '#afd7af');
            chai_1.assert.equal(cm.colors.ansi[152].css, '#afd7d7');
            chai_1.assert.equal(cm.colors.ansi[153].css, '#afd7ff');
            chai_1.assert.equal(cm.colors.ansi[154].css, '#afff00');
            chai_1.assert.equal(cm.colors.ansi[155].css, '#afff5f');
            chai_1.assert.equal(cm.colors.ansi[156].css, '#afff87');
            chai_1.assert.equal(cm.colors.ansi[157].css, '#afffaf');
            chai_1.assert.equal(cm.colors.ansi[158].css, '#afffd7');
            chai_1.assert.equal(cm.colors.ansi[159].css, '#afffff');
            chai_1.assert.equal(cm.colors.ansi[160].css, '#d70000');
            chai_1.assert.equal(cm.colors.ansi[161].css, '#d7005f');
            chai_1.assert.equal(cm.colors.ansi[162].css, '#d70087');
            chai_1.assert.equal(cm.colors.ansi[163].css, '#d700af');
            chai_1.assert.equal(cm.colors.ansi[164].css, '#d700d7');
            chai_1.assert.equal(cm.colors.ansi[165].css, '#d700ff');
            chai_1.assert.equal(cm.colors.ansi[166].css, '#d75f00');
            chai_1.assert.equal(cm.colors.ansi[167].css, '#d75f5f');
            chai_1.assert.equal(cm.colors.ansi[168].css, '#d75f87');
            chai_1.assert.equal(cm.colors.ansi[169].css, '#d75faf');
            chai_1.assert.equal(cm.colors.ansi[170].css, '#d75fd7');
            chai_1.assert.equal(cm.colors.ansi[171].css, '#d75fff');
            chai_1.assert.equal(cm.colors.ansi[172].css, '#d78700');
            chai_1.assert.equal(cm.colors.ansi[173].css, '#d7875f');
            chai_1.assert.equal(cm.colors.ansi[174].css, '#d78787');
            chai_1.assert.equal(cm.colors.ansi[175].css, '#d787af');
            chai_1.assert.equal(cm.colors.ansi[176].css, '#d787d7');
            chai_1.assert.equal(cm.colors.ansi[177].css, '#d787ff');
            chai_1.assert.equal(cm.colors.ansi[178].css, '#d7af00');
            chai_1.assert.equal(cm.colors.ansi[179].css, '#d7af5f');
            chai_1.assert.equal(cm.colors.ansi[180].css, '#d7af87');
            chai_1.assert.equal(cm.colors.ansi[181].css, '#d7afaf');
            chai_1.assert.equal(cm.colors.ansi[182].css, '#d7afd7');
            chai_1.assert.equal(cm.colors.ansi[183].css, '#d7afff');
            chai_1.assert.equal(cm.colors.ansi[184].css, '#d7d700');
            chai_1.assert.equal(cm.colors.ansi[185].css, '#d7d75f');
            chai_1.assert.equal(cm.colors.ansi[186].css, '#d7d787');
            chai_1.assert.equal(cm.colors.ansi[187].css, '#d7d7af');
            chai_1.assert.equal(cm.colors.ansi[188].css, '#d7d7d7');
            chai_1.assert.equal(cm.colors.ansi[189].css, '#d7d7ff');
            chai_1.assert.equal(cm.colors.ansi[190].css, '#d7ff00');
            chai_1.assert.equal(cm.colors.ansi[191].css, '#d7ff5f');
            chai_1.assert.equal(cm.colors.ansi[192].css, '#d7ff87');
            chai_1.assert.equal(cm.colors.ansi[193].css, '#d7ffaf');
            chai_1.assert.equal(cm.colors.ansi[194].css, '#d7ffd7');
            chai_1.assert.equal(cm.colors.ansi[195].css, '#d7ffff');
            chai_1.assert.equal(cm.colors.ansi[196].css, '#ff0000');
            chai_1.assert.equal(cm.colors.ansi[197].css, '#ff005f');
            chai_1.assert.equal(cm.colors.ansi[198].css, '#ff0087');
            chai_1.assert.equal(cm.colors.ansi[199].css, '#ff00af');
            chai_1.assert.equal(cm.colors.ansi[200].css, '#ff00d7');
            chai_1.assert.equal(cm.colors.ansi[201].css, '#ff00ff');
            chai_1.assert.equal(cm.colors.ansi[202].css, '#ff5f00');
            chai_1.assert.equal(cm.colors.ansi[203].css, '#ff5f5f');
            chai_1.assert.equal(cm.colors.ansi[204].css, '#ff5f87');
            chai_1.assert.equal(cm.colors.ansi[205].css, '#ff5faf');
            chai_1.assert.equal(cm.colors.ansi[206].css, '#ff5fd7');
            chai_1.assert.equal(cm.colors.ansi[207].css, '#ff5fff');
            chai_1.assert.equal(cm.colors.ansi[208].css, '#ff8700');
            chai_1.assert.equal(cm.colors.ansi[209].css, '#ff875f');
            chai_1.assert.equal(cm.colors.ansi[210].css, '#ff8787');
            chai_1.assert.equal(cm.colors.ansi[211].css, '#ff87af');
            chai_1.assert.equal(cm.colors.ansi[212].css, '#ff87d7');
            chai_1.assert.equal(cm.colors.ansi[213].css, '#ff87ff');
            chai_1.assert.equal(cm.colors.ansi[214].css, '#ffaf00');
            chai_1.assert.equal(cm.colors.ansi[215].css, '#ffaf5f');
            chai_1.assert.equal(cm.colors.ansi[216].css, '#ffaf87');
            chai_1.assert.equal(cm.colors.ansi[217].css, '#ffafaf');
            chai_1.assert.equal(cm.colors.ansi[218].css, '#ffafd7');
            chai_1.assert.equal(cm.colors.ansi[219].css, '#ffafff');
            chai_1.assert.equal(cm.colors.ansi[220].css, '#ffd700');
            chai_1.assert.equal(cm.colors.ansi[221].css, '#ffd75f');
            chai_1.assert.equal(cm.colors.ansi[222].css, '#ffd787');
            chai_1.assert.equal(cm.colors.ansi[223].css, '#ffd7af');
            chai_1.assert.equal(cm.colors.ansi[224].css, '#ffd7d7');
            chai_1.assert.equal(cm.colors.ansi[225].css, '#ffd7ff');
            chai_1.assert.equal(cm.colors.ansi[226].css, '#ffff00');
            chai_1.assert.equal(cm.colors.ansi[227].css, '#ffff5f');
            chai_1.assert.equal(cm.colors.ansi[228].css, '#ffff87');
            chai_1.assert.equal(cm.colors.ansi[229].css, '#ffffaf');
            chai_1.assert.equal(cm.colors.ansi[230].css, '#ffffd7');
            chai_1.assert.equal(cm.colors.ansi[231].css, '#ffffff');
            chai_1.assert.equal(cm.colors.ansi[232].css, '#080808');
            chai_1.assert.equal(cm.colors.ansi[233].css, '#121212');
            chai_1.assert.equal(cm.colors.ansi[234].css, '#1c1c1c');
            chai_1.assert.equal(cm.colors.ansi[235].css, '#262626');
            chai_1.assert.equal(cm.colors.ansi[236].css, '#303030');
            chai_1.assert.equal(cm.colors.ansi[237].css, '#3a3a3a');
            chai_1.assert.equal(cm.colors.ansi[238].css, '#444444');
            chai_1.assert.equal(cm.colors.ansi[239].css, '#4e4e4e');
            chai_1.assert.equal(cm.colors.ansi[240].css, '#585858');
            chai_1.assert.equal(cm.colors.ansi[241].css, '#626262');
            chai_1.assert.equal(cm.colors.ansi[242].css, '#6c6c6c');
            chai_1.assert.equal(cm.colors.ansi[243].css, '#767676');
            chai_1.assert.equal(cm.colors.ansi[244].css, '#808080');
            chai_1.assert.equal(cm.colors.ansi[245].css, '#8a8a8a');
            chai_1.assert.equal(cm.colors.ansi[246].css, '#949494');
            chai_1.assert.equal(cm.colors.ansi[247].css, '#9e9e9e');
            chai_1.assert.equal(cm.colors.ansi[248].css, '#a8a8a8');
            chai_1.assert.equal(cm.colors.ansi[249].css, '#b2b2b2');
            chai_1.assert.equal(cm.colors.ansi[250].css, '#bcbcbc');
            chai_1.assert.equal(cm.colors.ansi[251].css, '#c6c6c6');
            chai_1.assert.equal(cm.colors.ansi[252].css, '#d0d0d0');
            chai_1.assert.equal(cm.colors.ansi[253].css, '#dadada');
            chai_1.assert.equal(cm.colors.ansi[254].css, '#e4e4e4');
            chai_1.assert.equal(cm.colors.ansi[255].css, '#eeeeee');
        });
    });
    describe('setTheme', () => {
        it('should not throw when not setting all colors', () => {
            chai_1.assert.doesNotThrow(() => {
                cm.setTheme({});
            });
        });
        it('should set a partial set of colors, using the default if not present', () => {
            chai_1.assert.equal(cm.colors.background.css, '#000000');
            chai_1.assert.equal(cm.colors.foreground.css, '#ffffff');
            cm.setTheme({
                background: '#FF0000',
                foreground: '#00FF00'
            });
            chai_1.assert.equal(cm.colors.background.css, '#FF0000');
            chai_1.assert.equal(cm.colors.foreground.css, '#00FF00');
            cm.setTheme({
                background: '#0000FF'
            });
            chai_1.assert.equal(cm.colors.background.css, '#0000FF');
            chai_1.assert.equal(cm.colors.foreground.css, '#ffffff');
        });
        it('should set all extended ansi colors in reverse order', () => {
            cm.setTheme({
                extendedAnsi: ColorManager_1.DEFAULT_ANSI_COLORS.map(a => a.css).slice().reverse()
            });
            for (let ansiColor = 16; ansiColor <= 255; ansiColor++) {
                chai_1.assert.equal(cm.colors.ansi[ansiColor].css, ColorManager_1.DEFAULT_ANSI_COLORS[255 + 16 - ansiColor].css);
            }
        });
        it('should set one extended ansi color and keep the other default', () => {
            cm.setTheme({
                extendedAnsi: ['#ffffff']
            });
            chai_1.assert.equal(cm.colors.ansi[16].css, '#ffffff');
            chai_1.assert.equal(cm.colors.ansi[17].css, ColorManager_1.DEFAULT_ANSI_COLORS[17].css);
        });
        it('should set extended ansi colors to the default when they are unset', () => {
            cm.setTheme({
                extendedAnsi: ['#ffffff']
            });
            chai_1.assert.equal(cm.colors.ansi[16].css, '#ffffff');
            cm.setTheme({
                extendedAnsi: []
            });
            chai_1.assert.equal(cm.colors.ansi[16].css, ColorManager_1.DEFAULT_ANSI_COLORS[16].css);
            cm.setTheme({
                extendedAnsi: ['#ffffff']
            });
            chai_1.assert.equal(cm.colors.ansi[16].css, '#ffffff');
            cm.setTheme({});
            chai_1.assert.equal(cm.colors.ansi[16].css, ColorManager_1.DEFAULT_ANSI_COLORS[16].css);
        });
        it('should set extended ansi colors to the default when they are partially unset', () => {
            cm.setTheme({
                extendedAnsi: ['#ffffff', '#000000']
            });
            chai_1.assert.equal(cm.colors.ansi[16].css, '#ffffff');
            chai_1.assert.equal(cm.colors.ansi[17].css, '#000000');
            cm.setTheme({
                extendedAnsi: ['#ffffff']
            });
            chai_1.assert.equal(cm.colors.ansi[16].css, '#ffffff');
            chai_1.assert.equal(cm.colors.ansi[17].css, ColorManager_1.DEFAULT_ANSI_COLORS[17].css);
        });
    });
});
//# sourceMappingURL=ColorManager.test.js.map
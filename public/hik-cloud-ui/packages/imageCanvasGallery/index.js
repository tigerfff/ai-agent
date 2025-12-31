//
//
//
//
//
//
//
//
//
//
//
//
var script$1 = {
    props: {
        src: {
            type: String,
            default: ''
        },
        width: {
            type: Number,
            default: 856
        },
        height: {
            type: Number,
            default: 460
        },
        autoplay: {
            type: Boolean,
            default: false
        },
        controls: {
            type: Boolean,
            default: false
        }
    }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */ , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
    }
    return script;
}

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-canvas-video-player",
        style: "width: " + _vm.width + "px;height: " + _vm.height + "px;"
    }, [
        _c('video', {
            staticClass: "video-player",
            staticStyle: {
                "width": "100%",
                "height": "100%"
            },
            attrs: {
                "src": _vm.src,
                "autoplay": _vm.autoplay,
                "controls": _vm.controls
            }
        })
    ]);
};
var __vue_staticRenderFns__$1 = [];
/* style */ const __vue_inject_styles__$1 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$1 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1);

var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='UTF-8'%3f%3e%3csvg width='180px' height='180px' viewBox='0 0 180 180' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e %3ctitle%3e%e7%a9%ba%e6%80%81%e5%9b%be/%e6%97%a0%e6%8c%89%e9%92%ae%e5%a4%87%e4%bb%bd%402x%3c/title%3e %3cdefs%3e %3cpath d='M17.0774734%2c0 C20.8650861%2c14.9044275 22.9536783%2c24.9990664 23.3432498%2c30.2839168 C23.7328213%2c35.5687672 24.2826143%2c45.9292852 24.9926288%2c61.3654709 L20.6921572%2c62.4963047 C17.6715748%2c50.4340613 14.9396272%2c40.5856877 12.4963144%2c32.951184 C10.0530016%2c25.3166803 5.88756345%2c14.3329523 0%2c0 L17.0774734%2c0 Z' id='path-1'%3e%3c/path%3e %3cpath d='M23.6374641%2c42.4315295 C26.1589116%2c20.2687344 26.4272631%2c7.13824087 24.4425186%2c3.0400488 C24.4425186%2c3.0400488 20.8434497%2c0 18.5533976%2c0 C16.2633456%2c0 -2.93955035%2c10.9291788 0.385752942%2c42.0593039 C0.385752942%2c42.0593039 3.87593112%2c43.6379981 10.6827792%2c43.6379981 C13.4776395%2c43.6379981 17.7958678%2c43.2358419 23.6374641%2c42.4315295 Z' id='path-3'%3e%3c/path%3e %3cpath d='M0.865587082%2c4.68432262 L5.62180191%2c1.74298566 C7.4426539%2c0.616934925 9.60131503%2c0.166575958 11.7205252%2c0.470616098 L62.4150511%2c7.74368927 C63.3220313%2c7.87381247 63.9921389%2c8.65594511 63.9816223%2c9.57215177 L63.5501442%2c47.1626518 C63.5390621%2c48.1281349 63.0204556%2c49.0164625 62.185152%2c49.5007644 L59.0066114%2c51.3436549 C56.0829602%2c53.0387627 52.656295%2c53.6516979 49.326315%2c53.0751909 L2.27177217%2c44.9288136 C0.958862618%2c44.7015144 -1.61079973e-15%2c43.5623837 0%2c42.2299437 L0%2c6.23735293 C2.03483289e-16%2c5.60467952 0.327495772%2c5.01708888 0.865587082%2c4.68432262 Z' id='path-5'%3e%3c/path%3e %3clinearGradient x1='36.2992229%25' y1='40.8659425%25' x2='100%25' y2='40.8659425%25' id='linearGradient-7'%3e %3cstop stop-color='%23F1EFEF' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23F3F1F1' offset='66.7093805%25'%3e%3c/stop%3e %3cstop stop-color='%23FBFBFB' offset='70.5649851%25'%3e%3c/stop%3e %3cstop stop-color='%23D5DDE6' offset='83.7290365%25'%3e%3c/stop%3e %3cstop stop-color='%23D5DDE6' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3clinearGradient x1='36.2992229%25' y1='40.8659425%25' x2='100%25' y2='40.8659425%25' id='linearGradient-8'%3e %3cstop stop-color='%23F2F0F0' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23F4F4F4' offset='25.7836659%25'%3e%3c/stop%3e %3cstop stop-color='%23F3F1F1' offset='57.9690071%25'%3e%3c/stop%3e %3cstop stop-color='%23F3F1F1' offset='66.7093805%25'%3e%3c/stop%3e %3cstop stop-color='%23FBFBFB' offset='70.5649851%25'%3e%3c/stop%3e %3cstop stop-color='%23D5DDE6' offset='83.7290365%25'%3e%3c/stop%3e %3cstop stop-color='%23D5DDE6' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3cpath d='M0%2c5.86397119 L7.12950486%2c0.243662142 C7.32679059%2c0.0881384725 7.57944146%2c0.020775951 7.82796775%2c0.0574359027 L20.8527033%2c1.97870617 C21.3006348%2c2.04478026 21.6324739%2c2.42915955 21.6324739%2c2.88193814 L21.6324739%2c5.91869158 L21.6324739%2c5.91869158 L14.7109532%2c12.1705062 L0%2c9.66189949 L0%2c5.86397119 Z' id='path-9'%3e%3c/path%3e %3clinearGradient x1='70.3523537%25' y1='34.2581744%25' x2='91.7451355%25' y2='47.7147514%25' id='linearGradient-11'%3e %3cstop stop-color='%23F9F8F8' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23EBEEF1' offset='61.2707537%25'%3e%3c/stop%3e %3cstop stop-color='%23F6F6F6' offset='77.7585172%25'%3e%3c/stop%3e %3cstop stop-color='%23D5DDE6' stop-opacity='0.482626748' offset='86.4419195%25'%3e%3c/stop%3e %3cstop stop-color='%23D5DDE6' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3clinearGradient x1='35.1288155%25' y1='44.1413856%25' x2='50%25' y2='59.6357925%25' id='linearGradient-12'%3e %3cstop stop-color='%23F1EFEF' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23F5F2F3' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3clinearGradient x1='37.5292197%25' y1='19.5997275%25' x2='50%25' y2='100%25' id='linearGradient-13'%3e %3cstop stop-color='%23F3F1F1' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23FDFDFD' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3clinearGradient x1='37.5292197%25' y1='19.5997275%25' x2='50%25' y2='100%25' id='linearGradient-14'%3e %3cstop stop-color='%23F3F1F1' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23FDFDFD' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3clinearGradient x1='36.2992229%25' y1='40.8659425%25' x2='100%25' y2='40.8659425%25' id='linearGradient-15'%3e %3cstop stop-color='%23F1EFEF' offset='0%25'%3e%3c/stop%3e %3cstop stop-color='%23F3F1F1' offset='66.7093805%25'%3e%3c/stop%3e %3cstop stop-color='%23FBFBFB' offset='70.5649851%25'%3e%3c/stop%3e %3cstop stop-color='%23DCDBDC' offset='83.7290365%25'%3e%3c/stop%3e %3cstop stop-color='%23DFDFDF' offset='100%25'%3e%3c/stop%3e %3c/linearGradient%3e %3cpath d='M8%2c24 L59.8446951%2c33.0789485 C61.470797%2c33.3637085 63.145218%2c33.064597 64.5721584%2c32.2344544 L71.9331111%2c27.9521168 L71.9331111%2c27.9521168 L71.9331111%2c28.6841086 L64.5362139%2c32.8259189 C63.130339%2c33.6131229 61.4959347%2c33.8912249 59.9088216%2c33.6132925 L8%2c24.5231143 L8%2c24.5231143 L8%2c24 Z' id='path-16'%3e%3c/path%3e %3cfilter x='-3.1%25' y='-19.9%25' width='106.3%25' height='139.8%25' filterUnits='objectBoundingBox' id='filter-17'%3e %3cfeGaussianBlur stdDeviation='1.5' in='SourceAlpha' result='shadowBlurInner1'%3e%3c/feGaussianBlur%3e %3cfeOffset dx='0' dy='1' in='shadowBlurInner1' result='shadowOffsetInner1'%3e%3c/feOffset%3e %3cfeComposite in='shadowOffsetInner1' in2='SourceAlpha' operator='arithmetic' k2='-1' k3='1' result='shadowInnerInner1'%3e%3c/feComposite%3e %3cfeColorMatrix values='0 0 0 0 0.755583105 0 0 0 0 0.793956401 0 0 0 0 0.837126359 0 0 0 1 0' type='matrix' in='shadowInnerInner1'%3e%3c/feColorMatrix%3e %3c/filter%3e %3c/defs%3e %3cg id='%e7%82%b9%e6%a3%80%ef%bc%880307%ef%bc%89' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3e %3cg id='%e7%a9%ba%e6%80%81%e5%9b%be/%e5%a4%a7%e5%9b%be/%e6%97%a0%e8%ae%be%e5%a4%87'%3e %3cellipse id='%e6%a4%ad%e5%9c%86%e5%bd%a2' fill-opacity='0.1' fill='%23949494' cx='90' cy='148' rx='69' ry='8'%3e%3c/ellipse%3e %3cg id='%e4%ba%ba%e7%89%a9%e7%bb%84%e4%bb%b6/%e6%b5%8b%e8%af%953' transform='translate(36.000000%2c 15.000000)'%3e %3crect id='%e7%9f%a9%e5%bd%a2' x='0' y='0' width='136' height='136'%3e%3c/rect%3e %3cg id='3-%e6%b2%ae%e4%b8%a7' transform='translate(37.400000%2c 9.784549)'%3e %3cg id='%e4%b8%8b%e5%8d%8a%e8%ba%ab' transform='translate(0.000000%2c 50.277906)'%3e %3cg id='%e7%bc%96%e7%bb%84-7' transform='translate(0.000000%2c 59.820928)'%3e %3cpolygon id='%e8%b7%af%e5%be%84-15' fill='%23F5B2B2' points='5.00410923 0 1.03165108 4.67921667 3.32251392 6.06835729 7.32150869 2.26097077'%3e%3c/polygon%3e %3cpolygon id='%e8%b7%af%e5%be%84-16' fill='black' points='1.6264259 3.80840065 3.78873133 6.09802382 4.88281102 9.06536752 4.33324639 9.4221563 1.78469859 6.88167456 1.3704114 6.88167456 0 5.64018404'%3e%3c/polygon%3e %3c/g%3e %3cg id='%e7%bc%96%e7%bb%84-6' transform='translate(48.880754%2c 66.232006) rotate(-60.000000) translate(-48.880754%2c -66.232006) translate(45.220000%2c 61.520928)'%3e %3cpolygon id='%e8%b7%af%e5%be%84-15%e5%a4%87%e4%bb%bd' fill='%23F5B2B2' points='5.00410923 -4.54747351e-13 1.03165108 4.67921667 3.32251392 6.06835729 7.32150869 2.26097077'%3e%3c/polygon%3e %3cpolygon id='%e8%b7%af%e5%be%84-16%e5%a4%87%e4%bb%bd' fill='black' points='1.6264259 3.80840065 3.78873133 6.09802382 4.88281102 9.06536752 4.33324639 9.4221563 1.78469859 6.88167456 1.3704114 6.88167456 -4.54747351e-13 5.64018404'%3e%3c/polygon%3e %3c/g%3e %3cg id='%e8%b7%af%e5%be%84-31' transform='translate(24.927537%2c 2.882501)'%3e %3cmask id='mask-2' fill='white'%3e %3cuse xlink:href='%23path-1'%3e%3c/use%3e %3c/mask%3e %3cuse id='%e8%92%99%e7%89%88' fill='%23FAF9F9' xlink:href='%23path-1'%3e%3c/use%3e %3cpath d='M11.1768379%2c15.6983764 C12.6978987%2c20.5766424 14.2268661%2c26.3275783 15.7637401%2c32.951184 C17.3006141%2c39.5747897 19.3131%2c49.5933232 21.8011979%2c63.0067844 L19.8396394%2c64.2793089 L4.94885639%2c22.6137979 L11.1768379%2c15.6983764 Z' fill='%2398C5FF' mask='url(%23mask-2)'%3e%3c/path%3e %3c/g%3e %3cpath d='M18.9332949%2c2.05866759 C18.6226138%2c2.60788976 19.0307575%2c5.67648814 20.1577258%2c11.2644627 C20.1577258%2c15.2556319 19.0450329%2c30.8737824 17.4821943%2c34.1864176 C16.440302%2c36.3948411 11.4878878%2c45.3590439 2.62495186%2c61.0790259 L6.2857062%2c64.2479718 C18.2758808%2c51.2818521 25.6804176%2c42.7638612 28.4993165%2c38.693999 C31.3182154%2c34.6241369 35.8201134%2c22.6869708 42.0050103%2c2.88250084 L18.9332949%2c2.05866759 Z' id='%e8%b7%af%e5%be%84-4' fill='%23FAF9F9'%3e%3c/path%3e %3cline x1='31.3109438' y1='33.1664176' x2='39.3983764' y2='11.1407272' id='%e8%b7%af%e5%be%84-30' stroke='black' stroke-width='0.5'%3e%3c/line%3e %3c/g%3e %3cg id='%e4%b8%8a%e5%8d%8a%e8%ba%ab' transform='translate(18.367546%2c 10.728877)'%3e %3cg id='%e8%b7%af%e5%be%84-9'%3e %3cmask id='mask-4' fill='white'%3e %3cuse xlink:href='%23path-3'%3e%3c/use%3e %3c/mask%3e %3cuse id='%e8%92%99%e7%89%88' fill='%235798EB' xlink:href='%23path-3'%3e%3c/use%3e %3cpolygon fill='%233F84DA' mask='url(%23mask-4)' points='11.5088472 11.6757544 6.55999079 45.1754463 14.8750696 45.1754463'%3e%3c/polygon%3e %3c/g%3e %3cpolygon id='%e8%b7%af%e5%be%84-14' fill='%235798EB' points='19.9922574 53.4049804 19.6047426 56.9199857 9.75788178 56.9199857 10.0482575 53.4049804'%3e%3c/polygon%3e %3cpath d='M12.3990472%2c47.5511957 C12.3990472%2c50.3441119 12.3990472%2c51.7405699 12.3990472%2c51.7405699 C12.2495091%2c52.3501618 11.6846446%2c53.7308557 11.8316648%2c54.8308377 C12.2072366%2c57.6408082 15.0494982%2c58.9628237 15.9862561%2c56.9189855 C16.923014%2c54.8751474 15.2417475%2c53.2999022 15.7821372%2c53.2999022 C16.1287746%2c53.2999022 17.3054356%2c53.2778622 17.295778%2c53.1674758 C17.2647461%2c52.8127791 16.7542932%2c52.2638142 15.7644193%2c51.5205812 L15.7644193%2c47.7173166 L12.3990472%2c47.5511957 Z' id='%e8%b7%af%e5%be%84-10' fill='%23F5B2B2' transform='translate(14.551653%2c 52.730820) rotate(5.000000) translate(-14.551653%2c -52.730820) '%3e%3c/path%3e %3cpath d='M11.5088472%2c11.6757544 C10.9581352%2c19.1182745 10.6827792%2c24.6465825 10.6827792%2c28.2606785 C10.6827792%2c39.5628869 11.6150745%2c47.2206863 11.9560113%2c49.8023053 C11.9560113%2c49.8023053 13.853931%2c49.8023053 17.6497704%2c49.8023053 C20.6694593%2c27.66954 22.429377%2c14.9606897 22.9295235%2c11.6757544' id='%e8%b7%af%e5%be%84-8' fill='%235798EB'%3e%3c/path%3e %3cpath d='M11.5088472%2c11.6757544 C10.9581352%2c19.1182745 10.6827792%2c24.6465825 10.6827792%2c28.2606785 C10.6827792%2c31.3448917 10.7522042%2c34.1577178 10.8600921%2c36.6700619' id='%e8%b7%af%e5%be%84' stroke='black' stroke-width='0.5'%3e%3c/path%3e %3cpath d='M17.6497704%2c49.8023053 C18.3879368%2c44.3919256 19.0508238%2c39.5446847 19.6384315%2c35.2605827 C21.4546077%2c22.0192929 22.5516384%2c14.1576835 22.9295235%2c11.6757544' id='%e8%b7%af%e5%be%84' stroke='black' stroke-width='0.5' fill='white'%3e%3c/path%3e %3c/g%3e %3cg id='%e9%a2%86%e5%b8%a6' transform='translate(40.185547%2c 23.508239) scale(-1%2c 1) translate(-40.185547%2c -23.508239) translate(36.244574%2c 11.827278)'%3e %3cpath d='M1.05509147%2c2.50582671 C1.72664717%2c2.76640787 2.4355692%2c2.80392397 3.18185756%2c2.618375 L1.44871516%2c4.96816025 L1.91367979%2c21.4757731 C1.20414662%2c22.396251 0.69536869%2c23.0249676 0.387345995%2c23.3619227 C0.140641333%2c20.1680202 0.0132559956%2c17.3085858 0.00518998243%2c14.7836193 C-0.00690903735%2c10.9961697 -0.00690903734%2c10.3395148 0.108828224%2c8.24139717 C0.185986399%2c6.84265206 0.350171415%2c5.5517671 0.601383272%2c4.36874228 L1.05509147%2c2.50582671 Z' id='%e8%b7%af%e5%be%84-13' fill='%23FF5E34' fill-rule='nonzero'%3e%3c/path%3e %3cpath d='M7.02004189%2c0 C6.90467884%2c0.293717151 6.82221129%2c0.48234388 6.77263922%2c0.565880189 C6.45739658%2c1.07334339 5.87856784%2c1.82401392 5.24762788%2c2.12299116 C4.58864435%2c2.43525714 3.83021368%2c2.50582671 3.30137028%2c2.48114608 C3.19810047%2c2.47632658 2.94762438%2c2.42183496 2.79968007%2c2.44426502 C2.9704127%2c2.70378474 3.05577901%2c3.00611301 3.05577901%2c3.35124981 C3.05577901%2c3.69638661 2.89466078%2c4.03555077 2.57242431%2c4.36874228 C5.7268591%2c3.48760602 7.414721%2c2.73902231 7.63601002%2c2.12299116 C7.79968391%2c1.66735079 8.0012169%2c1.27215209 7.79323645%2c0.711334115 C7.68841883%2c0.42869407 7.43068731%2c0.191582698 7.02004189%2c0 Z' id='%e8%b7%af%e5%be%84-11' fill='%2398C5FF'%3e%3c/path%3e %3cpath d='M2.71875368%2c0.958740661 C2.32016126%2c1.55955591 2.34713673%2c2.0547307 2.79968007%2c2.44426502 C1.67466064%2c2.56710242 1.00118644%2c2.9613652 0.779257462%2c3.62705334 C0.467908943%2c3.15362925 0.565295527%2c2.64049944 1.07141721%2c2.08766392 C1.5775389%2c1.5348284 2.12665105%2c1.15852065 2.71875368%2c0.958740661 Z' id='%e8%b7%af%e5%be%84-12' fill='%2398C5FF'%3e%3c/path%3e %3c/g%3e %3cg id='%e5%a4%b4' transform='translate(37.106479%2c 0.000000)'%3e %3cg transform='translate(0.000000%2c 0.000000)'%3e %3cpath d='M0%2c11.8272779 L4.8242591%2c7.1862118 L7.06627722%2c11.3729333 L4.22036181%2c14.2715429 C3.04399726%2c14.4269217 2.1229343%2c14.2881739 1.45717292%2c13.8552993 C0.791411548%2c13.4224248 0.305687239%2c12.7464177 0%2c11.8272779 Z' id='%e8%b7%af%e5%be%84-7' fill='%23F5B2B2'%3e%3c/path%3e %3cpath d='M8.92385193%2c14.0659175 C11.1463035%2c14.0659175 15.7548495%2c6.59457418 15.3327987%2c5.61720506 C14.910748%2c4.63983593 12.4664601%2c2.86280116 10.301134%2c2.86280116 C8.1358079%2c2.86280116 5.08136791%2c6.23733656 4.44761757%2c7.80181715 C5.0651155%2c9.56977018 6.70140035%2c14.0659175 8.92385193%2c14.0659175 Z' id='%e8%b7%af%e5%be%84-11' fill='%23F5B2B2'%3e%3c/path%3e %3cpath d='M5.10888722%2c6.36338283 C6.07339457%2c3.20490209 6.95736661%2c1.2977113 7.76080331%2c0.641810465 C8.96595837%2c-0.342040784 10.9276254%2c0.0460846505 11.4018847%2c0.246094488 C11.6145626%2c0.335787315 13.228738%2c0.804543957 14.4413963%2c1.83911092 C15.9328961%2c3.11156868 17.0509284%2c5.01964028 17.0509284%2c5.45251489 C17.0509284%2c5.97572934 15.9308627%2c7.26814368 13.6907313%2c9.3297579 C14.6564685%2c7.77012177 15.1393371%2c6.78133008 15.1393371%2c6.36338283 C15.1393371%2c5.96423878 14.858699%2c5.27182864 13.6907313%2c6.00258747 C13.4368082%2c6.16145879 12.4439349%2c5.77345213 12.1854679%2c5.77345213 C11.7112075%2c5.77345213 10.9916519%2c6.33178146 10.0268012%2c7.4484401 L5.10888722%2c8.46435933 L4.19059078%2c7.81561215 L5.10888722%2c6.36338283 Z' id='%e8%b7%af%e5%be%84-12' fill='black'%3e%3c/path%3e %3cpath d='M9.90377368%2c7.80674258 C10.7282085%2c6.68721426 10.7282085%2c5.88022057 9.90377368%2c5.38576153 C8.66712142%2c4.64407297 7.40336577%2c7.75087125 8.29381732%2c8.15659413 C8.88745169%2c8.42707605 9.42410381%2c8.31045887 9.90377368%2c7.80674258 Z' id='%e8%b7%af%e5%be%84-13' fill='%23F5B2B2'%3e%3c/path%3e %3c/g%3e %3c/g%3e %3c/g%3e %3c/g%3e %3cg id='%e9%80%9a%e7%94%a8%e7%bb%84%e4%bb%b6/%e8%8a%b1%e8%8d%89/1' transform='translate(111.000000%2c 103.000000)'%3e %3cg id='%e7%bc%96%e7%bb%84' transform='translate(26.096579%2c 25.509525) scale(-1%2c 1) translate(-26.096579%2c -25.509525) translate(5.602306%2c 8.349722)'%3e %3cpath d='M0.876004049%2c0.136482736 C1.62925523%2c-0.208342097 2.51942171%2c0.122752873 2.86424655%2c0.876004049 C4.33485954%2c4.0884785 6.42088117%2c7.03747912 8.70312214%2c9.36351892 C9.63667007%2c10.3149827 10.5517862%2c11.1042483 11.3286631%2c11.6468403 C11.5981564%2c11.8350618 11.8404376%2c11.9858435 12.0434034%2c12.0943991 L12.3008406%2c12.2213216 C12.3291014%2c12.2366962 12.3245736%2c12.2420397 12.2726936%2c12.2420397 C13.1011208%2c12.2420397 13.7726936%2c12.9136126 13.7726936%2c13.7420397 C13.7726936%2c14.5704668 13.1011208%2c15.2420397 12.2726936%2c15.2420397 C11.3088353%2c15.2420397 9.9336892%2c14.4841155 8.41894124%2c13.2144892 L7.96060048%2c12.8184965 C7.80660534%2c12.6815461 7.65148586%2c12.5397248 7.49551373%2c12.393279 L7.02531109%2c11.9403141 L6.55162268%2c11.461079 C6.07673476%2c10.9692013 5.59906337%2c10.4401345 5.12594401%2c9.88052643 L4.65461368%2c9.31098421 C2.93395845%2c7.18714028 1.30737685%2c4.68248003 0.136482736%2c2.12472523 C-0.208342097%2c1.37147406 0.122752873%2c0.481307569 0.876004049%2c0.136482736 Z' id='%e8%b7%af%e5%be%84-59' fill='%2317968F'%3e%3c/path%3e %3cpath d='M11.2877355%2c23.8460667 C10.2208473%2c26.7219981 9.24673806%2c28.1599638 8.36540772%2c28.1599638 C7.04341222%2c28.1599638 5.58226917%2c17.1887014 10.2903272%2c10.0916553 C14.9983852%2c2.99460923 21.446257%2c1.23290166 22.350789%2c3.80731891 C23.255321%2c6.38173615 22.2116206%2c8.32994774 24.7860483%2c8.32994774 C27.360476%2c8.32994774 38.2843819%2c9.51279572 36.0578544%2c11.7393232 C33.8313268%2c13.9658508 29.4478351%2c12.261356 28.027182%2c15.6502779 C26.6065288%2c19.0391997 43.5692959%2c23.8460667 40.650057%2c28.1599638 C39.6177027%2c29.6855225 33.356976%2c29.0608291 28.027182%2c28.1599638 C24.3196895%2c27.5333071 20.435726%2c25.801759 19.8428566%2c27.0140264 C18.3976936%2c29.9690174 23.5618756%2c34.3196059 21.0539432%2c34.3196059 C19.3819882%2c34.3196059 16.1265857%2c30.8284262 11.2877355%2c23.8460667 Z' id='%e8%b7%af%e5%be%84-56' fill='%231DBCB3'%3e%3c/path%3e %3c/g%3e %3c/g%3e %3cg id='%e5%9b%be%e6%a0%87/%e7%a9%ba%e6%80%81%e5%9b%be/%e9%83%a8%e5%88%86/%e7%9b%91%e6%8e%a7%e7%82%b9' transform='translate(20.000000%2c 80.000000)'%3e %3cg id='%e7%bc%96%e7%bb%84-4' transform='translate(8.000000%2c 13.333333)'%3e %3cg id='%e7%bc%96%e7%bb%84-12' transform='translate(0.000000%2c 0.699073)'%3e %3cmask id='mask-6' fill='white'%3e %3cuse xlink:href='%23path-5'%3e%3c/use%3e %3c/mask%3e %3cg id='%e7%9f%a9%e5%bd%a2'%3e%3c/g%3e %3cpath d='M0%2c5.21961872 L52.0213792%2c14.2258859 C53.6029192%2c14.499692 55.2295834%2c14.1683837 56.5780445%2c13.2978142 L64%2c8.50618318 L64%2c8.50618318 L63.2528741%2c8.26595458 C62.3466457%2c7.97456868 61.4179703%2c7.75827083 60.4762542%2c7.61925184 L12.3710619%2c0.517817563 C10.1012479%2c0.18274074 7.78513153%2c0.63496713 5.80807144%2c1.79925468 L0%2c5.21961872 L0%2c5.21961872 Z' id='%e7%9f%a9%e5%bd%a2' fill='%23FCFCFC' mask='url(%23mask-6)'%3e%3c/path%3e %3cpath d='M0%2c5.21961872 L23.4526354%2c9.27988595 L23.4526354%2c6.29467211 C23.4526354%2c5.79043292 23.8614021%2c5.3816663 24.3656413%2c5.3816663 C24.4151721%2c5.3816663 24.4646209%2c5.38569689 24.5134979%2c5.39371816 L35.5216632%2c7.20028164 C35.9629324%2c7.27269887 36.2868124%2c7.65406365 36.2868124%2c8.10123559 L36.2868124%2c11.5018191 L36.2868124%2c11.5018191 L52.0213792%2c14.2258859 C53.6029192%2c14.499692 55.2295834%2c14.1683837 56.5780445%2c13.2978142 L64%2c8.50618318 L64%2c8.50618318 L63.5322717%2c48.7197159 L56.4893275%2c52.8031545 C55.1918832%2c53.5554015 53.6712138%2c53.827407 52.1934508%2c53.5715674 L0%2c44.5355101 L0%2c44.5355101 L0%2c5.21961872 Z' id='%e7%9f%a9%e5%bd%a2' fill='url(%23linearGradient-7)' mask='url(%23mask-6)'%3e%3c/path%3e %3cpath d='M0%2c5.21961872 L20.9720516%2c8.83899615 L20.9720516%2c5.85612567 C20.9720516%2c5.35188648 21.3808182%2c4.94311985 21.8850574%2c4.94311985 C21.9352431%2c4.94311985 21.9853434%2c4.94725773 22.0348492%2c4.95549143 L35.5235983%2c7.19891488 C35.9639791%2c7.27215819 36.2868124%2c7.65311904 36.2868124%2c8.09954912 L36.2868124%2c11.5018191 L36.2868124%2c11.5018191 L52.0213792%2c14.2258859 C53.6029192%2c14.499692 55.2295834%2c14.1683837 56.5780445%2c13.2978142 L64%2c8.50618318 L64%2c8.50618318 L63.5322717%2c48.7197159 L56.4893275%2c52.8031545 C55.1918832%2c53.5554015 53.6712138%2c53.827407 52.1934508%2c53.5715674 L0%2c44.5355101 L0%2c44.5355101 L0%2c5.21961872 Z' id='%e7%9f%a9%e5%bd%a2' fill='url(%23linearGradient-8)' mask='url(%23mask-6)'%3e%3c/path%3e %3c/g%3e %3cg id='%e7%bc%96%e7%bb%84' transform='translate(4.069126%2c 0.000000)'%3e %3cg id='%e7%bc%96%e7%bb%84-2' transform='translate(17.514009%2c 0.000000)'%3e %3cmask id='mask-10' fill='white'%3e %3cuse xlink:href='%23path-9'%3e%3c/use%3e %3c/mask%3e %3cg id='%e8%b7%af%e5%be%84-27'%3e%3c/g%3e %3cpath d='M3.03164901e-13%2c9.66189949 L3.03164901e-13%2c5.86397119 L7.45964456%2c-1.43353459 L20.4151328%2c0.699072855 L22.3865773%2c1.38857027 L24.2451781%2c3.37509462 L15.8988537%2c12.1705062 L13.612215%2c12.0092989 L3.03164901e-13%2c9.66189949 Z' id='%e5%bd%a2%e7%8a%b6%e7%bb%93%e5%90%88' fill='url(%23linearGradient-11)' mask='url(%23mask-10)'%3e%3c/path%3e %3cpath d='M-0.61108291%2c9.538069 L-0.61108291%2c6.55519852 C-0.61108291%2c6.05095933 -0.202316285%2c5.64219271 0.301922901%2c5.64219271 C0.352108658%2c5.64219271 0.402208977%2c5.64633059 0.451714698%2c5.65456428 L13.9404639%2c7.89798774 C14.3808446%2c7.97123104 14.7036779%2c8.3521919 14.7036779%2c8.79862197 L14.7036779%2c12.2008919 L14.7036779%2c12.2008919 L-0.61108291%2c9.538069 Z' id='%e7%9f%a9%e5%bd%a2' fill='url(%23linearGradient-12)' mask='url(%23mask-10)'%3e%3c/path%3e %3c/g%3e %3cpath d='M22.3345219%2c49.5334956 C29.8697104%2c49.753112 34.8595315%2c43.1509031 33.4795993%2c34.7870495 C32.0996671%2c26.4231958 24.8725338%2c19.4649185 17.3373453%2c19.2453021 C9.80215678%2c19.0256858 4.81233566%2c25.6278946 6.19226787%2c33.9917483 C7.57220008%2c42.355602 14.7993334%2c49.3138793 22.3345219%2c49.5334956 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2' fill='%23D5DDE6'%3e%3c/path%3e %3cpath d='M20.3854268%2c49.4766884 C27.5617968%2c49.6858468 32.3140074%2c43.3980289 30.9997862%2c35.432454 C29.6855651%2c27.466879 22.802581%2c20.8399482 15.626211%2c20.6307898 C8.44984097%2c20.4216314 3.69763038%2c26.7094493 5.01185153%2c34.6750243 C6.32607268%2c42.6405992 13.2090568%2c49.26753 20.3854268%2c49.4766884 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2%e5%a4%87%e4%bb%bd' fill='url(%23linearGradient-13)'%3e%3c/path%3e %3cpath d='M15.8641718%2c22.0730847 C22.3229048%2c22.2613273 28.5175904%2c28.225565 29.7003895%2c35.3945825 C30.5986975%2c40.8392824 28.347775%2c45.4130183 24.3836334%2c47.2157529 L19.6200598%2c50.4724706 L17.7507774%2c47.7028908 C12.2205379%2c46.3386448 7.34642742%2c40.98718 6.31124826%2c34.7128957 C6.07494498%2c33.2806471 6.05655985%2c31.9086667 6.22995374%2c30.6315403 L4.21604756%2c27.6484744 L10.2540287%2c23.5183756 L10.3254995%2c23.624143 C11.8594119%2c22.57944 13.7442725%2c22.0112994 15.8641718%2c22.0730847 Z' id='%e5%bd%a2%e7%8a%b6%e7%bb%93%e5%90%88' fill='%23D5DDE6'%3e%3c/path%3e %3cpath d='M14.032781%2c52.3217411 C20.491514%2c52.5099837 24.7685035%2c46.8509475 23.5857045%2c39.6819301 C22.4029054%2c32.5129126 16.2082197%2c26.5486749 9.74948675%2c26.3604323 C3.29075375%2c26.1721897 -0.986235781%2c31.8312259 0.196563257%2c39.0002433 C1.3793623%2c46.1692608 7.57404797%2c52.1334985 14.032781%2c52.3217411 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2%e5%a4%87%e4%bb%bd-3' fill='url(%23linearGradient-14)'%3e%3c/path%3e %3cpath d='M13.556536%2c50.6598554 C19.297632%2c50.8271821 23.0994005%2c45.7969278 22.0480235%2c39.4244678 C20.9966466%2c33.0520079 15.4902593%2c27.7504633 9.74916335%2c27.5831365 C4.00806735%2c27.4158098 0.206298878%2c32.4460641 1.2576758%2c38.8185241 C2.30905272%2c45.190984 7.81543999%2c50.4925286 13.556536%2c50.6598554 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2%e5%a4%87%e4%bb%bd-3' fill='%23000100'%3e%3c/path%3e %3cpath d='M12.2847838%2c36.2160336 C13.1930431%2c36.2425052 13.7932%2c35.4388557 13.6252718%2c34.4210323 C13.4573435%2c33.4032088 12.5849211%2c32.5566404 11.6766618%2c32.5301688 C10.7684024%2c32.5036971 10.1682455%2c33.3073466 10.3361738%2c34.3251701 C10.5041021%2c35.3429935 11.3765245%2c36.189562 12.2847838%2c36.2160336 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2' fill='white'%3e%3c/path%3e %3cpath d='M7.89931982%2c36.0882173 C8.20207293%2c36.0970412 8.40212523%2c35.829158 8.34614915%2c35.4898835 C8.29017306%2c35.1506091 7.99936559%2c34.8684196 7.69661248%2c34.8595957 C7.39385937%2c34.8507718 7.19380707%2c35.118655 7.24978315%2c35.4579295 C7.30575924%2c35.797204 7.59656671%2c36.0793934 7.89931982%2c36.0882173 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2%e5%a4%87%e4%bb%bd-4' fill='white'%3e%3c/path%3e %3c/g%3e %3cg id='%e7%bc%96%e7%bb%84-3' transform='translate(41.998267%2c 6.533002)'%3e %3cpath d='M5.47803487%2c1.17707736 C7.29488057%2c1.17707736 8.90514535%2c1.57798256 9.90173583%2c2.19527077 L10.9560697%2c2.19540818 L10.9560697%2c3.37248554 L10.9197637%2c3.37267008 C10.9437445%2c3.46697043 10.9560697%2c3.56287915 10.9560697%2c3.66009269 C10.9560697%2c5.0314242 8.50346998%2c6.14310803 5.47803487%2c6.14310803 C2.45259975%2c6.14310803 0%2c5.0314242 0%2c3.66009269 C0%2c3.56287915 0.0123252387%2c3.46697043 0.0363060529%2c3.37267008 L0%2c3.37248554 L0%2c2.19540818 L1.05433391%2c2.19527077 C2.05092439%2c1.57798256 3.66118916%2c1.17707736 5.47803487%2c1.17707736 Z' id='%e5%bd%a2%e7%8a%b6%e7%bb%93%e5%90%88%e5%a4%87%e4%bb%bd' fill='%23FF5E34'%3e%3c/path%3e %3cpath d='M5.47803487%2c4.96603067 C8.50346998%2c4.96603067 10.9560697%2c3.85434684 10.9560697%2c2.48301534 C10.9560697%2c1.11168383 8.50346998%2c0 5.47803487%2c0 C2.45259975%2c0 0%2c1.11168383 0%2c2.48301534 C0%2c3.85434684 2.45259975%2c4.96603067 5.47803487%2c4.96603067 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2%e5%a4%87%e4%bb%bd-2' fill='%23FC7B5A' fill-rule='nonzero'%3e%3c/path%3e %3c/g%3e %3cg id='%e7%bc%96%e7%bb%84-3' transform='translate(43.215608%2c 4.690070)'%3e %3cpath d='M8.52138757%2c1.52762431 L8.52138757%2c4.21523407 L8.4929491%2c4.21465864 C8.5117326%2c4.28050197 8.52138757%2c4.34747321 8.52138757%2c4.4153589 C8.52138757%2c5.3695684 6.61380999%2c6.14310803 4.26069379%2c6.14310803 C1.90757758%2c6.14310803 0%2c5.3695684 0%2c4.4153589 C0%2c4.34747321 0.00965497485%2c4.28050197 0.0284384682%2c4.21465864 L0%2c4.21523407 L0%2c1.52762431 L8.52138757%2c1.52762431 Z' id='%e5%bd%a2%e7%8a%b6%e7%bb%93%e5%90%88%e5%a4%87%e4%bb%bd' fill='%23FF5E34'%3e%3c/path%3e %3cpath d='M4.26069379%2c3.45549827 C6.61380999%2c3.45549827 8.52138757%2c2.68195863 8.52138757%2c1.72774913 C8.52138757%2c0.773539636 6.61380999%2c0 4.26069379%2c0 C1.90757758%2c0 0%2c0.773539636 0%2c1.72774913 C0%2c2.68195863 1.90757758%2c3.45549827 4.26069379%2c3.45549827 Z' id='%e6%a4%ad%e5%9c%86%e5%bd%a2%e5%a4%87%e4%bb%bd-2' fill='%23FC7B5A' fill-rule='nonzero'%3e%3c/path%3e %3c/g%3e %3c/g%3e %3cg id='%e7%9f%a9%e5%bd%a2%e5%a4%87%e4%bb%bd-15'%3e %3cuse fill='url(%23linearGradient-15)' fill-rule='evenodd' xlink:href='%23path-16'%3e%3c/use%3e %3cuse fill='black' fill-opacity='1' filter='url(%23filter-17)' xlink:href='%23path-16'%3e%3c/use%3e %3c/g%3e %3c/g%3e %3c/g%3e %3c/g%3e%3c/svg%3e";

function drawInfoParamsPolygon(data) {
    if (!data || !data.polygons || !(data.polygons instanceof Array)) {
        return null;
    // return {
    //   type: 'polygon',
    //   points: []
    // }
    }
    const _polygons = data.polygons.map((item)=>{
        return {
            x: item.x,
            y: item.y
        };
    });
    return {
        type: 'polygon',
        color: data.color,
        points: _polygons
    };
}
class Rule {
    // 过滤不满足条件的字符
    filter(str) {
        if (!str) return '';
        return str.match(this.reg).join('');
    }
    check(str) {
        const content = `${str}`;
        if (content.length < this.minLen) {
            return {
                result: false,
                msg: `长度不能小于${this.minLen}`
            };
        }
        if (content.length > this.maxLen) {
            return {
                result: false,
                msg: `长度不能大于${this.maxLen}`
            };
        }
        let spChars = content.replace(this.reg, '');
        if (spChars) {
            // 字符去重，空格替换显示
            spChars = [
                ...new Set([
                    ...spChars
                ])
            ].join('');
            spChars.replace(' ', '空格');
            return {
                result: false,
                msg: `不支持特殊字符${spChars}`
            };
        } else {
            return {
                result: true
            };
        }
    }
    constructor(reg, maxLen, minLen = 0){
        this.reg = reg;
        this.maxLen = maxLen;
        this.minLen = minLen;
    }
}
const regMap = {
    reg1: /[a-zA-Z0-9\u4e00-\u9fa5`°~!@#℃$%^&*()_+\-={}[\]; :><,.，。""“”‘’\n【】（）%、？?○≤≥…$｜|¥·{–}/.，。？！＃：、～；＊—＄＆『〔【｛￥￡♀‖《〖「」〗》｝】〕』]/g
};
function genRule(regKey, maxLen, minLen = 0) {
    if (!regMap[regKey]) throw new Error('未查找到匹配的正则表达式，请检查regKey是否正确');
    return new Rule(regMap[regKey], maxLen, minLen);
}
const reg1_1_255 = genRule('reg1', 255, 1);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script = {
    name: 'HikCloudImageCanvasGallery',
    components: {
        videoPlayer: __vue_component__$1
    },
    props: {
        isShowToolBar: {
            type: Boolean,
            default: true
        },
        // 全量操作 ['zoom', 'drag', 'text', 'draw', 'color', 'revert', 'download', 'clean', 'ruleSwitch', 'drawSwitch']
        models: {
            type: Array,
            default: ()=>[
                    "zoom",
                    "drag",
                    "text",
                    "draw",
                    "color",
                    "revert",
                    "download",
                    "clean"
                ]
        },
        defaultModels: {
            type: Array,
            default: ()=>[
                    "drawSwitch"
                ]
        },
        currentSelectModel: {
            type: String,
            default: "drag"
        },
        // 绘图区域宽度
        width: {
            type: Number,
            default: 0
        },
        // 绘图区域高度
        height: {
            type: Number,
            default: 0
        },
        // 画笔颜色
        lineColor: {
            type: String,
            default: "red"
        },
        // 画笔宽度
        lineWidth: {
            type: Number,
            default: 1.5
        },
        imgList: {
            type: Array,
            default: ()=>[]
        },
        selectIndex: {
            type: Number,
            default: 0
        },
        secondSelectIndex: {
            type: Number,
            default: 0
        },
        storeName: {
            type: String,
            default: ""
        },
        showImgListBar: {
            type: Boolean,
            default: true
        },
        textFS: {
            type: Number,
            default: 24
        },
        // 行高相比字体比例
        lineHeightRate: {
            type: Number,
            default: 1.3
        },
        emptyText: {
            type: String,
            default: "无图片"
        },
        deletable: {
            type: Boolean,
            default: false
        },
        currentChannelName: {
            type: String,
            default: ''
        },
        containerShdow: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            emptyImg: img,
            drawing: false,
            localSelectIndex: 0,
            localSecondSelectIndex: 0,
            // 当前选中的操作
            currentOpModel: "drag",
            // 涂鸦操作收起的集合中，当前选中的涂鸦类型
            currentDrawType: "draw-rec",
            currentDrawColor: {
                color: "#FA3239"
            },
            localDrawTypeKey: "defaultDrawType",
            popShow: false,
            colorPopShow: false,
            ruleAreaSwitch: true,
            drawStaffSwitch: true,
            maxHistoryPhotos: 20,
            operationHistoryPhotosIndex: 0,
            operationHistoryPhotos: [],
            scaleInfo: {
                scale: 100,
                scaleStatus: -1
            },
            drawRenderPopShow: false,
            drawRender: {
                isRenderDraw: true,
                isRenderAIDraw: true,
                isRenderRule: true
            },
            drawColors: [
                {
                    color: "white",
                    displayColor: "rgba(0,0,0,0.12)"
                },
                {
                    color: "black"
                },
                {
                    color: "#FA3239"
                },
                {
                    color: "#FFCC00"
                },
                {
                    color: "#02BF0F"
                },
                {
                    color: "#3A93FF"
                }
            ],
            drawModels: [
                {
                    type: "draw-rec",
                    title: "矩形",
                    icon: "iconfont iconsquare"
                },
                {
                    type: "draw-circle",
                    title: "圆形",
                    icon: "iconfont iconcircle"
                },
                {
                    type: "draw-arrow",
                    title: "箭头",
                    icon: "iconfont iconarrow"
                }
            ],
            textInfo: {
                padding: 4,
                x: 0,
                y: 0,
                zoomingX: 0,
                zoomingY: 0,
                content: "",
                zooming: false,
                dragging: false,
                display: false,
                scale: 1,
                size: {
                    rows: 1,
                    width: 10
                }
            },
            autoCanvasWidth: 0,
            autoCanvasHeight: 0
        };
    },
    computed: {
        hasPic () {
            const checkHasPic = (arr)=>arr.some((img)=>img && img.picUrl);
            if (!this.imgList || this.imgList.length === 0) return false;
            // 如果是二维数组（第一个元素是数组）
            if (Array.isArray(this.imgList[0])) {
                return this.imgList.some((subArray)=>subArray && checkHasPic(subArray));
            }
            // 一维数组
            return checkHasPic(this.imgList);
        },
        allModels () {
            return [
                ...new Set([
                    ...this.models,
                    ...this.defaultModels
                ])
            ];
        },
        selectImgObj () {
            return this.singleDimension ? this.imgList[this.localSelectIndex] || {} : this.imgList[this.localSelectIndex][this.localSecondSelectIndex] || {};
        },
        imgUrl () {
            return this.selectImgObj ? this.selectImgObj.picUrl : undefined;
        },
        info () {
            // aiPicSame为true表示AI兼容数据，用于app历史版本展示，web端展示aiPicCoordinate就行
            return this.selectImgObj ? this.selectImgObj.aiPicSame ? undefined : this.selectImgObj.picCoordinate : undefined;
        },
        aiInfo () {
            return this.selectImgObj ? this.selectImgObj.aiPicCoordinate : undefined;
        },
        ruleInfo () {
            return this.selectImgObj && this.selectImgObj.multiAnalysisAreaPolygon ? this.selectImgObj.multiAnalysisAreaPolygon.map(drawInfoParamsPolygon) : undefined;
        },
        currentDrawModel () {
            let drawModel = this.drawModels.find((e)=>e.type == this.currentDrawType);
            return drawModel || this.drawModels[0];
        },
        // 映射到canvas上当前的选中操作
        canvasOpModel () {
            if (this.currentOpModel == "draw") {
                return this.currentDrawModel.type;
            }
            return this.currentOpModel;
        },
        drawRenderTypes () {
            let getIconClass = (render)=>render ? "h-icon-password_visible" : "h-icon-password_unvisible";
            return [
                {
                    type: "isRenderRule",
                    title: "检测区域",
                    icon: getIconClass(this.drawRender.isRenderRule),
                    disabled: !(this.ruleInfo && this.ruleInfo.length)
                },
                {
                    type: "isRenderAIDraw",
                    title: "目标框",
                    icon: getIconClass(this.drawRender.isRenderAIDraw),
                    disabled: !(this.aiInfo && this.aiInfo.length)
                },
                {
                    type: "isRenderDraw",
                    title: "涂鸦框",
                    icon: getIconClass(this.drawRender.isRenderDraw),
                    disabled: !(this.info && this.info.length)
                }
            ].filter((t)=>!t.disabled);
        },
        globalDrawRenderStatus () {
            return this.drawRenderTypes.some((renderType)=>this.drawRender[renderType.type]);
        },
        displayOpModels () {
            if (!this.isShowToolBar) return [];
            let opModels = [
                {
                    type: "drag",
                    title: "移动",
                    icon: "iconfont iconic_move",
                    callback: this.changeModel
                },
                {
                    type: "text",
                    title: "文字",
                    icon: "iconfont icontext",
                    callback: this.changeModel
                },
                {
                    type: "draw",
                    title: "四边形",
                    icon: "iconfont icon-ic_common_square",
                    callback: this.changeModel
                },
                {
                    type: "color",
                    title: "颜色",
                    callback: ()=>{}
                },
                {
                    type: "drawSwitch",
                    title: "辅助框",
                    icon: this.globalDrawRenderStatus ? "h-icon-password_visible" : "h-icon-password_unvisible",
                    callback: this.toggleDrawSwitch,
                    disabled: !this.drawRenderTypes.length
                },
                {
                    type: "revert",
                    title: "撤销",
                    icon: "h-icon-reset",
                    callback: this.backTo,
                    subModels: [
                        {
                            type: "revert",
                            title: "撤销",
                            icon: "h-icon-reset",
                            disabled: this.operationHistoryPhotosIndex <= 0,
                            callback: ()=>this.operationHistoryGoOffset(-1)
                        },
                        {
                            type: "forward",
                            title: "恢复",
                            icon: "h-icon-reset rotateLR",
                            disabled: this.operationHistoryPhotosIndex >= this.operationHistoryPhotos.length - 1,
                            callback: ()=>this.operationHistoryGoOffset(1)
                        }
                    ]
                },
                {
                    type: "download",
                    title: "下载",
                    icon: "h-icon-download",
                    callback: this.downloadCanvasIamge
                },
                {
                    type: "clean",
                    title: "清除涂鸦",
                    icon: "icon iconfont iconcanvas_clean",
                    callback: this.clean
                }
            ];
            let ops = opModels.filter((e)=>{
                if (e.disabled) return false;
                let flag = this.allModels.includes(e.type);
                if (flag && e.type == "draw") {
                    e.title = this.currentDrawModel.title;
                    e.icon = this.currentDrawModel.icon;
                }
                return flag;
            });
            return ops;
        },
        opModelAvailable () {
            return this.imgUrl && (this.zoomable || this.displayOpModels.length > 0);
        },
        displayOpModelBlocks () {
            let res = {
                defaultBlock: [],
                simpleBlock: []
            };
            if (this.displayOpModels.length == 0) return res;
            let simpleOps = [
                "revert",
                "download",
                "clean"
            ];
            this.displayOpModels.forEach((op)=>{
                if (simpleOps.includes(op.type)) {
                    if (op.subModels) {
                        res.simpleBlock.push(...op.subModels);
                    } else {
                        res.simpleBlock.push(op);
                    }
                } else {
                    res.defaultBlock.push(op);
                }
            });
            return res;
        },
        viewOnly () {
            return this.displayOpModelBlocks.defaultBlock.every((op)=>op.type != "text" && op.type != "draw");
        },
        zoomable () {
            return this.isShowToolBar && this.allModels.includes("zoom");
        },
        isTextModel () {
            return this.canvasOpModel == "text";
        },
        textConVisualX () {
            return this.textInfo.zooming ? this.textInfo.zoomingX : this.textInfo.x;
        },
        textConVisualY () {
            return this.textInfo.zooming ? this.textInfo.zoomingY : this.textInfo.y;
        },
        picArrayDimension () {
            return this.getArrayDimension(this.imgList);
        },
        singleDimension () {
            return this.picArrayDimension === 1;
        },
        doubleDimension () {
            return this.picArrayDimension === 2;
        },
        renderWidth () {
            return this.width > 0 ? this.width : this.autoCanvasWidth;
        },
        renderHeight () {
            return this.height > 0 ? this.height : this.autoCanvasHeight;
        }
    },
    watch: {
        "textInfo.content": function(nv) {
            let filterStr = reg1_1_255.filter(nv);
            if (filterStr != nv) {
                this.textInfo.content = filterStr;
                this.resizeTextAreaWithText(this.textInfo.content);
            }
        },
        isTextModel (nv) {
            if (nv) this.$refs.imgCanvas && this.$refs.imgCanvas.resetZoom();
        },
        selectIndex: {
            handler: function(v) {
                this.localSelectIndex = v;
                this.$nextTick(()=>{
                    this.$refs.imgList.setSelectImgCenter();
                });
            },
            immediate: true
        },
        secondSelectIndex: {
            handler: function(v) {
                this.localSecondSelectIndex = v;
                this.$nextTick(()=>{
                    this.$refs.imgList.setSelectImgCenter();
                });
            },
            immediate: true
        },
        currentSelectModel: {
            handler: function(v) {
                this.currentOpModel = v;
            },
            immediate: true
        },
        imgList: {
            handler: function(v) {
                const processItem = (item)=>{
                    this.$set(item, "drawInfo", item.drawInfo || []);
                    let formatColumn = [
                        "picCoordinate",
                        "aiPicCoordinate",
                        "multiAnalysisAreaPolygon"
                    ];
                    formatColumn.forEach((col)=>{
                        if (item[col] && typeof item[col] === "string") {
                            try {
                                item[col] = JSON.parse(item[col]);
                            } catch  {
                                item[col] = [];
                            }
                        }
                    });
                    return item;
                };
                // 处理一维或二维数组
                v.forEach((e)=>{
                    if (Array.isArray(e)) {
                        e.forEach((subE)=>processItem(subE));
                    } else {
                        processItem(e);
                    }
                });
                if (this.localSelectIndex > v.length - 1) {
                    this.localSelectIndex = 0;
                }
            },
            immediate: true
        },
        // 允许的操作变化时，若当前选中的操作没了，重置为移动操作
        displayOpModels: {
            handler: function() {
                if (this.displayOpModels.find((e)=>e.type == this.currentOpModel)) return;
                this.currentOpModel = "drag";
                this.$emit("update:currentSelectModel", this.currentOpModel);
            },
            immediate: true
        },
        imgUrl: {
            handler: function() {
                this.operationHistoryPhotos = [
                    [
                        ...this.selectImgObj.drawInfo || []
                    ]
                ];
                this.operationHistoryPhotosIndex = 0;
            },
            immediate: true
        }
    },
    mounted () {
        let localDrawType = localStorage.getItem(this.localDrawTypeKey);
        if (localDrawType) this.currentDrawType = localDrawType;
        let localDrawSwitch = localStorage.getItem(this.localStorageDrawSwitchKey);
        if (localDrawSwitch) this.drawStaffSwitch = !!+localDrawSwitch;
        let localRuleSwitch = localStorage.getItem(this.localStorageRuleSwitchKey);
        if (localRuleSwitch) this.ruleAreaSwitch = !!+localRuleSwitch;
        window.addEventListener("click", this.exitText);
        this.getSize();
        window.addEventListener('resize', this.getSize);
    },
    beforeDestroy () {
        window.removeEventListener("click", this.exitText);
        window.removeEventListener('resize', this.getSize);
    },
    methods: {
        getSize () {
            if (this.width > 0 || this.height > 0) {
                return;
            }
            const calculateSize = (innerDimension, offset, minSize)=>Math.max(innerDimension - offset, minSize);
            const parentWidth = this.$el.parentNode.offsetWidth;
            const parentHeight = this.$el.parentNode.offsetHeight;
            const opearBarHiehgt = this.$refs.opearBar.offsetHeight;
            const imgListBarHeight = this.$refs.imgListBar.offsetHeight;
            const [width, height] = [
                calculateSize(parentWidth, 0, 200),
                Math.round(calculateSize(parentHeight, opearBarHiehgt + imgListBarHeight, 100))
            ];
            // this.autoCanvasWidth = width
            // this.autoCanvasHeight = height
            if (this.autoCanvasWidth !== width || this.autoCanvasHeight !== height) {
                this.autoCanvasWidth = width;
                this.autoCanvasHeight = height;
                // 如果正在显示文字，重新定位
                if (this.textInfo.display) {
                    this.$nextTick(()=>{
                        this.resizeTextAreaWithText(this.textInfo.content);
                    });
                }
            }
        },
        drawStatusChanged (drawing) {
            this.drawing = drawing;
        },
        opened () {
            if (this.$refs.imgList) {
                this.$refs.imgList.opened();
            }
        },
        imgListCenterFit () {
            this.$nextTick(()=>{
                this.$refs.imgList.setSelectImgCenter();
            });
        },
        picSelectOffset (offset) {
            if (this.singleDimension) {
                this.localSelectIndex += offset;
            } else {
                if (offset === -1) {
                    // 左箭头
                    if (this.localSecondSelectIndex > 0) {
                        this.localSecondSelectIndex--;
                    } else if (this.localSelectIndex > 0) {
                        this.localSelectIndex--;
                        this.localSecondSelectIndex = this.imgList[this.localSelectIndex].length - 1;
                    }
                } else {
                    // 右箭头
                    if (this.localSecondSelectIndex < this.imgList[this.localSelectIndex].length - 1) {
                        this.localSecondSelectIndex++;
                    } else if (this.localSelectIndex < this.imgList.length - 1) {
                        this.localSelectIndex++;
                        this.localSecondSelectIndex = 0;
                    }
                }
            }
            this.imgListCenterFit();
            this.$emit("update:selectIndex", this.localSelectIndex);
            if (!this.singleDimension) {
                this.$emit("update:secondSelectIndex", this.localSecondSelectIndex);
            }
        },
        operationHistoryGoOffset (offset) {
            let r = this.operationHistoryPhotosIndex + offset;
            if (r < 0 || r >= this.operationHistoryPhotos.length) return;
            this.operationHistoryPhotosIndex += offset;
            let drawInfo = this.operationHistoryPhotos[this.operationHistoryPhotosIndex];
            this.selectImgObj.drawInfo = [
                ...drawInfo
            ];
        },
        startZoom (e) {
            e.target.onpointermove = this.resizeTextContainer;
            e.target.setPointerCapture(e.pointerId);
            this.textInfo.zooming = true;
            let rect = this.$refs.textCon.getBoundingClientRect();
            this.textInfo.zoomingX = this.textInfo.x + (rect.width - rect.width / this.textInfo.scale) / 2;
            this.textInfo.zoomingY = this.textInfo.y + (rect.height - rect.height / this.textInfo.scale) / 2;
        },
        stopZoom (e) {
            e.target.onpointermove = null;
            e.target.releasePointerCapture(e.pointerId);
            this.textInfo.zooming = false;
            let rect = this.$refs.textCon.getBoundingClientRect();
            this.textInfo.x = this.textInfo.zoomingX - (rect.width - rect.width / this.textInfo.scale) / 2;
            this.textInfo.y = this.textInfo.zoomingY - (rect.height - rect.height / this.textInfo.scale) / 2;
        },
        resizeTextContainer (e) {
            let rect = this.$refs.textCon.getBoundingClientRect();
            let originX = rect.x + rect.width / 2;
            let originY = rect.y + rect.height / 2;
            let relativeX = e.clientX - originX;
            let relativeY = e.clientY - originY;
            let rate = Math.abs(rect.height / rect.width);
            let resRelativeX = Math.sqrt((relativeX * relativeX + relativeY * relativeY) / (1 + rate * rate));
            // 文字缩放字体大小范围
            this.textInfo.scale = Math.max(Math.min(resRelativeX * this.textInfo.scale * 2 / rect.width, 100 / this.textFS), 12 / this.textFS);
        },
        resizeTextAreaWithText (nv) {
            let lines = nv.split("\n");
            // 四周安全区
            let baseWidth = Math.max(10, ...this.getTextsWidth(lines));
            let width = baseWidth + 8;
            this.textInfo.size = {
                rows: lines.length,
                width
            };
            // 同步执行边界检查
            this.$nextTick(()=>{
                this.checkTextBoundaryImmediately(width);
            });
        },
        // 调整文字位置，确保文字不会超出画布边界
        checkTextBoundaryImmediately (textWidth) {
            const textarea = this.$refs.text;
            if (!textarea) return;
            const freeWidth = textWidth;
            const freeHeight = textarea.clientHeight;
            const canvasWidth = this.renderWidth;
            const canvasHeight = this.renderHeight;
            // 四周安全区
            // let safeNap = 12;
            const safeNap = 12;
            if (this.textInfo.x + freeWidth + this.textInfo.padding * 2 + safeNap > canvasWidth) {
                this.textInfo.x = Math.max(safeNap, canvasWidth - freeWidth - this.textInfo.padding * 2 - safeNap);
            }
            if (this.textInfo.y + freeHeight + this.textInfo.padding * 2 + safeNap > canvasHeight) {
                this.textInfo.y = Math.max(safeNap, canvasHeight - freeHeight - this.textInfo.padding * 2 - safeNap);
            }
        },
        colorIconStyle (drawColor) {
            if (drawColor.color == this.currentDrawColor.color) {
                return {
                    "border-color": drawColor.displayColor || drawColor.color
                };
            }
            if (drawColor.displayColor) {
                return {
                    "border-width": "1px",
                    "border-color": drawColor.displayColor
                };
            } else {
                return {
                    background: drawColor.color
                };
            }
        },
        selectDrawColor (drawColor) {
            this.currentDrawColor = drawColor;
            this.$refs.drawColorPop[0].doClose();
        },
        getTextsWidth (texts) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context.font = `${this.textFS}px Arial`;
            return texts.map((txt)=>context.measureText(txt).width);
        },
        inputUpdate (e) {
            this.resizeTextAreaWithText(e.target.value);
        },
        textDrawHandler (e) {
            // 文字涂鸦中，理应退出涂鸦模式，退出由统一方法处理，这里只负责拦截
            if (this.textInfo.display) return;
            // 非文字涂鸦模式，不做处理
            if (!this.isTextModel) return;
            // 是否对文字进行再编辑
            let editTextInfo = this.$refs.imgCanvas.getEditTextInfo(e);
            if (editTextInfo) {
                e.stopPropagation();
                let { x, y, content, scale } = editTextInfo;
                let padding = this.textInfo.padding;
                Object.assign(this.textInfo, {
                    x: x - padding * scale,
                    y: y - (padding + this.textFS * (this.lineHeightRate - 1) / 2 + this.textFS / 14) * scale,
                    content,
                    scale
                });
                this.textInfo.display = true;
                this.resizeTextAreaWithText(this.textInfo.content);
                this.$nextTick(()=>this.$refs.text.focus());
                return;
            }
            // 校验是否还能增加涂鸦
            if (!this.$refs.imgCanvas.paintingCheck()) return;
            // 进入文字涂鸦模式，组织冒泡，不然会触发后续退出文字涂鸦逻辑
            e.stopPropagation();
            this.textInfo.display = true;
            this.textInfo.content = "文本";
            this.textInfo.scale = 1;
            this.resizeTextAreaWithText(this.textInfo.content);
            this.textInfo.x = e.offsetX || e.layerX;
            this.textInfo.y = e.offsetY || e.layerY;
            this.$nextTick(()=>this.$refs.text.select());
        },
        exitText () {
            if (!this.textInfo.display) return;
            this.textInfo.display = false;
            if (!this.textInfo.content) return;
            const { x, y, content, padding, scale } = this.textInfo;
            // x,y要进行偏移，包含容器padding，字体行高, 以及1倍行高时，文字顶部也不是完全贴合文本域，补偿1像素
            let obj = {
                x: x + padding * scale,
                y: y + (padding + this.textFS * (this.lineHeightRate - 1) / 2 + this.textFS / 14) * scale,
                content,
                scale
            };
            this.$refs.imgCanvas && this.$refs.imgCanvas.textTranslate(obj);
        },
        startDrag () {
            this.textInfo.dragging = true;
        },
        dragging (e) {
            if (!this.textInfo.dragging) return;
            this.textInfo.x += e.movementX;
            this.textInfo.y += e.movementY;
        },
        endDrag () {
            this.textInfo.dragging = false;
        },
        selectDrawModel (drawModel) {
            // 因为放在v-for里渲染，引用是数组，
            this.$refs.drawTypePop[0].doClose();
            this.currentDrawType = drawModel.type;
            if (drawModel.type === "draw-arrow") ;
            localStorage.setItem(this.localDrawTypeKey, this.currentDrawType);
            this.changeModel("draw");
        },
        getUrl (index, secondIndex) {
            this.localSelectIndex = index;
            this.$emit("update:selectIndex", index);
            if (!this.singleDimension) {
                this.localSecondSelectIndex = secondIndex;
                this.$emit("update:secondSelectIndex", secondIndex);
            }
            this.$emit("getIndex", this.imgList[index], index);
            this.$emit("getCurrent", this.imgList[index].picUrl, index);
            this.$refs.imgCanvas && this.$refs.imgCanvas.checkImage(this.imgUrl);
        },
        toggleDrawRenderForType (renderType) {
            this.drawRender[renderType.type] = !this.drawRender[renderType.type];
        },
        toggleDrawSwitch () {
            let status = !this.globalDrawRenderStatus;
            Object.keys(this.drawRender).forEach((key)=>{
                this.drawRender[key] = status;
            });
        },
        changeModel (model) {
            this.currentOpModel = model;
            this.$emit("update:currentSelectModel", this.currentOpModel);
        },
        scaleChanged (scaleInfo) {
            scaleInfo.scale = Math.round(scaleInfo.scale * 100);
            this.scaleInfo = scaleInfo;
        },
        zoom (out) {
            if (!this.zoomable || this.isTextModel) return;
            this.$refs.imgCanvas && this.$refs.imgCanvas.zoom(out);
        },
        getInfo () {
            return this.$refs.imgCanvas.getInfo();
        },
        // 获取坐标信息
        getImgsInfo () {
            return this.imgList;
        },
        delete () {
            this.$emit("handleDeleteItem", this.localSelectIndex, this.selectImgObj, this.imgList);
        },
        // 清空画布
        clean () {
            this.$refs.imgCanvas.clean();
            this.drawInfoUpdated([]);
        },
        drawInfoUpdated (drawInfo) {
            // 与当前记录内容不一致时才进行记录
            if (JSON.stringify(this.operationHistoryPhotos[this.operationHistoryPhotosIndex]) != JSON.stringify(drawInfo)) {
                // 如果回退读取过记录再变更，清除当前记录点之后的记录
                if (this.operationHistoryPhotosIndex != this.operationHistoryPhotos.length) {
                    this.operationHistoryPhotos.splice(this.operationHistoryPhotosIndex + 1);
                }
                if (this.operationHistoryPhotos.length > this.maxHistoryPhotos) {
                    this.operationHistoryPhotos.shift();
                }
                this.operationHistoryPhotos.push([
                    ...drawInfo
                ]);
                this.operationHistoryPhotosIndex = this.operationHistoryPhotos.length - 1;
            }
            this.selectImgObj.drawInfo = [
                ...drawInfo
            ];
            this.$emit("drawInfoUpdated", this.imgList);
        },
        // 绘画图片和涂鸦
        reDraw () {
            this.$refs.imgCanvas.reDraw();
        },
        // 返回上一步
        backTo () {
            let drawInfo = this.getInfo();
            if (drawInfo.length === 0) return;
            drawInfo.pop();
            this.reDraw();
            this.drawInfoUpdated(drawInfo);
        },
        // 保存图片到本地
        downloadCanvasIamge () {
            try {
                let urlSplit = this.imgUrl.split("?")[0].split("/");
                const _channelName = this.currentChannelName ? this.currentChannelName : this.selectImgObj.channelName ? this.selectImgObj.channelName : "未知通道名";
                let name = `${this.storeName || `${this.applicationSceneName}未知名`}_${_channelName}_${urlSplit[urlSplit.length - 1]}`;
                let canvas = this.$refs.imgCanvas.getCanvas();
                // 使用toDataURL方法将图像转换被base64编码的URL字符串
                if (navigator.msSaveBlob) {
                    // IE10+
                    let blob = canvas.msToBlob();
                    return navigator.msSaveBlob(blob, name);
                } else {
                    let url = canvas.toDataURL("image/png");
                    let a = document.getElementById("srctoUrl");
                    // 创建一个单击事件
                    a.download = name || "下载图片名称";
                    a.href = url;
                    a.click();
                }
            } catch (err) {
                window.open(this.imgUrl);
            }
        },
        imgUpload () {},
        getArrayDimension (arr) {
            if (!Array.isArray(arr)) return 0;
            if (arr.length === 0) return 1;
            // 检查是否所有元素都不是数组（包括null/undefined）
            const isOneDimensional = arr.every((item)=>!Array.isArray(item));
            if (isOneDimensional) return 1;
            // 检查是否所有元素都是数组（不包括null/undefined）
            const isTwoDimensional = arr.every((item)=>item !== null && Array.isArray(item));
            if (isTwoDimensional) return 2;
            return 1;
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "pictureDetail",
        class: {
            'pictureDetail-shdow': _vm.containerShdow
        },
        style: {
            width: _vm.renderWidth + 'px',
            height: _vm.renderHeight + 'px'
        }
    }, [
        _vm.imgUrl ? _c('div', {
            staticClass: "media-container",
            on: {
                "mousemove": _vm.dragging,
                "mouseup": _vm.endDrag,
                "click": _vm.textDrawHandler
            }
        }, [
            _vm.selectImgObj.fileType ? _c('videoPlayer', {
                attrs: {
                    "width": _vm.renderWidth,
                    "height": _vm.renderHeight,
                    "src": _vm.imgUrl,
                    "controls": ""
                }
            }) : _c('hik-cloud-image-canvas', {
                ref: "imgCanvas",
                attrs: {
                    "opModel": _vm.canvasOpModel,
                    "zoomable": _vm.zoomable && !_vm.isTextModel,
                    "info": _vm.info,
                    "aiInfo": _vm.aiInfo,
                    "ruleInfo": _vm.ruleInfo,
                    "url": _vm.imgUrl,
                    "width": _vm.renderWidth,
                    "height": _vm.renderHeight,
                    "fontSize": _vm.textFS,
                    "lineWidth": _vm.lineWidth,
                    "drawColor": _vm.currentDrawColor.color,
                    "drawInfo": _vm.selectImgObj.drawInfo,
                    "isRenderDraw": _vm.drawRender.isRenderDraw,
                    "isRenderRule": _vm.drawRender.isRenderRule,
                    "isRenderAIDraw": _vm.drawRender.isRenderAIDraw,
                    "showLabel": true
                },
                on: {
                    "drawInfoUpdated": _vm.drawInfoUpdated,
                    "drawStatusChanged": _vm.drawStatusChanged,
                    "scaleChanged": _vm.scaleChanged
                }
            }),
            _c('div', {
                ref: "textCon",
                staticClass: "text-con",
                style: {
                    'box-shadow': "0 0 0 " + 1 / _vm.textInfo.scale + "px white inset",
                    transform: "translate(" + _vm.textConVisualX + "px, " + _vm.textConVisualY + "px) scale(" + _vm.textInfo.scale + ")",
                    'transform-origin': _vm.textInfo.zooming ? 'center' : 'top left',
                    padding: _vm.textInfo.padding + "px",
                    display: _vm.textInfo.display ? '' : 'none'
                },
                on: {
                    "mousedown": function($event) {
                        if ($event.target !== $event.currentTarget) {
                            return null;
                        }
                        return _vm.startDrag.apply(null, arguments);
                    },
                    "click": function($event) {
                        $event.stopPropagation();
                    }
                }
            }, [
                _c('textarea', {
                    directives: [
                        {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.textInfo.content,
                            expression: "textInfo.content"
                        }
                    ],
                    ref: "text",
                    staticClass: "textarea",
                    style: {
                        color: _vm.currentDrawColor.color,
                        'font-size': _vm.textFS + "px",
                        'line-height': _vm.lineHeightRate,
                        width: _vm.textInfo.size.width + "px"
                    },
                    attrs: {
                        "maxlength": "256",
                        "rows": _vm.textInfo.size.rows
                    },
                    domProps: {
                        "value": _vm.textInfo.content
                    },
                    on: {
                        "input": [
                            function($event) {
                                if ($event.target.composing) {
                                    return;
                                }
                                _vm.$set(_vm.textInfo, "content", $event.target.value);
                            },
                            _vm.inputUpdate
                        ]
                    }
                }),
                _vm._l([
                    'tl',
                    'tr',
                    'bl',
                    'br'
                ], function(dt) {
                    return _c('div', {
                        key: dt,
                        class: [
                            dt,
                            'anchor'
                        ],
                        style: {
                            transform: "scale(" + 1 / _vm.textInfo.scale + ")"
                        },
                        on: {
                            "pointerdown": _vm.startZoom,
                            "pointerup": _vm.stopZoom
                        }
                    });
                })
            ], 2),
            !_vm.drawing ? [
                _c('div', {
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.singleDimension ? _vm.localSelectIndex > 0 : _vm.localSelectIndex > 0 || _vm.localSelectIndex === 0 && _vm.localSecondSelectIndex > 0,
                            expression: "\n          singleDimension\n            ? localSelectIndex > 0\n            : localSelectIndex > 0 || (localSelectIndex === 0 && localSecondSelectIndex > 0)\n        "
                        }
                    ],
                    staticClass: "switchBtn left",
                    on: {
                        "click": function($event) {
                            return _vm.picSelectOffset(-1);
                        }
                    }
                }, [
                    _c('i', {
                        staticClass: "h-icon-angle_left"
                    })
                ]),
                _c('div', {
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.singleDimension ? _vm.localSelectIndex < _vm.imgList.length - 1 : _vm.localSelectIndex < _vm.imgList.length - 1 || _vm.localSelectIndex === _vm.imgList.length - 1 && _vm.localSecondSelectIndex < _vm.imgList[_vm.localSelectIndex].length - 1,
                            expression: "\n          singleDimension\n            ? localSelectIndex < imgList.length - 1\n            : localSelectIndex < imgList.length - 1 ||\n              (localSelectIndex === imgList.length - 1 &&\n                localSecondSelectIndex < imgList[localSelectIndex].length - 1)\n        "
                        }
                    ],
                    staticClass: "switchBtn right",
                    on: {
                        "click": function($event) {
                            return _vm.picSelectOffset(1);
                        }
                    }
                }, [
                    _c('i', {
                        staticClass: "h-icon-angle_right"
                    })
                ])
            ] : _vm._e()
        ], 2) : _c('hik-cloud-empty', {
            attrs: {
                "size": "large",
                "imgSrc": _vm.emptyImg,
                "title": _vm.emptyText
            }
        }),
        _c('a', {
            staticStyle: {
                "display": "none"
            },
            attrs: {
                "id": "srctoUrl"
            }
        }),
        _c('div', {
            staticClass: "bottomPart"
        }, [
            _c('div', {
                ref: "opearBar",
                staticClass: "control flex-center"
            }, [
                !_vm.selectImgObj.fileType && _vm.opModelAvailable ? _c('div', [
                    _vm.zoomable ? _c('span', {
                        staticClass: "opear-item"
                    }, [
                        _c('i', {
                            staticClass: "h-icon-zoom_out opear-item-icon vmd",
                            class: {
                                disabled: _vm.scaleInfo.scaleStatus < 0 || _vm.isTextModel
                            },
                            on: {
                                "click": function($event) {
                                    return _vm.zoom(true);
                                }
                            }
                        }),
                        _c('span', {
                            staticClass: "content"
                        }, [
                            _vm._v(_vm._s(_vm.scaleInfo.scale) + "%")
                        ]),
                        _c('i', {
                            staticClass: "h-icon-zoom_in opear-item-icon vmd",
                            class: {
                                disabled: _vm.scaleInfo.scaleStatus > 0 || _vm.isTextModel
                            },
                            on: {
                                "click": function($event) {
                                    return _vm.zoom(false);
                                }
                            }
                        })
                    ]) : _vm._e(),
                    _vm._l(_vm.displayOpModelBlocks.defaultBlock, function(opModel) {
                        return _c('span', {
                            key: "opModel_" + opModel.type,
                            staticClass: "opear-item",
                            class: {
                                active: _vm.currentOpModel === opModel.type,
                                func: opModel.type != 'color'
                            },
                            on: {
                                "click": function($event) {
                                    return opModel.callback(opModel.type);
                                }
                            }
                        }, [
                            opModel.type == 'draw' ? [
                                _c('el-popover', {
                                    ref: "drawTypePop",
                                    refInFor: true,
                                    attrs: {
                                        "popper-class": "hik-cloud-canvas-option-pop",
                                        "placement": "top",
                                        "width": "90",
                                        "trigger": "hover",
                                        "appendToBody": false,
                                        "visible-arrow": false
                                    },
                                    on: {
                                        "show": function($event) {
                                            _vm.popShow = true;
                                        },
                                        "hide": function($event) {
                                            _vm.popShow = false;
                                        }
                                    }
                                }, [
                                    _vm._l(_vm.drawModels, function(drawModel) {
                                        return _c('div', {
                                            key: drawModel.type,
                                            staticClass: "pop-option",
                                            on: {
                                                "click": function($event) {
                                                    return _vm.selectDrawModel(drawModel);
                                                }
                                            }
                                        }, [
                                            _c('i', {
                                                staticClass: "vmd opear-item-icon",
                                                class: drawModel.icon,
                                                staticStyle: {
                                                    "font-size": "24px"
                                                }
                                            }),
                                            _c('span', {
                                                staticClass: "content vmd"
                                            }, [
                                                _vm._v(_vm._s(drawModel.title))
                                            ])
                                        ]);
                                    }),
                                    _c('span', {
                                        attrs: {
                                            "slot": "reference"
                                        },
                                        slot: "reference"
                                    }, [
                                        _c('i', {
                                            staticClass: "vmd opear-item-icon opear-item-icon_active",
                                            class: opModel.icon,
                                            staticStyle: {
                                                "font-size": "24px"
                                            }
                                        }),
                                        _c('span', {
                                            staticClass: "content vmd"
                                        }, [
                                            _vm._v(_vm._s(opModel.title))
                                        ]),
                                        _c('i', {
                                            staticClass: "h-icon-angle_down vmd pop_angle",
                                            class: {
                                                rotate: _vm.popShow
                                            },
                                            attrs: {
                                                "slot": "reference"
                                            },
                                            slot: "reference"
                                        })
                                    ])
                                ], 2)
                            ] : opModel.type == 'color' ? [
                                _c('el-popover', {
                                    ref: "drawColorPop",
                                    refInFor: true,
                                    attrs: {
                                        "placement": "top",
                                        "trigger": "hover",
                                        "popper-class": "hik-cloud-canvas-option-pop",
                                        "offsetPlacement": -5,
                                        "appendToBody": false,
                                        "visible-arrow": false
                                    },
                                    on: {
                                        "show": function($event) {
                                            _vm.colorPopShow = true;
                                        },
                                        "hide": function($event) {
                                            _vm.colorPopShow = false;
                                        }
                                    }
                                }, [
                                    _c('div', {
                                        staticClass: "color_wrap"
                                    }, _vm._l(_vm.drawColors, function(drawColor) {
                                        return _c('i', {
                                            key: drawColor.color,
                                            staticClass: "vmd color_icon",
                                            class: {
                                                select: _vm.currentDrawColor.color == drawColor.color
                                            },
                                            style: _vm.colorIconStyle(drawColor),
                                            on: {
                                                "click": function($event) {
                                                    return _vm.selectDrawColor(drawColor);
                                                }
                                            }
                                        });
                                    }), 0),
                                    _c('span', {
                                        attrs: {
                                            "slot": "reference"
                                        },
                                        slot: "reference"
                                    }, [
                                        _c('span', {
                                            staticClass: "vmd color_icon select",
                                            style: {
                                                'border-color': _vm.currentDrawColor.displayColor || _vm.currentDrawColor.color
                                            }
                                        }),
                                        _c('span', {
                                            staticClass: "content vmd"
                                        }, [
                                            _vm._v(_vm._s(opModel.title))
                                        ]),
                                        _c('i', {
                                            staticClass: "h-icon-angle_down vmd pop_angle",
                                            class: {
                                                rotate: _vm.colorPopShow
                                            }
                                        })
                                    ])
                                ])
                            ] : opModel.type == 'drawSwitch' ? [
                                _c('el-popover', {
                                    ref: "drawTypePop",
                                    refInFor: true,
                                    attrs: {
                                        "popper-class": "option-pop hik-cloud-canvas-option-pop",
                                        "placement": "top",
                                        "width": "116",
                                        "trigger": "hover",
                                        "offsetPlacement": -5,
                                        "appendToBody": false,
                                        "visible-arrow": false
                                    },
                                    on: {
                                        "show": function($event) {
                                            _vm.drawRenderPopShow = true;
                                        },
                                        "hide": function($event) {
                                            _vm.drawRenderPopShow = false;
                                        }
                                    }
                                }, [
                                    _vm._l(_vm.drawRenderTypes, function(drawRenderType) {
                                        return _c('div', {
                                            key: drawRenderType.type,
                                            staticClass: "pop-option",
                                            on: {
                                                "click": function($event) {
                                                    return _vm.toggleDrawRenderForType(drawRenderType);
                                                }
                                            }
                                        }, [
                                            _c('i', {
                                                staticClass: "vmd opear-item-icon",
                                                class: drawRenderType.icon,
                                                staticStyle: {
                                                    "font-size": "24px"
                                                }
                                            }),
                                            _c('span', {
                                                staticClass: "content vmd"
                                            }, [
                                                _vm._v(_vm._s(drawRenderType.title))
                                            ])
                                        ]);
                                    }),
                                    _c('span', {
                                        attrs: {
                                            "slot": "reference"
                                        },
                                        slot: "reference"
                                    }, [
                                        _c('i', {
                                            staticClass: "vmd opear-item-icon",
                                            class: opModel.icon,
                                            staticStyle: {
                                                "font-size": "24px"
                                            }
                                        }),
                                        _c('span', {
                                            staticClass: "content vmd"
                                        }, [
                                            _vm._v(_vm._s(opModel.title))
                                        ]),
                                        _c('i', {
                                            staticClass: "h-icon-angle_down vmd pop_angle",
                                            class: {
                                                rotate: _vm.drawRenderPopShow
                                            },
                                            attrs: {
                                                "slot": "reference"
                                            },
                                            slot: "reference"
                                        })
                                    ])
                                ], 2)
                            ] : [
                                _c('i', {
                                    staticClass: "vmd opear-item-icon",
                                    class: opModel.icon,
                                    staticStyle: {
                                        "font-size": "24px"
                                    }
                                }),
                                _c('span', {
                                    staticClass: "content vmd"
                                }, [
                                    _vm._v(_vm._s(opModel.title))
                                ])
                            ]
                        ], 2);
                    }),
                    _c('span', {
                        staticClass: "split"
                    }),
                    _vm._l(_vm.displayOpModelBlocks.simpleBlock, function(opModel) {
                        var _obj;
                        return _c('span', {
                            key: "opModel_" + opModel.type,
                            staticClass: "opear-item func",
                            class: {
                                active: _vm.currentOpModel === opModel.type
                            },
                            attrs: {
                                "title": opModel.title
                            },
                            on: {
                                "click": function($event) {
                                    return opModel.callback(opModel.type);
                                }
                            }
                        }, [
                            _c('i', {
                                staticClass: "vmd opear-item-icon",
                                class: (_obj = {}, _obj[opModel.icon] = true, _obj.disabled = opModel.disabled, _obj),
                                staticStyle: {
                                    "font-size": "24px"
                                }
                            })
                        ]);
                    })
                ], 2) : _vm._e()
            ]),
            _c('div', {
                ref: "imgListBar",
                staticClass: "photo-scroller"
            }, [
                _c('hik-cloud-image-canvas-list', _vm._g(_vm._b({
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.showImgListBar && _vm.hasPic,
                            expression: "showImgListBar && hasPic"
                        }
                    ],
                    ref: "imgList",
                    attrs: {
                        "imgList": _vm.imgList,
                        "selectIndex": _vm.localSelectIndex,
                        "secondSelectIndex": _vm.localSecondSelectIndex,
                        "deletable": _vm.deletable
                    },
                    on: {
                        "update:selectIndex": function($event) {
                            _vm.localSelectIndex = $event;
                        },
                        "update:select-index": function($event) {
                            _vm.localSelectIndex = $event;
                        },
                        "update:secondSelectIndex": function($event) {
                            _vm.localSecondSelectIndex = $event;
                        },
                        "update:second-select-index": function($event) {
                            _vm.localSecondSelectIndex = $event;
                        },
                        "getUrl": _vm.getUrl
                    }
                }, 'hik-cloud-image-canvas-list', _vm.$attrs, false), _vm.$listeners))
            ], 1)
        ])
    ], 1);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

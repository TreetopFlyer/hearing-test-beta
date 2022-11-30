//@ts-check
import * as TW   from "https://esm.sh/@twind/core@1.0.1";
import TWPreTail from "https://esm.sh/@twind/preset-tailwind@1.0.1";
import TWPreAuto from "https://esm.sh/@twind/preset-autoprefix@1.0.1";

/** @type {TW.TwindConfig} */
const Configure = {
    theme:
    {
        extend:
        {
            keyframes:
            {
                flash:
                {
                      '0%': { opacity: 1.0 },
                     '50%': { opacity: 0.3 },
                    '100%': { opacity: 0.0 }
                },
                pulse:
                {
                      "0%": { opacity: 0.0 },
                     "10%": { opacity: 0.0 },
                     "12%": { opacity: 1.0 },
                     "22%": { opacity: 1.0 },
                     "42%": { opacity: 0.2 },
                    "100%": { opacity: 0.0 }
                }
            },
            animation:
            {
                flash: "flash 1s both"
            },
            strokeWidth:
            {
                "bold": "3px"
            }
        }
    },
    rules:
    [
        [
            "stroke-draw",
            {
                "vector-effect": "non-scaling-stroke",
                "stroke-linecap": "square",
                "fill": "none"
            },
        ],
        [
            'shadow-glow-(.*)',
            (match, context)=>
            {
                return { "box-shadow": `0px 0px 5px 2px ${context.theme().colors[match[1]]}` };
            }
        ],
        [
            'shadow-sss',
            {
                "box-shadow": "rgb(0 0 0 / 50%) 0px -3px 2px inset, rgb(255 255 255 / 50%) 0px 10px 10px inset"
            }
        ]
    ],
    presets: [TWPreTail(), TWPreAuto()]
};
const ShadowDOM = document.querySelector("#app").attachShadow({mode: "open"});
const ShadowDiv = document.createElement("div");
const ShadowCSS = document.createElement("style");
ShadowDOM.append(ShadowCSS);
ShadowDOM.append(ShadowDiv);
TW.observe(TW.twind(Configure, TW.cssom(ShadowCSS)), ShadowDiv);

import * as UI from "./ui.js";
import {render}  from "https://esm.sh/preact@10.11.3/compat";
import {html}    from "https://esm.sh/htm@3.1.1/preact";
render(html`
    <${UI.Button} icon="+">hey!<//>
    <${UI.Button} light>Left<//>
    <${UI.Button} inactive>Right<//>
    <${UI.Button} disabled>Right<//>
    <${UI.Chart}>
        <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw)">
            <${UI.Mark} right=${true}  x=${"20%"} y="20%" />
            <${UI.Mark} right=${false} x=${"10%"} y="20%" response=${true} />
            <${UI.Mark} right=${false}/>
        </svg>
    <//>
`, ShadowDiv);
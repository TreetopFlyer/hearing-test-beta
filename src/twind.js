import * as TW   from "@twind/core@1.0.1";
import TWPreTail from "@twind/preset-tailwind@1.0.1";
import TWPreAuto from "@twind/preset-autoprefix@1.0.1";

/** @type {TW.TwindConfig} */
export const Configure = {
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
                "bold": "4px"
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

/** @type {(elStyle:HTMLStyleElement, elDiv:HTMLDivElement)=>void} */
export const Init =(elStyle, elDiv)=>
{
    TW.observe(TW.twind(Configure, TW.cssom(elStyle)), elDiv);
};
import * as TW   from "@twind/core@1.0.1";
import TWPreTail from "@twind/preset-tailwind@1.0.1";
import TWPreAuto from "@twind/preset-autoprefix@1.0.1";

/** @type {TW.TwindUserConfig} */
export const Configure = {
    theme:
    {
        extend:
        {
            // @ts-ignore: typings for keyframes are missing in twind
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
                flash: "flash 1s both",
                pulse: "pulse 3s ease-in-out 0s 1 both"
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
            "bg-metal",
            {
                "background": "linear-gradient(159deg, rgb(228, 228, 228) 0%, rgb(243, 243, 243) 25%, rgb(236, 236, 236) 100%)"
            },
        ],
        [
            "bg-earmark", "bg-gradient-to-b from-[#107c79] to-[#115e67]"
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
                "box-shadow": "rgb(0 0 0 / 30%) 0px -2px 3px inset, rgb(255 255 255 / 10%) 0px 10px 10px inset"
            }
        ],
        [
            'text-shadow-lcd', {"text-shadow": "0px 1px 1px #00000055"}
        ],
        [
            'text-shadow-emboss', {"text-shadow": "0px -1px 1px #00000033, 0px 1px 2px #ffffff"}
        ],
        [ 'box-notch', "border-t(1 [#ffffff]) border-r(1 [#ffffff]) border-b(1 [#00000033]) border-l(1 [#00000033]) flex items-center justify-end gap-1 p-2" ],
        [ "box-buttons", "flex gap-1 items-center p-2 rounded-lg bg-gradient-to-b from-[#00000022] border-b(1 [#ffffff]) border-t(1 [#00000033])"]
    ],
    presets: [TWPreTail(), TWPreAuto()]
};

/** @type {(elStyle:HTMLStyleElement, elDiv:HTMLDivElement)=>void} */
export const Init =(elStyle, elDiv)=>
{
    TW.observe(TW.twind(Configure, TW.cssom(elStyle)), elDiv);
};
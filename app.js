//@ts-check
import React from "https://esm.sh/preact@10.11.3/compat";
import {html} from "https://esm.sh/htm@3.1.1/preact";

import TW from "https://esm.sh/@twind/core";
import TWpreTailwind from "https://esm.sh/@twind/preset-tailwind@1.0.1";
import preAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1.0.1";

const root = document.querySelector("#app");
const rootShadow = root.attachShadow({mode: "open"});
const rootShadowRoot = document.createElement("strong");
rootShadow.append(rootShadowRoot);
*/

install({presets:[preTailwind(), preAutoprefix()]});


React.render(html`
    <p class="p-4">suuupu</p>
    <${UI.Button} label="Play Tone" icon=">" light/>
`, root);
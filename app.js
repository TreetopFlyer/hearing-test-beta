//@ts-check
import * as TW   from "https://esm.sh/@twind/core@1.0.1";
import TWPreTail from "https://esm.sh/@twind/preset-tailwind@1.0.1";
import TWPreAuto from "https://esm.sh/@twind/preset-autoprefix@1.0.1";

const Configure = {presets: [TWPreTail(), TWPreAuto()]};
const ShadowDOM = document.querySelector("#app").attachShadow({mode: "open"});
const ShadowDiv = document.createElement("div");
const ShadowCSS = document.createElement("style");
ShadowDOM.append(ShadowCSS);
ShadowDOM.append(ShadowDiv);
TW.observe(TW.twind(Configure, TW.cssom(ShadowCSS)), ShadowDiv);

import UI from "./ui.js";
import {render}  from "https://esm.sh/preact@10.11.3/compat";
import {html}    from "https://esm.sh/htm@3.1.1/preact";
render(html`
    <${UI.Button} icon="+">hey!<//>
    <${UI.Chart}><p>SUP</p><//>
`, ShadowDiv);
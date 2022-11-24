//@ts-check
import React from "https://esm.sh/preact@10.11.3/compat";
import {html} from "https://esm.sh/htm@3.1.1/preact";

import {install} from "https://esm.sh/@twind/core";
import preTailwind from "https://esm.sh/@twind/preset-tailwind@1.0.1";
import preAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1.0.1";
install({presets:[preTailwind(), preAutoprefix()]});

import * as Store from "./store.js";
import UI from "./ui.js";

React.render(html`
    <p class="p-4">suuupu</p>
    <${UI.Button} label="Play Tone" icon=">" light/>
`, document.querySelector("#app"));
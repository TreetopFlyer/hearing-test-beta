import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Initial, Reducer, ColumnMapping } from "./store.js";

const States = {
    list:[],
    get latest()
    {
        return this.list[this.list.length-1];
    },
    set latest(input)
    {
        this.list.push(input);
    }
};

States.latest = Initial;

Deno.test("Initial State", async (t)=>
{
    const state = Initial;

    await t.step("Selections are empty", ()=>
    {
        assertEquals(state.Selection.Test, undefined);
        assertEquals(state.Selection.Freq, undefined);
        assertEquals(state.Selection.Mark, undefined);
    });

    await t.step("Frequency index maps to 1k hz", ()=>
    {
        assertEquals(state.Freq, 3);
        assertEquals(ColumnMapping[state.Freq][0], 1000);
    });

    await t.step("The first test has its 2nd plot at 1k hz, and no user marks", ()=>
    {
        const plot = state.Tests[0].Plot[1];
        assertEquals(plot.Hz, 1000);
        assertEquals(plot.UserL, undefined);
        assertEquals(plot.UserR, undefined);
    });
})

Deno.test("Select Test", async (t)=>
{
    let state;
    await t.step("dispatch action", ()=>
    {
        state = Reducer(Initial, {Name:"Test", Data:0});
    });
    
    await t.step("check selections: test and freq, but no mark", ()=>
    {
        assertEquals(state.Selection.Test, state.Tests[0]);
        assertEquals(state.Selection.Freq, state.Tests[0].Plot[1]);
        assertEquals(state.Selection.Mark, undefined);
    });


    
})

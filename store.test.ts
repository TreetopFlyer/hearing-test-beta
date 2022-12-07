import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Reducer, ColumnMapping, Initial } from "./src/store.js";

let state = {...Initial};

Deno.test("Initialize", async(t)=>
{

    await t.step("Tone Parameters Initialized", ()=>
    {
        assertEquals(state.Chan.Value, 0);
        assertEquals(state.Freq.Value, 2);
        assertEquals(state.Stim.Value, 30);
    });

    await t.step("A test exists with 500 and 1k hz plots", ()=>
    {
        assertEquals(state.Tests.length > 0, true);
        const test = state.Tests[0];
        assertEquals(test.Plot.length > 1, true);
        assertEquals(test.Plot[0].Hz, 500);
        assertEquals(test.Plot[1].Hz, 1000);
    });

    await t.step("Dispatch Test, Freq, Stim, and Chan updates", ()=>
    {
        state = Reducer(state, {Name:"Test", Data:0});

        state = Reducer(state, {Name:"Chan", Data:1});
        state = Reducer(state, {Name:"Freq", Data:1});
        state = Reducer(state, {Name:"Stim", Data:1});
    });

    await t.step("Freq, Stim, and Chan have the correct values", ()=>
    {
        assertEquals(state.Chan.Value, 1);
        assertEquals(state.Freq.Value, 3);
        assertEquals(state.Stim.Value, 35);
    });

    await t.step("Live context values are correct", ()=>
    {
        assertEquals(state.Live.Test, state.Tests[0]);
        assertEquals(state.Live.Freq?.Hz, ColumnMapping[state.Freq.Value][0]);
        assertEquals(state.Live.Mark, undefined, "(User) Mark is undefined");
    });
});

Deno.test("Make Marks", async(t)=>
{
    let state = {...Initial};
    
    await t.step("Tone Parameters Initialized", ()=>
    {
        assertEquals(state.Chan.Value, 0);
        assertEquals(state.Freq.Value, 2);
        assertEquals(state.Stim.Value, 30);
    });

    await t.step("Dispatch Mark create", ()=>
    {
        state = Reducer(state, {Name:"Mark", Data:true});
    });

    await t.step("Check marked value", ()=>
    {
        assertEquals(state.Live.Freq?.UserL !== undefined, true, `there will be a user mark for the left channel`);
        assertEquals(state.Live.Freq?.UserR === undefined, true, `but not the right`);
        assertEquals(state.Live.Mark?.Stim, state.Stim.Value);
        assertEquals(state.Live.Mark?.Resp, true);
    });

    await t.step("Dispatch Freq, Stim, and Chan updates", ()=>
    {
        state = Reducer(state, {Name:"Test", Data:0});
        state = Reducer(state, {Name:"Freq", Data:1});
        state = Reducer(state, {Name:"Stim", Data:1});
        state = Reducer(state, {Name:"Chan", Data:1});
    });

    await t.step("Dispatch Mark create", ()=>
    {
        state = Reducer(state, {Name:"Mark", Data:false}); 
    });

    await t.step("Check marked value", ()=>
    {
        assertEquals(state.Live.Freq?.UserR !== undefined, true, `there will be a user mark for the right channel`);
        assertEquals(state.Live.Freq?.UserL !== undefined, true, `and the left`);
        assertEquals(state.Live.Mark?.Stim, state.Stim.Value);
        assertEquals(state.Live.Mark?.Resp, false);
    });

    await t.step("Live context values are correct", ()=>
    {
        assertEquals(state.Live.Test, state.Tests[0]);
        assertEquals(state.Live.Freq?.Hz, ColumnMapping[state.Freq.Value][0]);
        assertEquals(state.Live.Mark?.Stim, state.Stim.Value);
    });

    await t.step("Check Draw output", ()=>
    {
        assertEquals(state.Draw.TestL.Points.length, 2);
        assertEquals(state.Draw.TestL.Paths.length, 1);
    });

    console.log(state.Draw);
});
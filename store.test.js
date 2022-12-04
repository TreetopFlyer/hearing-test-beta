import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Reducer, ColumnMapping, Congtiguous, Initial } from "./src/store.js";

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
        assertEquals(state.Live.Freq.Hz, ColumnMapping[state.Freq.Value][0]);
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
        assertEquals(state.Live.Freq.UserL !== undefined, true, `there will be a user mark for the left channel`);
        assertEquals(state.Live.Freq.UserR === undefined, true, `but not the right`);
        assertEquals(state.Live.Mark.Stim, state.Stim.Value);
        assertEquals(state.Live.Mark.Resp, true);
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
        assertEquals(state.Live.Freq.UserR !== undefined, true, `there will be a user mark for the right channel`);
        assertEquals(state.Live.Freq.UserL !== undefined, true, `and the left`);
        assertEquals(state.Live.Mark.Stim, state.Stim.Value);
        assertEquals(state.Live.Mark.Resp, false);
    });

    await t.step("Live context values are correct", ()=>
    {
        assertEquals(state.Live.Test, state.Tests[0]);
        assertEquals(state.Live.Freq.Hz, ColumnMapping[state.Freq.Value][0]);
        assertEquals(state.Live.Mark.Stim, state.Stim.Value);
    });

    console.log(state.Draw);
});

Deno.test("Contiguous Lines", ()=>
{
    /** @type {Store.Test} */
    const model = {
        Name:"",
        Plot:[
            {Hz: 500,  TestL: {Stim:30, Resp:true}, TestR: {Stim:35, Resp:true}, UserL:{Stim:20, Resp:true}},
            {Hz: 1000, TestL: {Stim:40, Resp:true}, TestR: {Stim:45, Resp:true}, UserL:{Stim:30, Resp:true}},
            {Hz: 2000, TestL: {Stim:40, Resp:true}, TestR: {Stim:45, Resp:true}, UserL:{Stim:30, Resp:false}},
            {Hz: 3000, TestL: {Stim:30, Resp:true}, TestR: {Stim:35, Resp:true}, UserL:{Stim:20, Resp:true}},
            {Hz: 4000, TestL: {Stim:40, Resp:true}, TestR: {Stim:45, Resp:true}, UserL:{Stim:30, Resp:true}},
            {Hz: 4000, TestL: {Stim:50, Resp:true}, TestR: {Stim:55, Resp:true}, UserL:{Stim:40, Resp:true}}
        ]
    }

    const {Points, Paths} = Congtiguous(model, 0, Initial.Stim, true);
    assertEquals(Points.length, 6);
    assertEquals(Paths.length, 2);
    assertEquals(Paths[0].length, 2);
    assertEquals(Paths[1].length, 3);
});
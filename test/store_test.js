import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Reducer, ColumnMapping, Congtiguous } from "../src/store.js";

let state = {
    Chan: 0,
    Freq: 1,
    Stim: 20,
    Live:
    {
        Test: undefined,
        Freq: undefined,
        Mark: undefined
    },
    Draw:
    {
        UserL:{Points:[], Paths:[]},
        UserR:{Points:[], Paths:[]},
        TestL:{Points:[], Paths:[]},
        TestR:{Points:[], Paths:[]}
    },
    Tests: [
        {
            Name: "Patient A  Asymmetric Notch",
            Plot:
            [
                { Hz: 500,  TestL: { Stim: 30, Resp: true }, TestR: { Stim: 50, Resp: true } },
                { Hz: 1000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } }
            ]
        }
    ]
};


Deno.test("Initialize", async(t)=>
{
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
        state = Reducer(state, {Name:"Freq", Data:1});
        state = Reducer(state, {Name:"Stim", Data:5});
        state = Reducer(state, {Name:"Chan", Data:1});
    });

    await t.step("Freq, Stim, and Chan have the correct values", ()=>
    {
        assertEquals(state.Stim, 25);
        assertEquals(state.Freq, 2);
        assertEquals(state.Chan, 1);
    });

    await t.step("Live context values are correct", ()=>
    {
        assertEquals(state.Live.Test, state.Tests[0]);
        assertEquals(state.Live.Freq.Hz, ColumnMapping[state.Freq][0]);
        assertEquals(state.Live.Mark, undefined, "(User) Mark is undefined");
    });
});

Deno.test("Make Marks", async(t)=>
{
    await t.step("Dispatch Mark create", ()=>
    {
        state = Reducer(state, {Name:"Mark", Data:true});
    });

    await t.step("Check marked value", ()=>
    {
        assertEquals(state.Live.Freq.UserR !== undefined, true, `there will be a user mark for the right channel`);
        assertEquals(state.Live.Freq.UserL === undefined, true, `the left channel user mark will be undefined`);
        assertEquals(state.Live.Mark.Stim, state.Stim);
        assertEquals(state.Live.Mark.Resp, true);
    });

    await t.step("Dispatch Mark delete", ()=>
    {
        state = Reducer(state, {Name:"Mark", Data:null});
    });

    await t.step("Check marked value", ()=>
    {
        assertEquals(state.Live.Freq.UserR === undefined, true);
        assertEquals(state.Live.Freq.UserL === undefined, true);
        assertEquals(state.Live.Mark, undefined);
    });

    await t.step("Dispatch Freq, Stim, and Chan updates", ()=>
    {
        state = Reducer(state, {Name:"Freq", Data:1});
        state = Reducer(state, {Name:"Stim", Data:5});
        state = Reducer(state, {Name:"Chan", Data:0});
    });

    await t.step("Live context values are correct", ()=>
    {
        assertEquals(state.Live.Test, state.Tests[0]);
        assertEquals(state.Live.Freq.Hz, ColumnMapping[state.Freq][0]);
        assertEquals(state.Live.Mark, undefined);
    });

    await t.step("Dispatch Mark create", ()=>
    {
        state = Reducer(state, {Name:"Mark", Data:false}); 
    });

    await t.step("Check marked value", ()=>
    {
        assertEquals(state.Live.Freq.UserR !== undefined, true, `there will be a user mark for the right channel`);
        assertEquals(state.Live.Freq.UserL === undefined, true, `the left channel user mark will be undefined`);
        assertEquals(state.Live.Mark.Stim, state.Stim);
        assertEquals(state.Live.Mark.Resp, false);
    });
});

Deno.test("Contiguous Lines", ()=>
{
    /** @type {import("../src/store.js").Test} */
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

    const {Points, Paths} = Congtiguous(model, 0, true);
    assertEquals(Points.length, 6);
    assertEquals(Paths.length, 2);
    assertEquals(Paths[0].length, 2);
    assertEquals(Paths[1].length, 3);
});
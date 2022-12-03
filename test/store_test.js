import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Reducer, ColumnMapping, Congtiguous } from "../src/store.js";

Deno.test("Store", async(t)=>
{
    let state = {
        Chan: 0,
        Freq: 3,
        Stim: 30,
        Live:
        {
            Test: undefined,
            Freq: undefined,
            Mark: undefined
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

    await t.step("Initialize", async(t)=>
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
            state = Reducer(state, {Name:"Freq", Data:2});
            state = Reducer(state, {Name:"Stim", Data:25});
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

    await t.step("Make Marks", async(t)=>
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
            state = Reducer(state, {Name:"Freq", Data:3});
            state = Reducer(state, {Name:"Stim", Data:65});
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
            assertEquals(state.Live.Freq.UserR === undefined, true, `there will be a user mark for the right channel`);
            assertEquals(state.Live.Freq.UserL !== undefined, true, `the left channel user mark will be undefined`);
            assertEquals(state.Live.Mark.Stim, state.Stim);
            assertEquals(state.Live.Mark.Resp, false);
        });
    })

    await t.step("Contiguous Lines", ()=>
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

        const pieces = Congtiguous(model, 0, true);
        assertEquals(pieces.length, 2);
        assertEquals(pieces[0].length, 2);
        assertEquals(pieces[1].length, 3);
    });

});
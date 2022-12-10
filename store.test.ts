import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Reducer, ColumnMapping, Initial } from "./src/store.js";

let state:Store.State = {
    Chan: { Min:0,   Max:1,   Value:0,  Step:1 },
    Freq: { Min:2,   Max:8,   Value:2,  Step:1 },
    Stim: { Min:-10, Max:120, Value:30, Step:5 },
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
    Test: [
        {
            Name: "Patient A  Asymmetric Notch",
            Plot:
            [
                { Hz: 500,  TestL: { Stim: 30, Resp: true }, TestR: { Stim: 50, Resp: true }, UserL: { Stim: 55, Resp: true }, UserR: { Stim: 50, Resp: true } },
                { Hz: 1000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true }, UserL: { Stim: 50, Resp: true }, UserR: { Stim: 30, Resp: true } }
            ]
        }
    ]
};

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
        assertEquals(state.Test.length > 0, true);
        const test = state.Test[0];
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
        assertEquals(state.Live.Test, state.Test[0]);
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
        assertEquals(state.Live.Test, state.Test[0]);
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
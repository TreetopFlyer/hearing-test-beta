import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { Initial, Reducer, ColumnMapping } from "./store.js";

const States = {
    list:[Initial],
    get latest()
    {
        return this.list[this.list.length-1];
    },
    set latest(input)
    {
        this.list.push(input);
    }
};

Deno.test("Initial State", async (t)=>
{
    await t.step("Selections are empty", ()=>
    {
        assertEquals(States.latest.Live.Test, undefined);
        assertEquals(States.latest.Live.Freq, undefined);
        assertEquals(States.latest.Live.Mark, undefined);
    });

    await t.step("Frequency index maps to 1k hz", ()=>
    {
        assertEquals(States.latest.Freq, 3);
        assertEquals(ColumnMapping[States.latest.Freq][0], 1000);
    });

    await t.step("The first test has its 2nd plot at 1k hz", ()=>
    {
        const plot = States.latest.Tests[0].Plot[1];
        assertEquals(plot.Hz, 1000);
    });
})

Deno.test("Select First Test", async (t)=>
{
    await t.step("dispatch action", ()=>
    {
        States.latest = Reducer(States.latest, {Name:"Test", Data:0});
    });
    
    await t.step("check selections: test and freq, but no mark", ()=>
    {
        const s = States.latest;
        assertEquals(s.Live.Test, s.Tests[0]);
        assertEquals(s.Live.Freq, s.Tests[0].Plot[1]);
        assertEquals(s.Live.Mark, undefined);
    });
});

Deno.test("Make Marks", async (t)=>
{
    let s;
    await t.step("Left channel selected", ()=>
    {
        assertEquals(States.latest.Chan, 0);
    });
    await t.step("Dispatch Mark action", ()=>
    {
        States.latest = Reducer(States.latest, {Name:"Mark", Data:true});
    });
    s = States.latest;

    await t.step("Check selections: test, freq, and mark", ()=>
    {
        assertEquals(s.Live.Test, s.Tests[0]);
        assertEquals(s.Live.Freq, s.Tests[0].Plot[1]);
        assertEquals(s.Live.Mark, s.Tests[0].Plot[1].UserL);
    });

    await t.step("Check marked value", ()=>
    {
        assertEquals(s.Live.Mark.Stim, s.Stim);
        assertEquals(s.Live.Mark.Resp, true);
    });

    await t.step("Dispatch Mark delete action", ()=>
    {
        States.latest = Reducer(States.latest, {Name:"Mark", Data:null});
    });
    s = States.latest;

    await t.step("Check marked value", ()=>
    {
        assertEquals(States.latest.Live.Mark, undefined);
    });

});


Deno.test("Update Tone State", async(t)=>
{
    await t.step("all three", ()=>
    {
        States.latest = Reducer(States.latest, {Name:"Freq", Data:2});
        States.latest = Reducer(States.latest, {Name:"Stim", Data:25});
        States.latest = Reducer(States.latest, {Name:"Chan", Data:1});
    });

    await t.step("check tone values", ()=>
    {
        
        assertEquals(States.latest.Stim, 25);
        assertEquals(States.latest.Freq, 2);
        assertEquals(States.latest.Chan, 1);
    });
});

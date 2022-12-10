import React from "react";

// setup audio context
const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
const Context = new AudioContextConstructor();

// create audio nodes
const Oscillator = Context.createOscillator();
const GainVolume = Context.createGain();
const GainBeep = Context.createGain();
const GainLeft = Context.createGain();
const GainRight = Context.createGain();
const ChannelMerge = Context.createChannelMerger(2);

// wire up audio nodes
Oscillator.connect(GainVolume);
GainVolume.connect(GainBeep);
GainBeep.connect(GainLeft);
GainBeep.connect(GainRight);
GainLeft.connect(ChannelMerge, 0, 0);
GainRight.connect(ChannelMerge, 0, 1);
ChannelMerge.connect(Context.destination);

// start
GainBeep.gain.value = 0;
GainLeft.gain.value = 0;
GainRight.gain.value = 0;
GainVolume.gain.value = 0;
Oscillator.start(Context.currentTime+0.0);

const pad = 0.0015;

/** @type {(inNode:AudioParam, inValue:number, inDelay:number)=>AudioParam} */
const change = (inNode, inValue, inDelay) => inNode.linearRampToValueAtTime(inValue, Context.currentTime+inDelay);

/** @type {(inNode:AudioParam, inStart:number, inDuration:number)=>void} */
const pulse = (inNode, inStart, inDuration) =>
{
    change(inNode, 0, inStart);
    change(inNode, 1, inStart+pad);
    change(inNode, 1, (inStart+inDuration)-pad );
    change(inNode, 0, (inStart+inDuration) );
};

/** @type {(inDuration:number, inContinuous:boolean, inChannel:number, inFreq:number, indBHL:number)=>void} */
const Start = (inDuration, inContinuous, inChannel, inFreq, indBHL) =>
{
    Context.resume();
    GainBeep.gain.cancelScheduledValues(Context.currentTime);
    GainBeep.gain.setValueAtTime(0, Context.currentTime);

    change(GainLeft.gain,        1-inChannel, pad);
    change(GainRight.gain,       inChannel,   pad);
    change(Oscillator.frequency, inFreq,      pad);
    change(GainVolume.gain,      indBHL,      pad);

    if (inContinuous)
    {
        pulse(GainBeep.gain, 0.01, 0.8);
    }
    else
    {
        pulse(GainBeep.gain, 0.01, 0.2);
        pulse(GainBeep.gain, 0.33, 0.2);
        pulse(GainBeep.gain, 0.66, 0.2);
    }

};

export const useTone =()=>
{
    const [responseGet, responseSet] = React.useState(0);
    const [playGet, playSet] = React.useState(0);
    React.useEffect(()=>
    {
        /** @type {number|undefined} */
        let timer;
        if(playGet == 1)
        {
            let volNorm = 0.5//(State.dBHL-10)/ 130;

            Start(1, false, 0, 500, (volNorm*0.8) + 0.2);

            //responseSet(State.dBHL - currentChan.Answer[0]);
            timer = setTimeout(()=>{playSet(2)}, 300 + Math.random()*1000);
        }
        return () => clearTimeout(timer);
        
    }, [playGet]);

    return {Play:()=>{playSet(1)}, Playing:playGet == 1, Response:playGet == 2 && responseGet };
};
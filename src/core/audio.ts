import type {RailwaySimulation} from './simulation';
/** Oscillators and seeded noise only: no downloaded recordings. */
export class RailwayAudio {
  private context?:AudioContext;private master?:GainNode;private traction?:OscillatorNode;private tractionGain?:GainNode;
  private horn?:GainNode;private warning?:GainNode;private rolling?:GainNode;private brake?:GainNode;private ambience?:GainNode;private crossing?:GainNode;private reverb?:GainNode;private volume=.35;
  async init(){if(this.context){await this.context.resume();return;}const c=new AudioContext();this.context=c;this.master=c.createGain();this.master.gain.value=this.volume;this.master.connect(c.destination);
    const impulse=c.createBuffer(2,c.sampleRate*1.2,c.sampleRate);let seed=172;const noise=()=>{seed=Math.imul(seed,1664525)+1013904223|0;return (seed>>>0)/2147483648-1;};for(let ch=0;ch<2;ch++){const a=impulse.getChannelData(ch);for(let i=0;i<a.length;i++)a[i]=noise()*(1-i/a.length)**2*.28;}const convolver=c.createConvolver();convolver.buffer=impulse;this.reverb=c.createGain();this.reverb.gain.value=0;this.master.connect(convolver);convolver.connect(this.reverb);this.reverb.connect(c.destination);
    this.tractionGain=c.createGain();this.tractionGain.gain.value=0;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=250;this.tractionGain.connect(filter);filter.connect(this.master);this.traction=c.createOscillator();this.traction.type='sawtooth';this.traction.frequency.value=38;this.traction.connect(this.tractionGain);this.traction.start();
    const noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate),samples=noiseBuffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=noise();
    const bed=(frequency:number,q:number)=>{const source=c.createBufferSource();source.buffer=noiseBuffer;source.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=frequency;f.Q.value=q;const gain=c.createGain();gain.gain.value=0;source.connect(f);f.connect(gain);gain.connect(this.master!);source.start();return gain;};
    this.rolling=bed(580,.65);this.brake=bed(1900,3);this.ambience=bed(370,.4);
    this.horn=c.createGain();this.horn.gain.value=0;this.horn.connect(this.master);for(const f of [370,440]){const o=c.createOscillator();o.type='triangle';o.frequency.value=f;o.connect(this.horn);o.start();}
    this.warning=c.createGain();this.warning.gain.value=0;this.warning.connect(this.master);const o=c.createOscillator();o.type='sine';o.frequency.value=880;o.connect(this.warning);o.start();
    this.crossing=c.createGain();this.crossing.gain.value=0;this.crossing.connect(this.master);const bell=c.createOscillator();bell.type='sine';bell.frequency.value=1020;bell.connect(this.crossing);bell.start();await c.resume();
  }
  setVolume(value:number){this.volume=value;if(this.master)this.master.gain.setTargetAtTime(value,this.context!.currentTime,.05);}
  event(name:string){const c=this.context;if(!c||!this.master)return;const frequencies=name==='clear'?[940,1254]:name==='doors'?[660,880]:name==='tpws'?[220,440]:name==='ack'?[520]:[];
    for(const [i,f] of frequencies.entries()){const o=c.createOscillator(),g=c.createGain();o.type=name==='tpws'?'square':'sine';o.frequency.value=f;g.gain.setValueAtTime(.05,c.currentTime+i*.09);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.7+i*.09);o.connect(g);g.connect(this.master);o.start(c.currentTime+i*.09);o.stop(c.currentTime+1+i*.09);}}
  update(sim:RailwaySimulation,horn:boolean){if(!this.context)return;const t=this.context.currentTime,paused=sim.paused,speed=sim.player.speed,tunnel=!!sim.route.tunnelAt(sim.player.s);
    this.traction?.frequency.setTargetAtTime(34+speed*2.1+Math.max(0,sim.player.controller)*35,t,.15);
    this.tractionGain?.gain.setTargetAtTime(paused?0:.012+Math.max(0,sim.player.controller)*.025+speed*.0004,t,.12);
    this.rolling?.gain.setTargetAtTime(paused?0:Math.min(.13,speed*.004),t,.12);this.brake?.gain.setTargetAtTime(!paused&&speed>1?Math.max(0,-sim.player.controller)*.025:0,t,.1);
    this.ambience?.gain.setTargetAtTime(paused?0:tunnel?.002:.008,t,.3);this.reverb?.gain.setTargetAtTime(!paused&&tunnel?this.volume*.38:0,t,.25);
    this.horn?.gain.setTargetAtTime(!paused&&horn?.09:0,t,.025);
    this.warning?.gain.setTargetAtTime(!paused&&(sim.aws.pending||sim.tpws.active)&&Math.floor(t*5)%2===0?.07:0,t,.015);
    const crossing=sim.crossings.find(c=>c.state!=='open'&&Math.abs(c.s-sim.player.s)<240),distance=crossing?Math.abs(crossing.s-sim.player.s):240;
    this.crossing?.gain.setTargetAtTime(!paused&&crossing&&Math.floor(sim.clock*4)%2===0?.025*(1-distance/240):0,t,.015);
  }
}

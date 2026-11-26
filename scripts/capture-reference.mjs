import {palettes} from '../src/lib/palettes.ts';
import {chromium,expect} from '@playwright/test';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
const out='docs/reference-review', origin=process.env.X1_REVIEW_ORIGIN || 'http://127.0.0.1:4174';
await mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:960,height:600}});
try {
  await p.goto(origin);
  const mark=p.locator('header .universe-mark').first();
  const expressions=[];
  const labels=Object.values(palettes).map(([label])=>label);
  for(const label of labels) {
    await p.getByLabel('Open theme selector').click();
    await p.getByRole('menuitemradio',{name:'Activate '+label,exact:true}).click();
    await mark.hover();
    await expect(mark.locator('.mark-face')).toHaveCSS('opacity','1');
    const paths=await mark.locator('path').evaluateAll(els=>els.map(e=>e.getAttribute('d')).join(' '));
    expressions.push(paths);
    await mark.screenshot({path:out+'/face-'+label.toLowerCase().replaceAll(' ','-')+'.png'});
  }
  if(new Set(expressions).size!==labels.length) throw new Error('Duplicated expression');
  const evidence=[];
  for(const [card,world,duration] of [['games','arcade',3600],['insights','insights',4500],['academic','academic',3100]]) {
    await p.goto(origin);
    const temp=await mkdtemp(join(tmpdir(),'x1-film-'));
    try {
      const link=p.locator('.dest-'+card);await link.hover();
      await p.screenshot({path:temp+'/0000.jpg',quality:76});
      const start=performance.now();await link.click();
      await expect(p.locator('.cinema')).toHaveAttribute('data-to',world);
      await expect(p.getByRole('button',{name:'Skip journey'})).toBeVisible();
      let n=1;
      while(performance.now()-start<duration+450){
        await p.screenshot({path:join(temp,String(n++).padStart(4,'0')+'.jpg'),quality:76});
      }
      await expect(p.locator('.cinema')).toHaveCount(0);
      const elapsed=performance.now()-start;
      execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(1000*n/elapsed),'-i',temp+'/%04d.jpg','-vf','fps=24,format=yuv420p','-c:v','libx264','-crf','26','-movflags','+faststart',out+'/'+world+'.mp4']);
      evidence.push({world,configuredMs:duration,sampledFrames:n,captureMs:Math.round(elapsed)});
      await p.goBack();await link.click();await p.getByRole('button',{name:'Skip journey'}).click();await expect(p.locator('.cinema')).toHaveCount(0);
    } finally {await rm(temp,{recursive:true,force:true});}
  }
  await writeFile(out+'/journeys.json',JSON.stringify(evidence,null,2)+'\n');
} finally {await b.close();}

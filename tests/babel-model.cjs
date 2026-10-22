const assert = require('node:assert/strict');
const { BabelStory, BABEL_DIRECTIONS, BABEL_BUILD_SECONDS } = require('../004-tower-of-babel/story.js');
assert.deepEqual(BABEL_DIRECTIONS, ['left','down','right','up']);
for (const count of [6,8]) {
  const story = new BabelStory(count,()=>.43);
  assert.equal(story.count,count);assert.equal(new Set(story.directions).size,4);
  assert.equal(story.progress,0);assert.equal(story.cycle(-1),false);assert.equal(story.cycle(count),false);
  const left = story.turns.findIndex(t=>t%4===0);
  for (const direction of ['down','right','up','left']) {story.cycle(left);assert.equal(story.directions[left],direction);}
  // Upward votes are reversible before every member agrees.
  const up = story.turns.findIndex(t=>t%4===3); story.cycle(up);assert.equal(story.directions[up],'left');
  const last = count-1;if(story.directions[last]==='up')story.cycle(last);
  for(let i=0;i<count-1;i++)while(story.directions[i]!=='up')story.cycle(i);
  assert.equal(story.upCount,count-1);story.tick(30);assert.equal(story.progress,0);assert.equal(story.phase,'planning');
  while(story.directions[last]!=='right')story.cycle(last);
  assert.equal(story.starts,0);story.cycle(last);assert.equal(story.starts,1);assert.equal(story.phase,'building');
  assert.equal(story.cycle(0),false);story.tick(3.4);assert.ok(story.progress>0&&story.progress<1);
  story.tick(BABEL_BUILD_SECONDS);assert.equal(story.phase,'complete');assert.equal(story.progress,1);assert.equal(story.starts,1);
  story.tick(20);assert.equal(story.progress,1);story.reset(count);assert.equal(story.progress,0);assert.equal(new Set(story.directions).size,4);
}
console.log('Babel model: four-direction cycle, reversible up, strict unanimity, one build, 6/8 members, reset PASS');

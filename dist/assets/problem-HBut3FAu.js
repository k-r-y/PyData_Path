var e=`P039`,t=`longest-unique-substring`,n=`Longest Unique Event Window`,r=`medium`,i=[`sliding window`,`strings`,`dict`],a=20,o=[`a3-strings-io`,`a6-data-structures`,`b8-performance-algorithms`],s={type:`function`,name:`longest_unique_window`},c=`exact`,l={visible:[{label:`Repeating pattern stream`,args:[`abcabcbb`],expected:3},{label:`All identical events`,args:[`zzzzz`],expected:1}],hidden:[{label:`Empty stream`,args:[``],expected:0},{label:`Single event`,args:[`A`],expected:1},{label:`Overlapping restart case`,args:[`dvdf`],expected:3},{label:`Palindrome wrap trap`,args:[`abba`],expected:2},{label:`Distinct tail after early repeat`,args:[`pwwkew`],expected:3},{label:`Large distinct event stream performance test`,argsExpr:`(''.join(chr(256 + i) for i in range(2500)),)`,expected:2500,timeLimitMs:500,isPerformance:!0}]},u=[`Keep a sliding window [left, right] where every character inside the window is unique.`,`Track the most recent index of each character in a dict. When you see a repeated character inside the current window, move left to max(left, last_seen[ch] + 1).`,`Pseudocode:
  last_seen = {}
  left = 0
  best = 0
  for right, ch in enumerate(events):
      if ch in last_seen and last_seen[ch] >= left:
          left = last_seen[ch] + 1
      last_seen[ch] = right
      best = max(best, right - left + 1)
  return best`],d=[`python-tutorial`,`python-wiki-timecomplexity`],f={id:e,slug:t,title:n,difficulty:r,tags:i,estimatedMinutes:20,relatedModules:o,entry:s,compare:c,tests:l,hints:u,sources:d};export{c as compare,f as default,r as difficulty,s as entry,a as estimatedMinutes,u as hints,e as id,o as relatedModules,t as slug,d as sources,i as tags,l as tests,n as title};
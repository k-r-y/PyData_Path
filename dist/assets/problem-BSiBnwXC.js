var e=`P072`,t=`lru-cache`,n=`LRU Catalog Cache`,r=`hard`,i=[`oop`,`dict`,`ordering`],a=35,o=[`b2-oop`,`b8-performance-algorithms`],s={type:`script`},c=`exact`,l={visible:[{label:`Basic put, get, and LRU eviction`,inputDisplay:`LRUCache(2): put(101, 50), put(102, 75), get(101), put(103, 90), get(102), get(103)`,expectedDisplay:`get(101)=50, get(102)=-1, get(103)=90`,script:`cache = LRUCache(2)
cache.put(101, 50)
cache.put(102, 75)
assert cache.get(101) == 50
cache.put(103, 90)
assert cache.get(102) == -1
assert cache.get(103) == 90
assert cache.get(101) == 50`},{label:`Updating existing key refreshes recency without evicting`,inputDisplay:`LRUCache(2): put(1, 10), put(2, 20), put(1, 15), put(3, 30)`,expectedDisplay:`get(1)=15, get(2)=-1, get(3)=30`,script:`cache = LRUCache(2)
cache.put(1, 10)
cache.put(2, 20)
cache.put(1, 15)
cache.put(3, 30)
assert cache.get(1) == 15
assert cache.get(2) == -1
assert cache.get(3) == 30`}],hidden:[{label:`Capacity 1 replaces single entry`,inputDisplay:`LRUCache(1): put(1, 1), put(2, 2), get(1), get(2)`,expectedDisplay:`get(1)=-1, get(2)=2`,script:`cache = LRUCache(1)
cache.put(1, 1)
assert cache.get(1) == 1
cache.put(2, 2)
assert cache.get(1) == -1
assert cache.get(2) == 2`},{label:`Missing get does not evict or reorder`,inputDisplay:`LRUCache(2): put(1, 1), put(2, 2), get(99), put(3, 3)`,expectedDisplay:`get(99)=-1, get(1)=-1, get(2)=2`,script:`cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
assert cache.get(99) == -1
cache.put(3, 3)
assert cache.get(1) == -1
assert cache.get(2) == 2
assert cache.get(3) == 3`},{label:`Zero capacity stores nothing`,inputDisplay:`LRUCache(0): put(1, 10), get(1)`,expectedDisplay:`get(1)=-1`,script:`cache = LRUCache(0)
cache.put(1, 10)
assert cache.get(1) == -1`},{label:`Repeated updates keep size bounded`,inputDisplay:`LRUCache(2): overwrite key 1 three times then insert key 2 and 3`,expectedDisplay:`key 1 remains when refreshed`,script:`cache = LRUCache(2)
cache.put(1, 10)
cache.put(1, 20)
cache.put(2, 30)
cache.put(1, 25)
cache.put(3, 40)
assert cache.get(2) == -1
assert cache.get(1) == 25
assert cache.get(3) == 40`},{label:`Multi-step recency trace`,inputDisplay:`LRUCache(3) interleaved gets and puts`,expectedDisplay:`Correct evictions across 10 operations`,script:`cache = LRUCache(3)
cache.put(1, 10)
cache.put(2, 20)
cache.put(3, 30)
assert cache.get(1) == 10
cache.put(4, 40)
assert cache.get(2) == -1
assert cache.get(3) == 30
cache.put(5, 50)
assert cache.get(1) == -1
assert cache.get(4) == 40
assert cache.get(3) == 30
assert cache.get(5) == 50`},{label:`Large O(1) cache performance test`,inputDisplay:`LRUCache(5000) with 50000 put/get operations`,expectedDisplay:`Completes in O(1) per operation`,timeLimitMs:800,isPerformance:!0,script:`cache = LRUCache(5000)
for i in range(25000):
    cache.put(i, i * 10)
    if i >= 10:
        assert cache.get(i - 10) == (i - 10) * 10
assert cache.get(0) == -1
assert cache.get(24999) == 249990`}]},u=[`You need O(1) average lookup by key AND O(1) tracking of which key was least recently used.`,`In Python, collections.OrderedDict provides move_to_end(key) and popitem(last=False) in O(1), or you can pair a plain dict with a doubly linked list of nodes.`,`Pseudocode (OrderedDict):
  init(capacity): store capacity and OrderedDict()
  get(key): if key missing return -1; move_to_end(key); return value
  put(key, val): if capacity <= 0 return; set/update key and move_to_end(key); if len > capacity popitem(last=False)`],d=[`python-tutorial`,`python-stdtypes-docs`,`python-wiki-timecomplexity`],f={id:e,slug:t,title:n,difficulty:r,tags:i,estimatedMinutes:35,relatedModules:o,entry:s,compare:c,tests:l,hints:u,sources:d};export{c as compare,f as default,r as difficulty,s as entry,a as estimatedMinutes,u as hints,e as id,o as relatedModules,t as slug,d as sources,i as tags,l as tests,n as title};
var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,o)=>(o=n==null?{}:e(i(n)),s(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n)),l=/* @__PURE__ */ (e=>typeof require<`u`?require:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof require<`u`?require:e)[t]}):e)(function(e){if(typeof require<`u`)return require.apply(this,arguments);throw Error('Calling `require` for "'+e+"\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.")}),u=Object.defineProperty,d=(e,t)=>u(e,`name`,{value:t,configurable:!0}),f=(e=>typeof l<`u`?l:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof l<`u`?l:e)[t]}):e)(function(e){if(typeof l<`u`)return l.apply(this,arguments);throw Error(`Dynamic require of "`+e+`" is not supported`)}),ee=(()=>{for(var e=/* @__PURE__ */ new Uint8Array(128),t=0;t<64;t++)e[t<26?t+65:t<52?t+71:t<62?t-4:t*4-205]=t;return t=>{for(var n=t.length,r=new Uint8Array((n-(t[n-1]==`=`)-(t[n-2]==`=`))*3/4|0),i=0,a=0;i<n;){var o=e[t.charCodeAt(i++)],s=e[t.charCodeAt(i++)],c=e[t.charCodeAt(i++)],l=e[t.charCodeAt(i++)];r[a++]=o<<2|s>>4,r[a++]=s<<4|c>>2,r[a++]=c<<6|l}return r}})();function te(e){return!isNaN(parseFloat(e))&&isFinite(e)}d(te,`_isNumber`);function p(e){return e.charAt(0).toUpperCase()+e.substring(1)}d(p,`_capitalize`);function m(e){return function(){return this[e]}}d(m,`_getter`);var h=[`isConstructor`,`isEval`,`isNative`,`isToplevel`],g=[`columnNumber`,`lineNumber`],_=[`fileName`,`functionName`,`source`],v=h.concat(g,_,[`args`],[`evalOrigin`]);function y(e){if(e)for(var t=0;t<v.length;t++)e[v[t]]!==void 0&&this[`set`+p(v[t])](e[v[t]])}for(d(y,`StackFrame`),y.prototype={getArgs:d(function(){return this.args},`getArgs`),setArgs:d(function(e){if(Object.prototype.toString.call(e)!==`[object Array]`)throw TypeError(`Args must be an Array`);this.args=e},`setArgs`),getEvalOrigin:d(function(){return this.evalOrigin},`getEvalOrigin`),setEvalOrigin:d(function(e){if(e instanceof y)this.evalOrigin=e;else if(e instanceof Object)this.evalOrigin=new y(e);else throw TypeError(`Eval Origin must be an Object or StackFrame`)},`setEvalOrigin`),toString:d(function(){var e=this.getFileName()||``,t=this.getLineNumber()||``,n=this.getColumnNumber()||``,r=this.getFunctionName()||``;return this.getIsEval()?e?`[eval] (`+e+`:`+t+`:`+n+`)`:`[eval]:`+t+`:`+n:r?r+` (`+e+`:`+t+`:`+n+`)`:e+`:`+t+`:`+n},`toString`)},y.fromString=d(function(e){var t=e.indexOf(`(`),n=e.lastIndexOf(`)`),r=e.substring(0,t),i=e.substring(t+1,n).split(`,`),a=e.substring(n+1);if(a.indexOf(`@`)===0)var o=/@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(a,``),s=o[1],c=o[2],l=o[3];return new y({functionName:r,args:i||void 0,fileName:s,lineNumber:c||void 0,columnNumber:l||void 0})},`StackFrame$$fromString`),b=0;b<h.length;b++)y.prototype[`get`+p(h[b])]=m(h[b]),y.prototype[`set`+p(h[b])]=function(e){return function(t){this[e]=!!t}}(h[b]);var b;for(x=0;x<g.length;x++)y.prototype[`get`+p(g[x])]=m(g[x]),y.prototype[`set`+p(g[x])]=function(e){return function(t){if(!te(t))throw TypeError(e+` must be a Number`);this[e]=Number(t)}}(g[x]);var x;for(S=0;S<_.length;S++)y.prototype[`get`+p(_[S])]=m(_[S]),y.prototype[`set`+p(_[S])]=function(e){return function(t){this[e]=String(t)}}(_[S]);var S,C=y;function w(){var e=/^\s*at .*(\S+:\d+|\(native\))/m,t=/^(eval@)?(\[native code])?$/;return{parse:d(function(t){if(t.stack&&t.stack.match(e))return this.parseV8OrIE(t);if(t.stack)return this.parseFFOrSafari(t);throw Error(`Cannot parse given Error object`)},`ErrorStackParser$$parse`),extractLocation:d(function(e){if(e.indexOf(`:`)===-1)return[e];var t=/(.+?)(?::(\d+))?(?::(\d+))?$/.exec(e.replace(/[()]/g,``));return[t[1],t[2]||void 0,t[3]||void 0]},`ErrorStackParser$$extractLocation`),parseV8OrIE:d(function(t){return t.stack.split(`
`).filter(function(t){return!!t.match(e)},this).map(function(e){e.indexOf(`(eval `)>-1&&(e=e.replace(/eval code/g,`eval`).replace(/(\(eval at [^()]*)|(,.*$)/g,``));var t=e.replace(/^\s+/,``).replace(/\(eval code/g,`(`).replace(/^.*?\s+/,``),n=t.match(/ (\(.+\)$)/);t=n?t.replace(n[0],``):t;var r=this.extractLocation(n?n[1]:t);return new C({functionName:n&&t||void 0,fileName:[`eval`,`<anonymous>`].indexOf(r[0])>-1?void 0:r[0],lineNumber:r[1],columnNumber:r[2],source:e})},this)},`ErrorStackParser$$parseV8OrIE`),parseFFOrSafari:d(function(e){return e.stack.split(`
`).filter(function(e){return!e.match(t)},this).map(function(e){if(e.indexOf(` > eval`)>-1&&(e=e.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,`:$1`)),e.indexOf(`@`)===-1&&e.indexOf(`:`)===-1)return new C({functionName:e});var t=/((.*".+"[^@]*)?[^@]*)(?:@)/,n=e.match(t),r=n&&n[1]?n[1]:void 0,i=this.extractLocation(e.replace(t,``));return new C({functionName:r,fileName:i[0],lineNumber:i[1],columnNumber:i[2],source:e})},this)},`ErrorStackParser$$parseFFOrSafari`)}}d(w,`ErrorStackParser`);var ne=new w;function re(){return typeof API<`u`&&API!==globalThis.API?API.runtimeEnv:ie({IN_BUN:typeof Bun<`u`,IN_DENO:typeof Deno<`u`,IN_NODE:typeof process==`object`&&typeof process.versions==`object`&&typeof process.versions.node==`string`&&!process.browser,IN_SAFARI:typeof navigator==`object`&&typeof navigator.userAgent==`string`&&navigator.userAgent.indexOf(`Chrome`)===-1&&navigator.userAgent.indexOf(`Safari`)>-1,IN_SHELL:typeof read==`function`&&typeof load==`function`,IN_WORKERD:typeof navigator==`object`&&navigator.userAgent?.includes(`Cloudflare-Workers`)})}d(re,`getGlobalRuntimeEnv`);var T=re();function ie(e){let t=e.IN_NODE&&typeof module<`u`&&module.exports&&typeof f==`function`&&typeof __dirname==`string`,n=e.IN_NODE&&!t,r=!e.IN_NODE&&!e.IN_DENO&&!e.IN_BUN,i=r&&typeof window<`u`&&typeof window.document<`u`&&typeof document.createElement==`function`&&`sessionStorage`in window&&typeof globalThis.importScripts!=`function`,a=r&&typeof globalThis.WorkerGlobalScope<`u`&&typeof globalThis.self<`u`&&globalThis.self instanceof globalThis.WorkerGlobalScope;if(a&&ae())throw Error(`Classic web workers are not supported`);let o={...e,IN_BROWSER:r,IN_BROWSER_MAIN_THREAD:i,IN_BROWSER_WEB_WORKER:a,IN_NODE_COMMONJS:t,IN_NODE_ESM:n};if(!(o.IN_BROWSER_MAIN_THREAD||o.IN_BROWSER_WEB_WORKER||o.IN_NODE||o.IN_SHELL||o.IN_WORKERD))throw Error(`Cannot determine runtime environment: ${JSON.stringify(o)}`);return o}d(ie,`calculateDerivedFlags`);function ae(){try{return globalThis.importScripts(`data:text/javascript,`),!0}catch{return!1}}d(ae,`isClassicWorker`);var E,D,O,k;async function A(){if(!T.IN_NODE||(E=(await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1))).default,O=await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1)),k=await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1)),(await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1))).default,D=await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1)),P=D.sep,typeof f<`u`))return;let e={fs:O,crypto:await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1)),ws:await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1)),child_process:await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1))};globalThis.require=function(t){return e[t]}}d(A,`initNodeModules`);function j(e,t){return D.resolve(t||`.`,e)}d(j,`node_resolvePath`);function M(e,t){return t===void 0&&(t=location),new URL(e,t).toString()}d(M,`browser_resolvePath`);var N=T.IN_NODE?j:T.IN_SHELL?d(e=>e,`resolvePath`):M,P;T.IN_NODE||(P=`/`);function F(e,t){return e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`)?{response:fetch(e)}:{binary:k.readFile(e).then(e=>new Uint8Array(e.buffer,e.byteOffset,e.byteLength))}}d(F,`node_getBinaryResponse`);function I(e,t){if(e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`))throw Error(`Shell cannot fetch urls`);return{binary:Promise.resolve(new Uint8Array(readbuffer(e)))}}d(I,`shell_getBinaryResponse`);function L(e,t){let n=new URL(e,location);return{response:fetch(n,t?{integrity:t}:{})}}d(L,`browser_getBinaryResponse`);var R=T.IN_NODE?F:T.IN_SHELL?I:L;async function z(e,t){let{response:n,binary:r}=R(e,t);if(r)return r;let i=await n;if(!i.ok)throw Error(`Failed to load '${e}': request failed.`);return new Uint8Array(await i.arrayBuffer())}d(z,`loadBinaryFile`);var oe=T.IN_NODE?B:d(async e=>await import(e),`loadScript`);async function B(e){return e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`)?await import(e):await import(E.pathToFileURL(e).href)}d(B,`nodeLoadScript`);async function V(e){if(T.IN_NODE){await A();let t=await k.readFile(e,{encoding:`utf8`});return JSON.parse(t)}if(T.IN_SHELL){let t=read(e);return JSON.parse(t)}return await(await fetch(e)).json()}d(V,`loadLockFile`);async function H(){if(T.IN_NODE_COMMONJS)return __dirname;let e;try{throw Error()}catch(t){e=t}let t=ne.parse(e)[0].fileName;if(T.IN_NODE&&!t.startsWith(`file://`)&&(t=`file://${t}`),T.IN_NODE_ESM){let e=await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1));return(await import(`./__vite-browser-external-YREXsOpy.js`).then(e=>/* @__PURE__ */ c(e.default,1))).fileURLToPath(e.dirname(t))}let n=t.lastIndexOf(P);if(n===-1)throw Error(`Could not extract indexURL path from pyodide module location. Please pass the indexURL explicitly to loadPyodide.`);return t.slice(0,n)}d(H,`calculateDirname`);function U(e){return e.substring(0,e.lastIndexOf(`/`)+1)||globalThis.location?.toString()||`.`}d(U,`calculateInstallBaseUrl`);function W(e){let t=e.FS,n=e.FS.filesystems.MEMFS,r=e.PATH,i={DIR_MODE:16895,FILE_MODE:33279,mount:d(function(e){if(!e.opts.fileSystemHandle)throw Error(`opts.fileSystemHandle is required`);return n.mount.apply(null,arguments)},`mount`),syncfs:d(async(e,t,n)=>{try{let r=i.getLocalSet(e),a=await i.getRemoteSet(e),o=t?a:r,s=t?r:a;await i.reconcile(e,o,s),n(null)}catch(e){n(e)}},`syncfs`),getLocalSet:d(e=>{let n=Object.create(null);function i(e){return e!==`.`&&e!==`..`}d(i,`isRealDir`);function a(e){return t=>r.join2(e,t)}d(a,`toAbsolute`);let o=t.readdir(e.mountpoint).filter(i).map(a(e.mountpoint));for(;o.length;){let e=o.pop(),r=t.stat(e);t.isDir(r.mode)&&o.push.apply(o,t.readdir(e).filter(i).map(a(e))),n[e]={timestamp:r.mtime,mode:r.mode}}return{type:`local`,entries:n}},`getLocalSet`),getRemoteSet:d(async e=>{let t=Object.create(null),n=await se(e.opts.fileSystemHandle);for(let[a,o]of n)a!==`.`&&(t[r.join2(e.mountpoint,a)]={timestamp:o.kind===`file`?new Date((await o.getFile()).lastModified):/* @__PURE__ */ new Date,mode:o.kind===`file`?i.FILE_MODE:i.DIR_MODE});return{type:`remote`,entries:t,handles:n}},`getRemoteSet`),loadLocalEntry:d(e=>{let r=t.lookupPath(e,{}).node,i=t.stat(e);if(t.isDir(i.mode))return{timestamp:i.mtime,mode:i.mode};if(t.isFile(i.mode))return r.contents=n.getFileDataAsTypedArray(r),{timestamp:i.mtime,mode:i.mode,contents:r.contents};throw Error(`node type not supported`)},`loadLocalEntry`),storeLocalEntry:d((e,n)=>{if(t.isDir(n.mode))t.mkdirTree(e,n.mode);else if(t.isFile(n.mode))t.writeFile(e,n.contents,{canOwn:!0});else throw Error(`node type not supported`);t.chmod(e,n.mode),t.utime(e,n.timestamp,n.timestamp)},`storeLocalEntry`),removeLocalEntry:d(e=>{var n=t.stat(e);t.isDir(n.mode)?t.rmdir(e):t.isFile(n.mode)&&t.unlink(e)},`removeLocalEntry`),loadRemoteEntry:d(async e=>{if(e.kind===`file`){let t=await e.getFile();return{contents:new Uint8Array(await t.arrayBuffer()),mode:i.FILE_MODE,timestamp:new Date(t.lastModified)}}if(e.kind===`directory`)return{mode:i.DIR_MODE,timestamp:/* @__PURE__ */ new Date};throw Error(`unknown kind: `+e.kind)},`loadRemoteEntry`),storeRemoteEntry:d(async(e,n,i)=>{let a=e.get(r.dirname(n)),o=t.isFile(i.mode)?await a.getFileHandle(r.basename(n),{create:!0}):await a.getDirectoryHandle(r.basename(n),{create:!0});if(o.kind===`file`){let e=await o.createWritable();await e.write(i.contents),await e.close()}e.set(n,o)},`storeRemoteEntry`),removeRemoteEntry:d(async(e,t)=>{await e.get(r.dirname(t)).removeEntry(r.basename(t)),e.delete(t)},`removeRemoteEntry`),reconcile:d(async(e,n,a)=>{let o=0,s=[];Object.keys(n.entries).forEach(function(e){let r=n.entries[e],i=a.entries[e];(!i||t.isFile(r.mode)&&r.timestamp.getTime()>i.timestamp.getTime())&&(s.push(e),o++)}),s.sort();let c=[];if(Object.keys(a.entries).forEach(function(e){n.entries[e]||(c.push(e),o++)}),c.sort().reverse(),!o)return;let l=n.type===`remote`?n.handles:a.handles;for(let t of s){let n=r.normalize(t.replace(e.mountpoint,`/`)).substring(1);if(a.type===`local`){let e=l.get(n),r=await i.loadRemoteEntry(e);i.storeLocalEntry(t,r)}else{let e=i.loadLocalEntry(t);await i.storeRemoteEntry(l,n,e)}}for(let t of c)if(a.type===`local`)i.removeLocalEntry(t);else{let n=r.normalize(t.replace(e.mountpoint,`/`)).substring(1);await i.removeRemoteEntry(l,n)}},`reconcile`)};e.FS.filesystems.NATIVEFS_ASYNC=i}d(W,`initializeNativeFS`);var se=d(async e=>{let t=[];async function n(e){for await(let r of e.values())t.push(r),r.kind===`directory`&&await n(r)}d(n,`collect`),await n(e);let r=/* @__PURE__ */ new Map;r.set(`.`,e);for(let n of t){let t=(await e.resolve(n)).join(`/`);r.set(t,n)}return r},`getFsHandles`),ce=ee(`AGFzbQEAAAABDANfAGAAAW9gAW8BfwMDAgECBygCE0pzdl9HZXRFcnJvcl9pbXBvcnQAAA5Kc3ZFcnJvcl9DaGVjawABChMCBwD7AQD7GwsJACAA+xr7FAAL`),le=async function(){try{let e=await WebAssembly.compile(ce);return await WebAssembly.instantiate(e)}catch(e){if(e instanceof WebAssembly.CompileError)return;throw e}}();async function G(){let e=await le;if(e)return e.exports;let t=Symbol(`error marker`);return{Jsv_GetError_import:d(()=>t,`Jsv_GetError_import`),JsvError_Check:d(e=>e===t,`JsvError_Check`)}}d(G,`getJsvErrorImport`);function ue(e){let t={config:e,runtimeEnv:T},n={noImageDecoding:!0,noAudioDecoding:!0,noWasmDecoding:!1,preRun:pe(e),print:e.stdout,printErr:e.stderr,onExit(e){n.exitCode=e},thisProgram:e._sysExecutable,arguments:e.args,API:t,locateFile:d(t=>e.indexURL+t,`locateFile`),instantiateWasm:me(e.indexURL)};return n}d(ue,`createSettings`);function K(e){return function(t){try{t.FS.mkdirTree(e)}catch(t){console.error(`Error occurred while making a home directory '${e}':`),console.error(t),console.error(`Using '/' for a home directory instead`),e=`/`}t.FS.chdir(e)}}d(K,`createHomeDirectory`);function q(e){return function(t){Object.assign(t.ENV,e)}}d(q,`setEnvironment`);function J(e){return e?[async t=>{t.addRunDependency(`fsInitHook`);try{await e(t.FS,{sitePackages:t.API.sitePackages})}finally{t.removeRunDependency(`fsInitHook`)}}]:[]}d(J,`callFsInitHook`);function de(e){let t=e.HEAPU32[e._Py_Version>>>2];return[t>>>24&255,t>>>16&255,t>>>8&255]}d(de,`computeVersionTuple`);function fe(e){let t=z(e);return async e=>{e.API.pyVersionTuple=de(e);let[n,r]=e.API.pyVersionTuple;e.FS.mkdirTree(`/lib`),e.API.sitePackages=`/lib/python${n}.${r}/site-packages`,e.FS.mkdirTree(e.API.sitePackages),e.FS.mkdirTree(`/lib/python${n}.${r}/lib-dynload`),e.addRunDependency(`install-stdlib`);try{let i=await t;e.FS.writeFile(`/lib/python${n}${r}.zip`,i)}catch(e){console.error(`Error occurred while installing the standard library:`),console.error(e)}finally{e.removeRunDependency(`install-stdlib`)}}}d(fe,`installStdlib`);function pe(e){let t;return t=e.stdLibURL==null?e.indexURL+`python_stdlib.zip`:e.stdLibURL,[fe(t),K(e.env.HOME),q(e.env),W,...J(e.fsInit)]}d(pe,`getFileSystemInitializationFuncs`);function me(e){if(typeof WasmOffsetConverter<`u`)return;let{binary:t,response:n}=R(e+`pyodide.asm.wasm`),r=G();return function(e,i){return async function(){let{Jsv_GetError_import:a,JsvError_Check:o}=await r;e.env.Jsv_GetError_import=a,e.env.JsvError_Check=o;try{let r;r=n?await WebAssembly.instantiateStreaming(n,e):await WebAssembly.instantiate(await t,e);let{instance:a,module:o}=r;i(a,o)}catch(e){console.warn(`wasm instantiation failed!`),console.warn(e)}}(),{}}}d(me,`getInstantiateWasmFunc`);var he=`314.0.8`;function Y(e){return e===void 0||e.endsWith(`/`)?e:e+`/`}d(Y,`withTrailingSlash`);var ge=he;async function _e(e={}){if(await A(),e.lockFileContents&&e.lockFileURL)throw Error(`Can't pass both lockFileContents and lockFileURL`);let t=e.indexURL||await H();if(t=Y(N(t)),e.packageBaseUrl=Y(e.packageBaseUrl),e.cdnUrl=Y(e.packageBaseUrl??`https://cdn.jsdelivr.net/pyodide/v314.0.8/full/`),!e.lockFileContents){let n=e.lockFileURL??t+`pyodide-lock.json`;e.lockFileContents=V(n),e.packageBaseUrl??=U(n)}e.indexURL=t,e.packageCacheDir&&=Y(N(e.packageCacheDir));let n={jsglobals:globalThis,stdin:globalThis.prompt?()=>globalThis.prompt():void 0,args:[],env:{},packages:[],packageCacheDir:e.packageBaseUrl,enableRunUntilComplete:!0,checkAPIVersion:!0,BUILD_ID:`1e170351f97e56f0814b6a94f77bf4f6ec7d8835c8b8b26c6b5282c473979fc3`},r=Object.assign(n,e);return r.env.HOME??=`/home/pyodide`,r.env.PYTHONINSPECT??=`1`,r}d(_e,`initializeConfiguration`);function ve(e){let t=ue(e),n=t.API;return n.lockFilePromise=Promise.resolve(e.lockFileContents),t}d(ve,`createEmscriptenSettings`);async function ye(e){return e.createPyodideModule?e.createPyodideModule:(await oe(`${e.indexURL}pyodide.asm.mjs`)).default}d(ye,`loadWasmScript`);async function be(e,t){if(!e._loadSnapshot)return;let n=await e._loadSnapshot,r=ArrayBuffer.isView(n)?n:new Uint8Array(n);return t.noInitialRun=!0,t.INITIAL_MEMORY=r.length,r}d(be,`prepareSnapshot`);async function xe(e,t){let n=await e(t);if(t.exitCode!==void 0)throw new n.ExitStatus(t.exitCode);return n}d(xe,`instantiatePyodideModule`);function Se(e,t){let n=e.API;if(t.pyproxyToStringRepr&&n.setPyProxyToStringMethod(!0),t.convertNullToNone&&n.setCompatNullToNone(!0),t.toJsLiteralMap&&n.setCompatToJsLiteralMap(!0),n.version!==`314.0.8`&&t.checkAPIVersion)throw Error(`Pyodide version does not match: '${ge}' <==> '${n.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);e.locateFile=e=>{throw e.endsWith(`.so`)?/* @__PURE__ */ Error(`Failed to find dynamic library "${e}"`):/* @__PURE__ */ Error(`Unexpected call to locateFile("${e}")`)}}d(Se,`configureAPI`);function Ce(e,t,n){let r=e.API,i;return t&&(i=r.restoreSnapshot(t)),r.finalizeBootstrap(i,n._snapshotDeserializer)}d(Ce,`bootstrapPyodide`);async function X(e,t){let n=e._api;return n.sys.path.insert(0,``),n._pyodide.set_excepthook(),await n.packageIndexReady,n.initializeStreams(t.stdin,t.stdout,t.stderr),e}d(X,`finalizeSetup`);async function we(e={}){let t=await _e(e),n=ve(t),r=await ye(t),i=await be(t,n),a=await xe(r,n);return Se(a,t),await X(Ce(a,i,t),t)}d(we,`loadPyodide`);var Te=`import sys
import io
import copy
import json
import math
import time
import traceback
import builtins
from collections import Counter


def _extract_student_line(exc):
    if isinstance(exc, SyntaxError) and exc.lineno is not None:
        return int(exc.lineno)
    tb = exc.__traceback__
    line_no = None
    for frame in traceback.extract_tb(tb):
        if frame.filename == "<student_code>":
            line_no = int(frame.lineno)
    return line_no


def _safe_repr(val, max_len=240):
    try:
        r = repr(val)
    except Exception:
        return "<unprintable>"
    if len(r) > max_len:
        return r[: max_len - 14] + "... (truncated)"
    return r


def _deep_exact_equal(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if isinstance(a, float) and isinstance(b, float):
        if math.isnan(a) or math.isnan(b):
            return math.isnan(a) and math.isnan(b)
        return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if type(a) is not type(b) or len(a) != len(b):
            return False
        return all(_deep_exact_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b) or set(a.keys()) != set(b.keys()):
            return False
        return all(_deep_exact_equal(a[k], b[k]) for k in a)
    if isinstance(a, set) and isinstance(b, set):
        return len(a) == len(b) and a == b
    if type(a) is not type(b):
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return a == b
        return False
    return a == b


def _hash_key(val):
    if isinstance(val, bool):
        return ("bool", val)
    if isinstance(val, (int, float)):
        if isinstance(val, float) and math.isnan(val):
            return ("nan",)
        return ("num", val)
    if isinstance(val, tuple):
        return ("tuple", tuple(_hash_key(x) for x in val))
    return (type(val).__name__, val)


def _deep_unordered_equal(a, b):
    if isinstance(a, set) and isinstance(b, set):
        return a == b
    if not isinstance(a, (list, tuple)) or not isinstance(b, (list, tuple)):
        return _deep_exact_equal(a, b)
    if type(a) is not type(b) or len(a) != len(b):
        return False
    try:
        return Counter(_hash_key(x) for x in a) == Counter(_hash_key(y) for y in b)
    except TypeError:
        used = [False] * len(b)
        for item_a in a:
            matched = False
            for idx, item_b in enumerate(b):
                if not used[idx] and _deep_exact_equal(item_a, item_b):
                    used[idx] = True
                    matched = True
                    break
            if not matched:
                return False
        return True


def _deep_float_equal(a, b, tol):
    if isinstance(a, bool) or isinstance(b, bool):
        return False
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if math.isnan(a) or math.isnan(b):
            return math.isnan(a) and math.isnan(b)
        if math.isinf(a) or math.isinf(b):
            return a == b
        return abs(a - b) <= tol
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if type(a) is not type(b) or len(a) != len(b):
            return False
        return all(_deep_float_equal(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b) or set(a.keys()) != set(b.keys()):
            return False
        return all(_deep_float_equal(a[k], b[k], tol) for k in a)
    return _deep_exact_equal(a, b)


def _compare_values(actual, expected, compare_spec, orig_args, checker_code):
    if compare_spec == "exact":
        return _deep_exact_equal(actual, expected), None
    if compare_spec == "unordered":
        return _deep_unordered_equal(actual, expected), None
    if isinstance(compare_spec, dict) and "float" in compare_spec:
        tol = float(compare_spec["float"])
        return _deep_float_equal(actual, expected, tol), None
    if isinstance(compare_spec, dict) and "checker" in compare_spec:
        if not checker_code:
            return False, "Missing checker.py implementation."
        checker_ns = {"__name__": "__checker__"}
        compiled = compile(checker_code, "<checker>", "exec")
        exec(compiled, checker_ns)
        check_fn = checker_ns.get("check")
        if not callable(check_fn):
            return False, "checker.py must define check(args, actual, expected)."
        try:
            res = check_fn(copy.deepcopy(orig_args), actual, copy.deepcopy(expected))
        except AssertionError as exc:
            return False, str(exc) or "Checker assertion failed."
        if isinstance(res, tuple) and len(res) == 2:
            return bool(res[0]), str(res[1]) if not res[0] else None
        return bool(res), None if res else "Output did not satisfy problem checker."
    return False, f"Unsupported compare mode: {compare_spec}"


def prepare_problem_run(source_code, inputs=None, datasets=None):
    if datasets:
        for fname, content in datasets.items():
            with open(fname, "w", encoding="utf-8") as fh:
                fh.write(content)

    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    old_input = builtins.input

    input_iter = iter(list(inputs or []))

    def _custom_input(prompt=""):
        if prompt:
            sys.stdout.write(str(prompt))
        try:
            val = next(input_iter)
            sys.stdout.write(str(val) + "\\n")
            return str(val)
        except StopIteration:
            raise EOFError("No more pre-supplied inputs available for input().")

    ns = {"__name__": "__main__"}
    ok = True
    error = ""
    error_type = ""
    error_line = None

    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf
        builtins.input = _custom_input
        compiled = compile(source_code, "<student_code>", "exec")
        exec(compiled, ns)
    except SyntaxError as exc:
        ok = False
        error_type = type(exc).__name__
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    except Exception as exc:
        ok = False
        error_type = type(exc).__name__
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        builtins.input = old_input

    return ns, {
        "ok": ok,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "error": error,
        "errorType": error_type,
        "errorLine": error_line,
    }


def run_problem_test(ns, entry, compare, test_spec, checker_code=None):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    t0 = time.perf_counter()
    status = "Passed"
    passed = False
    error = ""
    error_type = ""
    error_line = None
    input_repr = ""
    expected_repr = ""
    actual_repr = ""

    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf

        if entry["type"] == "function":
            fn_name = entry["name"]
            fn = ns.get(fn_name)
            if not callable(fn):
                status = "Runtime Error"
                error_type = "NameError"
                error = f"NameError: Required function '{fn_name}' is not defined."
            else:
                eval_env = {"__builtins__": builtins}
                if test_spec.get("argsExpr") is not None:
                    raw_args = eval(test_spec["argsExpr"], eval_env)
                    if isinstance(raw_args, tuple):
                        raw_args = list(raw_args)
                    elif not isinstance(raw_args, list):
                        raise ValueError("Test argsExpr must evaluate to a tuple or list of positional arguments.")
                else:
                    raw_args = list(test_spec.get("args") or [])

                orig_args = copy.deepcopy(raw_args)
                call_args = copy.deepcopy(raw_args)

                if test_spec.get("expectedExpr") is not None:
                    expected = eval(test_spec["expectedExpr"], eval_env)
                else:
                    expected = copy.deepcopy(test_spec.get("expected"))

                input_repr = ", ".join(_safe_repr(a, 140) for a in orig_args)
                expected_repr = _safe_repr(expected)

                try:
                    actual = fn(*call_args)
                except Exception as exc:
                    status = "Runtime Error"
                    error_type = type(exc).__name__
                    error_line = _extract_student_line(exc)
                    error = traceback.format_exc()
                else:
                    actual_repr = _safe_repr(actual)
                    checks = test_spec.get("checks") or []
                    if "inputUnchanged" in checks and not _deep_exact_equal(call_args, orig_args):
                        status = "Wrong Answer"
                        error = "Input argument was mutated in place (expected input to remain unchanged)."
                    else:
                        ok, reason = _compare_values(
                            actual, expected, compare, orig_args, checker_code
                        )
                        if ok:
                            status = "Passed"
                            passed = True
                        else:
                            status = "Wrong Answer"
                            error = reason or f"Expected {expected_repr}, got {actual_repr}"

        elif entry["type"] == "script":
            test_ns = dict(ns)
            input_repr = test_spec.get("inputDisplay") or ""
            expected_repr = test_spec.get("expectedDisplay") or "All assertions pass"
            compiled_test = compile(test_spec["script"], "<test_script>", "exec")
            try:
                exec(compiled_test, test_ns)
                status = "Passed"
                passed = True
                actual_repr = "Passed"
            except AssertionError as exc:
                status = "Wrong Answer"
                error_type = "AssertionError"
                error = str(exc) or traceback.format_exc()
                actual_repr = "Assertion failed"
            except Exception as exc:
                status = "Runtime Error"
                error_type = type(exc).__name__
                error_line = _extract_student_line(exc)
                error = traceback.format_exc()
                actual_repr = f"{error_type}: {exc}"
        else:
            status = "Runtime Error"
            error = f"Unknown entry type: {entry.get('type')}"
    except Exception as exc:
        status = "Runtime Error"
        error_type = type(exc).__name__
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 3)

    return {
        "label": test_spec.get("label", "Test"),
        "status": status,
        "passed": passed,
        "runtimeMs": elapsed_ms,
        "inputRepr": input_repr,
        "expectedRepr": expected_repr,
        "actualRepr": actual_repr,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "error": error or None,
        "errorType": error_type or None,
        "errorLine": error_line,
    }


def run_problem_custom(ns, entry, custom_text):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    t0 = time.perf_counter()
    ok = True
    return_repr = ""
    error = ""
    error_line = None

    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf
        trimmed = (custom_text or "").strip()

        if entry["type"] == "function":
            fn_name = entry["name"]
            fn = ns.get(fn_name)
            if not callable(fn):
                raise NameError(f"Required function '{fn_name}' is not defined.")
            if trimmed == "":
                args = ()
            else:
                val = eval(trimmed, dict(ns))
                if isinstance(val, tuple):
                    args = val
                else:
                    args = (val,)
            call_args = copy.deepcopy(list(args))
            res = fn(*call_args)
            return_repr = _safe_repr(res, 500)
        else:
            custom_ns = dict(ns)
            compiled = compile(trimmed, "<custom_input>", "exec")
            exec(compiled, custom_ns)
            return_repr = "Executed snippet"
    except SyntaxError as exc:
        ok = False
        error_line = exc.lineno if exc.filename == "<student_code>" else None
        error = traceback.format_exc()
    except Exception as exc:
        ok = False
        error_line = _extract_student_line(exc)
        error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 3)
    return {
        "ok": ok,
        "runtimeMs": elapsed_ms,
        "returnRepr": return_repr,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "error": error or None,
        "errorLine": error_line,
    }
`;let Z=null,Q=``,Ee=!1;async function De(){return Z||(Z=await we({indexURL:`/pyodide/`,packageBaseUrl:`https://cdn.jsdelivr.net/pyodide/v${ge}/full/`}),Q=Z.runPython(`import sys; f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"`),Z)}function $(e){Ee||=(e.runPython(Te),!0)}self.onmessage=async e=>{let t=e.data;try{let e=await De();if(t.type===`init`){let e={id:t.id,type:`init`,ok:!0,pythonVersion:Q,stdout:``,stderr:``};self.postMessage(e);return}if(t.type===`loadPackages`){t.packages.length>0&&await e.loadPackage(t.packages);let n={id:t.id,type:`loadPackages`,ok:!0,pythonVersion:Q,stdout:``,stderr:``};self.postMessage(n);return}if(t.type===`prepareProblem`){$(e),e.globals.set(`__pdp_prep_payload__`,JSON.stringify({code:t.code,inputs:t.inputs??[],datasets:t.datasets??null}));let n=e.runPython(`
import json
_payload = json.loads(__pdp_prep_payload__)
__pdp_problem_ns__, _prep_res = prepare_problem_run(
    _payload["code"],
    _payload.get("inputs"),
    _payload.get("datasets"),
)
json.dumps(_prep_res)
`),r=JSON.parse(n);self.postMessage({id:t.id,type:`prepareProblem`,ok:r.ok,pythonVersion:Q,stdout:r.stdout,stderr:r.stderr,error:r.error||void 0,errorType:r.errorType||void 0,errorLine:r.errorLine});return}if(t.type===`runProblemTest`){$(e),e.globals.set(`__pdp_test_payload__`,JSON.stringify({entry:t.entry,compare:t.compare,test:t.test,checkerCode:t.checkerCode??null}));let n=e.runPython(`
import json
_t_payload = json.loads(__pdp_test_payload__)
_t_res = run_problem_test(
    __pdp_problem_ns__,
    _t_payload["entry"],
    _t_payload["compare"],
    _t_payload["test"],
    _t_payload.get("checkerCode"),
)
json.dumps(_t_res)
`),r=JSON.parse(n);self.postMessage({id:t.id,type:`runProblemTest`,ok:r.passed,pythonVersion:Q,stdout:r.stdout,stderr:r.stderr,problemTestResult:r});return}if(t.type===`runProblemCustom`){$(e),e.globals.set(`__pdp_custom_payload__`,JSON.stringify({code:t.code,entry:t.entry,customInput:t.customInput,inputs:t.inputs??[]}));let n=e.runPython(`
import json
_c_payload = json.loads(__pdp_custom_payload__)
_c_ns, _c_prep = prepare_problem_run(_c_payload["code"], _c_payload.get("inputs"))
if not _c_prep["ok"]:
    _out = {
        "ok": False,
        "runtimeMs": 0.0,
        "returnRepr": "",
        "stdout": _c_prep["stdout"],
        "stderr": _c_prep["stderr"],
        "error": _c_prep["error"],
        "errorLine": _c_prep["errorLine"],
    }
else:
    _out = run_problem_custom(_c_ns, _c_payload["entry"], _c_payload["customInput"])
    _out["stdout"] = (_c_prep["stdout"] or "") + (_out.get("stdout") or "")
json.dumps(_out)
`),r=JSON.parse(n);self.postMessage({id:t.id,type:`runProblemCustom`,ok:r.ok,pythonVersion:Q,stdout:r.stdout,stderr:r.stderr,error:r.error||void 0,errorLine:r.errorLine,customResult:r});return}if(t.type===`run`){if(t.datasets)for(let[n,r]of Object.entries(t.datasets))e.FS.writeFile(n,r,{encoding:`utf8`});e.globals.set(`__pdp_code__`,t.code),e.globals.set(`__pdp_test_code__`,t.testCode??``),e.globals.set(`__pdp_inputs__`,e.toPy(t.inputs??[]));let n=e.runPython(`
import sys, io, json, traceback, builtins

__pdp_stdout__ = io.StringIO()
__pdp_stderr__ = io.StringIO()
__pdp_old_stdout__ = sys.stdout
__pdp_old_stderr__ = sys.stderr
__pdp_old_input__ = builtins.input

__pdp_input_iter__ = iter(list(__pdp_inputs__))

def __pdp_custom_input__(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
    try:
        val = next(__pdp_input_iter__)
        sys.stdout.write(str(val) + "\\n")
        return str(val)
    except StopIteration:
        raise EOFError("No more pre-supplied inputs available for input().")

sys.stdout = __pdp_stdout__
sys.stderr = __pdp_stderr__
builtins.input = __pdp_custom_input__

__pdp_ns__ = {"__name__": "__main__"}
__pdp_ok__ = True
__pdp_error__ = ""
__pdp_test_passed__ = None
__pdp_test_error__ = ""

try:
    compiled = compile(__pdp_code__, "<student_code>", "exec")
    exec(compiled, __pdp_ns__)
except Exception:
    __pdp_ok__ = False
    __pdp_error__ = traceback.format_exc()

if __pdp_ok__ and __pdp_test_code__:
    try:
        compiled_tests = compile(__pdp_test_code__, "<tests>", "exec")
        exec(compiled_tests, __pdp_ns__)
        __pdp_test_passed__ = True
    except Exception:
        __pdp_test_passed__ = False
        __pdp_test_error__ = traceback.format_exc()

sys.stdout = __pdp_old_stdout__
sys.stderr = __pdp_old_stderr__
builtins.input = __pdp_old_input__

json.dumps({
    "ok": __pdp_ok__,
    "stdout": __pdp_stdout__.getvalue(),
    "stderr": __pdp_stderr__.getvalue(),
    "error": __pdp_error__,
    "testPassed": __pdp_test_passed__,
    "testError": __pdp_test_error__,
})
`),r=JSON.parse(n),i={id:t.id,type:`run`,ok:r.ok,pythonVersion:Q,stdout:r.stdout,stderr:r.stderr,error:r.error||void 0,testPassed:r.testPassed===null?void 0:r.testPassed,testError:r.testError||void 0};self.postMessage(i)}}catch(e){let n={id:t.id,type:t.type,ok:!1,stdout:``,stderr:``,error:e instanceof Error?e.message:String(e)};self.postMessage(n)}};export{o as t};
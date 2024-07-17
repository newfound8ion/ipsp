"use strict";(self.webpackChunkdeveloper_newcoin_org_2=self.webpackChunkdeveloper_newcoin_org_2||[]).push([[92],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>v});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),l=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=l(e.components);return n.createElement(s.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),u=l(r),f=o,v=u["".concat(s,".").concat(f)]||u[f]||d[f]||a;return r?n.createElement(v,i(i({ref:t},p),{},{components:r})):n.createElement(v,i({ref:t},p))}));function v(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=f;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c[u]="string"==typeof e?e:o,i[1]=c;for(var l=2;l<a;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},1958:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>d,frontMatter:()=>a,metadata:()=>c,toc:()=>l});var n=r(7462),o=(r(7294),r(3905));const a={},i=void 0,c={unversionedId:"guides/joke-vote-race/joke-vote",id:"guides/joke-vote-race/joke-vote",title:"joke-vote",description:"Step 1: Setting Up the JokeVote Contract",source:"@site/docs/guides/joke-vote-race/joke-vote.md",sourceDirName:"guides/joke-vote-race",slug:"/guides/joke-vote-race/joke-vote",permalink:"/docs/guides/joke-vote-race/joke-vote",draft:!1,editUrl:"https://github.com/newfound8ion/ipsp/edit/main/docs/guides/joke-vote-race/joke-vote.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/docs/guides/joke-vote-race/introduction"},next:{title:"joke-and-checker",permalink:"/docs/guides/joke-vote-race/joke-and-checker"}},s={},l=[{value:"<strong>Step 1: Setting Up the JokeVote Contract</strong>",id:"step-1-setting-up-the-jokevote-contract",level:3}],p={toc:l},u="wrapper";function d(e){let{components:t,...r}=e;return(0,o.kt)(u,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h3",{id:"step-1-setting-up-the-jokevote-contract"},(0,o.kt)("strong",{parentName:"h3"},"Step 1: Setting Up the JokeVote Contract")),(0,o.kt)("p",null,"In the JokeVote contract, we will mock the jokerace contract to allow users to cast a vote for a joke and verify the total votes cast by the sender."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"A. Implementing Vote Casting")),(0,o.kt)("p",null,"We need a way for users to cast a vote. The ",(0,o.kt)("inlineCode",{parentName:"p"},"castVote")," function allows an address to cast a vote if it has not done so before."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},'function castVote() external {\n    require(!hasVoted[msg.sender], "Already voted");\n    hasVoted[msg.sender] = true;\n    emit VoteCast(msg.sender);\n}\n')),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"B. Implementing Vote Verification")),(0,o.kt)("p",null,"We also need a way to check if the sender has verified votes."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},"function addressTotalVotesVerified() external view returns (bool) {\n    return hasVoted[tx.origin];\n}\n")))}d.isMDXComponent=!0}}]);
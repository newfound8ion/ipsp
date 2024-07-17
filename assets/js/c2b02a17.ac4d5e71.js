"use strict";(self.webpackChunkdeveloper_newcoin_org_2=self.webpackChunkdeveloper_newcoin_org_2||[]).push([[2727],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>f});var i=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,i,o=function(e,t){if(null==e)return{};var n,i,o={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=i.createContext({}),s=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},u=function(e){var t=s(e.components);return i.createElement(l.Provider,{value:t},e.children)},d="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},h=i.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),d=s(n),h=o,f=d["".concat(l,".").concat(h)]||d[h]||p[h]||a;return n?i.createElement(f,r(r({ref:t},u),{},{components:n})):i.createElement(f,r({ref:t},u))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,r=new Array(a);r[0]=h;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c[d]="string"==typeof e?e:o,r[1]=c;for(var s=2;s<a;s++)r[s]=n[s];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}h.displayName="MDXCreateElement"},161:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>r,default:()=>p,frontMatter:()=>a,metadata:()=>c,toc:()=>s});var i=n(7462),o=(n(7294),n(3905));const a={},r="Step 1: Stubbing the Contract",c={unversionedId:"guides/gitcoin-chainlink-guild/stubbing-the-contract",id:"guides/gitcoin-chainlink-guild/stubbing-the-contract",title:"Step 1: Stubbing the Contract",description:"A. Define the Activation Function Interface",source:"@site/docs/guides/gitcoin-chainlink-guild/stubbing-the-contract.md",sourceDirName:"guides/gitcoin-chainlink-guild",slug:"/guides/gitcoin-chainlink-guild/stubbing-the-contract",permalink:"/docs/guides/gitcoin-chainlink-guild/stubbing-the-contract",draft:!1,editUrl:"https://github.com/newfound8ion/ipsp/edit/main/docs/guides/gitcoin-chainlink-guild/stubbing-the-contract.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/docs/guides/gitcoin-chainlink-guild/introduction"},next:{title:"Step 2: Implementing Activation Function and Oracle Request Logic",permalink:"/docs/guides/gitcoin-chainlink-guild/implementing-function-oracle"}},l={},s=[{value:"A. Define the Activation Function Interface",id:"a-define-the-activation-function-interface",level:2},{value:"B. Contract Setup &amp; Variable Declarations",id:"b-contract-setup--variable-declarations",level:2},{value:"Conclusion of Step 1:",id:"conclusion-of-step-1",level:2}],u={toc:s},d="wrapper";function p(e){let{components:t,...n}=e;return(0,o.kt)(d,(0,i.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"step-1-stubbing-the-contract"},"Step 1: Stubbing the Contract"),(0,o.kt)("h2",{id:"a-define-the-activation-function-interface"},"A. Define the Activation Function Interface"),(0,o.kt)("p",null,"Newcoin's encoder communicates with activation functions using a predefined interface. The activation function checks certain conditions and informs the encoder if they are satisfied."),(0,o.kt)("p",null,"The encoder holds two types of interfaces for us to inherit for our AFs. One for synchronous or one for asynchronous functions using Oracles.\nWe are going to use an oracle and therefore using the Asynchronous. For our example we will redefine the interface here:"),(0,o.kt)("p",null,"IActivationFunctionAsync:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},"interface IActivationFunctionAsync {\n    function activate(uint256 _activationFunctionId) external;\n}\n")),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"activate: This function will be called by the encoder. It needs to check the condition (e.g., Guild membership) and notify the encoder of the outcome.\nThe ","_","activationFunctionId is what we will get when we successfully register the function with the Encoder and will be passed from the encoder to the activate function internally")),(0,o.kt)("h2",{id:"b-contract-setup--variable-declarations"},"B. Contract Setup & Variable Declarations"),(0,o.kt)("p",null,"Now, let\u2019s stub out the GuildPassport contract which implements IActivationFunctionAsync and uses Chainlink to query Guild.xyz's API:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-solidity"},'contract GuildPassport is IActivationFunctionAsync, ChainlinkClient, ConfirmedOwner {\n    using Chainlink for Chainlink.Request;\n\n    address private oracleAddress;\n    bytes32 private jobId;\n    uint256 private fee;\n    address private callback;\n    uint256 private activationFunctionId;\n\n    mapping(address => bool) public passportHolders;\n    mapping(address => uint256) public pendingActivations;\n\n    constructor() ConfirmedOwner(msg.sender) {\n        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);\n        setOracleAddress(0x0FaCf846af22BCE1C7f88D1d55A038F27747eD2B);\n        setJobId("43309009a154495cb2ed794233e6ff56");\n        setFeeInHundredthsOfLink(0);     // 0 LINK\n    }\n\n}\n')),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"ChainlinkClient and ConfirmedOwner are inherited from Chainlink contracts and help in interacting with Chainlink oracles and confirming contract ownership, respectively."),(0,o.kt)("li",{parentName:"ul"},"passportHolders: A mapping to track addresses that have already minted WATTs (to avoid double minting)."),(0,o.kt)("li",{parentName:"ul"},"pendingActivations: A mapping for pending activations for reference for current pending oracle requests"),(0,o.kt)("li",{parentName:"ul"},"oracleAddress, jobId, and fee are specific to the Chainlink setup and need to be configured based on your Chainlink node and job."),(0,o.kt)("li",{parentName:"ul"},"callback will store the address of the contract which will be notified once the condition check is complete."),(0,o.kt)("li",{parentName:"ul"},"activationFunctionId helps identify which activation function is being processed."),(0,o.kt)("li",{parentName:"ul"},"The Oracle Address is the oracle we can use for the chain we are based on. This address is for Eth Sepolia"),(0,o.kt)("li",{parentName:"ul"},"The Job id is for the type of data we need back. This job id is associted with a bool, which we need for this case")),(0,o.kt)("h2",{id:"conclusion-of-step-1"},"Conclusion of Step 1:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"We've defined the interface (IActivationFunctionAsync) to structure communication between the encoder, activation function, and any callbacks."),(0,o.kt)("li",{parentName:"ul"},"We've stubbed out the GuildPassport contract, which checks Guild membership using Chainlink to query Guild.xyz\u2019s API."),(0,o.kt)("li",{parentName:"ul"},"The constructor initializes the contract with Chainlink parameters.")),(0,o.kt)("p",null,"In the next steps, we\u2019ll dive into implementing the logic of sending a request to Guild.xyz via Chainlink and handling the response to communicate back to the encoder. This will encapsulate validating if the condition of the activation function is met and interacting with Newcoin's Encoder to mint WATTs when appropriate."))}p.isMDXComponent=!0}}]);
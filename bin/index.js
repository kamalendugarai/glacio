#!/usr/bin/env node
const fs=require("fs"),path=require("path"),colors=require("colors"),minimist=require("minimist"),buildOptions=require("minimist-options"),sharp=require("sharp"),figlet=require("figlet"),center=require("center-align"),cliProgress=require("cli-progress"),inquirer=require("inquirer"),listdirs=require("listdirs"),basedir=".";let generateFolderNames,allDirectories=[],options=[];options=buildOptions({inputImagePath:{type:"string",alias:"i",index:0},distImagePath:{type:"string",alias:["d","distImagePath"]},imageTypes:{type:"array",alias:"t"},imageQualitis:{type:"array",alias:"q"},help:{type:"string",alias:"h"}});const argv=minimist(process.argv.slice(2),options);let cp,count=0;figlet("GLACIO",{font:"Alligator"},((e,o)=>{e&&(console.log(colors.red(center("Something went wrong...",process.stdout.columns))),console.dir(colors.red(center(e,process.stdout.columns)))),console.log(colors.cyan(center(o,process.stdout.columns))),generateFolderNames()}));const questions=()=>[{type:"list",name:"inputImagePath",message:`Select the ${colors.yellow("source")} image folder path`,choices:allDirectories},{type:"list",name:"distImagePath",message:`Select the ${colors.yellow("destination")} image folder path`,choices:allDirectories},{type:"checkbox",message:`Select ${colors.yellow("image types")} to convert`,name:"imageTypes",choices:[{name:"webp",checked:!0},{name:"avif",checked:!0},{name:"jpg"},{name:"png"}]},{type:"input",message:`${colors.yellow("optimization qualities")} for image types(Comma separated)`,name:"imageQualitis",default:"80,60,60,60"}];generateFolderNames=()=>{listdirs(".",((e,o)=>{e?console.log(colors.red(e)):(allDirectories=o,-1!=Object.keys(argv).indexOf("h")?(console.log(""),console.log(`${colors.green("-i, --inputImagePath")} Source image folder path.`),console.log(`${colors.green("-d, --distImagePath")}  Destination image folder path`),console.log(`${colors.green("-t, --imageTypes")}     Image tupes to convert (webp|avif|png|jpg).`),console.log(`${colors.green("-q, --imageQualitis")}  Quality of the chosen image types (comma separated).`),console.log("")):inquire(questions))}),["node_modules",".git"])};const generateImages=e=>{const o={};let t=0;fs.readdirSync(e.inputImagePath).map(((t,i)=>{-1!=t.search(/\.(jpe?g|png|gif|svg)$/)&&e.imageTypes.map((i=>{const s=path.join(e.inputImagePath,`/${t}`),r=path.join(e.distImagePath,`/${t.split(".")[0]}.${i.trim()}`);fs.existsSync(r)||(o[i]||(o[i]=[]),o[i].push({ip:s,op:r}))}))})),t=(o.webp?o.webp.length:0)+(o.avif?o.avif.length:0);const i=e=>{e>count&&count++,count===e&&(cp&&cp.stop(),console.log(""))};t?(console.log(""),cp=new cliProgress.SingleBar({barsize:55,format:`${colors.yellow("progress")} ${colors.cyan("[{bar}]")} ${colors.yellow("{percentage}%")} | ${colors.yellow("ETA: {eta}s")} | ${colors.yellow("{value}/{total}")}`},cliProgress.Presets.shades_classic),cp.start(t,0)):(console.log(colors.yellow("===============================================")),console.log(colors.cyan(" There is not any pending image to convert!!")),console.log(colors.yellow("===============================================")));let s=0;Object.keys(o).forEach((r=>{o[r].map(((o,a)=>{"avif"==r.trim()&&sharp(o.ip).avif({quality:parseInt(e.imageQualitis.split(",")[s].trim(),10)}).toFile(o.op).then((e=>{cp&&cp.increment(),i(t)})).catch((e=>{console.log(e)})),"webp"==r.trim()&&sharp(o.ip).webp({quality:parseInt(e.imageQualitis.split(",")[s].trim(),10)}).toFile(o.op).then((e=>{cp&&cp.increment(),i(t)})).catch((e=>{console.log(e)})),"jpg"==r.trim()&&sharp(o.ip).jpg({quality:parseInt(e.imageQualitis.split(",")[s].trim(),10)}).toFile(o.op).then((e=>{cp&&cp.increment(),i(t)})).catch((e=>{console.log(e)})),"png"==r.trim()&&sharp(o.ip).png({quality:parseInt(e.imageQualitis.split(",")[s].trim(),10)}).toFile(o.op).then((e=>{cp&&cp.increment(),i(t)})).catch((e=>{console.log(e)}))})),s+=1}))},callGenerateImage=(e,o)=>{o.imageTypes&&(o.imageTypes=o.imageTypes.split(",")),generateImages({...e,...o})},inquire=e=>{let o=e();o=o.map((e=>{if(!argv[e.name])return e})).filter(Boolean),o.length?inquirer.prompt([...o]).then((e=>{callGenerateImage(e,argv)})).catch((e=>{e.isTtyError?console.log(colors.red("Prompt couldn't be rendered in the current environment",e)):console.log(colors.red("Something went wrong. ",e))})):callGenerateImage([],argv)};
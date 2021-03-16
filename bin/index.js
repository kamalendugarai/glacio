#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const minimist = require('minimist');
const buildOptions = require('minimist-options');
const sharp = require('sharp');
const figlet = require('figlet');
const { exec } = require("child_process");
const center = require('center-align');
const cliProgress = require('cli-progress');
const inquirer = require('inquirer');
const listdirs = require('listdirs');

const basedir  = "."; // or which ever base directory you prefer
let allDirectories=[];

let options = [];
options = buildOptions({
	inputImagePath: {
		type: 'string',
    alias:'i',
    index:0
	},
  distImagePath: {
		type: 'string',
    alias:['d', 'distImagePath'],
	},
  imageTypes:{
    type:'array',
    alias:'t',
  },
  imageQualitis:{
    type:'array',
    alias:'q',
  },
  help:{
    type:'string',
    alias:'h'
  }
});


let argv = minimist(process.argv.slice(2),options);

/**Sharp callback */
// sharp.queue.on('change', function(queueLength) {
//   // console.log('Queue contains ' + queueLength + ' task(s)');

// });


/*Monogram*/
figlet('GLACIO', {
    font: 'Alligator'
  }, function (err, data) {
    if (err) {
      console.log(chalk.red(center('Something went wrong...', process.stdout.columns)));
      console.dir(chalk.red(center(err, process.stdout.columns)));
    }
    console.log(chalk.cyan(center(data, process.stdout.columns)));
});



const questions = ()=>[
    {
        type: 'list',
        name: 'inputImagePath',
        message: `Select the ${chalk.yellow("source")} image folder path`,
        choices: allDirectories
    },
    {
        type:'list',
        name:'distImagePath',
        message:`Select the ${chalk.yellow("destination")} image folder path`,
        choices: allDirectories
    },
    {
        type: 'checkbox',
        message: `Select ${chalk.yellow("image types")} to convert`,
        name: 'imageTypes',
        choices: [
          {
            name: ' webp',
            checked:true
          },
          {
            name: ' avif',
            checked:true
          },
          {
            name: ' jpg',
          },
          {
            name: ' png',
          }
        ]
    },
    {
      type:'input',
      message:`${chalk.yellow("optimization qualities")} for image types(Comma separated)`,
      name:'imageQualitis',
      default:'80,60,60,60'
    }
];
/** Call generateImage*/
let callGenerateImage = (answers, argv)=>{
  argv.imageTypes && (argv.imageTypes = argv.imageTypes.split(","));
  let final_ans = {...answers, ...argv};
       generateImages(final_ans);
}

/** InQueries made */
// console.clear();
/**Inquiries generation */
const inquire = (questions) =>{
  let quest = questions();

  /**Removing questions accordingly */
  quest = quest.map(qm=>{
    if(!argv[qm.name]){
      return qm;
    }
  }).filter(Boolean);

quest.length ?
    inquirer
    .prompt([...quest])
    .then(answers => {
       callGenerateImage(answers, argv);
    })
    .catch(error => {
      if(error.isTtyError) {
        console.log(chalk.red("Prompt couldn't be rendered in the current environment", error))
      } else {
        console.log(chalk.red("Something went wrong. ", error))
      }
    })
    :
    callGenerateImage([], argv);
    // !quest.length &&
};

/** Generating folder names for choices */
listdirs(basedir, function callback(err, list){
    if(err){
      console.log(chalk.red(err)); // handle errors in your preferred way.
    }
    else {
        allDirectories = list; // use the array of directories as required.
        if(Object.keys(argv).indexOf('h') != -1){
          console.log("");
          console.log(`${chalk.green("-i, --inputImagePath")} Source image folder path.`);
          console.log(`${chalk.green("-d, --distImagePath")}  Destination image folder path`);
          console.log(`${chalk.green("-t, --imageTypes")}     Image tupes to convert (webp|avif|png|jpg).`);
          console.log(`${chalk.green("-q, --imageQualitis")}  Quality of the chosen image types (comma separated).`);
          console.log("");
        }else{          
          inquire(questions);        
        }
    }
}, ['node_modules', '.git']);

/** Generate Images*/
const generateImages = (answers) =>{
    let images ={};
    let all_images = fs.readdirSync(answers.inputImagePath);
    all_images.map((fl, i) => {
        if (fl.search(/\.(jpe?g|png|gif|svg)$/) != -1) {
          answers.imageTypes.map(it=>{
            let ip = path.join(answers.inputImagePath, `/${fl}`);
            let op = path.join(answers.distImagePath, `/${fl.split(".")[0]}.${it.trim()}`);
            if(!fs.existsSync(op)){
              images[it]? images[it].push({ip,op}):(images[it]=[], images[it].push({ip,op}))
            }
          })
        };
      });
var index_of_type=0;
    for(item in images ){
      images[item].map((tp,i)=>{
        if(item.trim() == "avif"){
          sharp(tp.ip)
          
          .avif({quality:parseInt(answers.imageQualitis.split(",")[index_of_type].trim())}).toFile(tp.op)
          .then((resp)=>{
            // console.log(resp)
          })
          .catch((err)=>{
            console.log(err)
          });
        }
        if(item.trim() == "webp"){
          sharp(tp.ip)
              .webp({quality:parseInt(answers.imageQualitis.split(",")[i].trim())}).toFile(tp.op)
              .then((resp)=>{
                // console.log(resp)
              })
              .catch((err)=>{
                console.log(err)
              });
        };
       
        if(item.trim() == "jpg"){
          sharp(tp.ip)
              .jpg({quality:parseInt(answers.imageQualitis.split(",")[i].trim())}).toFile(tp.op)
              .then((resp)=>{
                // console.log(resp)
              })
              .catch((err)=>{
                console.log(err)
              });
        };
        if(item.trim() == "png"){
          sharp(tp.ip)
              .png({quality:parseInt(answers.imageQualitis.split(",")[i].trim())}).toFile(tp.op)
              .then((resp)=>{
                // console.log(resp)
              })
              .catch((err)=>{
                console.log(err)
              });
        }
       
        
      })
      index_of_type++;
    }  
}





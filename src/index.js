#!/usr/bin/env node
/* eslint-disable no-unused-expressions */
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const minimist = require('minimist');
const buildOptions = require('minimist-options');
const sharp = require('sharp');
const figlet = require('figlet');
const center = require('center-align');
const cliProgress = require('cli-progress');
const inquirer = require('inquirer');
const listdirs = require('listdirs');

const basedir = '.'; // or which ever base directory you prefer
let allDirectories = [];
let generateFolderNames;
let options = [];
options = buildOptions({
  inputImagePath: {
    type: 'string',
    alias: 'i',
    index: 0
  },
  distImagePath: {
    type: 'string',
    alias: ['d', 'distImagePath']
  },
  imageTypes: {
    type: 'array',
    alias: 't'
  },
  imageQualitis: {
    type: 'array',
    alias: 'q'
  },
  help: {
    type: 'string',
    alias: 'h'
  }
});

const argv = minimist(process.argv.slice(2), options);

let cp;
let count = 0;

/* Monogram */
figlet(
  'GLACIO',
  {
    font: 'Alligator'
  },
  (err, data) => {
    if (err) {
      console.log(
        colors.red(center('Something went wrong...', process.stdout.columns))
      );
      console.dir(colors.red(center(err, process.stdout.columns)));
    }
    console.log(colors.cyan(center(data, process.stdout.columns)));

    generateFolderNames();
  }
);

const questions = () => [
  {
    type: 'list',
    name: 'inputImagePath',
    message: `Select the ${colors.yellow('source')} image folder path`,
    choices: allDirectories
  },
  {
    type: 'list',
    name: 'distImagePath',
    message: `Select the ${colors.yellow('destination')} image folder path`,
    choices: allDirectories
  },
  {
    type: 'checkbox',
    message: `Select ${colors.yellow('image types')} to convert`,
    name: 'imageTypes',
    choices: [
      {
        name: 'webp',
        checked: true
      },
      {
        name: 'avif',
        checked: true
      },
      {
        name: 'jpg'
      },
      {
        name: 'png'
      }
    ]
  },
  {
    type: 'input',
    message: `${colors.yellow(
      'optimization qualities'
    )} for image types(Comma separated)`,
    name: 'imageQualitis',
    default: '80,60,60,60'
  }
];

/** Generating folder names for choices */
generateFolderNames = () => {
  listdirs(
    basedir,
    (err, list) => {
      if (err) {
        console.log(colors.red(err)); // handle errors in your preferred way.
      } else {
        allDirectories = list; // use the array of directories as required.
        if (Object.keys(argv).indexOf('h') != -1) {
          console.log('');
          console.log(
            `${colors.green('-i, --inputImagePath')} Source image folder path.`
          );
          console.log(
            `${colors.green(
              '-d, --distImagePath'
            )}  Destination image folder path`
          );
          console.log(
            `${colors.green(
              '-t, --imageTypes'
            )}     Image tupes to convert (webp|avif|png|jpg).`
          );
          console.log(
            `${colors.green(
              '-q, --imageQualitis'
            )}  Quality of the chosen image types (comma separated).`
          );
          console.log('');
        } else {
          inquire(questions);
        }
      }
    },
    ['node_modules', '.git']
  );
};

/** Generate Images */
const generateImages = (answers) => {
  const images = {};
  let numberOfImages = 0;
  const allImages = fs.readdirSync(answers.inputImagePath);
  allImages.map((fl, i) => {
    if (fl.search(/\.(jpe?g|png|gif|svg)$/) != -1) {
      answers.imageTypes.map((it) => {
        const ip = path.join(answers.inputImagePath, `/${fl}`);
        const op = path.join(
          answers.distImagePath,
          `/${fl.split('.')[0]}.${it.trim()}`
        );
        if (!fs.existsSync(op)) {
          images[it]
            ? images[it].push({ ip, op })
            : ((images[it] = []), images[it].push({ ip, op }));
        }
      });
    }
  });
  numberOfImages =
    (images.webp ? images.webp.length : 0) +
    (images.avif ? images.avif.length : 0);
  const shouldStop = (total) => {
    if (total > count) {
      count++;
    }
    if (count === total) {
      cp && cp.stop();
      console.log('');
    }
    ('');
  };
  if (numberOfImages) {
    console.log('');
    cp = new cliProgress.SingleBar(
      {
        barsize: 55,
        format: `${colors.yellow('progress')} ${colors.cyan(
          '[{bar}]'
        )} ${colors.yellow('{percentage}%')} | ${colors.yellow(
          'ETA: {eta}s'
        )} | ${colors.yellow('{value}/{total}')}`
      },
      cliProgress.Presets.shades_classic
    );
    cp.start(numberOfImages, 0);
  } else {
    console.log(
      colors.yellow('===============================================')
    );
    console.log(colors.cyan(' There is not any pending image to convert!!'));
    console.log(
      colors.yellow('===============================================')
    );
  }
  let indexOfType = 0;
  Object.keys(images).forEach((item) => {
    images[item].map((tp, i) => {
      if (item.trim() == 'avif') {
        sharp(tp.ip)
          .avif({
            quality: parseInt(
              answers.imageQualitis.split(',')[indexOfType].trim(),
              10
            )
          })
          .toFile(tp.op)
          .then((resp) => {
            cp && cp.increment();
            shouldStop(numberOfImages);
          })
          .catch((err) => {
            console.log(err);
          });
      }
      if (item.trim() == 'webp') {
        sharp(tp.ip)
          .webp({
            quality: parseInt(
              answers.imageQualitis.split(',')[indexOfType].trim(),
              10
            )
          })
          .toFile(tp.op)
          .then((resp) => {
            cp && cp.increment();
            shouldStop(numberOfImages);
          })
          .catch((err) => {
            console.log(err);
          });
      }

      if (item.trim() == 'jpg') {
        sharp(tp.ip)
          .jpg({
            quality: parseInt(
              answers.imageQualitis.split(',')[indexOfType].trim(),
              10
            )
          })
          .toFile(tp.op)
          .then((resp) => {
            cp && cp.increment();
            shouldStop(numberOfImages);
          })
          .catch((err) => {
            console.log(err);
          });
      }
      if (item.trim() == 'png') {
        sharp(tp.ip)
          .png({
            quality: parseInt(
              answers.imageQualitis.split(',')[indexOfType].trim(),
              10
            )
          })
          .toFile(tp.op)
          .then((resp) => {
            cp && cp.increment();
            shouldStop(numberOfImages);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
    indexOfType += 1;
  });
};

/** Call generateImage */
const callGenerateImage = (answers, arg) => {
  // eslint-disable-next-line no-unused-expressions
  arg.imageTypes && (arg.imageTypes = arg.imageTypes.split(','));
  generateImages({ ...answers, ...arg });
};

/** Inquiries generation */
const inquire = (q) => {
  let quest = q();

  /** Removing questions accordingly */
  quest = quest
    .map((qm) => {
      if (!argv[qm.name]) {
        return qm;
      }
    })
    .filter(Boolean);

  quest.length
    ? inquirer
        .prompt([...quest])
        .then((answers) => {
          callGenerateImage(answers, argv);
        })
        .catch((error) => {
          if (error.isTtyError) {
            console.log(
              colors.red(
                "Prompt couldn't be rendered in the current environment",
                error
              )
            );
          } else {
            console.log(colors.red('Something went wrong. ', error));
          }
        })
    : callGenerateImage([], argv);
  // !quest.length &&
};

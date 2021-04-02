# glacio

Command line utility to convert images to WEBP and AVIF.

This is a high performance image converter from jpeg, jpg, png, svg file. This package auto searches and shows a list of  folders you can choose from as image source and your destination folder, next it asks for the image types you want to convert and the quality setting. Once done it converts all the images as per choices you made to desired folder.

## Usage

```sh
$ npm i glacio -g
```

## Options

```
    -i, --inputImagePath   Source image folder path.
    -d, --distImagePath    Destination image folder path.
    -t, --imageTypes       Image tupes to convert(webp|avif|png|jpg) (comma separated).
    -q, --imageQualitis    Quality of the chosen image types (comma separated).
    -h, --help             Show help
```

## Examples
Without any predefined option passed.
```sh,
glacio 
```
With partial options passed, it will ask you for missing choices. This example will ask you for the image qualities only.

```sh
glacio -i src/images -d dist/images -t webp,avif
```
With all the options passed. It will not ask you anything.
```sh
glacio -i src/images -d dist/images -t webp,avif -q 80,60,60,60
```
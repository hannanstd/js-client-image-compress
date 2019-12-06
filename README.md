# js-client-image-compress
Compress and Resize images via browser and transform it to base64.

when i was working on a project, i saw that when i pick some images via fileInput, that image will rotate automatically!  
after searching i understood that occures due to EXIF Orientation values. 

https://sirv.com/help/resources/rotate-photos-to-be-upright/

finaly i found a function that recognize the EXIF Orientation value.

i combined this function to other functions that does below:

1 - Recognizes EXIF Orientation value.  
2 - Fixes Orientation to Original.  
3 - Compresses image file size.  
4 - Resizes Width & Height  
5 - Delivers image as Base64

### How to use:
```javascript
// <input type="file" id='image-picker'/>

document.getElementById('image-picker').onchange = function() {
    var file = this.files[0];
    proccessImage(file, {
        max_width: 1000,
        max_height: 1000,
        percent: 0.7, // percent of compress
      }, function (base64) {
        console.log(base64); // get output image as base64
      }
    );
};
```

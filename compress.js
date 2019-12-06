function proccessImage(file, options, callback) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert('Your Browser cannot support this feature.');
        return false;
    } else if (!(/image/i).test(file.type)) {
        alert("the " + file.name + " is not a image.");
        return false;
    }

    var max_width = options.max_width || 1000;
    var max_height = options.max_height || 1000;
    var percent = options.percent || 0.7;

    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function (event) {
        var view = new DataView(event.target.result);
        var srcOrientation = -1;
        if (view.getUint16(0, false) != 0xFFD8) {
            srcOrientation = -2;
        } else {
            var length = view.byteLength, offset = 2;
            dance:
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) {
                            srcOrientation = -2;
                            break;
                        } else {
                            var little = view.getUint16(offset += 6, false) == 0x4949;
                            offset += view.getUint32(offset + 4, little);
                            var tags = view.getUint16(offset, little);
                            offset += 2;
                            for (var i = 0; i < tags; i++) {
                                if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                                    srcOrientation = view.getUint16(offset + (i * 12) + 8, little);
                                    break dance;
                                }
                            }
                        }
                    } else if ((marker & 0xFF00) != 0xFF00) {
                        break;
                    } else {
                        offset += view.getUint16(offset, false);
                    }
                }
        }


        var blob = new Blob([event.target.result]);
        window.URL = window.URL || window.webkitURL;
        var blobURL = window.URL.createObjectURL(blob);
        var image = new Image();
        image.src = blobURL;

        image.onload = function () {
            var width = image.naturalWidth;
            var height = image.height;
            if (width > height) {
                if (width > max_width) {
                    height = Math.round(height *= max_width / width);
                    width = max_width;
                }
            } else {
                if (height > max_height) {
                    width = Math.round(width *= max_height / height);
                    height = max_height;
                }
            }

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            if (srcOrientation > 4 && srcOrientation < 9) {
                canvas.width = height;
                canvas.height = width;
            } else {
                canvas.width = width;
                canvas.height = height;
            }
            switch (srcOrientation) {
                case 2:
                    ctx && ctx.transform(-1, 0, 0, 1, width, 0);
                    break;
                case 3:
                    ctx && ctx.transform(-1, 0, 0, -1, width, height);
                    break;
                case 4:
                    ctx && ctx.transform(1, 0, 0, -1, 0, height);
                    break;
                case 5:
                    ctx && ctx.transform(0, 1, 1, 0, 0, 0);
                    break;
                case 6:
                    ctx && ctx.transform(0, 1, -1, 0, height, 0);
                    break;
                case 7:
                    ctx && ctx.transform(0, -1, -1, 0, height, width);
                    break;
                case 8:
                    ctx && ctx.transform(0, -1, 1, 0, 0, width);
                    break;
                default:
                    break;
            }
            ctx.drawImage(image, 0, 0, width, height);
            var resized = canvas.toDataURL("image/jpeg", percent);
            // console.log(resized);
            if (typeof callback === 'function') {
                callback(resized);
            }
        }
    };
}

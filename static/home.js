$(function() {
  // input of the original image
  function setOriginalImage(url, callback) {
    var uploadImg = new Image();
    uploadImg.onload = function() {
      $('img.original').attr('src', url);
      $('canvas').attr({
        height: uploadImg.height,
        width: uploadImg.width
      });
      $('#old-regions').css({
        marginTop: (-1 * $('img.original').height()) + 'px'
      });
      
      if (callback && typeof callback === 'function') {
        callback();
      }
    };
    uploadImg.src = url;
  }
  
  $('.submit-original[type="file"]').on('change', function() {
    // grab file directly, without need to upload
    var image = this.files[0];
    if (image) {
      setOriginalImage(URL.createObjectURL(image));
    }
  });
  
  /* TODO:
  $('.submit-original[type="text"]').on('change', function(e) {
    // image on remote website
    $('img.original').attr('src', e.target.value);
  });
  */

  // paint-over palettes from 'voices' app, which was cool
  $('.colorable').map(function(c, colorable) {
    // add the UI to each palette
    var red = $('<li>').append('<span class="color red highlight">_</span>');
    var green = $('<li>').append('<span class="color green">_</span>');
    var blue = $('<li>').append('<span class="color blue">_</span>');
    $(colorable).find('.color-palette').append(red);
    $(colorable).find('.color-palette').append(green);
    $(colorable).find('.color-palette').append(blue);
    
    var colorctx = $(colorable).find('canvas')[0].getContext('2d');
    colorctx.fillStyle = 'red';
    colorctx.strokeStyle = 'red';
    colorctx.lineWidth = 8;
    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
      colorctx.lineWidth = 12;
    }
    
    $(colorable).find('.color').click(function(e) {
      $(".color").removeClass("highlight");
      $(e.currentTarget).addClass("highlight");
      colorctx.strokeStyle = $(e.currentTarget).css('color');
      colorctx.fillStyle = $(e.currentTarget).css('color');
    });
  
    // add painting code here
    var writing = false;
    var lastPt = null;
    var areas = false;
    
    $(colorable).find('canvas').on('mousedown', function() {
      writing = true;
      lastPt = null;
      if (!areas) {
        colorctx.beginPath();
      }
    })
    .on('mouseup mouseout', function() {
      writing = false;
    })
    .on('mousemove', function(e) {
      if (writing && !areas) {
        if (lastPt) {
          colorctx.lineTo(e.offsetX, e.offsetY);
          colorctx.stroke();
        }
        colorctx.moveTo(e.offsetX, e.offsetY);
        lastPt = [e.offsetX, e.offsetY];
      }
    });
  });
  
  $('#copy-masks').click(function() {
    var firstMask = $('#old-regions')[0].toDataURL();
    var img = new Image();
    img.onload = function() {
      $('#new-regions')[0].getContext('2d').drawImage(img, 0, 0);
    };
    img.src = firstMask;
  });

  // offer the test case (no need for custom images)
  $('.test-case').click(function() {
    // download /test-case, paste into canvases
    $('img.original').attr('src', '/test-case/image.jpg');
    
    setOriginalImage('/test-case/image.jpg', function() {
      var ctxOld = $('#old-regions')[0].getContext('2d');
      var imgOld = new Image();
      imgOld.onload = function() {
        ctxOld.drawImage(imgOld, 0, 0);
      };
      imgOld.src = '/test-case/image-mask.jpg';    
      
      var ctxNew = $('#new-regions')[0].getContext('2d');
      var imgNew = new Image();
      imgNew.onload = function() {
        ctxNew.drawImage(imgNew, 0, 0);
      };
      imgNew.src = '/test-case/image-mask-new.jpg';
    });
    
    // user must click run themselves
  });
  
  // if everything goes well, user clicks this to start
  $('.run').click(composeAndSubmitForm);
  
  function composeAndSubmitForm() {
    var originalImage = $('img.original').attr('src');
    var origImg = new Image();
    origImg.onload = function() {
      $('input[name="original"]').val();
      
      $('input[name="mask"]').val();
      
      $('input[name="new-mask"]').val();
      
      $('form').submit();
    };
    origImg.src = originalImage;
  }
  
  
  function processDroppedImage (e) {
    setOriginalImage(e.target.result);
  }

  function watchForDroppedImage() {
    var blockHandler = function (e) {
      e.stopPropagation();
      e.preventDefault();
    };

    // file drop handlers
    var dropFile = function (e) {
      e.stopPropagation();
      e.preventDefault();
      files = e.dataTransfer.files;
      if (files && files.length) {
        var reader = new FileReader();
        var fileType = files[0].type.toLowerCase();
        if(fileType.indexOf("image") > -1){
          // process an image
          reader.onload = processDroppedImage;
          reader.readAsDataURL(files[0]);
        }
      }
    };

    window.addEventListener('dragenter', blockHandler, false);
    window.addEventListener('dragexit', blockHandler, false);
    window.addEventListener('dragover', blockHandler, false);
    window.addEventListener('drop', dropFile, false);
  }
  watchForDroppedImage();
});
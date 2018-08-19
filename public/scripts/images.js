var loadedImages;

imageLoaded = function(totalImages, callback)
{
  loadedImages++;
  if (loadedImages == totalImages)
  {
    console.log("..." + totalImages + " images loaded");
    callback();
  }
}

loadImages = function(callback)
{
  console.log("Loading images...");
  loadedImages = 0;
  imageList = {"paused":  "images/paused.png",
               "paused2": "images/paused2.png"};
  totalImages = Object.keys(imageList).length;
  for (key in imageList)
  {
    images[key] = new Image();
    images[key].src = imageList[key];
    images[key].onload = () => imageLoaded(totalImages, callback);
  }
}

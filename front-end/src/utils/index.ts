// 压缩 base64
export function dealImage(base64: string, w: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const newImage = new Image();
    let quality = 0.6;
    newImage.src = base64;
    newImage.setAttribute("crossOrigin", "Anonymous");

    var imgWidth, imgHeight;

    newImage.onload = function () {
      imgWidth = (this as any).width;
      imgHeight = (this as any).height;
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      if (Math.max(imgWidth, imgHeight) > w) {
        if (imgWidth > imgHeight) {
          canvas.width = w;
          canvas.height = (w * imgHeight) / imgWidth;
        } else {
          canvas.height = w;
          canvas.width = (w * imgWidth) / imgHeight;
        }
      } else {
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        quality = 0.6;
      }
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(this as any, 0, 0, canvas.width, canvas.height);
      var base64 = canvas.toDataURL("image/jpeg", quality);
      //   callback(base64);
      resolve(base64);
    };
  });
}

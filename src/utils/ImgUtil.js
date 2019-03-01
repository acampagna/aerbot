/**
 * A util for image manipulation. Uness you play with the !card command you shouldn't need anything here.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
/*const Pixly = require("pixel-util");
const Canvas = require("canvas");

async function getCanvas(path) {
	let img = new Canvas.Image;
	img.src = Pixly.createBuffer(path).then(buff => {
		return buff;
	});
	return img;
}
async function getBuffer(path) {
    return Pixly.createBuffer(path).then(buff => {
    	return buff;
    });
}

async function hex(size,picture) {
    let globalOffset = 0
    size = size/2
    let x  = size+10
    let y=  -size
    
    let cw=size
    let ch=size

    
    let hex= new Canvas.createCanvas (size*2+20,size*2+20)
    let c=hex.getContext("2d")
    c.rotate(1.5708)
    c.save();
    c.beginPath();
    c.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

    for (side=0; side < 7; side++) {
      c.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
    }

     c.fillStyle = "#ffffff" //Target.id=="88120564400553984"?"#2b2b3b":"rgb(248, 248, 248)";
    c.fill();    
 if(picture){
    c.clip();
    let a = await getCanvas(picture);
      c.rotate(-1.5708)
      c.drawImage(a, 0, x-size,size*2,size*2);
      c.restore()  
   
   
c.globalCompositeOperation='xor';

c.shadowOffsetX = 0;
c.shadowOffsetY = 0;
c.shadowBlur = 10;
c.shadowColor = 'rgba(30,30,30,1)';

c.beginPath();
  for (side=0; side < 7; side++) {
      c.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
    }
c.stroke();
c.stroke();
c.stroke();

c.globalCompositeOperation='destination-atop';
   
  
 }else{
    c.shadowColor = "rgba(34, 31, 39, 0.77)"
    c.shadowBlur = 10

 }
       c.fill();    

    return hex
    
  }

module.exports = {
	getCanvas,
	getBuffer,
	hex
};*/
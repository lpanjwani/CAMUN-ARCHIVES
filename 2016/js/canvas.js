function GameObject()
{this.zOrder=0;this.x=0;this.y=0;this.startupGameObject=function(x,y,z)
{this.zOrder=z;this.x=x;this.y=y;g_GameObjectManager.addGameObject(this);return this;}
this.shutdownGameObject=function()
{g_GameObjectManager.removeGameObject(this);}}
function VisualGameObject()
{this.image=null;this.draw=function(dt,context,xScroll,yScroll)
{context.drawImage(this.image,this.x-xScroll,this.y-yScroll);}
this.startupVisualGameObject=function(image,x,y,z)
{this.startupGameObject(x,y,z);this.image=image;return this;}
this.shutdownVisualGameObject=function()
{this.shutdownGameObject();}}
VisualGameObject.prototype=new GameObject;function RepeatingGameObject()
{this.width=0;this.height=0;this.scrollFactor=1;this.startupRepeatingGameObject=function(image,x,y,z,width,height,scrollFactor)
{this.startupVisualGameObject(image,x,y,z);this.width=width;this.height=height;this.scrollFactor=scrollFactor;return this;}
this.shutdownstartupRepeatingGameObject=function()
{this.shutdownVisualGameObject();}
this.draw=function(dt,canvas,xScroll,yScroll)
{var areaDrawn=[0,0];for(var y=0;y<this.height;y+=areaDrawn[1])
{for(var x=0;x<this.width;x+=areaDrawn[0])
{var newPosition=[this.x+x,this.y+y];var newFillArea=[this.width-x,this.height-y];var newScrollPosition=[0,0];if(x==0)newScrollPosition[0]=xScroll*this.scrollFactor;if(y==0)newScrollPosition[1]=yScroll*this.scrollFactor;areaDrawn=this.drawRepeat(canvas,newPosition,newFillArea,newScrollPosition);}}}
this.drawRepeat=function(canvas,newPosition,newFillArea,newScrollPosition)
{var xOffset=Math.abs(newScrollPosition[0])%this.image.width;var yOffset=Math.abs(newScrollPosition[1])%this.image.height;var left=newScrollPosition[0]<0?this.image.width-xOffset:xOffset;var top=newScrollPosition[1]<0?this.image.height-yOffset:yOffset;var width=newFillArea[0]<this.image.width-left?newFillArea[0]:this.image.width-left;var height=newFillArea[1]<this.image.height-top?newFillArea[1]:this.image.height-top;canvas.drawImage(this.image,left,top,width,height,newPosition[0],newPosition[1],width,height);return[width,height];}}
RepeatingGameObject.prototype=new VisualGameObject();function AnimatedGameObject()
{this.currentFrame=0;this.timeBetweenFrames=0;this.timeSinceLastFrame=0;this.frameWidth=0;this.startupAnimatedGameObject=function(image,x,y,z,frameCount,fps)
{if(frameCount<=0)throw"framecount can not be <= 0";if(fps<=0)throw"fps can not be <= 0"
this.startupVisualGameObject(image,x,y,z);this.currentFrame=0;this.frameCount=frameCount;this.timeBetweenFrames=1/fps;this.timeSinceLastFrame=this.timeBetweenFrames;this.frameWidth=this.image.width/this.frameCount;}
this.draw=function(dt,context,xScroll,yScroll)
{var sourceX=this.frameWidth*this.currentFrame;context.drawImage(this.image,sourceX,0,this.frameWidth,this.image.height,this.x-xScroll,this.y-yScroll,this.frameWidth,this.image.height);this.timeSinceLastFrame-=dt;if(this.timeSinceLastFrame<=0)
{this.timeSinceLastFrame=this.timeBetweenFrames;++this.currentFrame;this.currentFrame%=this.frameCount;}}}
AnimatedGameObject.prototype=new VisualGameObject;Array.prototype.remove=function(from,to)
{var rest=this.slice((to||from)+1||this.length);this.length=from<0?this.length+from:from;return this.push.apply(this,rest);};Array.prototype.removeObject=function(object)
{for(var i=0;i<this.length;++i)
{if(this[i]===object)
{this.remove(i);break;}}}
function ApplicationManager()
{this.startupApplicationManager=function()
{this.runner=new AnimatedGameObject().startupAnimatedGameObject(g_run,0,0,1,cTotalFrames,FPS);return this;}}
function GameObjectManager()
{this.gameObjects=new Array();this.lastFrame=new Date().getTime();this.xScroll=0;this.yScroll=0;this.applicationManager=null;this.canvas=null;this.context2D=null;this.backBuffer=null;this.backBufferContext2D=null;this.startupGameObjectManager=function()
{g_GameObjectManager=this;this.canvas=document.getElementById('canvas');this.context2D=this.canvas.getContext('2d');this.backBuffer=document.createElement('canvas');this.backBuffer.width=this.canvas.width;this.backBuffer.height=this.canvas.height;this.backBufferContext2D=this.backBuffer.getContext('2d');this.applicationManager=new ApplicationManager().startupApplicationManager();setInterval(function(){g_GameObjectManager.draw();},SECONDS_BETWEEN_FRAMES);return this;}
this.draw=function()
{var thisFrame=new Date().getTime();var dt=(thisFrame-this.lastFrame)/1000;this.lastFrame=thisFrame;this.backBufferContext2D.clearRect(0,0,this.backBuffer.width,this.backBuffer.height);this.context2D.clearRect(0,0,this.canvas.width,this.canvas.height);for(x in this.gameObjects)
{if(this.gameObjects[x].update)
{this.gameObjects[x].update(dt,this.backBufferContext2D,this.xScroll,this.yScroll);}}
for(x in this.gameObjects)
{if(this.gameObjects[x].draw)
{this.gameObjects[x].draw(dt,this.backBufferContext2D,this.xScroll,this.yScroll);}}
this.context2D.drawImage(this.backBuffer,0,0);};this.addGameObject=function(gameObject)
{this.gameObjects.push(gameObject);this.gameObjects.sort(function(a,b){return a.zOrder-b.zOrder;})};this.removeGameObject=function(gameObject)
{this.gameObjects.removeObject(gameObject);}}
function initCanvas()
{new GameObjectManager().startupGameObjectManager();}

/* tech marquee */
var stack=['React Native','MERN Stack','Next.js','Node.js','MongoDB','AWS','Claude AI','GPT','Expo','TypeScript','PostgreSQL','App Store','Google Play'];
var h='';for(var k=0;k<2;k++){stack.forEach(function(s){h+='<span class="marquee-item">✦&nbsp;&nbsp;'+s+'</span>';});}
document.getElementById('marq').innerHTML=h;


document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
document.getElementById('contactForm').onsubmit=function(e){e.preventDefault();
var fn=document.getElementById('fn'),em=document.getElementById('em2'),ok=true;
[fn,em].forEach(function(el){el.style.borderColor=''});
if(!fn.value.trim()){fn.style.borderColor='#e0564b';ok=false}
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())){em.style.borderColor='#e0564b';ok=false}
if(!ok){(fn.value.trim()?em:fn).focus();return}
var b=this.querySelector('.submit');b.textContent='Sending…';b.disabled=true;
var payload={kind:'contact',name:(document.getElementById('fn').value+' '+document.getElementById('ln').value).trim(),email:document.getElementById('em2').value.trim(),company:document.getElementById('co').value.trim(),service:document.getElementById('svc').value,message:document.getElementById('msg').value.trim()};
Object.assign(payload,(window.scsUTM&&window.scsUTM.get())||{});fetch('https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){}).then(function(){b.style.display='none';document.getElementById('success').style.display='block'});};

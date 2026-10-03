
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});
document.getElementById('wpForm').onsubmit=function(e){e.preventDefault();
var nm=document.getElementById('wpName'),em=document.getElementById('wpEmail'),ok=true;
[nm,em].forEach(function(el){el.style.borderColor=''});
if(!nm.value.trim()){nm.style.borderColor='#e0564b';ok=false}
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())){em.style.borderColor='#e0564b';ok=false}
if(!ok){(nm.value.trim()?em:nm).focus();return}
var b=this.querySelector('.submit');b.textContent='Sending…';b.disabled=true;
var phone=document.getElementById('wpPhone').value.trim();
var msg=document.getElementById('wpMsg').value.trim();
var fullMsg=(phone?'Phone/WhatsApp: '+phone+'\n\n':'')+msg;
var payload={kind:'wordpress-india',name:nm.value.trim(),email:em.value.trim(),company:document.getElementById('wpBiz').value.trim(),service:document.getElementById('wpType').value||'WordPress Website Development',message:fullMsg};
Object.assign(payload,(window.scsUTM&&window.scsUTM.get())||{});fetch('https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){}).then(function(){b.style.display='none';document.getElementById('wpSuccess').style.display='block'});};

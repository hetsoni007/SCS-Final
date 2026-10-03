
var grid=document.getElementById('grid');
document.querySelectorAll('.fbtn').forEach(function(b){b.onclick=function(){var f=b.dataset.f;document.querySelectorAll('.fbtn').forEach(function(x){x.classList.remove('active')});b.classList.add('active');grid.querySelectorAll('.blog-card').forEach(function(c){var m=f==='all'||c.dataset.cat.indexOf(f)>-1;c.style.display=m?'flex':'none'})}});

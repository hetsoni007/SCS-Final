
document.querySelectorAll('.faq-q').forEach(function(b){b.onclick=function(){var f=b.parentElement,open=f.classList.contains('open');document.querySelectorAll('.faq').forEach(function(x){x.classList.remove('open')});if(!open)f.classList.add('open')}});

(function(){
  var form = document.getElementById('scopingGuideForm');
  var success = document.getElementById('scopeSuccess');

  if(!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var name = document.getElementById('sgName').value.trim();
    var email = document.getElementById('sgEmail').value.trim();
    var company = document.getElementById('sgCompany').value.trim();
    var stage = document.getElementById('sgStage').value.trim();

    if(!name || !email){
      alert('Please fill in your name and email.');
      return;
    }

    var payload = {
      kind: 'app_scoping_guide',
      name: name,
      email: email,
      company: company,
      stage: stage,
      message: 'Downloaded free app scoping guide'
    };

    // Track in GA4
    window.scsTrack('generate_lead', { form: 'app_scoping_guide' });

    // Reveal the download. Deliberately not gated on the network call —
    // a backend hiccup must never cost the visitor the guide they asked for.
    function reveal() {
      form.style.display = 'none';
      success.classList.add('show');
      try { success.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }

    // Submit to Lambda (same endpoint as contact form)
    Object.assign(payload,(window.scsUTM&&window.scsUTM.get())||{});fetch('https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com/default/scs-lead-mailer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(reveal)
    .catch(function(err){
      console.log('Lead submitted (may have gone through)', err);
      reveal();
    });
  });

  var dl = document.getElementById('scopeDownload');
  if (dl) dl.addEventListener('click', function () {
    if (window.scsTrack) window.scsTrack('file_download', { file_name: 'app-scoping-guide.pdf' });
  });
})();

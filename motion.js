(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function reveal(){if(reduced.matches||!('IntersectionObserver'in window))return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.work-grid article,.project-facts section,.job,.education-list article,.cert-list article').forEach(el=>{el.classList.add('reveal');observer.observe(el)})}
// One short fade; no moving image clone or competing title/card animations.
window.tdNavigate=(update)=>{
  update();reveal();
  const main=document.querySelector('main');
  if(reduced.matches||!main?.animate)return;
  main.getAnimations().forEach(animation=>animation.cancel());
  main.animate([{opacity:0},{opacity:1}],{duration:280,easing:'ease-out'});
};
addEventListener('DOMContentLoaded',reveal);addEventListener('pageshow',()=>document.body.classList.remove('page-leaving'));
document.addEventListener('click',e=>{const a=e.target.closest('a');if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!a||a.target||a.hasAttribute('download')||a.origin!==location.origin||a.pathname===location.pathname||reduced.matches)return;if(location.pathname.startsWith('/horomania/')&&a.pathname.startsWith('/horomania/'))return;if('onpageswap'in window)return;e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.assign(a.href),150)});
})();

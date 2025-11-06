/* ================================================
   CivilCity | Members Neon Hover FX
   CSP‑safe interactive script
================================================ */
document.addEventListener("DOMContentLoaded", ()=>{
  const cards = document.querySelectorAll(".member-card");
  cards.forEach(c=>{
    c.addEventListener("mouseenter",()=>{
      c.style.boxShadow="0 0 25px #00faff";
      c.style.color="#00ffa2";
      c.style.transform="translateY(-6px)";
    });
    c.addEventListener("mouseleave",()=>{
      c.style.boxShadow="0 0 5px #00faff22";
      c.style.color="#eee";
      c.style.transform="translateY(0)";
    });
  });
});

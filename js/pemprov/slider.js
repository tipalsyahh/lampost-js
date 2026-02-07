document.addEventListener('DOMContentLoaded', async () => {

const track=document.querySelector('.hero-track');
const dotsWrap=document.querySelector('.hero-dots');
if(!track||!dotsWrap)return;

function formatTanggalPendek(d){
return new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
}

try{

const res=await fetch('https://lampost.co/microweb/pemprovlampung/wp-json/wp/v2/posts?per_page=5&orderby=date&order=desc&_embed');
if(!res.ok)throw new Error();

const posts=await res.json();

let slidesHTML='';
let dotsHTML='';

posts.forEach((post,i)=>{

const judul=post.title.rendered;

const kategoriNama=post._embedded?.['wp:term']?.[0]?.[0]?.name||'Berita';
const kategoriSlug=post._embedded?.['wp:term']?.[0]?.[0]?.slug||'berita';

const link=`berita.pemprovlampung.html?${kategoriSlug}/${post.slug}`;

const editor=post._embedded?.author?.[0]?.name||'Redaksi';

const gambar=
post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full?.source_url||
post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url||
post._embedded?.['wp:featuredmedia']?.[0]?.source_url||
'image/ai.jpg';

const waktu=formatTanggalPendek(post.date);

slidesHTML+=`
<div class="hero-slide">
<a href="${link}" class="hero-link">
<div class="hero-image-box">
<img src="${gambar}" class="hero-image" alt="${judul}" loading="lazy">
<div class="hero-overlay">
<span class="hero-category">${kategoriNama}</span>
<span class="hero-title">${judul}</span>
<div class="hero-meta">
<span class="hero-editor">By ${editor}</span>
<span class="hero-time">${waktu}</span>
</div>
</div>
</div>
</a>
</div>
`;

dotsHTML+=`
<span class="hero-dot ${i===0?'active':''}" data-i="${i}"></span>
`;

});

track.innerHTML=slidesHTML;
dotsWrap.innerHTML=dotsHTML;

let index=0;
const slides=document.querySelectorAll('.hero-slide');
const dots=document.querySelectorAll('.hero-dot');
const total=slides.length;

function goSlide(i){
track.style.transform=`translateX(-${i*100}%)`;
dots.forEach(d=>d.classList.remove('active'));
dots[i].classList.add('active');
index=i;
}

dots.forEach(dot=>{
dot.addEventListener('click',()=>goSlide(Number(dot.dataset.i)));
});

setInterval(()=>goSlide((index+1)%total),5000);

}catch(err){
console.error(err);
}

});

document.addEventListener('DOMContentLoaded', () => {

const container=document.querySelector('.berita-terpopuler');
if(!container)return;

const TERM_CACHE={};
const MEDIA_CACHE={};

function formatTanggalPendek(dateString){
const d=new Date(dateString);
return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
}

async function getEditor(post){
let editor='Redaksi';
const termLink=post._links?.['wp:term']?.[2]?.href;
if(!termLink)return editor;

if(TERM_CACHE[termLink])return TERM_CACHE[termLink];

try{
const res=await fetch(termLink);
if(res.ok){
const data=await res.json();
editor=data?.[0]?.name||editor;
TERM_CACHE[termLink]=editor;
}
}catch{}

return editor;
}

async function getMedia(mediaId){
if(!mediaId)return'image/default.jpg';
if(MEDIA_CACHE[mediaId])return MEDIA_CACHE[mediaId];

try{
const res=await fetch(`https://lampost.co/wp-json/wp/v2/media/${mediaId}`);
if(res.ok){
const media=await res.json();
MEDIA_CACHE[mediaId]=
media.media_details?.sizes?.full?.source_url||
media.media_details?.sizes?.large?.source_url||
media.source_url||
'image/default.jpg';
}
}catch{}

return MEDIA_CACHE[mediaId]||'image/default.jpg';
}

function renderFast(post,kategoriSlug){
const judul=post.title.rendered;
const link=`halaman.html?${kategoriSlug}/${post.slug}`;
const waktu=formatTanggalPendek(post.date);
const id=`lampung-${post.id}`;

return`
<a href="${link}" class="card-link" id="${id}">
<div class="card-image-wrapper">
<img src="image/default.jpg" alt="${judul}" class="card-image" loading="lazy">
<div class="card-text-overlay">
<span class="card-category">Lampung</span>
<span class="card-text">${judul}</span>
<div class="card-meta">
<span class="editor">By ...</span>
<span class="waktu">${waktu}</span>
</div>
</div>
</div>
</a>
`;
}

async function enrich(post){
const id=`lampung-${post.id}`;
const el=document.getElementById(id);
if(!el)return;

const editor=await getEditor(post);
const gambar=await getMedia(post.featured_media);

const imgEl=el.querySelector('img');
const preload=new Image();
preload.src=gambar;
preload.onload=()=>imgEl.src=gambar;

el.querySelector('.editor').textContent=`By ${editor}`;
}

async function init(){
try{

const catRes=await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=lampung');
if(!catRes.ok)throw new Error();

const catData=await catRes.json();
if(!catData.length)throw new Error();

const kategoriId=catData[0].id;
const kategoriSlug='lampung';

const postRes=await fetch(`https://lampost.co/wp-json/wp/v2/posts?per_page=6&categories=${kategoriId}&orderby=date&order=desc`);
if(!postRes.ok)throw new Error();

const posts=await postRes.json();
if(!posts.length)return;

container.innerHTML=posts.map(p=>renderFast(p,kategoriSlug)).join('');

posts.forEach(p=>enrich(p));

}catch(err){
console.error(err);
container.innerHTML='Gagal memuat berita Lampung';
}
}

init();

});

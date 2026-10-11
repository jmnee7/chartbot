// ===== Guide: ID 생성 전용 로직(기존 guide.js에서 이관) =====
let currentIdSub = 'dual';
let currentStreamSub = 'melon';
let currentDownloadSub = 'melon';
let currentDownloadCategory = 'audio';
let currentVoteCollectSub = 'showchampion';
let currentChantSub = 'handsup';
let currentChantTrack = '';

function switchIdSubTab(sub, btn){
    currentIdSub = sub;
    document.querySelectorAll('#guideIdSection .id-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const title = document.getElementById('guideIdTitle');
    const date = document.getElementById('guideIdDate');
    const img = document.getElementById('guideIdImage');
    if (title) title.textContent = (sub === 'dual') ? '듀얼 넘버 생성' : (sub === 'bugs' ? '벅스 아이디 생성' : '지니 아이디 생성');
    if (date) {
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        date.textContent = fmt;
    }
    const dualContainerId = 'guideDualContainer';
    let dualContainer = document.getElementById(dualContainerId);

    if (sub === 'dual') {
        // 듀얼 넘버 3개 카드 렌더링
        if (!dualContainer) {
            const parent = document.querySelector('.guide-id-image-container');
            if (parent) {
                parent.classList.add('grid-mode');
                parent.innerHTML = `<div id="${dualContainerId}" class="guide-dual-grid"></div>`;
                dualContainer = document.getElementById(dualContainerId);
            }
        } else {
            dualContainer.innerHTML = '';
        }
        if (dualContainer) {
            dualContainer.innerHTML = `
                <div class="guide-dual-card">
                    <h3 class="guide-dual-title">KT</h3>
                    <img class="guide-dual-img" src="styles/assets/guide/generateid/dual/kt.webp?v=20260927" alt="KT 듀얼 넘버 가이드" />
                </div>
                <div class="guide-dual-card">
                    <h3 class="guide-dual-title">SKT</h3>
                    <img class="guide-dual-img" src="styles/assets/guide/generateid/dual/skt.webp?v=20260927" alt="SKT 듀얼 넘버 가이드" />
                </div>
                <div class="guide-dual-card">
                    <h3 class="guide-dual-title">U+</h3>
                    <img class="guide-dual-img" src="styles/assets/guide/generateid/dual/lgu.webp?v=20260927" alt="U+ 듀얼 넘버 가이드" />
                </div>
            `;
        }
    } else {
        // 벅스/지니 단일 이미지 표시
        // 이미지 컨테이너가 카드 그리드 상태일 수 있으니 초기화
        const parent = document.querySelector('.guide-id-image-container');
        if (parent) {
            parent.classList.remove('grid-mode');
            parent.innerHTML = '<img id="guideIdImage" class="guide-id-image" alt="아이디 생성 가이드 이미지"/>';
        }
        const targetImg = document.getElementById('guideIdImage');
        if (targetImg){
            targetImg.src = (sub === 'bugs') ? 'styles/assets/guide/generateid/벅스 아이디 생성 가이드(260917 ver.).webp' : 'styles/assets/guide/generateid/지니 아이디 생성 가이드(260917 ver.).webp';
        }
    }
}

function openIdShortcut(){
    alert('바로가기 링크는 준비 중입니다.');
}

function openRadioSms(number){
    window.location.href = `sms:${encodeURIComponent(number)}`;
}

async function copyRadioRequestText(){
    await navigator.clipboard.writeText('NCT WISH [곡명] 신청합니다.');
}

function shareCurrentGuide(){
    const url = getCurrentShareUrl();
    const shareData = { title: document.title, text: '가이드', url };
    if (navigator.share) {
        navigator.share(shareData).catch(()=>{});
    } else {
        if (navigator.clipboard) navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다.');
    }
}

function getCurrentShareUrl(){
    const origin = location.origin;
    const isVisible = (id)=>{
        const el = document.getElementById(id);
        return !!el && el.style.display === 'block';
    };
    // Guide: streaming
    if (isVisible('guideStreamingSection')) return `${origin}/r/g/streaming/${encodeURIComponent(currentStreamSub)}`;
    // Guide: id (현재는 공유 버튼 제거되어도 대응)
    if (isVisible('guideIdSection')) return `${origin}/r/g/id/${encodeURIComponent(currentIdSub)}`;
    // Guide: download
    if (isVisible('guideDownloadSection')) return `${origin}/r/g/download/${encodeURIComponent(currentDownloadCategory)}/${encodeURIComponent(currentDownloadSub)}`;
    // Guide: cheer
    if (isVisible('guideChantSection')) return `${origin}/r/g/cheer/${encodeURIComponent(currentChantSub)}${currentChantTrack?`/${encodeURIComponent(currentChantTrack)}`:''}`;
    // Guide: radio
    if (isVisible('guideRadioSection')) return `${origin}/r/g/radio`;
    // Vote: collect
    if (isVisible('voteCollectSection')) return `${origin}/r/vote/collect/${encodeURIComponent(currentVoteCollectSub)}`;
    // Streaming: recommend
    if (isVisible('streamingRecommendSection')) return `${origin}/r/streaming/recommend`;
    // Support
    if (isVisible('supportHelperSection')) return `${origin}/r/support/helper`;
    if (isVisible('supportTeamSection')) return `${origin}/r/support/team`;
    if (isVisible('supportIdSection')) return `${origin}/r/support/id`;
    if (isVisible('supportFundraisingSection')) return `${origin}/r/support/fundraising`;
    if (isVisible('supportGifticonSection')) return `${origin}/r/support/gifticon`;
    // Fallback: home
    return `${origin}/`;
}

// ===== Guide: 다운로드 전용 로직 =====
async function switchDownloadTab(sub, btn){
    currentDownloadSub = sub;
    document.querySelectorAll('#guideDownloadSection .id-subtab, #guideDownloadSection .download-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const titleEl = document.getElementById('guideDownloadTitle');
    const dateEl = document.getElementById('guideDownloadDate');
    const imgEl = document.getElementById('guideDownloadImage');
    const container = document.querySelector('.guide-download-image-container');
    const titleMap = { melon:'멜론 다운로드', bugs:'벅스 다운로드', genie:'지니 다운로드', kakao:'카카오뮤직 다운로드' };
    if (titleEl) titleEl.textContent = titleMap[sub] || '다운로드 가이드';
    if (dateEl){
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        dateEl.textContent = fmt;
    }

    const map = window.siteContent.downloadGuides;
    const imgs = (map[currentDownloadCategory] && map[currentDownloadCategory][sub]) || [];
    if (container){
        if (imgs.length){
            container.innerHTML = imgs.map(src=>`<img class=\"guide-download-image\" src=\"${src}\" alt=\"다운로드 가이드 이미지\"/>`).join('');
        } else {
            container.innerHTML = '';
        }
    }
}

function openDownloadShortcut(){
    alert('바로가기 링크는 준비 중입니다.');
}

function switchDownloadCategory(cat, btn){
    currentDownloadCategory = cat;
    document.querySelectorAll('#downloadCategoryTabs .id-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const svcTabs = document.getElementById('downloadServiceTabs');
    if (!svcTabs) return;
    if (cat === 'audio'){
        svcTabs.innerHTML = `
            <button class=\"id-subtab active\" data-svc=\"melon\" onclick=\"switchDownloadService('melon', this)\">멜론</button>
            <button class=\"id-subtab\" data-svc=\"genie\" onclick=\"switchDownloadService('genie', this)\">지니</button>
            <button class=\"id-subtab\" data-svc=\"bugs\" onclick=\"switchDownloadService('bugs', this)\">벅스</button>
            <button class=\"id-subtab\" data-svc=\"kakao\" onclick=\"switchDownloadService('kakao', this)\">카카오뮤직</button>`;
        switchDownloadService('melon', svcTabs.querySelector('[data-svc=\"melon\"]'));
    } else {
        svcTabs.innerHTML = `
            <button class=\"id-subtab active\" data-svc=\"melon\" onclick=\"switchDownloadService('melon', this)\">멜론</button>
            <button class=\"id-subtab\" data-svc=\"bugs\" onclick=\"switchDownloadService('bugs', this)\">벅스</button>`;
        switchDownloadService('melon', svcTabs.querySelector('[data-svc=\"melon\"]'));
    }
}

function switchDownloadService(svc, btn){
    currentDownloadSub = svc;
    document.querySelectorAll('#downloadServiceTabs .id-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    switchDownloadTab(svc, btn);
}

function openRadioHomepage(){
    window.open('https://sites.google.com/view/nctwishradio/', '_blank');
}

// ===== Guide: 스트리밍 전용 로직 =====
async function switchStreamTab(sub, btn){
    currentStreamSub = sub;
    // 스트리밍 탭은 id-subtab 스타일을 사용. 과거 클래스가 남았을 가능성도 함께 제거
    document.querySelectorAll('#guideStreamingSection .id-subtab, #guideStreamingSection .download-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const titleEl = document.getElementById('guideStreamTitle');
    const dateEl = document.getElementById('guideStreamDate');
    const container = document.querySelector('#guideStreamingSection .guide-id-image-container');
    const titleMap = { melon:'멜론 스트리밍 가이드', 'melon-musicwave':'멜론 뮤직웨이브 가이드', bugs:'벅스 스트리밍 가이드', genie:'지니 스트리밍 가이드', flo:'플로 스트리밍 가이드', vibe:'바이브 스트리밍 가이드', spotify:'스포티파이 스트리밍 가이드', apple:'애플뮤직 스트리밍 가이드', mv:'뮤직비디오 스트리밍 가이드' };
    if (titleEl) titleEl.textContent = titleMap[sub] || '스트리밍 가이드';
    if (dateEl){
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        dateEl.textContent = fmt;
    }

    const map = window.siteContent.streamingGuides;
    const imgs = map[sub] || [];
    if (container) {
        container.innerHTML = imgs.length
            ? imgs.map(src => `<img class="guide-id-image" src="${src}" alt="스트리밍 가이드 이미지"/>`).join('')
            : '<p class="guide-image-missing">저장된 가이드 이미지가 없습니다.</p>';
    }
}

function openStreamShortcut(){
    alert('바로가기 링크는 준비 중입니다.');
}
async function copyRadioText(button) {
    const message = button.closest('.radio-card').querySelector('p').textContent;
    await navigator.clipboard.writeText(message);
    button.textContent = '복사됨';
    setTimeout(() => { button.textContent = '문구 복사'; }, 2000);
}

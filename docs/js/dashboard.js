document.addEventListener('DOMContentLoaded', () => {
    // 초기 데이터 로드 (에러와 캐시 이슈 방지)
    try { updateRealTimeChartStatus(); } catch(e){ console.error(e); }
    try { loadYouTubeStats(); } catch(e){ console.error(e); }
    setInterval(() => {
        try { updateRealTimeChartStatus(); } catch(e){ console.error(e); }
        // 1분마다 최신 youtube_stats.json 반영
        try { loadYouTubeStats(); } catch(e){ console.error(e); }
    }, 60000); // 1분마다 업데이트

    // 초기 상태: 메인 화면만 노출, 가이드는 숨김
    const guideSection = document.getElementById('guideSection');
    if (guideSection) guideSection.style.display = 'none';
    const guideIdSection = document.getElementById('guideIdSection');
    if (guideIdSection) guideIdSection.style.display = 'none';
    const guideDownloadSection = document.getElementById('guideDownloadSection');
    if (guideDownloadSection) guideDownloadSection.style.display = 'none';
    // 해시 라우팅 초기 진입 처리
    routeFromHash();
    initHeroSlider();
});

// 히스토리 초기화 및 뒤로가기 처리
document.addEventListener('DOMContentLoaded', () => {
    if (!history.state) {
        history.replaceState({ view: 'home' }, '');
    }
    window.addEventListener('popstate', (e) => {
        const state = e.state || { view: 'home' };
        renderState(state);
    });
});

function showView(viewId) {
    const dashboardEl = document.getElementById('dashboard-view');
    const guideEl = document.getElementById('guide-view');
    const targetEl = document.getElementById(`${viewId}-view`);
    if (dashboardEl) dashboardEl.style.display = 'none';
    if (guideEl) guideEl.style.display = 'none';
    if (targetEl) targetEl.style.display = 'block';
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems && navItems.length) {
        navItems.forEach(item => {
            if (item.onclick && item.onclick.toString().includes(`'${viewId}'`)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    }
}

async function updateRealTimeChartStatus() {
    try {
        const response = await fetch('rank_history.json?ts=' + Date.now());
        const historyData = await response.json();
        const timestamps = Object.keys(historyData).sort();

        const latestTimestamp = timestamps[timestamps.length - 1];
        const latestData = historyData[latestTimestamp];

        const services = {
            'melon_top100': { displayId: 'melon-top-display', changeId: 'melon-top-change' },
            'melon_hot100': { displayId: 'melon-hot-display', changeId: 'melon-hot-change' },
            'bugs': { displayId: 'bugs-display', changeId: 'bugs-change' },
            'genie': { displayId: 'genie-display', changeId: 'genie-change' },
            'vibe': { displayId: 'vibe-display', changeId: 'vibe-change' },
            'flo': { displayId: 'flo-display', changeId: 'flo-change' }
        };

        for (const [service, elements] of Object.entries(services)) {
            const serviceData = latestData[service];
            const displayElement = document.getElementById(elements.displayId);
            const changeElement = document.getElementById(elements.changeId);

            const getRank = (data) => {
                if (!data || !Array.isArray(data) || data.length === 0) return null;
                const rank = data[0].rank;
                return (rank !== undefined && rank !== null) ? rank : null;
            };

            const currentRank = getRank(serviceData);

            if (displayElement) {
                if (currentRank !== null) {
                    displayElement.textContent = `${currentRank}위`;
                } else {
                    displayElement.textContent = '❌';
                }
            }

            if (changeElement) {
                if (timestamps.length > 1) {
                    const previousTimestamp = timestamps[timestamps.length - 2];
                    const previousData = historyData[previousTimestamp][service];
                    const previousRank = getRank(previousData);

                    if (currentRank !== null && previousRank !== null) {
                        const change = previousRank - currentRank;
                        if (change > 0) {
                            changeElement.textContent = `▲${change}`;
                            changeElement.className = 'rank-change up';
                        } else if (change < 0) {
                            changeElement.textContent = `▼${Math.abs(change)}`;
                            changeElement.className = 'rank-change down';
                        } else {
                            changeElement.textContent = '-';
                            changeElement.className = 'rank-change no-change';
                        }
                    } else if (currentRank !== null && previousRank === null) {
                        // 신규 진입인 경우
                        changeElement.textContent = 'NEW';
                        changeElement.className = 'rank-change new';
                    } else {
                        changeElement.textContent = '-';
                        changeElement.className = 'rank-change';
                    }
                } else {
                    changeElement.textContent = '-';
                    changeElement.className = 'rank-change';
                }
            }
        }

        // 업데이트 시간 표시: rank_history.json의 최신 타임스탬프 사용 (YYYY-MM-DD HH:00:00)
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            try {
                const latestRaw = latestTimestamp; // 예: '2025-09-01 20:00:00'
                // 'YYYY-MM-DD HH:MM:SS' → Date로 파싱 (KST로 표기 목적 포맷팅)
                const [datePart, timePart] = latestRaw.split(' ');
                const [y, m, d] = datePart.split('-').map(Number);
                const [hh, mm] = timePart.split(':').map(Number);
                const updateDate = new Date(y, (m - 1), d, hh, mm || 0, 0);
                const year = updateDate.getFullYear();
                const month = String(updateDate.getMonth() + 1).padStart(2, '0');
                const date = String(updateDate.getDate()).padStart(2, '0');
                const hour = String(updateDate.getHours()).padStart(2, '0');
                const minute = String(updateDate.getMinutes()).padStart(2, '0');
                updateElement.textContent = `${year}.${month}.${date}.${hour}:${minute}`;
            } catch (_) {
                // 파싱 실패 시 하드코딩 제거하고 빈 값 처리
                updateElement.textContent = '';
            }
        }

    } catch (error) {
        console.error('실시간 차트 현황 업데이트 실패:', error);
    }
}

function goToStreaming(service) {
    const streamingData = {
        melon: { mobileUrl: 'melonapp://play/album/11814158', webUrl: 'https://www.melon.com/album/detail.htm?albumId=11814158' },
        genie: { mobileUrl: 'genieapp://play/album/11814158', webUrl: 'https://www.genie.co.kr/detail/songInfo?xgnm=37705982' },
        bugs: { mobileUrl: 'bugsapp://play/album/11814158', webUrl: 'https://music.bugs.co.kr/track/34440751' },
        vibe: { mobileUrl: 'vibeapp://play/album/11814158', webUrl: 'https://vibe.naver.com/track/28574653' },
        flo: { mobileUrl: 'floapp://play/album/11814158', webUrl: 'https://www.music-flo.com/detail/track/421503988' }
    };
    const url = /Mobi|Android/i.test(navigator.userAgent) ? streamingData[service].mobileUrl : streamingData[service].webUrl;
    window.open(url, '_blank');
}

function openGroupBuy(type) {
    let message = '';
    switch(type) {
        case 'album':
            message = '앨범 공동구매에 참여하시겠습니까?';
            break;
        case 'streaming':
            message = '스트리밍 패스 공동구매에 참여하시겠습니까?';
            break;
    }
    
    if (confirm(message)) {
        alert('공동구매 참여 신청이 완료되었습니다! 참여자 수가 모집되면 연락드리겠습니다.');
    }
}

// 유튜브 조회수/좋아요 가져오기 (실제 데이터)
async function loadYouTubeStats() {
    try {
        const response = await fetch('youtube_stats.json?ts=' + Date.now());
        
        if (response.ok) {
            const data = await response.json();
            
            // 홈 섹션의 표시 요소(ID는 youtube-views / youtube-likes)
            const viewCountElement = document.getElementById('youtube-views');
            const likeCountElement = document.getElementById('youtube-likes');
            
            if (viewCountElement) {
                viewCountElement.textContent = data.view_count_formatted || '-';
            }
            if (likeCountElement) {
                likeCountElement.textContent = data.like_count_formatted || '-';
            }
            // 업데이트 시간: 실시간 차트와 동일하게 표기 (chart lastUpdate와 동일 문자열 사용)
            const timeEl = document.getElementById('youtube-update-time');
            const chartTimeEl = document.getElementById('lastUpdate');
            if (timeEl && chartTimeEl && chartTimeEl.textContent) {
                timeEl.textContent = chartTimeEl.textContent;
            }
            
            console.log('✅ YouTube 통계 로드 성공:', data);
        } else {
            throw new Error('YouTube 통계 파일을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ YouTube 통계 로드 실패:', error);
        
        // 실패한 경우 기본값 표시(하드코딩 숫자 금지)
        const viewCountElement = document.getElementById('youtube-views');
        const likeCountElement = document.getElementById('youtube-likes');
        if (viewCountElement) viewCountElement.textContent = '-';
        if (likeCountElement) likeCountElement.textContent = '-';
    }
}

// 사이드 메뉴 토글 함수
function toggleSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (sideMenu.classList.contains('active')) {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    } else {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
    }
}

// 메뉴 네비게이션 함수
function navigateTo(page) {
    switch(page) {
        case 'guide':
            // 가이드 섹션으로 이동
            if (typeof showGuideMenu === 'function') {
                showGuideMenu();
            } else {
                alert('가이드 기능은 준비 중입니다.');
            }
            break;
        case 'streaming':
            // 스트리밍 섹션으로 스크롤
            const streamingSection = document.querySelector('.streaming-section');
            if (streamingSection) {
                streamingSection.scrollIntoView({ behavior: 'smooth' });
            }
            break;
        case 'vote':
            alert('투표 기능은 준비 중입니다.');
            break;
        case 'support':
            alert('서포트 기능은 준비 중입니다.');
            break;
    }
    
    // 메뉴 닫기
    toggleSideMenu();
}

// 아코디언 토글
function toggleMenuSection(headerEl) {
    const section = headerEl.closest('.menu-section');
    if (!section) return;
    section.classList.toggle('open');
}

// 서브메뉴 네비게이션 (탭바 하위 메뉴와 동일 화면으로 연결)
function navigateToMenu(key) {
    // 기본 동작: 메뉴 닫기
    toggleSideMenu();

    switch (key) {
        // 가이드 하위: 상세 화면으로 직접 이동
        case 'guide-download':
            go({ view: 'guideDownload' });
            break;
        case 'guide-id':
            go({ view: 'guideId' });
            break;
        // 스트리밍 상세 화면으로 이동
        case 'guide-streaming':
            // 이미 상세로 이동하지만, 네비게이션/사이드에서도 동일 정책 유지
            go({ view: 'guideStreaming' });
            break;
        case 'guide-cheer':
            openGuide('cheer');
            break;
        case 'guide-radio':
            openGuide('radio');
            break;

        // 스트리밍 하위: 동일 동작 수행
        case 'streaming-list':
            toggleMainSections(true);
            openStreamingSheet();
            break;
        case 'streaming-recommend':
            go({ view: 'streamingRecommend' });
            break;
        case 'streaming-mv':
            go({ view: 'streamingMV' });
            break;

        // 투표 하위: 상세로 이동
        case 'vote-weight':
            openVoteRate();
            break;
        case 'vote-collect':
            openVoteCollect();
            break;
        case 'vote-schedule':
            openVoteSchedule();
            break;

        // 서포트 하위: 각 상세로 이동
        case 'support-helper':
            go({ view: 'support', type: 'helper' });
            break;
        case 'support-team':
            go({ view: 'support', type: 'team' });
            break;
        case 'support-id-donate':
            go({ view: 'support', type: 'id' });
            break;
        case 'support-funding':
            go({ view: 'support', type: 'fundraising' });
            break;

        default:
            console.log('navigateToMenu:', key);
    }
}

// Footer 액션 함수
function openFooterAction(action) {
    switch(action) {
        case 'guide':
            go({ view: 'guideHubMain' });
            break;
        case 'streaming':
            // 스트리밍 허브(메뉴)로 이동
            go({ view: 'guideHubStreaming' });
            break;
        case 'home':
            go({ view: 'home' });
            break;
        case 'vote':
            go({ view: 'guideHubVote' });
            break;
        case 'support':
            go({ view: 'guideHubSupport' });
            break;
        default:
            console.log('알 수 없는 액션:', action);
    }
}

function showGuideHub(type){
    const hubs = ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'];
    hubs.forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    let targetId = 'guideHubStreaming';
    if (type === 'vote') targetId = 'guideHubVote';
    if (type === 'support') targetId = 'guideHubSupport';
    const target = document.getElementById(targetId);
    if (target){
        toggleMainSections(false);
        const guideSection = document.getElementById('guideSection');
        if (guideSection) guideSection.style.display = 'none';
        // 아이디/다운로드 상세는 허브 진입 시 숨김
        hideGuideIdSection();
        hideGuideDownloadSection();
        hideGuideStreamingSection();
        hideGuideChantSection();
        hideGuideRadioSection();
        hideVoteCollectSection();
        hideVoteRateSection();
        hideAllSupportSections();
        hideVoteScheduleSection();
        target.style.display = 'block';
        target.scrollIntoView({behavior:'smooth', block:'start'});
    }
}

function toggleMainSections(show){
    const display = show ? 'block' : 'none';
    const mainSelectors = ['.artist-hero', '.quick-links-section', '.chart-status-section', '.youtube-section'];
    mainSelectors.forEach(sel=>{
        document.querySelectorAll(sel).forEach(el=>{ el.style.display = display; });
    });
}

function showHome(){
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    toggleMainSections(true);
    const guideSection = document.getElementById('guideSection');
    if (guideSection) guideSection.style.display = 'none';
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideVoteRateSection();
    hideAllSupportSections();
    hideVoteScheduleSection();
    hideStreamingMVSection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showGuideSection(){
    // 모든 허브 숨기고 메인도 숨김
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    toggleMainSections(false);
    const guideSection = document.getElementById('guideSection');
    if (guideSection){
        hideGuideIdSection();
        hideGuideDownloadSection();
        hideAllSupportSections();
        hideVoteScheduleSection();
        guideSection.style.display = 'block';
        guideSection.scrollIntoView({behavior:'smooth', block:'start'});
    }
}

function showGuideMainHub(){
    // 메인/가이드 섹션 숨기고 가이드 허브 메인 노출
    toggleMainSections(false);
    const guideSection = document.getElementById('guideSection');
    if (guideSection) guideSection.style.display = 'none';
    ['guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideAllSupportSections();
    hideVoteScheduleSection();
    const mainHub = document.getElementById('guideHubMain');
    if (mainHub){
        mainHub.style.display = 'block';
        mainHub.scrollIntoView({behavior:'smooth', block:'start'});
    }
}

function openGuide(kind){
    // 메인/허브 숨기기
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    // 기존 가이드 섹션 숨김
    const legacyGuide = document.getElementById('guideSection');
    if (legacyGuide) legacyGuide.style.display = 'none';
    
    // 서포트 섹션들도 숨김
    hideAllSupportSections();
    hideVoteScheduleSection();
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideStreamingMVSection();

    // 아이디 생성 전용 화면
    if (kind === 'id') {
        const idSection = document.getElementById('guideIdSection');
        if (idSection) {
            idSection.style.display = 'block';
            // 초기 로드: 듀얼 넘버가 기본 활성 상태로 보이도록
            if (typeof switchIdSubTab === 'function') switchIdSubTab('dual', document.querySelector('.id-subtab[data-sub="dual"]'));
            // 페이지 상단으로 이동 (새 페이지처럼 보이도록)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            enableDragScroll(idSection.querySelector('.id-subtabs'));
        }
        return;
    }

    // 다운로드 전용 화면
    if (kind === 'download') {
        const dlSection = document.getElementById('guideDownloadSection');
        if (dlSection) {
            dlSection.style.display = 'block';
            switchDownloadCategory('audio', document.querySelector('#downloadCategoryTabs .id-subtab[data-cat="audio"]'));
            // 페이지 상단으로 이동 (새 페이지처럼 보이도록)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            enableDragScroll(dlSection.querySelector('.id-subtabs, .download-subtabs'));
        }
        return;
    }

    // 스트리밍 전용 화면
    if (kind === 'streaming') {
        const stSection = document.getElementById('guideStreamingSection');
        if (stSection) {
            stSection.style.display = 'block';
            const defaultBtn = document.querySelector('#guideStreamingSection .download-subtab[data-sub="melon"]');
            const firstBtn = document.querySelector('#guideStreamingSection .id-subtab[data-sub="melon"]') || defaultBtn;
            if (typeof switchStreamTab === 'function') switchStreamTab('melon', firstBtn);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            enableDragScroll(stSection.querySelector('.id-subtabs'));
        }
        return;
    }

    // 응원법 전용 화면
    if (kind === 'cheer') {
        const section = document.getElementById('guideChantSection');
        if (section) {
            section.style.display = 'block';
            if (typeof switchChantTab === 'function') switchChantTab('handsup', section.querySelector('.id-subtab[data-sub="handsup"]'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            enableDragScroll(section.querySelector('.id-subtabs'));
        }
        return;
    }

    // 라디오 신청 전용 화면
    if (kind === 'radio') {
        const section = document.getElementById('guideRadioSection');
        if (section){
            section.style.display = 'block';
            const dateEl = document.getElementById('guideRadioDate');
            if (dateEl){ const d = new Date(); const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; dateEl.textContent = fmt; }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
    }

    // 다른 가이드는 추후 연결. 일단 허브로 복귀
    showGuideMainHub();
}

// Enable drag-to-scroll for overflow rows
function enableDragScroll(container){
    if (!container) return;
    container.classList.add('drag-scroll');
    let isDown = false; let startX = 0; let scrollLeft = 0;
    container.addEventListener('mousedown', (e)=>{ isDown = true; container.classList.add('dragging'); startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; });
    container.addEventListener('mouseleave', ()=>{ isDown = false; container.classList.remove('dragging'); });
    container.addEventListener('mouseup', ()=>{ isDown = false; container.classList.remove('dragging'); });
    container.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const x = e.pageX - container.offsetLeft; const walk = (x - startX) * 1; container.scrollLeft = scrollLeft - walk; });
}

// Vote: 투표권 모으기 열기
function openVoteCollect(){
    // 메인/허브 숨기고 상세 표시
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideStreamingMVSection();
    hideVoteRateSection();
    hideAllSupportSections();
    const section = document.getElementById('voteCollectSection');
    if (section){
        section.style.display = 'block';
        const firstBtn = document.querySelector('#voteCollectSection .id-subtab[data-sub="showchampion"]');
        if (typeof switchVoteCollectTab === 'function') switchVoteCollectTab('showchampion', firstBtn);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function switchVoteCollectTab(sub, btn){
    currentVoteCollectSub = sub;
    document.querySelectorAll('#voteCollectSection .id-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const titleEl = document.getElementById('voteCollectTitle');
    const dateEl = document.getElementById('voteCollectDate');
    const container = document.querySelector('#voteCollectSection .guide-id-image-container');
    const titleMap = {
        showchampion: '쇼챔 투표권 모으기',
        musicbank: '뮤직뱅크 투표권 모으기',
        musiccore: '쇼음악중심 투표권 모으기',
        inkigayo: '인기가요 투표권 모으기',
        mcountdown: '엠카 투표 가이드'
    };
    if (titleEl) titleEl.textContent = titleMap[sub] || '투표권 모으기';
    if (dateEl){
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        dateEl.textContent = fmt;
    }
    const map = {
        showchampion: ['styles/assets/vote/collect/2. 쇼챔 투표권 모으기.png'],
        musicbank: ['styles/assets/vote/collect/3. 뮤직뱅크 투표권 모으기.png'],
        musiccore: ['styles/assets/vote/collect/4. 쇼음악중심 투표권 모으기.png'],
        inkigayo: [
            'styles/assets/vote/collect/5-1. 인기가요 투표권 모으기(사전투표).png',
            'styles/assets/vote/collect/5-2. 인기가요 투표권 모으기(실시간투표).png'
        ],
        mcountdown: ['styles/assets/vote/collect/6. 엠카 투표 가이드.png']
    };
    const imgs = map[sub] || [];
    if (container && imgs.length) {
        container.innerHTML = imgs.map(src => `<img class="guide-id-image" src="${src}" alt="투표권 모으기 가이드 이미지"/>`).join('');
    }
}

function switchChantTab(sub, btn){
    currentChantSub = sub;
    document.querySelectorAll('#guideChantSection .id-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const titleEl = document.getElementById('guideChantTitle');
    const dateEl = document.getElementById('guideChantDate');
    const container = document.getElementById('chantImagesContainer');
    const trackTabs = document.getElementById('chantTrackSubtabs');
    const titleMap = { handsup:'Hands Up', wish:'WISH', songbird:'Songbird', steady:'Steady', miracle:'Miracle', poppop:'poppop', color:'COLOR' };
    if (titleEl) titleEl.textContent = `응원법 · ${titleMap[sub] || ''}`;
    if (dateEl){ const d = new Date(); const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; dateEl.textContent = fmt; }
    const trackMap = {
        handsup: [ { key:'handsup_jp', label:'Hands Up(日)', imgs:['styles/assets/guide/chant/1. Hands Up 응원법(日).jpg'] }, { key:'wego_jp', label:'We Go!(日)', imgs:['styles/assets/guide/chant/2. We Go! 응원법(日).jpg'] }, { key:'wego_kr', label:'We Go!(韓)', imgs:['styles/assets/guide/chant/7. We Go! 응원법(韓).jpeg'] } ],
        wish: [ { key:'wish', label:'WISH', imgs:['styles/assets/guide/chant/3. WISH 응원법.jpg'] }, { key:'sailaway', label:'Sail Away', imgs:['styles/assets/guide/chant/4. Sail Away 응원법.jpg'] } ],
        songbird: [ { key:'songbird', label:'Songbird', imgs:['styles/assets/guide/chant/5. Songbird 응원법.jpg'] } ],
        steady: [ { key:'steady', label:'Steady', imgs:['styles/assets/guide/chant/9. Steady 응원법.jpg'] }, { key:'dunkshot', label:'Dunk Shot', imgs:['styles/assets/guide/chant/8. Dunk Shot 응원법.jpg'] }, { key:'handsup_kr', label:'Hands Up(韓)', imgs:['styles/assets/guide/chant/6. Hands Up 응원법(韓).jpeg'] } ],
        miracle: [ { key:'miracle', label:'Miracle', imgs:['styles/assets/guide/chant/10. Miracle 응원법.jpg'] } ],
        poppop: [ { key:'poppop', label:'poppop', imgs:['styles/assets/guide/chant/11. poppop 응원법.jpg'] } ],
        color: [ { key:'surf', label:'Surf', imgs:['styles/assets/guide/chant/12. Surf 응원법.jpg'] }, { key:'color', label:'COLOR', imgs:['styles/assets/guide/chant/13. COLOR 응원법.jpeg'] } ]
    };
    const tracks = trackMap[sub] || [];
    if (trackTabs){
        trackTabs.innerHTML = tracks.map((t,i)=>`<button class=\"id-subtab ${i===0?'active':''}\" data-track=\"${t.key}\" onclick=\"switchChantTrack('${t.key}', this)\">${t.label}</button>`).join('');
        enableDragScroll(trackTabs);
    }
    if (tracks.length){ switchChantTrack(tracks[0].key, trackTabs.querySelector('.id-subtab')); } else { container.innerHTML=''; }
}

function switchChantTrack(trackKey, btn){
    currentChantTrack = trackKey;
    const trackTabs = document.getElementById('chantTrackSubtabs');
    if (trackTabs){ trackTabs.querySelectorAll('.id-subtab').forEach(t=>t.classList.remove('active')); if (btn) btn.classList.add('active'); }
    const container = document.getElementById('chantImagesContainer');
    const all = {
        handsup_jp:['styles/assets/guide/chant/1. Hands Up 응원법(日).jpg'],
        wego_jp:['styles/assets/guide/chant/2. We Go! 응원법(日).jpg'],
        wego_kr:['styles/assets/guide/chant/7. We Go! 응원법(韓).jpeg'],
        wish:['styles/assets/guide/chant/3. WISH 응원법.jpg'],
        sailaway:['styles/assets/guide/chant/4. Sail Away 응원법.jpg'],
        songbird:['styles/assets/guide/chant/5. Songbird 응원법.jpg'],
        steady:['styles/assets/guide/chant/9. Steady 응원법.jpg'],
        dunkshot:['styles/assets/guide/chant/8. Dunk Shot 응원법.jpg'],
        handsup_kr:['styles/assets/guide/chant/6. Hands Up 응원법(韓).jpeg'],
        miracle:['styles/assets/guide/chant/10. Miracle 응원법.jpg'],
        poppop:['styles/assets/guide/chant/11. poppop 응원법.jpg'],
        surf:['styles/assets/guide/chant/12. Surf 응원법.jpg'],
        color:['styles/assets/guide/chant/13. COLOR 응원법.jpeg']
    };
    const imgs = all[trackKey] || [];
    if (container){ container.innerHTML = imgs.map(src=>`<div class=\"guide-id-image-container\"><img class=\"guide-id-image\" src=\"${src}\" alt=\"응원법\"/></div>`).join(''); }
}

function hideGuideStreamingSection(){
    const stSection = document.getElementById('guideStreamingSection');
    if (stSection) stSection.style.display = 'none';
}

function hideGuideChantSection(){
    const ch = document.getElementById('guideChantSection');
    if (ch) ch.style.display = 'none';
}

function hideGuideRadioSection(){
    const el = document.getElementById('guideRadioSection');
    if (el) el.style.display = 'none';
}

function hideVoteCollectSection(){
    const el = document.getElementById('voteCollectSection');
    if (el) el.style.display = 'none';
}

function hideStreamingMVSection(){
    const el = document.getElementById('streamingMVSection');
    if (el) el.style.display = 'none';
}

function hideStreamingRecommendSection(){
    const el = document.getElementById('streamingRecommendSection');
    if (el) el.style.display = 'none';
}

function openStreamingMV(){
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    hideAllSupportSections();
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideVoteRateSection();
    hideVoteScheduleSection();
    const section = document.getElementById('streamingMVSection');
    if (section){
        section.style.display = 'block';
        // 데이터 바인딩: 홈과 동일 데이터 사용
        const v = document.getElementById('youtube-views');
        const l = document.getElementById('youtube-likes');
        const tv = document.getElementById('mv-youtube-views');
        const tl = document.getElementById('mv-youtube-likes');
        const ttime = document.getElementById('mv-update-time');
        const stime = document.getElementById('youtube-update-time');
        if (v && tv) tv.textContent = v.textContent || '-';
        if (l && tl) tl.textContent = l.textContent || '-';
        if (stime && ttime) ttime.textContent = stime.textContent || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function openStreamingRecommend(){
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    hideAllSupportSections();
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideStreamingMVSection();
    hideVoteRateSection();
    hideVoteScheduleSection();
    const section = document.getElementById('streamingRecommendSection');
    if (section){ section.style.display='block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
}

function openVoteRate(){
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    hideAllSupportSections();
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideStreamingMVSection();
    hideVoteScheduleSection();
    const section = document.getElementById('voteRateSection');
    if (section){ section.style.display='block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
}

function openVoteSchedule(){
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    hideAllSupportSections();
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideStreamingMVSection();
    hideVoteRateSection();
    const section = document.getElementById('voteScheduleSection');
    if (section){ section.style.display='block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
}

// ===== 간단 라우팅: 상태 관리 =====
function go(state){
    history.pushState(state, '');
    renderState(state);
}

function renderState(state){
    if (!state || !state.view) state = { view: 'home' };
    hideAllContentSections();
    switch(state.view){
        case 'home':
            showHome();
            if (state.anchor) {
                scrollToSection(state.anchor);
            }
            break;
        case 'guideHubMain':
            showGuideMainHub();
            break;
        case 'guideHubStreaming':
            showGuideHub('streaming');
            break;
        case 'streamingMV':
            openStreamingMV();
            break;
        case 'guideHubVote':
            showGuideHub('vote');
            break;
        case 'guideHubSupport':
            showGuideHub('support');
            break;
        case 'streamingRecommend':
            openStreamingRecommend();
            break;
        case 'voteSchedule':
            openVoteSchedule();
            break;
        case 'voteRate':
            openVoteRate();
            break;
        case 'guideId':
            openGuide('id');
            break;
        case 'guideDownload':
            openGuide('download');
            break;
        case 'guideStreaming':
            openGuide('streaming');
            break;
        case 'guideChant':
            openGuide('cheer');
            break;
        case 'guideRadio':
            openGuide('radio');
            break;
        case 'support':
            openSupport(state.type);
            break;
        default:
            showHome();
    }
}

// Hide everything helper
function hideAllContentSections(){
    // Hide hubs
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport','guideSection'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    // Hide details
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideStreamingMVSection();
    hideStreamingRecommendSection();
    hideVoteRateSection();
    hideAllSupportSections();
}

// 해시 → 화면 라우팅 (공유 URL 지원)
window.addEventListener('hashchange', routeFromHash);
function routeFromHash(){
    const hash = (location.hash || '').replace(/^#/,'');
    if (!hash) return;
    const [path, query] = hash.split('?');
    const params = new URLSearchParams(query || '');
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return;
    if (parts[0] === 'home') { showHome(); return; }
    if (parts[0] === 'guide'){
        if (parts[1] === 'id') { openGuide('id'); const tab = params.get('tab') || 'dual'; switchIdSubTab(tab, document.querySelector(`.id-subtab[data-sub="${tab}"]`)); return; }
        if (parts[1] === 'download') { 
            openGuide('download');
            const cat = params.get('cat') || 'audio';
            const svc = params.get('svc') || 'melon';
            switchDownloadCategory(cat, document.querySelector(`#downloadCategoryTabs .id-subtab[data-cat="${cat}"]`));
            switchDownloadService(svc, document.querySelector(`#downloadServiceTabs .id-subtab[data-svc="${svc}"]`));
            return; 
        }
        if (parts[1] === 'streaming') { openGuide('streaming'); const tab = params.get('tab') || 'melon'; switchStreamTab(tab, document.querySelector(`#guideStreamingSection .id-subtab[data-sub="${tab}"]`)); return; }
        if (parts[1] === 'cheer') { 
            openGuide('cheer'); 
            const album = params.get('album') || params.get('tab') || 'handsup';
            switchChantTab(album, document.querySelector(`#guideChantSection .id-subtab[data-sub="${album}"]`));
            const track = params.get('track');
            if (track){ switchChantTrack(track, document.querySelector(`#chantTrackSubtabs .id-subtab[data-track="${track}"]`)); }
            return; 
        }
        if (parts[1] === 'radio') { openGuide('radio'); return; }
        showGuideMainHub(); return;
    }
    if (parts[0] === 'streaming' && parts[1] === 'mv'){
        openStreamingMV(); return;
    }
    if (parts[0] === 'streaming' && parts[1] === 'recommend'){
        openStreamingRecommend(); return;
    }
    if (parts[0] === 'vote' && parts[1] === 'collect'){
        openVoteCollect(); const tab = params.get('tab') || 'showchampion'; switchVoteCollectTab(tab, document.querySelector(`#voteCollectSection .id-subtab[data-sub="${tab}"]`)); return;
    }
    if (parts[0] === 'vote' && parts[1] === 'rate'){
        openVoteRate(); return;
    }
    if (parts[0] === 'support'){
        openSupport(parts[1] || 'helper'); return;
    }
}

function hideGuideIdSection(){
    const idSection = document.getElementById('guideIdSection');
    if (idSection) idSection.style.display = 'none';
}

function hideGuideDownloadSection(){
    const dlSection = document.getElementById('guideDownloadSection');
    if (dlSection) dlSection.style.display = 'none';
}

function hideVoteRateSection(){
    const el = document.getElementById('voteRateSection');
    if (el) el.style.display = 'none';
}

function hideVoteScheduleSection(){
    const el = document.getElementById('voteScheduleSection');
    if (el) el.style.display = 'none';
}

function hideAllSupportSections(){
    hideSupportHelperSection();
    hideSupportTeamSection();
    hideSupportIdSection();
    hideSupportFundraisingSection();
}

// 원클릭 바로가기 액션
function openQuickLink(key){
    switch(key){
        case 'streaming-list':
            openStreamingSheet();
            break;
        case 'melon-musicwave':
            window.open('https://kko.kakao.com/eNl78XPbMn', '_blank');
            break;
        case 'musiccore-sms':
            window.location.href = 'sms:%230505?&body=NCT%20WISH';
            break;
        case 'radio-request':
            window.open('https://sites.google.com/view/nctwishradio/', '_blank');
            break;
        case 'streaming-mv-detail':
            go({ view: 'streamingMV' });
            break;
        default:
            console.log('openQuickLink:', key);
    }
}

function goHome(){
    go({ view: 'home' });
}

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
    document.querySelectorAll('.id-subtab').forEach(t=>t.classList.remove('active'));
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
                    <img class="guide-dual-img" src="styles/assets/guide/generateid/dual/kt.PNG?v=20260420" alt="KT 듀얼 넘버 가이드" />
                </div>
                <div class="guide-dual-card">
                    <h3 class="guide-dual-title">SKT</h3>
                    <img class="guide-dual-img" src="styles/assets/guide/generateid/dual/skt.PNG?v=20260420" alt="SKT 듀얼 넘버 가이드" />
                </div>
                <div class="guide-dual-card">
                    <h3 class="guide-dual-title">U+</h3>
                    <img class="guide-dual-img" src="styles/assets/guide/generateid/dual/lgu.PNG?v=20260420" alt="U+ 듀얼 넘버 가이드" />
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
            targetImg.src = (sub === 'bugs') ? 'styles/assets/guide/generateid/bugs.png?v=20260420' : 'styles/assets/guide/generateid/genie.png?v=20260420';
        }
    }
}

function openIdShortcut(){
    alert('바로가기 링크는 준비 중입니다.');
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
    const titleMap = { melon:'멜론 다운로드', bugs:'벅스 다운로드', genie:'지니 다운로드' };
    if (titleEl) titleEl.textContent = titleMap[sub] || '다운로드 가이드';
    if (dateEl){
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        dateEl.textContent = fmt;
    }

    const map = {
        audio: {
            melon: ['styles/assets/guide/download/1. 멜론 음원 다운로드 가이드.jpeg'],
            genie: ['styles/assets/guide/download/2. 지니 음원 다운로드 가이드.jpeg'],
            bugs: ['styles/assets/guide/download/3. 벅스 음원 다운로드 가이드.JPG']
        },
        mv: {
            melon: [
                'styles/assets/guide/download/5. 멜론 뮤직비디오 다운로드 가이드(1).png',
                'styles/assets/guide/download/6. 멜론 뮤직비디오 다운로드 가이드(2).png'
            ],
            bugs: ['styles/assets/guide/download/7. 벅스 뮤직비디오 다운로드 가이드.png']
        }
    };
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
            <button class=\"id-subtab\" data-svc=\"bugs\" onclick=\"switchDownloadService('bugs', this)\">벅스</button>`;
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

// ===== Hero slider =====
let heroIndex = 0; let heroTimer = null; let heroStartX=0; let heroIsDragging=false; let heroDeltaX=0;
function initHeroSlider(){
    const slider = document.getElementById('heroSlider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    const dotsWrap = document.getElementById('heroDots');
    if (dotsWrap){
        dotsWrap.innerHTML = Array.from(slides).map((_,i)=>`<button aria-label="${i+1}번 배너" onclick="setHero(${i})"></button>`).join('');
    }
    setHero(0, true);
    startHeroAuto();
    slider.addEventListener('mouseenter', stopHeroAuto);
    slider.addEventListener('mouseleave', startHeroAuto);
    // Drag / swipe
    const track = document.getElementById('heroTrack');
    if (track){
        const onStart = (x)=>{ heroIsDragging=true; heroStartX=x; heroDeltaX=0; track.style.transition='none'; track.classList.add('dragging'); };
        const onMove = (x)=>{ if(!heroIsDragging) return; heroDeltaX = x-heroStartX; track.style.transform = `translateX(${(-heroIndex*100) + (heroDeltaX/window.innerWidth*100)}%)`; };
        const onEnd = ()=>{ if(!heroIsDragging) return; heroIsDragging=false; track.style.transition='transform .35s ease'; track.classList.remove('dragging'); if(Math.abs(heroDeltaX) > window.innerWidth*0.15){ setHero(heroIndex + (heroDeltaX<0?1:-1)); } else { setHero(heroIndex); } };
        track.addEventListener('mousedown', e=>onStart(e.pageX));
        window.addEventListener('mousemove', e=>onMove(e.pageX));
        window.addEventListener('mouseup', onEnd);
        track.addEventListener('touchstart', e=>onStart(e.touches[0].clientX), {passive:true});
        track.addEventListener('touchmove', e=>onMove(e.touches[0].clientX), {passive:true});
        track.addEventListener('touchend', onEnd);
    }
}
function setHero(i, immediate){
    const slider = document.getElementById('heroSlider'); if(!slider) return;
    const track = document.getElementById('heroTrack');
    const slides = slider.querySelectorAll('.hero-slide'); const dots = document.querySelectorAll('#heroDots button');
    heroIndex = (i+slides.length)%slides.length;
    if (track){ track.style.transition = immediate ? 'none' : 'transform .35s ease'; track.style.transform = `translateX(${-heroIndex*100}%)`; }
    dots.forEach((d,idx)=>{ d.classList.toggle('active', idx===heroIndex); });
}
function heroNext(){ setHero(heroIndex+1); }
function heroPrev(){ setHero(heroIndex-1); }
function startHeroAuto(){ stopHeroAuto(); heroTimer = setInterval(()=>setHero(heroIndex+1), 5000); }
function stopHeroAuto(){ if(heroTimer){ clearInterval(heroTimer); heroTimer=null; } }

// ===== Guide: 스트리밍 전용 로직 =====
async function switchStreamTab(sub, btn){
    currentStreamSub = sub;
    // 스트리밍 탭은 id-subtab 스타일을 사용. 과거 클래스가 남았을 가능성도 함께 제거
    document.querySelectorAll('#guideStreamingSection .id-subtab, #guideStreamingSection .download-subtab').forEach(t=>t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const titleEl = document.getElementById('guideStreamTitle');
    const dateEl = document.getElementById('guideStreamDate');
    const container = document.querySelector('#guideStreamingSection .guide-id-image-container');
    const titleMap = { melon:'멜론 스트리밍 가이드', bugs:'벅스 스트리밍 가이드', genie:'지니 스트리밍 가이드', flo:'플로 스트리밍 가이드', vibe:'바이브 스트리밍 가이드', mv:'뮤직비디오 스트리밍 가이드' };
    if (titleEl) titleEl.textContent = titleMap[sub] || '스트리밍 가이드';
    if (dateEl){
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        dateEl.textContent = fmt;
    }

    const map = {
        melon: [
            'styles/assets/guide/stream/멜론 스트리밍 가이드(모바일).png',
            'styles/assets/guide/stream/멜론 스트리밍 가이드(PC).png'
        ],
        genie: [
            'styles/assets/guide/stream/지니 스트리밍 가이드(모바일).png',
            'styles/assets/guide/stream/지니 스트리밍 가이드(PC).png'
        ],
        bugs: [
            'styles/assets/guide/stream/벅스 스트리밍 가이드(모바일).png',
            'styles/assets/guide/stream/벅스 스트리밍 가이드(PC).png'
        ],
        flo: [
            'styles/assets/guide/stream/플로 스트리밍 가이드(모바일).png',
            'styles/assets/guide/stream/플로 스트리밍 가이드(PC).png'
        ],
        vibe: [
            'styles/assets/guide/stream/바이브 스트리밍 가이드(모바일).png',
            'styles/assets/guide/stream/바이브 스트리밍 가이드(PC).png'
        ],
        mv: ['styles/assets/guide/stream/뮤직비디오 스트리밍 가이드.png']
    };
    const imgs = map[sub] || [];
    if (container && imgs.length) {
        container.innerHTML = imgs.map(src => `<img class="guide-id-image" src="${src}" alt="스트리밍 가이드 이미지"/>`).join('');
    }
}

function openStreamShortcut(){
    alert('바로가기 링크는 준비 중입니다.');
}

// 바텀시트 열기/닫기
function openStreamingSheet(){
    const sheet = document.getElementById('quickStreamingSheet');
    const overlay = document.getElementById('quickStreamingOverlay');
    if (overlay) overlay.classList.add('active');
    if (sheet) sheet.classList.add('active');
}
function closeStreamingSheet(){
    const sheet = document.getElementById('quickStreamingSheet');
    const overlay = document.getElementById('quickStreamingOverlay');
    if (overlay) overlay.classList.remove('active');
    if (sheet) sheet.classList.remove('active');
}

// YouTube 업데이트 시간 표시 함수
async function updateYouTubeTime() {
    // 주기적 업데이트는 loadYouTubeStats()에서 youtube_stats.json의 last_updated로 처리합니다.
}

// ===== Support 섹션 관련 함수들 =====

function openSupport(type) {
    // 메인/허브 숨기기
    toggleMainSections(false);
    ['guideHubMain','guideHubStreaming','guideHubVote','guideHubSupport'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // 기존 가이드 섹션들 숨김
    const legacyGuide = document.getElementById('guideSection');
    if (legacyGuide) legacyGuide.style.display = 'none';
    hideGuideIdSection();
    hideGuideDownloadSection();
    hideGuideStreamingSection();
    hideGuideChantSection();
    hideGuideRadioSection();
    hideVoteCollectSection();
    hideStreamingMVSection();
    hideVoteRateSection();

    // 서포트 섹션들 숨김
    hideAllSupportSections();

    if (type === 'helper') {
        const helperSection = document.getElementById('supportHelperSection');
        if (helperSection) {
            helperSection.style.display = 'block';
            // 날짜 업데이트
            updateSupportDate('supportHelperSection');
            // 페이지 상단으로 이동 (새 페이지처럼 보이도록)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else if (type === 'id') {
        const idSection = document.getElementById('supportIdSection');
        if (idSection) {
            idSection.style.display = 'block';
            // 날짜 업데이트
            updateSupportDate('supportIdSection');
            // 페이지 상단으로 이동 (새 페이지처럼 보이도록)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else if (type === 'fundraising') {
        const fundraisingSection = document.getElementById('supportFundraisingSection');
        if (fundraisingSection) {
            fundraisingSection.style.display = 'block';
            // 날짜 업데이트
            updateSupportDate('supportFundraisingSection');
            // 페이지 상단으로 이동 (새 페이지처럼 보이도록)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else if (type === 'team') {
        const teamSection = document.getElementById('supportTeamSection');
        if (teamSection) {
            teamSection.style.display = 'block';
            updateSupportDate('supportTeamSection');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function hideSupportHelperSection() {
    const helperSection = document.getElementById('supportHelperSection');
    if (helperSection) helperSection.style.display = 'none';
}

function hideSupportTeamSection() {
    const teamSection = document.getElementById('supportTeamSection');
    if (teamSection) teamSection.style.display = 'none';
}

function hideSupportIdSection() {
    const idSection = document.getElementById('supportIdSection');
    if (idSection) idSection.style.display = 'none';
}

function hideSupportFundraisingSection() {
    const fundraisingSection = document.getElementById('supportFundraisingSection');
    if (fundraisingSection) fundraisingSection.style.display = 'none';
}

function updateSupportDate(sectionId) {
    let dateEl = null;
    
    // 각 섹션별로 날짜 요소 찾기
    if (sectionId === 'supportHelperSection') {
        dateEl = document.querySelector('#supportHelperSection .support-helper-date');
    } else if (sectionId === 'supportIdSection') {
        dateEl = document.querySelector('#supportIdSection .support-id-date');
    } else if (sectionId === 'supportFundraisingSection') {
        dateEl = document.querySelector('#supportFundraisingSection .support-fundraising-date');
    } else if (sectionId === 'supportTeamSection') {
        dateEl = document.querySelector('#supportTeamSection .support-helper-date');
    }
    
    if (dateEl) {
        const d = new Date();
        const fmt = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        dateEl.textContent = fmt;
    }
}

function openHelperApplication() {
    alert('헬퍼 팀원 지원 폼은 준비 중입니다.');
}

function openTeamApplication() {
    alert('팀원 지원 폼은 준비 중입니다.');
}

function openIdDonation(service) {
    const urls = {
        'genie': 'https://forms.gle/hUX7SGLXwLpfkbPdA',
        'bugs': 'https://forms.gle/goTwoq1crirrLBmW9'
    };
    
    if (urls[service]) {
        window.open(urls[service], '_blank');
    } else {
        alert('해당 서비스의 아이디 기부 폼은 준비 중입니다.');
    }
}

function openFundraisingApplication() {
    window.open('https://forms.gle/gjPzkpwbdP4vyXYJA', '_blank');
}
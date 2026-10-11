// ===== Support 섹션 관련 함수들 =====

document.querySelectorAll('.support-section-nav a').forEach(link => {
    link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        document.querySelectorAll('.support-section-nav a').forEach(item => item.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'location');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function openSupport(type) {
    setPageMasthead('서포트');
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
    } else if (type === 'gifticon') {
        const gifticonSection = document.getElementById('supportGifticonSection');
        if (gifticonSection) {
            gifticonSection.style.display = 'block';
            updateSupportDate('supportGifticonSection');
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

function hideSupportGifticonSection() {
    const gifticonSection = document.getElementById('supportGifticonSection');
    if (gifticonSection) gifticonSection.style.display = 'none';
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
    } else if (sectionId === 'supportGifticonSection') {
        dateEl = document.querySelector('#supportGifticonSection .support-helper-date');
    }

    if (dateEl) dateEl.hidden = true;
}

async function copySupportLink(type) {
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}#support/${type}`);
}

function openHelperApplication() {
    alert('헬퍼 팀원 지원 폼은 준비 중입니다.');
}

function openTeamApplication() {
    alert('팀원 지원 폼은 준비 중입니다.');
}

function openIdDonation(service) {
    const urls = window.siteContent.participationLinks.idDonation;

    if (urls[service]) {
        window.open(urls[service], '_blank');
    } else {
        alert('해당 서비스의 아이디 기부 폼은 준비 중입니다.');
    }
}

function openFundraisingApplication() {
    window.open(window.siteContent.participationLinks.fundraising, '_blank');
}

function openGifticonDonation() {
    window.open(window.siteContent.participationLinks.gifticon, '_blank');
}

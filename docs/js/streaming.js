const streamServices = {
    melon: { name: '멜론', icon: 'styles/assets/figma/7b895.webp' },
    genie: { name: '지니', icon: 'styles/assets/figma/34632.png' },
    bugs: { name: '벅스', icon: 'styles/assets/figma/927a8.webp' },
    vibe: { name: '바이브', icon: 'styles/assets/figma/69858.webp' },
    flo: { name: '플로', icon: 'styles/assets/figma/32d70.webp' }
};

function makeStreamLink(item, className) {
    const link = document.createElement('a');
    link.className = className;
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = className === 'sheet-btn'
        ? `${streamServices[item.service].name} ${item.label}`
        : item.label;
    return link;
}

function switchStreamingPlatform(device, button) {
    const subtitle = document.getElementById('streamingDeviceSubtitle');
    if (subtitle) subtitle.textContent = `선택한 기기: ${device}`;
    document.querySelectorAll('.stream-device-tabs button').forEach(tab => {
        const active = tab === button || tab.textContent === device && !button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
    });
    const container = document.getElementById('streamingPlatformLinks');
    if (!container) return;
    container.replaceChildren();
    const useAndroidLinks = {
        iOS: ['bugs', 'vibe', 'flo'],
        PC: ['vibe', 'flo'],
        Mac: ['genie', 'bugs', 'vibe', 'flo']
    };
    Object.entries(streamServices).forEach(([key, service]) => {
        const sharedAndroid = useAndroidLinks[device]?.includes(key);
        const links = window.siteContent.oneClickStreams.filter(item => item.service === key && item.device === (sharedAndroid ? 'Android' : device));
        if (!links.length) return;
        const group = document.createElement('section');
        group.className = 'stream-service';
        const title = document.createElement('h4');
        const icon = document.createElement('img');
        icon.src = service.icon;
        icon.alt = '';
        const chip = document.createElement('span');
        chip.className = 'stream-platform-chip';
        chip.append(icon, service.name);
        const count = document.createElement('span');
        count.className = 'stream-platform-count';
        count.textContent = sharedAndroid ? `${links.length}개 링크 · Android와 동일` : `${links.length}개 링크`;
        title.append(chip, count);
        const list = document.createElement('div');
        list.className = 'stream-links';
        links.forEach(item => list.append(makeStreamLink(item, 'stream-link')));
        group.append(title, list);
        container.append(group);
    });
}

function playHomeMusicVideo() {
    const player = document.getElementById('homeMvPlayer');
    if (!player) return;
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/_t9bc8WNA1c?autoplay=1';
    iframe.title = 'NCT WISH 뮤직비디오';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
}

function updateStreamingSectionNav() {
    const hub = document.getElementById('guideHubStreaming');
    if (!hub || hub.style.display === 'none') return;
    const list = document.getElementById('stream-list');
    const activeId = list.getBoundingClientRect().top <= Math.min(window.innerHeight * 0.65, 600) ? 'stream-list' : 'stream-oneclick';
    hub.querySelectorAll('.page-section-nav a[href^="#stream-"]').forEach(link => {
        const active = link.getAttribute('href') === `#${activeId}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sheet = document.getElementById('quickStreamingLinks');
    window.siteContent.oneClickStreams.forEach(item => sheet.append(makeStreamLink(item, 'sheet-btn')));
    const tracks = document.getElementById('recommendedTracks');
    window.siteContent.recommendedTracks.forEach(track => {
        const row = document.createElement('li');
        row.textContent = track;
        tracks.append(row);
    });
    switchStreamingPlatform('Android');
    window.addEventListener('scroll', updateStreamingSectionNav, { passive: true });
    window.addEventListener('resize', updateStreamingSectionNav);
});

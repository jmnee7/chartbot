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

function updatePageSectionNav() {
    document.querySelectorAll('.guide-hub').forEach(hub => {
        if (hub.style.display === 'none') return;
        const links = [...hub.querySelectorAll('.page-section-nav a[href^="#"]')];
        const sections = links.map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
            .filter(item => item.section && hub.contains(item.section));
        if (!sections.length) return;
        const threshold = hub.id === 'guideHubSupport' ? 400 : Math.min(window.innerHeight * 0.35, 180);
        let current = { link: links[0] };
        let currentTop = -Infinity;
        const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
        if (atBottom) current = sections[sections.length - 1];
        else sections.forEach(item => {
            const top = item.section.getBoundingClientRect().top;
            if (top > threshold || top < currentTop - 1) return;
            if (top > currentTop + 1 || !current.link.hasAttribute('aria-current')) {
                current = item;
                currentTop = top;
            }
        });
        links.forEach(link => {
            const active = link === current.link;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const tracks = document.getElementById('recommendedTracks');
    window.siteContent.recommendedTracks.forEach(track => {
        const row = document.createElement('li');
        row.textContent = track;
        tracks.append(row);
    });
    switchStreamingPlatform('Android');
    window.addEventListener('scroll', updatePageSectionNav, { passive: true });
    window.addEventListener('resize', updatePageSectionNav);
});

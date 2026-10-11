const streamServices = {
    melon: { name: '멜론', icon: 'styles/assets/figma/7b895.png' },
    genie: { name: '지니', icon: 'styles/assets/figma/34632.png' },
    bugs: { name: '벅스', icon: 'styles/assets/figma/927a8.png' },
    vibe: { name: '바이브', icon: 'styles/assets/figma/69858.png' },
    flo: { name: '플로', icon: 'styles/assets/figma/32d70.png' }
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
    Object.entries(streamServices).forEach(([key, service]) => {
        const links = window.siteContent.oneClickStreams.filter(item => item.service === key && item.device === device);
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
        count.textContent = `${links.length}개 링크`;
        title.append(chip, count);
        const list = document.createElement('div');
        list.className = 'stream-links';
        links.forEach(item => list.append(makeStreamLink(item, 'stream-link')));
        group.append(title, list);
        container.append(group);
    });
}

function toggleOtherDevices(button) {
    const options = button.nextElementSibling;
    const willOpen = options.hidden;
    if (willOpen && !options.childElementCount) {
        ['Android', 'iOS', 'PC', 'Mac'].forEach(device => {
            const option = document.createElement('button');
            option.type = 'button';
            option.textContent = device;
            option.addEventListener('click', () => {
                switchStreamingPlatform(device);
                options.hidden = true;
                button.setAttribute('aria-expanded', 'false');
            });
            options.append(option);
        });
    }
    options.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
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
});

// 전역 변수로 현재 선택된 서비스와 가이드 타입 저장
let currentService = 'melon';
let currentGuideType = 'streaming';
let currentMainTab = 'music';
let currentDevice = 'mobile';

// 사용 가능한 가이드 파일 목록
const availableGuides = {
    music: {
        melon: ['pc', 'mobile'],
        genie: ['pc', 'mobile'],
        bugs: ['pc', 'mobile'],
        vibe: ['pc', 'mobile'],
        kakao: ['mobile'] // 카카오는 모바일만
    },
    mv: {
        melon: ['pc', 'mobile'],
        bugs: ['pc'] // 벅스는 PC만
    }
};

// 서비스 이름 매핑
const serviceNames = {
    melon: '멜론',
    genie: '지니',
    bugs: '벅스',
    vibe: '바이브',
    flo: '플로',
    youtube: '유튜브',
    kakao: '카카오 뮤직'
};

// 가이드 타입 이름 매핑
const typeNames = {
    streaming: '스트리밍',
    music: '음원 다운로드',
    mv: '뮤비 다운로드',
    id: '아이디 찾기'
};

// 상위 메뉴 탭 전환 함수
function switchMainTab(tab) {
    currentMainTab = tab;
    
    // 모든 상위 메뉴 탭 비활성화
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 클릭된 탭 활성화
    event.target.closest('.main-tab').classList.add('active');
    
    // 서비스 탭 전환
    if (tab === 'music') {
        document.getElementById('musicServiceTabs').style.display = 'flex';
        document.getElementById('etcServiceTabs').style.display = 'none';
        
        // 음원 가이드의 첫 번째 서비스 탭 활성화
        document.querySelectorAll('#musicServiceTabs .service-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector('#musicServiceTabs .service-tab').classList.add('active');
        currentService = 'melon';
    } else {
        document.getElementById('musicServiceTabs').style.display = 'none';
        document.getElementById('etcServiceTabs').style.display = 'flex';
        
        // 기타 가이드의 첫 번째 서비스 탭 활성화
        document.querySelectorAll('#etcServiceTabs .service-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector('#etcServiceTabs .service-tab').classList.add('active');
        currentService = 'youtube';
    }
    
    // 가이드 탭과 이미지 컨테이너 숨기기
    document.getElementById('guideTabs').style.display = 'none';
    document.getElementById('deviceTabs').style.display = 'none';
    document.querySelector('.guide-content').style.display = 'none';
}

// 서비스 탭 전환 함수
function switchServiceTab(service) {
    currentService = service;
    
    // 모든 서비스 탭 비활성화
    document.querySelectorAll('.service-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 클릭된 탭 활성화
    event.target.classList.add('active');
    
    // 가이드 탭 표시
    document.getElementById('guideTabs').style.display = 'flex';
    
    // 가이드 탭 초기화
    document.querySelectorAll('.guide-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 첫 번째 가이드 탭 활성화
    const firstGuideTab = document.querySelector('.guide-tab');
    if (firstGuideTab) {
        firstGuideTab.classList.add('active');
        currentGuideType = firstGuideTab.getAttribute('data-type');
    }
    
    // 디바이스 탭과 이미지 컨테이너 숨기기
    document.getElementById('deviceTabs').style.display = 'none';
    document.querySelector('.guide-content').style.display = 'none';
}

// 가이드 탭 전환 함수
function switchGuideTab(type) {
    currentGuideType = type;
    
    // 모든 가이드 탭 비활성화
    document.querySelectorAll('.guide-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 클릭된 탭 활성화
    event.target.classList.add('active');
    
    // 디바이스 탭 표시 (음원 다운로드나 뮤비 다운로드인 경우)
    if (type === 'music' || type === 'mv') {
        const availableDevices = availableGuides[type][currentService];
        if (availableDevices && availableDevices.length > 1) {
            // PC/모바일 둘 다 있는 경우
            document.getElementById('deviceTabs').style.display = 'flex';
            
            // 디바이스 탭 초기화
            document.querySelectorAll('.device-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 첫 번째 디바이스 탭 활성화 (모바일 우선)
            const mobileTab = document.querySelector('.device-tab[data-device="mobile"]');
            if (mobileTab) {
                mobileTab.classList.add('active');
                currentDevice = 'mobile';
            }
        } else {
            // 하나만 있는 경우
            document.getElementById('deviceTabs').style.display = 'none';
            currentDevice = availableDevices[0];
        }
        
        // 가이드 이미지 업데이트
        updateGuideImage();
        document.querySelector('.guide-content').style.display = 'block';
    } else {
        // 스트리밍이나 아이디 찾기인 경우
        document.getElementById('deviceTabs').style.display = 'none';
        updateGuideImage();
        document.querySelector('.guide-content').style.display = 'block';
    }
}

// 디바이스 탭 전환 함수
function switchDeviceTab(device) {
    currentDevice = device;
    
    // 모든 디바이스 탭 비활성화
    document.querySelectorAll('.device-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 클릭된 탭 활성화
    event.target.classList.add('active');
    
    // 가이드 이미지 업데이트
    updateGuideImage();
}

// 가이드 이미지 업데이트 함수
function updateGuideImage() {
    let imagePath;
    if (currentGuideType === 'id') {
        imagePath = `guide/id/${currentService}-id.png`;
    } else if (currentGuideType === 'streaming') {
        imagePath = `guide/streaming/${currentService}-stream.jpg`;
    } else if (currentGuideType === 'music') {
        const availableDevices = availableGuides.music[currentService];
        if (availableDevices && availableDevices.length === 1) {
            // 하나만 있는 경우 (카카오 뮤직 등)
            imagePath = `guide/down/music/${currentService}-${availableDevices[0]}.png`;
        } else {
            // PC/모바일 둘 다 있는 경우
            imagePath = `guide/down/music/${currentService}-${currentDevice}.png`;
        }
    } else if (currentGuideType === 'mv') {
        const availableDevices = availableGuides.mv[currentService];
        if (availableDevices && availableDevices.length === 1) {
            // 하나만 있는 경우 (벅스 PC만)
            imagePath = `guide/down/mv/${currentService}-${availableDevices[0]}.png`;
        } else {
            // PC/모바일 둘 다 있는 경우
            imagePath = `guide/down/mv/${currentService}-${currentDevice}.png`;
        }
    }
    
    const guideImage = document.getElementById('guideImage');
    guideImage.src = imagePath;
    // 디바이스 텍스트 결정
    let deviceText = '모바일';
    if (currentGuideType === 'music' || currentGuideType === 'mv') {
        const availableDevices = availableGuides[currentGuideType][currentService];
        if (availableDevices && availableDevices.length === 1) {
            deviceText = availableDevices[0] === 'pc' ? 'PC' : '모바일';
        } else {
            deviceText = currentDevice === 'pc' ? 'PC' : '모바일';
        }
    }
    guideImage.alt = `${serviceNames[currentService]} ${typeNames[currentGuideType]} 가이드 이미지 (${deviceText} 버전)`;
    
    // 이미지 로드 실패 시 기본 이미지 표시
    guideImage.onerror = function() {
        console.log(`이미지 로드 실패: ${imagePath}`);
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjVmNWY1Ii8+CjxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiNkZGQiLz4KPHBhdGggZD0iTTIxMCAxMjBsNjAgMzAtNjAgMzB6IiBmaWxsPSIjOTk5Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIj7siqTtirjrjJTrqoXshJzrspTslrQ8L3RleHQ+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSIxNiI+PuydtOuvuOyngCDssL3rs7XtlZzri6QuLi48L3RleHQ+Cjwvc3ZnPg==';
    };
    
    // 이미지 로드 성공 시 로그
    guideImage.onload = function() {
        console.log(`이미지 로드 성공: ${imagePath}`);
    };
}
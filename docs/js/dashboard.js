document.addEventListener('DOMContentLoaded', () => {
    updateRealTimeChartStatus();
    loadChartData();
    loadYouTubeStats(); // 유튜브 통계 로드 추가
    updateYouTubeTime(); // YouTube 업데이트 시간 표시
    setInterval(() => {
        updateRealTimeChartStatus();
        updateYouTubeTime();
    }, 60000); // 1분마다 업데이트

    // 초기 뷰 설정
    showView('dashboard');
});

function showView(viewId) {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('guide-view').style.display = 'none';

    document.getElementById(`${viewId}-view`).style.display = 'block';

    // 네비게이션 아이템 활성화/비활성화
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.onclick.toString().includes(`'${viewId}'`)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

async function updateRealTimeChartStatus() {
    try {
        const response = await fetch('rank_history.json');
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

        // 업데이트 시간 표시
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            // 병합 충돌 해결 시 선택한 더 최신 시간 사용
            const updateDate = new Date('2025-07-29 00:00:00+09:00');
            const year = updateDate.getFullYear();
            const month = String(updateDate.getMonth() + 1).padStart(2, '0');
            const date = String(updateDate.getDate()).padStart(2, '0');
            const hour = String(updateDate.getHours()).padStart(2, '0');
            const minute = String(updateDate.getMinutes()).padStart(2, '0');
            
            const timeString = `${year}.${month}.${date}.${hour}:${minute}`;
            updateElement.textContent = timeString;
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
        const response = await fetch('youtube_stats.json');
        
        if (response.ok) {
            const data = await response.json();
            
            const viewCountElement = document.getElementById('viewCount');
            const likeCountElement = document.getElementById('likeCount');
            
            if (viewCountElement) {
                viewCountElement.textContent = data.view_count_formatted || '-';
            }
            if (likeCountElement) {
                likeCountElement.textContent = data.like_count_formatted || '-';
            }
            
            console.log('✅ YouTube 통계 로드 성공:', data);
        } else {
            throw new Error('YouTube 통계 파일을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ YouTube 통계 로드 실패:', error);
        
        // 실패한 경우 기본값 표시
        const viewCountElement = document.getElementById('youtube-views');
        const likeCountElement = document.getElementById('youtube-likes');
        
        if (viewCountElement) {
            viewCountElement.textContent = '10,796,369';
        }
        if (likeCountElement) {
            likeCountElement.textContent = '347,707';
        }
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

// Footer 액션 함수
function openFooterAction(action) {
    switch(action) {
        case 'guide':
            // 가이드 섹션 보이기
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
            } else {
                alert('스트리밍 섹션을 찾을 수 없습니다.');
            }
            break;
        case 'home':
            // 홈으로 이동 (페이지 상단으로 스크롤)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case 'vote':
            alert('투표 기능은 준비 중입니다.');
            break;
        case 'support':
            alert('서포트 기능은 준비 중입니다.');
            break;
        default:
            console.log('알 수 없는 액션:', action);
    }
}

// YouTube 업데이트 시간 표시 함수
async function updateYouTubeTime() {
    // 병합 충돌 해결 시 선택한 더 최신 시간 사용
    const updateDate = new Date('2025-07-29 00:00:00+09:00');
    const year = updateDate.getFullYear();
    const month = String(updateDate.getMonth() + 1).padStart(2, '0');
    const date = String(updateDate.getDate()).padStart(2, '0');
    const hour = String(updateDate.getHours()).padStart(2, '0');
    
    const timeString = `${year}.${month}.${date}.${hour}:00`;
    const youtubeTimeElement = document.getElementById('youtube-update-time');
    if (youtubeTimeElement) {
        youtubeTimeElement.textContent = timeString;
    }
}
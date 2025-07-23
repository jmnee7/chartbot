"""
음악 차트 크롤러 메인 실행 파일
"""

import json
import os
from datetime import datetime
from crawlers.melon_crawler import MelonCrawler
from crawlers.genie_crawler import GenieCrawler
from crawlers.bugs_crawler import BugsCrawler
from crawlers.vibe_crawler import VibeCrawler
from crawlers.flo_crawler import FloCrawler
from utils import get_current_timestamp
from target_songs import is_target_song, get_target_info
from rank_tracker import RankTracker
from twitter_bot import TwitterBot


def init_crawlers():
    """
    모든 크롤러를 초기화하여 반환
    
    Returns:
        dict: 크롤러 인스턴스들의 딕셔너리
    """
    return {
        "melon": MelonCrawler(),
        "genie": GenieCrawler(),
        "bugs": BugsCrawler(),
        "vibe": VibeCrawler(),
        "flo": FloCrawler()
    }


def crawl_all_charts(crawlers, chart_type="top_100"):
    """
    모든 차트를 크롤링하여 데이터를 반환
    
    Args:
        crawlers (dict): 크롤러 인스턴스들의 딕셔너리
        chart_type (str): 차트 유형
        
    Returns:
        dict: 크롤링된 모든 차트 데이터
    """
    all_chart_data = {}
    
    for service_name, crawler in crawlers.items():
        print(f"Crawling {service_name} chart...")
        try:
            chart_data = crawler.crawl_chart(chart_type)
            all_chart_data[service_name] = chart_data
            
            # 멜론의 경우 각 차트별 결과도 별도로 저장
            if service_name == "melon" and hasattr(crawler, 'chart_results'):
                all_chart_data['melon_top100'] = crawler.chart_results.get('top100', [])
                all_chart_data['melon_hot100'] = crawler.chart_results.get('hot100', [])
                print(f"Successfully crawled {len(chart_data)} songs from {service_name}")
                print(f"  - TOP100: {len(all_chart_data['melon_top100'])} songs")
                print(f"  - HOT100: {len(all_chart_data['melon_hot100'])} songs")
            else:
                print(f"Successfully crawled {len(chart_data)} songs from {service_name}")
        except Exception as e:
            print(f"Error crawling {service_name}: {e}")
            all_chart_data[service_name] = []
    
    return all_chart_data


def filter_target_songs(chart_data, rank_tracker=None):
    """
    타겟 곡들만 필터링하여 반환 (차트아웃된 곡들도 포함)
    
    Args:
        chart_data (dict): 전체 차트 데이터
        rank_tracker (RankTracker): 순위 추적기 (이전 데이터 확인용)
        
    Returns:
        dict: 필터링된 차트 데이터
    """
    filtered_data = {}
    total_found = 0
    
    print(f"\n🎯 타겟 곡 검색 시작...")
    target_info = get_target_info()
    print(f"검색 모드: {target_info['search_mode']}")
    
    # RankTracker의 _get_song_key 메소드 사용을 위해 인스턴스 생성
    tracker = rank_tracker if rank_tracker else RankTracker()
    
    # 이전 히스토리에서 타겟 곡들 가져오기 (O(1) 검색 최적화)
    previous_target_songs = {}
    if rank_tracker and rank_tracker.history:
        latest_timestamp = max(rank_tracker.history.keys())
        previous_data = rank_tracker.history[latest_timestamp]
        
        for service_name, songs in previous_data.items():
            previous_target_songs[service_name] = {}
            for song in songs:
                if isinstance(song, dict):
                    artist = song.get('artist', '')
                    title = song.get('title', '')
                    if is_target_song(artist, title):
                        song_key = tracker._get_song_key(artist, title)
                        previous_target_songs[service_name][song_key] = song
    
    # 각 서비스별로 처리 (효율적인 처리를 위해 chart_data 키 기반으로 순회)
    service_names = ["melon_top100", "melon_hot100", "melon", "genie", "bugs", "vibe", "flo"]
    current_timestamp = datetime.now().strftime("%Y-%m-%d %H:00")
    
    for service_name in service_names:
        filtered_songs = []
        current_songs = chart_data.get(service_name, [])
        current_target_songs = set()
        
        # 현재 차트에 있는 타겟 곡들 (O(1) 검색 최적화)
        for song in current_songs:
            artist = song.get('artist', '')
            title = song.get('title', '')
            
            if is_target_song(artist, title):
                song_key = tracker._get_song_key(artist, title)
                current_target_songs.add(song_key)
                
                # timestamp 추가
                song_with_timestamp = song.copy()
                song_with_timestamp['timestamp'] = current_timestamp
                filtered_songs.append(song_with_timestamp)
                
                # 멜론의 각 차트별로 표시
                if service_name == "melon_top100":
                    print(f"✅ [MELON TOP100] {song.get('rank', 'N/A')}위: {artist} - {title}")
                elif service_name == "melon_hot100":
                    print(f"✅ [MELON HOT100] {song.get('rank', 'N/A')}위: {artist} - {title}")
                else:
                    print(f"✅ [{service_name.upper()}] {song.get('rank', 'N/A')}위: {artist} - {title}")
        
        # 차트아웃된 타겟 곡들 추가 (rank: null로 저장)
        if service_name in previous_target_songs:
            for song_key, prev_song in previous_target_songs[service_name].items():
                if song_key not in current_target_songs:
                    artist = prev_song.get('artist', '')
                    title = prev_song.get('title', '')
                    chart_out_song = {
                        'rank': None,
                        'title': title,
                        'artist': artist,
                        'album': prev_song.get('album', ''),
                        'service': prev_song.get('service', service_name),  # 실제 서비스 이름 사용
                        'timestamp': current_timestamp
                    }
                    filtered_songs.append(chart_out_song)
                    print(f"📉 [{service_name.upper()}] 차트아웃: {artist} - {title}")
        
        filtered_data[service_name] = filtered_songs
        if filtered_songs:
            if service_name == "melon_top100":
                print(f"📊 melon_top100: {len(filtered_songs)}곡 발견")
            elif service_name == "melon_hot100":
                print(f"📊 melon_hot100: {len(filtered_songs)}곡 발견")
            else:
                print(f"📊 {service_name}: {len(filtered_songs)}곡 발견")
            total_found += len(filtered_songs)
    
    print(f"\n🎵 총 {total_found}곡의 타겟 곡을 발견했습니다!")
    return filtered_data


def print_target_summary(filtered_data, rank_changes=None):
    """
    타겟 곡 요약 정보 출력 (순위 변화 포함)
    
    Args:
        filtered_data (dict): 필터링된 차트 데이터
        rank_changes (dict): 순위 변화 정보
    """
    print(f"\n" + "="*50)
    print(f"🎯 타겟 곡 검색 결과 요약")
    print(f"="*50)
    
    service_names = {
        "melon_top100": "멜론 TOP100",
        "melon_hot100": "멜론 HOT100",
        "genie": "지니", 
        "bugs": "벅스",
        "vibe": "바이브",
        "flo": "플로"
    }
    
    # 모든 서비스에 대해 결과 표시 (없으면 "-" 표시)
    for service_key, service_name in service_names.items():
        if service_key in filtered_data and filtered_data[service_key]:
            songs = filtered_data[service_key]
            print(f"\n📱 {service_name} ({len(songs)}곡)")
            print(f"-" * 30)
            
            for song in songs:
                rank = song.get('rank', 'N/A')
                title = song.get('title', 'Unknown')
                artist = song.get('artist', 'Unknown')
                
                # 순위 변화 정보 추가
                change_text = ""
                if rank_changes and service_key in rank_changes:
                    for change_info in rank_changes[service_key]:
                        if (change_info.get('artist', '') == artist and 
                            change_info.get('title', '') == title):
                            change_text = f" {change_info.get('change_text', '')}"
                            break
                
                print(f"  {rank:3}위{change_text}: {artist} - {title}")
        else:
            print(f"\n📱 {service_name} (0곡)")
            print(f"-" * 30)
            print(f"  -")
    
    # 전체 서비스별 순위 비교
    print(f"\n🏆 곡별 전체 순위 비교")
    print(f"-" * 50)
    
    # 모든 곡을 수집
    all_songs = {}
    for service_key, songs in filtered_data.items():
        for song in songs:
            title = song.get('title', '')
            artist = song.get('artist', '')
            song_key = f"{artist} - {title}"
            
            if song_key not in all_songs:
                all_songs[song_key] = {}
            
            all_songs[song_key][service_key] = song.get('rank', 'N/A')
    
    if all_songs:
        for song_key, rankings in all_songs.items():
            print(f"\n🎵 {song_key}")
            # 모든 서비스에 대해 순위 표시 (없으면 "-")
            for service_key, service_name in service_names.items():
                rank = rankings.get(service_key, "-")
                rank_display = f"{rank}위" if rank != "-" else "-"
                print(f"    {service_name}: {rank_display}")
    else:
        print(f"\n❌ 타겟 곡을 찾을 수 없습니다.")
        print(f"모든 서비스:")
        for service_key, service_name in service_names.items():
            print(f"    {service_name}: -")



def generate_html_page(chart_data, output_dir="docs", is_filtered=True):
    """
    타겟 곡 차트 데이터를 HTML 페이지로 생성 (타겟 곡 전용)
    
    Args:
        chart_data (dict): 차트 데이터
        output_dir (str): 저장할 디렉토리
        is_filtered (bool): 필터링된 데이터인지 여부 (항상 True)
    """
    # 디렉토리가 없으면 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # 현재 시간 추가
    chart_data["last_updated"] = get_current_timestamp()
    
    page_title = "🎯 타겟 음악 차트"
    
    html_content = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_title}</title>
    <style>
        body {{
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        h1 {{
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }}
        .service-section {{
            margin-bottom: 40px;
        }}
        .service-title {{
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #4a90e2;
        }}
        .chart-list {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }}
        .song-item {{
            display: flex;
            align-items: center;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fafafa;
        }}
        .song-item.target {{
            border: 2px solid #ff6b6b;
            background-color: #fff5f5;
        }}
        .song-rank {{
            font-size: 18px;
            font-weight: bold;
            color: #4a90e2;
            margin-right: 15px;
            min-width: 30px;
        }}
        .song-info {{
            flex: 1;
        }}
        .song-title {{
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }}
        .song-artist {{
            font-size: 14px;
            color: #666;
            margin-bottom: 3px;
        }}
        .song-album {{
            font-size: 12px;
            color: #999;
        }}
        .album-art {{
            width: 50px;
            height: 50px;
            border-radius: 5px;
            margin-right: 15px;
            object-fit: cover;
        }}
        .last-updated {{
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
        }}
        .target-badge {{
            background-color: #ff6b6b;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            margin-left: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{page_title}</h1>
        
        {generate_service_sections(chart_data, is_filtered)}
        
        <div class="last-updated">
            마지막 업데이트: {chart_data.get('last_updated', 'Unknown')}
        </div>
    </div>
</body>
</html>
    """
    
    # 타겟 곡 전용 HTML 페이지만 생성
    output_file = os.path.join(output_dir, "target_index.html")
    print(f"Target HTML page generated at {output_file}")
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)


def generate_service_sections(chart_data, is_filtered=True):
    """
    각 서비스별 차트 섹션 HTML 생성 (타겟 곡 전용)
    
    Args:
        chart_data (dict): 차트 데이터
        is_filtered (bool): 필터링된 데이터인지 여부 (항상 True)
        
    Returns:
        str: 생성된 HTML 섹션
    """
    service_names = {
        "melon": "멜론",
        "genie": "지니",
        "bugs": "벅스",
        "vibe": "바이브",
        "flo": "플로"
    }
    
    sections = []
    
    for service_key, service_name in service_names.items():
        if service_key in chart_data and chart_data[service_key]:
            songs = chart_data[service_key]
            
            songs_html = []
            for song in songs:
                target_class = "target"
                target_badge = '<span class="target-badge">TARGET</span>'
                
                song_html = f"""
                <div class="song-item {target_class}">
                    <div class="song-rank">{song.get('rank', 'N/A')}</div>
                    <img src="{song.get('albumArt', '')}" alt="앨범 아트" class="album-art" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEM0MS40MjEgMjAgMjUgMjAgMjUgMjBWMzBDMjUgMzAgNDEuNDIxIDMwIDI1IDMwVjIwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'">
                    <div class="song-info">
                        <div class="song-title">{song.get('title', 'Unknown')}{target_badge}</div>
                        <div class="song-artist">{song.get('artist', 'Unknown')}</div>
                        <div class="song-album">{song.get('album', 'Unknown')}</div>
                    </div>
                </div>
                """
                songs_html.append(song_html)
            
            section = f"""
            <div class="service-section">
                <h2 class="service-title">{service_name} ({len(songs)}곡)</h2>
                <div class="chart-list">
                    {''.join(songs_html)}
                </div>
            </div>
            """
            sections.append(section)
    
    return ''.join(sections)


def main():
    """
    메인 실행 함수
    """
    print("Starting music chart crawler...")
    
    # 타겟 설정 정보 출력
    target_info = get_target_info()
    print(f"🎯 타겟 검색 모드: {target_info['search_mode']}")
    
    # 순위 변화 추적기 초기화
    rank_tracker = RankTracker()
    
    # 트위터 봇 초기화
    twitter_bot = TwitterBot("docs/last_tweet_timestamp.json")
    
    # 크롤러 초기화
    crawlers = init_crawlers()
    
    # 모든 차트 크롤링
    chart_data = crawl_all_charts(crawlers)
    
    # 타겟 곡만 필터링 (효율성을 위해 먼저 필터링, 차트아웃된 곡도 포함)
    filtered_data = filter_target_songs(chart_data, rank_tracker)
    
    # 순위 변화 계산 (이미 필터링된 데이터 사용)
    rank_changes = rank_tracker.get_rank_changes(filtered_data, target_songs_only=False)
    
    # 트위터로 현재 순위 알림 (변화 유무 상관없이)
    current_time = datetime.now().strftime("%H:%M")
    try:
        if twitter_bot.is_available():
            print("\n🐦 트위터 봇 알림 전송 중...")
            twitter_bot.tweet_rank_changes(rank_changes, current_time)
        else:
            print("\n⚠️ 트위터 API가 설정되지 않아 트윗을 보내지 않습니다.")
    except Exception as e:
        print(f"\n❌ 트위터 봇 오류: {e}")
    
    # 현재 데이터를 히스토리에 저장 (타겟 곡만)
    current_timestamp = get_current_timestamp() # 정각 타임스탬프 가져오기
    rank_tracker.update_history(filtered_data, current_timestamp)
    
    # 오래된 히스토리 정리 (최근 24시간만 유지)
    rank_tracker.cleanup_old_history(keep_count=24)
    
    # 타겟 곡 요약 출력 (순위 변화 포함)
    print_target_summary(filtered_data, rank_changes)
    
    # 타겟 곡 웹페이지 생성
    generate_html_page(filtered_data.copy(), is_filtered=True)
    
    print("Music chart crawling completed successfully!")


if __name__ == "__main__":
    main() 
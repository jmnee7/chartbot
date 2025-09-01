"""
벅스 차트 크롤러
"""

from base_crawler import BaseCrawler
from config import URLS
from utils import clean_text, safe_int


class BugsCrawler(BaseCrawler):
    """
    벅스 차트 크롤러
    """
    
    def __init__(self):
        super().__init__("bugs")
    
    def get_chart_url(self, chart_type="top_100"):
        """
        벅스 차트 URL 반환
        
        Args:
            chart_type (str): 차트 유형 ('top_100', 'realtime')
            
        Returns:
            str: 차트 URL
        """
        # 벅스 실시간 전체 차트 경로
        chart_urls = {
            "top_100": "https://music.bugs.co.kr/chart/track/realtime/total",
            "realtime": "https://music.bugs.co.kr/chart/track/realtime/total"
        }
        
        return chart_urls.get(chart_type, chart_urls["top_100"])
    
    def get_song_elements(self, soup):
        """
        노래 요소들을 추출 (새로운 구조에 맞게 변경)
        
        Args:
            soup: BeautifulSoup 객체
            
        Returns:
            list: 노래 요소들의 리스트
        """
        # 벅스는 테이블 기반 리스트 구조 (변경에 대비해 보강)
        els = soup.select("table.list.trackList tbody tr")
        if not els:
            els = soup.select("tbody tr")
        return els
    
    def parse_song_data(self, song_element):
        """
        노래 데이터 파싱 (새로운 구조에 맞게 변경)
        
        Args:
            song_element: BeautifulSoup 요소
            
        Returns:
            dict: 파싱된 노래 데이터
        """
        try:
            # 순위 (여러 구조 대비)
            rank = 0
            rank_element = (
                song_element.select_one("td.ranking strong") or
                song_element.select_one(".ranking strong") or
                song_element.select_one("strong")
            )
            if rank_element:
                rank = safe_int(rank_element.get_text(strip=True))
            
            # 제목
            title_element = (
                song_element.select_one("p.title a") or
                song_element.select_one("td.title a") or
                song_element.select_one(".title a")
            )
            title = clean_text(title_element.text) if title_element else ""
            
            # 아티스트
            artist_element = (
                song_element.select_one("p.artist a") or
                song_element.select_one("td.artist a") or
                song_element.select_one(".artist a")
            )
            artist = clean_text(artist_element.text) if artist_element else ""
            
            # 앨범
            album_element = (
                song_element.select_one("td.album a") or
                song_element.select_one(".album")
            )
            album = clean_text(album_element.text) if album_element else ""
            
            # 앨범 아트
            albumart_element = (
                song_element.select_one("a.thumbnail img") or
                song_element.select_one("a.cover img") or
                song_element.select_one("img")
            )
            albumart = albumart_element.get("src") if albumart_element else ""
            if albumart.startswith("//"):
                albumart = "https:" + albumart
            
            return {
                "rank": rank,
                "title": title,
                "artist": artist,
                "album": album,
                "albumArt": albumart,
                "service": self.service_name
            }
            
        except Exception as e:
            print(f"Error parsing Bugs song data: {e}")
            return None 
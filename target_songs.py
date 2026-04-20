"""
찾고 싶은 가수와 곡 설정 파일
"""

# 찾고 싶은 가수 (단일 문자열로 최적화)
TARGET_ARTIST = "NCT WISH"

# 찾고 싶은 특정 곡 (단일 문자열로 최적화)
TARGET_SONG = "Ode to Love"

# 특정 가수의 특정 곡 조합 (튜플로 최적화)
TARGET_ARTIST_SONG = ("NCT WISH", "Ode to Love")

# 검색 모드 설정
# "artists" - 지정된 가수들의 모든 곡
# "songs" - 지정된 곡들만 (가수 무관)  
# "artist_songs" - 지정된 가수의 지정된 곡들만
# "all" - 위 모든 조건에 해당하는 곡들
SEARCH_MODE = "artist_songs"

def is_target_song(artist_name, song_title):
    """
    해당 곡이 타겟 곡인지 확인 (단일 문자열 비교로 최적화)
    
    Args:
        artist_name (str): 가수명
        song_title (str): 곡명
        
    Returns:
        bool: 타겟 곡 여부
    """
    import unicodedata
    artist_clean = unicodedata.normalize('NFKC', artist_name).replace('\xa0', ' ').strip()
    song_clean = unicodedata.normalize('NFKC', song_title).replace('\xa0', ' ').strip()
    
    if SEARCH_MODE == "artists":
        # 지정된 가수의 모든 곡 (단순 문자열 비교)
        return artist_clean == TARGET_ARTIST
    
    elif SEARCH_MODE == "songs":
        # 지정된 곡만 (가수 무관, 단순 문자열 비교)
        return song_clean == TARGET_SONG
    
    elif SEARCH_MODE == "artist_songs":
        # 지정된 가수의 지정된 곡만 (튜플 비교)
        return (artist_clean, song_clean) == TARGET_ARTIST_SONG
    
    elif SEARCH_MODE == "all":
        # 모든 조건 확인 (단순 문자열 비교)
        # 1. 타겟 가수인지 확인
        is_target_artist = artist_clean == TARGET_ARTIST
        
        # 2. 타겟 곡인지 확인
        is_target_song_check = song_clean == TARGET_SONG
        
        # 3. 특정 가수-곡 조합인지 확인
        is_specific_combo = (artist_clean, song_clean) == TARGET_ARTIST_SONG
        
        return is_target_artist or is_target_song_check or is_specific_combo
    
    return False


def get_target_info():
    """
    현재 타겟 설정 정보를 반환
    
    Returns:
        dict: 타겟 설정 정보
    """
    return {
        "search_mode": SEARCH_MODE,
        "target_artist": TARGET_ARTIST,
        "target_song": TARGET_SONG,
        "target_artist_song": TARGET_ARTIST_SONG
    } 